/** @fileoverview Task 命令的核心业务逻辑，包含 check（一致性检查）、updateStatus（状态更新）、list（任务列表）三个处理器。 */
import fs from "fs-extra";
import pc from "picocolors";
import {
  AppError,
  InvalidTaskStatusError,
  RoadmapConsistencyError,
  TaskNotFoundError,
} from "../../../core/errors.ts";
import type { RoadmapData, TaskStatus } from "../../../core/roadmap/types.ts";
import { logger } from "../../../utils/logger.ts";
import { normalizeLines } from "../../../utils/normalize-text.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import {
  graphClassToStatus,
  REQUIRED_CLASSDEFS,
  STATUS_CHECK,
  STATUS_CLASS,
  STATUS_ICON,
  VALID_STATUSES,
} from "./constants.ts";
import { formatProgressBar, formatTaskLine } from "./formatter.ts";

/**
 * 检查 Roadmap 的任务列表与 Mermaid 图的一致性。
 * 不一致时抛出 RoadmapConsistencyError。
 *
 * 检查维度：
 *   A. 列表 <-> class 定义 双向同步
 *     1. 图中有 class 但列表缺失
 *     2. 列表中有但图中缺少 class
 *     3. 两者都有但状态不一致
 *   B. Mermaid 图结构完整性
 *     4. 任务在列表中但图中缺少节点定义（盒子）
 *     5. 缺少必要的 classDef 声明
 *   C. 数据完整性
 *     6. Dep 引用了不存在的任务 ID
 *   D. Mermaid 语法校验（确保图能渲染）
 *     7. 必须有 graph 类型声明
 *     8. 方括号 [] 必须匹配
 *     9. 不得有空节点标签 ID[]
 *     10. class 引用的样式必须在 classDef 中声明
 *     11. Mermaid 代码块不得为空
 *
 * @param data 已解析的 Roadmap 数据
 */
export async function handleCheck(data: RoadmapData): Promise<void> {
  const t = createT(getSystemLocale(), "command.task");
  const issues: string[] = [];

  // ─── A. 列表 <-> class 定义 双向同步 ────────────────────────

  // 1. 图中存在 class 但列表中缺失的节点
  for (const nodeId of data.nodes.keys()) {
    if (!data.tasks.has(nodeId)) {
      issues.push(t("check.graph_node_no_match", { id: nodeId }));
    }
  }

  // 2. 列表中存在但图中缺少 class 定义
  for (const taskId of data.tasks.keys()) {
    if (!data.nodes.has(taskId)) {
      issues.push(t("check.task_no_class", { id: taskId }));
    }
  }

  // 3. 状态同步检查（仅当两端都存在时才比较状态值）
  for (const [id, task] of data.tasks) {
    const node = data.nodes.get(id);
    if (node?.styleClass) {
      const expectedStatus = graphClassToStatus(node.styleClass);
      if (expectedStatus && task.status !== expectedStatus) {
        issues.push(
          t("check.status_mismatch", {
            id,
            listStatus: task.status,
            graphClass: node.styleClass,
            expected: expectedStatus,
          }),
        );
      }
    }
  }

  // ─── B. Mermaid 图结构完整性 ──────────────────────────────

  // 仅当 VISUAL 区块存在时才进行图结构检查
  if (data.visualStartLine !== -1) {
    // 4. 任务在列表中但图中缺少节点定义（盒子 ID[label]）
    for (const taskId of data.tasks.keys()) {
      if (!data.nodeDefinitions.has(taskId)) {
        issues.push(t("check.task_no_node_def", { id: taskId }));
      }
    }

    // 5. 缺少必要的 classDef 声明
    for (const name of REQUIRED_CLASSDEFS) {
      if (!data.classDefNames.has(name)) {
        issues.push(t("check.missing_classdef", { name }));
      }
    }
  }

  // ─── D. Mermaid 语法校验（确保图能正确渲染） ─────────────

  if (data.visualStartLine !== -1 && data.mermaidLines.length > 0) {
    // 7. 必须存在 graph 类型声明 (graph TD / LR / TB / BT / RL)
    const hasGraphDecl = data.mermaidLines.some((ml) =>
      /^\s*graph\s+(TD|LR|TB|BT|RL)\s*$/i.test(ml.content),
    );
    if (!hasGraphDecl) {
      issues.push(t("check.missing_graph_decl"));
    }

    // 8. 方括号匹配检查 — 每行中 [ 和 ] 数量必须一致
    for (const ml of data.mermaidLines) {
      const trimmedMl = ml.content.trim();
      // 跳过 graph 声明、class/classDef 行和空行
      if (
        !trimmedMl ||
        trimmedMl.startsWith("graph ") ||
        trimmedMl.startsWith("class ") ||
        trimmedMl.startsWith("classDef ")
      ) {
        continue;
      }
      const opens = (ml.content.match(/\[/g) || []).length;
      const closes = (ml.content.match(/\]/g) || []).length;
      if (opens !== closes) {
        issues.push(
          t("check.unbalanced_brackets", {
            line: ml.lineNum + 1,
            opens,
            closes,
          }),
        );
      }
    }

    // 9. 空节点标签检查 — ID[] 没有意义
    for (const ml of data.mermaidLines) {
      if (/[A-Za-z0-9_-]+\[\s*\]/.test(ml.content)) {
        issues.push(t("check.empty_node_label", { line: ml.lineNum + 1 }));
      }
    }

    // 10. class 引用了未声明的 classDef 样式
    for (const [nodeId, node] of data.nodes) {
      if (node.styleClass && !data.classDefNames.has(node.styleClass)) {
        issues.push(
          t("check.undeclared_classdef", {
            nodeId,
            styleClass: node.styleClass,
          }),
        );
      }
    }
  } else if (data.visualStartLine !== -1 && data.mermaidLines.length === 0) {
    // 11. VISUAL 区块存在但 Mermaid 内容为空
    issues.push(t("check.empty_mermaid"));
  }

  // ─── C. 数据完整性 ───────────────────────────────────────

  // 7. Dep 引用了不存在的任务 ID
  for (const [id, task] of data.tasks) {
    if (task.deps) {
      for (const depId of task.deps) {
        if (
          depId &&
          depId !== "None" &&
          depId !== "none" &&
          !data.tasks.has(depId)
        ) {
          issues.push(t("check.invalid_dep", { id, depId }));
        }
      }
    }
  }

  if (issues.length > 0) {
    issues.forEach((issue) => logger.error(issue));
    throw new RoadmapConsistencyError(issues);
  }

  logger.success(t("check.consistent"));
}

/**
 * 更新指定任务的状态，同时同步修改任务列表行和 Mermaid graph class。
 *
 * @param data 已解析的 Roadmap 数据
 * @param roadmapPath Roadmap 文件路径（用于回写）
 * @param id 任务 ID
 * @param status 目标状态字符串
 */
export async function handleUpdateStatus(
  data: RoadmapData,
  roadmapPath: string,
  id: string | undefined,
  status: string,
): Promise<void> {
  const t = createT(getSystemLocale(), "command.task");

  if (!id) {
    throw new AppError(t("update.id_required"), "MISSING_TASK_ID", true);
  }

  if (!VALID_STATUSES.includes(status as TaskStatus)) {
    throw new InvalidTaskStatusError(status);
  }

  const taskStatus = status as TaskStatus;
  const task = data.tasks.get(id);
  if (!task) {
    throw new TaskNotFoundError(id);
  }

  logger.step(t("update.updating", { id, status: taskStatus }));

  const content = await fs.readFile(roadmapPath, "utf-8");
  const lines = normalizeLines(content);

  // 更新任务列表行：替换 checkbox 和图标
  let newLine = task.rawLine;
  newLine = newLine.replace(/\[([ x])\]/, `[${STATUS_CHECK[taskStatus]}]`);
  newLine = newLine.replace(
    /(\u23F3|\uD83D\uDFE2|\u2705|\uD83E\uDDF1)/,
    STATUS_ICON[taskStatus],
  );
  lines[task.lineNum] = newLine;

  // 更新 Mermaid graph 的 class 定义
  const targetClass = STATUS_CLASS[taskStatus];
  const node = data.nodes.get(id);

  if (node) {
    const classRegex = new RegExp(`class\\s+${id}\\s+([A-Za-z0-9_-]+)`);
    const nodeLine = lines[node.lineNum];
    if (classRegex.test(nodeLine)) {
      lines[node.lineNum] = nodeLine.replace(
        classRegex,
        `class ${id} ${targetClass}`,
      );
    } else {
      lines[node.lineNum] = `    class ${id} ${targetClass};`;
    }
  } else if (data.visualEndLine !== -1) {
    // 图中不存在该节点的 class 定义，追加到 VISUAL_END 前
    lines.splice(data.visualEndLine, 0, `    class ${id} ${targetClass};`);
    logger.dim(t("update.added_class", { id }));
  } else {
    logger.warn(t("update.no_visual", { id }));
  }

  await fs.writeFile(roadmapPath, lines.join("\n"));
  logger.done(t("update.done", { id, status: taskStatus }));
}

/**
 * 列出所有任务并显示进度条
 * @param data 已解析的 Roadmap 数据
 */
export function handleList(data: RoadmapData): void {
  const t = createT(getSystemLocale(), "command.task");
  const taskList = Array.from(data.tasks.values());

  if (taskList.length === 0) {
    logger.warn(t("list.empty"));
    return;
  }

  const counts: Record<TaskStatus, number> = {
    pending: 0,
    active: 0,
    done: 0,
    blocked: 0,
  };
  taskList.forEach((tk) => counts[tk.status]++);

  // 标题与进度条
  logger.info(pc.bold(`\n\uD83D\uDCCA ${t("list.title")}`));
  logger.info(formatProgressBar(counts.done, taskList.length));
  logger.info("");

  // 按原始顺序输出每个任务
  for (const task of taskList) {
    logger.info(formatTaskLine(task));
  }

  logger.info("");
}

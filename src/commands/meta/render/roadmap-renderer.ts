/** @fileoverview 将 roadmap.json 渲染为人类可读的 Markdown 视图，含任务列表和 Mermaid 依赖图。 */
import type { LocaleLang } from "../../../types/index.ts";
import type {
  RoadmapData,
  Task,
  TaskStatus,
} from "../../../core/roadmap/types.ts";
import { createT } from "../../../utils/t.ts";

/** 任务状态 → checkbox 标记 */
const STATUS_CHECK: Record<TaskStatus, string> = {
  pending: " ",
  active: " ",
  done: "x",
  blocked: " ",
};

/** 任务状态 → 图标 */
const STATUS_ICON: Record<TaskStatus, string> = {
  pending: "⏳",
  active: "🟢",
  done: "✅",
  blocked: "🧱",
};

/** 任务状态 → Mermaid class */
const STATUS_CLASS: Record<TaskStatus, string> = {
  pending: "pending",
  active: "active",
  done: "done",
  blocked: "blocked",
};

/** 转义单段文本中会破坏 Mermaid 节点语法的双引号。 */
function escapeMermaidText(text: string): string {
  return text.replace(/"/g, "#quot;");
}

/**
 * 构建 Mermaid 节点标签（双引号包裹）。
 * 格式：`<b>{标题}</b>[<br/>{goal}]`
 * - 标题加粗，goal 作为普通字号的第二行（可选）
 * - 状态由 classDef 背景色区分，无需额外 icon
 */
function buildNodeLabel(task: Task): string {
  const title = escapeMermaidText(task.title);
  if (task.goal) {
    const goal = escapeMermaidText(task.goal);
    return `"<b>${title}</b><br/>${goal}"`;
  }
  return `"<b>${title}</b>"`;
}

/**
 * 将 RoadmapData 渲染为完整的 Markdown 文件内容。
 * 包含：任务列表 + Mermaid 依赖图。
 * @param data Roadmap 数据
 * @param lang 输出语言，与项目文档语言一致（来自 architext.json#language）
 */
export function renderRoadmap(
  data: RoadmapData,
  lang: LocaleLang = "zh",
): string {
  const t = createT(lang, "command.render");
  const header =
    t("roadmap.header_comment") + "\n" + t("roadmap.header_ai") + "\n\n";

  const lines: string[] = [header];

  lines.push(`# ${t("roadmap.title")}\n`);
  lines.push(
    `> **${t("roadmap.status")}**: ${data.projectStatus} | **${t("roadmap.updated")}**: ${data.lastUpdated}\n`,
  );

  // ── Task List ──
  lines.push(`<!-- TASKS_START -->\n`);

  for (const phase of data.phases) {
    lines.push(`## ${t("roadmap.phase")}: ${phase.name}\n`);
    for (const task of phase.tasks) {
      lines.push(renderTaskLine(task));
      if (task.goal) lines.push(`  - 🎯 ${t("roadmap.goal")}: ${task.goal}`);
      if (task.deps && task.deps.length > 0) {
        lines.push(
          `  - 🔗 ${t("roadmap.dep")}: ${task.deps.map((d) => `[${d}]`).join(", ")}`,
        );
      } else {
        lines.push(`  - 🔗 ${t("roadmap.dep")}: ${t("roadmap.dep_none")}`);
      }
      if (task.tag) lines.push(`  - 🏷️ ${t("roadmap.tag")}: ${task.tag}`);
      if (task.slug) lines.push(`  - 📁 ${t("roadmap.slug")}: ${task.slug}`);
    }
    lines.push("");
  }

  lines.push(`<!-- TASKS_END -->\n`);

  // ── Mermaid Dependency Graph ──
  lines.push(`<!-- VISUAL_START -->\n`);
  lines.push("```mermaid");
  lines.push("graph TD");
  lines.push("");

  // classDef 定义
  lines.push("    classDef done fill:#4ade80,stroke:#16a34a,color:#000;");
  lines.push("    classDef active fill:#60a5fa,stroke:#2563eb,color:#000;");
  lines.push("    classDef pending fill:#e2e8f0,stroke:#94a3b8,color:#000;");
  lines.push("    classDef blocked fill:#fca5a5,stroke:#dc2626,color:#000;");
  lines.push("");

  // 收集所有任务用于生成图
  const allTasks: Task[] = data.phases.flatMap((p) => p.tasks);

  // 节点定义 — 标题 + goal（如有）双行显示
  for (const task of allTasks) {
    lines.push(`    ${task.id}[${buildNodeLabel(task)}]`);
  }
  lines.push("");

  // 依赖边（仅输出直接依赖，跳过可经由更长路径传递的冗余边）
  const redundantEdges = computeRedundantEdges(allTasks);
  for (const task of allTasks) {
    if (task.deps) {
      for (const dep of task.deps) {
        if (!redundantEdges.has(`${dep}-->${task.id}`)) {
          lines.push(`    ${dep} --> ${task.id}`);
        }
      }
    }
  }
  lines.push("");

  // class 标记
  for (const task of allTasks) {
    lines.push(`    class ${task.id} ${STATUS_CLASS[task.status]};`);
  }

  lines.push("```\n");
  lines.push(`<!-- VISUAL_END -->`);

  return lines.join("\n");
}

function renderTaskLine(task: Task): string {
  const check = STATUS_CHECK[task.status];
  const icon = STATUS_ICON[task.status];
  return `- [${check}] ${icon} **[${task.id}]** ${task.title}`;
}

/**
 * BFS 判断在有向图中 `from` 是否可以到达 `to`。
 *
 * @param from 起始节点
 * @param to 目标节点
 * @param forwardAdj 正向邻接表
 * @returns 是否可以到达
 */
function canReach(
  from: string,
  to: string,
  forwardAdj: Map<string, Set<string>>,
): boolean {
  const visited = new Set<string>();
  const queue = [from];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node === to) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const next of forwardAdj.get(node) ?? []) {
      queue.push(next);
    }
  }
  return false;
}

/**
 * 传递规约：
 * 计算所有冗余的依赖边 —— 即可通过长度 ≥ 2 的路径隐式到达的边。
 *
 * 例：A→B、A→C、B→C 中，A→C 是冗余的（A→B→C 已隐含），
 * 规约后只保留 A→B 和 B→C，图变为线性链。
 *
 * deps 字段仍保留原始依赖（用于文档/校验），此函数仅影响图的渲染。
 *
 * @param tasks 任务列表
 * @returns 冗余的依赖边集合
 */
function computeRedundantEdges(tasks: Task[]): Set<string> {
  // 构建正向邻接表：dep → 依赖它的 task 集合
  const forwardAdj = new Map<string, Set<string>>();
  for (const task of tasks) {
    for (const dep of task.deps ?? []) {
      if (!forwardAdj.has(dep)) forwardAdj.set(dep, new Set());
      forwardAdj.get(dep)!.add(task.id);
    }
  }

  const redundant = new Set<string>();

  for (const task of tasks) {
    for (const dep of task.deps ?? []) {
      // 检查 dep → task.id 是否可通过其他邻居中转到达
      for (const neighbor of forwardAdj.get(dep) ?? []) {
        if (neighbor === task.id) continue; // 跳过直接边本身
        if (canReach(neighbor, task.id, forwardAdj)) {
          redundant.add(`${dep}-->${task.id}`);
          break;
        }
      }
    }
  }

  return redundant;
}

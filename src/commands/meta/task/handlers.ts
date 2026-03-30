/** @fileoverview Task 命令的核心业务逻辑，包含 check（一致性检查）、updateStatus（状态更新）、list（任务列表）三个处理器。 */
import fs from "fs-extra";
import pc from "picocolors";
import {
  AppError,
  InvalidTaskStatusError,
  RoadmapConsistencyError,
  TaskNotFoundError,
} from "../../../core/errors.ts";
import type {
  RoadmapData,
  TaskStatus,
  TaskPhase,
} from "../../../core/roadmap/types.ts";
import {
  buildTaskMap,
  getAllTasks,
  groupByPhase,
} from "../../../core/roadmap/types.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { VALID_STATUSES } from "./constants.ts";
import { formatProgressBar, formatTaskLine } from "./formatter.ts";

/** 阶段 → 显示名称（中文） */
const PHASE_NAME_ZH: Record<TaskPhase, string> = {
  infra: "基础设施",
  core: "核心功能",
  polish: "质量打磨",
  platform: "平台支持",
};

/** 阶段 → 显示名称（英文） */
const PHASE_NAME_EN: Record<TaskPhase, string> = {
  infra: "Infrastructure",
  core: "Core Features",
  polish: "Quality Polish",
  platform: "Platform Support",
};

/** 阶段渲染顺序 */
const PHASE_ORDER: TaskPhase[] = ["infra", "core", "polish", "platform"];

/**
 * 检查 Roadmap JSON 的数据一致性。
 * 验证维度（按执行顺序）：
 *   A. ID 唯一性 — 不得有重复的任务 ID
 *   B. 依赖完整性 — deps 引用的 ID 须存在于任务列表中
 *   C. 状态合法性 — status 须为合法值
 *
 * @param data 已解析的 Roadmap 数据
 */
export async function handleCheck(data: RoadmapData): Promise<void> {
  const t = createT(getSystemLocale(), "command.task");
  const issues: string[] = [];
  const taskMap = buildTaskMap(data);

  // A. ID 唯一性检查（扁平结构）
  const seenIds = new Set<string>();
  for (const task of data.tasks) {
    if (seenIds.has(task.id)) {
      issues.push(`Duplicate task ID: [${task.id}]`);
    }
    seenIds.add(task.id);
  }

  // B. 依赖完整性检查
  for (const [id, task] of taskMap) {
    if (task.deps) {
      for (const depId of task.deps) {
        if (depId && !taskMap.has(depId)) {
          issues.push(t("check.invalid_dep", { id, depId }));
        }
      }
    }
  }

  // C. 状态合法性检查
  for (const [id, task] of taskMap) {
    if (!VALID_STATUSES.includes(task.status)) {
      issues.push(`Task [${id}] has invalid status: "${task.status}"`);
    }
  }

  if (issues.length > 0) {
    issues.forEach((issue) => logger.error(issue));
    throw new RoadmapConsistencyError(issues);
  }

  logger.success(t("check.consistent"));
}

/**
 * 更新指定任务的状态，直接修改 JSON 并回写文件。
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

  // 在扁平 tasks 数组中找到并更新目标任务
  const task = data.tasks.find((t) => t.id === id);
  if (!task) {
    throw new TaskNotFoundError(id);
  }

  logger.step(t("update.updating", { id, status: taskStatus }));
  task.status = taskStatus;

  // 级联解锁：当任务变为 done 时，检查下游依赖是否可解锁
  if (taskStatus === "done") {
    const unblocked = cascadeUnblock(data, id);
    for (const unblockedId of unblocked) {
      logger.done(t("update.unblocked", { id: unblockedId }));
    }
  }

  // 更新时间戳并回写 JSON
  data.lastUpdated = new Date().toISOString().split("T")[0];
  await fs.writeJSON(roadmapPath, data, { spaces: 2 });

  logger.done(t("update.done", { id, status: taskStatus }));
}

/**
 * 级联解锁：当某任务完成后，检查所有以其为依赖的下游任务。
 * 若下游任务的所有 deps 均为 done 且自身为 blocked，则解锁为 pending。
 *
 * @returns 被解锁的任务 ID 列表
 */
function cascadeUnblock(data: RoadmapData, completedId: string): string[] {
  const taskMap = buildTaskMap(data);
  const unblocked: string[] = [];

  for (const task of data.tasks) {
    if (task.status !== "blocked" || !task.deps?.includes(completedId)) {
      continue;
    }
    // 检查该任务的所有 deps 是否都已 done
    const allDepsDone = task.deps.every((depId) => {
      const dep = taskMap.get(depId);
      return dep && dep.status === "done";
    });
    if (allDepsDone) {
      task.status = "pending";
      unblocked.push(task.id);
    }
  }

  return unblocked;
}

/**
 * 列出所有任务并显示进度条
 * @param data 已解析的 Roadmap 数据
 */
export function handleList(data: RoadmapData): void {
  const t = createT(getSystemLocale(), "command.task");
  const locale = getSystemLocale();
  const taskList = getAllTasks(data);

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

  // 按 phase 分组输出
  const phaseGroups = groupByPhase(data);
  const getPhaseName = (phase: TaskPhase) =>
    locale === "zh" ? PHASE_NAME_ZH[phase] : PHASE_NAME_EN[phase];

  for (const phase of PHASE_ORDER) {
    const tasks = phaseGroups.get(phase);
    if (tasks && tasks.length > 0) {
      logger.info(pc.dim(`── ${getPhaseName(phase)} ──`));
      for (const task of tasks) {
        logger.info(formatTaskLine(task));
      }
      logger.info("");
    }
  }
}

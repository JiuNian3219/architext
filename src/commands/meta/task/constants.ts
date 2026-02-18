/** @fileoverview Task 命令的状态常量集中管理，作为 TaskStatus 映射的单一真理源。 */
import pc from "picocolors";
import type { TaskStatus } from "../../../core/roadmap/types.ts";

/** 合法的任务状态值 */
export const VALID_STATUSES: TaskStatus[] = [
  "pending",
  "active",
  "done",
  "blocked",
];

/** 任务状态 -> 图标 (用于终端输出和渲染) */
export const STATUS_ICON: Record<TaskStatus, string> = {
  pending: "\u23F3",
  active: "\uD83D\uDFE2",
  done: "\u2705",
  blocked: "\uD83E\uDDF1",
};

/** 任务状态 -> 终端着色函数 */
export const STATUS_COLORS: Record<TaskStatus, (str: string) => string> = {
  pending: pc.white,
  active: pc.green,
  done: pc.blue,
  blocked: pc.red,
};

/** @fileoverview Task 命令的状态常量集中管理，消除 handlers/formatter 之间的重复定义，作为 TaskStatus 映射的单一真理源。 */
import pc from "picocolors";
import type { TaskStatus } from "../../../core/roadmap/types.ts";

/** 合法的任务状态值 */
export const VALID_STATUSES: TaskStatus[] = [
  "pending",
  "active",
  "done",
  "blocked",
];

/** 任务状态 -> checkbox 标记 (用于回写 Roadmap 文件) */
export const STATUS_CHECK: Record<TaskStatus, string> = {
  pending: " ",
  active: " ",
  done: "x",
  blocked: " ",
};

/** 任务状态 -> 图标 (用于终端输出和 Roadmap 文件回写) */
export const STATUS_ICON: Record<TaskStatus, string> = {
  pending: "\u23F3",
  active: "\uD83D\uDFE2",
  done: "\u2705",
  blocked: "\uD83E\uDDF1",
};

/** 任务状态 -> Mermaid graph class 名 */
export const STATUS_CLASS: Record<TaskStatus, string> = {
  pending: "pending",
  active: "active",
  done: "done",
  blocked: "blocked",
};

/** 任务状态 -> 终端着色函数 */
export const STATUS_COLORS: Record<TaskStatus, (str: string) => string> = {
  pending: pc.white,
  active: pc.green,
  done: pc.blue,
  blocked: pc.red,
};

/** 必须声明的 4 种 classDef 样式名 */
export const REQUIRED_CLASSDEFS = ["done", "active", "pending", "blocked"];

/**
 * Mermaid graph class 名 -> 任务状态（反向映射，用于一致性检查）。
 * 本质上是 STATUS_CLASS 的反转。
 */
export function graphClassToStatus(styleClass: string): TaskStatus | null {
  const entry = Object.entries(STATUS_CLASS).find(
    ([, cls]) => cls === styleClass,
  );
  return entry ? (entry[0] as TaskStatus) : null;
}

/** @fileoverview Task 命令的终端输出格式化工具，负责进度条渲染和任务状态着色。 */
import pc from "picocolors";
import type { TaskStatus, Task } from "../../../core/roadmap/types.ts";
import { STATUS_ICON, STATUS_COLORS } from "./constants.ts";

/**
 * 获取任务状态对应的图标
 * @param status 任务状态
 * @returns 图标
 */
export function getStatusIcon(status: TaskStatus): string {
  return STATUS_ICON[status] ?? "\u23F3";
}

/**
 * 获取任务状态对应的着色函数
 * @param status 任务状态
 * @returns 着色函数
 */
export function getStatusColor(status: TaskStatus): (str: string) => string {
  return STATUS_COLORS[status] ?? pc.dim;
}

/**
 * 渲染 ASCII 进度条
 * @param done 已完成数量
 * @param total 总数量
 * @param barLength 进度条字符长度
 */
export function formatProgressBar(
  done: number,
  total: number,
  barLength = 30,
): string {
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const filled = Math.round((progress / 100) * barLength);
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(barLength - filled);
  return `Progress: [${bar}] ${progress}% (${done}/${total})`;
}

/**
 * 格式化单个任务为终端输出行
 * @param task 任务对象
 * @returns 格式化后的任务行
 */
export function formatTaskLine(task: Task): string {
  const icon = getStatusIcon(task.status);
  const color = getStatusColor(task.status);
  return color(`${icon} [${task.id}] ${task.title}`);
}

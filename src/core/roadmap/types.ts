/** @fileoverview Roadmap JSON 数据模型定义，作为 roadmap.json 的 TypeScript 类型契约。 */

export type TaskStatus = "pending" | "active" | "done" | "blocked";

/** 任务所属阶段 */
export type TaskPhase = "infra" | "core" | "polish" | "platform";

/** roadmap.json 中的单个任务 */
export interface Task {
  id: string;
  phase: TaskPhase;
  title: string;
  status: TaskStatus;
  description?: string;
  goal?: string;
  sourceRef?: string;
  deps?: string[];
  tag?: string;
  slug?: string;
  screens?: string[]; // 仅 ui 项目：屏幕 ID 数组
}

/** NFR 注入记录 */
export interface NfrEntry {
  taskId: string;
  constraint: string;
  impact: string[];
}

/** roadmap.json 的完整结构（扁平 tasks 数组 + nfr 数组） */
export interface RoadmapData {
  version: number;
  projectStatus: string;
  lastUpdated: string;
  tasks: Task[];
  nfr?: NfrEntry[];
}

/**
 * 获取所有任务的扁平列表（新结构已是扁平，直接返回）。
 */
export function getAllTasks(data: RoadmapData): Task[] {
  return data.tasks;
}

/**
 * 构建 taskId → Task 的查找映射。
 * 用于 O(1) 查找和依赖检查。
 */
export function buildTaskMap(data: RoadmapData): Map<string, Task> {
  const map = new Map<string, Task>();
  for (const task of data.tasks) {
    map.set(task.id, task);
  }
  return map;
}

/**
 * 按 phase 分组任务，用于渲染时按阶段展示。
 */
export function groupByPhase(data: RoadmapData): Map<TaskPhase, Task[]> {
  const groups = new Map<TaskPhase, Task[]>();
  for (const task of data.tasks) {
    const phase = task.phase;
    if (!groups.has(phase)) groups.set(phase, []);
    groups.get(phase)!.push(task);
  }
  return groups;
}

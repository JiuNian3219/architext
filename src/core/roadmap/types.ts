/** @fileoverview Roadmap JSON 数据模型定义，作为 roadmap.json 的 TypeScript 类型契约。 */

export type TaskStatus = "pending" | "active" | "done" | "blocked";

/** roadmap.json 中的单个任务 */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  goal?: string;
  deps?: string[];
  tag?: string;
  slug?: string;
}

/** roadmap.json 中的一个阶段 */
export interface Phase {
  id: string;
  name: string;
  tasks: Task[];
}

/** roadmap.json 的完整结构 */
export interface RoadmapData {
  version: number;
  projectStatus: string;
  lastUpdated: string;
  phases: Phase[];
}

/**
 * 从嵌套的 phases 结构中提取所有 tasks 的扁平列表。
 * 保持阶段内的顺序。
 */
export function getAllTasks(data: RoadmapData): Task[] {
  return data.phases.flatMap((phase) => phase.tasks);
}

/**
 * 构建 taskId → Task 的查找映射。
 * 用于 O(1) 查找和依赖检查。
 */
export function buildTaskMap(data: RoadmapData): Map<string, Task> {
  const map = new Map<string, Task>();
  for (const phase of data.phases) {
    for (const task of phase.tasks) {
      map.set(task.id, task);
    }
  }
  return map;
}

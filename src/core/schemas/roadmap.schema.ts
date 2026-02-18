/** @fileoverview Tier 1 严格 Schema: roadmap.json 的运行时类型校验，CLI 渲染和任务命令直接依赖这些字段。 */
import { z } from "zod";

/** 合法的任务状态枚举 */
export const TaskStatusSchema = z.enum([
  "pending",
  "active",
  "done",
  "blocked",
]);

/** roadmap.json 中的单个任务 */
export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: TaskStatusSchema,
  goal: z.string().optional(),
  deps: z.array(z.string()).optional(),
  tag: z.string().optional(),
  slug: z.string().optional(),
});

/** roadmap.json 中的一个阶段 */
export const PhaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tasks: z.array(TaskSchema),
});

/** roadmap.json 的完整结构 */
export const RoadmapDataSchema = z.object({
  version: z.number(),
  projectStatus: z.string(),
  lastUpdated: z.string(),
  phases: z.array(PhaseSchema),
});

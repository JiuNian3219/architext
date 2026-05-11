/** @fileoverview Tier 1 严格 Schema: roadmap.json 的运行时类型校验，CLI 渲染和任务命令直接依赖这些字段。 */
import { z } from "zod";

/** 合法的任务状态枚举 */
export const TaskStatusSchema = z.enum([
  "pending",
  "active",
  "done",
  "blocked",
]);

/** 合法的任务阶段枚举 */
export const TaskPhaseSchema = z.enum(["infra", "core", "polish", "platform"]);

/** roadmap.json 中的单个任务 */
export const TaskSchema = z.object({
  id: z.string().min(1),
  phase: TaskPhaseSchema,
  title: z.string().min(1),
  status: TaskStatusSchema,
  description: z.string().optional(),
  goal: z.string().optional(),
  sourceRef: z.string().optional(),
  deps: z.array(z.string()).optional(),
  tag: z.string().optional(),
  slug: z.string().optional(),
  screens: z.array(z.string()).optional(),
});

/** NFR 注入记录 */
export const NfrEntrySchema = z.object({
  taskId: z.string().min(1),
  constraint: z.string().min(1),
  impact: z.array(z.string()),
});

/** roadmap.json 的完整结构（扁平 tasks 数组 + nfr 数组） */
export const RoadmapDataSchema = z.object({
  version: z.number(),
  projectStatus: z.string(),
  lastUpdated: z.string(),
  tasks: z.array(TaskSchema),
  nfr: z.array(NfrEntrySchema).optional(),
});

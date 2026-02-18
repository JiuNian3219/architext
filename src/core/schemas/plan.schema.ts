/** @fileoverview Tier 1 严格 Schema: plan.json 的运行时类型校验，CLI 渲染和计划检查命令直接依赖这些字段。 */
import { z } from "zod";

/** plan.json 中的单个任务项 */
export const PlanTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  done: z.boolean(),
});

/** plan.json 中的一个实施阶段 */
export const PlanPhaseSchema = z.object({
  name: z.string().min(1),
  tasks: z.array(PlanTaskSchema),
});

/** plan.json 中的技术决策 */
export const PlanDecisionSchema = z.object({
  category: z.string(),
  choice: z.string(),
  rationale: z.string().optional(),
});

/** plan.json 中的测试计划 */
export const PlanTestsSchema = z.object({
  automated: z.array(PlanTaskSchema),
  manual: z.array(PlanTaskSchema),
});

/** plan.json 的完整结构 */
export const PlanDataSchema = z.object({
  featureId: z.string().min(1),
  featureName: z.string().min(1),
  status: z.string(),
  decisions: z.array(PlanDecisionSchema),
  phases: z.array(PlanPhaseSchema),
  tests: PlanTestsSchema,
});

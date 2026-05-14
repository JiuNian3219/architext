/** @fileoverview Plan JSON 数据模型定义，作为 plan.json 的 TypeScript 类型契约。 */

/** plan.json 中的单个任务项 */
export interface PlanTask {
  /** 任务唯一标识 */
  id: string;
  /** 任务标题 */
  title: string;
  /** 可选：给执行时的 AI 的速记（范围、引用 spec 段落、关键约束） */
  notes?: string;
  /** 是否已完成 */
  done: boolean;
}

export interface PlanProblemCause {
  summary: string;
  evidence: string[];
  confidence: number;
}

/** plan.json 中的一个实施阶段 */
export interface PlanPhase {
  /** 阶段名称 */
  name: string;
  problemCause?: PlanProblemCause;
  /** 阶段下的任务列表 */
  tasks: PlanTask[];
}

/** plan.json 中的技术决策 */
export interface PlanDecision {
  /** 决策维度（如 Q1-Q5 或自定义） */
  category: string;
  /** 选择内容（支持多选 A|B、自定义 Z:…、混合） */
  choice: string;
  /** 可选：组合含义 / 自定义意图 / 影响说明，供 code 阶段参照 */
  rationale?: string;
}

/** plan.json 中的测试计划 */
export interface PlanTests {
  automated: PlanTask[];
  manual: PlanTask[];
}

/** plan.json 的完整结构 */
export interface PlanData {
  featureId: string;
  featureName: string;
  status: string;
  decisions: PlanDecision[];
  phases: PlanPhase[];
  tests: PlanTests;
}

/** 按 section 分组后的汇总（兼容 handlers 输出） */
export interface PlanSection {
  /** section 标题 */
  name: string;
  /** 是否属于人工验收区域 */
  isManual: boolean;
  /** 该 section 下的所有任务项 */
  items: PlanTask[];
  /** 已完成数 */
  done: number;
  /** 总数 */
  total: number;
}

/** 完整的 Plan 解析结果 */
export interface PlanCheckResult {
  /** 按 section 分组的检查结果 */
  sections: PlanSection[];
}

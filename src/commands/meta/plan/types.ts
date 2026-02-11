/**
 * ---
 * description: Plan 命令的领域类型定义，作为 parser 和 handlers 之间共享的类型契约。
 * ---
 */

/** Plan 文件中的一个 checkbox 项 */
export interface PlanCheckItem {
  /** 行号（1-based，方便用户定位） */
  lineNum: number;
  /** checkbox 后面的文本内容 */
  content: string;
  /** 是否已勾选 [x] */
  checked: boolean;
  /** 所属的 section 标题 */
  section: string;
}

/** 按 section 分组后的汇总 */
export interface PlanSection {
  /** section 标题 */
  name: string;
  /** 是否属于人工验收区域（排除在自动化检查之外） */
  isManual: boolean;
  /** 该 section 下的所有 checkbox 项 */
  items: PlanCheckItem[];
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

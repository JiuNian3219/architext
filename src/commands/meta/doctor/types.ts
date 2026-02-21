/** @fileoverview doctor 命令的核心类型定义。 */

export type CheckStatus = "pass" | "warn" | "fail";

export interface CheckResult {
  label: string;
  status: CheckStatus;
  /** 问题描述或补充信息 */
  detail?: string;
  /** 操作提示（告诉用户如何修复） */
  hint?: string;
}

export interface CheckGroup {
  title: string;
  checks: CheckResult[];
}

/** @fileoverview 解析 plan.json，按 phase 分组并识别人工验收区域。 */

import type {
  PlanCheckResult,
  PlanData,
  PlanSection,
  PlanTask,
} from "./types.ts";

/**
 * 被视为人工验收的 section 名关键词（小写匹配）。
 * 覆盖中英文及繁体中文的常见命名。
 */
const MANUAL_KEYWORDS = [
  "manual verification",
  "manual check",
  "manual",
  "人工验收",
  "手动验证",
  "手動驗證",
  "人工驗收",
];

/**
 * 解析 plan.json 数据，提取所有任务并按 phase 分组。
 *
 * @param data plan.json 解析后的数据
 */
export function parsePlanJson(data: PlanData): PlanCheckResult {
  const sections: PlanSection[] = [];

  // 从 phases 提取自动化任务
  for (const phase of data.phases) {
    const isManual = MANUAL_KEYWORDS.some((kw) =>
      phase.name.toLowerCase().includes(kw),
    );
    sections.push({
      name: phase.name,
      isManual,
      items: phase.tasks,
      done: phase.tasks.filter((t: PlanTask) => t.done).length,
      total: phase.tasks.length,
    });
  }

  // 从 tests 提取测试任务
  if (data.tests) {
    if (data.tests.automated && data.tests.automated.length > 0) {
      sections.push({
        name: "Automated Tests",
        isManual: false,
        items: data.tests.automated,
        done: data.tests.automated.filter((t: PlanTask) => t.done).length,
        total: data.tests.automated.length,
      });
    }
    if (data.tests.manual && data.tests.manual.length > 0) {
      sections.push({
        name: "Manual Verification",
        isManual: true,
        items: data.tests.manual,
        done: data.tests.manual.filter((t: PlanTask) => t.done).length,
        total: data.tests.manual.length,
      });
    }
  }

  return { sections };
}

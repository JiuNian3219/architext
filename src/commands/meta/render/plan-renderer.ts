/** @fileoverview 将 plan.json 渲染为人类可读的 Markdown 视图，含 checkbox 任务列表。 */
import type { LocaleLang } from "../../../types/index.ts";
import type { PlanData } from "../plan/types.ts";
import { createT } from "../../../utils/t.ts";

/**
 * 将 PlanData 渲染为完整的 Markdown 文件内容。
 * @param data Plan 数据
 * @param lang 输出语言，与项目文档语言一致（来自 architext.json#language）
 */
export function renderPlan(data: PlanData, lang: LocaleLang = "zh"): string {
  const t = createT(lang, "command.render");
  const header = t("plan.header_comment") + "\n" + t("plan.header_ai") + "\n\n";

  const lines: string[] = [header];

  lines.push(`# ${t("plan.title", { featureName: data.featureName })}\n`);
  lines.push(
    `> **${t("plan.feature_id")}**: ${data.featureId} | **${t("plan.status")}**: ${data.status}\n`,
  );

  // ── Technical Decisions ──
  if (data.decisions && data.decisions.length > 0) {
    lines.push(`## 1. ${t("plan.section_decisions")}\n`);
    for (const decision of data.decisions) {
      lines.push(`- **${decision.category}**: ${decision.choice}`);
      if (decision.rationale) lines.push(`  - 📝 ${decision.rationale}`);
    }
    lines.push("");
  }

  // ── Implementation Steps ──
  lines.push(`## 2. ${t("plan.section_steps")}\n`);
  for (const phase of data.phases) {
    const phaseDone = phase.tasks.every((task) => task.done);
    const phaseCheck = phaseDone ? "x" : " ";
    lines.push(`* [${phaseCheck}] **${phase.name}**`);
    if (phase.problemCause) {
      lines.push(
        `  - Root Cause (${phase.problemCause.confidence}): ${phase.problemCause.summary}`,
      );
      if (phase.problemCause.evidence.length > 0) {
        lines.push(`    - Evidence: ${phase.problemCause.evidence.join("; ")}`);
      }
    }
    for (const task of phase.tasks) {
      const check = task.done ? "x" : " ";
      lines.push(`  - [${check}] ${task.title}`);
      if (task.notes) lines.push(`    - 📝 ${task.notes}`);
    }
    lines.push("");
  }

  // ── Test Plan ──
  if (data.tests) {
    lines.push(`## 3. ${t("plan.section_tests")}\n`);

    if (data.tests.automated && data.tests.automated.length > 0) {
      lines.push(`### ${t("plan.subsection_automated")}\n`);
      for (const test of data.tests.automated) {
        const check = test.done ? "x" : " ";
        lines.push(`* [${check}] ${test.title}`);
        if (test.notes) lines.push(`  - 📝 ${test.notes}`);
      }
      lines.push("");
    }

    if (data.tests.manual && data.tests.manual.length > 0) {
      lines.push(`### ${t("plan.subsection_manual")}\n`);
      for (const test of data.tests.manual) {
        const check = test.done ? "x" : " ";
        lines.push(`* [${check}] ${test.title}`);
        if (test.notes) lines.push(`  - 📝 ${test.notes}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

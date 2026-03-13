/** @fileoverview doctor 命令主入口，编排四组检查并输出健康报告。 */

import { intro, outro } from "@clack/prompts";
import color from "picocolors";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import {
  runConfigChecks,
  runDocStructureChecks,
  runGlobalFileChecks,
  runIdeRulesChecks,
  runIdeNotifyChecks,
} from "./checks.ts";
import type { CheckGroup, CheckResult } from "./types.ts";

const t = createT(getSystemLocale(), "command.doctor");

// ─── 渲染工具 ────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<string, string> = {
  pass: color.green("✓"),
  warn: color.yellow("⚠"),
  fail: color.red("✗"),
};

function renderCheck(check: CheckResult): void {
  const icon = STATUS_ICON[check.status];
  const label =
    check.status === "fail"
      ? color.red(check.label)
      : check.status === "warn"
        ? color.yellow(check.label)
        : check.label;
  const detail = check.detail ? color.dim(` — ${check.detail}`) : "";

  logger.raw(`  ${icon}  ${label}${detail}`);

  if (check.hint) {
    logger.raw(`     ${color.dim(`→ ${check.hint}`)}`);
  }
}

function renderGroup(group: CheckGroup): void {
  logger.raw(`\n${color.bold(`► ${group.title}`)}`);
  for (const check of group.checks) {
    renderCheck(check);
  }
}

// ─── 主命令 ──────────────────────────────────────────────────────────────────

export async function doctorCommand(): Promise<void> {
  logger.clear();
  intro(color.bgCyan(color.black(` ${t("title")} `)));

  const cwd = process.cwd();
  const groups: CheckGroup[] = [];

  // Group 1: 项目配置
  const { config, results: configResults } = await runConfigChecks(cwd);
  groups.push({ title: t("group.config"), checks: configResults });

  // 配置读取失败时无法继续后续检查
  if (!config) {
    for (const g of groups) renderGroup(g);
    logger.raw("");
    outro(color.red(t("no_config")));
    return;
  }

  // Group 2: 文档目录结构
  const docResults = await runDocStructureChecks(config, cwd);
  groups.push({ title: t("group.doc_structure"), checks: docResults });

  // Group 3: 全局文档
  const globalResults = await runGlobalFileChecks(config, cwd);
  groups.push({ title: t("group.global_files"), checks: globalResults });

  // Group 4: IDE 规则
  const rulesResults = await runIdeRulesChecks(config, cwd);
  if (rulesResults.length > 0) {
    groups.push({ title: t("group.ide_rules"), checks: rulesResults });
  }

  // Group 5: IDE 通知配置
  const notifyResults = await runIdeNotifyChecks(config, cwd);
  if (notifyResults.length > 0) {
    groups.push({ title: t("group.ide_notify"), checks: notifyResults });
  }

  // 渲染所有组
  for (const g of groups) renderGroup(g);

  // 汇总
  const allChecks = groups.flatMap((g) => g.checks);
  const passed = allChecks.filter((c) => c.status === "pass").length;
  const warned = allChecks.filter((c) => c.status === "warn").length;
  const failed = allChecks.filter((c) => c.status === "fail").length;

  const summaryParts = [
    color.green(t("summary.passed", { n: passed })),
    warned > 0 ? color.yellow(t("summary.warned", { n: warned })) : null,
    failed > 0 ? color.red(t("summary.failed", { n: failed })) : null,
  ]
    .filter(Boolean)
    .join(color.dim(" · "));

  logger.raw(`\n${color.dim("─".repeat(48))}`);
  logger.raw(t("summary.result", { parts: summaryParts }));

  if (failed === 0 && warned === 0) {
    outro(color.green(t("success")));
  } else if (failed === 0) {
    outro(color.yellow(t("with_warnings")));
  } else {
    outro(color.red(t("with_errors")));
  }
}

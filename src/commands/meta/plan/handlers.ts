/** @fileoverview Plan 命令的核心业务逻辑，负责检查 Plan 文件的任务完成度并格式化输出。 */
import pc from "picocolors";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import type { PlanCheckResult } from "./types.ts";

/**
 * 检查 Plan 的完成度并输出报告。
 *
 * 输出示例：
 *   Plan 检查: SUB-01 订阅 CRUD
 *   Phase 1: 数据层与校验          [4/4]
 *   Phase 2: UI 组件               [6/6]
 *   Manual Verification            [0/5] (跳过 -- 人工验收)
 *   ──────────────────────────────────────
 *   合计: 19/19 (100%)
 *   所有自动化任务已完成！
 *
 * @param featureId Feature ID (e.g. "SUB-01")
 * @param featureName Feature 名称 (e.g. "Subscription CRUD")
 * @param result Plan 解析结果
 */
export function handlePlanCheck(
  featureId: string,
  featureName: string,
  result: PlanCheckResult,
): void {
  const t = createT(getSystemLocale(), "command.plan");

  logger.info("");
  logger.info(
    pc.bold(`📋 ${t("title", { id: featureId, name: featureName })}`),
  );
  logger.info("");

  if (result.sections.length === 0) {
    logger.warn(t("empty"));
    return;
  }

  let autoTotal = 0;
  let autoDone = 0;

  for (const section of result.sections) {
    const allDone = section.done === section.total;

    if (section.isManual) {
      // 人工验收 section — 显示为跳过
      logger.dim(
        `${section.name.padEnd(36)} ${t("section_manual", {
          done: section.done,
          total: section.total,
        })}`,
      );
    } else {
      // 自动化 section — 显示完成状态
      autoTotal += section.total;
      autoDone += section.done;

      const statusIcon = allDone ? pc.green("✅") : pc.yellow("⚠️");
      const countStr = t("section_pass", {
        done: section.done,
        total: section.total,
      });

      logger.info(
        `${section.name.padEnd(36)} ${allDone ? pc.green(countStr) : pc.yellow(countStr)} ${statusIcon}`,
      );

      // 列出未完成的具体任务
      if (!allDone) {
        for (const item of section.items) {
          if (!item.done) {
            logger.error(`  - ${item.id}: ${item.title}`);
          }
        }
      }
    }
  }

  logger.dim("──────────────────────────────────────");

  const percent = autoTotal > 0 ? Math.round((autoDone / autoTotal) * 100) : 0;
  logger.info(t("total", { done: autoDone, total: autoTotal, percent }));

  if (autoDone === autoTotal && autoTotal > 0) {
    logger.success(t("all_done"));
  } else if (autoTotal > 0) {
    logger.warn(t("remaining", { count: autoTotal - autoDone }));
  }

  logger.info("");
}

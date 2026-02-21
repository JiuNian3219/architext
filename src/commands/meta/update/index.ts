/** @fileoverview update 命令主入口，协调版本检查、文件更新、Schema 审计三个阶段。 */

import { intro, outro, spinner } from "@clack/prompts";
import color from "picocolors";
import { loadConfig } from "../../../core/config.ts";
import { AppError } from "../../../core/errors.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { EXPECTED_ROADMAP_VERSION } from "./constants.ts";
import { checkVersion } from "./resolver.ts";
import { updateRules, updateSilentFiles } from "./handlers.ts";
import { auditPlans, auditRoadmap } from "./auditor.ts";

const t = createT(getSystemLocale(), "command.update");

export async function updateCommand(_options: {
  dryRun: boolean;
}): Promise<void> {
  logger.clear();
  intro(color.bgCyan(color.black(` ${t("title")} `)));

  const cwd = process.cwd();

  // Step 1: 读取配置（无配置说明未初始化）
  const config = await loadConfig(cwd);
  if (!config) {
    outro(color.yellow(t("no_config")));
    return;
  }

  // Step 0: 版本检查（网络可选，失败不阻断后续流程）
  const s = spinner();
  s.start(t("version_checking"));
  const versionInfo = await checkVersion();

  if (!versionInfo) {
    s.stop(color.dim(t("version_check_skip")));
  } else if (versionInfo.isOutdated) {
    s.stop(
      color.yellow(
        t("version_outdated", {
          current: versionInfo.current,
          latest: versionInfo.latest,
        }),
      ),
    );
    logger.info(
      t("version_upgrade_hint", {
        cmd: `npm install -g architext@${versionInfo.latest}`,
      }),
    );
  } else {
    s.stop(
      color.green(t("version_up_to_date", { version: versionInfo.current })),
    );
  }

  // Step 2: 静默更新 prompts + docs/templates + commands
  s.start(t("updating_silent"));
  let silentCount = 0;
  try {
    const silentResult = await updateSilentFiles(config, cwd);
    silentCount = silentResult.count;
  } catch (error: unknown) {
    s.stop(color.red(t("failed")));
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(message);
  }
  s.stop(color.green(t("updated_silent", { count: silentCount })));

  // Step 3: Rules 更新（展示警告，用户确认后覆盖）
  logger.dim("");
  const rulesResult = await updateRules(config, cwd);
  if (!rulesResult) {
    outro(color.yellow(t("cancel")));
    return;
  }

  // Step 4: Schema 审计
  logger.dim("");
  logger.step(t("schema_auditing"));

  const roadmapResult = await auditRoadmap(config, cwd);
  const planResults = await auditPlans(config, cwd);

  // roadmap.json 审计结果
  if (roadmapResult.compatible) {
    if (roadmapResult.migrated) {
      logger.success(
        t("schema.roadmap_migrated", {
          file: roadmapResult.file,
          from: roadmapResult.fromVersion ?? 0,
          to: roadmapResult.toVersion ?? EXPECTED_ROADMAP_VERSION,
        }),
      );
    } else {
      logger.success(t("schema.roadmap_ok", { file: roadmapResult.file }));
    }
  } else {
    logger.fail(t("schema.roadmap_error", { file: roadmapResult.file }));
    roadmapResult.errors?.forEach((e) => logger.dim(`  ${e}`));
  }

  // plan.json 审计结果
  if (planResults.length === 0) {
    logger.dim(t("schema.no_plans"));
  } else {
    const incompatible = planResults.filter((p) => !p.compatible);
    if (incompatible.length === 0) {
      logger.success(t("schema.plans_ok", { count: planResults.length }));
    } else {
      incompatible.forEach((p) => {
        logger.fail(t("schema.plan_error", { file: p.file }));
        p.errors?.forEach((e) => logger.dim(`  ${e}`));
      });
    }
  }

  // 汇总报告
  logger.dim("");
  logger.step(t("summary"));
  if (rulesResult.updated.length > 0) {
    logger.done(
      t("summary_updated", { list: rulesResult.updated.join(" · ") }),
    );
  }
  if (rulesResult.templated.length > 0) {
    logger.info(t("summary_templated", { docDir: config.docDir }));
  }
  logger.dim(t("summary_skipped", { list: rulesResult.skipped.join(", ") }));

  outro(color.green(t("success")));
}

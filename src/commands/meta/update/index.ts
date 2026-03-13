/**
 * @fileoverview update 命令主入口——纯流程编排。
 *
 * 声明式更新：以当前 architext.json 为准，多了删、少了补。
 * 1. 加载配置
 * 2. 版本检查（npm）
 * 3. Guard：无 structureVersion / 版本过高 → 阻断
 * 4. 确认更新
 * 5. 清理旧 framework 文件（operations.ts）
 * 6. 部署新 framework 文件 + add-only seeds（operations.ts）
 * 7. templateOnly 规则 → 模板副本（operations.ts）
 * 8. Schema 审计（auditor.ts）
 * 9. 汇总 + 保存配置
 */

import { confirm, intro, isCancel, outro, spinner } from "@clack/prompts";
import color from "picocolors";
import { loadConfig, saveConfig } from "../../../core/config.ts";
import { AppError } from "../../../core/errors.ts";
import {
  CURRENT_FILE_MODEL_VERSION,
  getCurrentFileModel,
} from "../../../core/file-model.ts";
import { runMigrationChain } from "../../../core/migrations.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { auditPlans, auditRoadmap } from "./auditor.ts";
import { EXPECTED_ROADMAP_VERSION } from "./constants.ts";
import {
  deployNewFiles,
  deployTemplateOnlyRules,
  removeStaleFiles,
} from "./operations.ts";
import { checkVersion } from "./version.ts";
import { applyIdeIntegrations } from "../../../core/ide-integrations.ts";

const t = createT(getSystemLocale(), "command.update");

export async function updateCommand(): Promise<void> {
  logger.clear();
  intro(color.bgCyan(color.black(` ${t("title")} `)));

  const cwd = process.cwd();

  // ─── Phase 1: 加载配置 ─────────────────────────────────────────
  const config = await loadConfig(cwd);
  if (!config) {
    outro(color.yellow(t("no_config")));
    return;
  }

  // ─── Phase 2: 版本检查（CLI vs npm 最新） ───────────────────────
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

  // ─── Phase 3: Guard — 结构版本检查 ─────────────────────────────
  if (config.structureVersion == null) {
    logger.dim("");
    logger.warn(t("legacy_migration_blocked"));
    logger.dim(t("legacy_migration_step1"));
    logger.dim(t("legacy_migration_step2"));
    logger.dim(t("legacy_migration_step3"));
    logger.dim(t("legacy_migration_step4"));
    outro(color.yellow(t("cancel")));
    return;
  }

  if (config.structureVersion > CURRENT_FILE_MODEL_VERSION) {
    logger.dim("");
    logger.warn(
      t("version_too_new", {
        project: config.structureVersion,
        cli: CURRENT_FILE_MODEL_VERSION,
      }),
    );
    outro(color.yellow(t("cancel")));
    return;
  }

  // ─── Phase 4: 确认更新 ─────────────────────────────────────────
  const model = getCurrentFileModel();
  const neverTouchNames = Object.entries(model.rulePolicy)
    .filter(([, p]) => p === "neverTouch")
    .map(([n]) => n);
  const templateOnlyNames = Object.entries(model.rulePolicy)
    .filter(([, p]) => p === "templateOnly")
    .map(([n]) => n);

  logger.warn(t("update_warning"));
  logger.dim(
    t("update_skip_hint", {
      list: [...neverTouchNames, ...templateOnlyNames].join(", "),
    }),
  );
  logger.dim(t("update_global_hint"));

  const confirmed = await confirm({ message: t("update_confirm") });
  if (isCancel(confirmed) || !confirmed) {
    outro(color.yellow(t("cancel")));
    return;
  }

  // ─── Phase 4.5: 结构迁移 ─────────────────────────────────────
  let finalStructureVersion = config.structureVersion;
  if (config.structureVersion < CURRENT_FILE_MODEL_VERSION) {
    let result;
    try {
      result = await runMigrationChain(config, cwd, CURRENT_FILE_MODEL_VERSION);
    } catch (error: unknown) {
      // 链断裂等严重错误（如缺少 v2->v3 而目标版本是 v3）
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(t("migration_chain_broken", { error: errorMsg }));
      outro(color.red(t("failed")));
      return;
    }

    finalStructureVersion = result.toVersion; // 记录实际完成版本
    let totalMigrated = 0;
    let hasError = false;

    for (const step of result.steps) {
      s.start(
        t("migrating_structure", {
          fromVersion: step.from,
          toVersion: step.to,
        }),
      );
      if (step.error) {
        s.stop(color.yellow(t("migration_warn")));
        logger.dim(step.error);
        hasError = true;
        break;
      }
      if (step.migrated.length > 0) {
        s.stop(
          color.green(
            t("migrated_structure", {
              fromVersion: step.from,
              toVersion: step.to,
              count: step.migrated.length,
            }),
          ),
        );
        step.migrated.forEach((item) => logger.dim(`  ✓ ${item}`));
        totalMigrated += step.migrated.length;
      } else {
        s.stop(color.dim(t("migration_nothing")));
      }
    }

    if (hasError) {
      logger.warn(t("migration_partial", { done: totalMigrated }));
    }
  }

  // ─── Phase 5: 清理旧 framework 文件 ───────────────────────────
  s.start(t("removing_old"));
  let removedCount = 0;
  try {
    removedCount = await removeStaleFiles(config, cwd);
  } catch (error: unknown) {
    s.stop(color.red(t("failed")));
    throw new AppError(error instanceof Error ? error.message : String(error));
  }
  s.stop(color.green(t("removed_old", { count: removedCount })));

  // ─── Phase 6: 部署新 framework 文件 + add-only seeds ──────────
  s.start(t("deploying_new"));
  let frameworkCount = 0;
  let seedCount = 0;
  try {
    ({ frameworkCount, seedCount } = await deployNewFiles(config, cwd));
  } catch (error: unknown) {
    s.stop(color.red(t("failed")));
    throw new AppError(error instanceof Error ? error.message : String(error));
  }
  s.stop(
    color.green(
      t("deployed_new", { framework: frameworkCount, seeds: seedCount }),
    ),
  );

  // ─── Phase 6.5: IDE 集成（notify hooks）───────────────────────
  const notifyEnabled = config.notify !== false;
  const { opencodeNotifyAdded, claudeNotifyAdded } = await applyIdeIntegrations(
    config.editors,
    notifyEnabled,
  );
  if (opencodeNotifyAdded || claudeNotifyAdded) {
    logger.success(t("notify_enabled"));
  }

  // ─── Phase 7: templateOnly 规则 → 模板副本 ────────────────────
  const templatedRules = await deployTemplateOnlyRules(config);

  // ─── Phase 8: Schema 审计 ─────────────────────────────────────
  logger.dim("");
  logger.step(t("schema_auditing"));

  const roadmapResult = await auditRoadmap(config, cwd);
  const planResults = await auditPlans(config, cwd);

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

  // ─── Phase 9: 汇总 + 保存 ─────────────────────────────────────
  logger.dim("");
  logger.step(t("summary"));
  logger.done(t("summary_framework", { count: frameworkCount }));
  if (seedCount > 0) logger.info(t("summary_seeds", { count: seedCount }));
  if (templatedRules.length > 0)
    logger.info(t("summary_templated", { docDir: config.docDir }));
  if (neverTouchNames.length > 0)
    logger.dim(t("summary_skipped", { list: neverTouchNames.join(", ") }));
  logger.dim(t("summary_global"));

  await saveConfig({ ...config, structureVersion: finalStructureVersion }, cwd);

  outro(color.green(t("success")));
}

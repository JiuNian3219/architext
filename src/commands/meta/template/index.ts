/** @fileoverview Template 命令入口，从已部署的模板目录中提取模板文件到项目根目录供用户填写。 */
import fs from "fs-extra";
import path from "path";
import { resolveDocDir } from "../../../core/doc-dir.ts";
import { AppError } from "../../../core/errors.ts";
import { TemplateManager } from "../../../core/template.ts";
import { loadConfig } from "../../../core/config.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";

const t = createT(getSystemLocale(), "command.template");

const TEMPLATE_REGISTRY: Record<string, { file: string; output: string }> = {
  "scope-brief": {
    file: "scope-brief.template.md",
    output: "scope-brief.md",
  },
};

/**
 * 解析项目语言配置，用于定位正确语言版本的模板
 */
async function resolveLanguage(): Promise<string> {
  const config = await loadConfig();
  return config?.language ?? getSystemLocale();
}

/**
 * Template 命令的主入口函数。
 * 从 docDir/templates/ 或 bundled templates 中提取模板文件到项目根目录。
 *
 * @param name 模板名称（如 scope-brief）
 */
export async function templateCommand(name?: string): Promise<void> {
  if (!name) {
    const available = Object.keys(TEMPLATE_REGISTRY);
    logger.info(t("usage"));
    logger.info("");
    for (const key of available) {
      logger.info(`  ${key}`);
    }
    logger.info("");
    return;
  }

  const entry = TEMPLATE_REGISTRY[name];
  if (!entry) {
    const available = Object.keys(TEMPLATE_REGISTRY).join(", ");
    throw new AppError(
      t("unknown", { name, available }),
      "UNKNOWN_TEMPLATE",
      true,
    );
  }

  const destPath = path.join(process.cwd(), entry.output);

  if (await fs.pathExists(destPath)) {
    logger.warn(t("exists", { path: entry.output }));
    return;
  }

  // 优先从已部署的 docDir/templates/ 中读取
  const docDir = await resolveDocDir();
  if (docDir) {
    const deployedPath = path.join(docDir, "templates", entry.file);
    if (await fs.pathExists(deployedPath)) {
      await fs.copy(deployedPath, destPath);
      logger.success(t("done", { path: entry.output }));
      return;
    }
  }

  // 回退：从 bundled templates 中读取
  const lang = await resolveLanguage();
  const templateRoot = await TemplateManager.getRoot();
  const bundledPath = path.join(
    templateRoot,
    lang,
    "docs",
    "templates",
    entry.file,
  );

  if (await fs.pathExists(bundledPath)) {
    await fs.copy(bundledPath, destPath);
    logger.success(t("done", { path: entry.output }));
    return;
  }

  throw new AppError(
    t("not_found", { name: entry.file }),
    "TEMPLATE_NOT_FOUND",
    true,
  );
}

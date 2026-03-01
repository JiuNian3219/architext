/** @fileoverview 业务处理器，负责静默覆盖提示词/模板，以及确认后覆盖框架核心规则文件。 */

import { confirm, isCancel } from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import {
  CONDITIONAL_GLOBAL_FILES,
  EDITOR_CONFIGS,
  GLOBAL_RULES,
  resolveCapabilityRefs,
} from "../../../core/rules.ts";
import { TemplateManager } from "../../../core/template.ts";
import { FileOpType } from "../../../types/index.ts";
import type { ArchitextConfig } from "../../../types/index.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";

const t = createT(getSystemLocale(), "command.update");

/** 框架核心规则文件（不含扩展名）— 覆盖前需用户确认 */
const AUTO_UPDATE_RULES = [
  "00_system",
  "01_workflow",
  "03_data_governance",
  "99_context_glue",
];

/** 技术规范规则文件 — 写入新模板供用户手动合并，不覆盖原文件 */
const TEMPLATE_ONLY_RULE = "02_tech_stack";

/** 用户专属规则文件 — 永不触碰 */
const NEVER_TOUCH_RULES = ["90_custom_rules"];

export interface RulesUpdateResult {
  /** 已成功覆盖的规则文件名（不含扩展名） */
  updated: string[];
  /** 跳过的规则文件名（不含扩展名） */
  skipped: string[];
  /** 已写入新模板的规则文件名（不含扩展名） */
  templated: string[];
}

/**
 * 解析模板语言目录（存在时使用项目语言，否则回退到 zh）
 *
 * @param templateRoot - 模板根目录
 * @param lang - 语言
 * @returns 模板语言目录
 */
async function resolveTemplateLang(
  templateRoot: string,
  lang: string,
): Promise<string> {
  return (await fs.pathExists(path.join(templateRoot, lang))) ? lang : "zh";
}

/**
 * 构造占位符替换映射
 *
 * @param config - 配置
 * @returns 占位符替换映射
 */
function buildReplacements(config: ArchitextConfig): Record<string, string> {
  return {
    [GLOBAL_RULES.PLACEHOLDERS.DOCS_DIR]: config.docDir,
  };
}

/**
 * 构建能力标记解析器
 * 解析 [[SKILL: ...]] / [[NO-SKILL: ...]]，按 config.editors 是否支持 Skill 展开或移除。
 *
 * @param config - 配置
 * @returns 能力标记解析器
 */
function buildCapabilityResolver(
  config: ArchitextConfig,
): (content: string) => string {
  const hasSkills = config.editors.some((e) => !!EDITOR_CONFIGS[e]?.skills);
  return (content: string) => resolveCapabilityRefs(content, { hasSkills });
}

/**
 * 静默更新 prompts、docs/templates 及编辑器 commands 文件。
 * 直接覆盖，不询问用户——这些文件均为框架纯输出，用户不应手动修改。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 更新的文件总数
 */
export async function updateSilentFiles(
  config: ArchitextConfig,
  cwd: string,
): Promise<{ count: number }> {
  const templateRoot = await TemplateManager.getRoot();
  const templateLang = await resolveTemplateLang(templateRoot, config.language);
  const sourceDir = path.join(templateRoot, templateLang);
  const targetDir = path.resolve(cwd, config.docDir);
  const replacements = buildReplacements(config);
  const capabilityResolver = buildCapabilityResolver(config);

  let count = 0;

  // 更新 prompts
  const promptsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.PROMPTS_SOURCE);
  const promptsTarget = path.join(targetDir, "prompts");
  const promptOps = await TemplateManager.plan(
    promptsSource,
    promptsTarget,
    replacements,
  );
  // 解析 [[SKILL:...]] / [[NO-SKILL:...]]
  promptOps.forEach((op) => {
    if (op.type === FileOpType.Template) op.resolver = capabilityResolver;
  });
  await TemplateManager.execute(promptOps);
  count += promptOps.length;

  // 更新 docs/templates
  const templatesSource = path.join(sourceDir, "docs", "templates");
  const templatesTarget = path.join(targetDir, "templates");
  const templateOps = await TemplateManager.plan(
    templatesSource,
    templatesTarget,
    replacements,
  );
  templateOps.forEach((op) => {
    if (op.type === FileOpType.Template) op.resolver = capabilityResolver;
  });
  await TemplateManager.execute(templateOps);
  count += templateOps.length;

  // 更新编辑器 commands（仅支持 commands 的编辑器，如 Cursor）
  const promptFiles = await fs
    .readdir(promptsSource)
    .catch(() => [] as string[]);
  const mdPromptFiles = promptFiles.filter((f) => f.endsWith(".md"));

  for (const editor of config.editors) {
    const editorConfig = EDITOR_CONFIGS[editor];
    if (!editorConfig?.commands) continue;

    const commandsTarget = path.join(cwd, editorConfig.commands.targetDir);
    await fs.ensureDir(commandsTarget);

    for (const promptFile of mdPromptFiles) {
      const srcPath = path.join(promptsSource, promptFile);
      const baseName = path.basename(promptFile, ".md");
      const destPath = path.join(commandsTarget, `archi.${baseName}.md`);
      await TemplateManager.processFile(
        srcPath,
        destPath,
        replacements,
        capabilityResolver,
      );
      count++;
    }
  }

  // 补充新增的全局文档模板（仅当文件不存在且 features 匹配时写入，保护用户已有数据）
  const globalSource = path.join(sourceDir, "docs", "global");
  const globalTarget = path.join(targetDir, "global");
  if (await fs.pathExists(globalSource)) {
    const featureSet = new Set<string>(config.features ?? []);
    const globalFiles = await fs
      .readdir(globalSource)
      .catch(() => [] as string[]);
    for (const file of globalFiles) {
      const requiredFeature = CONDITIONAL_GLOBAL_FILES[file];
      if (requiredFeature && !featureSet.has(requiredFeature)) continue;
      const destPath = path.join(globalTarget, file);
      if (await fs.pathExists(destPath)) continue;
      const srcPath = path.join(globalSource, file);
      await fs.copy(srcPath, destPath);
      count++;
    }
  }

  return { count };
}

/**
 * 覆盖框架核心规则文件（00/01/03/99），覆盖前展示警告并请用户确认。
 * 02_tech_stack 写入新模板到 docDir/templates/，90_custom_rules 静默跳过。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 更新结果，null 表示用户取消
 */
export async function updateRules(
  config: ArchitextConfig,
  cwd: string,
): Promise<RulesUpdateResult | null> {
  const templateRoot = await TemplateManager.getRoot();
  const templateLang = await resolveTemplateLang(templateRoot, config.language);
  const rulesSource = path.join(
    templateRoot,
    templateLang,
    GLOBAL_RULES.PATHS.RULES_SOURCE,
  );
  const replacements = buildReplacements(config);

  // 展示覆盖警告
  logger.warn(t("rules_overwrite_warning"));
  AUTO_UPDATE_RULES.forEach((name) => logger.dim(`  ${name}`));

  const confirmed = await confirm({ message: t("rules_confirm") });
  if (isCancel(confirmed) || !confirmed) return null;

  const result: RulesUpdateResult = { updated: [], skipped: [], templated: [] };

  // 覆盖 00/01/03/99，对所有已配置的编辑器同步处理
  for (const editor of config.editors) {
    const editorConfig = EDITOR_CONFIGS[editor];
    if (!editorConfig) continue;

    const editorDir = path.join(cwd, editorConfig.targetDir);
    await fs.ensureDir(editorDir);

    for (const baseName of AUTO_UPDATE_RULES) {
      const srcPath = path.join(rulesSource, `${baseName}.md`);
      if (!(await fs.pathExists(srcPath))) continue;

      const destPath = path.join(
        editorDir,
        `${baseName}${editorConfig.targetExt}`,
      );
      await TemplateManager.processFile(srcPath, destPath, replacements);

      if (!result.updated.includes(baseName)) {
        result.updated.push(baseName);
      }
    }
  }

  // 02_tech_stack：写新模板到 docDir/templates/，不动原规则文件
  const techSrcPath = path.join(rulesSource, `${TEMPLATE_ONLY_RULE}.md`);
  if (await fs.pathExists(techSrcPath)) {
    const techTemplateDest = path.join(
      cwd,
      config.docDir,
      "templates",
      `${TEMPLATE_ONLY_RULE}.template.md`,
    );
    await fs.ensureDir(path.dirname(techTemplateDest));
    await TemplateManager.processFile(
      techSrcPath,
      techTemplateDest,
      replacements,
    );
    result.templated.push(TEMPLATE_ONLY_RULE);
  }

  // 90_custom_rules：静默跳过
  NEVER_TOUCH_RULES.forEach((name) => result.skipped.push(name));

  return result;
}

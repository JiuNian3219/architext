/** @fileoverview 核心脚手架执行引擎，负责根据配置生成文档骨架、安装核心规则并分发 IDE 配置文件。 */

import fs from "fs-extra";
import path from "path";
import { FileOperation, FileOpType, InitConfig } from "../types/index.ts";
import { logger } from "../utils/logger.ts";
import { createT, getSystemLocale } from "../utils/t.ts";
import { ConflictResolver } from "./conflict.ts";
import { EDITOR_CONFIGS, GLOBAL_RULES } from "./rules.ts";
import { TemplateManager } from "./template.ts";

export type ScaffoldOptions = InitConfig;

const t = createT(getSystemLocale(), "scaffold");

export class Scaffolder {
  /**
   * 执行脚手架初始化流程，根据配置生成文档骨架、安装核心规则并分发 IDE 配置文件
   * @param options 初始化配置选项
   */
  static async run(options: ScaffoldOptions) {
    const { language, docDir, editors } = options;
    const templateRoot = await TemplateManager.getRoot();

    // 如果请求的语言模板不存在（例如 zh-Hant 尚未完善），则回退到默认的中文模板，确保初始化流程不中断
    let templateLang = language;
    if (!(await fs.pathExists(path.join(templateRoot, templateLang)))) {
      logger.warn(t("fallback", { lang: language }));
      templateLang = "zh";
    }

    const sourceDir = path.join(templateRoot, templateLang);
    const targetDir = path.resolve(process.cwd(), docDir);

    const replacements = {
      [GLOBAL_RULES.PLACEHOLDERS.DOCS_DIR]: docDir,
      [GLOBAL_RULES.PLACEHOLDERS.RULES_DIR]: path
        .join(docDir, GLOBAL_RULES.PATHS.RULES_TARGET)
        .replace(/\\/g, "/"),
    };

    // 用于记录所有文件操作
    const operations: FileOperation[] = [];

    const docsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.DOCS_SOURCE);
    if (await fs.pathExists(docsSource)) {
      const docOps = await TemplateManager.plan(
        docsSource,
        targetDir,
        replacements,
      );
      docOps.forEach((op) => (op.group = "docs"));
      operations.push(...docOps);
    }

    const rulesSource = path.join(sourceDir, GLOBAL_RULES.PATHS.RULES_SOURCE);
    if (await fs.pathExists(rulesSource)) {
      const allFiles = await fs.readdir(rulesSource);
      const ruleFiles = allFiles.filter((f) => f.endsWith(".md"));

      // 收集所有规则文件
      for (const editor of editors) {
        const config = EDITOR_CONFIGS[editor];
        if (!config) continue;

        const fullIdeDir = path.join(process.cwd(), config.targetDir);
        for (const file of ruleFiles) {
          const srcPath = path.join(rulesSource, file);
          const baseName = path.basename(file, ".md");
          const newFileName = baseName + config.targetExt;
          const destPath = path.join(fullIdeDir, newFileName);

          operations.push({
            src: srcPath,
            dest: destPath,
            type: FileOpType.Template,
            replacements,
            group: "ide",
          });
        }
      }
    }

    // 处理 Commands 文件（仅支持 Cursor 等配置了 commands 的编辑器）
    // 从 prompts 目录读取所有文件，为每个文件生成对应的 commands 文件
    const promptsSource = path.join(
      sourceDir,
      GLOBAL_RULES.PATHS.PROMPTS_SOURCE,
    );
    if (await fs.pathExists(promptsSource)) {
      const allPromptFiles = await fs.readdir(promptsSource);
      const promptFiles = allPromptFiles.filter((f) => f.endsWith(".md"));

      for (const editor of editors) {
        const config = EDITOR_CONFIGS[editor];
        if (!config?.commands) continue;

        const commandsTargetDir = path.join(
          process.cwd(),
          config.commands.targetDir,
        );

        // 为每个 prompt 文件生成对应的 commands 文件
        // 文件名格式: archi.{原文件名}，例如 start.md -> archi.start.md
        for (const promptFile of promptFiles) {
          const srcPath = path.join(promptsSource, promptFile);
          const baseName = path.basename(promptFile, ".md");
          const targetFileName = `archi.${baseName}.md`;
          const destPath = path.join(commandsTargetDir, targetFileName);

          operations.push({
            src: srcPath,
            dest: destPath,
            type: FileOpType.Template,
            replacements,
            group: "ide",
          });
        }
      }
    }

    // 处理文件冲突
    const finalOperations = await ConflictResolver.resolve(operations);

    const groups = ["docs", "ide"];
    const groupLabels: Record<string, string> = {
      docs: t("step_docs"),
      ide: t("step_ide"),
    };

    for (const group of groups) {
      const groupOps = finalOperations.filter((op) => op.group === group);
      if (groupOps.length > 0) {
        logger.step(groupLabels[group] || t("step_processing", { group }));
        await TemplateManager.execute(groupOps);
      }
    }

    // 处理未分组的操作 (如果有)
    const otherOps = finalOperations.filter((op) => !op.group);
    if (otherOps.length > 0) {
      await TemplateManager.execute(otherOps);
    }

    logger.success(t("complete"));
  }
}

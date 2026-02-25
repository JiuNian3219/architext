/** @fileoverview 核心脚手架执行引擎，负责根据配置生成文档骨架、安装核心规则并分发 IDE 配置文件。 */

import fs from "fs-extra";
import path from "path";
import {
  FileOperation,
  FileOpType,
  InitConfig,
  ProjectFeature,
} from "../types/index.ts";
import { logger } from "../utils/logger.ts";
import { createT, getSystemLocale } from "../utils/t.ts";
import {
  BRIEF_BASE_NAME,
  BRIEF_MODULES_NAME,
  BRIEF_OUTPUT_NAME,
  EDITOR_CONFIGS,
  GLOBAL_RULES,
  resolveCapabilityRefs,
} from "./rules.ts";
import { TemplateManager } from "./template.ts";

export type ScaffoldOptions = InitConfig;

/** 脚手架运行时可选的扩展选项（由调用方注入，避免 core 依赖 commands 层） */
export interface ScaffoldRunOptions {
  /** 冲突解决器，由 init 命令注入；未提供时跳过冲突检测 */
  resolveConflicts?: (operations: FileOperation[]) => Promise<FileOperation[]>;
}

const t = createT(getSystemLocale(), "scaffold");

export class Scaffolder {
  /**
   * 执行脚手架初始化流程，根据配置生成文档骨架、安装核心规则并分发 IDE 配置文件
   * @param options 初始化配置选项
   * @param runOptions 运行时可选项（如 resolveConflicts，由 init 命令注入）
   */
  static async run(options: ScaffoldOptions, runOptions?: ScaffoldRunOptions) {
    const { language, docDir, editors, features = [] } = options;
    const templateRoot = await TemplateManager.getRoot();

    // 如果请求的语言模板不存在（例如 zh-Hant 尚未完善），则回退到默认的中文模板，确保初始化流程不中断
    let templateLang = language;
    if (!(await fs.pathExists(path.join(templateRoot, templateLang)))) {
      logger.warn(t("fallback", { lang: language }));
      templateLang = "zh";
    }

    const sourceDir = path.join(templateRoot, templateLang);
    const targetDir = path.resolve(process.cwd(), docDir);

    // 确保 [[__DOCS_DIR__]] 下的 scripts 和 tasks 空目录存在（用于存放未来计划和脚本）
    await fs.ensureDir(path.join(targetDir, "scripts"));
    await fs.ensureDir(path.join(targetDir, "tasks"));

    const replacements = {
      [GLOBAL_RULES.PLACEHOLDERS.DOCS_DIR]: docDir,
    };

    // 判断所选编辑器中是否有任何一个支持 Agent Skills（如 Cursor）
    // 用于解析 prompts/commands 中的 [[SKILL: desc]] / [[NO-SKILL: desc]] 能力标记：
    //   有 Skill → [[SKILL: desc]] 展开为 desc，[[NO-SKILL: desc]] 移除
    //   无 Skill → [[NO-SKILL: desc]] 展开为 desc，[[SKILL: desc]] 移除
    const hasSkills = editors.some((e) => !!EDITOR_CONFIGS[e]?.skills);
    const capabilityResolver = (content: string) =>
      resolveCapabilityRefs(content, { hasSkills });

    // 用于记录所有文件操作
    const operations: FileOperation[] = [];

    const docsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.DOCS_SOURCE);
    if (await fs.pathExists(docsSource)) {
      const docOps = await TemplateManager.plan(
        docsSource,
        targetDir,
        replacements,
      );
      docOps.forEach((op) => {
        op.group = "docs";
        if (op.type === FileOpType.Template) op.resolver = capabilityResolver;
      });
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

    // 处理 Skills 文件
    const skillsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.SKILLS_SOURCE);
    if (await fs.pathExists(skillsSource)) {
      // 支持 Agent Skills 的编辑器（如 Cursor）：安装到编辑器专属目录
      // archi- 前缀的 Skill 文件夹与用户自有 Skills 物理隔离，冲突检测仅覆盖 Architext 管理的范围
      for (const editor of editors) {
        const config = EDITOR_CONFIGS[editor];
        if (!config?.skills) continue;

        const skillsTargetDir = path.join(
          process.cwd(),
          config.skills.targetDir,
        );
        const skillOps = await TemplateManager.plan(
          skillsSource,
          skillsTargetDir,
          replacements,
        );
        skillOps.forEach((op) => (op.group = "ide"));
        operations.push(...skillOps);
      }

      // 不支持 Agent Skills 的编辑器：
      // 将 Skill 文件复制到 docDir/skills/，供 AI 通过文件路径引用读取
      // （prompt 中的 [[NO-SKILL: ...]] 会展开为指向这里的文件引用）
      const hasNonSkillEditors = editors.some(
        (e) => !EDITOR_CONFIGS[e]?.skills,
      );
      if (hasNonSkillEditors) {
        const docSkillsTargetDir = path.join(
          targetDir,
          GLOBAL_RULES.PATHS.SKILLS_DOC_TARGET,
        );
        const docSkillOps = await TemplateManager.plan(
          skillsSource,
          docSkillsTargetDir,
          replacements,
        );
        docSkillOps.forEach((op) => (op.group = "docs"));
        operations.push(...docSkillOps);
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
        // commands 目录（如 .cursor/commands）归属于支持 Skill 的编辑器，resolver 始终为 skillResolver
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
            resolver: capabilityResolver,
            group: "ide",
          });
        }
      }
    }

    // 处理文件冲突（Brief 单独处理，不进入常规 operations）
    // resolveConflicts 由 init 命令注入，core 层不依赖 commands
    const finalOperations = runOptions?.resolveConflicts
      ? await runOptions.resolveConflicts(operations)
      : operations;

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

    const otherOps = finalOperations.filter((op) => !op.group);
    if (otherOps.length > 0) {
      await TemplateManager.execute(otherOps);
    }

    await this.generateBrief(sourceDir, features, replacements);

    logger.success(t("complete"));
  }

  /**
   * 读取 _base.md + _modules.md，根据选中的特征标签提取模块片段插入骨架，写入项目根目录。
   * _modules.md 中标记格式: `<!-- @tech:tag -->...<!-- @end -->` / `<!-- @style:tag -->...<!-- @end -->`
   * _base.md 中插槽: `<!-- @slot:tech -->` / `<!-- @slot:style -->`
   *
   * @param sourceDir 源目录
   * @param features 项目特征
   * @param replacements 替换变量
   */
  private static async generateBrief(
    sourceDir: string,
    features: ProjectFeature[],
    replacements: Record<string, string>,
  ) {
    const briefsDir = path.join(sourceDir, GLOBAL_RULES.PATHS.BRIEFS_SOURCE);
    const basePath = path.join(briefsDir, BRIEF_BASE_NAME);

    if (!(await fs.pathExists(basePath))) return;

    let base = await fs.readFile(basePath, "utf-8");

    const modulesPath = path.join(briefsDir, BRIEF_MODULES_NAME);
    const modules = (await fs.pathExists(modulesPath))
      ? await fs.readFile(modulesPath, "utf-8")
      : "";

    const featureTags = new Set<string>(features);

    const techSnippets: string[] = [];
    const styleSnippets: string[] = [];

    const blockRe = /<!-- @(tech|style):(\w+) -->\n([\s\S]*?)<!-- @end -->/g;
    let match;
    while ((match = blockRe.exec(modules)) !== null) {
      const [, slot, tag, content] = match;
      if (!featureTags.has(tag)) continue;
      const trimmed = content.trimEnd();
      if (slot === "tech") techSnippets.push(trimmed);
      else if (slot === "style") styleSnippets.push(trimmed);
    }

    base = base.replace("<!-- @slot:tech -->", techSnippets.join("\n"));
    base = base.replace(
      "<!-- @slot:style -->",
      styleSnippets.length > 0 ? styleSnippets.join("\n\n") + "\n\n" : "",
    );

    for (const [key, value] of Object.entries(replacements)) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      base = base.replace(new RegExp(escapedKey, "g"), value);
    }

    base = base.replace(/\n{3,}/g, "\n\n");

    const destPath = path.join(process.cwd(), BRIEF_OUTPUT_NAME);
    await fs.writeFile(destPath, base, "utf-8");
  }
}

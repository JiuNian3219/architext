/**
 * @fileoverview 核心脚手架执行引擎。
 *
 * 基于 file-model.ts 的 FileModel 驱动部署，所有路由逻辑集中在 resolveFiles()。
 * 负责：根据模型构建 FileOperation → 冲突检测 → 分组执行。
 *
 * init 和 update 共享 buildScaffoldOps()，确保部署路径一致。
 */

import fs from "fs-extra";
import path from "path";
import {
  FileOperation,
  FileOpType,
  InitConfig,
  ProjectFeature,
  SupportedEditor,
} from "../types/index.ts";
import { logger } from "../utils/logger.ts";
import { createT, getSystemLocale } from "../utils/t.ts";
import {
  EDITOR_CONFIGS,
  GLOBAL_RULES,
  getPromptsPathForEditor,
  resolveCapabilityRefs,
} from "./rules.ts";
import { getCurrentFileModel } from "./file-model.ts";
import { TemplateManager } from "./template.ts";
import { generateBrief } from "./brief.ts";
import { applyIdeIntegrations } from "./ide-integrations.ts";

export type ScaffoldOptions = InitConfig;

export interface ScaffoldRunOptions {
  /** 冲突解决器，由 init 命令注入；未提供时跳过冲突检测 */
  resolveConflicts?: (operations: FileOperation[]) => Promise<FileOperation[]>;
}

/** buildScaffoldOps 的返回值 */
export interface ScaffoldPlan {
  /** Framework 文件操作 — 可安全删除+重部署 */
  frameworkOps: FileOperation[];
  /** Seed 文件操作 — init 全量写入，update 时 add-only */
  seedOps: FileOperation[];
}

const t = createT(getSystemLocale(), "scaffold");

/**
 * 构建编辑器解析器。
 *
 * @param editorConfig - 编辑器配置
 * @param includeBaseDir - 基础目录
 * @returns 能力标记解析器
 */
function buildEditorResolver(
  editorConfig: (typeof EDITOR_CONFIGS)[keyof typeof EDITOR_CONFIGS],
  includeBaseDir: string,
) {
  return (content: string) =>
    resolveCapabilityRefs(
      content,
      {
        hasSkills: !!editorConfig.skills,
        hasSubagents: !!editorConfig.subagents,
        hasCommands: !!editorConfig.commands,
      },
      includeBaseDir,
    );
}

/**
 * 构建文档解析器。
 *
 * @param editors - 编辑器列表
 * @param includeBaseDir - 基础目录
 * @returns 能力标记解析器
 */
function buildDocsResolver(editors: SupportedEditor[], includeBaseDir: string) {
  const hasSkills = editors.some((e) => !!EDITOR_CONFIGS[e]?.skills);
  const hasSubagents = editors.some((e) => !!EDITOR_CONFIGS[e]?.subagents);
  const hasCommands = editors.some((e) => !!EDITOR_CONFIGS[e]?.commands);
  return (content: string) =>
    resolveCapabilityRefs(
      content,
      { hasSkills, hasSubagents, hasCommands },
      includeBaseDir,
    );
}

/**
 * 解析模板语言。
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
 * 根据当前 FileModel 和配置，构建所有 FileOperation。
 *
 * 路由逻辑与 file-model.ts 的 resolveFiles() 一致，此处额外关联源模板路径、
 * replacements、resolvers 以构成可执行的 FileOperation。
 *
 * init 和 update 的 deploy 阶段都调用此函数，保证路径计算一致。
 *
 * @param options - 选项
 * @returns 脚手架计划
 */
export async function buildScaffoldOps(
  options: ScaffoldOptions,
): Promise<ScaffoldPlan> {
  const { language, docDir, editors, features = [] } = options;
  const templateRoot = await TemplateManager.getRoot();
  const templateLang = await resolveTemplateLang(templateRoot, language);
  const sourceDir = path.join(templateRoot, templateLang);
  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, docDir);
  const docsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.DOCS_SOURCE);

  const model = getCurrentFileModel();
  const featureSet = new Set<ProjectFeature>(features);
  const featuresLabel = features.length > 0 ? features.join(", ") : "未指定";

  const replacements = {
    [GLOBAL_RULES.PLACEHOLDERS.DOCS_DIR]: docDir,
    [GLOBAL_RULES.PLACEHOLDERS.PROJECT_TYPE]: featuresLabel,
  };

  const frameworkOps: FileOperation[] = [];
  const seedOps: FileOperation[] = [];

  // ── Rules ─────────────────────────────────────────────────────────────────
  const rulesSource = path.join(sourceDir, GLOBAL_RULES.PATHS.RULES_SOURCE);

  for (const editor of editors) {
    const ec = EDITOR_CONFIGS[editor];
    if (!ec) continue;

    const editorReplacements = {
      ...replacements,
      [GLOBAL_RULES.PLACEHOLDERS.PROMPTS_PATH]: getPromptsPathForEditor(
        editor,
        docDir,
      ),
    };
    const editorResolver = buildEditorResolver(ec, docsSource);
    const editorDir = path.join(cwd, ec.targetDir);

    for (const rule of model.rules) {
      frameworkOps.push({
        src: path.join(rulesSource, `${rule}.md`),
        dest: path.join(editorDir, `${rule}${ec.targetExt}`),
        type: FileOpType.Template,
        replacements: editorReplacements,
        resolver: editorResolver,
        group: "ide",
      });
    }
  }

  // ── Prompts ───────────────────────────────────────────────────────────────
  const promptsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.PROMPTS_SOURCE);

  for (const editor of editors) {
    const ec = EDITOR_CONFIGS[editor];
    if (!ec) continue;
    const editorResolver = buildEditorResolver(ec, docsSource);

    for (const prompt of model.prompts) {
      const src = path.join(promptsSource, `${prompt}.md`);
      const dest = ec.commands
        ? path.join(cwd, ec.commands.targetDir, `archi.${prompt}.md`)
        : path.join(targetDir, "prompts", editor, `archi.${prompt}.md`);

      frameworkOps.push({
        src,
        dest,
        type: FileOpType.Template,
        replacements,
        resolver: editorResolver,
        group: "ide",
      });
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.SKILLS_SOURCE);

  for (const editor of editors) {
    const ec = EDITOR_CONFIGS[editor];
    if (!ec?.skills) continue;

    for (const skill of model.skills) {
      const skillSrcDir = path.join(skillsSource, skill);
      const skillDestDir = path.join(cwd, ec.skills.targetDir, skill);
      if (await fs.pathExists(skillSrcDir)) {
        const skillOps = await TemplateManager.plan(
          skillSrcDir,
          skillDestDir,
          replacements,
        );
        skillOps.forEach((op) => (op.group = "ide"));
        frameworkOps.push(...skillOps);
      }
    }
  }

  const hasNonSkillEditor = editors.some((e) => !EDITOR_CONFIGS[e]?.skills);
  if (hasNonSkillEditor) {
    for (const skill of model.skills) {
      const skillSrcDir = path.join(skillsSource, skill);
      const skillDestDir = path.join(
        targetDir,
        GLOBAL_RULES.PATHS.SKILLS_DOC_TARGET,
        skill,
      );
      if (await fs.pathExists(skillSrcDir)) {
        const skillOps = await TemplateManager.plan(
          skillSrcDir,
          skillDestDir,
          replacements,
        );
        skillOps.forEach((op) => (op.group = "docs"));
        frameworkOps.push(...skillOps);
      }
    }
  }

  // ── Doc Templates ─────────────────────────────────────────────────────────
  const templatesSource = path.join(sourceDir, "docs", "templates");
  const docsResolver = buildDocsResolver(editors, docsSource);

  for (const tmpl of model.docTemplates) {
    frameworkOps.push({
      src: path.join(templatesSource, tmpl),
      dest: path.join(targetDir, "templates", tmpl),
      type: FileOpType.Template,
      replacements,
      resolver: docsResolver,
      group: "docs",
    });
  }

  // ── Global Seeds ──────────────────────────────────────────────────────────
  const globalSource = path.join(sourceDir, "docs", "global");

  for (const seed of model.globalSeeds) {
    const fileName = typeof seed === "string" ? seed : seed.file;
    if (typeof seed !== "string" && !featureSet.has(seed.feature)) continue;

    seedOps.push({
      src: path.join(globalSource, fileName),
      dest: path.join(targetDir, "global", fileName),
      type: FileOpType.Template,
      replacements,
      group: "docs",
    });
  }

  // ── Global Docs ─────────
  const globalRefsSource = path.join(sourceDir, "docs", "global", "references");

  for (const doc of model.globalDocs) {
    frameworkOps.push({
      src: path.join(globalRefsSource, doc),
      dest: path.join(targetDir, "global", "references", doc),
      type: FileOpType.Template,
      replacements,
      resolver: docsResolver,
      group: "docs",
    });
  }

  return { frameworkOps, seedOps };
}

/**
 * 执行完整的脚手架初始化流程。
 *
 * 1. buildScaffoldOps() 构建所有操作
 * 2. 冲突检测
 * 3. 按分组执行（docs → ide）
 * 4. 创建骨架目录
 * 5. 生成 project-brief.md（brief.ts）
 * 6. 应用 IDE 集成（ide-integrations.ts）
 *
 * @param options - 选项
 * @param runOptions - 运行选项
 * @returns 执行结果
 */
export async function scaffold(
  options: ScaffoldOptions,
  runOptions?: ScaffoldRunOptions,
) {
  const { language, docDir, editors, features = [], notify = true } = options;

  const templateRoot = await TemplateManager.getRoot();
  const templateLang = await resolveTemplateLang(templateRoot, language);
  if (templateLang !== language) {
    logger.warn(t("fallback", { lang: language }));
  }

  const { frameworkOps, seedOps } = await buildScaffoldOps(options);
  const allOps = [...frameworkOps, ...seedOps];

  const finalOperations = runOptions?.resolveConflicts
    ? await runOptions.resolveConflicts(allOps)
    : allOps;

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
  if (otherOps.length > 0) await TemplateManager.execute(otherOps);

  const targetDir = path.resolve(process.cwd(), docDir);
  await fs.ensureDir(path.join(targetDir, "scripts"));
  await fs.ensureDir(path.join(targetDir, "tasks"));
  await fs.ensureDir(path.join(targetDir, "refs"));

  if (options.generateBrief !== false) {
    const sourceDir = path.join(templateRoot, templateLang);
    await generateBrief(sourceDir, features, {
      [GLOBAL_RULES.PLACEHOLDERS.DOCS_DIR]: docDir,
      [GLOBAL_RULES.PLACEHOLDERS.PROJECT_TYPE]:
        features.length > 0 ? features.join(", ") : "未指定",
    });
  }

  const { opencodeInstructionsAdded, opencodeNotifyAdded, claudeNotifyAdded } =
    await applyIdeIntegrations(editors, notify);

  logger.success(t("complete"));
  return { opencodeInstructionsAdded, opencodeNotifyAdded, claudeNotifyAdded };
}

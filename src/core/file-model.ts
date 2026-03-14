/**
 * @fileoverview Architext 文件模型注册表，用于管理所有 Architext 管理的文件路径。
 *
 * 每个结构版本声明其完整的文件清单（rules/prompts/skills/docTemplates/globalSeeds/globalDocs）。
 * 给定 (structureVersion + config)，resolveFiles() 可精确计算所有 Architext 管理的文件路径。
 *
 * 版本间差异自动计算：旧模型知道旧文件名，新模型知道新文件名，无需手动维护。
 *
 * 维护须知：
 * - 新增/删除模板文件时，同步更新对应版本的 FileModel
 * - structureVersion 仅在文件布局变化时递增（新增/删除/重命名文件），内容更新不递增
 * - tests/file-model.test.ts 会校验模型与模板目录的一致性
 *
 * v1 → v2 变更摘要：
 * - rules 从 7 个减少到 2 个（删除 01/03/04/99，移动 02）
 * - globalSeeds 新增 tech_stack.md（从 rule 降级为 seed）
 * - 新增 globalDocs 字段：框架拥有的参考文档（可随 update 刷新），部署到 global/references/
 */

import type { ProjectFeature, SupportedEditor } from "../types/index.ts";
import { EDITOR_CONFIGS, SUPPORTED_EDITORS } from "./rules.ts";

/** 全局种子文件类型 */
export type GlobalSeedFile = string | { file: string; feature: ProjectFeature };

/** 文件模型接口，定义了文件模型的结构和内容 */
export interface FileModel {
  version: number;

  /** 规则文件 basenames（无扩展名），对应 templates/{lang}/rules/{name}.md */
  rules: string[];

  /** 协议文件 basenames（无扩展名），对应 templates/{lang}/docs/prompts/{name}.md，部署时加 archi. 前缀 */
  prompts: string[];

  /** Skill 目录名，对应 templates/{lang}/skills/{name}/，每个目录整体部署 */
  skills: string[];

  /** 文档模板文件名（含扩展名），对应 templates/{lang}/docs/templates/{name} */
  docTemplates: string[];

  /** 全局种子文件：init 部署一次，之后为用户数据，update 仅 add-only */
  globalSeeds: GlobalSeedFile[];

  /**
   * 框架参考文档：框架拥有，可随 update 刷新（非用户数据）。
   * basenames（含扩展名），对应 templates/{lang}/docs/global/references/{name}，
   * 部署到 {docDir}/global/references/{name}
   */
  globalDocs: string[];

  /** 规则更新策略覆盖（未列出的默认 refresh） */
  rulePolicy: Record<string, "templateOnly" | "neverTouch">;
}

/** resolveFiles() 的输入配置（取 ArchitextConfig 的子集，解耦依赖） */
export interface ResolveConfig {
  editors: SupportedEditor[];
  docDir: string;
  features?: ProjectFeature[];
}

/** resolveFiles() 的输出：完整的文件路径分类清单 */
export interface ResolvedFiles {
  /** Framework 文件路径 — 可安全删除+重部署（rules/prompts/doc-templates/doc-prompts/doc-skills/globalDocs） */
  frameworkFiles: string[];
  /** Framework 目录路径 — 整个目录管理（skills） */
  frameworkDirs: string[];
  /** Seed 文件路径 — init 部署一次，update 时 add-only */
  seedFiles: string[];
  /** 骨架目录 — ensureDir 即可 */
  scaffoldDirs: string[];
}

/** 文件模型注册表 */
export const FILE_MODELS: FileModel[] = [
  {
    version: 1,
    rules: [
      "00_system",
      "01_workflow",
      "02_tech_stack",
      "03_data_governance",
      "04_cli_tools",
      "90_custom_rules",
      "99_context_glue",
    ],
    prompts: [
      "start",
      "inherit",
      "scope",
      "plan",
      "code",
      "edit",
      "revise",
      "audit",
      "fix",
      "map",
      "remove",
      "help",
      "recover",
      "ref",
    ],
    skills: [
      "archi-data-sync",
      "archi-decompose-roadmap",
      "archi-design-patterns",
      "archi-feature-relations",
      "archi-interview-protocol",
      "archi-plan-options",
      "archi-silent-audit",
      "archi-ui-wireframe",
    ],
    docTemplates: [
      "design.template.md",
      "plan.template.json",
      "scope-brief.template.md",
      "spec.template.md",
      "ui.template.md",
    ],
    globalSeeds: [
      "dictionary.json",
      "error_codes.json",
      "map.json",
      "roadmap.json",
      "vision.md",
      { file: "api_snapshot.json", feature: "api" },
      { file: "command_api.json", feature: "cli" },
      { file: "data_snapshot.json", feature: "data" },
      { file: "design_tokens.json", feature: "ui" },
      { file: "env_registry.json", feature: "api" },
      { file: "public_api.json", feature: "lib" },
    ],
    globalDocs: [],
    rulePolicy: {
      "02_tech_stack": "templateOnly",
      "90_custom_rules": "neverTouch",
    },
  },
  {
    version: 2,
    rules: ["00_system", "90_custom_rules"],
    prompts: [
      "start",
      "inherit",
      "scope",
      "plan",
      "code",
      "edit",
      "revise",
      "audit",
      "fix",
      "map",
      "remove",
      "help",
      "recover",
      "ref",
      "ui",
    ],
    skills: [
      "archi-data-sync",
      "archi-decompose-roadmap",
      "archi-design-patterns",
      "archi-feature-relations",
      "archi-interview-protocol",
      "archi-plan-options",
      "archi-silent-audit",
      "archi-ui-wireframe",
    ],
    docTemplates: [
      "design.template.md",
      "plan.template.json",
      "scope-brief.template.md",
      "spec.template.md",
      "ui.template.md",
    ],
    globalSeeds: [
      "dictionary.json",
      "error_codes.json",
      "map.json",
      "roadmap.json",
      "vision.md",
      "tech_stack.md",
      { file: "api_snapshot.json", feature: "api" },
      { file: "command_api.json", feature: "cli" },
      { file: "data_snapshot.json", feature: "data" },
      { file: "design_tokens.json", feature: "ui" },
      { file: "env_registry.json", feature: "api" },
      { file: "public_api.json", feature: "lib" },
    ],
    globalDocs: ["cli_reference.md"],
    rulePolicy: {
      "90_custom_rules": "neverTouch",
    },
  },
];

export const CURRENT_FILE_MODEL_VERSION = 2;

export function getFileModel(version: number): FileModel | undefined {
  return FILE_MODELS.find((m) => m.version === version);
}

export function getCurrentFileModel(): FileModel {
  const model = getFileModel(CURRENT_FILE_MODEL_VERSION);
  if (!model) {
    throw new Error(
      `FileModel version ${CURRENT_FILE_MODEL_VERSION} not found in registry`,
    );
  }
  return model;
}

/**
 * 将路径分隔符统一为正斜杠（跨平台一致性）
 */
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * 根据 FileModel 和配置，计算所有 Architext 管理的文件路径。
 *
 * 路由规则（集中在此函数，取代散布在 scaffold/handlers/resolver 的重复逻辑）：
 * - Rules:   每个 editor → {editor.targetDir}/{rule}{editor.targetExt}
 * - Prompts: 有 commands 的 editor → {commands.targetDir}/archi.{name}.md
 *            无 commands 的 editor → {docDir}/prompts/{editor}/archi.{name}.md
 * - Skills:  有 skills 的 editor → {skills.targetDir}/{skillName}/ (目录)
 *            任一 editor 无 skills → {docDir}/skills/{skillName}/ (目录)
 * - DocTemplates: → {docDir}/templates/{filename}
 * - GlobalSeeds:  → {docDir}/global/{filename} (受 features 条件过滤)
 */
export function resolveFiles(
  model: FileModel,
  config: ResolveConfig,
): ResolvedFiles {
  const frameworkFiles: string[] = [];
  const frameworkDirs: string[] = [];
  const seedFiles: string[] = [];
  const featureSet = new Set(config.features ?? []);

  for (const editor of config.editors) {
    const ec = EDITOR_CONFIGS[editor];
    if (!ec) continue;

    // ── Rules ──
    for (const rule of model.rules) {
      frameworkFiles.push(
        normalizePath(`${ec.targetDir}/${rule}${ec.targetExt}`),
      );
    }

    // ── Prompts ──
    for (const prompt of model.prompts) {
      if (ec.commands) {
        frameworkFiles.push(
          normalizePath(`${ec.commands.targetDir}/archi.${prompt}.md`),
        );
      } else {
        frameworkFiles.push(
          normalizePath(
            `${config.docDir}/prompts/${editor}/archi.${prompt}.md`,
          ),
        );
      }
    }

    // ── Skills (IDE 目录) ──
    if (ec.skills) {
      for (const skill of model.skills) {
        frameworkDirs.push(normalizePath(`${ec.skills.targetDir}/${skill}`));
      }
    }
  }

  // 无 skills 支持的 editor → skills 部署到 docDir/skills/
  const hasNonSkillEditor = config.editors.some(
    (e) => !EDITOR_CONFIGS[e]?.skills,
  );
  if (hasNonSkillEditor) {
    for (const skill of model.skills) {
      frameworkDirs.push(normalizePath(`${config.docDir}/skills/${skill}`));
    }
  }

  // ── Doc Templates ──
  for (const tmpl of model.docTemplates) {
    frameworkFiles.push(normalizePath(`${config.docDir}/templates/${tmpl}`));
  }

  // ── Global Docs (framework-owned references, refreshed on update) ──
  for (const doc of model.globalDocs) {
    frameworkFiles.push(
      normalizePath(`${config.docDir}/global/references/${doc}`),
    );
  }

  // ── Global Seeds ──
  for (const seed of model.globalSeeds) {
    if (typeof seed === "string") {
      seedFiles.push(normalizePath(`${config.docDir}/global/${seed}`));
    } else if (featureSet.has(seed.feature)) {
      seedFiles.push(normalizePath(`${config.docDir}/global/${seed.file}`));
    }
  }

  // ── 骨架目录 ──
  const scaffoldDirs = [
    normalizePath(`${config.docDir}/tasks`),
    normalizePath(`${config.docDir}/refs`),
    normalizePath(`${config.docDir}/scripts`),
  ];

  return { frameworkFiles, frameworkDirs, seedFiles, scaffoldDirs };
}

/**
 * 扫描所有编辑器的 Architext 管理文件路径（用于 update 清理和 uninstall）。
 * 与 resolveFiles 的区别：editors 固定为全量，features 固定为全量，
 * 返回的是"磁盘上可能存在的所有 Architext 文件"而非"当前配置期望的文件"。
 *
 * @param model 文件模型
 * @param docDir 文档目录
 * @returns 所有可能存在的 Architext 文件路径分类清单
 */
export function resolveAllPossibleFiles(
  model: FileModel,
  docDir: string,
): ResolvedFiles {
  return resolveFiles(model, {
    editors: SUPPORTED_EDITORS,
    docDir,
    features: [],
  });
}

/** @fileoverview 定义 Architext 全局规则常量，包括文件路径结构、占位符定义以及编辑器配置映射。 */
import type {
  EditorRuleConfig,
  ProjectFeature,
  ProjectType,
  SupportedEditor,
} from "../types/index.ts";

export const FALLBACK_RULE_FILES = [
  "00_system.md",
  "01_workflow.md",
  "02_tech_stack.md",
  "03_data_governance.md",
  "90_custom_rules.md",
  "99_context_glue.md",
];

export const GLOBAL_RULES = {
  // 默认文档目录
  DEFAULT_DOC_DIR: ".architext",

  // 核心目录结构定义
  PATHS: {
    DOCS_SOURCE: "docs",
    RULES_SOURCE: "rules",
    RULES_TARGET: "rules",
    PROMPTS_SOURCE: "docs/prompts",
    BRIEFS_SOURCE: "briefs",
  },

  // 占位符定义
  PLACEHOLDERS: {
    DOCS_DIR: "[[__DOCS_DIR__]]",
    RULES_DIR: "[[__RULES_DIR__]]",
  },
} as const;

export const LANGUAGE_CONFIGS = {
  zh: {
    label: "中文",
  },
  "zh-Hant": {
    label: "中文（繁体）",
  },
  en: {
    label: "English",
  },
} as const;

export const EDITOR_CONFIGS: Record<SupportedEditor, EditorRuleConfig> = {
  cursor: {
    label: "Cursor",
    targetDir: ".cursor/rules",
    targetExt: ".mdc",
    commands: {
      targetDir: ".cursor/commands",
    },
  },
  windsurf: {
    label: "Windsurf",
    targetDir: ".windsurf/rules",
    targetExt: ".md",
  },
  trae: {
    label: "Trae",
    targetDir: ".trae/rules",
    targetExt: ".md",
  },
  vscode: {
    label: "VS Code",
    targetDir: ".github/instructions",
    targetExt: ".instructions.md",
  },
};

export const SUPPORTED_EDITORS = Object.keys(
  EDITOR_CONFIGS,
) as SupportedEditor[];

export interface ProjectTypePreset {
  label: string;
  features: ProjectFeature[];
}

export const PROJECT_TYPE_PRESETS: Record<ProjectType, ProjectTypePreset> = {
  web: { label: "Web 应用", features: ["ui", "data"] },
  api: { label: "API 服务", features: ["api", "data"] },
  cli: { label: "CLI 工具", features: ["cli"] },
  lib: { label: "库 / SDK", features: ["lib"] },
  fullstack: { label: "全栈应用", features: ["ui", "data", "api"] },
  hybrid: {
    label: "混合 (全部特征)",
    features: ["ui", "data", "cli", "lib", "api"],
  },
};

export const SUPPORTED_PROJECT_TYPES = Object.keys(
  PROJECT_TYPE_PRESETS,
) as ProjectType[];

/** 模板源目录中的骨架文件名 */
export const BRIEF_BASE_NAME = "_base.md";
/** 方向模块注册表文件名，包含所有 @tech:tag / @style:tag 片段 */
export const BRIEF_MODULES_NAME = "_modules.md";
/** 拼装后输出到项目根目录的文件名 */
export const BRIEF_OUTPUT_NAME = "project-brief.md";

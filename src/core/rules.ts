/**
 * ---
 * description: 定义 Architext 全局规则常量，包括文件路径结构、占位符定义以及编辑器配置映射。
 * ---
 */
import type { EditorRuleConfig, SupportedEditor } from "../types/index.ts";

export const FALLBACK_RULE_FILES = [
  "00_system.md",
  "01_workflow.md",
  "02_tech_stack.md",
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

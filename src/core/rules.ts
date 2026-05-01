/** @fileoverview 定义 Architext 全局规则常量，包括文件路径结构、占位符定义以及编辑器配置映射。 */
import type {
  EditorRuleConfig,
  ProjectFeature,
  SupportedEditor,
} from "../types/index.ts";

export const GLOBAL_RULES = {
  // 默认文档目录
  DEFAULT_DOC_DIR: ".architext",

  // 核心目录结构定义
  PATHS: {
    RULES_SOURCE: "rules",
    RULES_TARGET: "rules",
    PROMPTS_SOURCE: "prompts",
    BRIEFS_SOURCE: "briefs",
    SKILLS_SOURCE: "skills",
    // 非 Skill 编辑器的 Skill 文件落地目录（相对 docDir）
    SKILLS_DOC_TARGET: "skills",
  },

  // 占位符定义
  PLACEHOLDERS: {
    DOCS_DIR: "[[__DOCS_DIR__]]",
    PROJECT_TYPE: "[[__PROJECT_TYPE__]]",
    /** 协议文件所在目录，按 editor 替换：有 commands 用 commands 目录，无 commands 用 docDir/prompts/{editor} */
    PROMPTS_PATH: "[[__PROMPTS_PATH__]]",
  },
} as const;

export const LANGUAGE_CONFIGS = {
  zh: {
    label: "中文",
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
    // archi- 前缀与用户 Skills 物理隔离，避免覆盖用户文件
    skills: {
      targetDir: ".cursor/skills",
    },
    subagents: true,
  },
  windsurf: {
    label: "Windsurf",
    targetDir: ".windsurf/rules",
    targetExt: ".md",
    skills: {
      targetDir: ".windsurf/skills",
    },
  },
  trae: {
    label: "Trae",
    targetDir: ".trae/rules",
    targetExt: ".md",
    skills: {
      targetDir: ".trae/skills",
    },
    subagents: true,
  },
  vscode: {
    label: "VS Code",
    targetDir: ".github/instructions",
    targetExt: ".instructions.md",
    skills: {
      targetDir: ".github/skills",
    },
    subagents: true,
  },
  claude: {
    label: "Claude Code",
    targetDir: ".claude/rules",
    targetExt: ".md",
    commands: {
      targetDir: ".claude/commands",
    },
    skills: {
      targetDir: ".claude/skills",
    },
    subagents: true,
  },
  opencode: {
    label: "OpenCode",
    targetDir: ".opencode/rules",
    targetExt: ".md",
    commands: {
      targetDir: ".opencode/commands",
    },
    skills: {
      targetDir: ".opencode/skills",
    },
    subagents: true,
  },
};

export const SUPPORTED_EDITORS = Object.keys(
  EDITOR_CONFIGS,
) as SupportedEditor[];

/**
 * 根据 editor 能力计算协议文件目录路径。
 * - 有 commands：使用 commands.targetDir（如 .cursor/commands）
 * - 无 commands：使用 docDir/prompts/{editor}（如 .architext/prompts/windsurf）
 *
 * @param editor 编辑器类型
 * @param docDir 文档目录
 * @returns 协议文件目录路径
 */
export function getPromptsPathForEditor(
  editor: SupportedEditor,
  docDir: string,
): string {
  const config = EDITOR_CONFIGS[editor];
  if (config?.commands) {
    return config.commands.targetDir;
  }
  return `${docDir}/prompts/${editor}`;
}

export interface FeatureOption {
  value: ProjectFeature;
  label: string;
  hint: string;
}

export const FEATURE_OPTIONS: FeatureOption[] = [
  { value: "ui", label: "ui", hint: "有用户界面（Web/移动端/桌面端/小程序）" },
  { value: "data", label: "data", hint: "有数据层（数据库/ORM/本地存储）" },
  { value: "api", label: "api", hint: "有 HTTP/RPC/GraphQL 接口" },
  { value: "cli", label: "cli", hint: "有命令行入口" },
  { value: "lib", label: "lib", hint: "作为库/SDK/NPM 包发布" },
  { value: "mobile", label: "mobile", hint: "移动端（RN/Flutter/Expo）" },
  { value: "desktop", label: "desktop", hint: "桌面端（Electron/Tauri）" },
  { value: "miniapp", label: "miniapp", hint: "小程序（微信/支付宝/uni-app）" },
  {
    value: "extension",
    label: "extension",
    hint: "浏览器扩展（Chrome/Firefox）",
  },
  { value: "realtime", label: "realtime", hint: "实时/WebSocket/协作" },
  { value: "ai", label: "ai", hint: "AI Agent / MCP" },
];

/**
 * 文档模板注册表：供 `npx archi template <name>` 使用。
 * 新增模板时在此注册，无需修改 template 命令逻辑。
 */
export interface TemplateEntry {
  /** 模板源文件名（位于 templates/<lang>/templates/ 或 docDir/templates/） */
  file: string;
  /** 输出到项目根目录的文件名 */
  output: string;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateEntry> = {
  "scope-brief": {
    file: "scope-brief.template.md",
    output: "scope-brief.md",
  },
};

/** 模板源目录中的骨架文件名 */
export const BRIEF_BASE_NAME = "_base.md";
/** 方向模块注册表文件名，包含所有 @tech:tag / @style:tag 片段 */
export const BRIEF_MODULES_NAME = "_modules.md";
/** 拼装后输出到项目根目录的文件名 */
export const BRIEF_OUTPUT_NAME = "project-brief.md";
/** Brief 附件资产目录名，与 project-brief.md 同级 */
export const BRIEF_ASSETS_DIR = "brief-assets";

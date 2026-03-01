/** @fileoverview 定义 Architext 全局规则常量，包括文件路径结构、占位符定义以及编辑器配置映射。 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  EditorRuleConfig,
  ProjectFeature,
  SupportedEditor,
} from "../types/index.ts";

export const FALLBACK_RULE_FILES = [
  "00_system.md",
  "01_workflow.md",
  "02_tech_stack.md",
  "03_data_governance.md",
  "04_cli_tools.md",
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
    SKILLS_SOURCE: "skills",
    // 非 Skill 编辑器的 Skill 文件落地目录（相对 docDir）
    SKILLS_DOC_TARGET: "skills",
  },

  // 占位符定义
  PLACEHOLDERS: {
    DOCS_DIR: "[[__DOCS_DIR__]]",
    PROJECT_TYPE: "[[__PROJECT_TYPE__]]",
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
 * 条件性全局文件映射：文件名 → 要求的 feature。
 * 仅当 features 包含对应项时才部署该文件；不在此表的文件始终部署。
 */
export const CONDITIONAL_GLOBAL_FILES: Partial<Record<string, ProjectFeature>> =
  {
    "api_snapshot.json": "api",
    "env_registry.json": "api",
    "command_api.json": "cli",
    "public_api.json": "lib",
    "design_tokens.json": "ui",
    "data_snapshot.json": "data",
  };

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
  /** 模板源文件名（位于 templates/<lang>/docs/templates/ 或 docDir/templates/） */
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

/**
 * 编辑器能力标记集，用于驱动模板中的条件化内容解析。
 *
 * 模板文件中可嵌入以下能力标记（init 时按实际 IDE 能力展开）：
 *
 * - `[[SKILL: name|args]]`：Specialist Skill（协作型），同上下文执行
 * - `[[SUBAGENT: name|args]]`：Reviewer Skill（审查型），独立子代理执行
 * - `[[NO-SKILL: desc]]`：无 Skill 支持 → 展开为 `desc`；有 Skill → 移除
 *
 * SUBAGENT 降级策略：hasSubagents=false 时降级为同上下文 Skill 调用。
 */
export interface EditorCapabilities {
  hasSkills: boolean;
  hasSubagents: boolean;
}

/**
 * 根据编辑器能力集，解析模板中所有能力标记。
 *
 * 处理顺序：`[[INCLUDE:]]` → `[[SUBAGENT:]]` → `[[SKILL:]]` → `[[NO-SKILL:]]`
 *
 * @param content 模板文件内容（已完成常规变量替换）
 * @param capabilities 目标编辑器能力集
 * @param includeBaseDir 共享片段的基础目录（`docs/` 源目录），用于解析 `[[INCLUDE: path]]`
 */
export function resolveCapabilityRefs(
  content: string,
  capabilities: EditorCapabilities,
  includeBaseDir?: string,
): string {
  // [[INCLUDE: path]]：部署时展开为目标文件的完整内容
  if (includeBaseDir) {
    content = content.replace(
      /\[\[INCLUDE: ([^\]]+)\]\]/g,
      (_match, relPath: string) => {
        const fragmentPath = path.join(includeBaseDir, relPath.trim());
        try {
          return readFileSync(fragmentPath, "utf-8").trim();
        } catch {
          return `<!-- INCLUDE NOT FOUND: ${relPath.trim()} -->`;
        }
      },
    );
  }

  // [[SUBAGENT: name|args]]：Reviewer Skill，优先子代理执行
  //   hasSubagents=true → 展开为子代理启动指令（认知隔离）
  //   hasSubagents=false → 降级为同上下文 Skill 调用
  content = content.replace(
    /\[\[SUBAGENT: ([^|]+)\|(.+?)\]\]/g,
    (_match, skillName: string, args: string) => {
      const name = skillName.trim();
      const argsText = args.trim();
      if (capabilities.hasSubagents) {
        return (
          `**[子代理]** 启动独立子代理执行以下审查（禁在当前上下文内联执行）。` +
          `子代理读取 \`skills/${name}/SKILL.md\` 作为执行指令，` +
          `在全新上下文中运行，完成后将结果返回当前流程。参数：${argsText}`
        );
      }
      if (capabilities.hasSkills) {
        return `请读取 Skill \`skills/${name}/SKILL.md\` 并在当前上下文中按其指令执行。参数：${argsText}`;
      }
      return "";
    },
  );

  // [[SKILL: name|args]]：Specialist Skill（协作型），同上下文执行
  content = content.replace(
    /\[\[SKILL: ([^|]+)\|(.+?)\]\]/g,
    (_match, skillName: string, args: string) =>
      capabilities.hasSkills
        ? `请使用 Skill 工具调用 \`${skillName.trim()}\`，参数：${args.trim()}`
        : "",
  );

  // [[NO-SKILL: desc]]：无 Skill → 展开为 desc；有 Skill → 移除
  content = content.replace(
    /\[\[NO-SKILL: ([^\]]+)\]\]/g,
    (_match, desc: string) => (capabilities.hasSkills ? "" : desc),
  );

  return content;
}

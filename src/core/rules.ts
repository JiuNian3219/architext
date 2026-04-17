/** @fileoverview 定义 Architext 全局规则常量，包括文件路径结构、占位符定义以及编辑器配置映射。 */
import { readFileSync } from "node:fs";
import path from "node:path";
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
/** Brief 附件资产目录名，与 project-brief.md 同级 */
export const BRIEF_ASSETS_DIR = "brief-assets";

/**
 * 编辑器能力标记集，用于驱动模板中的条件化内容解析。
 *
 * 模板文件中可嵌入以下能力标记（init 时按实际 IDE 能力展开）：
 *
 * - `[[SKILL: name|args]]`：Specialist Skill（协作型），同上下文执行
 * - `[[SUBAGENT: name|args]]`：Reviewer Skill（审查型），独立子代理执行
 * - `[[NO-SKILL: desc]]`：无 Skill 支持 → 展开为 `desc`；有 Skill → 移除
 * - `[[NO-SUBAGENT: desc]]`：无 Subagent 支持 → 展开为 `desc`；有 Subagent → 移除
 * - `[[WHEN: features | desc]]...[[/WHEN]]`：条件渲染块，features 匹配时展开为 desc + 内容
 *
 * SUBAGENT 降级策略：hasSubagents=false 时降级为同上下文 Skill 调用。
 */
export interface EditorCapabilities {
  hasSkills: boolean;
  hasSubagents: boolean;
  hasCommands: boolean;
}

/**
 * 条件渲染上下文，用于 `[[WHEN:]]` 指令的条件判断。
 */
export interface WhenContext {
  /** 项目特征标签（来自 architext.json 的 features 字段） */
  features: ProjectFeature[];
}

/**
 * 检查项目特征是否满足 WHEN 条件。
 *
 * @param conditionFeatures 条件中的特征标签（逗号分隔，如 "ui,data"）
 * @param projectFeatures 项目实际的特征标签
 * @returns true 表示所有条件特征都在项目特征中
 */
function checkWhenCondition(
  conditionFeatures: string,
  projectFeatures: ProjectFeature[],
): boolean {
  const requiredFeatures = conditionFeatures
    .split(",")
    .map((f) => f.trim() as ProjectFeature);

  // 所有条件特征都必须在项目特征中
  return requiredFeatures.every((f) => projectFeatures.includes(f));
}

/**
 * 解析 `[[WHEN: features | desc]]` 条件渲染指令。
 *
 * 语法：
 * - `[[WHEN: ui | 仅UI项目: ]]` — 单特征
 * - `[[WHEN: ui,data | 仅UI+Data项目: ]]` — 多特征（逗号分隔，必须全部匹配）
 *
 * 展开规则：
 * - 条件匹配 → 展开为 `desc`
 * - 条件不匹配 → 移除整块
 *
 * @param content 模板文件内容
 * @param whenContext 条件渲染上下文（包含项目特征）
 * @returns 处理后的内容
 */
export function resolveWhenRefs(
  content: string,
  whenContext: WhenContext,
): string {
  // [[WHEN: features | desc]] — 条件渲染
  // 使用 (?:(?!\]\]).)*? 匹配任意字符直到遇到 ]]，允许 desc 包含单个 ]
  content = content.replace(
    /\[\[WHEN:\s*([^|]+)\s*\|\s*((?:(?!\]\]).)*?)\s*\]\]/g,
    (_match, features: string, desc: string) => {
      if (checkWhenCondition(features, whenContext.features)) {
        // 条件匹配：展开为 desc
        return desc;
      }
      // 条件不匹配：移除
      return "";
    },
  );

  return content;
}

/**
 * 根据编辑器能力集，解析模板中所有能力标记。
 *
 * 处理顺序：`[[INCLUDE:]]` → `[[WHEN:]]` → `[[SUBAGENT:]]` → `[[NO-SUBAGENT:]]` → `[[SKILL:]]` → `[[NO-SKILL:]]` → `[[NO-COMMANDS:]]`
 *
 * @param content 模板文件内容（已完成常规变量替换）
 * @param capabilities 目标编辑器能力集
 * @param includeBaseDir 共享片段的基础目录（`docs/` 源目录），用于解析 `[[INCLUDE: path]]`
 * @param whenContext 条件渲染上下文（可选，用于 `[[WHEN:]]` 指令）
 */
export function resolveCapabilityRefs(
  content: string,
  capabilities: EditorCapabilities,
  includeBaseDir?: string,
  whenContext?: WhenContext,
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

  // [[WHEN: features | desc]]...[[/WHEN]]：条件渲染块
  if (whenContext) {
    content = resolveWhenRefs(content, whenContext);
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

  // [[NO-SUBAGENT: desc]]：无 Subagent → 展开为 desc；有 Subagent → 移除
  // 用于 SUBAGENT 降级时的提示文本：有子代理能力时移除，无子代理时展开
  content = content.replace(
    /\[\[NO-SUBAGENT:\s*((?:(?!\]\]).)*?)\s*\]\]/g,
    (_match, desc: string) => (capabilities.hasSubagents ? "" : desc),
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
    /\[\[NO-SKILL:\s*((?:(?!\]\]).)*?)\s*\]\]/g,
    (_match, desc: string) => (capabilities.hasSkills ? "" : desc),
  );

  // [[NO-COMMANDS: desc]]：无 Commands → 展开为 desc；有 Commands → 移除
  // 用于 00_system.md 中的路由表：不支持 Commands 的 IDE 需要路由表，支持的则不需要
  content = content.replace(
    /\[\[NO-COMMANDS:\s*([\s\S]*?)\s*\]\]/g,
    (_match, desc: string) => (capabilities.hasCommands ? "" : desc.trim()),
  );

  return content;
}

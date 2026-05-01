/** @fileoverview 统一管理项目核心领域模型与配置类型定义，确保类型系统的单一真理源 (Single Source of Truth)。 */

/**
 * 支持的语言类型
 */
export type LocaleLang = "zh" | "en";

/**
 * 支持的编辑器类型
 */
export type SupportedEditor =
  | "trae"
  | "cursor"
  | "windsurf"
  | "vscode"
  | "claude"
  | "opencode";

/**
 * 项目特征标签（内部驱动 Brief 模板拼装的原子单元）
 */
export type ProjectFeature =
  | "ui"
  | "data"
  | "cli"
  | "lib"
  | "api"
  | "mobile"
  | "desktop"
  | "extension"
  | "miniapp"
  | "realtime"
  | "ai";

/**
 * Commands 配置（用于支持编辑器的自定义命令功能）
 */
export interface EditorCommandsConfig {
  /** Commands 目标目录 (相对于项目根目录) */
  targetDir: string;
}

/**
 * Agent Skills 配置（用于支持 Agent Skills 开放标准的编辑器）
 */
export interface EditorSkillsConfig {
  /** Skills 目标目录 (相对于项目根目录，Architext 专属命名前缀隔离用户 Skills) */
  targetDir: string;
}

/**
 * 编辑器规则映射配置
 */
export interface EditorRuleConfig {
  /** 目标规则目录 (相对于项目根目录) */
  targetDir: string;
  /** 目标文件扩展名 */
  targetExt: string;
  /** 编辑器名称标识 */
  label: string;
  /** 编辑器描述 */
  description?: string;
  /** Commands 配置（可选，仅部分编辑器支持） */
  commands?: EditorCommandsConfig;
  /** Agent Skills 配置（可选，仅支持 Agent Skills 标准的编辑器） */
  skills?: EditorSkillsConfig;
  /** 是否支持子代理（独立上下文的 Agent 实例） */
  subagents?: boolean;
}

/**
 * architext.json 配置文件结构
 */
export interface ArchitextConfig {
  language: LocaleLang;
  docDir: string;
  features?: ProjectFeature[];
  roadmap?: string;
  editors: SupportedEditor[];
  version?: string;
  /** 上次 init/update 时的框架结构版本（独立整数，仅文件布局变化时递增） */
  structureVersion?: number;
  updatedAt: string;
  /**
   * 标记 opencode.json 的 instructions 中 .opencode/rules/*.md 是否为 Architext 添加。
   * 仅当为 true 时，uninstall 才会移除该路径；用户原有配置不会被误删。
   */
  opencodeInstructionsAdded?: boolean;
  /**
   * 标记 opencode.json 的 hooks 是否为 Architext 添加。
   */
  opencodeNotifyAdded?: boolean;
  /**
   * 标记 .claude/settings.json 的 hooks 是否为 Architext 添加。
   */
  claudeNotifyAdded?: boolean;
  /**
   * 是否启用桌面通知功能。
   * 启用后会自动配置所选 IDE 的 hooks，在任务完成时发送桌面通知。
   * 默认: true
   */
  notify?: boolean;
}

/**
 * Init 命令参数选项
 */
export interface InitOptions {
  editor?: string;
  language?: LocaleLang;
  doc?: string;
  type?: string;
  yes?: boolean;
  brief?: boolean;
  /** 是否启用桌面通知，默认 true */
  notify?: boolean;
}

/**
 * Init 命令交互结果配置
 * (Prompter -> Scaffolder)
 */
export interface InitConfig {
  language: LocaleLang;
  editors: SupportedEditor[];
  docDir: string;
  features: ProjectFeature[];
  /** 是否生成 project-brief.md；生成后填写项目需求，供 /archi.init 使用 */
  generateBrief?: boolean;
  /** 是否启用桌面通知，默认 true */
  notify?: boolean;
}

/**
 * Task 命令参数选项
 */
export interface TaskCommandOptions {
  status?: string;
  check?: boolean;
}

/**
 * 文件操作类型枚举
 * 避免使用 Magic Strings
 */
export enum FileOpType {
  Template = "template",
  Copy = "copy",
}

/**
 * 基础文件操作接口
 */
interface BaseFileOperation {
  src: string;
  dest: string;
  /** 操作分组 (用于日志展示和逻辑分块) */
  group?: string;
}

/**
 * 模板处理操作
 */
export interface TemplateOperation extends BaseFileOperation {
  type: FileOpType.Template;
  /** 变量替换映射 (必须存在，即使为空) */
  replacements: Record<string, string>;
  /**
   * 可选的后处理函数，在标准变量替换完成后执行。
   * 用于条件性内容解析（如 Skill 引用、MCP 引用），避免将逻辑耦合到 replacements 映射中。
   */
  resolver?: (content: string) => string;
}

/**
 * 直接复制操作
 */
export interface CopyOperation extends BaseFileOperation {
  type: FileOpType.Copy;
}

/**
 * 文件操作任务定义 (Discriminated Union)
 * 用于 Plan-Resolve-Execute 模式
 */
export type FileOperation = TemplateOperation | CopyOperation;

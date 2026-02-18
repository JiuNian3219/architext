/** @fileoverview 统一管理项目核心领域模型与配置类型定义，确保类型系统的单一真理源 (Single Source of Truth)。 */

/**
 * 支持的语言类型
 */
export type LocaleLang = "zh" | "zh-Hant" | "en";

/**
 * 支持的编辑器类型
 */
export type SupportedEditor = "trae" | "cursor" | "windsurf" | "vscode";

/**
 * Commands 配置（用于支持编辑器的自定义命令功能）
 */
export interface EditorCommandsConfig {
  /** Commands 目标目录 (相对于项目根目录) */
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
}

/**
 * architext.json 配置文件结构
 */
export interface ArchitextConfig {
  language: string;
  docDir: string;
  roadmap?: string;
  editors: SupportedEditor[];
  version?: string;
  updatedAt: string;
  /** 最近一次生成时的配置快照 */
  lastScaffold?: InitConfig;
}

/**
 * Init 命令参数选项
 */
export interface InitOptions {
  editor?: string;
  language?: LocaleLang;
  doc?: string;
}

/**
 * Init 命令交互结果配置
 * (Prompter -> Scaffolder)
 */
export interface InitConfig {
  language: LocaleLang;
  editors: SupportedEditor[];
  docDir: string;
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

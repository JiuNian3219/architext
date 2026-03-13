/** @fileoverview architext.json 的运行时结构校验，loadConfig 在解析后必须通过此 Schema 才能返回。 */
import { z } from "zod";

/** 支持的编辑器类型 */
const SupportedEditorSchema = z.enum([
  "trae",
  "cursor",
  "windsurf",
  "vscode",
  "claude",
  "opencode",
]);

/** 项目特征标签 */
const ProjectFeatureSchema = z.enum([
  "ui",
  "data",
  "cli",
  "lib",
  "api",
  "mobile",
  "desktop",
  "extension",
  "miniapp",
  "realtime",
  "ai",
]);

/** 支持的语言（与 LocaleLang 保持一致） */
const LocaleLangSchema = z.enum(["zh", "en"]);

/** architext.json 完整结构 */
export const ArchitextConfigSchema = z.object({
  language: LocaleLangSchema,
  docDir: z.string().min(1),
  features: z.array(ProjectFeatureSchema).optional(),
  roadmap: z.string().optional(),
  editors: z.array(SupportedEditorSchema).min(1),
  version: z.string().optional(),
  /** 上次 init/update 时的框架结构版本（独立整数，仅文件布局变化时递增） */
  structureVersion: z.number().int().positive().optional(),
  updatedAt: z.string().min(1),
  /** 标记 .opencode/rules/*.md 是否为 Architext 添加，uninstall 时据此决定是否移除 */
  opencodeInstructionsAdded: z.boolean().optional(),
  /** 标记 opencode.json 的 hooks 是否为 Architext 添加 */
  opencodeNotifyAdded: z.boolean().optional(),
  /** 标记 .claude/settings.json 的 hooks 是否为 Architext 添加 */
  claudeNotifyAdded: z.boolean().optional(),
  /** 是否启用桌面通知功能，默认 true */
  notify: z.boolean().optional(),
});

export type ArchitextConfigInferred = z.infer<typeof ArchitextConfigSchema>;

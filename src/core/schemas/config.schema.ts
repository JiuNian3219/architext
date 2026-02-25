/** @fileoverview architext.json 的运行时结构校验，loadConfig 在解析后必须通过此 Schema 才能返回。 */
import { z } from "zod";

/** 支持的编辑器类型 */
const SupportedEditorSchema = z.enum(["trae", "cursor", "windsurf", "vscode"]);

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

/** Init 命令配置快照（lastScaffold 字段） */
const InitConfigSchema = z.object({
  language: z.enum(["zh", "zh-Hant", "en"]),
  editors: z.array(SupportedEditorSchema).min(1),
  docDir: z.string().min(1),
  features: z.array(ProjectFeatureSchema),
  projectType: z.string().optional(),
});

/** 支持的语言（与 LocaleLang 保持一致） */
const LocaleLangSchema = z.enum(["zh", "zh-Hant", "en"]);

/** architext.json 完整结构 */
export const ArchitextConfigSchema = z.object({
  language: LocaleLangSchema,
  docDir: z.string().min(1),
  features: z.array(ProjectFeatureSchema).optional(),
  roadmap: z.string().optional(),
  editors: z.array(SupportedEditorSchema).min(1),
  version: z.string().optional(),
  updatedAt: z.string().min(1),
  lastScaffold: InitConfigSchema.optional(),
});

export type ArchitextConfigInferred = z.infer<typeof ArchitextConfigSchema>;

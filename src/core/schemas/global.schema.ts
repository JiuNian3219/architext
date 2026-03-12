/**
 * @fileoverview Tier 2 宽松 Schema: 全局参考数据文件的结构守卫。
 * 这些文件主要供 AI 读取，CLI 不直接消费其内部字段。
 * 仅校验顶层结构是否存在，数组 item 内部允许自由扩展字段。
 */
import { z } from "zod";

/**
 * 通用的可扩展记录 — 允许任意 key-value。
 * 用于 Tier 2 数组 item，保证 AI/用户可自行扩展字段。
 * Zod v4: z.record 需显式指定 key 和 value schema。
 */
const ExtensibleRecord = z.record(z.string(), z.unknown());

/**
 * 宽松 object — 仅校验必须 key 存在，允许额外 key。
 * Zod v4: 使用 .catchall(z.unknown()) 替代 .passthrough()。
 */

// ── dictionary.json ──

export const DictionarySchema = z
  .object({
    entities: z.array(ExtensibleRecord),
    verbs: z.array(ExtensibleRecord),
  })
  .catchall(z.unknown());

// ── error_codes.json ──

export const ErrorCodesSchema = z
  .object({
    businessErrors: z.array(ExtensibleRecord),
  })
  .catchall(z.unknown());

// ── data_snapshot.json ──

export const DataSnapshotSchema = z
  .object({
    models: z.array(ExtensibleRecord),
  })
  .catchall(z.unknown());

// ── design_tokens.json ──

export const DesignTokensSchema = z
  .object({
    semanticTokens: z.record(z.string(), z.unknown()),
  })
  .catchall(z.unknown());

// ── map.json ──

export const MapSchema = z
  .object({
    directoryMapping: z.array(z.unknown()).optional(),
    logicalTopology: z.array(z.unknown()).optional(),
    criticalUserJourneys: z.array(z.unknown()).optional(),
    featureRelations: z.array(z.unknown()).optional(),
  })
  .catchall(z.unknown());

/** Tier 2 文件名 → Schema 的映射，供 doctor/validate 批量校验使用 */
export const GLOBAL_SCHEMAS: Record<string, z.ZodTypeAny> = {
  "dictionary.json": DictionarySchema,
  "error_codes.json": ErrorCodesSchema,
  "data_snapshot.json": DataSnapshotSchema,
  "design_tokens.json": DesignTokensSchema,
  "map.json": MapSchema,
};

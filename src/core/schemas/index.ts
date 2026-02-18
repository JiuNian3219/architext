/** @fileoverview Schema 模块入口，提供 validateJson 工具函数和所有 Schema 的统一导出。 */
import { ZodError, type ZodType } from "zod";
import { AppError } from "../errors.ts";

// ── Re-exports ──
export {
  RoadmapDataSchema,
  TaskSchema,
  TaskStatusSchema,
} from "./roadmap.schema.ts";
export { PlanDataSchema } from "./plan.schema.ts";
export {
  GLOBAL_SCHEMAS,
  DictionarySchema,
  ErrorCodesSchema,
  DataSnapshotSchema,
  DesignTokensSchema,
  MapSchema,
} from "./global.schema.ts";

/**
 * 使用 Zod Schema 校验数据，校验失败时抛出格式友好的 AppError。
 *
 * @param schema Zod Schema
 * @param data 待校验的数据
 * @param fileName 文件名（用于错误提示定位）
 * @returns 校验通过的类型安全数据
 */
export function validateJson<T>(
  schema: ZodType,
  data: unknown,
  fileName: string,
): T {
  try {
    return schema.parse(data) as T;
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      throw new AppError(
        `${fileName} schema validation failed:\n${details}`,
        "SCHEMA_VALIDATION_ERROR",
        true,
      );
    }
    throw err;
  }
}

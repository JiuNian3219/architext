/** @fileoverview Roadmap JSON 解析器。从 roadmap.json 加载并通过 Zod Schema 校验后返回类型安全的 RoadmapData。 */
import fs from "fs-extra";
import { RoadmapDataSchema, validateJson } from "../schemas/index.ts";
import type { RoadmapData } from "./types.ts";

export class RoadmapParser {
  /**
   * 解析并校验 roadmap.json 文件。
   * 使用 Zod Schema 做运行时校验，确保数据结构完整且字段合法。
   *
   * @param filePath roadmap.json 的绝对路径
   * @returns 校验通过的 RoadmapData
   * @throws {AppError} Schema 校验失败时抛出友好错误
   */
  async parse(filePath: string): Promise<RoadmapData> {
    const raw = await fs.readJSON(filePath);
    return validateJson<RoadmapData>(RoadmapDataSchema, raw, "roadmap.json");
  }
}

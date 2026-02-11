/** @fileoverview 负责解析 Roadmap 文件路径，优先读取配置，兜底查找默认位置。 */
import fs from "fs-extra";
import path from "path";
import { loadConfig } from "../../../core/config.ts";
import { RoadmapNotFoundError } from "../../../core/errors.ts";

/** Roadmap 文件的默认候选路径（按优先级排列） */
const DEFAULT_CANDIDATES = [
  ".architext/global/00_roadmap.md",
  "global/00_roadmap.md",
  "docs/global/00_roadmap.md",
  "00_roadmap.md",
];

/**
 * 解析 Roadmap 文件的绝对路径。
 * 查找优先级：architext.json#roadmap > docDir/global/00_roadmap.md > 默认候选路径
 *
 * @param cwd 工作目录，默认 process.cwd()
 * @throws {RoadmapNotFoundError} 所有候选路径均不存在时
 */
export async function resolveRoadmapPath(
  cwd: string = process.cwd(),
): Promise<string> {
  const config = await loadConfig(cwd);

  // 1. 优先使用配置中显式指定的 roadmap 路径
  if (config?.roadmap) {
    const explicit = path.resolve(cwd, config.roadmap);
    if (await fs.pathExists(explicit)) return explicit;
  }

  // 2. 基于 docDir 拼接标准路径
  if (config?.docDir) {
    const candidate = path.join(cwd, config.docDir, "global/00_roadmap.md");
    if (await fs.pathExists(candidate)) return candidate;
  }

  // 3. 遍历默认候选路径
  for (const rel of DEFAULT_CANDIDATES) {
    const candidate = path.join(cwd, rel);
    if (await fs.pathExists(candidate)) return candidate;
  }

  throw new RoadmapNotFoundError();
}

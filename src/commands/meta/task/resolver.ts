/** @fileoverview 负责解析 Roadmap 文件路径，优先读取配置，兜底查找默认位置。 */
import fs from "fs-extra";
import path from "path";
import { loadConfig } from "../../../core/config.ts";
import { resolveDocDir } from "../../../core/doc-dir.ts";
import { RoadmapNotFoundError } from "../../../core/errors.ts";

/** 无 docDir 时的扁平候选路径（根目录下的 roadmap 文件） */
const FLAT_CANDIDATES = ["global/roadmap.json", "roadmap.json"];

/**
 * 解析 Roadmap 文件的绝对路径。
 * 查找优先级：architext.json#roadmap > docDir/global/roadmap.json > resolveDocDir > 扁平路径
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

  // 2. 基于 docDir 拼接标准路径（配置优先）
  if (config?.docDir) {
    const candidate = path.join(cwd, config.docDir, "global/roadmap.json");
    if (await fs.pathExists(candidate)) return candidate;
  }

  // 3. 使用统一的 resolveDocDir
  const docDir = await resolveDocDir(cwd);
  if (docDir) {
    const candidate = path.join(docDir, "global/roadmap.json");
    if (await fs.pathExists(candidate)) return candidate;
  }

  // 4. 扁平候选路径（无标准 docDir 结构时）
  for (const rel of FLAT_CANDIDATES) {
    const candidate = path.join(cwd, rel);
    if (await fs.pathExists(candidate)) return candidate;
  }

  throw new RoadmapNotFoundError();
}

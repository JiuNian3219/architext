/** @fileoverview 共享的文档目录 (docDir) 解析逻辑，供 task、plan 等命令复用。 */
import fs from "fs-extra";
import path from "path";
import { loadConfig } from "./config.ts";

/** docDir 的默认候选路径（按优先级排列） */
const DEFAULT_DOC_DIRS = [".architext"];

/**
 * 解析项目文档目录的绝对路径。
 * 查找优先级：architext.json#docDir > 默认候选路径
 *
 * @param cwd 工作目录，默认 process.cwd()
 * @returns 文档目录的绝对路径，未找到时返回 null
 */
export async function resolveDocDir(
  cwd: string = process.cwd(),
): Promise<string | null> {
  const config = await loadConfig(cwd);

  // 优先使用配置中的 docDir
  if (config?.docDir) {
    const candidate = path.resolve(cwd, config.docDir);
    if (await fs.pathExists(candidate)) return candidate;
  }

  // 遍历默认候选路径
  for (const d of DEFAULT_DOC_DIRS) {
    const candidate = path.resolve(cwd, d);
    if (await fs.pathExists(candidate)) return candidate;
  }

  return null;
}

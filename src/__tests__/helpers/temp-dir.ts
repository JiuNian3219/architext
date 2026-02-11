/** @fileoverview 临时目录辅助工具，用于测试中创建和管理临时目录 */

import fs from "fs-extra";
import os from "os";
import path from "path";

/**
 * 创建临时测试目录
 * @param prefix 目录名前缀
 * @returns 临时目录路径
 */
export async function createTempDir(
  prefix = "architext-test-",
): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  return tempDir;
}

/**
 * 清理临时目录
 * @param dirPath 要清理的目录路径
 */
export async function cleanupTempDir(dirPath: string): Promise<void> {
  if (await fs.pathExists(dirPath)) {
    await fs.remove(dirPath);
  }
}

/**
 * 在临时目录中创建测试文件结构
 * @param baseDir 基础目录
 * @param structure 文件结构对象，例如 { "file.txt": "content", "dir": { "nested.txt": "nested" } }
 */
export async function createTestStructure(
  baseDir: string,
  structure: Record<string, unknown>,
): Promise<void> {
  for (const [key, value] of Object.entries(structure)) {
    const fullPath = path.join(baseDir, key);
    if (typeof value === "string") {
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, value, "utf-8");
    } else if (typeof value === "object" && value !== null) {
      await fs.ensureDir(fullPath);
      await createTestStructure(fullPath, value as Record<string, unknown>);
    }
  }
}

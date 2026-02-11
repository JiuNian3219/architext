/** @fileoverview 文件系统 Mock 辅助工具，用于测试中模拟文件系统操作 */

import { vi, type Mock } from "vitest";

/**
 * 创建文件系统的 Mock
 * 返回一个包含常用 fs-extra 方法的 Mock 对象
 */
export function createFsMock() {
  return {
    pathExists: vi.fn<(path: string) => Promise<boolean>>(),
    readFile: vi.fn<(path: string, encoding?: string) => Promise<string>>(),
    writeFile:
      vi.fn<(file: string, data: string, options?: string) => Promise<void>>(),
    readJSON: vi.fn<(file: string) => Promise<unknown>>(),
    writeJSON:
      vi.fn<
        (file: string, object: unknown, options?: unknown) => Promise<void>
      >(),
    readdir: vi.fn<(path: string, options?: unknown) => Promise<string[]>>(),
    copy: vi.fn<(src: string, dest: string) => Promise<void>>(),
    ensureDir: vi.fn<(path: string) => Promise<void>>(),
    remove: vi.fn<(path: string) => Promise<void>>(),
  };
}

/**
 * 重置所有 fs Mock
 */
export function resetFsMock(mock: ReturnType<typeof createFsMock>) {
  Object.values(mock).forEach((fn) => {
    if (typeof fn === "function" && "mockClear" in fn) {
      (fn as unknown as Mock).mockClear();
    }
  });
}

/**
 * 设置默认的 fs Mock 行为（使用真实文件系统）
 */
export function setupRealFs() {
  vi.mock("fs-extra", async () => {
    const actual = await vi.importActual("fs-extra");
    return actual;
  });
}

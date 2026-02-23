/** @fileoverview 测试配置管理器 (config.ts) */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, saveConfig, CONFIG_NAME } from "../../core/config.ts";
import { ConfigParseError } from "../../core/errors.ts";
import * as fs from "fs-extra";
import path from "path";
import { createTempDir, cleanupTempDir } from "../helpers/temp-dir.ts";

describe("config", () => {
  let tempDir: string;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await createTempDir();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
  });

  describe("loadConfig", () => {
    it("配置文件不存在时应返回 null", async () => {
      const config = await loadConfig(tempDir);
      expect(config).toBeNull();
    });

    it("应该正确加载有效的配置文件", async () => {
      const configData = {
        language: "zh",
        docDir: ".architext",
        editors: ["cursor"],
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const configPath = path.join(tempDir, CONFIG_NAME);
      await fs.writeJSON(configPath, configData, { spaces: 2 });

      const config = await loadConfig(tempDir);
      expect(config).toEqual(configData);
    });

    it("无效的 JSON 应该抛出 ConfigParseError", async () => {
      const configPath = path.join(tempDir, CONFIG_NAME);
      await fs.writeFile(configPath, "invalid json {", "utf-8");

      await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
    });

    it("结构不完整（如缺少 editors）应抛出 ConfigParseError 并给出友好提示", async () => {
      const invalidConfig = {
        language: "zh",
        docDir: ".architext",
        // editors 缺失
        updatedAt: "2024-01-01T00:00:00.000Z",
      };
      const configPath = path.join(tempDir, CONFIG_NAME);
      await fs.writeJSON(configPath, invalidConfig, { spaces: 2 });

      await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      await expect(loadConfig(tempDir)).rejects.toThrow(/结构校验失败/);
      await expect(loadConfig(tempDir)).rejects.toThrow(/editors/);
    });

    it("editors 为空数组应抛出 ConfigParseError", async () => {
      const invalidConfig = {
        language: "zh",
        docDir: ".architext",
        editors: [],
        updatedAt: "2024-01-01T00:00:00.000Z",
      };
      const configPath = path.join(tempDir, CONFIG_NAME);
      await fs.writeJSON(configPath, invalidConfig, { spaces: 2 });

      await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
    });

    it("应该使用默认的当前工作目录", async () => {
      const configData = {
        language: "zh",
        docDir: ".architext",
        editors: ["cursor"],
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const configPath = path.join(process.cwd(), CONFIG_NAME);
      await fs.writeJSON(configPath, configData, { spaces: 2 });

      const config = await loadConfig();
      expect(config).toEqual(configData);

      // 清理
      await fs.remove(configPath);
    });
  });

  describe("saveConfig", () => {
    it("应该保存配置文件", async () => {
      const configData = {
        language: "zh",
        docDir: ".architext",
        editors: ["cursor"] as const,
      };
      const mutableConfigData = {
        ...configData,
        editors: [...configData.editors],
      };

      await saveConfig(mutableConfigData, tempDir);

      const configPath = path.join(tempDir, CONFIG_NAME);
      expect(await fs.pathExists(configPath)).toBe(true);

      const saved = await fs.readJSON(configPath);
      expect(saved.language).toBe(configData.language);
      expect(saved.docDir).toBe(configData.docDir);
      expect(saved.editors).toEqual(configData.editors);
      expect(saved.updatedAt).toBeDefined();
      expect(typeof saved.updatedAt).toBe("string");
    });

    it("应该自动添加 updatedAt 字段", async () => {
      const configData = {
        language: "zh",
        docDir: ".architext",
        editors: ["cursor"] as const,
      };
      const mutableConfigData = {
        ...configData,
        editors: [...configData.editors],
      };

      await saveConfig(mutableConfigData, tempDir);

      const configPath = path.join(tempDir, CONFIG_NAME);
      const saved = await fs.readJSON(configPath);

      expect(saved.updatedAt).toBeDefined();
      const date = new Date(saved.updatedAt);
      expect(date.getTime()).toBeGreaterThan(0);
    });

    it("应该使用默认的当前工作目录", async () => {
      const configData = {
        language: "en",
        docDir: "docs",
        editors: ["trae"] as const,
      };
      const mutableConfigData = {
        ...configData,
        editors: [...configData.editors],
      };

      await saveConfig(mutableConfigData);

      const configPath = path.join(process.cwd(), CONFIG_NAME);
      expect(await fs.pathExists(configPath)).toBe(true);

      // 清理
      await fs.remove(configPath);
    });
  });
});

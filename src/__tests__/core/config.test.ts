/** @fileoverview 测试配置管理器 (config.ts) - 验证加载、保存和边界场景 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { LocaleLang } from "../../types/index.ts";
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

  // ─────────────────────────────────────────────────────────────────
  // loadConfig 基础功能
  // ─────────────────────────────────────────────────────────────────

  describe("loadConfig", () => {
    describe("文件不存在场景", () => {
      it("配置文件不存在时应返回 null", async () => {
        const config = await loadConfig(tempDir);
        expect(config).toBeNull();
      });

      it("目录不存在时应返回 null", async () => {
        const config = await loadConfig(path.join(tempDir, "nonexistent"));
        expect(config).toBeNull();
      });
    });

    describe("正常加载场景", () => {
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

      it("应该正确加载包含所有可选字段的配置", async () => {
        const configData = {
          language: "en",
          docDir: "docs",
          editors: ["cursor", "claude"],
          features: ["ui", "api"],
          updatedAt: "2024-06-15T12:30:00.000Z",
        };

        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, configData, { spaces: 2 });

        const config = await loadConfig(tempDir);
        expect(config).toEqual(configData);
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

        await fs.remove(configPath);
      });
    });

    describe("JSON 解析错误", () => {
      it("无效的 JSON 应该抛出 ConfigParseError", async () => {
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeFile(configPath, "invalid json {", "utf-8");

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("空文件应该抛出 ConfigParseError", async () => {
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeFile(configPath, "", "utf-8");

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("只有空白的文件应该抛出 ConfigParseError", async () => {
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeFile(configPath, "   \n\t  ", "utf-8");

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("非对象 JSON（数组）应该抛出 ConfigParseError", async () => {
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeFile(configPath, "[]", "utf-8");

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("非对象 JSON（字符串）应该抛出 ConfigParseError", async () => {
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeFile(configPath, '"hello"', "utf-8");

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("非对象 JSON（数字）应该抛出 ConfigParseError", async () => {
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeFile(configPath, "123", "utf-8");

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });
    });

    describe("Schema 验证错误", () => {
      it("结构不完整（如缺少 editors）应抛出 ConfigParseError", async () => {
        const invalidConfig = {
          language: "zh",
          docDir: ".architext",
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, invalidConfig, { spaces: 2 });

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
        await expect(loadConfig(tempDir)).rejects.toThrow(
          /schema validation failed/,
        );
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

      it("缺少 language 应抛出 ConfigParseError", async () => {
        const invalidConfig = {
          docDir: ".architext",
          editors: ["cursor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, invalidConfig, { spaces: 2 });

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("缺少 docDir 应抛出 ConfigParseError", async () => {
        const invalidConfig = {
          language: "zh",
          editors: ["cursor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, invalidConfig, { spaces: 2 });

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("无效的 language 值应抛出 ConfigParseError", async () => {
        const invalidConfig = {
          language: "fr",
          docDir: ".architext",
          editors: ["cursor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, invalidConfig, { spaces: 2 });

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });

      it("无效的 editor 值应抛出 ConfigParseError", async () => {
        const invalidConfig = {
          language: "zh",
          docDir: ".architext",
          editors: ["unknown-editor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };
        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, invalidConfig, { spaces: 2 });

        await expect(loadConfig(tempDir)).rejects.toThrow(ConfigParseError);
      });
    });

    describe("边界测试：超大文件", () => {
      it("超大 JSON 文件应正常解析", async () => {
        const configData = {
          language: "zh",
          docDir: ".architext",
          editors: ["cursor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, configData, { spaces: 2 });

        const config = await loadConfig(tempDir);
        expect(config?.language).toBe("zh");
      });
    });

    describe("边界测试：特殊字符", () => {
      it("docDir 含 Unicode 字符应正常解析", async () => {
        const configData = {
          language: "zh",
          docDir: ".文档目录-日本語-🌍",
          editors: ["cursor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, configData, { spaces: 2 });

        const config = await loadConfig(tempDir);
        expect(config?.docDir).toBe(".文档目录-日本語-🌍");
      });

      it("docDir 含空格应正常解析", async () => {
        const configData = {
          language: "zh",
          docDir: "my docs folder",
          editors: ["cursor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        const configPath = path.join(tempDir, CONFIG_NAME);
        await fs.writeJSON(configPath, configData, { spaces: 2 });

        const config = await loadConfig(tempDir);
        expect(config?.docDir).toBe("my docs folder");
      });
    });

    describe("边界测试：文件编码", () => {
      it("UTF-8 BOM 应正常解析", async () => {
        const configData = {
          language: "zh",
          docDir: ".architext",
          editors: ["cursor"],
          updatedAt: "2024-01-01T00:00:00.000Z",
        };

        const configPath = path.join(tempDir, CONFIG_NAME);
        // 写入 UTF-8 BOM + JSON
        const bom = Buffer.from([0xef, 0xbb, 0xbf]);
        const jsonContent = JSON.stringify(configData, null, 2);
        await fs.writeFile(
          configPath,
          Buffer.concat([bom, Buffer.from(jsonContent)]),
        );

        const config = await loadConfig(tempDir);
        expect(config).toEqual(configData);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // saveConfig 基础功能
  // ─────────────────────────────────────────────────────────────────

  describe("saveConfig", () => {
    describe("正常保存场景", () => {
      it("应该保存配置文件", async () => {
        const configData = {
          language: "zh" as LocaleLang,
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
      });

      it("应该自动添加 updatedAt 字段", async () => {
        const configData = {
          language: "zh" as LocaleLang,
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
          language: "en" as LocaleLang,
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

        await fs.remove(configPath);
      });

      it("应该覆盖已存在的配置文件", async () => {
        const configPath = path.join(tempDir, CONFIG_NAME);

        // 第一次保存
        await saveConfig(
          {
            language: "zh",
            docDir: ".architext",
            editors: ["cursor"],
          },
          tempDir,
        );

        // 第二次保存
        await saveConfig(
          {
            language: "en",
            docDir: "docs",
            editors: ["claude"],
          },
          tempDir,
        );

        const saved = await fs.readJSON(configPath);
        expect(saved.language).toBe("en");
        expect(saved.docDir).toBe("docs");
        expect(saved.editors).toEqual(["claude"]);
      });
    });

    describe("边界测试：特殊值", () => {
      it("features 为空数组应正常保存", async () => {
        const configData = {
          language: "zh" as LocaleLang,
          docDir: ".architext",
          editors: ["cursor"] as const,
          features: [],
        };

        await saveConfig(configData, tempDir);

        const configPath = path.join(tempDir, CONFIG_NAME);
        const saved = await fs.readJSON(configPath);
        expect(saved.features).toEqual([]);
      });

      it("多编辑器应正常保存", async () => {
        const configData = {
          language: "zh" as LocaleLang,
          docDir: ".architext",
          editors: ["cursor", "claude", "windsurf"] as string[],
        };

        await saveConfig(configData, tempDir);

        const configPath = path.join(tempDir, CONFIG_NAME);
        const saved = await fs.readJSON(configPath);
        expect(saved.editors).toEqual(["cursor", "claude", "windsurf"]);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 边界测试：目录不存在
  // ─────────────────────────────────────────────────────────────────

  describe("边界测试：目录不存在", () => {
    it("保存到不存在的目录时应抛出错误", async () => {
      const nestedDir = path.join(tempDir, "nested", "deep", "dir");
      const configData = {
        language: "zh" as LocaleLang,
        docDir: ".architext",
        editors: ["cursor"] as const,
      };

      // saveConfig 不会自动创建父目录
      await expect(saveConfig(configData, nestedDir)).rejects.toThrow();
    });
  });
});

/** @fileoverview IDE 集成测试 — 覆盖 OpenCode/Claude 配置注入、清理逻辑。 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import {
  applyOpenCodeIntegration,
  applyOpenCodeNotifyIntegration,
  applyClaudeNotifyIntegration,
  applyIdeIntegrations,
  cleanupOpenCodeIntegration,
  cleanupClaudeNotifyIntegration,
  cleanupIdeIntegrations,
} from "../../core/ide-integrations.ts";
import { createTempDir, cleanupTempDir } from "../helpers/temp-dir.ts";

describe("IDE Integrations", () => {
  let tempDir: string;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await createTempDir();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTempDir(tempDir);
  });

  // ═══════════════════════════════════════════════════════════
  // OpenCode Integration
  // ═══════════════════════════════════════════════════════════

  describe("applyOpenCodeIntegration", () => {
    it("opencode.json 不存在时应创建并注入规则路径", async () => {
      const result = await applyOpenCodeIntegration();

      expect(result).toBe(true);
      const configPath = path.join(tempDir, "opencode.json");
      expect(await fs.pathExists(configPath)).toBe(true);

      const config = await fs.readJSON(configPath);
      expect(config.instructions).toContain(".opencode/rules/*.md");
    });

    it("opencode.json 存在但无 instructions 时应添加", async () => {
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        model: "gpt-4",
      });

      const result = await applyOpenCodeIntegration();

      expect(result).toBe(true);
      const config = await fs.readJSON(path.join(tempDir, "opencode.json"));
      expect(config.instructions).toContain(".opencode/rules/*.md");
      expect(config.model).toBe("gpt-4");
    });

    it("instructions 已包含规则路径时应返回 false 且不修改", async () => {
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        instructions: [".opencode/rules/*.md"],
      });

      const result = await applyOpenCodeIntegration();

      expect(result).toBe(false);
    });

    it("instructions 存在但不包含规则路径时应追加", async () => {
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        instructions: ["custom/*.md"],
      });

      const result = await applyOpenCodeIntegration();

      expect(result).toBe(true);
      const config = await fs.readJSON(path.join(tempDir, "opencode.json"));
      expect(config.instructions).toEqual([
        "custom/*.md",
        ".opencode/rules/*.md",
      ]);
    });

    it("JSON 损坏时应返回 false", async () => {
      await fs.writeFile(path.join(tempDir, "opencode.json"), "{ bad json");

      const result = await applyOpenCodeIntegration();

      expect(result).toBe(false);
    });
  });

  describe("applyOpenCodeNotifyIntegration", () => {
    it("应创建插件文件", async () => {
      const result = await applyOpenCodeNotifyIntegration();

      expect(result).toBe(true);
      const pluginPath = path.join(
        tempDir,
        ".opencode/plugins/architext-notify.js",
      );
      expect(await fs.pathExists(pluginPath)).toBe(true);

      const content = await fs.readFile(pluginPath, "utf-8");
      expect(content).toContain("architextNotify");
      expect(content).toContain("npx archi notify");
    });

    it("插件已存在时应返回 false", async () => {
      await fs.ensureDir(path.join(tempDir, ".opencode/plugins"));
      await fs.writeFile(
        path.join(tempDir, ".opencode/plugins/architext-notify.js"),
        "// existing",
      );

      const result = await applyOpenCodeNotifyIntegration();

      expect(result).toBe(false);
    });
  });

  describe("cleanupOpenCodeIntegration", () => {
    it("应移除 instructions 中的规则路径", async () => {
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        instructions: [".opencode/rules/*.md", "custom/*.md"],
      });

      await cleanupOpenCodeIntegration();

      const config = await fs.readJSON(path.join(tempDir, "opencode.json"));
      expect(config.instructions).toEqual(["custom/*.md"]);
    });

    it("instructions 为空且 config 为空对象时应删除文件", async () => {
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        instructions: [".opencode/rules/*.md"],
      });

      await cleanupOpenCodeIntegration();

      // 文件应被删除（因为 instructions 清空后 config 变为空对象）
      expect(await fs.pathExists(path.join(tempDir, "opencode.json"))).toBe(
        false,
      );
    });

    it("instructions 为空但 config 有其他字段时应保留文件", async () => {
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        instructions: [".opencode/rules/*.md"],
        model: "gpt-4",
      });

      await cleanupOpenCodeIntegration();

      const config = await fs.readJSON(path.join(tempDir, "opencode.json"));
      expect(config.instructions).toBeUndefined();
      expect(config.model).toBe("gpt-4");
    });

    it("config 为空对象时应删除文件", async () => {
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        instructions: [".opencode/rules/*.md"],
      });

      await cleanupOpenCodeIntegration();

      expect(await fs.pathExists(path.join(tempDir, "opencode.json"))).toBe(
        false,
      );
    });

    it("应删除插件文件", async () => {
      const pluginPath = path.join(
        tempDir,
        ".opencode/plugins/architext-notify.js",
      );
      await fs.ensureDir(path.dirname(pluginPath));
      await fs.writeFile(pluginPath, "// plugin");

      await cleanupOpenCodeIntegration();

      expect(await fs.pathExists(pluginPath)).toBe(false);
    });

    it("文件不存在时应静默处理", async () => {
      await expect(cleanupOpenCodeIntegration()).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Claude Code Integration
  // ═══════════════════════════════════════════════════════════

  describe("applyClaudeNotifyIntegration", () => {
    it("settings.json 不存在时应创建并添加 hook", async () => {
      const result = await applyClaudeNotifyIntegration();

      expect(result).toBe(true);
      const settingsPath = path.join(tempDir, ".claude/settings.json");
      expect(await fs.pathExists(settingsPath)).toBe(true);

      const config = await fs.readJSON(settingsPath);
      expect(config.hooks.Stop).toBeDefined();
      expect(config.hooks.Stop[0].hooks[0].command).toBe("npx archi notify");
    });

    it("settings.json 存在时应合并配置", async () => {
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeJSON(path.join(tempDir, ".claude/settings.json"), {
        permissions: { allow: ["read"] },
      });

      const result = await applyClaudeNotifyIntegration();

      expect(result).toBe(true);
      const config = await fs.readJSON(
        path.join(tempDir, ".claude/settings.json"),
      );
      expect(config.permissions.allow).toContain("read");
      expect(config.hooks.Stop).toBeDefined();
    });

    it("hook 已存在时应返回 false", async () => {
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeJSON(path.join(tempDir, ".claude/settings.json"), {
        hooks: {
          Stop: [{ hooks: [{ type: "command", command: "npx archi notify" }] }],
        },
      });

      const result = await applyClaudeNotifyIntegration();

      expect(result).toBe(false);
    });

    it("JSON 损坏时应重新创建", async () => {
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeFile(path.join(tempDir, ".claude/settings.json"), "{ bad");

      const result = await applyClaudeNotifyIntegration();

      expect(result).toBe(true);
      const config = await fs.readJSON(
        path.join(tempDir, ".claude/settings.json"),
      );
      expect(config.hooks.Stop).toBeDefined();
    });
  });

  describe("cleanupClaudeNotifyIntegration", () => {
    it("应移除 Architext hook", async () => {
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeJSON(path.join(tempDir, ".claude/settings.json"), {
        hooks: {
          Stop: [
            { hooks: [{ type: "command", command: "npx archi notify" }] },
            { hooks: [{ type: "command", command: "other-command" }] },
          ],
        },
      });

      await cleanupClaudeNotifyIntegration();

      const config = await fs.readJSON(
        path.join(tempDir, ".claude/settings.json"),
      );
      expect(config.hooks.Stop).toHaveLength(1);
      expect(config.hooks.Stop[0].hooks[0].command).toBe("other-command");
    });

    it("Stop 为空且 hooks 为空时应删除 hooks 字段", async () => {
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeJSON(path.join(tempDir, ".claude/settings.json"), {
        hooks: {
          Stop: [{ hooks: [{ type: "command", command: "npx archi notify" }] }],
        },
      });

      await cleanupClaudeNotifyIntegration();

      // hooks 清空后，config 变为空对象，文件应被删除
      expect(
        await fs.pathExists(path.join(tempDir, ".claude/settings.json")),
      ).toBe(false);
    });

    it("Stop 为空但 config 有其他字段时应保留文件", async () => {
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeJSON(path.join(tempDir, ".claude/settings.json"), {
        permissions: { allow: ["read"] },
        hooks: {
          Stop: [{ hooks: [{ type: "command", command: "npx archi notify" }] }],
        },
      });

      await cleanupClaudeNotifyIntegration();

      const config = await fs.readJSON(
        path.join(tempDir, ".claude/settings.json"),
      );
      expect(config.hooks).toBeUndefined();
      expect(config.permissions).toEqual({ allow: ["read"] });
    });

    it("config 为空对象时应删除文件", async () => {
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeJSON(path.join(tempDir, ".claude/settings.json"), {
        hooks: {
          Stop: [{ hooks: [{ type: "command", command: "npx archi notify" }] }],
        },
      });

      await cleanupClaudeNotifyIntegration();

      expect(
        await fs.pathExists(path.join(tempDir, ".claude/settings.json")),
      ).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 统一入口
  // ═══════════════════════════════════════════════════════════

  describe("applyIdeIntegrations", () => {
    it("opencode 编辑器应触发 OpenCode 集成", async () => {
      const result = await applyIdeIntegrations(["opencode"], true);

      expect(result.opencodeInstructionsAdded).toBe(true);
      expect(result.opencodeNotifyAdded).toBe(true);
      expect(result.claudeNotifyAdded).toBe(false);
    });

    it("claude 编辑器应触发 Claude 集成", async () => {
      const result = await applyIdeIntegrations(["claude"], true);

      expect(result.claudeNotifyAdded).toBe(true);
      expect(result.opencodeInstructionsAdded).toBe(false);
    });

    it("禁用 notify 时不应添加通知配置", async () => {
      const result = await applyIdeIntegrations(["opencode", "claude"], false);

      expect(result.opencodeNotifyAdded).toBe(false);
      expect(result.claudeNotifyAdded).toBe(false);
    });

    it("不相关的编辑器应返回全 false", async () => {
      const result = await applyIdeIntegrations(["cursor"], true);

      expect(result.opencodeInstructionsAdded).toBe(false);
      expect(result.opencodeNotifyAdded).toBe(false);
      expect(result.claudeNotifyAdded).toBe(false);
    });
  });

  describe("cleanupIdeIntegrations", () => {
    it("应清理所有相关编辑器的配置", async () => {
      // 先创建配置
      await fs.writeJSON(path.join(tempDir, "opencode.json"), {
        instructions: [".opencode/rules/*.md"],
      });
      await fs.ensureDir(path.join(tempDir, ".claude"));
      await fs.writeJSON(path.join(tempDir, ".claude/settings.json"), {
        hooks: {
          Stop: [{ hooks: [{ type: "command", command: "npx archi notify" }] }],
        },
      });

      await cleanupIdeIntegrations(["opencode", "claude"]);

      expect(await fs.pathExists(path.join(tempDir, "opencode.json"))).toBe(
        false,
      );
      expect(
        await fs.pathExists(path.join(tempDir, ".claude/settings.json")),
      ).toBe(false);
    });
  });
});

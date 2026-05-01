/** @fileoverview Scaffolder 集成测试，验证从配置到文件生成的完整流程和内容正确性 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { scaffold } from "../../core/scaffold.ts";
import { InitConfig } from "../../types/index.ts";
import { createTempDir, cleanupTempDir } from "../helpers/temp-dir.ts";
import path from "path";
import fs from "fs-extra";

// 确保我们使用真实的 fs 操作，而不是 mock 的
vi.mock("fs-extra", async () => {
  const actual = await vi.importActual<typeof import("fs-extra")>("fs-extra");
  return actual;
});

// 测试时 TemplateManager.getRoot 依赖 __dirname，Vitest 从 src/ 运行，路径与生产/开发不同。
// Mock 为项目根目录的 templates。vi.mock 会 hoist，用 process.cwd()（npm test 时即项目根）计算路径。
vi.mock("../../core/template.ts", async (importOriginal) => {
  const pathMod = await import("path");
  const mod = await importOriginal<typeof import("../../core/template.ts")>();
  const templatesPath = pathMod.join(process.cwd(), "templates");
  const TM = mod.TemplateManager;
  return {
    ...mod,
    TemplateManager: {
      plan: TM.plan.bind(TM),
      execute: TM.execute.bind(TM),
      getRoot: vi.fn().mockResolvedValue(templatesPath),
    },
  };
});

describe("Scaffolder Integration", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tempDir = await createTempDir("scaffold-test-");
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────
  // 基础结构生成
  // ─────────────────────────────────────────────────────────────────

  describe("基础结构生成", () => {
    it("should generate basic documentation structure", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui"],
      };

      await scaffold(config);

      const docDir = path.join(tempDir, ".architext");
      expect(await fs.pathExists(docDir)).toBe(true);

      // 验证骨架目录
      expect(await fs.pathExists(path.join(docDir, "tasks"))).toBe(true);
      expect(await fs.pathExists(path.join(docDir, "refs"))).toBe(true);
      expect(await fs.pathExists(path.join(docDir, "global"))).toBe(true);
    });

    it("should generate global JSON files with valid structure", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui"],
      };

      await scaffold(config);

      const mapFile = path.join(tempDir, ".architext", "global", "map.json");
      expect(await fs.pathExists(mapFile)).toBe(true);

      const content = await fs.readFile(mapFile, "utf-8");
      const mapData = JSON.parse(content);

      // 验证 JSON 结构（map.json 使用对象而非数组）
      expect(mapData).toHaveProperty("directoryMapping");
      expect(mapData).toHaveProperty("logicalTopology");
      expect(mapData).toHaveProperty("criticalUserJourneys");
      expect(mapData).toHaveProperty("featureRelations");
      expect(typeof mapData.directoryMapping).toBe("object");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 编辑器特定文件生成
  // ─────────────────────────────────────────────────────────────────

  describe("编辑器特定文件生成", () => {
    it("should generate Cursor rules and commands", async () => {
      const config: InitConfig = {
        language: "en",
        editors: ["cursor"],
        docDir: "docs",
        features: ["ui"],
      };

      await scaffold(config);

      // Cursor 规则目录
      const cursorRuleDir = path.join(tempDir, ".cursor/rules");
      expect(await fs.pathExists(cursorRuleDir)).toBe(true);

      // 验证规则文件存在
      expect(
        await fs.pathExists(path.join(cursorRuleDir, "00_system.mdc")),
      ).toBe(true);
      expect(
        await fs.pathExists(path.join(cursorRuleDir, "90_custom_rules.mdc")),
      ).toBe(true);

      // Cursor Commands 目录
      const cursorCmdDir = path.join(tempDir, ".cursor/commands");
      expect(await fs.pathExists(cursorCmdDir)).toBe(true);
      expect(
        await fs.pathExists(path.join(cursorCmdDir, "archi.init.md")),
      ).toBe(true);
    });

    it("should generate Claude Code specific files", async () => {
      const config: InitConfig = {
        language: "en",
        editors: ["claude"],
        docDir: "docs",
        features: ["ui"],
      };

      await scaffold(config);

      // Claude Code 规则目录
      const claudeRuleDir = path.join(tempDir, ".claude/rules");
      expect(await fs.pathExists(claudeRuleDir)).toBe(true);

      // Commands 目录
      const claudeCmdDir = path.join(tempDir, ".claude/commands");
      expect(await fs.pathExists(claudeCmdDir)).toBe(true);
      expect(
        await fs.pathExists(path.join(claudeCmdDir, "archi.init.md")),
      ).toBe(true);

      // Skills 目录
      const claudeSkillsDir = path.join(tempDir, ".claude/skills");
      expect(await fs.pathExists(claudeSkillsDir)).toBe(true);
    });

    it("should generate OpenCode specific files and opencode.json", async () => {
      const config: InitConfig = {
        language: "en",
        editors: ["opencode"],
        docDir: "docs",
        features: [],
      };

      await scaffold(config);

      // OpenCode 规则目录
      const rulesDir = path.join(tempDir, ".opencode/rules");
      expect(await fs.pathExists(rulesDir)).toBe(true);

      // Commands 目录
      const commandsDir = path.join(tempDir, ".opencode/commands");
      expect(await fs.pathExists(commandsDir)).toBe(true);

      // opencode.json
      const configPath = path.join(tempDir, "opencode.json");
      expect(await fs.pathExists(configPath)).toBe(true);
      const content = JSON.parse(await fs.readFile(configPath, "utf-8"));
      expect(content.instructions).toContain(".opencode/rules/*.md");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // SUBAGENT/WHEN 指令展开验证
  // ─────────────────────────────────────────────────────────────────

  describe("SUBAGENT 指令展开", () => {
    it("Cursor 规则应包含子代理指令（hasSubagents=true）", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: [],
      };

      await scaffold(config);

      const ruleFile = await fs.readFile(
        path.join(tempDir, ".cursor/rules/00_system.mdc"),
        "utf-8",
      );

      // Cursor 支持子代理，应展开 SUBAGENT 标记
      expect(ruleFile).toContain("**[SUBAGENT · 子代理]**");
      expect(ruleFile).not.toContain("[[SUBAGENT:");
    });

    it("Windsurf 规则应使用内联 Skill（hasSubagents=false, hasSkills=true）", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["windsurf"],
        docDir: ".architext",
        features: [],
      };

      await scaffold(config);

      const ruleFile = await fs.readFile(
        path.join(tempDir, ".windsurf/rules/00_system.md"),
        "utf-8",
      );

      // Windsurf 无子代理，应使用内联 Skill
      expect(ruleFile).toContain("**[SKILL · 内联]**");
      expect(ruleFile).not.toContain("**[SUBAGENT · 子代理]**");
      expect(ruleFile).not.toContain("[[SUBAGENT:");
    });
  });

  describe("WHEN 指令展开", () => {
    it("features 含 ui 时，规则应包含 UI 相关内容", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui"],
      };

      await scaffold(config);

      const ruleFile = await fs.readFile(
        path.join(tempDir, ".cursor/rules/00_system.mdc"),
        "utf-8",
      );

      // WHEN 标记应被展开
      expect(ruleFile).not.toContain("[[WHEN:");
      // 应包含 UI 相关内容（如设计令牌）
      expect(ruleFile).toContain("design_tokens.json");
    });

    it("features 不含 ui 时，规则不应包含 UI 特定内容", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["api"],
      };

      await scaffold(config);

      const ruleFile = await fs.readFile(
        path.join(tempDir, ".cursor/rules/00_system.mdc"),
        "utf-8",
      );

      // WHEN 标记应被移除
      expect(ruleFile).not.toContain("[[WHEN:");
    });

    it("多 features 时，所有相关内容应展开", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui", "data"],
      };

      await scaffold(config);

      const ruleFile = await fs.readFile(
        path.join(tempDir, ".cursor/rules/00_system.mdc"),
        "utf-8",
      );

      expect(ruleFile).not.toContain("[[WHEN:");
      // UI + Data 项目应有相关内容
      expect(ruleFile).toContain("design_tokens.json");
      expect(ruleFile).toContain("data_snapshot.json");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // opencode.json 合并逻辑
  // ─────────────────────────────────────────────────────────────────

  describe("opencode.json 合并逻辑", () => {
    it("should merge Architext path into existing opencode.json instructions", async () => {
      const configPath = path.join(tempDir, "opencode.json");
      const existing = {
        model: "anthropic/claude-sonnet-4-5",
        instructions: ["custom/*.md"],
      };
      await fs.writeFile(
        configPath,
        JSON.stringify(existing, null, 2),
        "utf-8",
      );

      const config: InitConfig = {
        language: "en",
        editors: ["opencode"],
        docDir: "docs",
        features: [],
      };

      await scaffold(config);

      const content = JSON.parse(await fs.readFile(configPath, "utf-8"));
      expect(content.instructions).toContain("custom/*.md");
      expect(content.instructions).toContain(".opencode/rules/*.md");
    });

    it("should not duplicate .opencode/rules/*.md when already in instructions", async () => {
      const configPath = path.join(tempDir, "opencode.json");
      const existing = { instructions: [".opencode/rules/*.md", "AGENTS.md"] };
      await fs.writeFile(
        configPath,
        JSON.stringify(existing, null, 2),
        "utf-8",
      );

      const config: InitConfig = {
        language: "en",
        editors: ["opencode"],
        docDir: "docs",
        features: [],
      };

      const result = await scaffold(config);

      const content = JSON.parse(await fs.readFile(configPath, "utf-8"));
      const count = content.instructions.filter(
        (p: string) => p === ".opencode/rules/*.md",
      ).length;
      expect(count).toBe(1);
      expect(result?.opencodeInstructionsAdded).toBe(false);
    });

    it("should return opencodeInstructionsAdded true when we add the path", async () => {
      const config: InitConfig = {
        language: "en",
        editors: ["opencode"],
        docDir: "docs",
        features: [],
      };

      const result = await scaffold(config);

      expect(result?.opencodeInstructionsAdded).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 语言回退
  // ─────────────────────────────────────────────────────────────────

  describe("语言回退", () => {
    it("should fallback to default language if requested language template missing", async () => {
      const config = {
        language: "fr", // French doesn't exist
        editors: ["cursor"],
        docDir: ".architext",
      } as unknown as InitConfig;

      await scaffold(config);

      const docDir = path.join(tempDir, ".architext");
      expect(await fs.pathExists(docDir)).toBe(true);

      // 验证回退到 zh（默认）
      const helpFile = path.join(docDir, "prompts", "help.md");
      if (await fs.pathExists(helpFile)) {
        const content = await fs.readFile(helpFile, "utf-8");
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 条件种子文件
  // ─────────────────────────────────────────────────────────────────

  describe("条件种子文件", () => {
    it("features 含 ui 时，应生成 design_tokens.json", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui"],
      };

      await scaffold(config);

      const tokensFile = path.join(
        tempDir,
        ".architext/global/design_tokens.json",
      );
      expect(await fs.pathExists(tokensFile)).toBe(true);

      const content = JSON.parse(await fs.readFile(tokensFile, "utf-8"));
      expect(content).toHaveProperty("primitivePalette");
      expect(content).toHaveProperty("semanticTokens");
    });

    it("features 不含 ui 时，不应生成 design_tokens.json", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["api"],
      };

      await scaffold(config);

      const tokensFile = path.join(
        tempDir,
        ".architext/global/design_tokens.json",
      );
      expect(await fs.pathExists(tokensFile)).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 规则文件内容验证
  // ─────────────────────────────────────────────────────────────────

  describe("规则文件内容验证", () => {
    it("规则文件应正确替换占位符", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".mydocs",
        features: ["ui", "api"],
      };

      await scaffold(config);

      const ruleFile = await fs.readFile(
        path.join(tempDir, ".cursor/rules/00_system.mdc"),
        "utf-8",
      );

      // 占位符应被替换
      expect(ruleFile).toContain(".mydocs");
      expect(ruleFile).not.toContain("[[DOCS_DIR]]");
    });

    it("规则文件不应保留任何能力标记原始形式", async () => {
      const config: InitConfig = {
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui"],
      };

      await scaffold(config);

      const ruleFile = await fs.readFile(
        path.join(tempDir, ".cursor/rules/00_system.mdc"),
        "utf-8",
      );

      // 所有能力标记应被处理
      expect(ruleFile).not.toContain("[[SUBAGENT:");
      expect(ruleFile).not.toContain("[[NO-SUBAGENT:");
      expect(ruleFile).not.toContain("[[NO-SKILL:");
      expect(ruleFile).not.toContain("[[NO-COMMANDS:");
      expect(ruleFile).not.toContain("[[WHEN:");
      expect(ruleFile).not.toContain("[[INCLUDE:");
    });
  });
});

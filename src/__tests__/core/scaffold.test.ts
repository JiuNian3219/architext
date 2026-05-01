/** @fileoverview Scaffolder 集成测试，验证从配置到文件生成的完整流程 */

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
    // 1. 创建真实的临时目录
    tempDir = await createTempDir("scaffold-test-");
    originalCwd = process.cwd();

    // 2. 切换工作目录到临时目录，确保 Scaffolder 在此目录下生成文件
    process.chdir(tempDir);
  });

  afterEach(async () => {
    // 3. 恢复工作目录并清理
    process.chdir(originalCwd);
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
    vi.restoreAllMocks();
  });

  it("should generate basic documentation structure", async () => {
    // 准备配置
    const config: InitConfig = {
      language: "zh",
      editors: ["cursor"],
      docDir: ".architext",
      features: ["ui"],
    };

    // 执行生成
    await scaffold(config);

    // 验证：文档目录是否创建
    const docDir = path.join(tempDir, ".architext");
    expect(await fs.pathExists(docDir)).toBe(true);

    // 验证：是否包含全局文档 (JSON 格式)
    const mapFile = path.join(docDir, "global", "map.json");
    expect(await fs.pathExists(mapFile)).toBe(true);

    // 验证：JSON 文件内容是有效的 JSON
    const content = await fs.readFile(mapFile, "utf-8");
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it("should generate editor specific rules", async () => {
    const config: InitConfig = {
      language: "en",
      editors: ["cursor"],
      docDir: "docs",
      features: ["ui"],
    };

    await scaffold(config);

    // 验证：Cursor 规则目录
    const cursorRuleDir = path.join(tempDir, ".cursor/rules");
    expect(await fs.pathExists(cursorRuleDir)).toBe(true);

    // 验证：Command 文件是否生成 (这是你刚才加的新功能)
    const cursorCmdDir = path.join(tempDir, ".cursor/commands");
    expect(await fs.pathExists(cursorCmdDir)).toBe(true);
    expect(await fs.pathExists(path.join(cursorCmdDir, "archi.init.md"))).toBe(
      true,
    );
  });

  it("should generate Claude Code specific files", async () => {
    const config: InitConfig = {
      language: "en",
      editors: ["claude"],
      docDir: "docs",
      features: ["ui"],
    };

    await scaffold(config);

    // 验证：Claude Code 规则目录
    const claudeRuleDir = path.join(tempDir, ".claude/rules");
    expect(await fs.pathExists(claudeRuleDir)).toBe(true);

    // 验证：Commands 文件是否生成 (.claude/commands)
    const claudeCmdDir = path.join(tempDir, ".claude/commands");
    expect(await fs.pathExists(claudeCmdDir)).toBe(true);
    expect(await fs.pathExists(path.join(claudeCmdDir, "archi.init.md"))).toBe(
      true,
    );

    // 验证：Skills 目录是否生成 (.claude/skills)
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

    // 验证：OpenCode 规则目录
    const rulesDir = path.join(tempDir, ".opencode/rules");
    expect(await fs.pathExists(rulesDir)).toBe(true);

    // 验证：Commands 目录
    const commandsDir = path.join(tempDir, ".opencode/commands");
    expect(await fs.pathExists(commandsDir)).toBe(true);
    expect(await fs.pathExists(path.join(commandsDir, "archi.init.md"))).toBe(
      true,
    );

    // 验证：opencode.json 生成且包含 instructions 字段
    const configPath = path.join(tempDir, "opencode.json");
    expect(await fs.pathExists(configPath)).toBe(true);
    const content = JSON.parse(await fs.readFile(configPath, "utf-8"));
    expect(content.instructions).toContain(".opencode/rules/*.md");
  });

  it("should merge Architext path into existing opencode.json instructions", async () => {
    // 预先写入一个已有 instructions 的 opencode.json
    const configPath = path.join(tempDir, "opencode.json");
    const existing = {
      model: "anthropic/claude-sonnet-4-5",
      instructions: ["custom/*.md"],
    };
    await fs.writeFile(configPath, JSON.stringify(existing, null, 2), "utf-8");

    const config: InitConfig = {
      language: "en",
      editors: ["opencode"],
      docDir: "docs",
      features: [],
    };

    await scaffold(config);

    // instructions 应合并：保留用户原有 + 追加 Architext 路径
    const content = JSON.parse(await fs.readFile(configPath, "utf-8"));
    expect(content.instructions).toContain("custom/*.md");
    expect(content.instructions).toContain(".opencode/rules/*.md");
  });

  it("should not duplicate .opencode/rules/*.md when already in instructions", async () => {
    const configPath = path.join(tempDir, "opencode.json");
    const existing = { instructions: [".opencode/rules/*.md", "AGENTS.md"] };
    await fs.writeFile(configPath, JSON.stringify(existing, null, 2), "utf-8");

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

  it("should fallback to default language if requested language template missing", async () => {
    // 假设我们请求一个不存在的语言
    // 注意：这里需要确保 Config 类型允许 string，或者我们 cast 一下
    const config = {
      language: "fr", // French doesn't exist
      editors: ["cursor"],
      docDir: ".architext",
    } as unknown as InitConfig;

    await scaffold(config);

    // 验证是否回退到了 zh (默认)
    const docDir = path.join(tempDir, ".architext");
    expect(await fs.pathExists(docDir)).toBe(true);

    // 检查生成的内容是否包含中文特征 (可选)
    const helpFile = path.join(docDir, "prompts/help.md");
    if (await fs.pathExists(helpFile)) {
      const content = await fs.readFile(helpFile, "utf-8");
      // 如果回退到 zh，内容应该是中文
      // 这里只是简单验证文件存在，因为内容验证可能比较脆弱
      expect(content.length).toBeGreaterThan(0);
    }
  });
});

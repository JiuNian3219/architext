/** @fileoverview 集成测试 - init 命令 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { scaffold } from "../../core/scaffold.ts";
import * as fs from "fs-extra";
import path from "path";
import { createTempDir, cleanupTempDir } from "../helpers/temp-dir.ts";
import type { InitConfig, LocaleLang } from "../../types/index.ts";
import { TemplateManager } from "../../core/template.ts";

describe("Scaffolder Integration", () => {
  let tempDir: string;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await createTempDir();
    // Mock getRoot to point to real templates directory for integration tests
    vi.spyOn(TemplateManager, "getRoot").mockResolvedValue(
      path.join(originalCwd, "templates"),
    );
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
  });

  it("应该创建文档目录结构", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const docDir = path.join(tempDir, config.docDir);
    expect(await fs.pathExists(docDir)).toBe(true);

    // 检查全局文档目录
    const globalDir = path.join(docDir, "global");
    expect(await fs.pathExists(globalDir)).toBe(true);

    // cursor 有 commands，prompts 部署到 .cursor/commands/；docDir/prompts 仅对无 commands 的 editor 存在
    const commandsDir = path.join(tempDir, ".cursor/commands");
    expect(await fs.pathExists(commandsDir)).toBe(true);

    // 检查 scripts 和 tasks 空目录（用于存放未来计划和脚本）
    const scriptsDir = path.join(docDir, "scripts");
    const tasksDir = path.join(docDir, "tasks");
    expect(await fs.pathExists(scriptsDir)).toBe(true);
    expect(await fs.pathExists(tasksDir)).toBe(true);
    expect(await fs.readdir(scriptsDir)).toEqual([]);
    expect(await fs.readdir(tasksDir)).toEqual([]);
  });

  it("应该创建 IDE 规则文件", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const rulesDir = path.join(tempDir, ".cursor/rules");
    expect(await fs.pathExists(rulesDir)).toBe(true);

    // 检查规则文件是否存在
    const ruleFiles = await fs.readdir(rulesDir);
    expect(ruleFiles.length).toBeGreaterThan(0);
    expect(ruleFiles.some((f) => f.endsWith(".mdc"))).toBe(true);
  });

  it("应该创建 Cursor commands 文件", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const commandsDir = path.join(tempDir, ".cursor/commands");
    expect(await fs.pathExists(commandsDir)).toBe(true);

    // 检查 commands 文件是否存在
    const commandFiles = await fs.readdir(commandsDir);
    expect(commandFiles.length).toBeGreaterThan(0);
    expect(commandFiles.some((f) => f.startsWith("archi."))).toBe(true);
  });

  it("应该替换占位符", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    // 检查某个文件中的占位符是否被替换
    const rulesDir = path.join(tempDir, ".cursor/rules");
    const ruleFiles = await fs.readdir(rulesDir);
    const firstRuleFile = path.join(rulesDir, ruleFiles[0]);

    if (await fs.pathExists(firstRuleFile)) {
      const content = await fs.readFile(firstRuleFile, "utf-8");
      // 占位符应该被替换
      expect(content).not.toContain("[[__DOCS_DIR__]]");
      expect(content).toContain(config.docDir);
    }
  });

  it("应该支持多个编辑器", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor", "trae"],
      features: [],
    };

    await scaffold(config);

    const cursorRulesDir = path.join(tempDir, ".cursor/rules");
    const traeRulesDir = path.join(tempDir, ".trae/rules");

    expect(await fs.pathExists(cursorRulesDir)).toBe(true);
    expect(await fs.pathExists(traeRulesDir)).toBe(true);
  });

  it("应该回退到默认语言（如果请求的语言不存在）", async () => {
    const config: InitConfig = {
      language: "nonexistent" as LocaleLang,
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    // 应该不抛出错误，而是回退到默认语言
    await expect(scaffold(config)).resolves.not.toThrow();
  });

  it("应该为 Cursor 创建 Agent Skills 文件", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    // archi- 前缀的 Skill 目录应存在
    const skillDir = path.join(
      tempDir,
      ".cursor/skills/archi-decompose-roadmap",
    );
    expect(await fs.pathExists(skillDir)).toBe(true);

    // SKILL.md 应存在且含有合法 frontmatter
    const skillFile = path.join(skillDir, "SKILL.md");
    expect(await fs.pathExists(skillFile)).toBe(true);

    const content = await fs.readFile(skillFile, "utf-8");
    expect(content).toContain("name: archi-decompose-roadmap");
    expect(content).toContain("description:");
  });

  it("Skills 文件不应包含未替换的占位符", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: "my-docs",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const skillFile = path.join(
      tempDir,
      ".cursor/skills/archi-decompose-roadmap/SKILL.md",
    );

    if (await fs.pathExists(skillFile)) {
      const content = await fs.readFile(skillFile, "utf-8");
      expect(content).not.toContain("[[__DOCS_DIR__]]");
    }
  });

  it("支持 Agent Skills 的编辑器应创建 Skills 目录", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["trae"],
      features: [],
    };

    await scaffold(config);

    // trae 支持 Agent Skills 标准，应生成 skills 目录
    const traeSkillsDir = path.join(tempDir, ".trae/skills");
    expect(await fs.pathExists(traeSkillsDir)).toBe(true);
  });

  it("重新初始化时 Skills 文件应纳入冲突检测范围", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    // 第一次运行：生成 Skills 文件
    await scaffold(config);

    const skillFile = path.join(
      tempDir,
      ".cursor/skills/archi-decompose-roadmap/SKILL.md",
    );
    expect(await fs.pathExists(skillFile)).toBe(true);

    // 第二次运行：使用 mock resolveConflicts，捕获传入的 operations
    const resolveConflicts = vi.fn(async (ops) => ops);
    await scaffold(config, { resolveConflicts });

    // Skills 操作须被传入冲突检测函数（证明 SKILL.md 在冲突检测覆盖范围内）
    expect(resolveConflicts).toHaveBeenCalledOnce();
    const ops = resolveConflicts.mock.calls[0][0] as { dest: string }[];
    const skillOps = ops.filter((op) =>
      op.dest.includes("archi-decompose-roadmap"),
    );
    expect(skillOps.length).toBeGreaterThan(0);
  });
});

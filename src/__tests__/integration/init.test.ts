/** @fileoverview 集成测试 - init 命令 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Scaffolder } from "../../core/scaffold.ts";
import * as fs from "fs-extra";
import path from "path";
import { createTempDir, cleanupTempDir } from "../helpers/temp-dir.ts";
import { GLOBAL_RULES } from "../../core/rules.ts";
import { InitConfig } from "../../types/index.ts";
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
    };

    await Scaffolder.run(config);

    const docDir = path.join(tempDir, config.docDir);
    expect(await fs.pathExists(docDir)).toBe(true);

    // 检查全局文档目录
    const globalDir = path.join(docDir, "global");
    expect(await fs.pathExists(globalDir)).toBe(true);

    // 检查 prompts 目录
    const promptsDir = path.join(docDir, "prompts");
    expect(await fs.pathExists(promptsDir)).toBe(true);
  });

  it("应该创建 IDE 规则文件", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
    };

    await Scaffolder.run(config);

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
    };

    await Scaffolder.run(config);

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
    };

    await Scaffolder.run(config);

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
    };

    await Scaffolder.run(config);

    const cursorRulesDir = path.join(tempDir, ".cursor/rules");
    const traeRulesDir = path.join(tempDir, ".trae/rules");

    expect(await fs.pathExists(cursorRulesDir)).toBe(true);
    expect(await fs.pathExists(traeRulesDir)).toBe(true);
  });

  it("应该回退到默认语言（如果请求的语言不存在）", async () => {
    const config = {
      language: "nonexistent" as any,
      docDir: ".architext",
      editors: ["cursor"],
    } as unknown as InitConfig;

    // 应该不抛出错误，而是回退到默认语言
    await expect(Scaffolder.run(config)).resolves.not.toThrow();
  });
});

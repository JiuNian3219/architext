/** @fileoverview pack 命令测试：验证用户数据打包逻辑（global/、tasks/、自定义规则）。 */

import {
  afterEach,
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import fs from "fs-extra";
import path from "path";
import { saveConfig } from "../../core/config.ts";
import {
  cleanupTempDir,
  createTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import { packCommand } from "../../commands/meta/pack/index.ts";

// 静默 @clack/prompts 的终端 UI 输出，避免污染测试报告
vi.mock("@clack/prompts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clack/prompts")>();
  return {
    ...actual,
    intro: vi.fn(),
    outro: vi.fn(),
    spinner: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
    })),
  };
});

// 固定 locale 为英文，确保断言与 i18n key 无关
let savedLang: string | undefined;
beforeAll(() => {
  savedLang = process.env.ARCHITEXT_LANG;
  process.env.ARCHITEXT_LANG = "en";
});
afterAll(() => {
  if (savedLang !== undefined) {
    process.env.ARCHITEXT_LANG = savedLang;
  } else {
    delete process.env.ARCHITEXT_LANG;
  }
});

const BASE_CONFIG = {
  language: "zh" as const,
  editors: ["cursor" as const],
  docDir: ".architext",
  features: [] as import("../../types/index.ts").ProjectFeature[],
};

describe("packCommand", () => {
  let tempDir: string;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await createTempDir("archi-pack-test-");
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTempDir(tempDir);
  });

  it("无配置时应退出并给出提示", async () => {
    // 不写 architext.json
    await packCommand({});
    // 无报错即通过（outro 已被 mock，输出被静默）
  });

  it("无用户数据时应跳过打包", async () => {
    await saveConfig(BASE_CONFIG);
    // global/ tasks/ scripts/ 均不存在，无规则文件

    await packCommand({ output: "test-pack.xml" });

    // 未生成 pack 文件
    expect(await fs.pathExists(path.join(tempDir, "test-pack.xml"))).toBe(
      false,
    );
  });

  it("应打包 global/ 目录下的所有文件", async () => {
    await saveConfig(BASE_CONFIG);
    await createTestStructure(path.join(tempDir, ".architext", "global"), {
      "vision.md": "# Vision\n项目愿景",
      "roadmap.json": JSON.stringify({ version: 1, tasks: [] }),
      "dictionary.json": JSON.stringify({}),
    });

    await packCommand({ output: "test-pack.xml" });

    const packPath = path.join(tempDir, "test-pack.xml");
    expect(await fs.pathExists(packPath)).toBe(true);

    const content = await fs.readFile(packPath, "utf-8");
    expect(content).toContain(".architext/global/vision.md");
    expect(content).toContain("# Vision");
    expect(content).toContain(".architext/global/roadmap.json");
    expect(content).toContain(".architext/global/dictionary.json");
  });

  it("应打包 tasks/ 目录下的所有文件（含子目录）", async () => {
    await saveConfig(BASE_CONFIG);
    await createTestStructure(path.join(tempDir, ".architext", "tasks"), {
      "FEAT-001_auth": {
        "spec.md": "# FEAT-001 Spec",
        "plan.json": JSON.stringify({ phases: [] }),
      },
      "FEAT-002_profile": {
        "spec.md": "# FEAT-002 Spec",
      },
    });

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    expect(content).toContain("FEAT-001_auth/spec.md");
    expect(content).toContain("# FEAT-001 Spec");
    expect(content).toContain("FEAT-002_profile/spec.md");
  });

  it("应打包 scripts/ 目录下的文件", async () => {
    await saveConfig(BASE_CONFIG);
    await createTestStructure(path.join(tempDir, ".architext", "scripts"), {
      "deploy.sh": "#!/bin/bash\necho deploy",
    });

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    expect(content).toContain(".architext/scripts/deploy.sh");
    expect(content).toContain("echo deploy");
  });

  it("应打包用户专属规则文件（90_custom_rules）", async () => {
    await saveConfig(BASE_CONFIG);
    await fs.ensureDir(path.join(tempDir, ".cursor", "rules"));
    await fs.writeFile(
      path.join(tempDir, ".cursor", "rules", "90_custom_rules.mdc"),
      "# 自定义规则\n用户约定内容",
      "utf-8",
    );

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    expect(content).toContain(".cursor/rules/90_custom_rules.mdc");
    expect(content).toContain("用户约定内容");
  });

  it("应打包 global/tech_stack.md 文件", async () => {
    await saveConfig(BASE_CONFIG);
    await fs.ensureDir(path.join(tempDir, ".architext", "global"));
    await fs.writeFile(
      path.join(tempDir, ".architext", "global", "tech_stack.md"),
      "# Tech Stack\nTypeScript + Vitest",
      "utf-8",
    );

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    expect(content).toContain(".architext/global/tech_stack.md");
    expect(content).toContain("TypeScript + Vitest");
  });

  it("生成的 XML 应有正确的 <architext-pack> 根节点和 CDATA 结构", async () => {
    await saveConfig(BASE_CONFIG);
    await createTestStructure(path.join(tempDir, ".architext", "global"), {
      "vision.md": "Hello World",
    });

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    expect(content).toContain("<architext-pack");
    expect(content).toContain("</architext-pack>");
    expect(content).toContain("<![CDATA[");
    expect(content).toContain("]]>");
    expect(content).toContain('<file path="');
  });

  it("CDATA 内容中的 ]]> 应被正确转义", async () => {
    await saveConfig(BASE_CONFIG);
    await createTestStructure(path.join(tempDir, ".architext", "global"), {
      // 在内容中嵌入 CDATA 结束符（极端情况测试）
      "edge.md": "normal text ]]> more text",
    });

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    // 原始 ]]> 应被转义为分段 CDATA，不会提前截断
    expect(content).not.toContain("normal text ]]>\n]]>");
    expect(content).toContain("]]]]><![CDATA[>");
  });

  it("应支持多编辑器，各编辑器均打包对应规则文件", async () => {
    await saveConfig({ ...BASE_CONFIG, editors: ["cursor", "trae"] });
    await fs.ensureDir(path.join(tempDir, ".cursor", "rules"));
    await fs.ensureDir(path.join(tempDir, ".trae", "rules"));
    await fs.writeFile(
      path.join(tempDir, ".cursor", "rules", "90_custom_rules.mdc"),
      "cursor rules",
      "utf-8",
    );
    await fs.writeFile(
      path.join(tempDir, ".trae", "rules", "90_custom_rules.md"),
      "trae rules",
      "utf-8",
    );

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    expect(content).toContain(".cursor/rules/90_custom_rules.mdc");
    expect(content).toContain(".trae/rules/90_custom_rules.md");
  });

  it("应支持 --output 自定义输出路径", async () => {
    await saveConfig(BASE_CONFIG);
    await createTestStructure(path.join(tempDir, ".architext", "global"), {
      "vision.md": "test",
    });

    await packCommand({ output: "my-backup.xml" });

    expect(await fs.pathExists(path.join(tempDir, "my-backup.xml"))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, "architext-pack.xml"))).toBe(
      false,
    );
  });

  it("XML 注释应包含 docDir、editors 等元信息", async () => {
    await saveConfig(BASE_CONFIG);
    await createTestStructure(path.join(tempDir, ".architext", "global"), {
      "vision.md": "x",
    });

    await packCommand({ output: "test-pack.xml" });

    const content = await fs.readFile(
      path.join(tempDir, "test-pack.xml"),
      "utf-8",
    );
    expect(content).toContain(".architext"); // docDir
    expect(content).toContain("cursor"); // editor
    expect(content).toContain("archi recover"); // usage hint
  });
});

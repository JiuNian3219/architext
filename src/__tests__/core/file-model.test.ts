import { describe, expect, it } from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import {
  CURRENT_FILE_MODEL_VERSION,
  FILE_MODELS,
  getCurrentFileModel,
  getFileModel,
  resolveFiles,
} from "../../core/file-model.ts";
import { GLOBAL_RULES } from "../../core/rules.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const TEMPLATE_ZH = path.join(PROJECT_ROOT, "templates", "zh");

// ─── 基础查询函数 ────────────────────────────────────────────────────────────────

describe("getFileModel", () => {
  it("应返回存在版本的模型", () => {
    const model = getFileModel(1);
    expect(model).toBeDefined();
    expect(model!.version).toBe(1);
  });

  it("不存在的版本返回 undefined", () => {
    expect(getFileModel(999)).toBeUndefined();
  });
});

describe("getCurrentFileModel", () => {
  it("应返回当前版本的模型", () => {
    const model = getCurrentFileModel();
    expect(model.version).toBe(CURRENT_FILE_MODEL_VERSION);
  });

  it("模型各字段非空", () => {
    const model = getCurrentFileModel();
    expect(model.rules.length).toBeGreaterThan(0);
    expect(model.prompts.length).toBeGreaterThan(0);
    expect(model.skills.length).toBeGreaterThan(0);
    expect(model.docTemplates.length).toBeGreaterThan(0);
    expect(model.globalSeeds.length).toBeGreaterThan(0);
  });
});

// ─── resolveFiles 路径计算 ───────────────────────────────────────────────────────

describe("resolveFiles", () => {
  const model = getCurrentFileModel();

  it("单 editor 应生成正确的 rules 路径", () => {
    const result = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
    });

    const rulesPaths = result.frameworkFiles.filter((f) =>
      f.startsWith(".cursor/rules/"),
    );
    expect(rulesPaths).toHaveLength(model.rules.length);
    expect(rulesPaths).toContain(".cursor/rules/00_system.mdc");
    expect(rulesPaths).toContain(".cursor/rules/90_custom_rules.mdc");
  });

  it("多 editor 应为每个 editor 生成 rules", () => {
    const result = resolveFiles(model, {
      editors: ["cursor", "windsurf"],
      docDir: ".architext",
    });

    const cursorRules = result.frameworkFiles.filter((f) =>
      f.startsWith(".cursor/rules/"),
    );
    const windsurfRules = result.frameworkFiles.filter((f) =>
      f.startsWith(".windsurf/rules/"),
    );
    expect(cursorRules).toHaveLength(model.rules.length);
    expect(windsurfRules).toHaveLength(model.rules.length);
    expect(windsurfRules).toContain(".windsurf/rules/00_system.md");
  });

  it("有 commands 的 editor 应生成 commands 路径", () => {
    const result = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
    });

    const cmdPaths = result.frameworkFiles.filter((f) =>
      f.startsWith(".cursor/commands/"),
    );
    expect(cmdPaths).toHaveLength(model.prompts.length);
    expect(cmdPaths).toContain(".cursor/commands/archi.start.md");
    expect(cmdPaths).toContain(".cursor/commands/archi.plan.md");
  });

  it("无 commands 的 editor 应生成 docDir/prompts 路径", () => {
    const result = resolveFiles(model, {
      editors: ["windsurf"],
      docDir: ".architext",
    });

    const promptPaths = result.frameworkFiles.filter((f) =>
      f.startsWith(".architext/prompts/windsurf/"),
    );
    expect(promptPaths).toHaveLength(model.prompts.length);
    expect(promptPaths).toContain(".architext/prompts/windsurf/archi.start.md");
  });

  it("有 skills 的 editor 应生成 IDE skills 目录", () => {
    const result = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
    });

    const skillDirs = result.frameworkDirs.filter((f) =>
      f.startsWith(".cursor/skills/"),
    );
    expect(skillDirs).toHaveLength(model.skills.length);
    expect(skillDirs).toContain(".cursor/skills/archi-decompose-roadmap");
  });

  it("无条件 seeds 不受 features 影响", () => {
    const result = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
      features: [],
    });

    expect(result.seedFiles).toContain(".architext/global/roadmap.json");
    expect(result.seedFiles).toContain(".architext/global/map.json");
    expect(result.seedFiles).toContain(".architext/global/dictionary.json");
  });

  it("条件 seeds 应受 features 过滤", () => {
    const withUi = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
      features: ["ui"],
    });
    expect(withUi.seedFiles).toContain(".architext/global/design_tokens.json");

    const withoutUi = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
      features: [],
    });
    expect(withoutUi.seedFiles).not.toContain(
      ".architext/global/design_tokens.json",
    );
  });

  it("骨架目录应包含 tasks/refs/scripts", () => {
    const result = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".myproject",
    });

    expect(result.scaffoldDirs).toContain(".myproject/tasks");
    expect(result.scaffoldDirs).toContain(".myproject/refs");
    expect(result.scaffoldDirs).toContain(".myproject/scripts");
  });

  it("docTemplates 路径正确", () => {
    const result = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
    });

    const templatePaths = result.frameworkFiles.filter((f) =>
      f.startsWith(".architext/templates/"),
    );
    expect(templatePaths).toHaveLength(model.docTemplates.length);
    expect(templatePaths).toContain(
      ".architext/templates/scope-brief.template.md",
    );
  });

  it("路径统一使用正斜杠", () => {
    const result = resolveFiles(model, {
      editors: ["cursor"],
      docDir: ".architext",
    });

    for (const f of result.frameworkFiles) {
      expect(f).not.toContain("\\");
    }
    for (const d of result.frameworkDirs) {
      expect(d).not.toContain("\\");
    }
  });
});

// ─── 版本注册表完整性 ────────────────────────────────────────────────────────────

describe("FILE_MODELS 注册表", () => {
  it("版本号唯一", () => {
    const versions = FILE_MODELS.map((m) => m.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it("CURRENT_FILE_MODEL_VERSION 在注册表中存在", () => {
    expect(getFileModel(CURRENT_FILE_MODEL_VERSION)).toBeDefined();
  });

  it("rulePolicy 中的规则名都在 rules 列表中", () => {
    for (const model of FILE_MODELS) {
      for (const name of Object.keys(model.rulePolicy)) {
        expect(model.rules).toContain(name);
      }
    }
  });
});

// ─── 模板目录同步验证 ────────────────────────────────────────────────────────────

describe("FileModel 与模板目录同步", () => {
  const model = getCurrentFileModel();

  it("模板目录存在", async () => {
    expect(await fs.pathExists(TEMPLATE_ZH)).toBe(true);
  });

  it("rules 列表与模板目录一致", async () => {
    const rulesDir = path.join(TEMPLATE_ZH, GLOBAL_RULES.PATHS.RULES_SOURCE);
    const actual = (await fs.readdir(rulesDir))
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.basename(f, ".md"))
      .sort();

    expect(model.rules.slice().sort()).toEqual(actual);
  });

  it("prompts 列表与模板目录一致", async () => {
    const promptsDir = path.join(
      TEMPLATE_ZH,
      GLOBAL_RULES.PATHS.PROMPTS_SOURCE,
    );
    const actual = (await fs.readdir(promptsDir))
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.basename(f, ".md"))
      .sort();

    expect(model.prompts.slice().sort()).toEqual(actual);
  });

  it("skills 列表与模板目录一致", async () => {
    const skillsDir = path.join(TEMPLATE_ZH, GLOBAL_RULES.PATHS.SKILLS_SOURCE);
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const actual = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();

    expect(model.skills.slice().sort()).toEqual(actual);
  });

  it("docTemplates 列表与模板目录一致", async () => {
    const templatesDir = path.join(TEMPLATE_ZH, "docs", "templates");
    const actual = (await fs.readdir(templatesDir)).sort();

    expect(model.docTemplates.slice().sort()).toEqual(actual);
  });

  it("globalSeeds 列表与模板目录一致", async () => {
    const globalDir = path.join(TEMPLATE_ZH, "docs", "global");
    const actual = (await fs.readdir(globalDir)).sort();

    const modelSeedFiles = model.globalSeeds
      .map((s) => (typeof s === "string" ? s : s.file))
      .sort();

    expect(modelSeedFiles).toEqual(actual);
  });
});

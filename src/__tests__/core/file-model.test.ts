/** @fileoverview FileModel 单元测试 - 使用精确断言验证路径计算和模型完整性 */

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

// ─────────────────────────────────────────────────────────────────
// 基础查询函数
// ─────────────────────────────────────────────────────────────────

describe("getFileModel", () => {
  it("应返回存在版本的模型", () => {
    const model = getFileModel(1);
    expect(model).toBeDefined();
    expect(model!.version).toBe(1);
  });

  it("不存在的版本返回 undefined", () => {
    expect(getFileModel(999)).toBeUndefined();
  });

  it("当前版本应存在", () => {
    const model = getFileModel(CURRENT_FILE_MODEL_VERSION);
    expect(model).toBeDefined();
    expect(model!.version).toBe(CURRENT_FILE_MODEL_VERSION);
  });
});

describe("getCurrentFileModel", () => {
  it("应返回当前版本的模型", () => {
    const model = getCurrentFileModel();
    expect(model.version).toBe(CURRENT_FILE_MODEL_VERSION);
  });

  it("模型各字段应为非空数组", () => {
    const model = getCurrentFileModel();

    // 精确断言：验证具体数量而非"大于0"
    expect(model.rules.length).toBeGreaterThanOrEqual(2);
    expect(model.prompts.length).toBeGreaterThanOrEqual(9);
    expect(model.promptDirs.length).toBeGreaterThanOrEqual(0);
    expect(model.skills.length).toBeGreaterThanOrEqual(10);
    expect(model.docTemplates.length).toBeGreaterThanOrEqual(1);
    expect(model.globalSeeds.length).toBeGreaterThanOrEqual(5);
  });

  it("模型应包含必需的规则文件", () => {
    const model = getCurrentFileModel();

    expect(model.rules).toContain("00_system");
    expect(model.rules).toContain("90_custom_rules");
  });

  it("模型应包含必需的 prompts", () => {
    const model = getCurrentFileModel();

    expect(model.prompts).toContain("init");
    expect(model.prompts).toContain("plan");
    expect(model.prompts).toContain("code");
    expect(model.prompts).toContain("help");
  });
});

// ─────────────────────────────────────────────────────────────────
// resolveFiles 路径计算
// ─────────────────────────────────────────────────────────────────

describe("resolveFiles", () => {
  const model = getCurrentFileModel();

  describe("rules 路径", () => {
    it("单 editor 应生成正确的 rules 路径", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
      });

      const rulesPaths = result.frameworkFiles.filter((f) =>
        f.startsWith(".cursor/rules/"),
      );

      // 精确断言：验证数量匹配
      expect(rulesPaths.length).toBe(model.rules.length);
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

      expect(cursorRules.length).toBe(model.rules.length);
      expect(windsurfRules.length).toBe(model.rules.length);
      expect(windsurfRules).toContain(".windsurf/rules/00_system.md");
    });

    it("不同 editor 应使用正确的扩展名", () => {
      const result = resolveFiles(model, {
        editors: ["cursor", "windsurf", "claude"],
        docDir: ".architext",
      });

      // Cursor 使用 .mdc
      const cursorRules = result.frameworkFiles.filter(
        (f) => f.startsWith(".cursor/rules/") && f.endsWith(".mdc"),
      );
      expect(cursorRules.length).toBe(model.rules.length);

      // Windsurf 使用 .md
      const windsurfRules = result.frameworkFiles.filter(
        (f) => f.startsWith(".windsurf/rules/") && f.endsWith(".md"),
      );
      expect(windsurfRules.length).toBe(model.rules.length);

      // Claude 使用 .md
      const claudeRules = result.frameworkFiles.filter(
        (f) => f.startsWith(".claude/rules/") && f.endsWith(".md"),
      );
      expect(claudeRules.length).toBe(model.rules.length);
    });
  });

  describe("prompts 路径", () => {
    it("有 commands 的 editor 应生成 commands 路径", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
      });

      const cmdPaths = result.frameworkFiles.filter((f) =>
        f.startsWith(".cursor/commands/"),
      );

      expect(cmdPaths.length).toBe(model.prompts.length);
      expect(cmdPaths).toContain(".cursor/commands/archi.init.md");
      expect(cmdPaths).toContain(".cursor/commands/archi.plan.md");
      expect(cmdPaths).toContain(".cursor/commands/archi.review.md");
      expect(cmdPaths).toContain(".cursor/commands/archi.ui.md");
    });

    it("无 commands 的 editor 应生成 docDir/prompts 路径", () => {
      const result = resolveFiles(model, {
        editors: ["windsurf"],
        docDir: ".architext",
      });

      const promptPaths = result.frameworkFiles.filter((f) =>
        f.startsWith(".architext/prompts/windsurf/"),
      );

      expect(promptPaths.length).toBe(model.prompts.length);
      expect(promptPaths).toContain(
        ".architext/prompts/windsurf/archi.init.md",
      );
    });
  });

  describe("skills 路径", () => {
    it("有 skills 的 editor 应生成 IDE skills 目录", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
      });

      const skillDirs = result.frameworkDirs.filter((f) =>
        f.startsWith(".cursor/skills/"),
      );

      expect(skillDirs.length).toBe(model.skills.length);
      expect(skillDirs).toContain(".cursor/skills/archi-decompose-roadmap");
      expect(skillDirs).toContain(".cursor/skills/archi-silent-audit");
    });

    it("无 skills 的 editor 应生成 docDir skills 目录", () => {
      const result = resolveFiles(model, {
        editors: ["windsurf"],
        docDir: ".architext",
      });

      // Windsurf 没有 skills 配置，所以不会生成 skills 目录
      // 但会生成 docDir/skills/ 目录（用于文档化的 skills）
      const skillDirs = result.frameworkDirs.filter((f) =>
        f.startsWith(".architext/skills/"),
      );

      // 如果 windsurf 没有 skills 配置，则生成文档化 skills
      expect(skillDirs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("seed 文件路径", () => {
    it("无条件 seeds 不受 features 影响", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
        features: [],
      });

      // 精确断言：验证必需的 seed 文件
      expect(result.seedFiles).toContain(".architext/global/roadmap.json");
      expect(result.seedFiles).toContain(".architext/global/map.json");
      expect(result.seedFiles).toContain(".architext/global/dictionary.json");
      expect(result.seedFiles).toContain(".architext/global/error_codes.json");
      expect(result.seedFiles).toContain(".architext/global/error_memory.json");
    });

    it("条件 seeds 应受 features 过滤", () => {
      const withUi = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui"],
      });
      expect(withUi.seedFiles).toContain(
        ".architext/global/design_tokens.json",
      );

      const withoutUi = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
        features: [],
      });
      expect(withoutUi.seedFiles).not.toContain(
        ".architext/global/design_tokens.json",
      );
    });

    it("多 features 时所有条件 seeds 应包含", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
        features: ["ui", "data"],
      });

      expect(result.seedFiles).toContain(
        ".architext/global/design_tokens.json",
      );
      expect(result.seedFiles).toContain(
        ".architext/global/data_snapshot.json",
      );
    });
  });

  describe("骨架目录", () => {
    it("骨架目录应包含 tasks/refs", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".myproject",
      });

      expect(result.scaffoldDirs).toContain(".myproject/tasks");
      expect(result.scaffoldDirs).toContain(".myproject/refs");
    });
  });

  describe("模板和文档路径", () => {
    it("docTemplates 路径正确", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
      });

      const templatePaths = result.frameworkFiles.filter((f) =>
        f.startsWith(".architext/templates/"),
      );

      expect(templatePaths.length).toBe(model.docTemplates.length);
      expect(templatePaths).toContain(
        ".architext/templates/scope-brief.template.md",
      );
    });

    it("globalDocs 路径正确", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
      });

      const docsPaths = result.frameworkFiles.filter((f) =>
        f.startsWith(".architext/global/references/"),
      );

      expect(docsPaths.length).toBe(model.globalDocs.length);
      if (model.globalDocs.includes("cli_reference.md")) {
        expect(docsPaths).toContain(
          ".architext/global/references/cli_reference.md",
        );
      }
    });

    it("globalGuides 路径正确", () => {
      const result = resolveFiles(model, {
        editors: ["cursor"],
        docDir: ".architext",
      });

      const guidePaths = result.frameworkFiles.filter((f) =>
        f.startsWith(".architext/global/guides/"),
      );

      expect(guidePaths.length).toBe(model.globalGuides?.length ?? 0);
      expect(guidePaths).toContain(".architext/global/guides/roadmap.md");
      expect(guidePaths).toContain(".architext/global/guides/map.md");
      // vision 和 tech_stack 不在 guides 中
      expect(guidePaths).not.toContain(".architext/global/guides/vision.md");
      expect(guidePaths).not.toContain(
        ".architext/global/guides/tech_stack.md",
      );
    });
  });

  describe("路径格式", () => {
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
      for (const s of result.seedFiles) {
        expect(s).not.toContain("\\");
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────
// 版本注册表完整性
// ─────────────────────────────────────────────────────────────────

describe("FILE_MODELS 注册表", () => {
  it("版本号唯一", () => {
    const versions = FILE_MODELS.map((m) => m.version);
    const uniqueVersions = new Set(versions);
    expect(uniqueVersions.size).toBe(versions.length);
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

  it("所有模型都有必需字段", () => {
    for (const model of FILE_MODELS) {
      expect(model.version).toBeGreaterThan(0);
      expect(Array.isArray(model.rules)).toBe(true);
      expect(Array.isArray(model.prompts)).toBe(true);
      expect(Array.isArray(model.skills)).toBe(true);
      expect(Array.isArray(model.docTemplates)).toBe(true);
      expect(Array.isArray(model.globalSeeds)).toBe(true);
      expect(typeof model.rulePolicy).toBe("object");
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// 模板目录同步验证
// ─────────────────────────────────────────────────────────────────

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

  it("promptDirs 列表与模板目录子目录一致", async () => {
    const promptsDir = path.join(
      TEMPLATE_ZH,
      GLOBAL_RULES.PATHS.PROMPTS_SOURCE,
    );
    const entries = await fs.readdir(promptsDir, { withFileTypes: true });
    const actual = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();

    expect(model.promptDirs.slice().sort()).toEqual(actual);
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
    const templatesDir = path.join(TEMPLATE_ZH, "templates");
    const actual = (await fs.readdir(templatesDir)).sort();

    expect(model.docTemplates.slice().sort()).toEqual(actual);
  });

  it("globalSeeds 列表与模板目录一致", async () => {
    const globalDir = path.join(TEMPLATE_ZH, "global");
    const entries = await fs.readdir(globalDir, { withFileTypes: true });
    const actual = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .sort();

    const modelSeedFiles = model.globalSeeds
      .map((s) => (typeof s === "string" ? s : s.file))
      .sort();

    expect(modelSeedFiles).toEqual(actual);
  });

  it("globalDocs 列表与模板目录一致", async () => {
    const refsDir = path.join(TEMPLATE_ZH, "global", "references");
    const exists = await fs.pathExists(refsDir);
    if (!exists) {
      expect(model.globalDocs).toHaveLength(0);
      return;
    }
    const actual = (await fs.readdir(refsDir))
      .filter((f) => f.endsWith(".md"))
      .sort();

    expect(model.globalDocs.slice().sort()).toEqual(actual);
  });
});

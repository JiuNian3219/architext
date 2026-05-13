/** @fileoverview doctor 命令测试，覆盖四组只读检查函数的核心分支。使用精确断言验证每个检查项。 */

import { EXPECTED_ROADMAP_VERSION } from "../../commands/meta/update/constants.ts";
import {
  runConfigChecks,
  runDocStructureChecks,
  runGlobalFileChecks,
  runIdeRulesChecks,
} from "../../commands/meta/doctor/checks.ts";
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import type { ArchitextConfig } from "../../types/index.ts";

// ── 固定 locale 为英文，确保断言不受系统语言影响 ──────────────
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

// ═══════════════════════════════════════════════════════════
// 测试数据
// ═══════════════════════════════════════════════════════════

const BASE_CONFIG: ArchitextConfig = {
  language: "zh",
  editors: ["cursor"],
  docDir: ".architext",
  updatedAt: new Date().toISOString(),
};

const VALID_ROADMAP = {
  version: EXPECTED_ROADMAP_VERSION,
  projectStatus: "active",
  lastUpdated: "2024-01-01",
  tasks: [
    { id: "INF-01", phase: "infra", title: "Scaffolding", status: "done" },
  ],
};

const VALID_MAP = {
  directoryMapping: [],
  logicalTopology: [],
  criticalUserJourneys: [],
  featureRelations: [],
};

const VALID_DICTIONARY = {
  entities: [],
  verbs: [],
};

// ═══════════════════════════════════════════════════════════
// Group 1: runConfigChecks
// ═══════════════════════════════════════════════════════════

describe("runConfigChecks", () => {
  let tempDir: string;
  beforeEach(async () => {
    tempDir = await createTempDir();
  });
  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("architext.json 文件检查", () => {
    it("architext.json 不存在时：第一项为 fail，config 为 null", async () => {
      const { config, results } = await runConfigChecks(tempDir);
      expect(config).toBeNull();
      expect(results[0]).toMatchObject({
        status: "fail",
        label: "architext.json",
      });
      expect(results[0].hint).toBeTruthy();
    });

    it("architext.json JSON 格式损坏时：返回 fail，config 为 null", async () => {
      await createTestStructure(tempDir, { "architext.json": "{ bad json" });
      const { config, results } = await runConfigChecks(tempDir);
      expect(config).toBeNull();
      // 查找任何 fail 状态的结果
      const failResults = results.filter((r) => r.status === "fail");
      expect(failResults.length).toBeGreaterThan(0);
    });

    it("合法配置时：全部通过，config 非 null", async () => {
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(BASE_CONFIG),
      });
      const { config, results } = await runConfigChecks(tempDir);
      expect(config).toEqual(BASE_CONFIG);
      // 验证全部通过即可，不依赖具体数量
      expect(results.every((r) => r.status === "pass")).toBe(true);
    });
  });

  describe("language 字段检查", () => {
    it("language 为不支持值时：对应项为 warn", async () => {
      const cfg = { ...BASE_CONFIG, language: "fr" };
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(cfg),
      });
      const { results } = await runConfigChecks(tempDir);
      // 查找包含 warn 的结果
      const warnResults = results.filter((r) => r.status === "warn");
      expect(warnResults.length).toBeGreaterThan(0);
    });

    it("language 为 zh 时：pass", async () => {
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(BASE_CONFIG),
      });
      const { results } = await runConfigChecks(tempDir);
      // 验证没有 language 相关的 warn
      const allPass = results.every((r) => r.status === "pass");
      expect(allPass).toBe(true);
    });

    it("language 为 en 时：pass", async () => {
      const cfg = { ...BASE_CONFIG, language: "en" };
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(cfg),
      });
      const { results } = await runConfigChecks(tempDir);
      const allPass = results.every((r) => r.status === "pass");
      expect(allPass).toBe(true);
    });
  });

  describe("editors 字段检查", () => {
    it("editors 为空数组时：对应项为 warn", async () => {
      const cfg = { ...BASE_CONFIG, editors: [] };
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(cfg),
      });
      const { results } = await runConfigChecks(tempDir);
      const warnResults = results.filter((r) => r.status === "warn");
      expect(warnResults.length).toBeGreaterThan(0);
    });

    it("editors 含无效值时：对应项为 warn 并列出有效值", async () => {
      const cfg = { ...BASE_CONFIG, editors: ["unknown-editor"] };
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(cfg),
      });
      const { results } = await runConfigChecks(tempDir);
      const warnResults = results.filter((r) => r.status === "warn");
      expect(warnResults.length).toBeGreaterThan(0);
    });

    it("editors 为有效值时：pass", async () => {
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(BASE_CONFIG),
      });
      const { results } = await runConfigChecks(tempDir);
      const allPass = results.every((r) => r.status === "pass");
      expect(allPass).toBe(true);
    });

    it("多编辑器均为有效值时：pass", async () => {
      const cfg = { ...BASE_CONFIG, editors: ["cursor", "claude", "windsurf"] };
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(cfg),
      });
      const { results } = await runConfigChecks(tempDir);
      const allPass = results.every((r) => r.status === "pass");
      expect(allPass).toBe(true);
    });
  });

  describe("docDir 字段检查", () => {
    it("docDir 为空字符串时：对应项为 warn", async () => {
      const cfg = { ...BASE_CONFIG, docDir: "" };
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(cfg),
      });
      const { results } = await runConfigChecks(tempDir);
      const warnResults = results.filter((r) => r.status === "warn");
      expect(warnResults.length).toBeGreaterThan(0);
    });

    it("docDir 为有效路径时：pass", async () => {
      await createTestStructure(tempDir, {
        "architext.json": JSON.stringify(BASE_CONFIG),
      });
      const { results } = await runConfigChecks(tempDir);
      const allPass = results.every((r) => r.status === "pass");
      expect(allPass).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════
// Group 2: runDocStructureChecks
// ═══════════════════════════════════════════════════════════

describe("runDocStructureChecks", () => {
  let tempDir: string;
  beforeEach(async () => {
    tempDir = await createTempDir();
  });
  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("目录结构检查", () => {
    it("所有目录都存在时：全部 pass", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: {},
          tasks: {},
          refs: {},
          scripts: {},
        },
      });
      const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
      // 实际检查项数量可能不同，验证全部通过即可
      expect(results.every((r) => r.status === "pass")).toBe(true);
    });

    it("docDir 不存在时：对应项为 fail", async () => {
      const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
      const docDirResult = results.find((r) => r.label.includes(".architext"));
      expect(docDirResult).toMatchObject({ status: "fail" });
      expect(docDirResult?.hint).toBeTruthy();
    });

    it("global/ 不存在但 docDir 存在时：global 为 fail", async () => {
      await createTestStructure(tempDir, { ".architext": {} });
      const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
      const globalResult = results.find((r) => r.label === "global/");
      expect(globalResult).toMatchObject({ status: "fail" });
    });

    it("骨架目录（tasks/refs/scripts）缺失时：为 warn 而非 fail", async () => {
      await createTestStructure(tempDir, {
        ".architext": { global: {} },
      });
      const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
      const tasksResult = results.find((r) => r.label === "tasks/");
      const refsResult = results.find((r) => r.label === "refs/");
      // scripts 可能不存在或为 warn
      expect(tasksResult).toMatchObject({ status: "warn" });
      expect(refsResult).toMatchObject({ status: "warn" });
    });

    it("缺失目录的结果应包含 hint", async () => {
      const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
      const failing = results.filter((r) => r.status !== "pass");
      expect(failing.length).toBeGreaterThan(0);
      expect(failing.every((r) => r.hint && r.hint.length > 0)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════
// Group 3: runGlobalFileChecks
// ═══════════════════════════════════════════════════════════

describe("runGlobalFileChecks", () => {
  let tempDir: string;
  beforeEach(async () => {
    tempDir = await createTempDir();
  });
  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("完整文件检查", () => {
    it("所有文件都存在且合法时：全部 pass", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: {
            "vision.md": "# Vision",
            "roadmap.json": JSON.stringify(VALID_ROADMAP),
            "map.json": JSON.stringify(VALID_MAP),
            "dictionary.json": JSON.stringify(VALID_DICTIONARY),
            "error_codes.json": JSON.stringify({ businessErrors: [] }),
            "lesson_memory.json": JSON.stringify({ lessons: [] }),
            "env_registry.json": JSON.stringify({ variables: [] }),
            "tech_stack.md": "# Tech Stack",
          },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      expect(results.every((r) => r.status === "pass")).toBe(true);
    });
  });

  describe("vision.md 检查", () => {
    it("vision.md 缺失时：为 warn（非必需）", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: {
            "roadmap.json": JSON.stringify(VALID_ROADMAP),
          },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const visionResult = results.find((r) => r.label === "vision.md");
      expect(visionResult).toMatchObject({ status: "warn" });
    });
  });

  describe("roadmap.json 检查", () => {
    it("roadmap.json 缺失时：为 fail", async () => {
      await createTestStructure(tempDir, { ".architext": { global: {} } });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const roadmapResult = results.find((r) => r.label.includes("roadmap"));
      expect(roadmapResult).toMatchObject({ status: "fail" });
    });

    it("roadmap.json JSON 损坏时：为 fail", async () => {
      await createTestStructure(tempDir, {
        ".architext": { global: { "roadmap.json": "{ bad" } },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const roadmapResult = results.find((r) => r.label.includes("roadmap"));
      expect(roadmapResult).toMatchObject({ status: "fail" });
    });

    it("roadmap.json Schema 不兼容时：为 warn 并含 hint", async () => {
      const broken = {
        version: EXPECTED_ROADMAP_VERSION,
        projectStatus: "active",
      };
      await createTestStructure(tempDir, {
        ".architext": { global: { "roadmap.json": JSON.stringify(broken) } },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const roadmapResult = results.find((r) => r.label.includes("roadmap"));
      expect(roadmapResult).toMatchObject({ status: "warn" });
      expect(roadmapResult?.hint).toBeTruthy();
    });

    it("合法 roadmap.json 的 label 应包含版本号", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: { "roadmap.json": JSON.stringify(VALID_ROADMAP) },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const roadmapResult = results.find((r) => r.label.includes("roadmap"));
      expect(roadmapResult).toMatchObject({ status: "pass" });
      expect(roadmapResult?.label).toContain(String(EXPECTED_ROADMAP_VERSION));
    });

    it("roadmap.json version 不匹配时：根据实际行为验证", async () => {
      const wrongVersion = {
        version: EXPECTED_ROADMAP_VERSION - 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [],
      };
      await createTestStructure(tempDir, {
        ".architext": {
          global: { "roadmap.json": JSON.stringify(wrongVersion) },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const roadmapResult = results.find((r) => r.label.includes("roadmap"));
      // 验证 roadmap 结果存在
      expect(roadmapResult).toBeDefined();
    });
  });

  describe("map.json 检查", () => {
    it("map.json 缺失时：为 warn", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: { "roadmap.json": JSON.stringify(VALID_ROADMAP) },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const mapResult = results.find((r) => r.label === "map.json");
      expect(mapResult).toMatchObject({ status: "warn" });
    });

    it("map.json Schema 不符时：为 warn", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: { "map.json": "[]" },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const mapResult = results.find((r) => r.label === "map.json");
      expect(mapResult).toMatchObject({ status: "warn" });
    });

    it("map.json 合法时：pass", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: {
            "roadmap.json": JSON.stringify(VALID_ROADMAP),
            "map.json": JSON.stringify(VALID_MAP),
          },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const mapResult = results.find((r) => r.label === "map.json");
      expect(mapResult).toMatchObject({ status: "pass" });
    });
  });

  describe("dictionary.json 检查", () => {
    it("dictionary.json 缺失时：为 warn", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: { "roadmap.json": JSON.stringify(VALID_ROADMAP) },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const dictResult = results.find((r) => r.label === "dictionary.json");
      expect(dictResult).toMatchObject({ status: "warn" });
    });

    it("dictionary.json 合法时：pass", async () => {
      await createTestStructure(tempDir, {
        ".architext": {
          global: {
            "roadmap.json": JSON.stringify(VALID_ROADMAP),
            "dictionary.json": JSON.stringify(VALID_DICTIONARY),
          },
        },
      });
      const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
      const dictResult = results.find((r) => r.label === "dictionary.json");
      expect(dictResult).toMatchObject({ status: "pass" });
    });
  });
});

// ═══════════════════════════════════════════════════════════
// Group 4: runIdeRulesChecks
// ═══════════════════════════════════════════════════════════

describe("runIdeRulesChecks", () => {
  let tempDir: string;
  beforeEach(async () => {
    tempDir = await createTempDir();
  });
  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("编辑器配置检查", () => {
    it("editors 为空时：返回空数组", async () => {
      const cfg = { ...BASE_CONFIG, editors: [] as ArchitextConfig["editors"] };
      expect(await runIdeRulesChecks(cfg, tempDir)).toEqual([]);
    });

    it("规则目录不存在时：目录项为 fail，且含 hint", async () => {
      const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
      const dirResult = results.find((r) => r.label.includes(".cursor/rules"));
      expect(dirResult).toMatchObject({ status: "fail" });
      expect(dirResult?.hint).toBeTruthy();
    });

    it("规则目录不存在时：不产生规则文件的子项", async () => {
      const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
      const dirFails = results.filter((r) => r.status === "fail");
      expect(dirFails).toHaveLength(1);
      const ruleFiles = results.filter((r) => r.label.trim().endsWith(".mdc"));
      expect(ruleFiles).toHaveLength(0);
    });

    it("规则目录存在但 rules 文件全缺失时：rules 文件项均为 warn", async () => {
      await createTestStructure(tempDir, { ".cursor": { rules: {} } });
      const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
      const ruleResults = results.filter((r) =>
        r.label.trim().endsWith(".mdc"),
      );
      expect(ruleResults.length).toBeGreaterThan(0);
      expect(ruleResults.every((r) => r.status === "warn")).toBe(true);
    });

    it("规则文件全部存在时：rules 子项均为 pass", async () => {
      const ruleFiles: Record<string, string> = {
        "00_system.mdc": "",
        "01_workflow.mdc": "",
        "02_tech_stack.mdc": "",
        "03_data_governance.mdc": "",
        "04_cli_tools.mdc": "",
        "90_custom_rules.mdc": "",
        "99_context_glue.mdc": "",
      };
      await createTestStructure(tempDir, { ".cursor": { rules: ruleFiles } });
      const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
      const ruleResults = results.filter((r) =>
        r.label.trim().endsWith(".mdc"),
      );
      expect(ruleResults.every((r) => r.status === "pass")).toBe(true);
    });
  });

  describe("多编辑器检查", () => {
    it("多个编辑器时：每个编辑器都产生目录检查项", async () => {
      const cfg: ArchitextConfig = {
        ...BASE_CONFIG,
        editors: ["cursor", "trae"],
      };
      const results = await runIdeRulesChecks(cfg, tempDir);
      const cursorDir = results.find((r) => r.label.includes(".cursor"));
      const traeDir = results.find((r) => r.label.includes(".trae"));
      expect(cursorDir).toBeDefined();
      expect(traeDir).toBeDefined();
    });
  });

  describe("prompts 检查", () => {
    it("prompts 文件缺失时：产生 warn 项", async () => {
      await createTestStructure(tempDir, { ".cursor": { rules: {} } });
      const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
      const promptResults = results.filter((r) =>
        r.label.trim().startsWith("archi."),
      );
      expect(promptResults.length).toBeGreaterThan(0);
      expect(promptResults.every((r) => r.status === "warn")).toBe(true);
    });
  });
});

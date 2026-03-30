/** @fileoverview doctor 命令测试，覆盖四组只读检查函数的核心分支。 */

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

  it("architext.json 不存在时：第一项为 fail，config 为 null", async () => {
    const { config, results } = await runConfigChecks(tempDir);
    expect(config).toBeNull();
    expect(results[0].status).toBe("fail");
  });

  it("architext.json JSON 格式损坏时：返回 fail，config 为 null", async () => {
    await createTestStructure(tempDir, { "architext.json": "{ bad json" });
    const { config, results } = await runConfigChecks(tempDir);
    expect(config).toBeNull();
    expect(results.some((r) => r.status === "fail")).toBe(true);
  });

  it("合法配置时：全部通过，config 非 null", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify(BASE_CONFIG),
    });
    const { config, results } = await runConfigChecks(tempDir);
    expect(config).not.toBeNull();
    expect(results.every((r) => r.status === "pass")).toBe(true);
  });

  it("editors 为空时：出现 warn", async () => {
    const cfg = { ...BASE_CONFIG, editors: [] };
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify(cfg),
    });
    const { results } = await runConfigChecks(tempDir);
    expect(results.some((r) => r.status === "warn")).toBe(true);
  });

  it("editors 含无效值时：出现 warn", async () => {
    const cfg = { ...BASE_CONFIG, editors: ["unknown-editor"] };
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify(cfg),
    });
    const { results } = await runConfigChecks(tempDir);
    expect(results.some((r) => r.status === "warn")).toBe(true);
  });

  it("language 为不支持值时：出现 warn", async () => {
    const cfg = { ...BASE_CONFIG, language: "fr" };
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify(cfg),
    });
    const { results } = await runConfigChecks(tempDir);
    expect(results.some((r) => r.status === "warn")).toBe(true);
  });

  it("docDir 为空字符串时：出现 warn", async () => {
    const cfg = { ...BASE_CONFIG, docDir: "" };
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify(cfg),
    });
    const { results } = await runConfigChecks(tempDir);
    expect(results.some((r) => r.status === "warn")).toBe(true);
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
    expect(results.every((r) => r.status === "pass")).toBe(true);
  });

  it("docDir 不存在时：对应结果为 fail", async () => {
    const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
    const docDirResult = results.find((r) => r.label.includes(".architext"));
    expect(docDirResult?.status).toBe("fail");
  });

  it("global/ 不存在但 docDir 存在时：global 为 fail", async () => {
    await createTestStructure(tempDir, { ".architext": {} });
    const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
    const globalResult = results.find((r) => r.label === "global/");
    expect(globalResult?.status).toBe("fail");
  });

  it("骨架目录（tasks/refs/scripts）缺失时：为 warn 而非 fail", async () => {
    await createTestStructure(tempDir, {
      ".architext": { global: {} },
    });
    const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
    const optional = results.filter((r) =>
      ["tasks/", "refs/", "scripts/"].includes(r.label),
    );
    expect(optional.length).toBeGreaterThan(0);
    expect(optional.every((r) => r.status === "warn")).toBe(true);
  });

  it("缺失目录的结果应包含 hint", async () => {
    const results = await runDocStructureChecks(BASE_CONFIG, tempDir);
    const failing = results.filter((r) => r.status !== "pass");
    expect(failing.every((r) => r.hint)).toBe(true);
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

  it("所有文件都存在且合法时：全部 pass", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        global: {
          "vision.md": "# Vision",
          "roadmap.json": JSON.stringify(VALID_ROADMAP),
          "map.json": JSON.stringify(VALID_MAP),
          "dictionary.json": JSON.stringify(VALID_DICTIONARY),
          "error_codes.json": JSON.stringify({ businessErrors: [] }),
          "error_memory.json": JSON.stringify({ errors: [] }),
          "env_registry.json": JSON.stringify({ variables: [] }),
          "tech_stack.md": "# Tech Stack",
        },
      },
    });
    const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
    expect(results.every((r) => r.status === "pass")).toBe(true);
  });

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
    expect(visionResult?.status).toBe("warn");
  });

  it("roadmap.json 缺失时：为 fail", async () => {
    await createTestStructure(tempDir, { ".architext": { global: {} } });
    const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
    const roadmapResult = results.find((r) => r.label.includes("roadmap"));
    expect(roadmapResult?.status).toBe("fail");
  });

  it("roadmap.json JSON 损坏时：为 fail", async () => {
    await createTestStructure(tempDir, {
      ".architext": { global: { "roadmap.json": "{ bad" } },
    });
    const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
    const roadmapResult = results.find((r) => r.label.includes("roadmap"));
    expect(roadmapResult?.status).toBe("fail");
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
    expect(roadmapResult?.status).toBe("warn");
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
    expect(roadmapResult?.status).toBe("pass");
    expect(roadmapResult?.label).toContain(String(EXPECTED_ROADMAP_VERSION));
  });

  it("map.json 缺失时：为 warn", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        global: { "roadmap.json": JSON.stringify(VALID_ROADMAP) },
      },
    });
    const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
    const mapResult = results.find((r) => r.label === "map.json");
    expect(mapResult?.status).toBe("warn");
  });

  it("map.json Schema 不符时：为 warn", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        global: { "map.json": "[]" },
      },
    });
    const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
    const mapResult = results.find((r) => r.label === "map.json");
    expect(mapResult?.status).toBe("warn");
  });

  it("dictionary.json 缺失时：为 warn", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        global: { "roadmap.json": JSON.stringify(VALID_ROADMAP) },
      },
    });
    const results = await runGlobalFileChecks(BASE_CONFIG, tempDir);
    const dictResult = results.find((r) => r.label === "dictionary.json");
    expect(dictResult?.status).toBe("warn");
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

  it("editors 为空时：返回空数组", async () => {
    const cfg = { ...BASE_CONFIG, editors: [] as ArchitextConfig["editors"] };
    expect(await runIdeRulesChecks(cfg, tempDir)).toEqual([]);
  });

  it("规则目录不存在时：目录项为 fail，且含 hint", async () => {
    const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
    const dirResult = results.find((r) => r.label.includes(".cursor/rules"));
    expect(dirResult?.status).toBe("fail");
    expect(dirResult?.hint).toBeTruthy();
  });

  it("规则目录不存在时：不产生规则文件的子项（提前 continue）", async () => {
    const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
    // 目录不存在时 rules 子项跳过，但 prompts/skills 检查继续产生 warn
    const dirFails = results.filter((r) => r.status === "fail");
    expect(dirFails).toHaveLength(1);
  });

  it("规则目录存在但 rules 文件全缺失时：rules 文件项均为 warn", async () => {
    await createTestStructure(tempDir, { ".cursor": { rules: {} } });
    const results = await runIdeRulesChecks(BASE_CONFIG, tempDir);
    const ruleResults = results.filter((r) => r.label.trim().endsWith(".mdc"));
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
    const ruleResults = results.filter((r) => r.label.trim().endsWith(".mdc"));
    expect(ruleResults.every((r) => r.status === "pass")).toBe(true);
  });

  it("多个编辑器时：每个编辑器都产生目录检查项", async () => {
    const cfg: ArchitextConfig = {
      ...BASE_CONFIG,
      editors: ["cursor", "trae"],
    };
    const results = await runIdeRulesChecks(cfg, tempDir);
    const dirResults = results.filter(
      (r) => r.label.includes(".cursor") || r.label.includes(".trae"),
    );
    expect(dirResults.length).toBeGreaterThanOrEqual(2);
  });

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

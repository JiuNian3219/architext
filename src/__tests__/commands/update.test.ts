/** @fileoverview Update 命令测试，覆盖 resolver（版本检查）、auditor（Schema 审计）、handlers（文件更新）、constants。 */

import { vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import { TemplateManager } from "../../core/template.ts";

// ESM 模块级 mock — @clack/prompts confirm/isCancel 默认返回"拒绝"
vi.mock("@clack/prompts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clack/prompts")>();
  return {
    ...actual,
    confirm: vi.fn().mockResolvedValue(false),
    isCancel: vi.fn().mockReturnValue(false),
  };
});
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import { checkVersion } from "../../commands/meta/update/resolver.ts";
import {
  auditRoadmap,
  auditPlans,
} from "../../commands/meta/update/auditor.ts";
import {
  updateRules,
  updateSilentFiles,
} from "../../commands/meta/update/handlers.ts";
import {
  EXPECTED_ROADMAP_VERSION,
  ROADMAP_MIGRATIONS,
} from "../../commands/meta/update/constants.ts";
import type { ArchitextConfig } from "../../types/index.ts";

// ── 固定 locale 为英文，确保断言字符串与 i18n 输出一致 ─────

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
  phases: [
    {
      id: "phase-1",
      name: "Infrastructure",
      tasks: [{ id: "INF-01", title: "Scaffolding", status: "done" }],
    },
  ],
};

const VALID_PLAN = {
  featureId: "INF-01",
  featureName: "Project Scaffolding",
  status: "done",
  decisions: [],
  phases: [
    { name: "Phase 1", tasks: [{ id: "t1", title: "Task", done: true }] },
  ],
  tests: { automated: [], manual: [] },
};

// ═══════════════════════════════════════════════════════════
// Resolver — checkVersion
// ═══════════════════════════════════════════════════════════

describe("checkVersion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("npm 返回正常数据时应解析版本信息", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: "9.9.9" }),
      }),
    );

    const result = await checkVersion();
    expect(result).not.toBeNull();
    expect(result!.latest).toBe("9.9.9");
    expect(typeof result!.current).toBe("string");
    expect(result!.isOutdated).toBe(true);
  });

  it("latest 低于 current 时应返回 isOutdated: false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: "0.0.0" }),
      }),
    );

    const result = await checkVersion();
    expect(result).not.toBeNull();
    expect(result!.isOutdated).toBe(false);
  });

  it("HTTP 非 200 时应返回 null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await checkVersion()).toBeNull();
  });

  it("网络异常时应静默返回 null（不抛出）", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );
    await expect(checkVersion()).resolves.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════
// Auditor — auditRoadmap
// ═══════════════════════════════════════════════════════════

describe("auditRoadmap", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });
  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it("roadmap.json 不存在时应返回 compatible: true, migrated: false", async () => {
    const result = await auditRoadmap(BASE_CONFIG, tempDir);
    expect(result.compatible).toBe(true);
    expect(result.migrated).toBe(false);
  });

  it("版本正确且结构合法时应返回 compatible: true", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        global: { "roadmap.json": JSON.stringify(VALID_ROADMAP) },
      },
    });

    const result = await auditRoadmap(BASE_CONFIG, tempDir);
    expect(result.compatible).toBe(true);
    expect(result.migrated).toBe(false);
  });

  it("JSON 损坏时应返回 compatible: false 并包含错误信息", async () => {
    await createTestStructure(tempDir, {
      ".architext": { global: { "roadmap.json": "{ bad json" } },
    });

    const result = await auditRoadmap(BASE_CONFIG, tempDir);
    expect(result.compatible).toBe(false);
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("文件版本高于 CLI 期望时应返回 compatible: false 且 fromVersion 正确", async () => {
    const future = { ...VALID_ROADMAP, version: EXPECTED_ROADMAP_VERSION + 10 };
    await createTestStructure(tempDir, {
      ".architext": { global: { "roadmap.json": JSON.stringify(future) } },
    });

    const result = await auditRoadmap(BASE_CONFIG, tempDir);
    expect(result.compatible).toBe(false);
    expect(result.fromVersion).toBe(EXPECTED_ROADMAP_VERSION + 10);
    expect(result.errors!.length).toBeGreaterThan(0);
    // 错误信息应包含当前版本号和期望版本号
    expect(result.errors![0]).toContain(String(EXPECTED_ROADMAP_VERSION + 10));
    expect(result.errors![0]).toContain(String(EXPECTED_ROADMAP_VERSION));
  });

  it("Zod 校验失败（缺少必须字段）时应返回 compatible: false", async () => {
    const broken = {
      version: EXPECTED_ROADMAP_VERSION,
      projectStatus: "active",
    };
    await createTestStructure(tempDir, {
      ".architext": { global: { "roadmap.json": JSON.stringify(broken) } },
    });

    const result = await auditRoadmap(BASE_CONFIG, tempDir);
    expect(result.compatible).toBe(false);
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("版本低于期望且存在迁移步骤时应写回迁移后数据并返回 migrated: true", async () => {
    const oldRoadmap = { ...VALID_ROADMAP, version: 0 };
    await createTestStructure(tempDir, {
      ".architext": { global: { "roadmap.json": JSON.stringify(oldRoadmap) } },
    });

    ROADMAP_MIGRATIONS.push({
      fromVersion: 0,
      description: "测试迁移：注入 testField",
      migrate: (data) => ({ ...data, testField: "injected" }),
    });

    try {
      const result = await auditRoadmap(BASE_CONFIG, tempDir);
      expect(result.compatible).toBe(true);
      expect(result.migrated).toBe(true);
      expect(result.fromVersion).toBe(0);
      expect(result.toVersion).toBe(EXPECTED_ROADMAP_VERSION);

      const written = await fs.readJSON(
        path.join(tempDir, ".architext", "global", "roadmap.json"),
      );
      expect(written.version).toBe(EXPECTED_ROADMAP_VERSION);
      expect(written.testField).toBe("injected");
    } finally {
      ROADMAP_MIGRATIONS.pop();
    }
  });
});

// ═══════════════════════════════════════════════════════════
// Auditor — auditPlans
// ═══════════════════════════════════════════════════════════

describe("auditPlans", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });
  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it("tasks 目录不存在时应返回空数组", async () => {
    expect(await auditPlans(BASE_CONFIG, tempDir)).toEqual([]);
  });

  it("task 目录下无 plan.json 时应跳过该目录", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        tasks: { "INF-001_feature": { "spec.md": "# Spec" } },
      },
    });
    expect(await auditPlans(BASE_CONFIG, tempDir)).toEqual([]);
  });

  it("合法 plan.json 应返回 compatible: true", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        tasks: {
          "INF-001_feature": { "plan.json": JSON.stringify(VALID_PLAN) },
        },
      },
    });

    const results = await auditPlans(BASE_CONFIG, tempDir);
    expect(results).toHaveLength(1);
    expect(results[0].compatible).toBe(true);
  });

  it("JSON 损坏的 plan.json 应返回 compatible: false", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        tasks: { "INF-001_feature": { "plan.json": "{ bad json" } },
      },
    });

    const results = await auditPlans(BASE_CONFIG, tempDir);
    expect(results).toHaveLength(1);
    expect(results[0].compatible).toBe(false);
    expect(results[0].errors!.length).toBeGreaterThan(0);
  });

  it("缺少必须字段的 plan.json 应返回 compatible: false 并含字段错误", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        tasks: {
          "INF-001_feature": {
            "plan.json": JSON.stringify({ featureId: "INF-001" }),
          },
        },
      },
    });

    const results = await auditPlans(BASE_CONFIG, tempDir);
    expect(results).toHaveLength(1);
    expect(results[0].compatible).toBe(false);
    expect(results[0].errors!.length).toBeGreaterThan(0);
  });

  it("多个 task 时应逐一审计", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        tasks: {
          "INF-001_ok": { "plan.json": JSON.stringify(VALID_PLAN) },
          "INF-002_broken": {
            "plan.json": JSON.stringify({ featureId: "x" }),
          },
        },
      },
    });

    const results = await auditPlans(BASE_CONFIG, tempDir);
    expect(results).toHaveLength(2);
    expect(results.some((r) => r.compatible)).toBe(true);
    expect(results.some((r) => !r.compatible)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// Handlers — updateRules（测试用户交互分支）
// ═══════════════════════════════════════════════════════════

describe("updateRules", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
    vi.spyOn(TemplateManager, "getRoot").mockResolvedValue("/mock/root");
    vi.spyOn(fs, "pathExists").mockResolvedValue(true as never);
    vi.spyOn(TemplateManager, "processFile").mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
    vi.restoreAllMocks();
  });

  it("confirm 返回 false 时应返回 null", async () => {
    const result = await updateRules(BASE_CONFIG, tempDir);
    expect(result).toBeNull();
  });

  it("isCancel 为 true 时应返回 null", async () => {
    const { confirm, isCancel } = await import("@clack/prompts");
    vi.mocked(confirm).mockResolvedValueOnce(Symbol("cancel") as never);
    vi.mocked(isCancel).mockReturnValueOnce(true);

    const result = await updateRules(BASE_CONFIG, tempDir);
    expect(result).toBeNull();
  });

  it("用户确认后应覆盖 AUTO_UPDATE_RULES 并返回正确结构", async () => {
    const { confirm, isCancel } = await import("@clack/prompts");
    vi.mocked(confirm).mockResolvedValueOnce(true as never);
    vi.mocked(isCancel).mockReturnValueOnce(false);

    const result = await updateRules(BASE_CONFIG, tempDir);

    expect(result).not.toBeNull();
    expect(result!.updated).toContain("00_system");
    expect(result!.updated).toContain("01_workflow");
    expect(result!.updated).toContain("03_data_governance");
    expect(result!.updated).toContain("99_context_glue");
    expect(result!.templated).toContain("02_tech_stack");
    expect(result!.skipped).toContain("90_custom_rules");
  });

  it("用户确认后 processFile 调用次数应与 editors × AUTO_UPDATE_RULES + tech_stack 一致", async () => {
    const { confirm, isCancel } = await import("@clack/prompts");
    vi.mocked(confirm).mockResolvedValueOnce(true as never);
    vi.mocked(isCancel).mockReturnValueOnce(false);

    await updateRules(BASE_CONFIG, tempDir);

    // cursor × 4 条 AUTO_UPDATE_RULES + 1 条 tech_stack = 5 次
    expect(TemplateManager.processFile).toHaveBeenCalledTimes(5);
  });

  it("源规则文件不存在时应跳过并返回空 updated", async () => {
    const { confirm, isCancel } = await import("@clack/prompts");
    vi.mocked(confirm).mockResolvedValueOnce(true as never);
    vi.mocked(isCancel).mockReturnValueOnce(false);

    // 第一次调用是 resolveTemplateLang 的语言目录检查（true），其余都不存在
    vi.spyOn(fs, "pathExists")
      .mockResolvedValueOnce(true as never)
      .mockResolvedValue(false as never);

    const result = await updateRules(BASE_CONFIG, tempDir);

    expect(result).not.toBeNull();
    expect(result!.updated).toHaveLength(0);
    expect(result!.templated).toHaveLength(0);
    expect(result!.skipped).toContain("90_custom_rules");
  });

  it("多个 editors 时 updated 中不应有重复的规则名", async () => {
    const multiConfig: ArchitextConfig = {
      ...BASE_CONFIG,
      editors: ["cursor", "windsurf"],
    };
    const { confirm, isCancel } = await import("@clack/prompts");
    vi.mocked(confirm).mockResolvedValueOnce(true as never);
    vi.mocked(isCancel).mockReturnValueOnce(false);

    const result = await updateRules(multiConfig, tempDir);

    expect(result).not.toBeNull();
    const uniqueCount = new Set(result!.updated).size;
    expect(uniqueCount).toBe(result!.updated.length);
  });
});

// ═══════════════════════════════════════════════════════════
// Handlers — updateSilentFiles
// ═══════════════════════════════════════════════════════════

describe("updateSilentFiles", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
    vi.spyOn(TemplateManager, "getRoot").mockResolvedValue("/mock/root");
    vi.spyOn(TemplateManager, "plan").mockResolvedValue([]);
    vi.spyOn(TemplateManager, "execute").mockResolvedValue(undefined);
    vi.spyOn(TemplateManager, "processFile").mockResolvedValue(undefined);
    vi.spyOn(fs, "pathExists").mockResolvedValue(true as never);
    vi.spyOn(fs, "readdir").mockResolvedValue([] as never);
    vi.spyOn(fs, "ensureDir").mockResolvedValue(undefined as never);
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
    vi.restoreAllMocks();
  });

  it("plan 均返回空数组时应返回 count: 0", async () => {
    const result = await updateSilentFiles(BASE_CONFIG, tempDir);
    expect(result.count).toBe(0);
    expect(TemplateManager.plan).toHaveBeenCalledTimes(2);
    expect(TemplateManager.execute).toHaveBeenCalledTimes(2);
  });

  it("prompts plan 返回 2 个操作时 count 应为 2", async () => {
    vi.spyOn(TemplateManager, "plan")
      .mockResolvedValueOnce([
        { src: "/a", dest: "/b" },
        { src: "/c", dest: "/d" },
      ] as never)
      .mockResolvedValueOnce([] as never);

    const result = await updateSilentFiles(BASE_CONFIG, tempDir);
    expect(result.count).toBe(2);
  });

  it("prompts 与 templates 的 count 应累加", async () => {
    vi.spyOn(TemplateManager, "plan")
      .mockResolvedValueOnce([{ src: "/a", dest: "/b" }] as never)
      .mockResolvedValueOnce([
        { src: "/c", dest: "/d" },
        { src: "/e", dest: "/f" },
      ] as never);

    const result = await updateSilentFiles(BASE_CONFIG, tempDir);
    expect(result.count).toBe(3);
  });

  it("editors 有 commands 且存在 .md 文件时应处理 commands 并计入 count", async () => {
    vi.spyOn(fs, "readdir").mockResolvedValue([
      "archi.start.md",
      "archi.plan.md",
      "README.txt",
    ] as never);

    const result = await updateSilentFiles(BASE_CONFIG, tempDir);
    // 只有 .md 文件（2 个）被处理，.txt 跳过
    expect(result.count).toBe(2);
    expect(TemplateManager.processFile).toHaveBeenCalledTimes(2);
  });

  it("editors 无 commands 配置（如 windsurf）时应跳过 commands 处理", async () => {
    const windsurfConfig: ArchitextConfig = {
      ...BASE_CONFIG,
      editors: ["windsurf"],
    };
    vi.spyOn(fs, "readdir").mockResolvedValue(["archi.start.md"] as never);

    const result = await updateSilentFiles(windsurfConfig, tempDir);
    expect(result.count).toBe(0);
    expect(TemplateManager.processFile).not.toHaveBeenCalled();
  });

  it("语言目录不存在时应回退到 zh 并使用 zh 路径调用 plan", async () => {
    const enConfig: ArchitextConfig = { ...BASE_CONFIG, language: "en" };
    vi.spyOn(fs, "pathExists").mockImplementation(async (p) => {
      const normalized = String(p).replace(/\\/g, "/");
      return !normalized.endsWith("/en");
    });

    await updateSilentFiles(enConfig, tempDir);

    const [firstPromptCall] = vi.mocked(TemplateManager.plan).mock.calls;
    // 无论 Windows(\) 还是 Unix(/)，路径中应包含语言段 "zh"
    expect(firstPromptCall[0]).toMatch(/[/\\]zh[/\\]/);
  });

  it("readdir 抛出异常时应静默忽略，不影响 count", async () => {
    vi.spyOn(fs, "readdir").mockRejectedValue(
      new Error("permission denied") as never,
    );

    const result = await updateSilentFiles(BASE_CONFIG, tempDir);
    expect(result.count).toBe(0);
  });

  it("多个 editors 时每个有 commands 的 editor 都应分别处理 .md 文件", async () => {
    const multiConfig: ArchitextConfig = {
      ...BASE_CONFIG,
      editors: ["cursor", "windsurf"],
    };
    vi.spyOn(fs, "readdir").mockResolvedValue(["archi.start.md"] as never);

    const result = await updateSilentFiles(multiConfig, tempDir);
    // 只有 cursor 有 commands，故只处理 1 次
    expect(result.count).toBe(1);
    expect(TemplateManager.processFile).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

describe("constants", () => {
  it("EXPECTED_ROADMAP_VERSION 应为正整数", () => {
    expect(Number.isInteger(EXPECTED_ROADMAP_VERSION)).toBe(true);
    expect(EXPECTED_ROADMAP_VERSION).toBeGreaterThan(0);
  });

  it("ROADMAP_MIGRATIONS 应为数组", () => {
    expect(Array.isArray(ROADMAP_MIGRATIONS)).toBe(true);
  });

  it("ROADMAP_MIGRATIONS 中每项应含 fromVersion、description、migrate", () => {
    ROADMAP_MIGRATIONS.forEach((step) => {
      expect(typeof step.fromVersion).toBe("number");
      expect(typeof step.description).toBe("string");
      expect(typeof step.migrate).toBe("function");
    });
  });
});

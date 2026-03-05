/** @fileoverview Update 命令测试，覆盖 resolver（版本检查）、auditor（Schema 审计）、constants。 */

import { vi } from "vitest";
import fs from "fs-extra";
import path from "path";

import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import { checkVersion } from "../../commands/meta/update/version.ts";
import {
  auditRoadmap,
  auditPlans,
} from "../../commands/meta/update/auditor.ts";
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

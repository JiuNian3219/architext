/** @fileoverview Plan 命令测试，覆盖 parser（JSON 解析）、resolver（路径解析）、handlers（检查输出）。 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import { parsePlanJson } from "../../commands/meta/plan/parser.ts";
import type {
  PlanCheckResult,
  PlanData,
} from "../../commands/meta/plan/types.ts";
import { resolvePlanPath } from "../../commands/meta/plan/resolver.ts";
import { handlePlanCheck } from "../../commands/meta/plan/handlers.ts";
import { PlanNotFoundError } from "../../core/errors.ts";
import { resolveDocDir } from "../../core/doc-dir.ts";

// ═══════════════════════════════════════════════════════════
// Shared: resolveDocDir Tests
// ═══════════════════════════════════════════════════════════

describe("resolveDocDir", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it("应优先使用 architext.json 中的 docDir 配置", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: "my-docs",
        updatedAt: new Date().toISOString(),
      }),
      "my-docs": {
        ".keep": "",
      },
    });

    const result = await resolveDocDir(tempDir);
    expect(result).toBe(path.resolve(tempDir, "my-docs"));
  });

  it("应回退到默认 .architext 目录", async () => {
    await createTestStructure(tempDir, {
      ".architext": { ".keep": "" },
    });

    const result = await resolveDocDir(tempDir);
    expect(result).toBe(path.resolve(tempDir, ".architext"));
  });

  it("所有路径都不存在时应返回 null", async () => {
    const result = await resolveDocDir(tempDir);
    expect(result).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════
// Parser Tests
// ═══════════════════════════════════════════════════════════

describe("parsePlanJson", () => {
  it("应正确解析 phases 中的任务", () => {
    const data: PlanData = {
      featureId: "SUB-01",
      featureName: "Subscription CRUD",
      status: "active",
      decisions: [],
      phases: [
        {
          name: "Phase 1: Setup",
          tasks: [
            { id: "p1-1", title: "Install dependencies", done: true },
            { id: "p1-2", title: "Configure linting", done: false },
            { id: "p1-3", title: "Setup testing", done: true },
          ],
        },
      ],
      tests: { automated: [], manual: [] },
    };

    const result = parsePlanJson(data);

    expect(result.sections.length).toBe(1);
    expect(result.sections[0].name).toBe("Phase 1: Setup");
    expect(result.sections[0].total).toBe(3);
    expect(result.sections[0].done).toBe(2);
  });

  it("应按 phase 分组", () => {
    const data: PlanData = {
      featureId: "SUB-01",
      featureName: "Test",
      status: "active",
      decisions: [],
      phases: [
        {
          name: "Phase 1: Data",
          tasks: [
            { id: "p1-1", title: "Create schema", done: true },
            { id: "p1-2", title: "Add migration", done: true },
          ],
        },
        {
          name: "Phase 2: UI",
          tasks: [
            { id: "p2-1", title: "Build components", done: false },
            { id: "p2-2", title: "Add styles", done: false },
          ],
        },
      ],
      tests: {
        automated: [{ id: "t1", title: "Unit test", done: true }],
        manual: [],
      },
    };

    const result = parsePlanJson(data);

    expect(result.sections.length).toBe(3); // 2 phases + 1 automated tests
    expect(result.sections[0].name).toBe("Phase 1: Data");
    expect(result.sections[0].done).toBe(2);
    expect(result.sections[1].name).toBe("Phase 2: UI");
    expect(result.sections[1].done).toBe(0);
    expect(result.sections[2].name).toBe("Automated Tests");
    expect(result.sections[2].done).toBe(1);
  });

  it("应识别 Manual Verification section 为人工验收", () => {
    const data: PlanData = {
      featureId: "SUB-01",
      featureName: "Test",
      status: "active",
      decisions: [],
      phases: [
        {
          name: "Phase 1: Setup",
          tasks: [{ id: "p1-1", title: "Install deps", done: true }],
        },
      ],
      tests: {
        automated: [],
        manual: [
          { id: "m1", title: "Check UI matches design", done: false },
          { id: "m2", title: "Test on mobile", done: false },
        ],
      },
    };

    const result = parsePlanJson(data);

    expect(result.sections.length).toBe(2);
    expect(result.sections[0].isManual).toBe(false);
    expect(result.sections[1].isManual).toBe(true);
    expect(result.sections[1].name).toBe("Manual Verification");
  });

  it("应识别包含人工验收关键词的 phase", () => {
    const data: PlanData = {
      featureId: "SUB-01",
      featureName: "Test",
      status: "active",
      decisions: [],
      phases: [
        {
          name: "手动验证",
          tasks: [{ id: "m1", title: "检查 UI", done: false }],
        },
      ],
      tests: { automated: [], manual: [] },
    };

    const result = parsePlanJson(data);
    expect(result.sections[0].isManual).toBe(true);
  });

  it("应处理空 phases", () => {
    const data: PlanData = {
      featureId: "SUB-01",
      featureName: "Empty",
      status: "pending",
      decisions: [],
      phases: [],
      tests: { automated: [], manual: [] },
    };

    const result = parsePlanJson(data);
    expect(result.sections.length).toBe(0);
  });

  it("应正确解析完整的真实 plan 格式", () => {
    const data: PlanData = {
      featureId: "SUB-01",
      featureName: "订阅 CRUD",
      status: "active",
      decisions: [
        {
          category: "Libraries",
          choice: "Zod",
          rationale: "表单校验与 spec 场景强绑定",
        },
        {
          category: "Architecture",
          choice: "Server Actions",
          rationale: "复用 Next.js 14 模式",
        },
      ],
      phases: [
        {
          name: "Phase 1: 数据层与校验",
          tasks: [
            { id: "p1-1", title: "定义 Schema", done: true },
            { id: "p1-2", title: "实现 Hook", done: true },
            { id: "p1-3", title: "添加校验", done: false },
          ],
        },
        {
          name: "Phase 2: UI 组件",
          tasks: [
            { id: "p2-1", title: "列表页", done: true },
            { id: "p2-2", title: "表单", done: false },
            { id: "p2-3", title: "删除确认", done: false },
          ],
        },
      ],
      tests: {
        automated: [
          { id: "t1", title: "Unit test for Hook", done: true },
          { id: "t2", title: "Integration test", done: false },
        ],
        manual: [
          { id: "m1", title: "检查 UI 与 ui.md 一致", done: false },
          { id: "m2", title: "移动端测试", done: false },
        ],
      },
    };

    const result = parsePlanJson(data);

    // 应有 4 个 section: 2 phases + automated + manual
    expect(result.sections.length).toBe(4);

    // Phase 1
    expect(result.sections[0].name).toBe("Phase 1: 数据层与校验");
    expect(result.sections[0].done).toBe(2);
    expect(result.sections[0].total).toBe(3);
    expect(result.sections[0].isManual).toBe(false);

    // Phase 2
    expect(result.sections[1].name).toBe("Phase 2: UI 组件");
    expect(result.sections[1].done).toBe(1);
    expect(result.sections[1].total).toBe(3);

    // Automated Tests
    expect(result.sections[2].name).toBe("Automated Tests");
    expect(result.sections[2].done).toBe(1);
    expect(result.sections[2].total).toBe(2);

    // Manual — 应被标记为 manual
    expect(result.sections[3].name).toBe("Manual Verification");
    expect(result.sections[3].isManual).toBe(true);
    expect(result.sections[3].total).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════
// Resolver Tests
// ═══════════════════════════════════════════════════════════

describe("resolvePlanPath", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it("应通过 Task ID 定位 plan 文件", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        updatedAt: new Date().toISOString(),
      }),
      ".architext": {
        tasks: {
          "SUB-01_Subscription_CRUD": {
            "plan.json": JSON.stringify({ featureId: "SUB-01" }),
          },
        },
      },
    });

    const result = await resolvePlanPath("SUB-01", tempDir);
    expect(result.filePath).toBe(
      path.join(
        tempDir,
        ".architext",
        "tasks",
        "SUB-01_Subscription_CRUD",
        "plan.json",
      ),
    );
    expect(result.featureName).toBe("Subscription CRUD");
  });

  it("不存在的 Task ID 应抛出 PlanNotFoundError", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        updatedAt: new Date().toISOString(),
      }),
      ".architext": {
        tasks: {
          "SUB-01_Subscription_CRUD": {
            "plan.json": JSON.stringify({ featureId: "SUB-01" }),
          },
        },
      },
    });

    await expect(resolvePlanPath("NONEXIST", tempDir)).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("tasks 目录不存在时应抛出 PlanNotFoundError", async () => {
    await createTestStructure(tempDir, {
      ".architext": { ".keep": "" },
    });

    await expect(resolvePlanPath("SUB-01", tempDir)).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("plan 文件不存在时应抛出 PlanNotFoundError", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        tasks: {
          "SUB-01_Subscription_CRUD": {
            "spec.md": "# Spec only, no plan",
          },
        },
      },
    });

    await expect(resolvePlanPath("SUB-01", tempDir)).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("应正确提取含下划线的 Task 名称", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        tasks: {
          "CAT-01_Category_Tags_System": {
            "plan.json": JSON.stringify({ featureId: "CAT-01" }),
          },
        },
      },
    });

    const result = await resolvePlanPath("CAT-01", tempDir);
    expect(result.featureName).toBe("Category Tags System");
  });
});

// ═══════════════════════════════════════════════════════════
// Handler Tests
// ═══════════════════════════════════════════════════════════

describe("handlePlanCheck", () => {
  it("应正常输出全部完成的报告而不抛错", () => {
    const result: PlanCheckResult = {
      sections: [
        {
          name: "Phase 1: Setup",
          isManual: false,
          items: [
            { id: "p1-1", title: "Install deps", done: true },
            { id: "p1-2", title: "Configure", done: true },
          ],
          done: 2,
          total: 2,
        },
      ],
    };

    expect(() => handlePlanCheck("T-001", "Test Task", result)).not.toThrow();
  });

  it("应正常输出有未完成任务的报告而不抛错", () => {
    const result: PlanCheckResult = {
      sections: [
        {
          name: "Phase 1: Setup",
          isManual: false,
          items: [
            { id: "p1-1", title: "Install deps", done: true },
            { id: "p1-2", title: "Configure linting", done: false },
          ],
          done: 1,
          total: 2,
        },
      ],
    };

    expect(() => handlePlanCheck("T-001", "Test Task", result)).not.toThrow();
  });

  it("应正常处理含人工验收 section 的报告", () => {
    const result: PlanCheckResult = {
      sections: [
        {
          name: "Phase 1: Setup",
          isManual: false,
          items: [{ id: "p1-1", title: "Task", done: true }],
          done: 1,
          total: 1,
        },
        {
          name: "Manual Verification",
          isManual: true,
          items: [{ id: "m1", title: "Check UI", done: false }],
          done: 0,
          total: 1,
        },
      ],
    };

    expect(() => handlePlanCheck("T-001", "Test Task", result)).not.toThrow();
  });

  it("空 plan 应输出警告而不抛错", () => {
    const result: PlanCheckResult = { sections: [] };
    expect(() => handlePlanCheck("T-001", "Test Task", result)).not.toThrow();
  });
});

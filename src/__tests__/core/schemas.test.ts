/** @fileoverview Schema 校验单元测试，覆盖 Tier 1 严格校验和 Tier 2 宽松校验。 */
import { describe, it, expect } from "vitest";
import {
  validateJson,
  RoadmapDataSchema,
  PlanDataSchema,
  DictionarySchema,
  ErrorCodesSchema,
  DataSnapshotSchema,
  DesignTokensSchema,
  MapSchema,
} from "../../core/schemas/index.ts";
import { AppError } from "../../core/errors.ts";
import type { RoadmapData } from "../../core/roadmap/types.ts";
import type { PlanData } from "../../commands/meta/plan/types.ts";

// ── 辅助工厂 ──

function makeValidRoadmap(): RoadmapData {
  return {
    version: 1,
    projectStatus: "planning",
    lastUpdated: "2024-01-01",
    tasks: [
      {
        id: "INF-01",
        phase: "infra",
        title: "Scaffolding",
        status: "pending",
        deps: [],
        tag: "Infra",
        slug: "Scaffolding",
      },
    ],
  };
}

function makeValidPlan(): PlanData {
  return {
    featureId: "SUB-01",
    featureName: "Subscription CRUD",
    status: "in-progress",
    decisions: [{ category: "Q1", choice: "A", rationale: "Simple" }],
    phases: [
      {
        name: "Phase 1",
        tasks: [{ id: "P1-01", title: "Setup DB", notes: "", done: false }],
      },
    ],
    tests: {
      automated: [{ id: "T-01", title: "Unit test", done: false }],
      manual: [],
    },
  };
}

// ── Tier 1: roadmap.json 严格校验 ──

describe("Tier 1: RoadmapDataSchema", () => {
  it("合法的 roadmap 数据应通过校验", () => {
    const data = makeValidRoadmap();
    const result = validateJson<RoadmapData>(
      RoadmapDataSchema,
      data,
      "roadmap.json",
    );
    expect(result.version).toBe(1);
    expect(result.tasks[0].id).toBe("INF-01");
  });

  it("缺少 tasks 字段应抛出 AppError", () => {
    const data = {
      version: 1,
      projectStatus: "planning",
      lastUpdated: "2024-01-01",
    };
    expect(() => validateJson(RoadmapDataSchema, data, "roadmap.json")).toThrow(
      AppError,
    );
  });

  it("task.status 为非法值应抛出 AppError", () => {
    const data = makeValidRoadmap();
    (data.tasks[0] as unknown as Record<string, unknown>).status = "finished";
    expect(() => validateJson(RoadmapDataSchema, data, "roadmap.json")).toThrow(
      AppError,
    );
  });

  it("task.id 为空字符串应抛出 AppError", () => {
    const data = makeValidRoadmap();
    data.tasks[0].id = "";
    expect(() => validateJson(RoadmapDataSchema, data, "roadmap.json")).toThrow(
      AppError,
    );
  });

  it("task.title 为空字符串应抛出 AppError", () => {
    const data = makeValidRoadmap();
    data.tasks[0].title = "";
    expect(() => validateJson(RoadmapDataSchema, data, "roadmap.json")).toThrow(
      AppError,
    );
  });

  it("task.phase 为非法值应抛出 AppError", () => {
    const data = makeValidRoadmap();
    (data.tasks[0] as unknown as Record<string, unknown>).phase = "invalid";
    expect(() => validateJson(RoadmapDataSchema, data, "roadmap.json")).toThrow(
      AppError,
    );
  });

  it("可选字段 (goal/deps/tag/slug/description/screens) 缺失时应通过校验", () => {
    const data = makeValidRoadmap();
    const task = data.tasks[0];
    delete (task as unknown as Record<string, unknown>).goal;
    delete (task as unknown as Record<string, unknown>).deps;
    delete (task as unknown as Record<string, unknown>).tag;
    delete (task as unknown as Record<string, unknown>).slug;

    const result = validateJson<RoadmapData>(
      RoadmapDataSchema,
      data,
      "roadmap.json",
    );
    expect(result.tasks[0].goal).toBeUndefined();
  });

  it("空 tasks 数组应通过校验", () => {
    const data = { ...makeValidRoadmap(), tasks: [] };
    const result = validateJson<RoadmapData>(
      RoadmapDataSchema,
      data,
      "roadmap.json",
    );
    expect(result.tasks).toHaveLength(0);
  });

  it("错误信息应包含文件名和具体路径", () => {
    const data = {
      version: "not-a-number",
      projectStatus: "x",
      lastUpdated: "x",
      tasks: [],
    };
    try {
      validateJson(RoadmapDataSchema, data, "roadmap.json");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).message).toContain("roadmap.json");
      expect((err as AppError).code).toBe("SCHEMA_VALIDATION_ERROR");
    }
  });
});

// ── Tier 1: plan.json 严格校验 ──

describe("Tier 1: PlanDataSchema", () => {
  it("合法的 plan 数据应通过校验", () => {
    const data = makeValidPlan();
    const result = validateJson<PlanData>(PlanDataSchema, data, "plan.json");
    expect(result.featureId).toBe("SUB-01");
    expect(result.phases[0].tasks[0].done).toBe(false);
  });

  it("缺少 featureId 应抛出 AppError", () => {
    const data = makeValidPlan();
    delete (data as unknown as Record<string, unknown>).featureId;
    expect(() => validateJson(PlanDataSchema, data, "plan.json")).toThrow(
      AppError,
    );
  });

  it("task.done 为非布尔值应抛出 AppError", () => {
    const data = makeValidPlan();
    (data.phases[0].tasks[0] as unknown as Record<string, unknown>).done =
      "yes";
    expect(() => validateJson(PlanDataSchema, data, "plan.json")).toThrow(
      AppError,
    );
  });

  it("缺少 tests 字段应抛出 AppError", () => {
    const data = makeValidPlan();
    delete (data as unknown as Record<string, unknown>).tests;
    expect(() => validateJson(PlanDataSchema, data, "plan.json")).toThrow(
      AppError,
    );
  });

  it("错误信息应包含文件名", () => {
    try {
      validateJson(PlanDataSchema, {}, "SUB-01/plan.json");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).message).toContain("SUB-01/plan.json");
    }
  });
});

// ── Tier 2: 宽松校验 — 顶层 key 存在即可，item 内可自由扩展 ──

describe("Tier 2: DictionarySchema", () => {
  it("合法的 dictionary 数据应通过校验", () => {
    const data = {
      entities: [{ term: "User", codeName: "User" }],
      verbs: [{ verb: "create", codeName: "createUser" }],
    };
    expect(() =>
      validateJson(DictionarySchema, data, "dictionary.json"),
    ).not.toThrow();
  });

  it("缺少 entities 应抛出 AppError", () => {
    const data = { verbs: [] };
    expect(() =>
      validateJson(DictionarySchema, data, "dictionary.json"),
    ).toThrow(AppError);
  });

  it("item 中自由扩展字段不应报错", () => {
    const data = {
      entities: [
        {
          term: "User",
          codeName: "User",
          tags: ["core"],
          deprecated: false,
          customField: 42,
        },
      ],
      verbs: [],
    };
    expect(() =>
      validateJson(DictionarySchema, data, "dictionary.json"),
    ).not.toThrow();
  });

  it("顶层自由扩展 key 不应报错 (passthrough)", () => {
    const data = {
      entities: [],
      verbs: [],
      enums: [{ name: "Status", values: ["active", "inactive"] }],
      constants: [],
    };
    expect(() =>
      validateJson(DictionarySchema, data, "dictionary.json"),
    ).not.toThrow();
  });
});

describe("Tier 2: ErrorCodesSchema", () => {
  it("合法数据应通过", () => {
    const data = {
      businessErrors: [{ code: "ERR_AUTH_FAIL", message: "Auth failed" }],
    };
    expect(() =>
      validateJson(ErrorCodesSchema, data, "error_codes.json"),
    ).not.toThrow();
  });

  it("缺少 businessErrors 应抛出 AppError", () => {
    const data = { protocolMapping: [] };
    expect(() =>
      validateJson(ErrorCodesSchema, data, "error_codes.json"),
    ).toThrow(AppError);
  });

  it("item 扩展字段 (severity/retryable) 不应报错", () => {
    const data = {
      businessErrors: [
        { code: "ERR_X", severity: "critical", retryable: false },
      ],
    };
    expect(() =>
      validateJson(ErrorCodesSchema, data, "error_codes.json"),
    ).not.toThrow();
  });

  it("顶层扩展 key 不应报错", () => {
    const data = {
      "protocolMapping [?API]": [{ statusCode: "400", code: "ERR_VALIDATION" }],
      businessErrors: [],
    };
    expect(() =>
      validateJson(ErrorCodesSchema, data, "error_codes.json"),
    ).not.toThrow();
  });
});

describe("Tier 2: DataSnapshotSchema", () => {
  it("合法数据应通过", () => {
    const data = {
      scope: "[?Data]",
      models: [{ name: "User", fields: [] }],
      relationships: [],
    };
    expect(() =>
      validateJson(DataSnapshotSchema, data, "data_snapshot.json"),
    ).not.toThrow();
  });

  it("缺少 models 应抛出 AppError", () => {
    const data = { relationships: [] };
    expect(() =>
      validateJson(DataSnapshotSchema, data, "data_snapshot.json"),
    ).toThrow(AppError);
  });

  it("model item 扩展字段 (indexes/triggers) 不应报错", () => {
    const data = {
      models: [
        { name: "User", fields: [], indexes: ["email_idx"], triggers: [] },
      ],
    };
    expect(() =>
      validateJson(DataSnapshotSchema, data, "data_snapshot.json"),
    ).not.toThrow();
  });
});

describe("Tier 2: DesignTokensSchema", () => {
  it("合法数据应通过", () => {
    const data = { semanticTokens: { colors: [] }, layout: {} };
    expect(() =>
      validateJson(DesignTokensSchema, data, "design_tokens.json"),
    ).not.toThrow();
  });

  it("缺少 semanticTokens 应抛出 AppError", () => {
    const data = { layout: {} };
    expect(() =>
      validateJson(DesignTokensSchema, data, "design_tokens.json"),
    ).toThrow(AppError);
  });

  it("顶层扩展 key (motion/breakpoints) 不应报错", () => {
    const data = {
      semanticTokens: {},
      motion: { fast: "150ms" },
      breakpoints: { sm: "640px" },
    };
    expect(() =>
      validateJson(DesignTokensSchema, data, "design_tokens.json"),
    ).not.toThrow();
  });
});

describe("Tier 2: MapSchema", () => {
  it("空对象应通过（所有字段可选）", () => {
    const data = {};
    expect(() => validateJson(MapSchema, data, "map.json")).not.toThrow();
  });

  it("包含四个动态字段的合法数据应通过", () => {
    const data = {
      directoryMapping: [],
      logicalTopology: [],
      criticalUserJourneys: [],
      featureRelations: [],
    };
    expect(() => validateJson(MapSchema, data, "map.json")).not.toThrow();
  });

  it("顶层扩展 key 不应报错", () => {
    const data = { directoryMapping: [], customTopology: { layers: [] } };
    expect(() => validateJson(MapSchema, data, "map.json")).not.toThrow();
  });
});

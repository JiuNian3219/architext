/** @fileoverview RoadmapParser 单元测试，验证 JSON 解析、getAllTasks/buildTaskMap/groupByPhase 辅助函数，以及边界和错误场景。 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RoadmapParser } from "../../core/roadmap/parser.ts";
import {
  getAllTasks,
  buildTaskMap,
  groupByPhase,
} from "../../core/roadmap/types.ts";
import type { RoadmapData } from "../../core/roadmap/types.ts";
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import path from "path";

describe("RoadmapParser", () => {
  let tempDir: string;
  let parser: RoadmapParser;

  beforeEach(async () => {
    tempDir = await createTempDir();
    parser = new RoadmapParser();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  /** 辅助函数：在临时目录创建 roadmap.json 并解析 */
  async function parseRoadmap(data: RoadmapData) {
    const filePath = path.join(tempDir, "roadmap.json");
    await createTestStructure(tempDir, {
      "roadmap.json": JSON.stringify(data, null, 2),
    });
    return parser.parse(filePath);
  }

  // ─────────────────────────────────────────────────────────────────
  // 基本 JSON 解析
  // ─────────────────────────────────────────────────────────────────

  describe("基本 JSON 解析", () => {
    it("应正确解析包含多个任务的 roadmap（扁平结构）", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "INF-01",
            phase: "infra",
            title: "Project Scaffolding",
            status: "done",
            description: "初始化项目结构",
            goal: "Setup complete",
            deps: [],
            tag: "Infra",
            slug: "Project_Scaffolding",
          },
          {
            id: "FEAT-01",
            phase: "core",
            title: "Core Feature",
            status: "pending",
            goal: "Implement core feature",
            deps: ["INF-01"],
            tag: "Core",
            slug: "Core_Feature",
          },
        ],
      };

      const result = await parseRoadmap(input);

      expect(result.version).toBe(1);
      expect(result.projectStatus).toBe("planning");
      expect(result.lastUpdated).toBe("2024-01-01");
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0]).toMatchObject({
        id: "INF-01",
        phase: "infra",
        title: "Project Scaffolding",
        status: "done",
      });
      expect(result.tasks[1]).toMatchObject({
        id: "FEAT-01",
        phase: "core",
        deps: ["INF-01"],
      });
    });

    it("应正确解析不同 phase 的任务", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: "INF-01", phase: "infra", title: "Infra Task", status: "done" },
          {
            id: "FEAT-01",
            phase: "core",
            title: "Core Task",
            status: "active",
          },
          {
            id: "POLISH-01",
            phase: "polish",
            title: "Polish Task",
            status: "pending",
          },
          {
            id: "PLATFORM-01",
            phase: "platform",
            title: "Platform Task",
            status: "pending",
          },
        ],
      };

      const result = await parseRoadmap(input);
      const phases = result.tasks.map((t) => t.phase);

      expect(phases).toEqual(["infra", "core", "polish", "platform"]);
    });

    it("应正确保留任务的完整 metadata", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-06-15",
        tasks: [
          {
            id: "FEAT-01",
            phase: "core",
            title: "User Auth",
            status: "pending",
            description: "OAuth login + session",
            goal: "Initialize project structure",
            deps: ["INF-01"],
            tag: "Auth",
            slug: "User_Auth",
            screens: ["S-01", "S-02"],
          },
        ],
      };

      const result = await parseRoadmap(input);
      const task = result.tasks[0];

      expect(task).toMatchObject({
        id: "FEAT-01",
        phase: "core",
        title: "User Auth",
        status: "pending",
        description: "OAuth login + session",
        goal: "Initialize project structure",
        deps: ["INF-01"],
        tag: "Auth",
        slug: "User_Auth",
        screens: ["S-01", "S-02"],
      });
    });

    it("应正确解析不同状态的任务", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-TODO",
            phase: "core",
            title: "Todo task",
            status: "pending",
          },
          {
            id: "T-ACTIVE",
            phase: "core",
            title: "Active task",
            status: "active",
          },
          { id: "T-DONE", phase: "core", title: "Done task", status: "done" },
          {
            id: "T-BLOCKED",
            phase: "core",
            title: "Blocked task",
            status: "blocked",
          },
        ],
      };

      const result = await parseRoadmap(input);
      const statuses = result.tasks.map((t) => t.status);

      expect(statuses).toEqual(["pending", "active", "done", "blocked"]);
    });

    it("应正确解析含依赖的任务", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-001",
            phase: "infra",
            title: "First",
            status: "done",
            deps: [],
          },
          {
            id: "T-002",
            phase: "core",
            title: "Second",
            status: "active",
            deps: ["T-001"],
          },
          {
            id: "T-003",
            phase: "core",
            title: "Third",
            status: "pending",
            deps: ["T-001", "T-002"],
          },
        ],
      };

      const result = await parseRoadmap(input);

      expect(result.tasks[0].deps).toEqual([]);
      expect(result.tasks[1].deps).toEqual(["T-001"]);
      expect(result.tasks[2].deps).toEqual(["T-001", "T-002"]);
    });

    it("应正确解析空 tasks 数组", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        tasks: [],
      };

      const result = await parseRoadmap(input);
      expect(result.tasks).toHaveLength(0);
    });

    it("应正确解析省略可选字段的任务", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-001",
            phase: "core",
            title: "Minimal task",
            status: "pending",
          },
        ],
      };

      const result = await parseRoadmap(input);
      const task = result.tasks[0];

      expect(task.id).toBe("T-001");
      expect(task.phase).toBe("core");
      expect(task.title).toBe("Minimal task");
      expect(task.status).toBe("pending");
      expect(task.description).toBeUndefined();
      expect(task.goal).toBeUndefined();
      expect(task.deps).toBeUndefined();
      expect(task.tag).toBeUndefined();
      expect(task.slug).toBeUndefined();
      expect(task.screens).toBeUndefined();
    });

    it("应正确解析 nfr 数组", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: "INF-01", phase: "infra", title: "Infra", status: "done" },
          {
            id: "FEAT-01",
            phase: "core",
            title: "Core",
            status: "pending",
            deps: ["INF-01"],
          },
        ],
        nfr: [
          {
            taskId: "FEAT-01",
            constraint: "All copy via i18n key",
            impact: ["FEAT-01", "FEAT-02"],
          },
        ],
      };

      const result = await parseRoadmap(input);
      expect(result.nfr).toHaveLength(1);
      expect(result.nfr?.[0]).toMatchObject({
        taskId: "FEAT-01",
        constraint: "All copy via i18n key",
        impact: ["FEAT-01", "FEAT-02"],
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 边界测试：字段类型错误
  // ─────────────────────────────────────────────────────────────────

  describe("边界测试：字段类型错误", () => {
    it("version 为字符串时应抛出错误", async () => {
      const input = {
        version: "1",
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [],
      } as unknown as RoadmapData;

      const filePath = path.join(tempDir, "roadmap.json");
      await createTestStructure(tempDir, {
        "roadmap.json": JSON.stringify(input),
      });

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("tasks 为非数组时应抛出错误", async () => {
      const input = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: "not-an-array",
      } as unknown as RoadmapData;

      const filePath = path.join(tempDir, "roadmap.json");
      await createTestStructure(tempDir, {
        "roadmap.json": JSON.stringify(input),
      });

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("task.id 为数字时应抛出错误", async () => {
      const input = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [{ id: 123, phase: "core", title: "Task", status: "pending" }],
      } as unknown as RoadmapData;

      const filePath = path.join(tempDir, "roadmap.json");
      await createTestStructure(tempDir, {
        "roadmap.json": JSON.stringify(input),
      });

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("deps 为非数组时应抛出错误", async () => {
      const input = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-01",
            phase: "core",
            title: "Task",
            status: "pending",
            deps: "INF-01",
          },
        ],
      } as unknown as RoadmapData;

      const filePath = path.join(tempDir, "roadmap.json");
      await createTestStructure(tempDir, {
        "roadmap.json": JSON.stringify(input),
      });

      await expect(parser.parse(filePath)).rejects.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 边界测试：无效 enum 值
  // ─────────────────────────────────────────────────────────────────

  describe("边界测试：无效 enum 值", () => {
    it("无效 status 值应抛出错误", async () => {
      const input = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-01",
            phase: "core",
            title: "Task",
            status: "invalid-status",
          },
        ],
      } as unknown as RoadmapData;

      const filePath = path.join(tempDir, "roadmap.json");
      await createTestStructure(tempDir, {
        "roadmap.json": JSON.stringify(input),
      });

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("无效 phase 值应抛出错误", async () => {
      const input = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-01",
            phase: "invalid-phase",
            title: "Task",
            status: "pending",
          },
        ],
      } as unknown as RoadmapData;

      const filePath = path.join(tempDir, "roadmap.json");
      await createTestStructure(tempDir, {
        "roadmap.json": JSON.stringify(input),
      });

      await expect(parser.parse(filePath)).rejects.toThrow();
    });

    it("projectStatus 为任意字符串时应正常解析（Schema 允许）", async () => {
      const input = {
        version: 1,
        projectStatus: "custom-status",
        lastUpdated: "2024-01-01",
        tasks: [],
      };

      const result = await parseRoadmap(input as RoadmapData);
      expect(result.projectStatus).toBe("custom-status");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 边界测试：极端值
  // ─────────────────────────────────────────────────────────────────

  describe("边界测试：极端值", () => {
    it("负数 version 应正常解析（Schema 允许任意数字）", async () => {
      const input = {
        version: -1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [],
      };

      const result = await parseRoadmap(input as RoadmapData);
      expect(result.version).toBe(-1);
    });

    it("零 version 应正常解析（Schema 允许任意数字）", async () => {
      const input = {
        version: 0,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [],
      };

      const result = await parseRoadmap(input as RoadmapData);
      expect(result.version).toBe(0);
    });

    it("超长 ID 应正常解析", async () => {
      const longId = "A".repeat(1000);
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: longId, phase: "core", title: "Task", status: "pending" },
        ],
      };

      const result = await parseRoadmap(input);
      expect(result.tasks[0].id).toBe(longId);
    });

    it("超长 title 应正常解析", async () => {
      const longTitle = "T".repeat(10000);
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: "T-01", phase: "core", title: longTitle, status: "pending" },
        ],
      };

      const result = await parseRoadmap(input);
      expect(result.tasks[0].title).toBe(longTitle);
    });

    it("大量任务应正常解析", async () => {
      const tasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `T-${i.toString().padStart(4, "0")}`,
        phase: "core" as const,
        title: `Task ${i}`,
        status: "pending" as const,
      }));

      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks,
      };

      const result = await parseRoadmap(input);
      expect(result.tasks).toHaveLength(1000);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 边界测试：特殊字符
  // ─────────────────────────────────────────────────────────────────

  describe("边界测试：特殊字符", () => {
    it("ID 含特殊字符应正常解析", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "FEAT-中文-日本語-🌍",
            phase: "core",
            title: "Task",
            status: "pending",
          },
        ],
      };

      const result = await parseRoadmap(input);
      expect(result.tasks[0].id).toBe("FEAT-中文-日本語-🌍");
    });

    it("title 含换行符应正常解析", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-01",
            phase: "core",
            title: "Line1\nLine2\tTabbed",
            status: "pending",
          },
        ],
      };

      const result = await parseRoadmap(input);
      expect(result.tasks[0].title).toBe("Line1\nLine2\tTabbed");
    });

    it("description 含 JSON 字符串应正常解析", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-01",
            phase: "core",
            title: "Task",
            status: "pending",
            description: '{"key": "value", "nested": {"a": 1}}',
          },
        ],
      };

      const result = await parseRoadmap(input);
      expect(result.tasks[0].description).toBe(
        '{"key": "value", "nested": {"a": 1}}',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // getAllTests
  // ─────────────────────────────────────────────────────────────────

  describe("getAllTasks", () => {
    it("应返回 tasks 数组（扁平结构直接返回）", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: "A-01", phase: "infra", title: "Task A1", status: "done" },
          { id: "A-02", phase: "core", title: "Task A2", status: "active" },
          { id: "B-01", phase: "core", title: "Task B1", status: "pending" },
        ],
      };

      const tasks = getAllTasks(data);

      expect(tasks).toHaveLength(3);
      expect(tasks.map((t) => t.id)).toEqual(["A-01", "A-02", "B-01"]);
    });

    it("空 tasks 应返回空数组", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        tasks: [],
      };

      expect(getAllTasks(data)).toHaveLength(0);
    });

    it("应保持任务顺序", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: "C-03", phase: "core", title: "Third", status: "pending" },
          { id: "A-01", phase: "infra", title: "First", status: "done" },
          { id: "B-02", phase: "core", title: "Second", status: "active" },
        ],
      };

      const tasks = getAllTasks(data);
      expect(tasks.map((t) => t.id)).toEqual(["C-03", "A-01", "B-02"]);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // buildTaskMap
  // ─────────────────────────────────────────────────────────────────

  describe("buildTaskMap", () => {
    it("应构建 taskId -> Task 的 Map", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "INF-01",
            phase: "infra",
            title: "Scaffolding",
            status: "done",
          },
          {
            id: "INF-02",
            phase: "infra",
            title: "Core Entities",
            status: "active",
          },
          {
            id: "FEAT-01",
            phase: "core",
            title: "User Auth",
            status: "pending",
          },
        ],
      };

      const map = buildTaskMap(data);

      expect(map.size).toBe(3);
      expect(map.get("INF-01")?.title).toBe("Scaffolding");
      expect(map.get("INF-02")?.title).toBe("Core Entities");
      expect(map.get("FEAT-01")?.title).toBe("User Auth");
    });

    it("应支持 O(1) 查找", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "T-001",
            phase: "core",
            title: "Task One",
            status: "done",
            deps: ["T-002"],
          },
        ],
      };

      const map = buildTaskMap(data);

      expect(map.has("T-001")).toBe(true);
      expect(map.has("T-NONEXIST")).toBe(false);
      expect(map.get("T-001")?.status).toBe("done");
      expect(map.get("T-001")?.deps).toEqual(["T-002"]);
    });

    it("空 tasks 应返回空 Map", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        tasks: [],
      };

      const map = buildTaskMap(data);
      expect(map.size).toBe(0);
    });

    it("重复 ID 时后者应覆盖前者", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          {
            id: "DUP-01",
            phase: "infra",
            title: "Original",
            status: "pending",
          },
          { id: "DUP-01", phase: "core", title: "Overridden", status: "done" },
        ],
      };

      const map = buildTaskMap(data);
      expect(map.size).toBe(1);
      expect(map.get("DUP-01")?.title).toBe("Overridden");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // groupByPhase
  // ─────────────────────────────────────────────────────────────────

  describe("groupByPhase", () => {
    it("应按 phase 分组任务", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: "INF-01", phase: "infra", title: "Infra 1", status: "done" },
          { id: "INF-02", phase: "infra", title: "Infra 2", status: "active" },
          { id: "FEAT-01", phase: "core", title: "Core 1", status: "pending" },
          {
            id: "POLISH-01",
            phase: "polish",
            title: "Polish 1",
            status: "pending",
          },
        ],
      };

      const groups = groupByPhase(data);

      expect(groups.size).toBe(3);
      expect(groups.get("infra")?.map((t) => t.id)).toEqual([
        "INF-01",
        "INF-02",
      ]);
      expect(groups.get("core")?.map((t) => t.id)).toEqual(["FEAT-01"]);
      expect(groups.get("polish")?.map((t) => t.id)).toEqual(["POLISH-01"]);
      expect(groups.get("platform")).toBeUndefined();
    });

    it("空 tasks 应返回空 Map", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        tasks: [],
      };

      const groups = groupByPhase(data);
      expect(groups.size).toBe(0);
    });

    it("单一 phase 应返回单组", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        tasks: [
          { id: "FEAT-01", phase: "core", title: "Core 1", status: "pending" },
          { id: "FEAT-02", phase: "core", title: "Core 2", status: "pending" },
        ],
      };

      const groups = groupByPhase(data);
      expect(groups.size).toBe(1);
      expect(groups.get("core")?.map((t) => t.id)).toEqual([
        "FEAT-01",
        "FEAT-02",
      ]);
    });
  });
});

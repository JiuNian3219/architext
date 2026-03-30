/** @fileoverview RoadmapParser 单元测试，验证 JSON 解析、getAllTasks/buildTaskMap/groupByPhase 辅助函数。 */
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

  // --- 基本 JSON 解析 ---

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
      expect(result.tasks[0].id).toBe("INF-01");
      expect(result.tasks[0].phase).toBe("infra");
      expect(result.tasks[1].id).toBe("FEAT-01");
      expect(result.tasks[1].phase).toBe("core");
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
      const tasks = result.tasks;

      expect(tasks[0].phase).toBe("infra");
      expect(tasks[1].phase).toBe("core");
      expect(tasks[2].phase).toBe("polish");
      expect(tasks[3].phase).toBe("platform");
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

      expect(task.id).toBe("FEAT-01");
      expect(task.phase).toBe("core");
      expect(task.title).toBe("User Auth");
      expect(task.status).toBe("pending");
      expect(task.description).toBe("OAuth login + session");
      expect(task.goal).toBe("Initialize project structure");
      expect(task.deps).toEqual(["INF-01"]);
      expect(task.tag).toBe("Auth");
      expect(task.slug).toBe("User_Auth");
      expect(task.screens).toEqual(["S-01", "S-02"]);
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
      const tasks = result.tasks;

      expect(tasks[0].status).toBe("pending");
      expect(tasks[1].status).toBe("active");
      expect(tasks[2].status).toBe("done");
      expect(tasks[3].status).toBe("blocked");
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
      const tasks = result.tasks;

      expect(tasks[0].deps).toEqual([]);
      expect(tasks[1].deps).toEqual(["T-001"]);
      expect(tasks[2].deps).toEqual(["T-001", "T-002"]);
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
      expect(result.nfr?.[0].taskId).toBe("FEAT-01");
      expect(result.nfr?.[0].constraint).toBe("All copy via i18n key");
      expect(result.nfr?.[0].impact).toEqual(["FEAT-01", "FEAT-02"]);
    });
  });

  // --- getAllTasks ---

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
      expect(tasks[0].id).toBe("A-01");
      expect(tasks[1].id).toBe("A-02");
      expect(tasks[2].id).toBe("B-01");
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

  // --- buildTaskMap ---

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

  // --- groupByPhase ---

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
      expect(groups.get("infra")?.length).toBe(2);
      expect(groups.get("core")?.length).toBe(1);
      expect(groups.get("polish")?.length).toBe(1);
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
      expect(groups.get("core")?.length).toBe(2);
    });
  });
});

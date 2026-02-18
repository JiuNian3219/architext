/** @fileoverview RoadmapParser 单元测试，验证 JSON 解析、getAllTasks/buildTaskMap 辅助函数。 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RoadmapParser } from "../../core/roadmap/parser.ts";
import { getAllTasks, buildTaskMap } from "../../core/roadmap/types.ts";
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
    it("应正确解析包含单个 phase 的 roadmap", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Infrastructure",
            tasks: [
              {
                id: "INF-01",
                title: "Project Scaffolding",
                status: "done",
                goal: "Setup complete",
                deps: [],
                tag: "Infra",
                slug: "Project_Scaffolding",
              },
            ],
          },
        ],
      };

      const result = await parseRoadmap(input);

      expect(result.version).toBe(1);
      expect(result.projectStatus).toBe("planning");
      expect(result.lastUpdated).toBe("2024-01-01");
      expect(result.phases).toHaveLength(1);
      expect(result.phases[0].id).toBe("phase-1");
      expect(result.phases[0].name).toBe("Infrastructure");
      expect(result.phases[0].tasks).toHaveLength(1);
    });

    it("应正确解析包含多个 phase 的 roadmap", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Infrastructure",
            tasks: [
              { id: "INF-01", title: "Scaffolding", status: "done", deps: [] },
              {
                id: "INF-02",
                title: "Core Entities",
                status: "active",
                deps: ["INF-01"],
              },
            ],
          },
          {
            id: "phase-2",
            name: "Core Features",
            tasks: [
              {
                id: "FEAT-01",
                title: "User Auth",
                status: "blocked",
                deps: ["INF-02"],
              },
              {
                id: "FEAT-02",
                title: "Dashboard",
                status: "pending",
                deps: ["INF-02"],
              },
            ],
          },
        ],
      };

      const result = await parseRoadmap(input);

      expect(result.phases).toHaveLength(2);
      expect(result.phases[0].tasks).toHaveLength(2);
      expect(result.phases[1].tasks).toHaveLength(2);
    });

    it("应正确保留任务的完整 metadata", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-06-15",
        phases: [
          {
            id: "phase-1",
            name: "Setup",
            tasks: [
              {
                id: "T-001",
                title: "Setup project",
                status: "pending",
                goal: "Initialize project structure",
                deps: [],
                tag: "Infra",
                slug: "Project_Setup",
              },
            ],
          },
        ],
      };

      const result = await parseRoadmap(input);
      const task = result.phases[0].tasks[0];

      expect(task.id).toBe("T-001");
      expect(task.title).toBe("Setup project");
      expect(task.status).toBe("pending");
      expect(task.goal).toBe("Initialize project structure");
      expect(task.deps).toEqual([]);
      expect(task.tag).toBe("Infra");
      expect(task.slug).toBe("Project_Setup");
    });

    it("应正确解析不同状态的任务", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Tasks",
            tasks: [
              { id: "T-TODO", title: "Todo task", status: "pending" },
              { id: "T-ACTIVE", title: "Active task", status: "active" },
              { id: "T-DONE", title: "Done task", status: "done" },
              { id: "T-BLOCKED", title: "Blocked task", status: "blocked" },
            ],
          },
        ],
      };

      const result = await parseRoadmap(input);
      const tasks = result.phases[0].tasks;

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
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              { id: "T-001", title: "First", status: "done", deps: [] },
              {
                id: "T-002",
                title: "Second",
                status: "active",
                deps: ["T-001"],
              },
              {
                id: "T-003",
                title: "Third",
                status: "pending",
                deps: ["T-001", "T-002"],
              },
            ],
          },
        ],
      };

      const result = await parseRoadmap(input);
      const tasks = result.phases[0].tasks;

      expect(tasks[0].deps).toEqual([]);
      expect(tasks[1].deps).toEqual(["T-001"]);
      expect(tasks[2].deps).toEqual(["T-001", "T-002"]);
    });

    it("应正确解析空 phases 数组", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [],
      };

      const result = await parseRoadmap(input);
      expect(result.phases).toHaveLength(0);
    });

    it("应正确解析含空 tasks 的 phase", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [{ id: "phase-1", name: "Empty Phase", tasks: [] }],
      };

      const result = await parseRoadmap(input);
      expect(result.phases[0].tasks).toHaveLength(0);
    });

    it("应正确解析省略可选字段的任务", async () => {
      const input: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Minimal",
            tasks: [{ id: "T-001", title: "Minimal task", status: "pending" }],
          },
        ],
      };

      const result = await parseRoadmap(input);
      const task = result.phases[0].tasks[0];

      expect(task.id).toBe("T-001");
      expect(task.title).toBe("Minimal task");
      expect(task.status).toBe("pending");
      expect(task.goal).toBeUndefined();
      expect(task.deps).toBeUndefined();
      expect(task.tag).toBeUndefined();
      expect(task.slug).toBeUndefined();
    });
  });

  // --- getAllTasks ---

  describe("getAllTasks", () => {
    it("应将多个 phase 的任务扁平化为一个列表", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              { id: "A-01", title: "Task A1", status: "done" },
              { id: "A-02", title: "Task A2", status: "active" },
            ],
          },
          {
            id: "phase-2",
            name: "Phase 2",
            tasks: [{ id: "B-01", title: "Task B1", status: "pending" }],
          },
        ],
      };

      const tasks = getAllTasks(data);

      expect(tasks).toHaveLength(3);
      expect(tasks[0].id).toBe("A-01");
      expect(tasks[1].id).toBe("A-02");
      expect(tasks[2].id).toBe("B-01");
    });

    it("空 phases 应返回空数组", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [],
      };

      expect(getAllTasks(data)).toHaveLength(0);
    });

    it("含空 tasks 的 phase 应被正确跳过", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [
          { id: "phase-1", name: "Empty", tasks: [] },
          {
            id: "phase-2",
            name: "Has tasks",
            tasks: [{ id: "T-01", title: "Only task", status: "pending" }],
          },
        ],
      };

      const tasks = getAllTasks(data);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe("T-01");
    });

    it("应保持阶段内的任务顺序", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              { id: "C-03", title: "Third", status: "pending" },
              { id: "A-01", title: "First", status: "done" },
              { id: "B-02", title: "Second", status: "active" },
            ],
          },
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
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              { id: "INF-01", title: "Scaffolding", status: "done" },
              { id: "INF-02", title: "Core Entities", status: "active" },
            ],
          },
          {
            id: "phase-2",
            name: "Phase 2",
            tasks: [{ id: "FEAT-01", title: "User Auth", status: "pending" }],
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
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              {
                id: "T-001",
                title: "Task One",
                status: "done",
                deps: ["T-002"],
              },
            ],
          },
        ],
      };

      const map = buildTaskMap(data);

      expect(map.has("T-001")).toBe(true);
      expect(map.has("T-NONEXIST")).toBe(false);
      expect(map.get("T-001")?.status).toBe("done");
      expect(map.get("T-001")?.deps).toEqual(["T-002"]);
    });

    it("空 phases 应返回空 Map", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [],
      };

      const map = buildTaskMap(data);
      expect(map.size).toBe(0);
    });

    it("重复 ID 时后者应覆盖前者", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [{ id: "DUP-01", title: "Original", status: "pending" }],
          },
          {
            id: "phase-2",
            name: "Phase 2",
            tasks: [{ id: "DUP-01", title: "Overridden", status: "done" }],
          },
        ],
      };

      const map = buildTaskMap(data);
      expect(map.size).toBe(1);
      expect(map.get("DUP-01")?.title).toBe("Overridden");
    });
  });
});

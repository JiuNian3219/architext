/** @fileoverview Task 命令测试，覆盖 resolver（路径解析）、handlers（check/update/list）、formatter（格式化）。 */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import fs from "fs-extra";
import path from "path";

// 固定 locale 为英文，确保 i18n 输出与断言字符串一致
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
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import { resolveRoadmapPath } from "../../commands/meta/task/resolver.ts";
import {
  handleCheck,
  handleUpdateStatus,
  handleList,
} from "../../commands/meta/task/handlers.ts";
import {
  formatProgressBar,
  formatTaskLine,
  getStatusIcon,
} from "../../commands/meta/task/formatter.ts";
import { RoadmapParser } from "../../core/roadmap/parser.ts";
import {
  RoadmapNotFoundError,
  TaskNotFoundError,
  InvalidTaskStatusError,
  RoadmapConsistencyError,
  AppError,
} from "../../core/errors.ts";
import type { Task, RoadmapData } from "../../core/roadmap/types.ts";

// ═══════════════════════════════════════════════════════════
// Resolver Tests
// ═══════════════════════════════════════════════════════════

describe("resolveRoadmapPath", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it("应优先使用 architext.json 中的 roadmap 配置", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        roadmap: "custom/my-roadmap.json",
        updatedAt: new Date().toISOString(),
      }),
      custom: {
        "my-roadmap.json": JSON.stringify({ version: 1, phases: [] }),
      },
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(path.resolve(tempDir, "custom/my-roadmap.json"));
  });

  it("应基于 docDir 查找 global/roadmap.json", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: "my-docs",
        updatedAt: new Date().toISOString(),
      }),
      "my-docs": {
        global: {
          "roadmap.json": JSON.stringify({ version: 1, phases: [] }),
        },
      },
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(
      path.join(tempDir, "my-docs", "global", "roadmap.json"),
    );
  });

  it("应回退到 .architext/global/roadmap.json（无 config 时）", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        global: {
          "roadmap.json": JSON.stringify({ version: 1, phases: [] }),
        },
      },
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(
      path.join(tempDir, ".architext", "global", "roadmap.json"),
    );
  });

  it("应回退到扁平路径 roadmap.json", async () => {
    await createTestStructure(tempDir, {
      "roadmap.json": JSON.stringify({ version: 1, phases: [] }),
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(path.join(tempDir, "roadmap.json"));
  });

  it("应回退到扁平路径 global/roadmap.json（根目录）", async () => {
    await createTestStructure(tempDir, {
      global: {
        "roadmap.json": JSON.stringify({ version: 1, phases: [] }),
      },
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(path.join(tempDir, "global", "roadmap.json"));
  });

  it("所有路径都不存在时应抛出 RoadmapNotFoundError", async () => {
    await expect(resolveRoadmapPath(tempDir)).rejects.toThrow(
      RoadmapNotFoundError,
    );
  });
});

// ═══════════════════════════════════════════════════════════
// Formatter Tests
// ═══════════════════════════════════════════════════════════

describe("Formatter", () => {
  describe("formatProgressBar", () => {
    it("0% 进度应全部显示空块", () => {
      const bar = formatProgressBar(0, 10, 10);
      expect(bar).toContain("0%");
      expect(bar).toContain("(0/10)");
    });

    it("100% 进度应全部显示填充块", () => {
      const bar = formatProgressBar(5, 5, 10);
      expect(bar).toContain("100%");
      expect(bar).toContain("(5/5)");
    });

    it("总数为 0 时应显示 0%", () => {
      const bar = formatProgressBar(0, 0, 10);
      expect(bar).toContain("0%");
      expect(bar).toContain("(0/0)");
    });

    it("应正确计算百分比", () => {
      const bar = formatProgressBar(3, 10, 10);
      expect(bar).toContain("30%");
      expect(bar).toContain("(3/10)");
    });
  });

  describe("getStatusIcon", () => {
    it("应为每个状态返回对应图标", () => {
      expect(getStatusIcon("pending")).toBe("\u23F3");
      expect(getStatusIcon("active")).toBe("\uD83D\uDFE2");
      expect(getStatusIcon("done")).toBe("\u2705");
      expect(getStatusIcon("blocked")).toBe("\uD83E\uDDF1");
    });
  });

  describe("formatTaskLine", () => {
    it("应包含图标、ID 和标题", () => {
      const task: Task = {
        id: "T-001",
        title: "Setup project",
        status: "pending",
      };

      const line = formatTaskLine(task);
      expect(line).toContain("T-001");
      expect(line).toContain("Setup project");
    });

    it("应正确格式化不同状态的任务", () => {
      const tasks: Task[] = [
        { id: "T-001", title: "Pending task", status: "pending" },
        { id: "T-002", title: "Active task", status: "active" },
        { id: "T-003", title: "Done task", status: "done" },
        { id: "T-004", title: "Blocked task", status: "blocked" },
      ];

      tasks.forEach((task) => {
        const line = formatTaskLine(task);
        expect(line).toContain(task.id);
        expect(line).toContain(task.title);
        const icon = getStatusIcon(task.status);
        expect(line).toContain(icon);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════
// Handler Tests
// ═══════════════════════════════════════════════════════════

describe("Handlers", () => {
  let tempDir: string;

  /** 标准测试用 Roadmap JSON */
  const SAMPLE_ROADMAP: RoadmapData = {
    version: 1,
    projectStatus: "active",
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
            goal: "Initialize project structure",
            deps: [],
            tag: "Infra",
            slug: "Project_Scaffolding",
          },
          {
            id: "INF-02",
            title: "Core Calculator Domain",
            status: "done",
            goal: "Define core domain models",
            deps: ["INF-01"],
            tag: "Infra",
            slug: "Core_Calculator_Domain",
          },
        ],
      },
      {
        id: "phase-2",
        name: "Core Features",
        tasks: [
          {
            id: "FEAT-01",
            title: "Basic Calculator UI",
            status: "pending",
            goal: "Implement basic calculator",
            deps: ["INF-02"],
            tag: "Core",
            slug: "Basic_Calculator_UI",
          },
          {
            id: "FEAT-02",
            title: "History & Persistence",
            status: "pending",
            goal: "Implement history feature",
            deps: ["INF-02"],
            tag: "Core",
            slug: "History_Persistence",
          },
          {
            id: "FEAT-03",
            title: "Responsive Layout",
            status: "pending",
            goal: "Mobile-first responsive design",
            deps: ["FEAT-01"],
            tag: "UI",
            slug: "Responsive_Layout",
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  /** 辅助：创建 roadmap.json 文件并返回解析数据和文件路径 */
  async function setupRoadmap(data: RoadmapData = SAMPLE_ROADMAP) {
    const roadmapPath = path.join(tempDir, "roadmap.json");
    await fs.writeJSON(roadmapPath, data, { spaces: 2 });
    const parser = new RoadmapParser();
    const parsedData = await parser.parse(roadmapPath);
    return { data: parsedData, roadmapPath };
  }

  // ─── handleCheck ──────────────────────────────────────────

  describe("handleCheck", () => {
    it("一致的 Roadmap 应通过检查", async () => {
      const { data } = await setupRoadmap();
      await expect(handleCheck(data)).resolves.not.toThrow();
    });

    it("无效的依赖引用应报错", async () => {
      const badData: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              { id: "T-001", title: "First", status: "pending", deps: [] },
              {
                id: "T-002",
                title: "Depends on ghost",
                status: "active",
                deps: ["T-001", "T-GHOST"],
              },
            ],
          },
        ],
      };

      const { data } = await setupRoadmap(badData);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) => i.includes("T-GHOST") && i.includes("invalid"),
          ),
        ).toBe(true);
      }
    });

    it("重复的任务 ID 应报错", async () => {
      const badData: RoadmapData = {
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
            tasks: [{ id: "DUP-01", title: "Duplicate", status: "done" }],
          },
        ],
      };

      const { data } = await setupRoadmap(badData);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) => i.includes("Duplicate") && i.includes("DUP-01"),
          ),
        ).toBe(true);
      }
    });

    it("无效的状态值应在 Schema 校验阶段报错", async () => {
      const badData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Phase 1",
            tasks: [
              { id: "T-001", title: "Bad status", status: "invalid_status" },
            ],
          },
        ],
      } as unknown as RoadmapData;

      try {
        await setupRoadmap(badData);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe("SCHEMA_VALIDATION_ERROR");
        expect((error as AppError).message).toContain("status");
      }
    });
  });

  // ─── handleUpdateStatus ───────────────────────────────────

  describe("handleUpdateStatus", () => {
    it("缺少 ID 时应抛出错误", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await expect(
        handleUpdateStatus(data, roadmapPath, undefined, "done"),
      ).rejects.toThrow(AppError);
    });

    it("无效状态应抛出 InvalidTaskStatusError", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await expect(
        handleUpdateStatus(data, roadmapPath, "INF-01", "invalid"),
      ).rejects.toThrow(InvalidTaskStatusError);
    });

    it("不存在的任务 ID 应抛出 TaskNotFoundError", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await expect(
        handleUpdateStatus(data, roadmapPath, "NONEXIST", "done"),
      ).rejects.toThrow(TaskNotFoundError);
    });

    it("应正确更新任务状态到 done", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await handleUpdateStatus(data, roadmapPath, "FEAT-01", "done");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      const task = updated.phases[1].tasks[0];

      expect(task.id).toBe("FEAT-01");
      expect(task.status).toBe("done");
    });

    it("应正确更新任务状态到 active", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await handleUpdateStatus(data, roadmapPath, "FEAT-01", "active");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      const task = updated.phases[1].tasks[0];

      expect(task.status).toBe("active");
    });

    it("应正确更新任务状态到 blocked", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await handleUpdateStatus(data, roadmapPath, "FEAT-02", "blocked");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      const task = updated.phases[1].tasks[1];

      expect(task.status).toBe("blocked");
    });

    it("应更新 lastUpdated 时间戳", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await handleUpdateStatus(data, roadmapPath, "FEAT-01", "done");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      expect(updated.lastUpdated).not.toBe("2024-01-01");
    });

    it("任务完成后应级联解锁 blocked 的下游任务", async () => {
      const cascadeData: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Infrastructure",
            tasks: [
              {
                id: "INF-01",
                title: "Scaffolding",
                status: "active",
                deps: [],
              },
            ],
          },
          {
            id: "phase-2",
            name: "Features",
            tasks: [
              {
                id: "FEAT-01",
                title: "Feature A",
                status: "blocked",
                deps: ["INF-01"],
              },
            ],
          },
        ],
      };

      const { data, roadmapPath } = await setupRoadmap(cascadeData);
      await handleUpdateStatus(data, roadmapPath, "INF-01", "done");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      expect(updated.phases[0].tasks[0].status).toBe("done");
      expect(updated.phases[1].tasks[0].status).toBe("pending");
    });

    it("多依赖未全部完成时不应解锁下游任务", async () => {
      const cascadeData: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Infrastructure",
            tasks: [
              {
                id: "INF-01",
                title: "Scaffolding",
                status: "active",
                deps: [],
              },
              {
                id: "INF-02",
                title: "Core Domain",
                status: "pending",
                deps: [],
              },
            ],
          },
          {
            id: "phase-2",
            name: "Features",
            tasks: [
              {
                id: "FEAT-01",
                title: "Feature A",
                status: "blocked",
                deps: ["INF-01", "INF-02"],
              },
            ],
          },
        ],
      };

      const { data, roadmapPath } = await setupRoadmap(cascadeData);
      await handleUpdateStatus(data, roadmapPath, "INF-01", "done");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      // INF-02 还未 done，FEAT-01 应仍为 blocked
      expect(updated.phases[1].tasks[0].status).toBe("blocked");
    });

    it("多依赖全部完成后应解锁下游任务", async () => {
      const cascadeData: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Infrastructure",
            tasks: [
              { id: "INF-01", title: "Scaffolding", status: "done", deps: [] },
              {
                id: "INF-02",
                title: "Core Domain",
                status: "active",
                deps: [],
              },
            ],
          },
          {
            id: "phase-2",
            name: "Features",
            tasks: [
              {
                id: "FEAT-01",
                title: "Feature A",
                status: "blocked",
                deps: ["INF-01", "INF-02"],
              },
            ],
          },
        ],
      };

      const { data, roadmapPath } = await setupRoadmap(cascadeData);
      await handleUpdateStatus(data, roadmapPath, "INF-02", "done");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      expect(updated.phases[1].tasks[0].status).toBe("pending");
    });

    it("非 blocked 的下游任务不应被级联修改", async () => {
      const cascadeData: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Infrastructure",
            tasks: [
              {
                id: "INF-01",
                title: "Scaffolding",
                status: "active",
                deps: [],
              },
            ],
          },
          {
            id: "phase-2",
            name: "Features",
            tasks: [
              {
                id: "FEAT-01",
                title: "Feature A",
                status: "active",
                deps: ["INF-01"],
              },
            ],
          },
        ],
      };

      const { data, roadmapPath } = await setupRoadmap(cascadeData);
      await handleUpdateStatus(data, roadmapPath, "INF-01", "done");

      const updated: RoadmapData = await fs.readJSON(roadmapPath);
      // FEAT-01 是 active 而非 blocked，不应被改
      expect(updated.phases[1].tasks[0].status).toBe("active");
    });
  });

  // ─── handleList ───────────────────────────────────────────

  describe("handleList", () => {
    it("应正常输出任务列表而不抛错", async () => {
      const { data } = await setupRoadmap();
      expect(() => handleList(data)).not.toThrow();
    });

    it("空任务列表应输出警告", async () => {
      const emptyData: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [],
      };

      const { data } = await setupRoadmap(emptyData);

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      handleList(data);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});

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
import type { Task } from "../../core/roadmap/types.ts";

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
        roadmap: "custom/my-roadmap.md",
        updatedAt: new Date().toISOString(),
      }),
      custom: {
        "my-roadmap.md": "# Custom Roadmap",
      },
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(path.resolve(tempDir, "custom/my-roadmap.md"));
  });

  it("应基于 docDir 查找 global/00_roadmap.md", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: "my-docs",
        updatedAt: new Date().toISOString(),
      }),
      "my-docs": {
        global: {
          "00_roadmap.md": "# Roadmap",
        },
      },
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(
      path.join(tempDir, "my-docs", "global", "00_roadmap.md"),
    );
  });

  it("应回退到默认候选路径 (00_roadmap.md)", async () => {
    await createTestStructure(tempDir, {
      "00_roadmap.md": "# Default Roadmap",
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(path.join(tempDir, "00_roadmap.md"));
  });

  it("应回退到 docs/global/00_roadmap.md", async () => {
    await createTestStructure(tempDir, {
      docs: {
        global: {
          "00_roadmap.md": "# Docs Roadmap",
        },
      },
    });

    const result = await resolveRoadmapPath(tempDir);
    expect(result).toBe(path.join(tempDir, "docs", "global", "00_roadmap.md"));
  });

  it("所有路径都不存在时应抛出 RoadmapNotFoundError", async () => {
    // tempDir 是空的，没有任何 roadmap 文件
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
        lineNum: 0,
        rawLine: "- [ ] ⏳ **[T-001]** Setup project",
      };

      const line = formatTaskLine(task);
      expect(line).toContain("T-001");
      expect(line).toContain("Setup project");
    });

    it("应正确格式化不同状态的任务", () => {
      const tasks: Task[] = [
        {
          id: "T-001",
          title: "Pending task",
          status: "pending",
          lineNum: 0,
          rawLine: "- [ ] ⏳ **[T-001]** Pending task",
        },
        {
          id: "T-002",
          title: "Active task",
          status: "active",
          lineNum: 1,
          rawLine: "- [ ] 🟢 **[T-002]** Active task",
        },
        {
          id: "T-003",
          title: "Done task",
          status: "done",
          lineNum: 2,
          rawLine: "- [x] ✅ **[T-003]** Done task",
        },
        {
          id: "T-004",
          title: "Blocked task",
          status: "blocked",
          lineNum: 3,
          rawLine: "- [ ] 🧱 **[T-004]** Blocked task",
        },
      ];

      tasks.forEach((task) => {
        const line = formatTaskLine(task);
        expect(line).toContain(task.id);
        expect(line).toContain(task.title);
        // 验证图标存在（通过 getStatusIcon 函数）
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

  /**
   * 标准测试用 Roadmap —— 基于真实 Web Calculator 项目简化。
   *
   * 图结构：INF-01 → INF-02 → FEAT-01/02/03
   * Dep 字段包含完整逻辑依赖（含间接依赖），图只展示主要执行路径。
   * 例如 FEAT-03 的 Dep 包含 FEAT-01，但图中只有 INF-02→FEAT-03。
   */
  const SAMPLE_ROADMAP = [
    "# Product Roadmap",
    "",
    "<!-- TASKS_START -->",
    "- [x] ✅ **[INF-01]** Project Scaffolding",
    "  - 🎯 Goal: Initialize project structure",
    "  - 🔗 Dep: None",
    "  - 🏷️ Tag: Infra",
    "  - 📁 Slug: Project_Scaffolding",
    "- [x] ✅ **[INF-02]** Core Calculator Domain",
    "  - 🎯 Goal: Define core domain models",
    "  - 🔗 Dep: [INF-01]",
    "  - 🏷️ Tag: Infra",
    "  - 📁 Slug: Core_Calculator_Domain",
    "- [ ] ⏳ **[FEAT-01]** Basic Calculator UI",
    "  - 🎯 Goal: Implement basic calculator",
    "  - 🔗 Dep: [INF-02]",
    "  - 🏷️ Tag: Core",
    "  - 📁 Slug: Basic_Calculator_UI",
    "- [ ] ⏳ **[FEAT-02]** History & Persistence",
    "  - 🎯 Goal: Implement history feature",
    "  - 🔗 Dep: [INF-02]",
    "  - 🏷️ Tag: Core",
    "  - 📁 Slug: History_Persistence",
    "- [ ] ⏳ **[FEAT-03]** Responsive Layout",
    "  - 🎯 Goal: Mobile-first responsive design",
    "  - 🔗 Dep: [FEAT-01]",
    "  - 🏷️ Tag: UI",
    "  - 📁 Slug: Responsive_Layout",
    "<!-- TASKS_END -->",
    "",
    "<!-- VISUAL_START -->",
    "```mermaid",
    "graph TD",
    "  classDef done fill:#9f9,stroke:#333,stroke-width:2px;",
    "  classDef active fill:#f9f,stroke:#333,stroke-width:4px;",
    "  classDef pending fill:#fff,stroke:#333,stroke-width:1px;",
    "  classDef blocked fill:#ccc,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;",
    "  INF-01[INF-01: Scaffolding] --> INF-02[INF-02: Core Domain]",
    "  INF-02 --> FEAT-01[FEAT-01: Basic UI]",
    "  INF-02 --> FEAT-02[FEAT-02: History]",
    "  INF-02 --> FEAT-03[FEAT-03: Responsive]",
    "  class INF-01 done;",
    "  class INF-02 done;",
    "  class FEAT-01 pending;",
    "  class FEAT-02 pending;",
    "  class FEAT-03 pending;",
    "```",
    "<!-- VISUAL_END -->",
  ].join("\n");

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  /** 辅助：创建 roadmap 文件并返回解析数据和文件路径 */
  async function setupRoadmap(content: string = SAMPLE_ROADMAP) {
    const roadmapPath = path.join(tempDir, "roadmap.md");
    await fs.writeFile(roadmapPath, content, "utf-8");
    const parser = new RoadmapParser();
    const data = await parser.parse(roadmapPath);
    return { data, roadmapPath };
  }

  // ─── Task 解析完整性测试 ──────────────────────────────────

  describe("Task 解析完整性", () => {
    it("应正确解析包含完整 metadata 的任务", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ **[T-001]** Setup project",
        "  - 🎯 Goal: Initialize project structure",
        "  - 🔗 Dep: None",
        "  - 🏷️ Tag: Infra",
        "  - 📁 Slug: Project_Setup",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Setup project]",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);
      const task = data.tasks.get("T-001");

      expect(task).toBeDefined();
      expect(task?.id).toBe("T-001");
      expect(task?.title).toBe("Setup project");
      expect(task?.status).toBe("pending");
      expect(task?.goal).toBe("Initialize project structure");
      expect(task?.tag).toBe("Infra");
      expect(task?.slug).toBe("Project_Setup");
      // "Dep: None" 会被解析为 ["None"]，这是 parser 的正常行为
      expect(task?.deps).toEqual(["None"]);
      expect(task?.lineNum).toBeGreaterThanOrEqual(0);
      expect(task?.rawLine).toContain("T-001");
    });

    it("应正确解析依赖数组", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] 🟢 **[T-002]** Feature task",
        "  - 🔗 Dep: [T-001], [T-003]",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Task 1] --> T-002[Feature task]",
        "  T-003[Task 3] --> T-002",
        "  class T-002 active;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);
      const task = data.tasks.get("T-002");

      expect(task).toBeDefined();
      expect(task?.deps).toEqual(["T-001", "T-003"]);
    });

    it("应正确解析不同状态的任务", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ **[T-TODO]** Todo task",
        "- [ ] 🟢 **[T-ACTIVE]** Active task",
        "- [x] ✅ **[T-DONE]** Done task",
        "- [ ] 🧱 **[T-BLOCKED]** Blocked task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  class T-TODO pending;",
        "  class T-ACTIVE active;",
        "  class T-DONE done;",
        "  class T-BLOCKED blocked;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      expect(data.tasks.get("T-TODO")?.status).toBe("pending");
      expect(data.tasks.get("T-ACTIVE")?.status).toBe("active");
      expect(data.tasks.get("T-DONE")?.status).toBe("done");
      expect(data.tasks.get("T-BLOCKED")?.status).toBe("blocked");
    });

    it("应正确记录行号和原始行内容", async () => {
      const content = [
        "# Title",
        "",
        "<!-- TASKS_START -->",
        "- [ ] ⏳ **[T-001]** First task",
        "  - 🎯 Goal: First goal",
        "- [ ] 🟢 **[T-002]** Second task",
        "  - 🎯 Goal: Second goal",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  class T-001 pending;",
        "  class T-002 active;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);
      const task1 = data.tasks.get("T-001");
      const task2 = data.tasks.get("T-002");

      expect(task1?.lineNum).toBe(3); // 第 4 行（0-based）
      expect(task1?.rawLine).toContain("T-001");
      expect(task1?.rawLine).toContain("First task");

      expect(task2?.lineNum).toBe(5); // 第 6 行（0-based）
      expect(task2?.rawLine).toContain("T-002");
      expect(task2?.rawLine).toContain("Second task");
    });

    it("应支持不带 ** 包裹的 ID 格式（向后兼容）", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Old format task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Old format task]",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);
      const task = data.tasks.get("T-001");

      expect(task).toBeDefined();
      expect(task?.id).toBe("T-001");
      expect(task?.title).toBe("Old format task");
    });
  });

  // ─── handleCheck ──────────────────────────────────────────

  describe("handleCheck", () => {
    it("一致的 Roadmap 应通过检查", async () => {
      const { data } = await setupRoadmap();
      // 不应抛出异常
      await expect(handleCheck(data)).resolves.not.toThrow();
    });

    it("图中存在但列表中缺失的节点应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Exists in list",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Exists] --> T-GHOST[Ghost]",
        "  class T-001 pending;",
        "  class T-GHOST done;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);
      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) =>
              i.includes("T-GHOST") && i.includes("no matching entry"),
          ),
        ).toBe(true);
      }
    });

    it("状态不一致时应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Todo task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Todo task]",
        "  class T-001 done;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) => i.includes("Status mismatch") && i.includes("T-001"),
          ),
        ).toBe(true);
      }
    });

    it("列表中存在但图中缺失 class 定义的任务应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Has graph class",
        "- [ ] 🟢 [T-002] Missing graph class",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Has class] --> T-002[Missing class]",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) =>
              i.includes("T-002") && i.includes("no 'class' definition"),
          ),
        ).toBe(true);
      }
    });

    it("无效的依赖引用应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] First task",
        "  - Dep: None",
        "- [ ] 🟢 [T-002] Depends on ghost",
        "  - Dep: [T-001], [T-GHOST]",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[First] --> T-002[Depends]",
        "  class T-001 pending;",
        "  class T-002 active;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) =>
              i.includes("T-GHOST") && i.includes("invalid dependency"),
          ),
        ).toBe(true);
      }
    });

    // ─── B. Mermaid 图结构完整性 ─────────────────────────

    it("缺少 classDef 声明应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Some task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  T-001[Some task]",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        // 缺少 active, pending, blocked 共 3 个 classDef 声明
        expect(
          issues.filter((i: string) => i.includes("missing required 'classDef"))
            .length,
        ).toBe(3);
        // class T-001 引用了未声明的 pending，也应被检出
        expect(
          issues.some(
            (i: string) =>
              i.includes("undeclared classDef") && i.includes("pending"),
          ),
        ).toBe(true);
      }
    });

    it("缺少节点定义（盒子）应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Has box",
        "- [ ] 🟢 [T-002] No box",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Has box]",
        "  class T-001 pending;",
        "  class T-002 active;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) =>
              i.includes("T-002") && i.includes("no node definition"),
          ),
        ).toBe(true);
      }
    });

    // ─── D. Mermaid 语法校验 ──────────────────────────────

    it("缺少 graph 声明应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Some task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Some task]",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some((i: string) => i.includes("graph TD/LR/TB/BT/RL")),
        ).toBe(true);
      }
    });

    it("方括号不匹配应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Some task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Some task",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some((i: string) => i.includes("unbalanced brackets")),
        ).toBe(true);
      }
    });

    it("空节点标签 ID[] 应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Some task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[]",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(issues.some((i: string) => i.includes("empty node label"))).toBe(
          true,
        );
      }
    });

    it("class 引用未声明的 classDef 应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Some task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  T-001[Some task]",
        "  class T-001 mystyle;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(
          issues.some(
            (i: string) =>
              i.includes("undeclared classDef") && i.includes("mystyle"),
          ),
        ).toBe(true);
      }
    });

    it("Mermaid 代码块为空应报错", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Some task",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      try {
        await handleCheck(data);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapConsistencyError);
        const issues = (error as RoadmapConsistencyError).issues;
        expect(issues.some((i: string) => i.includes("empty"))).toBe(true);
      }
    });

    // ─── B. Mermaid 图结构完整性（原有） ──────────────────

    it("Dep 字段包含间接依赖但图中无对应边时不应报错（图是简化的可视化）", async () => {
      // 真实场景：FEAT-03 的 Dep 是 [FEAT-01]，但图中只有 INF-02→FEAT-03。
      // FEAT-01 和 FEAT-03 是兄弟节点（都由 INF-02 派生），图无需为 Dep 中的
      // 每条逻辑依赖都画边。Check #7 已确保 Dep 引用的任务 ID 存在。
      const content = [
        "<!-- TASKS_START -->",
        "- [x] ✅ [INF-01] Scaffolding",
        "  - Dep: None",
        "- [x] ✅ [INF-02] Core Domain",
        "  - Dep: [INF-01]",
        "- [ ] ⏳ [FEAT-01] Basic UI",
        "  - Dep: [INF-02]",
        "- [ ] ⏳ [FEAT-02] History",
        "  - Dep: [INF-02]",
        "- [ ] ⏳ [FEAT-03] Responsive",
        "  - Dep: [FEAT-01]",
        "- [ ] ⏳ [FEAT-04] Error Highlight",
        "  - Dep: [INF-02], [FEAT-01]",
        "<!-- TASKS_END -->",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  classDef pending fill:#fff;",
        "  classDef blocked fill:#ccc;",
        "  INF-01[Scaffolding] --> INF-02[Core Domain]",
        "  INF-02 --> FEAT-01[Basic UI]",
        "  INF-02 --> FEAT-02[History]",
        "  INF-02 --> FEAT-03[Responsive]",
        "  INF-02 --> FEAT-04[Error Highlight]",
        "  class INF-01 done;",
        "  class INF-02 done;",
        "  class FEAT-01 pending;",
        "  class FEAT-02 pending;",
        "  class FEAT-03 pending;",
        "  class FEAT-04 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const { data } = await setupRoadmap(content);

      // FEAT-03.Dep=[FEAT-01] 和 FEAT-04.Dep=[INF-02,FEAT-01] 在图中均无直达边，
      // 但 Dep 是逻辑依赖元数据，图是简化可视化，不需要一一对应，应通过检查。
      await expect(handleCheck(data)).resolves.not.toThrow();
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

      const updated = await fs.readFile(roadmapPath, "utf-8");
      const lines = updated.split("\n");

      // 任务列表行应变为 [x] ✅
      const taskLine = lines.find((l) => l.includes("[FEAT-01]"));
      expect(taskLine).toBeDefined();
      expect(taskLine).toContain("[x]");
      expect(taskLine).toContain("\u2705");

      // Mermaid class 应变为 done
      const classLine = lines.find((l) => l.includes("class FEAT-01"));
      expect(classLine).toBeDefined();
      expect(classLine).toContain("done");
    });

    it("应正确更新任务状态到 active", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await handleUpdateStatus(data, roadmapPath, "FEAT-01", "active");

      const updated = await fs.readFile(roadmapPath, "utf-8");

      // 任务列表行应变为 [ ] 🟢
      expect(updated).toContain("[ ]");
      expect(updated).toMatch(/🟢.*\[FEAT-01\]/);

      // Mermaid class 应变为 active
      expect(updated).toContain("class FEAT-01 active");
    });

    it("应正确更新任务状态到 blocked", async () => {
      const { data, roadmapPath } = await setupRoadmap();
      await handleUpdateStatus(data, roadmapPath, "FEAT-02", "blocked");

      const updated = await fs.readFile(roadmapPath, "utf-8");
      expect(updated).toContain("class FEAT-02 blocked");
    });
  });

  // ─── handleList ───────────────────────────────────────────

  describe("handleList", () => {
    it("应正常输出任务列表而不抛错", async () => {
      const { data } = await setupRoadmap();
      // handleList 是同步函数，不应抛出异常
      expect(() => handleList(data)).not.toThrow();
    });

    it("空任务列表应输出警告", async () => {
      const content = ["<!-- TASKS_START -->", "<!-- TASKS_END -->"].join("\n");

      const { data } = await setupRoadmap(content);

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      handleList(data);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});

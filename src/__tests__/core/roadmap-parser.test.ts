/**
 * ---
 * description: RoadmapParser 单元测试，验证任务列表解析、Mermaid 图节点解析、元数据提取等核心逻辑。
 * ---
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { RoadmapParser } from "../../core/roadmap/parser.ts";
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

  /** 辅助函数：在临时目录创建 roadmap 文件并解析 */
  async function parseRoadmap(content: string) {
    const filePath = path.join(tempDir, "roadmap.md");
    await createTestStructure(tempDir, { "roadmap.md": content });
    return parser.parse(filePath);
  }

  // ─── Anchor Detection ─────────────────────────────────────

  describe("锚点检测", () => {
    it("应正确识别 TASKS_START/END 锚点行号", async () => {
      const content = [
        "# Roadmap",
        "",
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Task One",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.listStartLine).toBe(2);
      expect(data.listEndLine).toBe(4);
    });

    it("应正确识别 VISUAL_START/END 锚点行号", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  class T-001 done;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.visualStartLine).toBe(0);
      expect(data.visualEndLine).toBe(5);
    });

    it("锚点不存在时应保持默认值 -1", async () => {
      const content = "# Empty Roadmap\nNothing here.";
      const data = await parseRoadmap(content);

      expect(data.listStartLine).toBe(-1);
      expect(data.listEndLine).toBe(-1);
      expect(data.visualStartLine).toBe(-1);
      expect(data.visualEndLine).toBe(-1);
    });
  });

  // ─── Task Parsing ─────────────────────────────────────────

  describe("任务列表解析", () => {
    it("应解析不同状态的任务", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Setup infrastructure",
        "- [ ] 🟢 [T-002] Feature development",
        "- [x] ✅ [T-003] Completed feature",
        "- [ ] 🧱 [T-004] Blocked task",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);

      expect(data.tasks.size).toBe(4);
      expect(data.tasks.get("T-001")?.status).toBe("pending");
      expect(data.tasks.get("T-002")?.status).toBe("active");
      expect(data.tasks.get("T-003")?.status).toBe("done");
      expect(data.tasks.get("T-004")?.status).toBe("blocked");
    });

    it("应提取任务标题", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [INF-001] Setup project infrastructure",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      const task = data.tasks.get("INF-001");

      expect(task).toBeDefined();
      expect(task!.title).toBe("Setup project infrastructure");
    });

    it("应记录原始行号和行内容", async () => {
      const content = [
        "# Roadmap",
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] First task",
        "- [x] ✅ [T-002] Second task",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);

      expect(data.tasks.get("T-001")?.lineNum).toBe(2);
      expect(data.tasks.get("T-002")?.lineNum).toBe(3);
      expect(data.tasks.get("T-001")?.rawLine).toBe(
        "- [ ] ⏳ [T-001] First task",
      );
    });

    it("应支持加粗的任务 ID（**[ID]**）", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ **[INF-001]** Setup with bold ID",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.tasks.has("INF-001")).toBe(true);
      expect(data.tasks.get("INF-001")?.title).toBe("Setup with bold ID");
    });

    it("空的任务区域应返回空 Map", async () => {
      const content = ["<!-- TASKS_START -->", "<!-- TASKS_END -->"].join("\n");

      const data = await parseRoadmap(content);
      expect(data.tasks.size).toBe(0);
    });
  });

  // ─── Metadata Parsing ─────────────────────────────────────

  describe("任务元数据解析", () => {
    it("应解析 Goal 元数据", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Setup project",
        "  - Goal: Initialize the project structure",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.tasks.get("T-001")?.goal).toBe(
        "Initialize the project structure",
      );
    });

    it("应解析 Dep 元数据并拆分为数组", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-003] Depends on others",
        "  - Dep: [T-001], [T-002]",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      const deps = data.tasks.get("T-003")?.deps;

      expect(deps).toBeDefined();
      expect(deps).toEqual(["T-001", "T-002"]);
    });

    it("应解析 Tag 元数据", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] Tagged task",
        "  - Tag: infra",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.tasks.get("T-001")?.tag).toBe("infra");
    });

    it("应解析 Slug 元数据", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [T-001] 订阅 CRUD",
        "  - Slug: Subscription_CRUD",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.tasks.get("T-001")?.slug).toBe("Subscription_CRUD");
    });

    it("应解析含 emoji 前缀的 Slug 元数据", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] ⏳ **[T-001]** 主题切换",
        "  - 📁 Slug: Theme_Switch",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.tasks.get("T-001")?.slug).toBe("Theme_Switch");
    });

    it("应同时解析多个元数据字段", async () => {
      const content = [
        "<!-- TASKS_START -->",
        "- [ ] 🟢 [FEAT-001] Full metadata task",
        "  - Goal: Complete feature implementation",
        "  - Dep: [INF-001]",
        "  - Tag: feature",
        "  - Slug: Full_Metadata",
        "<!-- TASKS_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      const task = data.tasks.get("FEAT-001");

      expect(task?.goal).toBe("Complete feature implementation");
      expect(task?.deps).toEqual(["INF-001"]);
      expect(task?.tag).toBe("feature");
      expect(task?.slug).toBe("Full_Metadata");
    });
  });

  // ─── Graph Node Parsing ───────────────────────────────────

  describe("Mermaid 图节点解析", () => {
    it("应解析 class 定义", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  T-001[Setup]",
        "  class T-001 done;",
        "  class T-002 active;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);

      expect(data.nodes.size).toBe(2);
      expect(data.nodes.get("T-001")?.styleClass).toBe("done");
      expect(data.nodes.get("T-002")?.styleClass).toBe("active");
    });

    it("应记录 class 定义所在行号", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  class T-001 pending;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.nodes.get("T-001")?.lineNum).toBe(3);
    });

    it("不在 VISUAL 区域内的 class 不应被解析", async () => {
      const content = [
        "```mermaid",
        "graph TD",
        "  class OUTSIDE pending;",
        "```",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.nodes.size).toBe(0);
    });

    it("应解析节点定义（ID[label]）", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  T-001[Setup] --> T-002[Linting]",
        "  T-003[Core feature]",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.nodeDefinitions.size).toBe(3);
      expect(data.nodeDefinitions.has("T-001")).toBe(true);
      expect(data.nodeDefinitions.has("T-002")).toBe(true);
      expect(data.nodeDefinitions.has("T-003")).toBe(true);
    });

    it("应解析依赖边（A --> B）", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  A[First] --> B[Second]",
        "  B --> C[Third]",
        "  A --> C",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.edges.length).toBe(3);
      expect(data.edges).toContainEqual({ from: "A", to: "B" });
      expect(data.edges).toContainEqual({ from: "B", to: "C" });
      expect(data.edges).toContainEqual({ from: "A", to: "C" });
    });

    it("应解析 classDef 声明", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9,stroke:#333,stroke-width:2px;",
        "  classDef active fill:#f9f,stroke:#333,stroke-width:4px;",
        "  classDef pending fill:#fff,stroke:#333;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.classDefNames.size).toBe(3);
      expect(data.classDefNames.has("done")).toBe(true);
      expect(data.classDefNames.has("active")).toBe(true);
      expect(data.classDefNames.has("pending")).toBe(true);
    });

    it("应收集 mermaidLines（用于语法校验）", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  T-001[Setup] --> T-002[Linting]",
        "  class T-001 done;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);

      // 应收集 mermaid 代码块内部的所有行（不含 ```mermaid 和 ``` 围栏）
      expect(data.mermaidLines.length).toBe(4);
      expect(data.mermaidLines[0].content.trim()).toBe("graph TD");
      expect(data.mermaidLines[1].content).toContain("classDef done");
      expect(data.mermaidLines[2].content).toContain("T-001[Setup]");
      expect(data.mermaidLines[3].content).toContain("class T-001 done");

      // 每行应记录正确的行号
      expect(data.mermaidLines[0].lineNum).toBe(2); // "graph TD" is line index 2
    });

    it("VISUAL 区块外的 mermaid 不应收集到 mermaidLines", async () => {
      const content = [
        "```mermaid",
        "graph TD",
        "  T-001[Outside]",
        "```",
      ].join("\n");

      const data = await parseRoadmap(content);
      expect(data.mermaidLines.length).toBe(0);
    });

    it("classDef 不应被误匹配为 class 定义", async () => {
      const content = [
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  classDef done fill:#9f9;",
        "  classDef active fill:#f9f;",
        "  class T-001 done;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);
      // classDef 不应进入 nodes
      expect(data.nodes.size).toBe(1);
      expect(data.nodes.get("T-001")?.styleClass).toBe("done");
      // classDef 应进入 classDefNames
      expect(data.classDefNames.size).toBe(2);
    });
  });

  // ─── Complete Roadmap ─────────────────────────────────────

  describe("完整 Roadmap 文件解析", () => {
    it("应同时解析任务列表和 Mermaid 图", async () => {
      const content = [
        "# Project Roadmap",
        "",
        "## Tasks",
        "<!-- TASKS_START -->",
        "- [ ] ⏳ [INF-001] Setup project",
        "  - Goal: Initialize",
        "  - Tag: infra",
        "- [x] ✅ [INF-002] Add linting",
        "  - Dep: [INF-001]",
        "- [ ] 🟢 [FEAT-001] Core feature",
        "  - Dep: [INF-001], [INF-002]",
        "<!-- TASKS_END -->",
        "",
        "## Graph",
        "<!-- VISUAL_START -->",
        "```mermaid",
        "graph TD",
        "  INF-001[Setup] --> INF-002[Linting]",
        "  INF-001 --> FEAT-001[Core]",
        "  class INF-001 pending;",
        "  class INF-002 done;",
        "  class FEAT-001 active;",
        "```",
        "<!-- VISUAL_END -->",
      ].join("\n");

      const data = await parseRoadmap(content);

      // 任务列表
      expect(data.tasks.size).toBe(3);
      expect(data.tasks.get("INF-001")?.status).toBe("pending");
      expect(data.tasks.get("INF-002")?.status).toBe("done");
      expect(data.tasks.get("FEAT-001")?.status).toBe("active");

      // 依赖关系
      expect(data.tasks.get("FEAT-001")?.deps).toEqual(["INF-001", "INF-002"]);

      // 图节点
      expect(data.nodes.size).toBe(3);
      expect(data.nodes.get("INF-001")?.styleClass).toBe("pending");
      expect(data.nodes.get("INF-002")?.styleClass).toBe("done");
      expect(data.nodes.get("FEAT-001")?.styleClass).toBe("active");

      // 锚点行号
      expect(data.listStartLine).toBe(3);
      expect(data.listEndLine).toBe(11);
      expect(data.visualStartLine).toBe(14);
      expect(data.visualEndLine).toBe(23);
    });
  });

  // ─── Real-World Format ──────────────────────────────────────

  describe("真实生产格式解析（含 Phase header、加粗 ID、emoji metadata、classDef）", () => {
    /** 模拟真实用户 roadmap 文件格式 */
    const REAL_WORLD_ROADMAP = [
      "---",
      "description: Project Execution Queue",
      "---",
      "",
      "# Product Roadmap",
      "",
      "> **Status:** Planning",
      "> **Last Updated:** 2026-02-06",
      "",
      "---",
      "",
      "## 🗺️ Master Plan",
      "",
      "### 📊 Dependency Graph",
      "",
      "<!-- VISUAL_START -->",
      "",
      "```mermaid",
      "graph TD",
      "    classDef done fill:#9f9,stroke:#333,stroke-width:2px;",
      "    classDef active fill:#f9f,stroke:#333,stroke-width:4px;",
      "    classDef pending fill:#fff,stroke:#333,stroke-width:1px;",
      "    classDef blocked fill:#ccc,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;",
      "",
      "    INF-01[🏗️ INF-01: Project Scaffolding] --> INF-02[🏗️ INF-02: Core Entities]",
      "    INF-02 --> SUB-01[✨ SUB-01: 订阅 CRUD]",
      "    INF-02 --> CAT-01[🏷️ CAT-01: 分类/标签]",
      "    SUB-01 --> BUDGET-01[💰 BUDGET-01: 预算预警]",
      "",
      "    class INF-01 done;",
      "    class INF-02 done;",
      "    class SUB-01 active;",
      "    class CAT-01 pending;",
      "    class BUDGET-01 blocked;",
      "```",
      "",
      "<!-- VISUAL_END -->",
      "",
      "### 📝 Task List",
      "",
      "<!-- TASKS_START -->",
      "",
      "## 🚀 Phase 1: Infrastructure (基建)",
      "",
      "- [x] ✅ **[INF-01]** Project Scaffolding",
      "  - 🎯 Goal: 初始化 Vite + React + TypeScript 项目。",
      "  - 🔗 Dep: None",
      "  - 🏷️ Tag: Infra",
      "  - 📁 Slug: Project_Scaffolding",
      "",
      "- [x] ✅ **[INF-02]** Core Entities",
      "  - 🎯 Goal: 定义 Dexie Schema。",
      "  - 🔗 Dep: INF-01",
      "  - 🏷️ Tag: Infra",
      "  - 📁 Slug: Core_Entities",
      "",
      "## 🧩 Phase 2: Core Features (核心功能)",
      "",
      "- [ ] 🟢 **[SUB-01]** 订阅 CRUD",
      "  - 🎯 Goal: 实现订阅的增删改查。",
      "  - 🔗 Dep: INF-02",
      "  - 🏷️ Tag: Subscription",
      "  - 📁 Slug: Subscription_CRUD",
      "",
      "- [ ] ⏳ **[CAT-01]** 订阅分类/标签",
      "  - 🎯 Goal: 支持分类管理。",
      "  - 🔗 Dep: INF-02",
      "  - 🏷️ Tag: Category",
      "  - 📁 Slug: Category_Tags",
      "",
      "- [ ] 🧱 **[BUDGET-01]** 预算预警",
      "  - 🎯 Goal: 月预算与预警。",
      "  - 🔗 Dep: SUB-01",
      "  - 🏷️ Tag: Budget",
      "  - 📁 Slug: Budget_Alert",
      "  <!-- TASKS_END -->",
    ].join("\n");

    it("应正确解析含 Phase header 和加粗 ID 的任务列表", async () => {
      const data = await parseRoadmap(REAL_WORLD_ROADMAP);

      expect(data.tasks.size).toBe(5);
      expect(data.tasks.get("INF-01")?.status).toBe("done");
      expect(data.tasks.get("INF-02")?.status).toBe("done");
      expect(data.tasks.get("SUB-01")?.status).toBe("active");
      expect(data.tasks.get("CAT-01")?.status).toBe("pending");
      expect(data.tasks.get("BUDGET-01")?.status).toBe("blocked");
    });

    it("应正确解析含 emoji 前缀的元数据", async () => {
      const data = await parseRoadmap(REAL_WORLD_ROADMAP);

      // 🎯 Goal 应被正确提取
      expect(data.tasks.get("INF-01")?.goal).toContain("初始化");

      // 🔗 Dep 应被正确解析
      expect(data.tasks.get("INF-02")?.deps).toContain("INF-01");
      expect(data.tasks.get("BUDGET-01")?.deps).toContain("SUB-01");

      // 🏷️ Tag 应被正确提取
      expect(data.tasks.get("SUB-01")?.tag).toBe("Subscription");

      // 📁 Slug 应被正确提取
      expect(data.tasks.get("INF-01")?.slug).toBe("Project_Scaffolding");
      expect(data.tasks.get("SUB-01")?.slug).toBe("Subscription_CRUD");
      expect(data.tasks.get("CAT-01")?.slug).toBe("Category_Tags");
      expect(data.tasks.get("BUDGET-01")?.slug).toBe("Budget_Alert");
    });

    it("应正确解析含 classDef 声明的 Mermaid 图（不误匹配 classDef）", async () => {
      const data = await parseRoadmap(REAL_WORLD_ROADMAP);

      // 应只解析 class（5 个），不应误匹配 classDef（5 个）
      expect(data.nodes.size).toBe(5);

      expect(data.nodes.get("INF-01")?.styleClass).toBe("done");
      expect(data.nodes.get("INF-02")?.styleClass).toBe("done");
      expect(data.nodes.get("SUB-01")?.styleClass).toBe("active");
      expect(data.nodes.get("CAT-01")?.styleClass).toBe("pending");
      expect(data.nodes.get("BUDGET-01")?.styleClass).toBe("blocked");
    });

    it("应正确检测缩进的 TASKS_END 锚点", async () => {
      const data = await parseRoadmap(REAL_WORLD_ROADMAP);

      // TASKS_END 虽然缩进了，但 trim 后应仍被识别
      expect(data.listStartLine).toBeGreaterThan(-1);
      expect(data.listEndLine).toBeGreaterThan(data.listStartLine);
    });

    it("应正确识别 VISUAL 锚点范围", async () => {
      const data = await parseRoadmap(REAL_WORLD_ROADMAP);

      expect(data.visualStartLine).toBeGreaterThan(-1);
      expect(data.visualEndLine).toBeGreaterThan(data.visualStartLine);
    });

    it("应正确解析节点定义和边", async () => {
      const data = await parseRoadmap(REAL_WORLD_ROADMAP);

      // 4 个 node 有 [label] 定义 (INF-01, INF-02, SUB-01, CAT-01, BUDGET-01)
      expect(data.nodeDefinitions.has("INF-01")).toBe(true);
      expect(data.nodeDefinitions.has("INF-02")).toBe(true);
      expect(data.nodeDefinitions.has("SUB-01")).toBe(true);
      expect(data.nodeDefinitions.has("CAT-01")).toBe(true);
      expect(data.nodeDefinitions.has("BUDGET-01")).toBe(true);

      // 4 条边
      expect(data.edges).toContainEqual({ from: "INF-01", to: "INF-02" });
      expect(data.edges).toContainEqual({ from: "INF-02", to: "SUB-01" });
      expect(data.edges).toContainEqual({ from: "INF-02", to: "CAT-01" });
      expect(data.edges).toContainEqual({ from: "SUB-01", to: "BUDGET-01" });
    });

    it("应正确解析所有 classDef 声明", async () => {
      const data = await parseRoadmap(REAL_WORLD_ROADMAP);

      expect(data.classDefNames.size).toBe(4);
      expect(data.classDefNames.has("done")).toBe(true);
      expect(data.classDefNames.has("active")).toBe(true);
      expect(data.classDefNames.has("pending")).toBe(true);
      expect(data.classDefNames.has("blocked")).toBe(true);
    });
  });
});

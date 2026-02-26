/** @fileoverview renderRoadmap 单元测试，重点验证 Mermaid 依赖图的传递规约（冗余边消除）。 */
import { describe, it, expect } from "vitest";
import { renderRoadmap } from "../../commands/meta/render/roadmap-renderer.ts";
import type { RoadmapData } from "../../core/roadmap/types.ts";

/** 从渲染结果中提取 Mermaid 代码块内的所有依赖边（格式：`A --> B`） */
function extractEdges(output: string): string[] {
  const mermaidMatch = output.match(/```mermaid([\s\S]*?)```/);
  if (!mermaidMatch) return [];
  return mermaidMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes(" --> "));
}

/** 构建最小化的 RoadmapData 结构，tasks 扁平放在单个 phase 中 */
function buildRoadmap(
  tasks: Array<{ id: string; title: string; deps?: string[] }>,
): RoadmapData {
  return {
    version: 1,
    projectStatus: "active",
    lastUpdated: "2024-01-01",
    phases: [
      {
        id: "phase-1",
        name: "Test Phase",
        tasks: tasks.map((t) => ({
          ...t,
          status: "pending" as const,
        })),
      },
    ],
  };
}

describe("renderRoadmap — Mermaid 依赖图传递规约", () => {
  // ── 基础场景 ──

  describe("基础场景", () => {
    it("无依赖时不生成任何边", () => {
      const data = buildRoadmap([
        { id: "A", title: "Task A" },
        { id: "B", title: "Task B" },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toHaveLength(0);
    });

    it("单条依赖边应原样保留", () => {
      const data = buildRoadmap([
        { id: "A", title: "Task A" },
        { id: "B", title: "Task B", deps: ["A"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toEqual(["A --> B"]);
    });

    it("线性链 A→B→C 应保留两条边，不新增边", () => {
      const data = buildRoadmap([
        { id: "A", title: "Task A" },
        { id: "B", title: "Task B", deps: ["A"] },
        { id: "C", title: "Task C", deps: ["B"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toHaveLength(2);
      expect(edges).toContain("A --> B");
      expect(edges).toContain("B --> C");
    });
  });

  // ── 传递规约核心场景 ──

  describe("传递规约（冗余边消除）", () => {
    it("经典三角形：A→B、B→C、A→C（冗余）应只保留 A→B 和 B→C", () => {
      // C.deps = [A, B]，B.deps = [A]
      // A→C 是冗余边（A→B→C 已隐含），应被移除
      const data = buildRoadmap([
        { id: "A", title: "Task A" },
        { id: "B", title: "Task B", deps: ["A"] },
        { id: "C", title: "Task C", deps: ["A", "B"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).not.toContain("A --> C");
      expect(edges).toContain("A --> B");
      expect(edges).toContain("B --> C");
      expect(edges).toHaveLength(2);
    });

    it("四节点链式：A→B→C→D，中间跳跃边均为冗余", () => {
      // D.deps = [A, B, C]，C.deps = [B]，B.deps = [A]
      // A→D、B→D、A→C 均为冗余
      const data = buildRoadmap([
        { id: "A", title: "A" },
        { id: "B", title: "B", deps: ["A"] },
        { id: "C", title: "C", deps: ["A", "B"] },
        { id: "D", title: "D", deps: ["A", "B", "C"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toContain("A --> B");
      expect(edges).toContain("B --> C");
      expect(edges).toContain("C --> D");
      expect(edges).not.toContain("A --> C");
      expect(edges).not.toContain("A --> D");
      expect(edges).not.toContain("B --> D");
      expect(edges).toHaveLength(3);
    });

    it("钻石结构：A→B、A→C、B→D、C→D 四条边应全部保留（无冗余）", () => {
      // D.deps = [B, C]，B.deps = [A]，C.deps = [A]
      // A→D 不存在，B→C、C→B 不存在，无冗余边
      const data = buildRoadmap([
        { id: "A", title: "A" },
        { id: "B", title: "B", deps: ["A"] },
        { id: "C", title: "C", deps: ["A"] },
        { id: "D", title: "D", deps: ["B", "C"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toContain("A --> B");
      expect(edges).toContain("A --> C");
      expect(edges).toContain("B --> D");
      expect(edges).toContain("C --> D");
      expect(edges).toHaveLength(4);
    });

    it("两条独立链不相互影响", () => {
      // 链1：A→B，链2：C→D，两条链无交叉依赖
      const data = buildRoadmap([
        { id: "A", title: "A" },
        { id: "B", title: "B", deps: ["A"] },
        { id: "C", title: "C" },
        { id: "D", title: "D", deps: ["C"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toContain("A --> B");
      expect(edges).toContain("C --> D");
      expect(edges).toHaveLength(2);
    });

    it("扇形汇聚（多根节点汇聚到一个节点）应全部保留", () => {
      // C.deps = [A, B]，A、B 之间无依赖关系，A→C 和 B→C 均为直接依赖
      const data = buildRoadmap([
        { id: "A", title: "A" },
        { id: "B", title: "B" },
        { id: "C", title: "C", deps: ["A", "B"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toContain("A --> C");
      expect(edges).toContain("B --> C");
      expect(edges).toHaveLength(2);
    });

    it("长链加跨层跳跃：A→B→C→D，D 声明依赖 A（冗余），应被移除", () => {
      const data = buildRoadmap([
        { id: "A", title: "A" },
        { id: "B", title: "B", deps: ["A"] },
        { id: "C", title: "C", deps: ["B"] },
        { id: "D", title: "D", deps: ["A", "C"] },
      ]);
      const edges = extractEdges(renderRoadmap(data));
      expect(edges).toContain("A --> B");
      expect(edges).toContain("B --> C");
      expect(edges).toContain("C --> D");
      expect(edges).not.toContain("A --> D");
      expect(edges).toHaveLength(3);
    });
  });

  // ── 渲染完整性 ──

  describe("渲染完整性", () => {
    it("所有节点都应被渲染，标题以 <b> 加粗", () => {
      const data = buildRoadmap([
        { id: "ALONE", title: "Isolated Node" },
        { id: "FROM", title: "Source" },
        { id: "TO", title: "Target", deps: ["FROM"] },
      ]);
      const output = renderRoadmap(data);
      expect(output).toContain('ALONE["<b>[ALONE] Isolated Node</b>"]');
      expect(output).toContain('FROM["<b>[FROM] Source</b>"]');
      expect(output).toContain('TO["<b>[TO] Target</b>"]');
    });

    it("有 goal 的节点：加粗标题 + <br/> + 普通 goal", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Phase",
            tasks: [
              {
                id: "T1",
                title: "Project Scaffolding",
                status: "done",
                goal: "Setup complete",
              },
            ],
          },
        ],
      };
      const output = renderRoadmap(data);
      expect(output).toContain(
        'T1["<b>[T1] Project Scaffolding</b><br/>Setup complete"]',
      );
    });

    it("goal 中的英文分号后应插入 <br/>，符号保留", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "p1",
            name: "P",
            tasks: [
              {
                id: "T1",
                title: "Task",
                status: "pending",
                goal: "Step A; Step B; Step C",
              },
            ],
          },
        ],
      };
      expect(renderRoadmap(data)).toContain(
        'T1["<b>[T1] Task</b><br/>Step A;<br/>Step B;<br/>Step C"]',
      );
    });

    it("goal 中的中文分号后应插入 <br/>，符号保留", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "p1",
            name: "P",
            tasks: [
              {
                id: "T1",
                title: "任务",
                status: "pending",
                goal: "步骤A；步骤B；步骤C",
              },
            ],
          },
        ],
      };
      expect(renderRoadmap(data)).toContain(
        'T1["<b>[T1] 任务</b><br/>步骤A；<br/>步骤B；<br/>步骤C"]',
      );
    });

    it("goal 中的英文句号后应插入 <br/>，末尾 <br/> 去除", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "p1",
            name: "P",
            tasks: [
              {
                id: "T1",
                title: "Task",
                status: "pending",
                goal: "Do A. Do B.",
              },
            ],
          },
        ],
      };
      expect(renderRoadmap(data)).toContain(
        'T1["<b>[T1] Task</b><br/>Do A.<br/>Do B."]',
      );
    });

    it("goal 中的中文句号后应插入 <br/>，末尾 <br/> 去除", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "p1",
            name: "P",
            tasks: [
              {
                id: "T1",
                title: "任务",
                status: "pending",
                goal: "做A。做B。",
              },
            ],
          },
        ],
      };
      expect(renderRoadmap(data)).toContain(
        'T1["<b>[T1] 任务</b><br/>做A。<br/>做B。"]',
      );
    });

    it("没有 goal 的节点不含 <br/>", () => {
      const data = buildRoadmap([{ id: "T1", title: "Simple Task" }]);
      const output = renderRoadmap(data);
      expect(output).toContain('T1["<b>[T1] Simple Task</b>"]');
      expect(output).not.toContain("<br/>");
    });

    it("节点标签中的双引号应被正确转义", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "active",
        lastUpdated: "2024-01-01",
        phases: [
          {
            id: "phase-1",
            name: "Phase",
            tasks: [
              {
                id: "T1",
                title: 'Title with "quotes"',
                status: "pending",
                goal: 'Goal with "quotes"',
              },
            ],
          },
        ],
      };
      const output = renderRoadmap(data);
      expect(output).toContain("#quot;");
    });

    it("渲染输出应包含 Mermaid 代码块包裹标记", () => {
      const data = buildRoadmap([{ id: "A", title: "A" }]);
      const output = renderRoadmap(data);
      expect(output).toContain("```mermaid");
      expect(output).toContain("graph LR");
      expect(output).toContain("```");
    });

    it("渲染输出应包含任务列表区块标记", () => {
      const data = buildRoadmap([{ id: "A", title: "Alpha" }]);
      const output = renderRoadmap(data);
      expect(output).toContain("<!-- TASKS_START -->");
      expect(output).toContain("<!-- TASKS_END -->");
      expect(output).toContain("<!-- VISUAL_START -->");
      expect(output).toContain("<!-- VISUAL_END -->");
    });

    it("空 phases 时 Mermaid 图应生成但无节点和边", () => {
      const data: RoadmapData = {
        version: 1,
        projectStatus: "planning",
        lastUpdated: "2024-01-01",
        phases: [],
      };
      const output = renderRoadmap(data);
      const edges = extractEdges(output);
      expect(output).toContain("```mermaid");
      expect(edges).toHaveLength(0);
    });
  });
});

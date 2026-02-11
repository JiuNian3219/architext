import fs from "fs-extra";
import { normalizeLines } from "../../utils/normalize-text.ts";
import type { RoadmapData, Task, TaskStatus } from "./types.ts";

// Regex patterns — Task List
const TASK_REGEX =
  /^(\s*)-\s*\[([ x])\]\s*(⏳|🟢|✅|🧱)\s*(?:\*\*)?\[(.*?)\](?:\*\*)?\s*(.*)$/;
const META_REGEX = /^(\s+)-\s*(.*?):\s*(.*)$/;

// Regex patterns — Mermaid Graph
// `class ID STYLE;` or `class ID STYLE stroke...;`
const CLASS_REGEX = /^\s*class\s+([A-Za-z0-9_-]+)\s+([A-Za-z0-9_-]+)(?:;)?.*$/;
// `classDef STYLE fill:...;` — 提取样式名
const CLASSDEF_REGEX = /^\s*classDef\s+([A-Za-z0-9_-]+)/;
// 节点定义：`ID[label]` — 提取节点 ID（全局匹配，一行可能有多个）
const NODE_DEF_REGEX = /([A-Za-z0-9_-]+)\[/g;
// 依赖边：`A --> B` 或 `A[...] --> B[...]`（全局匹配）
const EDGE_REGEX = /([A-Za-z0-9_-]+)(?:\[[^\]]*\])?\s*-->\s*([A-Za-z0-9_-]+)/g;

export class RoadmapParser {
  async parse(filePath: string): Promise<RoadmapData> {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = normalizeLines(content);

    const data: RoadmapData = {
      tasks: new Map(),
      nodes: new Map(),
      nodeDefinitions: new Set(),
      edges: [],
      classDefNames: new Set(),
      mermaidLines: [],
      listStartLine: -1,
      listEndLine: -1,
      visualStartLine: -1,
      visualEndLine: -1,
    };

    let inList = false;
    let inMermaid = false;
    let currentTask: Task | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect Anchors
      if (trimmed === "<!-- TASKS_START -->") {
        data.listStartLine = i;
        inList = true;
        continue;
      }
      if (trimmed === "<!-- TASKS_END -->") {
        data.listEndLine = i;
        inList = false;
        currentTask = null;
        continue;
      }
      if (trimmed === "<!-- VISUAL_START -->") {
        data.visualStartLine = i;
        continue;
      }
      if (trimmed === "<!-- VISUAL_END -->") {
        data.visualEndLine = i;
        inMermaid = false;
        continue;
      }
      if (trimmed.startsWith("```mermaid")) {
        if (data.visualStartLine !== -1 && i > data.visualStartLine) {
          inMermaid = true;
        }
        continue;
      }
      if (trimmed.startsWith("```") && inMermaid) {
        inMermaid = false;
        continue;
      }

      // Parse Task List
      if (inList) {
        const taskMatch = line.match(TASK_REGEX);
        if (taskMatch) {
          // Adjusted group indices because we removed (.*?) from brackets for ID
          // TASK_REGEX:
          // 1: indent
          // 2: check [x] or [ ]
          // 3: icon
          // 4: id (inside [..] or **[..]**)
          // 5: title
          const [_, __, ___, icon, id, title] = taskMatch;

          let status: TaskStatus = "pending";
          if (icon === "🟢") status = "active";
          if (icon === "✅") status = "done";
          if (icon === "🧱") status = "blocked";
          if (icon === "⏳") status = "pending";

          currentTask = {
            id,
            title: title.trim(),
            status,
            lineNum: i,
            rawLine: line,
          };
          data.tasks.set(id, currentTask);
        } else if (currentTask && line.match(META_REGEX)) {
          // Parse Metadata (Goal, Dep, Tag)
          const [_, __, key, value] = line.match(META_REGEX)!;
          if (key.includes("Goal")) currentTask.goal = value;
          if (key.includes("Dep"))
            currentTask.deps = value
              .split(",")
              .map((d) => d.trim().replace(/[[\]]/g, "").trim());
          if (key.includes("Tag")) currentTask.tag = value;
          if (key.includes("Slug")) currentTask.slug = value.trim();
        }
      }

      // Parse Mermaid Graph
      if (inMermaid) {
        // 保存原始行内容（用于语法校验）
        data.mermaidLines.push({ lineNum: i, content: line });

        // 1. class ID STYLE; — 状态映射
        const classMatch = line.match(CLASS_REGEX);
        if (classMatch) {
          const [_, id, styleClass] = classMatch;
          data.nodes.set(id, {
            id,
            styleClass,
            lineNum: i,
          });
          continue; // class 行不含节点定义或边
        }

        // 2. classDef STYLE fill:...; — 样式声明
        const classDefMatch = line.match(CLASSDEF_REGEX);
        if (classDefMatch) {
          data.classDefNames.add(classDefMatch[1]);
          continue; // classDef 行不含节点定义或边
        }

        // 3. 跳过 graph 声明行 (e.g. "graph TD", "graph LR")
        if (trimmed.startsWith("graph ")) continue;

        // 4. 提取节点定义 ID[label] 和依赖边 A --> B
        //    同一行可能同时包含节点定义和边，如 A[label] --> B[label]
        let edgeMatch: RegExpExecArray | null;
        EDGE_REGEX.lastIndex = 0; // 重置全局匹配
        while ((edgeMatch = EDGE_REGEX.exec(line)) !== null) {
          data.edges.push({ from: edgeMatch[1], to: edgeMatch[2] });
        }

        let nodeMatch: RegExpExecArray | null;
        NODE_DEF_REGEX.lastIndex = 0; // 重置全局匹配
        while ((nodeMatch = NODE_DEF_REGEX.exec(line)) !== null) {
          data.nodeDefinitions.add(nodeMatch[1]);
        }
      }
    }

    return data;
  }
}

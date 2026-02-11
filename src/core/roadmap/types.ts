export type TaskStatus = "pending" | "active" | "done" | "blocked";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  lineNum: number; // 原始文件行号，用于回写
  rawLine: string; // 原始行内容

  // Metadata from indentation
  goal?: string;
  deps?: string[];
  tag?: string;
  slug?: string; // 用于 features 文件夹命名的英文短标识 (e.g. "Subscription_CRUD")
}

export interface GraphNode {
  id: string;
  styleClass?: string; // e.g., 'done', 'active'
  lineNum: number; // class 定义所在的行号
}

/** Mermaid 图中的依赖边 (A --> B) */
export interface GraphEdge {
  from: string;
  to: string;
}

/** Mermaid 代码块内的原始行（带行号，用于语法校验） */
export interface MermaidLine {
  lineNum: number; // 在原始文件中的行号
  content: string; // 行内容（未 trim）
}

export interface RoadmapData {
  tasks: Map<string, Task>;
  nodes: Map<string, GraphNode>; // class 定义（状态映射）

  // Mermaid 图结构数据
  nodeDefinitions: Set<string>; // 图中定义了"盒子"的节点 ID（ID[label]）
  edges: GraphEdge[]; // 图中的依赖边（A --> B）
  classDefNames: Set<string>; // classDef 声明的样式名集合
  mermaidLines: MermaidLine[]; // Mermaid 代码块内的原始行（用于语法校验）

  // Anchors line numbers
  listStartLine: number;
  listEndLine: number;
  visualStartLine: number;
  visualEndLine: number;
}

export interface RoadmapConfig {
  roadmapFile: string;
}

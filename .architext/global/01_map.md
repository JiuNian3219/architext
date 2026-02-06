---
description: The Master Index of Project Documentation, Directory Structure & Logical Topology.
---

# Architecture Map

> **Status:** [Active]
> **Role:** 项目的 GPS 与 索引页。不仅追踪代码，也追踪文档体系本身。

## 1. Governance & Documentation Index (文档索引)

### Core Rules (立法层 - 位于当前 IDE rules 目录)

| File                 | Role               | When to read                                   |
| :------------------- | :----------------- | :--------------------------------------------- |
| `00_system.md`       | **System Role**    | 每次对话开始时 (身份设定, 核心原则)。          |
| `01_workflow.md`     | **SOP**            | 决定当前任务流程 (Feature vs Fix) 与验收标准。 |
| `02_tech_stack.md`   | **Tech Stack**     | 技术选型、代码规范、工程治理标准。             |
| `99_context_glue.md` | **Context Bridge** | 触碰代码时，自动关联上下文文档。               |

### Global Reference (数据层 `.architext/global/`)

| File                  | Role                | Content                        |
| :-------------------- | :------------------ | :----------------------------- |
| `00_roadmap.md`       | **Roadmap**         | 进度追踪、里程碑、技术债管理。 |
| `00_vision.md`        | **Vision**          | 愿景、北极星指标、设计哲学。   |
| `01_map.md`           | **Map (This file)** | 目录结构、文件索引、逻辑拓扑。 |
| `02_dictionary.md`    | **Dictionary**      | 业务术语、公共组件注册表。     |
| `03_design_tokens.md` | **Visuals**         | 颜色、字体、间距变量。         |
| `04_data_snapshot.md` | **Data**            | 数据库 Schema 镜像。           |
| `05_error_codes.md`   | **Errors**          | 错误码与协议契约。             |
| `00_vision.md`        | **Vision**          | 愿景、北极星指标、设计哲学。   |

### Project Management (`.architext/`)

| File            | Role         | Content                        |
| :-------------- | :----------- | :----------------------------- |
| _(Empty)_       |              |                                |

---

## 2. File Extension Legend (文件后缀说明)

| Ext        | Category          | Purpose                                 |
| :--------- | :---------------- | :-------------------------------------- |
| `.spec.md` | **Specification** | 业务逻辑、算法、验收标准 (Logic)。      |
| `.ui.md`   | **UI/UX**         | 视觉结构、交互状态、样式定义 (Visual)。 |
| `.plan.md` | **Plan**          | 详细步骤拆解与测试用例 (Execution)。    |

---

## 3. Directory Mapping (物理目录映射)

| Path      | Category | Description |
| :-------- | :------- | :---------- |
| _(Empty)_ |          |             |

---

## 4. Logical Topology (逻辑拓扑)

| Module    | Location | Responsibility | Dependencies |
| :-------- | :------- | :------------- | :----------- |
| _(Empty)_ |          |                |              |

---

## 5. Critical User Journeys (CUJ)

1. _(Empty)_

---

## 🤖 AI Maintenance Guide

**Trigger**: 添加新文档、新模块或修改目录结构时。

**Action**:
1.  **Strict Sync (严丝合缝)**:
    *   `Section 3 (Directory Mapping)`: 必须反映真实的物理文件树。
    *   `Section 4 (Logical Topology)`: 必须注册每个 Feature Module 的职责。
2.  **Format**:
    *   `Location` 列必须使用相对于根目录的路径 (e.g., `src/features/auth`).
    *   `Dependencies` 列必须列出显式的 import 关系。
3.  **Self-Correction**:
    *   如果发现代码中的引用关系违反了 Section 4 定义的层级，必须报错并停止生成。

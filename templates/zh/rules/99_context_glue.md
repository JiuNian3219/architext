---
description: Context Navigation & Document Indexing. Bridges source code to documentation using the Map registry. Essential for locating specs and plans.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Context Glue Protocol (上下文桥梁)

> **Role:** 你的“上下文导航仪”。
> **Goal:** 防止 AI 失忆。不依赖硬编码路径，而是通过**查阅地图 (Map Look-up)** 来确定当前代码对应的业务文档。

## 1. Context Discovery Mechanism (上下文发现机制)

当你读取或编辑任何代码文件时，**必须**执行以下寻址步骤来加载上下文：

### Step 1: Check Global Map (查阅总图)

- **动作**: 读取 `[[__DOCS_DIR__]]/global/01_map.md`。
- **查找**: 在 `3. Directory Mapping` 或 `4. Logical Topology` 章节中，寻找当前文件路径所属的模块。
- **加载**: 读取该模块在 Map 中注册的 `Docs Link` (Spec/UI/Plan)。

### Step 2: Check Explicit Context (检查显式声明)

- **场景**: 如果是新创建的文件，或者 Map 中尚未更新。
- **动作**: 检查用户 Prompt 中是否显式指定了文档路径 (e.g. "Implementing feature based on [[__DOCS_DIR__]]/login/spec.md")。
- **响应**: 必须加载用户明确指定的文档。

### Step 3: Fallback (兜底询问)

- **场景**: 如果 Map 中没注册，且用户没指定。
- **动作**: **STOP & ASK**。
- **话术**: "⚠️ 未找到当前代码对应的 Spec 文档。请告知文档路径，或运行 `/archi.map` 更新架构地图。"

---

## 2. Mandatory Loading Rules (强制装载规则)

无论目录结构如何变化，以下类型的代码修改必须伴随相应文档的读取：

| Code Type (代码类型)                             | Required Context (必读上下文)                 | Source of Truth (真理来源)                    |
| :----------------------------------------------- | :-------------------------------------------- | :-------------------------------------------- |
| **Business Logic**<br>(Features, Entities)       | **1. Spec Document**                          | `[[__DOCS_DIR__]]/global/01_map.md` -> Module Entry                   |
| **UI Components**<br>(Pages, Widgets, Shared UI) | **2. UI Document**<br>+ `[[__DOCS_DIR__]]/global/03_design_tokens.md` | `[[__DOCS_DIR__]]/global/01_map.md` -> Module Entry<br>+ Global Rules |
| **Data Schema**<br>(Prisma, SQL, Models)         | **Data Snapshot**                             | `[[__DOCS_DIR__]]/global/04_data_snapshot.md` |
| **Config / Infra**<br>(Package.json, Vite...)    | **Tech Stack**                                | `02_tech_stack.md` (位于当前 IDE rules 目录)    |

---

## 3. Anti-Hallucination (防幻觉机制)

- **原则**: 代码是文档的下游产物。
- **禁止**: 严禁在没有读取 Spec 文档的情况下，仅凭变量名猜测业务逻辑。
- **冲突**: 如果发现代码逻辑与文档描述不符：
  1.  不要擅自“修复”文档以适配代码。
  2.  不要擅自修改代码以适配文档（除非是明确的 BugFix）。
  3.  **必须** 暂停并向用户报告不一致性。

---

## 4. Maintenance Hook (维护钩子)

- **Trigger**: 当你创建新文件或新模块时。
- **Action**: 你必须提醒用户或自动更新 `01_map.md`，将新代码路径与新文档路径建立映射关系。

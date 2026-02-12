---
description: Context Navigation & Document Indexing. Bridges source code to documentation using the Map registry. Essential for locating specs and plans.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Context Glue Protocol

> **Role**: 上下文导航仪。防止 AI 失忆，通过查阅地图 (Map Look-up) 确定代码对应的业务文档。

## 1. Context Discovery

读取或编辑代码文件时，须执行以下寻址步骤:

**Step 1: Check Global Map**
- 读取 `[[__DOCS_DIR__]]/global/01_map.md`。
- 在 Directory Mapping / Logical Topology 中查找当前文件所属模块。
- 加载该模块注册的 Docs Link (Spec/UI/Plan)。

**Step 2: Check Explicit Context**
- 场景: 新创建的文件或 Map 尚未更新。
- 检查用户 Prompt 中是否显式指定了文档路径，如有则须加载。

**Step 3: Fallback**
- Map 中未注册且用户未指定 → **STOP & ASK**。
- 提示: "未找到当前代码对应的 Spec 文档。请告知路径，或运行 `/archi.map` 更新架构地图。"

---

## 2. Mandatory Loading Rules

| 代码类型 | 必读上下文 | 真理来源 |
|:---|:---|:---|
| **Business Logic** (Features/Entities) | Spec Document | `[[__DOCS_DIR__]]/global/01_map.md` → Module Entry |
| **UI Components** (Pages/Widgets) | UI Document + `[[__DOCS_DIR__]]/global/03_design_tokens.md` | `[[__DOCS_DIR__]]/global/01_map.md` + Global Rules |
| **Data Schema** (Prisma/SQL/Models) | Data Snapshot | `[[__DOCS_DIR__]]/global/04_data_snapshot.md` |
| **Config / Infra** (Package.json...) | Tech Stack | `02_tech_stack.md` |

---

## 3. Anti-Hallucination

- 代码是文档的下游产物。
- 禁在未读取 Spec 的情况下凭变量名猜测业务逻辑。
- 发现代码与文档不符时: 不擅自修复文档或代码，须暂停并报告不一致性。

---

## 4. Maintenance Hook

- **Trigger**: 创建新文件或新模块时。
- **Action**: 须提醒用户或自动更新 `01_map.md`，建立代码路径与文档路径的映射。

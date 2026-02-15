---
description: Context Navigation & Document Indexing. Bridges source code to documentation using the Map registry. Essential for locating specs and plans.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Context Glue Protocol

> **Role**: 上下文導航儀。防止 AI 失憶，透過查閱地圖 (Map Look-up) 確定程式碼對應的業務文件。

## 1. Context Discovery

讀取或編輯程式碼檔案時，須執行以下尋址步驟:

**Step 1: Check Global Map**
- 讀取 `[[__DOCS_DIR__]]/global/01_map.md`。
- 在 Directory Mapping / Logical Topology 中查找當前檔案所屬模組。
- 載入該模組註冊的 Docs Link (Spec/UI/Plan)。

**Step 2: Check Explicit Context**
- 場景: 新建立的檔案或 Map 尚未更新。
- 檢查使用者 Prompt 中是否顯式指定了文件路徑，如有則須載入。

**Step 3: Fallback**
- Map 中未註冊且使用者未指定 → **STOP & ASK**。
- 提示: 「未找到當前程式碼對應的 Spec 文件。請告知路徑，或運行 `/archi.map` 更新架構地圖。」

---

## 2. Mandatory Loading Rules

| 程式碼型別 | 必讀上下文 | 真理來源 |
|:---|:---|:---|
| **Business Logic** (Features/Entities) | Spec Document | `[[__DOCS_DIR__]]/global/01_map.md` → Module Entry |
| **UI Components** (Pages/Widgets) [?UI] | UI Document + `[[__DOCS_DIR__]]/global/03_design_tokens.md` | `[[__DOCS_DIR__]]/global/01_map.md` + Global Rules |
| **Data Schema** (ORM/SQL/Models) [?Data] | Data Snapshot | `[[__DOCS_DIR__]]/global/04_data_snapshot.md` |
| **Config / Infra** (Package.json...) | Tech Stack | `02_tech_stack.md` |

---

## 3. Anti-Hallucination

- 程式碼是文件的下游產物。
- 禁在未讀取 Spec 的情況下憑變數名猜測業務邏輯。
- 發現程式碼與文件不符時: 不擅自修復文件或程式碼，須暫停並報告不一致性。

---

## 4. Maintenance Hook

- **Trigger**: 建立新檔案或新模組時。
- **Action**: 須提醒使用者或自動更新 `01_map.md`，建立程式碼路徑與文件路徑的映射。

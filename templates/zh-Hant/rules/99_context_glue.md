---
description: Context Navigation & Document Indexing. Bridges source code to documentation using the Map registry. Essential for locating specs and plans.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Context Glue Protocol (上下文膠水協議)

> **Role:** 你的「上下文導航儀」。
> **Goal:** 防止 AI 失憶。不依賴硬編碼路徑，而是通過**查閱地圖 (Map Look-up)** 來確定當前程式碼對應的業務文件。

## 1. Context Discovery Mechanism (上下文發現機制)

當你讀取或編輯任何程式碼檔案時，**必須**執行以下定址步驟來加載上下文：

### Step 1: Check Global Map (查閱總圖)

- **動作**: 讀取 `[[__DOCS_DIR__]]/global/01_map.md`。
- **查找**: 在 `3. Directory Mapping` 或 `4. Logical Topology` 章節中，尋找當前檔案路徑所屬的模組。
- **加載**: 讀取該模組在 Map 中註冊的 `Docs Link` (Spec/UI/Plan)。

### Step 2: Check Explicit Context (檢查顯式聲明)

- **場景**: 如果是新創建的檔案，或者 Map 中尚未更新。
- **動作**: 檢查用戶 Prompt 中是否顯式指定了文件路徑 (e.g. "Implementing feature based on [[__DOCS_DIR__]]/login/spec.md")。
- **響應**: 必須加載用戶明確指定的文件。

### Step 3: Fallback (兜底詢問)

- **場景**: 如果 Map 中沒註冊，且用戶沒指定。
- **動作**: **STOP & ASK**。
- **話術**: "⚠️ 未找到當前程式碼對應的 Spec 文件。請告知文件路徑，或運行 `/archi.map` 更新架構地圖。"

---

## 2. Mandatory Loading Rules (強制裝載規則)

無論目錄結構如何變化，以下類型的程式碼修改必須伴隨相應文件的讀取：

| Code Type (程式碼類型)                             | Required Context (必讀上下文)                 | Source of Truth (真理來源)                    |
| :----------------------------------------------- | :-------------------------------------------- | :-------------------------------------------- |
| **Business Logic**<br>(Features, Entities)       | **1. Spec Document**                          | `[[__DOCS_DIR__]]/global/01_map.md` -> Module Entry                   |
| **UI Components**<br>(Pages, Widgets, Shared UI) | **2. UI Document**<br>+ `[[__DOCS_DIR__]]/global/03_design_tokens.md` | `[[__DOCS_DIR__]]/global/01_map.md` -> Module Entry<br>+ Global Rules |
| **Data Schema**<br>(Prisma, SQL, Models)         | **Data Snapshot**                             | `[[__DOCS_DIR__]]/global/04_data_snapshot.md` |
| **Config / Infra**<br>(Package.json, Vite...)    | **Tech Stack**                                | `02_tech_stack.md` (位於當前 IDE rules 目錄)    |

---

## 3. Anti-Hallucination (防幻覺機制)

- **原則**: 程式碼是文件的下游產物。
- **禁止**: 嚴禁在沒有讀取 Spec 文件的情況下，僅憑變數名猜測業務邏輯。
- **衝突**: 如果發現程式碼邏輯與文件描述不符：
  1.  不要擅自「修復」文件以適配程式碼。
  2.  不要擅自修改程式碼以適配文件（除非是明確的 BugFix）。
  3.  **必須** 暫停並向用戶報告不一致性。

---

## 4. Maintenance Hook (維護鉤子)

- **Trigger**: 當你創建新檔案或新模組時。
- **Action**: 你必須提醒用戶或自動更新 `01_map.md`，將新程式碼路徑與新文件路徑建立映射關係。

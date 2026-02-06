---
description: The Master Index of Project Documentation, Directory Structure & Logical Topology.
---

# Architecture Map

> **Status:** [Active]
> **Role:** 項目的 GPS 與 索引頁。不僅追蹤代碼，也追蹤文檔體系本身。

## 1. Governance & Documentation Index (文檔索引)

### Core Rules (立法層 - 位於當前 IDE rules 目錄)

| File                 | Role               | When to read                                   |
| :------------------- | :----------------- | :--------------------------------------------- |
| `00_system.md`       | **System Role**    | 每次對話開始時 (身份設定, 核心原則)。          |
| `01_workflow.md`     | **SOP**            | 決定當前任務流程 (Feature vs Fix) 與驗收標準。 |
| `02_tech_stack.md`   | **Tech Stack**     | 技術選型、代碼規範、工程治理標準。             |
| `99_context_glue.md` | **Context Bridge** | 觸碰代碼時，自動關聯上下文文檔。               |

### Global Reference (數據層 `[[__DOCS_DIR__]]/global/`)

| File                  | Role                | Content                        |
| :-------------------- | :------------------ | :----------------------------- |
| `00_roadmap.md`       | **Roadmap**         | 進度追蹤、里程碑、技術債管理。 |
| `00_vision.md`        | **Vision**          | 願景、北極星指標、設計哲學。   |
| `01_map.md`           | **Map (This file)** | 目錄結構、文件索引、邏輯拓撲。 |
| `02_dictionary.md`    | **Dictionary**      | 業務術語、公共組件註冊表。     |
| `03_design_tokens.md` | **Visuals**         | 顏色、字體、間距變量。         |
| `04_data_snapshot.md` | **Data**            | 資料庫 Schema 鏡像。           |
| `05_error_codes.md`   | **Errors**          | 錯誤碼與協議契約。             |

### Project Management (`[[__DOCS_DIR__]]/`)

| File            | Role         | Content                        |
| :-------------- | :----------- | :----------------------------- |
| _(Empty)_       |              |                                |

---

## 2. File Extension Legend (文件後綴說明)

| Ext        | Category          | Purpose                                 |
| :--------- | :---------------- | :-------------------------------------- |
| `.spec.md` | **Specification** | 業務邏輯、演算法、驗收標準 (Logic)。      |
| `.ui.md`   | **UI/UX**         | 視覺結構、交互狀態、樣式定義 (Visual)。 |
| `.plan.md` | **Plan**          | 詳細步驟拆解與測試用例 (Execution)。    |

---

## 3. Directory Mapping (物理目錄映射)

| Path      | Category | Description |
| :-------- | :------- | :---------- |
| _(Empty)_ |          |             |

---

## 4. Logical Topology (邏輯拓撲)

| Module    | Location | Responsibility | Dependencies |
| :-------- | :------- | :------------- | :----------- |
| _(Empty)_ |          |                |              |

---

## 5. Critical User Journeys (CUJ)

1. _(Empty)_

---

## 🤖 AI Maintenance Guide

**Trigger**: 添加新文檔、新模塊或修改目錄結構時。

**Action**:
1.  **Strict Sync (嚴絲合縫)**:
    *   `Section 3 (Directory Mapping)`: 必須反映真實的物理文件樹。
    *   `Section 4 (Logical Topology)`: 必須註冊每個 Feature Module 的職責。
2.  **Format**:
    *   `Location` 列必須使用相對於根目錄的路徑 (e.g., `src/features/auth`).
    *   `Dependencies` 列必須列出顯式的 import 關係。
3.  **Self-Correction**:
    *   如果發現代碼中的引用關係違反了 Section 4 定義的層級，必須報錯並停止生成。

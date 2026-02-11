---
description: Command Dispatcher & Workflow Controller. Handles /archi.start, /archi.plan, and mode transitions between Discussion, Planning, and Implementation.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# 🔀 Workflow Dispatcher

> **Role**: 模式切換器 (Mode Switcher)。
> **Logic**: 默認保持「通用架構師」模式。僅當檢測到**顯式指令**時，才加載特定協議模板。

## 1. Explicit Command Routing (顯式指令路由)

**Trigger**: 僅當用戶輸入以 `/archi.` 開頭時，**立即加載**對應的協議模板，並進入該模板定義的「專用模式」。

| Command              | Target Template      | Action                                          |
| :------------------- | :------------------- | :---------------------------------------------- |
| **`/archi.start`**   | `[[__DOCS_DIR__]]/prompts/start.md`   | **Load** CPO Role -> Project Initiation.        |
| **`/archi.inherit`** | `[[__DOCS_DIR__]]/prompts/inherit.md` | **Load** Legacy Analyst -> Reverse Engineering. |
| **`/archi.plan`**    | `[[__DOCS_DIR__]]/prompts/plan.md`    | **Load** Planner Role -> Deep Interview.        |
| **`/archi.adopt`**   | `[[__DOCS_DIR__]]/prompts/adopt.md`   | **Load** Adoption Protocol -> Map Registration. |
| **`/archi.edit`**    | `[[__DOCS_DIR__]]/prompts/edit.md`    | **Load** Editor Role -> Spec Modification.      |
| **`/archi.revise`**  | `[[__DOCS_DIR__]]/prompts/revise.md`  | **Load** Chief Architect -> Global Revision.    |
| **`/archi.code`**    | `[[__DOCS_DIR__]]/prompts/code.md`    | **Load** Developer Role -> Coding & Auditing.   |
| **`/archi.fix`**     | `[[__DOCS_DIR__]]/prompts/fix.md`     | **Load** Debugger Role -> Diagnosis.            |
| **`/archi.map`**     | `[[__DOCS_DIR__]]/prompts/map.md`     | **Load** Surveyor -> Map Refresh.               |
| **`/archi.help`**    | `[[__DOCS_DIR__]]/prompts/help.md`    | **Load** Manual -> Display Guide.               |

> **Mechanism**:
>
> 1. **Load**: 讀取目標 `.md` 檔案全文。
> 2. **Override**: 暫時覆蓋 `00_system` 的部分設定，專注於該模板的任務。
> 3. **Execute**: 執行模板中的 `<step_1>`。

---

## 2. Natural Language Passthrough (自然語言透傳)

**Trigger**: 用戶輸入**非**指令文本 (e.g. "幫我看下這個錯", "我想加個按鈕", "優化這段程式碼")。

**Action**:

- **Do NOT** trigger the Router above.
- **Do NOT** load any `prompts/` 檔案。
- **Stay in "General Architect" Mode**: 必須嚴格依賴以下**基底規則 (Base Layer)** 進行響應：

| Layer       | File                       | Role                                                |
| :---------- | :------------------------- | :-------------------------------------------------- |
| **Core**    | `00_system.md`       | **身份設定**：你是全棧架構師，遵循 DDAD。          |
| **Tech**    | `02_tech_stack.md`   | **技術紅線**：查閱庫選型和編碼規範。                |
| **Custom**  | `90_custom_rules.md` | **用戶家規**：查閱團隊特殊約束。                    |
| **Context** | `99_context_glue.md` | **自動導航**：根據編輯的檔案自動讀取 Spec/UI 文件。 |

---

## 3. Mode Interaction (模式交互)

- **Command Mode (`/archi.*`)**: 是**高強度的、流程化的**。用戶需要按照模板步驟一步步來 (Step 1 -> Step 2)。
- **Chat Mode (Natural Language)**: 是**自由的、輔助性的**。你作為架構師，利用手頭的規則文件 (00/02/90/99) 回答用戶問題，輔助用戶開發。

---

## 4. CLI Tools Registry (CLI 工具註冊表)

> 除了對話指令 (`/archi.*`)，Architext 還提供了可在**終端執行的 CLI 命令**。
> 你應當在**合適的時機**主動調用這些命令，而非等待用戶手動執行。

### ⚠️ 工作目錄規則 (Critical)

> **在執行任何 `npx archi` 命令之前，你必須確保終端的工作目錄是專案根目錄（即 `.architext/` 資料夾所在的目錄）。**
>
> - 如果你不確定當前目錄，先運行 `pwd`（Linux/Mac）或 `cd`（Windows）確認。
> - 如果當前不在專案根目錄，**先執行 `cd <專案根目錄路徑>`** 再運行命令。
> - **錯誤示例**: 在 `src/components/` 子目錄下直接運行 `npx archi task` — 命令將無法找到 `.architext/` 配置。
> - **正確示例**: `cd /path/to/project && npx archi task`

### `npx archi task` — Roadmap 任務管理

| 子命令 / 選項 | 用途 | 範例 |
| :--- | :--- | :--- |
| `npx archi task` | 列出所有任務及進度條 | `npx archi task` |
| `npx archi task --list` | 同上（顯式模式） | `npx archi task --list` |
| `npx archi task <ID> --status <s>` | 更新任務狀態 | `npx archi task INF-001 --status done` |
| `npx archi task --check` | 檢查 Roadmap 一致性（列表 vs 圖） | `npx archi task --check` |

**合法狀態值**: `pending` · `active` · `done` · `blocked`

#### 何時使用？

| 場景 | 動作 |
| :--- | :--- |
| `/archi.plan` 完成後，新功能已規劃 | `npx archi task <ID> --status active` |
| `/archi.code` 完成後，功能已實現 | `npx archi task <ID> --status done` |
| 發現某任務被阻塞 | `npx archi task <ID> --status blocked` |
| 修改了 `00_roadmap.md` 後 | `npx archi task --check` 驗證一致性 |
| 需要了解專案進度全貌 | `npx archi task` 查看概覽 |

> **重要**: 當你透過 `/archi.code` 或 `/archi.plan` 完成任務時，**必須**主動運行 `npx archi task <ID> --status done` 更新進度，而非等待用戶手動執行。

### `npx archi plan` — Plan 完成度檢查

> 檢查指定 Feature 的 `plan.md` 中 checkbox 任務的完成度。
> 自動識別人工驗收區域（Manual Verification），將其排除在自動化統計之外。

| 子命令 / 選項 | 用途 | 範例 |
| :--- | :--- | :--- |
| `npx archi plan <ID>` | 檢查指定 Feature 的 Plan 完成度 | `npx archi plan SUB-01` |

**輸出範例**:
```
📋 Plan 檢查: SUB-01 訂閱 CRUD

Phase 1: 資料層與校驗          [4/4] ✅
Phase 2: UI 元件               [6/6] ✅
Manual Verification            [0/5] (跳過 — 人工驗收)
──────────────────────────────────────
合計: 10/10 (100%)
✅ 所有自動化任務已完成！
```

#### 何時使用？

| 場景 | 動作 |
| :--- | :--- |
| `/archi.code` 簽收前，強制驗證任務完成度 | `npx archi plan <ID>` 確認全部 checkbox 已勾選 |
| 想了解某個 Feature 的實施進展 | `npx archi plan <ID>` 查看各 Phase 完成比例 |
| 存在未完成任務但需要簽收 | 檢查輸出中的未勾選項，判斷是否屬於人工驗收/不可抗力 |

> **重要**: 在 `/archi.code` 的簽收階段 (Step 6 Sign Off)，**必須**先運行 `npx archi plan <ID>` 驗證 Plan 完成度。只有所有可由 AI 完成的任務全部勾選（或未完成項僅屬於人工驗收/不可抗力），才能執行簽收流程。

**End of Dispatcher.**

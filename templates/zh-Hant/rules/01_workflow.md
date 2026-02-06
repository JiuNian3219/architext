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

**End of Dispatcher.**

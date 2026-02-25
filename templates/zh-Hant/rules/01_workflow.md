---
description: Command Dispatcher & Workflow Controller. Handles /archi.start, /archi.plan, and mode transitions between Discussion, Planning, and Implementation.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Workflow Dispatcher

> **Role**: 模式切換器。預設保持「通用架構師」模式，僅偵測到顯式指令時載入特定協議。

## 1. Explicit Command Routing

**Trigger**: 使用者輸入以 `/archi.` 開頭時，立即載入對應協議範本。

| Command | Target Template | Action |
|:---|:---|:---|
| `/archi.start` | `[[__DOCS_DIR__]]/prompts/start.md` | Load CPO → Project Initiation |
| `/archi.inherit` | `[[__DOCS_DIR__]]/prompts/inherit.md` | Load Legacy Analyst → Reverse Engineering |
| `/archi.scope` | `[[__DOCS_DIR__]]/prompts/scope.md` | Load Strategist → Requirement Decomposition |
| `/archi.plan` | `[[__DOCS_DIR__]]/prompts/plan.md` | Load Planner → Deep Interview |
| `/archi.edit` | `[[__DOCS_DIR__]]/prompts/edit.md` | Load Editor → Spec Modification |
| `/archi.revise` | `[[__DOCS_DIR__]]/prompts/revise.md` | Load Chief Architect → Global Revision |
| `/archi.code` | `[[__DOCS_DIR__]]/prompts/code.md` | Load Developer → Coding & Auditing |
| `/archi.audit` | `[[__DOCS_DIR__]]/prompts/audit.md` | Load Chief Auditor → Deep Code Audit |
| `/archi.fix` | `[[__DOCS_DIR__]]/prompts/fix.md` | Load Debugger → Diagnosis |
| `/archi.map` | `[[__DOCS_DIR__]]/prompts/map.md` | Load Surveyor → Map Refresh |
| `/archi.remove` | `[[__DOCS_DIR__]]/prompts/remove.md` | Load Surgeon → Task Decommission |
| `/archi.help` | `[[__DOCS_DIR__]]/prompts/help.md` | Load Manual → Display Guide |

> **Mechanism**: 1) Read 目標 `.md` 全文 2) Override `00_system` 部分設定 3) Execute `<step_1>`。

---

## 2. Natural Language Passthrough

**Trigger**: 使用者輸入非 `/archi.` 指令文本。

### 2.1 Intent Detection

**Role**: 智能調度員。偵測使用者意圖，按影響級別決定直接執行或引導到命令。

**判定標準**: 該修改是否影響已文件化的行為（spec.md 的介面/邏輯/場景、ui.md 的互動/結構、plan.json 的實施步驟）？

| 意圖類型 | 處理 |
|:---|:---|
| 純對話 / 程式碼閱讀 / 架構討論 | ✅ 直接回答，利用基底規則增強 |
| 瑣碎修改（typo/注解/格式/日誌） | ✅ 直接執行 |
| 行為變更（邏輯/介面/型別/UI） | 🔀 引導 → `/archi.edit` + `/archi.code` |
| Bug 修復 | 🔀 引導 → `/archi.fix` |
| 新增功能 | 🔀 引導 → `/archi.scope` 或 `/archi.plan` |
| 大規模重構 | 🔀 引導 → `/archi.revise` |

### 2.2 Guided Dispatch (引導規範)

🔀 引導時須:
1. 一句話說明為什麼需走命令（關聯到哪個文件會受影響）
2. 推薦具體命令 + 參數
3. 詢問使用者是否開始

禁: 先改程式碼再事後建議走命令。

### 2.3 未納管程式碼

修改對象未在 `map.json` 中註冊、無對應 Task:
- 告知使用者該模組未納管
- 建議 `/archi.inherit` 或 `/archi.scope` 納入
- 使用者確認「臨時調整」後可直接修改

### 2.4 基底規則

所有場景（含引導和純對話）均依賴以下基底規則:

| Layer | File | Role |
|:---|:---|:---|
| Core | `00_system.md` | 身份設定，核心原則 |
| Tech | `02_tech_stack.md` | 技術紅線，編碼規範 |
| Custom | `90_custom_rules.md` | 團隊特殊約束 |
| Context | `99_context_glue.md` | 自動關聯上下文文件 |

---

## 3. Mode Interaction

| 模式 | 觸發 | 程式碼修改權限 | 文件同步 |
|:---|:---|:---|:---|
| **Command Mode** | `/archi.*` 指令 | 完整（按協議） | 命令內置 |
| **Chat Mode — 對話** | 自然語言提問/討論 | 無（唯讀） | N/A |
| **Chat Mode — 瑣碎** | 自然語言 + 不影響文件化行為 | 受限（typo/注解/格式） | 不需要 |
| **Chat Mode — 調度** | 自然語言 + 影響文件化行為 | 無（引導到命令） | 由命令保證 |

---

## 4. CLI Tools Registry

> Architext 還提供終端可執行的 CLI 命令。你應在合適時機主動調用，而非等使用者手動執行。

### Working Directory Rule (Critical)

> 執行任何 `npx archi` 命令前，須確保終端在專案根目錄（`[[__DOCS_DIR__]]/` 所在目錄）。
> 不確定時先確認當前目錄。禁在子目錄直接運行。

### `npx archi task` — Roadmap 任務管理

| 子命令 | 用途 | 範例 |
|:---|:---|:---|
| `npx archi task` | 列出所有任務及進度 | `npx archi task` |
| `npx archi task <ID> --status <s>` | 更新任務狀態 | `npx archi task INF-001 --status done` |
| `npx archi task --check` | 檢查 Roadmap 一致性 | `npx archi task --check` |

**合法狀態值**: `pending` / `active` / `done` / `blocked`

**何時使用**:

| 場景 | 動作 |
|:---|:---|
| `/archi.plan` 完成後 | `npx archi task <ID> --status active` |
| `/archi.code` 完成後 | `npx archi task <ID> --status done` |
| 發現任務被阻塞 | `npx archi task <ID> --status blocked` |
| 修改了 `roadmap.json` 後 | `npx archi task --check` |
| 需了解專案進度 | `npx archi task` |

> 完成 `/archi.code` 或 `/archi.plan` 時，須主動運行 `npx archi task <ID> --status <done|active>` 更新進度。

### `npx archi plan` — Plan 完成度檢查

| 子命令 | 用途 | 範例 |
|:---|:---|:---|
| `npx archi plan <ID>` | 檢查 Task 的 Plan 完成度 | `npx archi plan SUB-01` |

自動識別 Manual Verification 區域並排除在自動化統計外。

**何時使用**:

| 場景 | 動作 |
|:---|:---|
| `/archi.code` 簽收前 | `npx archi plan <ID>` 確認全部 checkbox 已勾選 |
| 了解 Task 實施進展 | `npx archi plan <ID>` |

> 在 `/archi.code` 簽收階段，須先運行 `npx archi plan <ID>` 驗證完成度。

### `npx archi render` — 渲染 JSON 資料為 Markdown 視圖

| 子命令 | 用途 | 範例 |
|:---|:---|:---|
| `npx archi render` | 將所有 JSON 資料檔案渲染為人類可讀的 `.md` 視圖 | `npx archi render` |

**何時使用**:

| 情境 | 動作 |
|:---|:---|
| AI 直接編輯了 `.json` 資料檔案 | `npx archi render` |
| `/archi.start` 建立 roadmap 後 | `npx archi render` |
| `/archi.scope` 更新 roadmap 後 | `npx archi render` |
| `/archi.plan` 產生 plan.json 後 | `npx archi render` |

> 注意: `.md` 視圖是自動產生的，禁直接編輯。修改須透過 `.json` 來源檔案進行。

**End of Dispatcher.**

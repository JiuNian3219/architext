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
| `/archi.plan` | `[[__DOCS_DIR__]]/prompts/plan.md` | Load Planner → Deep Interview |
| `/archi.adopt` | `[[__DOCS_DIR__]]/prompts/adopt.md` | Load Adoption Protocol → Map Registration |
| `/archi.edit` | `[[__DOCS_DIR__]]/prompts/edit.md` | Load Editor → Spec Modification |
| `/archi.revise` | `[[__DOCS_DIR__]]/prompts/revise.md` | Load Chief Architect → Global Revision |
| `/archi.code` | `[[__DOCS_DIR__]]/prompts/code.md` | Load Developer → Coding & Auditing |
| `/archi.fix` | `[[__DOCS_DIR__]]/prompts/fix.md` | Load Debugger → Diagnosis |
| `/archi.map` | `[[__DOCS_DIR__]]/prompts/map.md` | Load Surveyor → Map Refresh |
| `/archi.help` | `[[__DOCS_DIR__]]/prompts/help.md` | Load Manual → Display Guide |

> **Mechanism**: 1) Read 目標 `.md` 全文 2) Override `00_system` 部分設定 3) Execute `<step_1>`。

---

## 2. Natural Language Passthrough

**Trigger**: 使用者輸入非 `/archi.` 指令文本。

**Action**: 不觸發 Router，不載入 prompts/。保持 "General Architect" 模式，依賴以下基底規則回應:

| Layer | File | Role |
|:---|:---|:---|
| Core | `00_system.md` | 身份設定，核心原則 |
| Tech | `02_tech_stack.md` | 技術紅線，編碼規範 |
| Custom | `90_custom_rules.md` | 團隊特殊約束 |
| Context | `99_context_glue.md` | 自動關聯上下文文件 |

---

## 3. Mode Interaction

- **Command Mode** (`/archi.*`): 高強度流程化，按範本步驟執行。
- **Chat Mode** (自然語言): 自由輔助，利用規則檔案回答問題、輔助開發。

---

## 4. CLI Tools Registry

> Architext 還提供終端可執行的 CLI 命令。你應在合適時機主動調用，而非等使用者手動執行。

### Working Directory Rule (Critical)

> 執行任何 `npx archi` 命令前，須確保終端在專案根目錄（`.architext/` 所在目錄）。
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
| 修改了 `00_roadmap.md` 後 | `npx archi task --check` |
| 需了解專案進度 | `npx archi task` |

> 完成 `/archi.code` 或 `/archi.plan` 時，須主動運行 `npx archi task <ID> --status <done|active>` 更新進度。

### `npx archi plan` — Plan 完成度檢查

| 子命令 | 用途 | 範例 |
|:---|:---|:---|
| `npx archi plan <ID>` | 檢查 Feature 的 Plan 完成度 | `npx archi plan SUB-01` |

自動識別 Manual Verification 區域並排除在自動化統計外。

**何時使用**:

| 場景 | 動作 |
|:---|:---|
| `/archi.code` 簽收前 | `npx archi plan <ID>` 確認全部 checkbox 已勾選 |
| 了解 Feature 實施進展 | `npx archi plan <ID>` |

> 在 `/archi.code` 簽收階段，須先運行 `npx archi plan <ID>` 驗證完成度。

**End of Dispatcher.**

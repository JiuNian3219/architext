---
description: CLI Reference Manual. Working directory rule and command syntax for npx archi task/plan/render.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# CLI Reference

> **Role**: 命令速查手冊。提供 `npx archi` 系列命令的語法與參數，供 Terminal Gate 執行時查閱。

## ⛔ Working Directory Gate

**執行任何 `npx archi` 命令前須通過此檢查，否則停止**:

| 檢查項 | 通過條件 |
|:---|:---|
| 當前目錄 | 須為專案根目錄（`[[__DOCS_DIR__]]/` 所在目錄） |
| 不確定時 | 先確認當前目錄，禁猜測 |
| 子目錄中 | 須 `cd` 到根目錄後再執行 |

---

## 命令語法

### `npx archi task`

| 子命令 | 用途 | 範例 |
|:---|:---|:---|
| `npx archi task` | 列出所有任務及進度 | `npx archi task` |
| `npx archi task <ID> --status <s>` | 更新任務狀態 | `npx archi task INF-001 --status done` |
| `npx archi task --check` | 檢查 Roadmap 一致性 | `npx archi task --check` |

**合法狀態值**: `pending` / `active` / `done` / `blocked`

### `npx archi plan`

| 子命令 | 用途 | 範例 |
|:---|:---|:---|
| `npx archi plan <ID>` | 檢查 Task 的 Plan 完成度 | `npx archi plan SUB-01` |

自動識別 Manual Verification 區域並排除在自動化統計外。

### `npx archi render`

| 子命令 | 用途 | 範例 |
|:---|:---|:---|
| `npx archi render` | 將所有 JSON 資料檔案渲染為人類可讀的 `.md` 視圖 | `npx archi render` |

> `.md` 視圖是自動產生的，禁直接編輯。修改須透過 `.json` 來源檔案進行。

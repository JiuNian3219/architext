---
description: CLI Reference Manual. Working directory rule and command syntax for npx archi task/plan/render.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# CLI Reference

> **Role**: 命令速查手册。提供 `npx archi` 系列命令的语法与参数，供 Terminal Gate 执行时查阅。

## ⛔ Working Directory Gate

**执行任何 `npx archi` 命令前须通过此检查，否则停止**:

| 检查项 | 通过条件 |
|:---|:---|
| 当前目录 | 须为项目根目录（`[[__DOCS_DIR__]]/` 所在目录） |
| 不确定时 | 先确认当前目录，禁猜测 |
| 子目录中 | 须 `cd` 到根目录后再执行 |

---

## 命令语法

### `npx archi task`

| 子命令 | 用途 | 示例 |
|:---|:---|:---|
| `npx archi task` | 列出所有任务及进度 | `npx archi task` |
| `npx archi task <ID> --status <s>` | 更新任务状态 | `npx archi task INF-001 --status done` |
| `npx archi task --check` | 检查 Roadmap 一致性 | `npx archi task --check` |

**合法状态值**: `pending` / `active` / `done` / `blocked`

### `npx archi plan`

| 子命令 | 用途 | 示例 |
|:---|:---|:---|
| `npx archi plan <ID>` | 检查 Task 的 Plan 完成度 | `npx archi plan SUB-01` |

自动识别 Manual Verification 区域并排除在自动化统计外。

### `npx archi render`

| 子命令 | 用途 | 示例 |
|:---|:---|:---|
| `npx archi render` | 将所有 JSON 数据文件渲染为人类可读的 `.md` 视图 | `npx archi render` |

> `.md` 视图是自动生成的，禁直接编辑。修改须通过 `.json` 源文件进行。

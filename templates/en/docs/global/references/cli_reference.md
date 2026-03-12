# CLI Reference

> **Role**: Command reference manual. Provides syntax and parameters for `npx archi` commands, for use during Terminal Gate execution.

## ⛔ Working Directory Gate

**Must pass this check before executing any `npx archi` command, otherwise stop**:

| Check | Pass Condition |
|:---|:---|
| Current directory | Must be project root (directory containing `[[__DOCS_DIR__]]/`) |
| When uncertain | Confirm current directory first; do not guess |
| In subdirectory | Must `cd` to root before executing |

---

## Command Syntax

### `npx archi task`

| Subcommand | Purpose | Example |
|:---|:---|:---|
| `npx archi task` | List all tasks and progress | `npx archi task` |
| `npx archi task <ID> --status <s>` | Update task status | `npx archi task INF-001 --status done` |
| `npx archi task --check` | Check Roadmap consistency | `npx archi task --check` |

**Valid status values**: `pending` / `active` / `done` / `blocked`

### `npx archi plan`

| Subcommand | Purpose | Example |
|:---|:---|:---|
| `npx archi plan <ID>` | Check Task Plan completion | `npx archi plan SUB-01` |

Automatically identifies Manual Verification sections and excludes them from automated statistics.

### `npx archi render`

| Subcommand | Purpose | Example |
|:---|:---|:---|
| `npx archi render` | Render all JSON data files as human-readable `.md` views | `npx archi render` |

> `.md` views are auto-generated; do not edit directly. Modifications must go through the `.json` source files.

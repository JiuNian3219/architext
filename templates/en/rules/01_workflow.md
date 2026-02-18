---
description: Command Dispatcher & Workflow Controller. Handles /archi.start, /archi.plan, and mode transitions between Discussion, Planning, and Implementation.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Workflow Dispatcher

> **Role**: Mode Switcher. Default to "General Architect" mode, only load specific protocol when explicit command is detected.

## 1. Explicit Command Routing

**Trigger**: When user input starts with `/archi.`, immediately load the corresponding protocol template.

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

> **Mechanism**: 1) Read target `.md` full text 2) Override `00_system` partial settings 3) Execute `<step_1>`.

---

## 2. Natural Language Passthrough

**Trigger**: User input is not `/archi.` command text.

**Action**: Do not trigger Router, do not load prompts/. Stay in "General Architect" mode, rely on the following base rules to respond:

| Layer | File | Role |
|:---|:---|:---|
| Core | `00_system.md` | Identity, core principles |
| Tech | `02_tech_stack.md` | Tech red lines, coding standards |
| Custom | `90_custom_rules.md` | Team-specific constraints |
| Context | `99_context_glue.md` | Auto-associate context documents |

---

## 3. Mode Interaction

- **Command Mode** (`/archi.*`): High-intensity process-driven, execute by template steps.
- **Chat Mode** (Natural Language): Free-form assistance, use rule files to answer questions and assist development.

---

## 4. CLI Tools Registry

> Architext also provides terminal-executable CLI commands. You should proactively invoke them at the right time, rather than waiting for the user to run them manually.

### Working Directory Rule (Critical)

> Before executing any `npx archi` command, must ensure terminal is at project root (directory containing `.architext/`).
> If unsure, confirm current directory first. Forbidden to run directly from subdirectories.

### `npx archi task` — Roadmap Task Management

| Subcommand | Purpose | Example |
|:---|:---|:---|
| `npx archi task` | List all tasks with progress | `npx archi task` |
| `npx archi task <ID> --status <s>` | Update task status | `npx archi task INF-001 --status done` |
| `npx archi task --check` | Check Roadmap consistency | `npx archi task --check` |

**Valid status values**: `pending` / `active` / `done` / `blocked`

**When to use**:

| Scenario | Action |
|:---|:---|
| After `/archi.plan` completes | `npx archi task <ID> --status active` |
| After `/archi.code` completes | `npx archi task <ID> --status done` |
| Task found to be blocked | `npx archi task <ID> --status blocked` |
| After modifying `roadmap.json` | `npx archi task --check` |
| Need to check project progress | `npx archi task` |

> When completing `/archi.code` or `/archi.plan`, must proactively run `npx archi task <ID> --status <done|active>` to update progress.

### `npx archi plan` — Plan Completion Check

| Subcommand | Purpose | Example |
|:---|:---|:---|
| `npx archi plan <ID>` | Check Feature's Plan completion | `npx archi plan SUB-01` |

Automatically identifies Manual Verification sections and excludes them from automated statistics.

**When to use**:

| Scenario | Action |
|:---|:---|
| Before `/archi.code` signoff | `npx archi plan <ID>` to confirm all checkboxes are checked |
| Check Feature implementation progress | `npx archi plan <ID>` |

> During `/archi.code` signoff phase, must first run `npx archi plan <ID>` to verify completion.

### `npx archi render` — Render JSON Data as Markdown Views

| Subcommand | Purpose | Example |
|:---|:---|:---|
| `npx archi render` | Render all JSON data files into human-readable `.md` views | `npx archi render` |

**When to use**:

| Scenario | Action |
|:---|:---|
| AI directly edited `.json` data files | `npx archi render` |
| After `/archi.start` creates roadmap | `npx archi render` |
| After `/archi.plan` generates plan.json | `npx archi render` |

> Note: `.md` views are auto-generated; prohibited from editing directly. Modifications must go through `.json` source files.

**End of Dispatcher.**

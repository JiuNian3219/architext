---
description: Command Dispatcher & Workflow Controller. Handles /archi.start, /archi.plan, and mode transitions between Discussion, Planning, and Implementation.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# 🔀 Workflow Dispatcher

> **Role**: Mode Switcher.
> **Logic**: Default to "General Architect" mode. Only load specific protocol templates when **Explicit Command** is detected.

## 1. Explicit Command Routing

**Trigger**: ONLY when user input starts with `/archi.`, **IMMEDIATELY LOAD** the corresponding protocol template and enter the "Dedicated Mode" defined by that template.

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
> 1. **Load**: Read full text of target `.md` file.
> 2. **Override**: Temporarily override parts of `00_system` settings, focusing on template's task.
> 3. **Execute**: Execute `<step_1>` in the template.

---

## 2. Natural Language Passthrough

**Trigger**: User input is **NOT** command text (e.g. "Check this error", "I want to add a button", "Optimize this code").

**Action**:

- **Do NOT** trigger the Router above.
- **Do NOT** load any `prompts/` files.
- **Stay in "General Architect" Mode**: Must strictly rely on the following **Base Layer** rules to respond:

| Layer       | File                       | Role                                                |
| :---------- | :------------------------- | :-------------------------------------------------- |
| **Core**    | `00_system.md`       | **Identity**: Full-Stack Architect, following DDAD.          |
| **Tech**    | `02_tech_stack.md`   | **Tech Red Lines**: Consult library selection and coding standards.                |
| **Custom**  | `90_custom_rules.md` | **House Rules**: Consult team specific constraints.                    |
| **Context** | `99_context_glue.md` | **Auto-Navigation**: Automatically read Spec/UI docs based on edited files. |

---

## 3. Mode Interaction

- **Command Mode (`/archi.*`)**: **High-Intensity, Process-Oriented**. User needs to follow template steps one by one (Step 1 -> Step 2).
- **Chat Mode (Natural Language)**: **Free-Form, Assistive**. You act as an Architect, using available rule files (00/02/90/99) to answer questions and assist development.

---

## 4. CLI Tools Registry

> Beyond chat commands (`/archi.*`), Architext provides **terminal CLI commands**.
> You should **proactively invoke** these commands at the right time, rather than waiting for the user to run them manually.

### ⚠️ Working Directory Rule (Critical)

> **Before executing ANY `npx archi` command, you MUST ensure the terminal's working directory is the project root (the directory containing the `.architext/` folder).**
>
> - If unsure about the current directory, run `pwd` (Linux/Mac) or `cd` (Windows) to confirm.
> - If not in the project root, **run `cd <project-root-path>` first** before executing the command.
> - **Bad**: Running `npx archi task` from `src/components/` — the command won't find `.architext/` config.
> - **Good**: `cd /path/to/project && npx archi task`

### `npx archi task` — Roadmap Task Management

| Subcommand / Option | Purpose | Example |
| :--- | :--- | :--- |
| `npx archi task` | List all tasks with progress bar | `npx archi task` |
| `npx archi task --list` | Same as above (explicit mode) | `npx archi task --list` |
| `npx archi task <ID> --status <s>` | Update task status | `npx archi task INF-001 --status done` |
| `npx archi task --check` | Validate Roadmap consistency (list vs graph) | `npx archi task --check` |

**Valid status values**: `pending` · `active` · `done` · `blocked`

#### When to Use?

| Scenario | Action |
| :--- | :--- |
| After `/archi.plan` completes, new feature planned | `npx archi task <ID> --status active` |
| After `/archi.code` completes, feature implemented | `npx archi task <ID> --status done` |
| A task is found to be blocked | `npx archi task <ID> --status blocked` |
| After modifying `00_roadmap.md` | `npx archi task --check` to validate consistency |
| Need an overview of project progress | `npx archi task` to view summary |

> **Important**: When you complete a task via `/archi.code` or `/archi.plan`, you **MUST** proactively run `npx archi task <ID> --status done` to update progress, rather than waiting for the user to do it manually.

### `npx archi plan` — Plan Completion Check

> Checks the checkbox task completion status in `plan.md` for a specified Feature.
> Automatically identifies Manual Verification sections and excludes them from automated statistics.

| Subcommand / Option | Purpose | Example |
| :--- | :--- | :--- |
| `npx archi plan <ID>` | Check Plan completion for a Feature | `npx archi plan SUB-01` |

**Output Example**:
```
📋 Plan Check: SUB-01 Subscription CRUD

Phase 1: Data Layer & Validation   [4/4] ✅
Phase 2: UI Components             [6/6] ✅
Manual Verification                [0/5] (Skipped — Manual)
──────────────────────────────────────
Total: 10/10 (100%)
✅ All automated tasks completed!
```

#### When to Use?

| Scenario | Action |
| :--- | :--- |
| Before `/archi.code` signoff, mandatory completion check | `npx archi plan <ID>` to confirm all checkboxes are checked |
| Want to check implementation progress of a Feature | `npx archi plan <ID>` to view completion ratio per Phase |
| Uncompleted tasks exist but signoff is needed | Check unchecked items in output to determine if they are Manual/Force Majeure |

> **Important**: During the signoff phase (Step 6 Sign Off) of `/archi.code`, you **MUST** first run `npx archi plan <ID>` to verify Plan completion. Signoff can only proceed when all AI-completable tasks are checked (or uncompleted items belong to Manual Verification / Force Majeure only).

**End of Dispatcher.**

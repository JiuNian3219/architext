---
description: Command Dispatcher & Workflow Controller. Handles /archi.start, /archi.plan, and mode transitions between Discussion, Planning, and Implementation.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Workflow Dispatcher

> **Role**: Mode Switcher. Default to "General Architect" mode, only load specific protocol when explicit command is detected.

> ⛔ **STOP CHECK** — Self-check before each response; stop immediately and explain if any item is triggered:
> | Violation | Correct Action |
> |:---|:---|
> | Received `/archi.*` command but started executing without loading the protocol file | Stop → Load protocol file first |
> | User request involves behavior change but code was modified directly | Stop → Route to the appropriate command |
> | Ran a Terminal Gate command without confirming working directory (see `04_cli_tools.md`) | Stop → Pass Working Directory Gate first |

## 1. Explicit Command Routing

**Trigger**: When user input starts with `/archi.`, immediately load the corresponding protocol template.

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

> **Protocol Load Gate** (forbidden to skip; three steps must complete in order):
> 1. **Read** target `.md` full text → if file not found, stop and output: `Protocol file not found, execution aborted`
> 2. **Override** `00_system` partial settings
> 3. **Execute** `<step_1>` — forbidden to execute any protocol content before step 1 is complete

---

## 2. Natural Language Passthrough

**Trigger**: User input is not `/archi.` command text.

### 2.1 Intent Detection

**Role**: Intelligent Dispatcher. Detect user intent and decide to execute directly or route to a command based on impact level.

**Decision Criterion**: Does this change affect documented behavior (interfaces/logic/scenarios in spec.md, interactions/structure in ui.md, implementation steps in plan.json)?

| Intent Type | Action |
|:---|:---|
| Pure conversation / code reading / architecture discussion | ✅ Answer directly, enhanced by base rules |
| Trivial edits (typo/comments/formatting/log messages) | ✅ Execute directly |
| Behavior change (logic/interface/type/UI) | 🔀 Route → `/archi.edit` + `/archi.code` |
| Bug fix | 🔀 Route → `/archi.fix` |
| New feature | 🔀 Route → `/archi.scope` or `/archi.plan` |
| Large-scale refactoring | 🔀 Route → `/archi.revise` |

### 2.2 Guided Dispatch

When routing (🔀), must:
1. Explain in one sentence why a command is needed (which document would be affected)
2. Recommend the specific command + parameters
3. Ask the user whether to proceed

> ⛔ **Prohibited**: Modifying code first and then suggesting the command as an afterthought. Violations require reverting the change and re-routing.

### 2.3 Unmanaged Code

When the target of modification is not registered in `map.json` and has no corresponding Task:
- Inform the user that the module is not managed
- Suggest `/archi.inherit` or `/archi.scope` to bring it under management
- After user confirms "temporary adjustment", proceed with direct modification

### 2.4 Base Rules

All scenarios (including routing and pure conversation) rely on the following base rules:

| Layer | File | Role |
|:---|:---|:---|
| Core | `00_system.md` | Identity, core principles |
| Tech | `02_tech_stack.md` | Tech red lines, coding standards |
| Custom | `90_custom_rules.md` | Team-specific constraints |
| Context | `99_context_glue.md` | Auto-associate context documents |

**End of Dispatcher.**

> Mandatory CLI execution rules: see `04_cli_tools.md`.

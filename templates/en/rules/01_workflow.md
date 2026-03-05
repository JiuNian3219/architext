---
description: Command Dispatcher & Workflow Controller. Handles /archi.* routing and mode transitions.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Workflow Dispatcher

> **Role**: Mode Switcher. Default to "General Architect" mode, only load specific protocol when explicit command is detected.

> ⛔ **STOP CHECK** — Self-check before each response:
> | Violation | Correct Action |
> |:---|:---|
> | Received `/archi.*` but started executing without loading protocol file | Stop → Load protocol file first |
> | User request involves behavior change but code was modified directly | Stop → Route to the appropriate command |
> | Ran `npx archi` without confirming working directory | Stop → Pass Working Directory Gate (see `04_cli_tools.md`) |

## 1. Explicit Command Routing

**Trigger**: When user input starts with `/archi.`, immediately load the corresponding protocol.

| Command | Target Template |
|:---|:---|
| `/archi.start` | `[[__PROMPTS_PATH__]]/archi.start.md` |
| `/archi.inherit` | `[[__PROMPTS_PATH__]]/archi.inherit.md` |
| `/archi.scope` | `[[__PROMPTS_PATH__]]/archi.scope.md` |
| `/archi.plan` | `[[__PROMPTS_PATH__]]/archi.plan.md` |
| `/archi.edit` | `[[__PROMPTS_PATH__]]/archi.edit.md` |
| `/archi.revise` | `[[__PROMPTS_PATH__]]/archi.revise.md` |
| `/archi.code` | `[[__PROMPTS_PATH__]]/archi.code.md` |
| `/archi.audit` | `[[__PROMPTS_PATH__]]/archi.audit.md` |
| `/archi.fix` | `[[__PROMPTS_PATH__]]/archi.fix.md` |
| `/archi.map` | `[[__PROMPTS_PATH__]]/archi.map.md` |
| `/archi.remove` | `[[__PROMPTS_PATH__]]/archi.remove.md` |
| `/archi.ref` | `[[__PROMPTS_PATH__]]/archi.ref.md` |
| `/archi.recover` | `[[__PROMPTS_PATH__]]/archi.recover.md` |
| `/archi.help` | `[[__PROMPTS_PATH__]]/archi.help.md` |

> **Protocol Load Gate** (forbidden to skip, complete in order):
> 1. **Read** target `.md` full text → if file not found, stop: `Protocol file not found, execution aborted`
> 2. **Override** — May override: `<system_role>`, `<thinking_process>`, `<communication_style>`. Cannot override: `<core_philosophy>`, `<critical_protocols>`.
> 3. **Execute** `<step_1>` — forbidden to execute any protocol content before step 1 is complete

---

## 2. Natural Language Passthrough

**Trigger**: User input is not an `/archi.` command.

**Decision Criterion**: Does this change affect documented behavior (spec/ui/plan)?

| Intent Type | Action |
|:---|:---|
| Pure conversation / code reading / architecture discussion | ✅ Answer directly |
| Trivial edits (typo/comments/formatting/log messages) | ✅ Execute directly |
| Behavior change (logic/interface/type/UI) | 🔀 Route → `/archi.edit` + `/archi.code` |
| Bug fix | 🔀 Route → `/archi.fix` |
| New feature | 🔀 Route → `/archi.scope` or `/archi.plan` |
| Large-scale refactoring | 🔀 Route → `/archi.revise` |

When routing (🔀): ① Explain why a command is needed ② Recommend specific command + params ③ Ask user to proceed.
> ⛔ **Prohibited**: Modifying code first then suggesting the command afterward.

Target not registered in `map.json` and has no Task → **STOP & ASK**, route to `/archi.inherit` or `/archi.scope`.

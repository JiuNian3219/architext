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

## 2. Natural Language Dispatch

**Trigger**: User input is not an `/archi.` command and involves business changes.

### §2.0 Non-protocol scenarios (answer directly)

| Intent Type | Action |
|:---|:---|
| Pure conversation / code reading / architecture discussion | ✅ Answer directly |
| Trivial edits (typo/comments/formatting/log messages) | ✅ Execute directly |

### §2.1 Pre-flight (triggered when business changes are involved)

1. Scan `roadmap.json` + `tasks/<ID>_*/` directory to match user intent to tasks.
2. Determine protocol to load per the table below:

| Check Result | Load Protocol | Confirmation |
|:---|:---|:---|
| No matching task in roadmap | `scope.md` | Inform "Let me help you scope this" then start |
| Has task · no spec.md | `plan.md` | Inform "This task needs planning, I'll do it" then start |
| Has spec+plan · status=active | `code.md` | Start directly (IDE native plan mode drives rhythm) |
| status=done · user wants changes | `edit.md` | Inform "I'll update docs before changing code" then start |
| User describes abnormal behavior | `fix.md` | Start diagnosis directly |
| Affects >1 task or global assets | `revise.md` | Output impact assessment first, await confirmation |

3. After loading protocol, follow §1 **Protocol Load Gate** (read full text → override → step_1).

### §2.2 Chain Continuation

Each protocol's Signoff Next Steps already points to the next protocol. AI must:
- Proactively suggest next step ("Spec is ready, shall we start implementing?")
- After user confirms, load next protocol and continue

| Transition | Chaining Rule |
|:---|:---|
| scope → plan | May chain (after scope, ask "Want to plan the first task?") |
| plan → code | **Must await user confirmation** (spec is the most important checkpoint) |
| code → audit | Built-in (code.md step_5 already has silent audit) |

> ⛔ **Prohibited**: Auto-chaining from plan to code without user confirmation.

### §2.3 IDE Collaboration

Leverage IDE native capabilities (plan mode / agent mode / checkpoint) to drive execution rhythm.
Protocols define "what to do, what to check" — do not fight IDE planning/execution capabilities.

### §2.4 Unmanaged Code

Target not registered in `map.json` and has no Task → **STOP & ASK**, route to `/archi.inherit` or `/archi.scope`.

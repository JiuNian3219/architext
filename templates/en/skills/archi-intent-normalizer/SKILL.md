---
name: archi-intent-normalizer
description: Normalize a user request into an Architext Intent Card before command routing. Must run in isolated context/subagent when available. Auto-invoked by 00_system Front Pipeline.
---

## Invocation

- **Auto-invoke**: Yes, called by `00_system.md` Front Pipeline.
- **Trigger location**: Before user request enters protocol routing.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only fallback to `NO-SUBAGENT` / `NO-SKILL` inline execution when no subagent.
- **Boundary**: Only produce structured intermediate artifacts, does not execute protocols, does not modify project files.

# Architext Intent Normalizer

## Purpose

Convert user's original words into structured `Intent Card`. This Skill only does semantic understanding and routing suggestions, **does not read large files, does not modify files, does not execute commands**.

## Inputs

- `user_message`: User's current message full text.
- `recent_context`: Brief context from recent conversation still affecting intent judgment.
- `explicit_command`: If user input starts with `/archi.`, record original command; otherwise `null`.
- `known_state`: Lightweight state caller can provide, e.g. roadmap id list, current discussion file, current task id.

## Output Contract

Only output one JSON code block, no explanatory body text.

```json
{
  "intent_card_version": 1,
  "raw_user_message": "<Original summary, preserving key verbs and objects>",
  "normalized_goal": "<One sentence explaining what user really wants to achieve>",
  "intent_type": "init | plan | change | code | review | remove | ui | ref | help | answer | unknown",
  "command": "/archi.init | /archi.plan | /archi.change | /archi.code | /archi.review | /archi.remove | /archi.ui | /archi.ref | /archi.help | none",
  "subprotocol": "start | inherit | recover | decompose | detail | fix | edit | revise | task | project | map | add | list | update | remove | none",
  "target": {
    "task_id": null,
    "files": [],
    "refs": [],
    "feature_area": null
  },
  "scope": "single-task | multi-task | global | project-setup | docs-only | code-only | read-only | unknown",
  "operation_kind": "read | write-docs | write-code | delete | overwrite | command-run | none",
  "requires_user_confirmation": false,
  "confidence": 0.0,
  "ambiguities": [],
  "routing_reason": ["<Matched semantic signal>"],
  "recommended_next_action": "<Protocol to load next or question to ask>"
}
```

## Routing Rules

### Direct Answer

When not a project business action, return:
- `intent_type`: `answer`
- `command`: `none`
- `subprotocol`: `none`

Applies to: Explaining concepts, discussing approaches, requesting summaries, asking file meanings, only reviewing not modifying.

### Init

Project initialization, adopt existing code, restore pack:
- New project / Starting from brief → `/archi.init`, `start`
- Adopt existing code → `/archi.init`, `inherit`
- Restore pack / `.xml` backup → `/archi.init`, `recover`

### Plan

New requirements, new features, new tasks, scope breakdown, detail existing roadmap task:
- No explicit existing task id, or user says "create new/add new/write new requirement/break down" → `/archi.plan`, `decompose`
- Has explicit task id, and need to complete spec/plan for later implementation → `/archi.plan`, `detail`

### Change

Already-managed content needs change:
- Error, bug, behavior doesn't match existing spec → `/archi.change`, `fix`
- Add requirement, change behavior, change spec, adjust single task boundary → `/archi.change`, `edit`
- Tech stack, architecture, global spec, cross-task direction change → `/archi.change`, `revise`

### Code

Implement already-planned and executable task:
- "Implement/develop/write code/start doing <ID>" → `/archi.code`
- If no task id or task doesn't exist, fallback suggest `/archi.plan`

### Review

Review, check, health check, sync map:
- Single task code review → `/archi.review`, `task`
- Project overall health check → `/archi.review`, `project`
- Directory/map/architecture diagram sync → `/archi.review`, `map`

### Remove

Decommission feature, delete task and related code docs → `/archi.remove`. Mark:
- `operation_kind`: `delete`
- `requires_user_confirmation`: `true`

### UI

Generate or update `screens/` concept design → `/archi.ui`.

### Ref

Manage external reference materials:
- Add link/file/pasted material → `/archi.ref`, `add`
- View reference list → `/archi.ref`, `list`
- Refresh specific reference → `/archi.ref`, `update`, `operation_kind`: `overwrite`, `requires_user_confirmation`: `true`
- Delete specific reference → `/archi.ref`, `remove`, `operation_kind`: `delete`, `requires_user_confirmation`: `true`

## Ambiguity Rules

When encountering following situations do not hard-route, `confidence` must not exceed `0.6`, and give questions needing clarification in `ambiguities`:

- "Change/optimize/handle" but didn't say whether bug, requirement change, or implementation detail.
- Both bug fix and new requirement signals present.
- User wants to "implement new feature" but no task id, also didn't say whether roadmap exists.
- User says "review/look at" but cannot determine single task or project overall.
- Involves delete, overwrite, install dependencies, cross-task global changes, but target unclear.

## Confidence Guide

- `0.9-1.0`: Explicit command or strong verb + clear target.
- `0.75-0.89`: Semantics clear, but missing small amount of context, protocol can still load then fill.
- `0.5-0.74`: Clear direction, but needs user confirmation.
- `<0.5`: Insufficient to route, should ask first.

## Hard Limits

- Do not route "new feature" to `/archi.code` unless exists explicit executable task id.
- Do not route "bug" directly to `/archi.code`, should prefer `/archi.change`'s `fix`.
- Do not route "global/architecture/tech stack" to single-task edit, unless user explicitly limits to modifying some task document.
- Do not discard ambiguity to appear certain; ambiguity must go into `ambiguities`.
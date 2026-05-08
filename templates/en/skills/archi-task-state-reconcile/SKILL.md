---
name: archi-task-state-reconcile
description: Reconcile stale Architext task status from evidence. Must run in isolated context/subagent when available. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## Invocation

- **Auto invoke**: No. Only invoked explicitly by `/archi.*` protocols through `[[SUBAGENT]]` / `[[NO-SUBAGENT]]`.
- **Trigger location**: A task is blocked by `pending` / `blocked` / deps not done, and stale status may be the cause.
- **Execution context**: When subagents are supported, must run in an isolated subagent/context. Without subagents, fall back to inline Skill execution.
- **Boundary**: Only judge whether task status is stale and return a recommended action; never mutate roadmap/task status directly.

# Architext Task State Reconcile

## Purpose

Decide whether a task or dependency is actually complete/planned while roadmap status is stale. This Skill is a status reconciler; it does not implement, edit docs, or sign off for the main protocol.

## Inputs

- `task_id`: Task being checked.
- `mode`: `dependency_done` | `target_active`
  - `dependency_done`: Check whether a dependency is actually complete and can be marked done.
  - `target_active`: Check whether the target task has completed detail and can be marked active.
- `reason`: Invocation reason, for example `blocked_by_deps`, `target_pending`.
- `known_blockers`: Blocker IDs known by caller, optional.

## Read Budget

1. Read only target task and direct deps from `global/roadmap.json`, extracting `id/title/status/deps`.
2. Read `spec.md` and `plan.json` under the target task directory; missing files mean insufficient evidence.
3. May run:
   - `npx archi plan <ID>`: judge plan completion / detail readiness.
   - `npx archi task --check`: judge structure state has no ERROR.
4. Check artifact existence only when plan explicitly lists key output paths. Do not read all source files.
5. Do not read unrelated tasks, refs, screens, or large product source files.

## Decision Rules

### mode = dependency_done

Return `status_stale_done` only when all are true:
- `spec.md` and `plan.json` exist;
- all AI-completable `plan.json` items are done, or `npx archi plan <ID>` reports complete / only exempt items remain;
- `npx archi task --check` has no ERROR;
- if plan declares key artifact paths, those paths exist.

Otherwise:
- Missing docs / incomplete plan / task check ERROR -> `actually_incomplete`
- Insufficient data or commands cannot run -> `inconclusive`

### mode = target_active

Return `status_stale_active` only when all are true:
- `spec.md` and `plan.json` exist;
- `npx archi plan <ID>` runs and indicates detail is ready;
- direct deps are done, or each dep is judged `status_stale_done` by this rule.

Otherwise:
- Missing `spec.md` / `plan.json` -> `needs_plan`
- deps actually incomplete -> `blocked`
- insufficient data -> `inconclusive`

## Output Contract

Output only one JSON code block. No explanatory prose.

**Return-Control Contract**: This Skill JSON is input to the calling protocol's Status Gate, not the final reply. After receiving it, the main agent must continue the original protocol according to `main_agent_next_step`: run the recommended status command and re-check, refuse with evidence, or ask the user; do not stop at the JSON report.

```json
{
  "task_state_reconcile_version": 1,
  "task_id": "<ID>",
  "mode": "dependency_done | target_active",
  "current_status": "pending | active | blocked | done | unknown",
  "checked_files": [],
  "commands_run": [
    {
      "command": "npx archi plan <ID>",
      "result": "pass | fail | not_run",
      "evidence": "<short summary>"
    }
  ],
  "evidence": [
    {
      "kind": "plan_complete | docs_exist | task_check | artifact_exists | dependency_state",
      "result": "pass | fail | unknown",
      "detail": "<short, source-grounded detail>"
    }
  ],
  "conclusion": "status_stale_done | status_stale_active | actually_incomplete | needs_plan | blocked | inconclusive",
  "recommended_action": {
    "command": "npx archi task <ID> --status done | npx archi task <ID> --status active | none",
    "reason": "<why this is safe>",
    "requires_user_confirmation": false
  },
  "main_agent_next_step": "<continue protocol | run recommended command then re-check | refuse with evidence | ask user>"
}
```

## Safety

- Do not recommend `done` without evidence.
- `done` and `active` recommendations must include auditable evidence.
- If commands fail, do not guess. Return `inconclusive` or `actually_incomplete`.
- Do not mark complete because the user says it should be complete; require file/command evidence.

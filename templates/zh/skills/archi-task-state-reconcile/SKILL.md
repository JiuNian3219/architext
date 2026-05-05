---
name: archi-task-state-reconcile
description: Reconcile stale Architext task status from evidence. Must run in isolated context/subagent when available. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## 调用方式

- **自动调用**: 否，仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **触发位置**: 任务被 `pending` / `blocked` / deps 未 done 阻塞，且可能是状态未同步而非实际未完成。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只判定状态是否滞后并输出推荐动作；不得直接修改 roadmap/task 状态。

# Architext Task State Reconcile

## Purpose

判断某个 task 或其前置依赖是否“实际已经完成/已规划，但 roadmap 状态滞后”。本 Skill 是状态校准员，不做实现、不改文档、不替主协议签收。

## Inputs

- `task_id`: 当前被检查的 task。
- `mode`: `dependency_done` | `target_active`
  - `dependency_done`: 检查前置任务是否实际完成，可否标记 done。
  - `target_active`: 检查目标任务是否已完成 detail，可否标记 active。
- `reason`: 调用原因，例如 `blocked_by_deps`、`target_pending`。
- `known_blockers`: 调用方已知的阻塞 ID 列表，可为空。

## Read Budget

1. 先读 `global/roadmap.json` 中目标 task 和直接 deps 条目，只摘 `id/title/status/deps`。
2. 读取目标 task 目录下的 `spec.md`、`plan.json`；缺失则记录为证据不足。
3. 可运行：
   - `npx archi plan <ID>`：判断 plan 完成度 / detail 是否就绪。
   - `npx archi task --check`：判断结构状态是否无 ERROR。
4. 只在 plan 明确列出关键产物路径时检查这些文件是否存在；禁止全量阅读源码。
5. 不读取无关 task、refs、screens 或产品源码大文件。

## Decision Rules

### mode = dependency_done

判定 `status_stale_done` 需要同时满足：
- `spec.md` 和 `plan.json` 存在；
- `plan.json` 中 AI 可完成项均已 done，或 `npx archi plan <ID>` 显示已完成 / 仅剩豁免项；
- `npx archi task --check` 无 ERROR；
- 若 plan 声明关键产物路径，则这些路径存在。

否则：
- 缺文档 / plan 未完成 / check 有 ERROR → `actually_incomplete`
- 信息不足或命令无法运行 → `inconclusive`

### mode = target_active

判定 `status_stale_active` 需要同时满足：
- `spec.md` 和 `plan.json` 存在；
- `npx archi plan <ID>` 可运行且表示该任务 detail 就绪；
- 直接 deps 已 done，或各 deps 经本规则判定为 `status_stale_done`。

否则：
- 缺 `spec.md` / `plan.json` → `needs_plan`
- deps 实际未完成 → `blocked`
- 信息不足 → `inconclusive`

## Output Contract

只输出一个 JSON 代码块，不输出解释性正文。

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

- 无证据不得推荐 `done`。
- `done` 与 `active` 推荐必须给出可复查证据。
- 若命令失败，不要猜测；返回 `inconclusive` 或 `actually_incomplete`。
- 不要因为用户说“应该完成了”就判定完成，必须以文件/命令证据为准。

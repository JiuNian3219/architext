<protocol_plan_router>
**Trigger**: `/archi.plan [arg] [context]` | Loaded when Intent Card points to `/archi.plan`
**Goal**: Based on Intent Card, Context Pack, `[arg]` form and roadmap state, dispatch to `plan/decompose.md` (scope decomposition) or `plan/detail.md` (task detail).

<meta>
  <style>Decisive, Minimal, Non-interactive</style>
  <language>English</language>
  <principles>
    1. **Intent + Context First**: Prioritize consuming Intent Card and Context Pack; explicit parameters then use "parameter form + roadmap existence" for judgment.
    2. **Explicit Routing**: Judgment result must be explicitly output (user can interrupt), do not silently jump.
    3. **Single-Layer Dispatch**: This file does not embed any planning logic, subprotocol upgrades do not affect this file.
    4. **Dispatch-Continuation**: After outputting the routing decision, immediately read and execute the target subprotocol; "this file exits" only means the router no longer participates, not that the turn stops.
  </principles>
</meta>

<step_1_scan>
**Action**: Prioritize reading Intent Card + Context Pack:
- If `command` is not `/archi.plan` → Stop, prompt caller to load correct protocol per Intent Card.
- If Context Pack missing → Return to `00_system.md` Front Pipeline to fill; if `missing_or_stale` non-empty, handle gaps first or explain to user.
- Use Context Pack's roadmap/task/brief facts as routing basis, do not re-read large files in router.
- If `subprotocol` is `decompose` / `detail` and `confidence >= 0.75` and no `ambiguities` → Use that route, and use `[arg]` / `target.task_id` to fill subprotocol parameters.
- If Intent Card missing, low confidence or has ambiguity → Scan following signals by priority, first match handles:

**Task Creation Boundary**:
- New requirement / new feature / new task / natural-language scope description without an existing roadmap ID can only route to `plan/decompose.md`.
- Router and decompose stages must not create `tasks/<ID>_<Slug>/` or any task document; they may only estimate scope, split tasks, and update `global/roadmap.json`.
- Only case 1 with an existing ID may enter `plan/detail.md` and generate task documents.

| # | Signal | Judgment | Route Target |
|:---|:---|:---|:---|
| 1 | `[arg]` matches `^[A-Z]+-\d+$` and exists in `roadmap.json` | Valid task ID | `plan/detail.md` (`[arg]` as ID, rest as context) |
| 2 | `[arg]` matches `^[A-Z]+-\d+$` but not in `roadmap.json` | Invalid ID | Stop, error: Task `<ID>` does not exist, please `/archi.plan <brief>` first to add |
| 3 | `[arg]` ends with `.md` and is readable file path | Explicitly specified Brief | `plan/decompose.md` (`[arg]` as file_path) |
| 4 | `[arg]` empty and `scope-brief.md` (project root or `[[__DOCS_DIR__]]/`) exists | Default Brief | `plan/decompose.md` (decompose finds default path itself) |
| 5 | `[arg]` empty and default Brief does not exist | Natural language entry | `plan/decompose.md` (fallback_interview path) |
| 6 | `[arg]` is other natural language/non-ID non-path | Treat as requirement description | `plan/decompose.md` (`[arg]` as natural language context, via fallback_interview) |
</step_1_scan>

<step_2_report>
**Trigger**: step_1 hit a deterministic route
**Action**: Explicitly output routing decision:

```
Route judgment: **<decompose | detail>**
Basis: <specific hit signal, e.g. "`[arg]=FEAT-07` matches ID format and exists in roadmap.json">
Subprotocol: `plan/<decompose|detail>.md`
```
</step_2_report>

<step_3_dispatch>
**Action**:
1. Read `[[__DOCS_DIR__]]/prompts/plan/<mode>.md` content
2. Extract subprotocol required parameters from `[arg] [context]` (ID / file_path / natural language requirement), inject into context
3. Continue executing subprotocol as current active protocol
4. This file exits, no longer participates in subsequent flow; do not end the turn after only outputting the routing decision
</step_3_dispatch>
</protocol_plan_router>

<protocol_review_router>
**Trigger**: /archi.review [id] [context] | /archi.review map (→ map alias) | Loaded when Intent Card points to `/archi.review`
**Goal**: Based on Intent Card, Context Pack and user's original words, dispatch to task / project / map subprotocol (choose one).

<meta>
  <style>Intent-Reading, Honest-Routing, Decisive</style>
  <language>English</language>
  <principles>
    1. Intent Over Parameter: Routing decision prioritizes "what user wants to do", <ID> etc are secondary evidence.
    2. Read-Only Default: task / project strictly Read-Only (only write report file); only map subprotocol modifies map.json, and must pass Gate.
    3. No Silent Branching: When intent unclear stop and ask, do not silently route.
    4. No Sub-protocol Re-routing: If subprotocol execution finds protocol mismatch, stop and prompt user to re-select; subprotocol does not auto-switch.
    5. IDE-Native First: Leverage IDE native capabilities to drive execution rhythm, this protocol defines routing standards and checkpoints.
  </principles>
</meta>

<step_1_route>
Prioritize reading Intent Card + Context Pack:
- If `command` is not `/archi.review` → Stop, prompt caller to load correct protocol per Intent Card.
- If Context Pack missing → Return to `00_system.md` Front Pipeline to fill; if `missing_or_stale` non-empty, handle gaps first or explain to user.
- Use Context Pack's target / relevant_facts / risk_flags as review scope basis, do not full-scan project in router.
- If `subprotocol` is `task` / `project` / `map` and `confidence >= 0.75` and no `ambiguities` → Use that route, also preserve `routing_reason` as basis.
- If Intent Card missing, low confidence or has ambiguity → Read user input's full sentence, re-judge per table below; still uncertain then enter ask Gate.

Read user input to determine what they really want to do.

**Three Intent Types**:

| User is describing | Subprotocol | Nature | Verb / Context Signal | Typical Examples |
|---|---|---|---|---|
| Review some task's code implementation / Find bugs and quality issues in task | **task** | Read-Only | Review / Walk through / Check / Take a look / review + ID | "Review FEAT-A", "Look at FEAT-A's code", "Check login function" |
| Project overall health check / Holistic quality / Full inspection / Drift detection | **project** | Read-Only | Overall / Full / Health check / Project-level / Scan all | "Full health check", "Is project healthy", "Scan everything" |
| Architecture map sync / Directory change refresh / map drift fix | **map** | Write (needs Gate) | map / Architecture diagram / Directory changed / Renamed / Sync | "Refresh map", "Directory changed sync", "Renamed X update architecture diagram" |

**Judgment Priority** (High → Low):

1. **/archi.review map alias fast path** → Direct route to map subprotocol, also skip step_2 ask Gate (already explicit selection)
2. **Explicit verb signal + clear context** → Direct route
3. **<ID> exists + description limits task scope** → Lean toward task
4. **No ID + description is project-level** → Lean toward project
5. **map / architecture diagram / directory change keywords** → Lean toward map
6. **Context inference**: Just discussed some task / project health check → Continue same intent
7. None of above hit → **Ask Gate**

**Ask Gate**:

- **task vs project ambiguity** (e.g. "Review" without ID and description vague) → Ask "Review specific task or project overall?"
- **task vs map ambiguity** (e.g. "Look at structure") → Ask whether to review task / project health check / or map sync
- **map signal weak but description sounds like directory change** → Prompt user to clarify, map subprotocol will modify files

**Honest Refusal**:

Description is neither review, nor health check, nor map sync:
- "Fix bug / Change spec / Change architecture" → /archi.change
- "Implement new feature" → /archi.code <ID>
- "Add new task / Write new requirement" → /archi.plan
</step_1_route>

<step_2_report>
Explicitly output routing decision:

Routing decision: Will go to [subprotocol] subprotocol
Intent basis: [Keywords read from user description]
Next action summary: [What subprotocol step_1 will do]
Read/Write nature: [Read-Only / Write needs Gate]

Confirm to continue? OK / Adjust / Cancel

**Gate**: Wait for user confirmation. OK → step_3; Adjust → Return step_1 re-judge; Cancel → Terminate.
**Alias fast path**: Skip this Gate when user calls via /archi.review map directly (already explicit selection).
</step_2_report>

<step_3_dispatch>
Read target subprotocol file, inject `<ID>` and [context] into subprotocol context, this router exits, subprotocol takes over.

| Subprotocol | File |
|---|---|
| task | `[[__DOCS_DIR__]]/prompts/review/task.md` |
| project | `[[__DOCS_DIR__]]/prompts/review/project.md` |
| map | `[[__DOCS_DIR__]]/prompts/review/map.md` |
</step_3_dispatch>

</protocol_review_router>
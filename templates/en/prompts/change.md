<protocol_change_router>
**Trigger**: /archi.change [id] [context] | Load when Intent Card points to `/archi.change`
**Goal**: Route to one of fix / edit / revise sub-protocols based on Intent Card, Context Pack and user's original words.

<meta>
  <style>Intent-Reading, Honest-Routing, Decisive</style>
  <language>English</language>
  <principles>
    1. **Intent Over Parameter**: Routing decisions prioritize "what the user wants to do", <ID> and other parameters are secondary evidence.
    2. **No Silent Branching**: When intent is ambiguous, stop and ask, do not route silently.
    3. **No Sub-protocol Re-routing**: If sub-protocol execution discovers protocol mismatch, stop and prompt user to re-select; sub-protocol cannot auto-switch.
    4. **Honest Refusal**: When none of the three intents match (e.g., user actually wants to create new task/review code), clearly state reason and suggest correct command.
  </principles>
</meta>

<step_1_route>
Priority: Read Intent Card + Context Pack:
- If `command` is not `/archi.change` → Stop, prompt caller to load correct protocol per Intent Card.
- If Context Pack is missing → Return to `00_system.md` Front Pipeline to fill; if `missing_or_stale` is non-empty, handle gaps first or explain to user.
- Use target / relevant_facts / risk_flags in Context Pack as routing basis, do not re-read all Architext files.
- If `subprotocol` is `fix` / `edit` / `revise` and `confidence >= 0.75` with no `ambiguities` → Use that route, keeping `routing_reason` as basis.
- If Intent Card is missing, low confidence, or has ambiguities → Read user's full sentence (not just `<ID>`), re-determine per table below; if still uncertain, enter question Gate.

When reading user input, determine what they really want to do.

**Three Intents**:

| What user is describing | Sub-protocol | Verb / Context Signals | Typical Examples |
|---|---|---|---|
| Fix a bug / behavior anomaly / error / crash / not as expected | **fix** | Fix / error / crash / anomaly / wrong / problem / won't run | "Login redirect has problem", "FEAT-A throws NPE", "List not refreshing" |
| Add requirements to a task / change spec / adjust scope or boundaries | **edit** | Add / supplement / change requirements / adjust scope / change spec / boundary | "Add dark mode to FEAT-A", "Change max length limit", "Add an edge case" |
| Change project direction / tech stack / architecture / global conventions / cross-task constraints | **revise** | Global / architecture / tech stack / cross-task / switch to X / refactor overall | "Globally change error code format", "Switch to React 19", "Adjust directory structure" |

**Decision Priority** (High → Low):

1. **Explicit verb signal + Clear context** → Direct route
2. **<ID> + Natural language description**: Starts with ID + description → Read description to determine (fix / edit common, revise usually no ID)
3. **Scope signals**: Single task scope → Lean toward fix / edit; Cross-task / project-level / global conventions → Lean toward revise
4. **Context inference**: Just discussed a bug / spec / architecture change → Continue with same intent
5. None of above matched → **Question Gate**

**Question Gate**:

- **Multiple intents match** (e.g., "FEAT-A add a bug fix" has both fix + edit signals) → Ask which is primary
- **Description too short** (e.g., "FEAT-A change a bit") → Ask "Fix bug, change requirements, or adjust architecture?"

**Honest Refusal**:

Description doesn't resemble bug, spec adjustment, or architecture / global change:
- "Create new feature / add new task / write new requirements" → /archi.plan
- "Implement planned task / start coding" → /archi.code <ID>
- "Review / health check / check code / map sync" → /archi.review
</step_1_route>

<step_2_report>
Explicitly output routing decision:

Routing decision: Will proceed to [sub-protocol] sub-protocol
Intent basis: [Intent keywords read from user description]
Next action summary: [What sub-protocol step_1 will do]

Confirm to continue? OK / Adjust / Cancel

**Gate**: Wait for user confirmation. OK → step_3; Adjust → Return to step_1 to re-determine; Cancel → Terminate.
</step_2_report>

<step_3_dispatch>
Read target sub-protocol file, inject `<ID>` and [context] into sub-protocol context, this router exits, sub-protocol takes over.

| Sub-protocol | File |
|---|---|
| fix | `[[__DOCS_DIR__]]/prompts/change/fix.md` |
| edit | `[[__DOCS_DIR__]]/prompts/change/edit.md` |
| revise | `[[__DOCS_DIR__]]/prompts/change/revise.md` |
</step_3_dispatch>

</protocol_change_router>
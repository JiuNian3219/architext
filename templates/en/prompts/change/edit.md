<protocol_change_edit>
**Trigger**: Router prompts/change.md dispatch (/archi.change [id] <change-context>)
**Goal**: Based on new requirements/modifications, update spec/UI docs of managed module, and append development plan. If <id> not provided, auto-locate related Task.

<meta>
  <style>Collaborative, Iterative, Traceable</style>
  <language>English</language>
  <principles>
    Doc First: Must update docs (Spec/UI) first, then generate Plan. Do not skip docs to change code plan directly.
    Incremental: Only append new Tasks to Plan, preserve completed history (unless rollback needed).
    Conflict Check: Must explicitly check conflicts between new requirements and tech_stack[[WHEN: ui | / design_tokens]] / dictionary.
    Frontmatter Preservation: Do not destroy existing document Metadata.
    No Re-routing: If discovered to be code bug (spec is fine) → Prompt to use fix; If discovered to be global/cross-task change → Prompt to use revise. Sub-protocol cannot auto-switch.
    IDE-Native First: Leverage IDE native capabilities to drive execution rhythm, this protocol defines quality standards and checkpoints.
  </principles>
</meta>

<step_1_load>
Resolve Target:
- Has <id> → Lock tasks/<ID>_<Slug>/.
- No <id> → [[INCLUDE: shared/auto-discovery.md]]

[[INCLUDE: prompts/change/shared/spec-status-check.md]]

Read spec.md / ui.md / plan.json under tasks/<ID>_<Slug>/.
[[WHEN: ui | Also read ui_context.md (locate screen scope and navigation relationships for this feature).]]
For major UX changes, quickly search best practices from similar products.
</step_1_load>

<step_2_conflict_check>
Compare [context] described changes against project constitution conflicts:

| Check Dimension | Data Source | Conflict Example |
|---|---|---|
| Tech Stack | tech_stack.md | User requests adding "WebSocket real-time communication", but tech_stack Anti-Patterns states "Avoid long connections, use SSE uniformly" |
[[WHEN: ui | | Design Tokens | design_tokens.json | User requests adding purple highlight, but design_tokens brand colors are blue series, and ui-redlines forbids purple gradients | ]]
| Terminology | dictionary.json | User uses "User Center", but dictionary forbiddenSynonyms states must use "Personal Center" |
| Existing Contracts | error_codes.json[[WHEN: api | / api_snapshot.json]] | Change conflicts with existing error codes[[WHEN: api | / endpoint contracts]] |
| Project Vision | vision.md | Change contradicts North Star Metric / boundary constraints |

Branch:
- No conflict → Enter step_3.
- **Hard conflict** (Violates tech_stack Anti-Patterns / vision boundaries / design red lines) → Stop, prompt "This change involves X conflict, suggest using /archi.change to go through revise (modify global constitution) or adjust change plan".
- **Soft conflict** (Inconsistent with terminology/existing contracts but adjustable) → Output conflict list, ask user to choose from "Unify terminology / Rename existing contracts / Accept redundancy", confirm then enter step_3.
</step_2_conflict_check>

<step_3_intent>
Parse [context], extract change intent (change type / impact scope / expected result). If requirements are ambiguous, ask user to confirm (A/B/C/D options).
</step_3_intent>

<step_4_refine_docs>
[[INCLUDE: prompts/change/shared/task-doc-cascade.md]]
</step_4_refine_docs>

<step_5_data_sync>
[[INCLUDE: prompts/change/shared/data-sync-trigger.md]]
</step_5_data_sync>

<step_6_verify>
[[SUBAGENT: archi-silent-audit | mode: plan-docs, context: Review consistency between step_4 updated spec.md / ui.md and plan.json new Phase]]
[[NO-SUBAGENT: archi-silent-audit | mode: plan-docs, context: Review consistency between step_4 updated spec.md / ui.md and plan.json new Phase]]
[[NO-SKILL: (Please read [[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md, and review in current context per mode: plan-docs)]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_summary>
**Pre-signoff Checklist** (Must confirm each item before output):
□ Conflict Check executed, conflicts handled or continuation strategy chosen
□ spec.md updated per context, Change Log recorded
[[WHEN: ui | □ When UI modified, ui.md + screens/S-XX.html + ui_context.md synced ]]
□ plan.json new Phase appended (historical tasks fully preserved)
□ When original status=done, roadmap.json status reset to active
□ archi-data-sync executed
□ silent-audit (mode: plan-docs) executed, CRITICAL fixed
□ Terminal Gate — task --check no ERROR + render successful

Output Task update summary (Spec / UI / Plan change summary) + Next Steps:

| Priority | Action | Description |
|---|---|---|
| Recommended | /archi.code <ID> | Execute coding per updated plan |
| Optional | /archi.review <ID> | Review after coding complete |
</step_7_summary>

</protocol_change_edit>
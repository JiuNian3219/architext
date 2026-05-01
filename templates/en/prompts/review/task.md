<protocol_review_task>
**Trigger**: Dispatched by prompts/review.md router (/archi.review [id] [context])
**Goal**: Task-level deep code review. Read-Only, only write review.md report file.

<meta>
  <style>Investigative, Thorough, Evidence-Based</style>
  <language>English</language>
  <principles>
    Read-Only: Do not modify any code and documents (only write review.md report file). Review ≠ Fix.
    Evidence-Based: Each finding must have file path, line number, code snippet.
    Actionable Output: Each issue must have recommended fix command (see action-routing.md).
    Vision Anchored: Always use vision.md as direction baseline, detect deviations.
    No Re-routing: If project-level issues found (roadmap drift / global architecture anomaly) → Prompt to use /archi.review (no ID project-level); subprotocol does not auto-switch.
    IDE-Native First: Leverage IDE native capabilities to drive execution rhythm.
  </principles>
</meta>

<step_1_load>
Resolve Target:
- Has <ID> → Lock tasks/<ID>_<Slug>/.
- No <ID> → [[INCLUDE: shared/auto-discovery.md]]

Status Gate (only active or done can review):

| Status | Handling |
|---|---|
| active / done | Pass |
| pending | Reject — No code to review |
| blocked | Reject — Prerequisite dependencies not complete |

Load:
- vision.md (direction baseline)
- Task docs: spec.md / plan.json / previous review.md (if any, for comparison)
- Project context: tech_stack / map / dictionary / error_codes (see 00_system.md data governance rules)
- [[WHEN: ui | design_tokens.json + ui_context.md + tasks/<ID>/ui.md + screens/ ]]
- [[WHEN: data | data_snapshot.json ]]
- [[WHEN: api | api_snapshot.json ]]
- All code files for this task

Output review scope and context list, enter step_2.
</step_1_load>

<step_2_review>
Review dimension by dimension, each finding must have `file:line` + code snippet + severity level. Inapplicable items mark N/A (not silent skip).

| # | Dimension | Review Points |
|---|---|---|
| 1 | Vision alignment | Is implementation direction consistent with or deviated from vision.md |
| 2 | Spec completeness | Does code cover all scenarios and edge cases in spec.md |
| 3 | Plan authenticity | Are done-marked tasks actually landed in code (prevent false marking) |
| 4 | Logic correctness | Business logic errors, contradictions, missing branches, state machine defects |
| 5 | Bug hunting | Null/undefined, races, resource leaks, infinite loops, off-by-one |
| 6 | Error handling | Swallowed errors, silent failures, error propagation chain completeness, user-visible feedback |
| 7 | Tech Stack compliance | Compare against tech_stack.md: prohibited patterns, deprecated APIs, hardcoding |
| 8 | Security | Sensitive info leaks, unvalidated input, injection risks, permission checks |
| 9 | Performance | Unnecessary full imports, large loops, useless computation, memory leaks, N+1 queries |
| 12 | I18n compliance | If I18n required, no hardcoded strings; must use Key/dictionary references |
| 13 | Orphan .gitkeep | Directory has other files but .gitkeep still exists — must delete |
| 14 | Spec-Code drift | Interfaces/types/behavior consistent with spec.md; manual changes synced to docs |
| 17 | Test effectiveness | Do new/existing tests verify real behavior; exist issues of only testing call counts, file exists, object non-empty, JSON parseable, lacking boundary/error paths |
[[WHEN: ui |
| 10 | Design compliance | Token usage; no magic values; visually consistent with screens/S-XX.html |
| 15 | UI reference integrity | ui.md ref: screens/S-XX.html pointers still valid |
| 16 | Screens misuse check | Production source code must not directly copy HTML/CSS/JS from `screens/`; must re-implement using project language/framework/component system |
]]
[[WHEN: data |
| 11 | Data consistency | Field names/types consistent with data_snapshot.json |
]]
Output findings grouped by dimension, each with level, location, description. Enter step_3.
</step_2_review>

<step_3_classify>
[[INCLUDE: prompts/review/shared/issue-classification.md]]

[[INCLUDE: prompts/review/shared/action-routing.md]]
</step_3_classify>

<step_4_report>
**Pre-signoff Checklist** (Verify item by item before writing file):
□ All presented review dimensions covered; inapplicable items marked N/A
□ Each CRITICAL / WARNING finding has `file:line` + code snippet
□ Each finding has recommended fix command (generated per action-routing.md routing table)
□ Report structure: Review summary → Finding list (CRITICAL → WARNING → INFO) → Statistics summary → Fix ticket summary → Next Steps

[[INCLUDE: prompts/review/shared/report-persistence.md]]

Write path: `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/review.md` (overwrite)

Output review report (both to dialogue and write file) + Next Steps:

| Priority | Action | Description |
|---|---|---|
| Recommended | /archi.change <ID> [Finding description] | Handle CRITICAL / WARNING (router auto-selects fix/edit/revise) |
| Optional | /archi.code <ID> | If incomplete items, continue implementation |
</step_4_report>

</protocol_review_task>
<protocol_change_fix>
**Trigger**: Router prompts/change.md dispatch (/archi.change [id] <bug-context>)
**Goal**: Diagnose and directly fix bugs. If <id> not provided, auto-locate related Task.

<meta>
  <style>Diagnostic, Surgical, Spec-Compliant</style>
  <language>English</language>
  <principles>
    Spec Immutable: Do not change spec.md / ui.md (if bug is actually document error, must switch to edit sub-protocol).
    Reproduction First: Must conceive reproduction steps or test cases first.
    Root Cause: Must analyze root cause, no surface-level patches.
    Test-Driven: Fix plan must include new test cases.
    No Re-routing: If discovered to be spec error (not bug), stop and prompt user to use /archi.change <ID> for edit; sub-protocol cannot auto-switch.
    IDE-Native First: Leverage IDE native capabilities to drive execution rhythm, this protocol defines quality standards and checkpoints.
  </principles>
</meta>

<step_1_load>
Resolve Target:
- Has <id> → Lock tasks/<ID>_<Slug>/.
- No <id> → [[INCLUDE: shared/auto-discovery.md]]

**Spec Readiness Gate**:
- `Spec-Status: Full` or no such field (backward compatible with old docs) → Continue diagnosis.
- `Spec-Status: Stub` / `spec.md` clearly lacks behavior boundaries → Stop, do not supplement docs in fix; prompt user to first run `/archi.change <ID> complete spec: <current bug related behavior boundaries>`, then return to fix.
- `spec.md` missing → Stop, prompt user to first run `/archi.change <ID> complete missing spec`.

Read all docs and related code under target directory, and project context (tech_stack / vision / error_memory, see 00_system.md data governance rules). Combine [context] with code logic to locate potential failure points, enter step_2.
</step_1_load>

<step_2_diagnose>
Propose 1-3 root cause Hypotheses, each must include: failure hypothesis description / supporting evidence (code snippets, error logs, spec behavior differences) / verification method (how to confirm or exclude).

**Spec-Truth Check**: Hypothesis points to "spec-specified behavior not implemented in code / code differs from spec" → Continue fix.
**Spec-Drift Check**: If discovered "spec doesn't describe this behavior but user expects it" or "spec conflicts with user expectation" → Stop, prompt "This is spec gap/deviation, suggest using /archi.change <ID> for edit", terminate this sub-protocol.
</step_2_diagnose>

<step_3_plan>
[[INCLUDE: shared/test-quality.md]]

Append a Bugfix Phase to plan.json, mandatory three-piece set (Reproduction Test → Fix Implementation → Regression Test).

[[INCLUDE: prompts/change/shared/plan-phase-append.md]]
</step_3_plan>

<step_4_execute>
Implement fix per Plan: First write reproduction test (Red) → Fix code (Green) → Run regression tests. Only fix Bug, do not refactor opportunistically. Error handling follows code.md conventions. Real-time update plan.json completed task's done: true.
</step_4_execute>

<step_5_data_sync>
[[INCLUDE: prompts/change/shared/data-sync-trigger.md]]
</step_5_data_sync>

<step_6_verify>
**Terminal Gate** (Cannot skip):

| Step | Command | Pass Condition |
|---|---|---|
| 1 | Run build command | Build succeeds |
| 2 | Run type check | Zero type errors |
| 3 | Run Lint/Format | Pass |
| 4 | Run tests | Reproduction test + regression test pass |

Any failure must be fixed to pass.

[[SUBAGENT: archi-silent-audit | mode: code-impl, context: Review fix code, focus on Tech / Security / Performance + Spec Immutable]]
[[NO-SUBAGENT: archi-silent-audit | mode: code-impl, context: Review fix code, focus on Tech / Security / Performance + Spec Immutable]]
[[NO-SKILL: (Please read [[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md, and check in current context per mode: code-impl)]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_summary>
**Pre-signoff Checklist** (Must confirm each item before output):
□ Hypothesis output, root cause analyzed (not surface patch)
□ Spec-Drift check passed (confirmed real bug not spec gap)
□ plan.json Bugfix Phase appended (includes reproduction test + fix + regression test)
□ Reproduction test created and verified (Red → Green)
□ Code fix only targets Bug, no opportunistic refactoring
□ archi-data-sync executed
□ Build / type check / Lint / tests all pass
□ silent-audit (mode: code-impl) executed, CRITICAL fixed
□ plan.json Bugfix Phase task done markers updated; failed items reset → active

Output Bug fix summary (Root Cause / Fix Content / New Tests) + Next Steps:

| Priority | Action | Description |
|---|---|---|
| Recommended | /archi.review <ID> | Re-review to confirm fix complete |
| Optional | /archi.code <ID> | If incomplete items, continue implementation |
</step_7_summary>

</protocol_change_fix>
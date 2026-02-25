<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: Diagnose Bug and execute fix directly. If `[id]` not provided, auto-locate relevant task module.

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>English</language>
    <principles>
      1.  **Spec Immutable**: Prohibited from modifying `spec.md` / `ui.md` (unless Bug itself is a documentation error).
      2.  **Reproduction**: Must conceive reproduction steps or test cases first.
      3.  **Root Cause**: Must analyze root cause, not patch the surface.
      4.  **Test-Driven**: Fix plan must include new test cases.
      5.  **Auto-Discovery**: If ID not specified, locate Task via Context semantic search.
    </principles>
</meta>

<step_1_diagnose>
    **Role**: Fault Analyst
    **Action**:
    1.  **Resolve Target**:
        - Has `<id>`: Lock target `tasks/<ID>_<Slug>/`.
        - No `<id>`: Analyze `[context]` to search most relevant module.
          Unique match → Auto lock | Multiple matches → List candidates and ask | Cannot locate → Report error requesting ID.
    2.  Read all docs under target directory (`spec.md`, `ui.md`, `plan.json`) and related code.
    3.  Read `02_tech_stack.md` (ensure fix does not violate tech red lines) and `[[__DOCS_DIR__]]/global/vision.md` (ensure fix direction stays aligned with project vision).
    4.  Analyze `[context]`, combine with code logic to locate potential failure points.
    5.  **Hypothesis**: Propose 1-3 root cause hypotheses.

    **Output**: Root Cause Analysis report.
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: Tech Lead
    **Action**:
    - Update `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/plan.json`, append to `phases` array a phase object with `name`: `Bugfix: <Bug Title>`.
    - Tasks: 1) Create reproduction test (Red) 2) Apply fix (Green) 3) Regression test.

    **Terminal Gate** (Do not skip; must complete before step_5 output):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi render` | `.md` views generated |

    **Output**: plan.json with fix tasks appended.
</step_2_plan_fix>

<step_3_execute_fix>
    **Role**: Senior Engineer (Surgical Fix — bug only, no scope creep)
    **Action**:
    - Modify code directly according to Plan.
    - Fix Bug only; prohibited from opportunistic refactoring or modifying unrelated code.
    - Error handling follows `code.md` specs (no swallowing errors/no silent failures).
</step_3_execute_fix>

<step_4_verify>
    **Role**: QA Engineer
    **Terminal Gate** (Do not skip; must complete before step_5 output):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | Run build command | Build succeeds |
    | 2 | Run type check | Zero type errors |
    | 3 | Run Lint/Format | Pass |
    | 4 | Run tests | Reproduction + regression tests pass |

    Any failure must be fixed until passed.
</step_4_verify>

<step_4_5_plan_update>
    **Role**: Tech Lead
    **Action**:
    1. Update `plan.json`: set `done: true` for completed tasks in the Bugfix Phase.
    2. [current status=`done` and all Bugfix Phase tasks passed] → Keep status as `done`.
    3. [Bugfix Phase has unresolved tasks] → Run `npx archi task <ID> --status active`; note in signoff that `/archi.code` is needed to complete remaining fixes.

    **Output**: `MODIFIED: plan.json Bugfix Phase done marks` (if status changed, append `MODIFIED: roadmap.json <ID>.status`).
</step_4_5_plan_update>

<step_5_summary>
    **Output**: Bug fix summary with Root Cause analysis, fix content, new tests, and Next Steps table:

    | Priority | Action | Notes |
    |:---|:---|:---|
    | Recommended | `/archi.audit <ID>` | Re-audit to confirm fix is complete and no new issues introduced |
    | Optional | `/archi.code <ID>` | If Bugfix Phase has remaining incomplete tasks |
</step_5_summary>

</protocol_fix>

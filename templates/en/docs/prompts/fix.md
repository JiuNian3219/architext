<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>` | Auto-loaded by Workflow Dispatch on natural language trigger
  **Goal**: Diagnose and fix bugs. If `[id]` not provided, auto-locate related feature module by context.

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>English</language>
    <principles>
      1.  **Spec Immutable**: Do not modify `spec.md` / `ui.md` (unless the bug is a doc error).
      2.  **Reproduction**: Must have reproduction steps or test case first.
      3.  **Root Cause**: Must analyze root cause, not patch surface.
      4.  **Test-Driven**: Fix plan must include new test cases.
      5.  **Auto-Discovery**: If ID not specified, locate Task via context semantic search.
      6.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints, not fight IDE planning/execution mechanisms.
    </principles>
</meta>

<step_1_diagnose>
    **Role**: Failure Analyst
    **Action**:
    1.  **Resolve Target**:
        - With `<id>`: Lock `tasks/<ID>_<Slug>/`.
        - Without `<id>`: Analyze `[context]` to find most relevant module.
          Single match → auto lock | Multiple matches → list candidates and ask | Cannot locate → error, request ID.
    2.  Read all docs and related code in target directory.
    3.  Read 02_tech_stack.md (tech red lines) and vision.md (direction anchor).
    4.  Analyze `[context]` with code logic to locate potential fault points.
    5.  **Hypothesis**: Propose 1–3 root cause hypotheses.

    **Output**: Fault diagnosis report (Root Cause Analysis).
</step_1_diagnose>

<step_2_plan_fix>
    **Action**:
    - Update plan.json; append phase `Bugfix: <Bug Title>`.
    - Tasks: 1) Create reproduction test (Red) 2) Fix (Green) 3) Regression test.

    **Terminal Gate** (do not skip): Standard check (task --check + render).

    **Output**: plan.json with fix tasks appended.
</step_2_plan_fix>

<step_3_execute_fix>
    **Action**:
    - Modify code per Plan. Fix bug only; do not refactor.
    - Error handling follows `code.md` protocol.
</step_3_execute_fix>

<step_4_verify>
    **Terminal Gate** (do not skip):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | Run build command | Build success |
    | 2 | Run type check | Zero type errors |
    | 3 | Run Lint/Format | Pass |
    | 4 | Run tests | Reproduction test + regression test pass |

    Fix any failure until pass.

    **Code quality review**:
    [[SUBAGENT: archi-silent-audit|mode: code-impl, context: Review fix code; focus Tech/Security/Performance + Spec Immutable]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: code-impl check)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_plan_update>
    **Action**:
    1. Update plan.json Bugfix Phase completed tasks `done: true`.
    2. [status=`done` and Bugfix all pass] → keep `done`.
    3. [Bugfix has incomplete items] → `npx archi task <ID> --status active`; signoff note to re-run `/archi.code`.

    **Output**: `MODIFIED: plan.json Bugfix Phase done flags`. Enter step_6_summary.
</step_5_plan_update>

<step_6_summary>
    **Output**: Bug fix summary with Root Cause analysis, fix content, new tests, and Next Steps table:

    | Priority | Action | Notes |
    |:---|:---|:---|
    | Recommended | `/archi.audit <ID>` | Re-audit to confirm fix complete |
    | Optional | `/archi.code <ID>` | If incomplete items, continue implementation |
</step_5_summary>

</protocol_fix>

<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: Diagnose Bug and execute fix directly. If `[id]` not provided, auto-locate relevant feature module.

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>English</language>
    <principles>
      1.  **Spec Immutable**: Prohibited from modifying `spec.md` / `ui.md` (unless Bug itself is a documentation error).
      2.  **Reproduction**: Must conceive reproduction steps or test cases first.
      3.  **Root Cause**: Must analyze root cause, not patch the surface.
      4.  **Test-Driven**: Fix plan must include new test cases.
      5.  **Auto-Discovery**: If ID not specified, locate Feature via Context semantic search.
    </principles>
</meta>

<step_1_diagnose>
    **Role**: Fault Analyst
    **Action**:
    1.  **Resolve Target**:
        - Has `<id>`: Lock target `features/<ID>_<Slug>/`.
        - No `<id>`: Analyze `[context]` to search most relevant module.
          Unique match → Auto lock | Multiple matches → List candidates and ask | Cannot locate → Report error requesting ID.
    2.  Read all docs under target directory (`spec.md`, `ui.md`, `plan.json`) and related code.
    3.  Analyze `[context]`, combine with code logic to locate potential failure points.
    4.  **Hypothesis**: Propose 1-3 root cause hypotheses.

    **Output**: Root Cause Analysis report.
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: Tech Lead
    **Action**:
    - Update `[[__DOCS_DIR__]]/features/<ID>_<Slug>/plan.json`, append to `phases` array a phase object with `name`: `Bugfix: <Bug Title>`.
    - Tasks: 1) Create reproduction test (Red) 2) Apply fix (Green) 3) Regression test.

    **Output**: plan.json with fix tasks appended. Run `npx archi render` to regenerate visual `.md` files.
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
    **Action**: Execute same validation flow as `/archi.code`:

    | Check Item | Requirement |
    |:---|:---|
    | **Build** | Build succeeds |
    | **Type Check** | Zero type errors |
    | **Lint/Format** | Pass Lint and Format |
    | **Test** | Reproduction test + regression test pass |

    Any failure must be fixed until passed.
</step_4_verify>

<step_5_summary>
    **Output**: Bug fix summary with Root Cause analysis, fix content, new tests, Next Steps table.
</step_5_summary>

</protocol_fix>

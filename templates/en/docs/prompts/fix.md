<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: Diagnose specific module Bug (`[context]`) and **execute fix directly** without modifying Spec. If `[id]` is not provided, AI should try to auto-locate relevant feature module.

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>English</language>
    <principles>
      1.  **Spec Immutable**: Strictly prohibited from modifying `1.spec.md` or `2.ui.md` (unless the Bug itself is a documentation error).
      2.  **Reproduction**: Must conceive reproduction steps or test cases first.
      3.  **Root Cause**: Must analyze root cause, not just patch the surface.
      4.  **Test-Driven**: Fix plan must include adding test cases (Unit/Integration).
      5.  **Auto-Discovery**: If user doesn't specify ID, prioritize Context semantic search to locate Feature.
    </principles>
</meta>

<step_1_diagnose>
    **Role**: Detective (Debugger)
    **Action**:
    1.  **Resolve Target**:
        - If `<id>` provided: Lock target `features/<id>_<name>/`.
        - If `<id>` not provided: Analyze `[context]` and search for most relevant feature module in `features/` directory.
          - ➡️ Found unique match: Auto lock.
          - ➡️ Found multiple matches: List candidates and ask user.
          - ➡️ Cannot locate: Report error and ask user to specify ID.
    2.  Read all documents under target directory (`1.spec.md`, `2.ui.md`, `3.plan.md`) and relevant code.
    3.  Analyze `[context]` description, combine with code logic to locate potential failure points.
    4.  **Hypothesis**: Propose 1-3 possible root cause hypotheses.

    **Output**: Root Cause Analysis report.
    **Bridge**: "Root cause locked (Feature: <Name>), formulating surgical fix plan..."
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: Doctor
    **Action**:
    - Update `[[__DOCS_DIR__]]/features/<id>_<name>/3.plan.md`.
    - Append `### Bugfix: <Bug Title>` section.
    - **Tasks**:
      1.  Create Reproduction Test Case (Red).
      2.  Apply Fix (Green).
      3.  Regression Test.
    
    **Output**: `3.plan.md` with fix tasks appended.
</step_2_plan_fix>

<step_3_draft_patch>
    **Role**: Senior Engineer
    **Action**:
    - Although not executing directly (handled by `/archi.code`), provide concrete **Code Suggestion** or **Patch Preview** in this step.
    - Show concrete code modification ideas (Diff format).

    **Output**: Fix Code Preview (Preview).
</step_3_draft_patch>

<step_3_execute_fix>
    **Role**: Surgeon
    **Action**:
    - **Apply Fix**: Modify code directly according to Plan.
    - **Constraint**: Fix Bug only, **Prohibit** refactoring or modifying unrelated code.
    - **Error Handling**: Ensure fix code follows error handling specs in `code.md` (No swallowing errors/No printing logs only and continuing).
</step_3_execute_fix>

<step_4_verify>
    **Role**: Tester
    **Action**:
    - **Protocol Check**: Execute same **Validate** steps as `/archi.code`.
    - **Step 1: Build Check**: Build project.
    - **Step 2: Type Check**: Must pass type check.
    - **Step 3: Lint/Format**: Must pass Lint and Format.
    - **Step 4: Test**: Run reproduction test and regression test.
    
    **Rule**: Any validation failure must not mark task as complete; must rollback or fix until passed.
</step_4_verify>

<step_5_summary>
    **Action**: Summarize fix results and output clear next steps.

    **Output Template**:
    ```markdown
    ## ✅ Bug Fixed

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Bug Description**: `<Brief description>`

    ### 🐛 Diagnosis (根因分析)
    **Root Cause**: [Root Cause Analysis]
    **Impact**: [Impact Scope]

    ### ✅ Fix Applied
    * **Files Modified**: 
      * `src/...` (Brief description of fix)
      * `tests/...` (Added test cases)
    * **Plan Updated**: `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md` (Fix tasks appended)

    ### 🧪 Verification Results
    * ✅ Reproduction Test: Passed
    * ✅ Regression Test: Passed
    * ✅ Lint/Type Check: Passed
    * ✅ Build: Passed

    ---

    ### 🧭 Next Steps (下一步操作)

    | Scenario | Recommended Action | Explanation |
    |:---|:---|:---|
    | **Continue Development** | `/archi.code <ID>` | If there are unfinished feature development tasks |
    | **Test Verification** | Run full test suite | Ensure fix introduced no regression issues |
    | **Found New Bug** | `/archi.fix <ID> [bug description]` | If there are other issues to fix |
    | **Requirement Change** | `/archi.edit <ID> [change description]` | If feature requirements need adjustment |
    | **View Help** | `/archi.help` | Show full command manual |

    > 💡 **Recommendation**: 
    > - If fix is complete and verification passed, you can continue running `/archi.code <ID>` to complete other development tasks.
    > - Recommend running full test suite to ensure no regression introduced.
    ```
</step_5_summary>

</protocol_fix>

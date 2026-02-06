<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]`
  **Goal**: Based on user's new requirements or feedback (`[context]`), update the Spec and UI documentation of an already managed module (`<id>`), and append corresponding development plans.

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>English</language>
    <principles>
      1.  **Doc First**: Must modify documentation (Spec/UI) first, then generate Plan. Strictly prohibited to skip docs and change code plans directly.
      2.  **Incremental**: Only append new Tasks to `3.plan.md`, keep completed historical tasks (unless rollback is needed).
      3.  **Conflict Check**: Check if new requirements conflict with `02_tech_stack` or `03_design_tokens`.
      4.  **Frontmatter Preservation**: Strictly prohibited from destroying existing document Metadata.
    </principles>
</meta>

<step_1_load>
    **Role**: Product Manager
    **Action**:
    - Read `[[__DOCS_DIR__]]/features/<id>_<name>/1.spec.md`.
    - Read `[[__DOCS_DIR__]]/features/<id>_<name>/2.ui.md`.
    - Read `[[__DOCS_DIR__]]/features/<id>_<name>/3.plan.md`.
    - **Benchmark Check** (If involving major UX changes): Quickly search for best practices of similar products to avoid reinventing the wheel.
    
    **Bridge**: "Docs loaded, analyzing impact of requirement changes..."
</step_1_load>

<step_2_refine_docs>
    **Role**: Requirements Analyst & Designer
    **Action**:
    - Modify `1.spec.md` (Logic/Rule changes) based on `[context]`.
    - Modify `2.ui.md` (Interface/Interaction changes) based on `[context]`.
      - **Designer Mode**: If modifying UI, please introduce Designer perspective, ensuring aesthetics and compliance with `03_design_tokens`.
    - **Interaction**: If requirements are vague, ask user questions (A/B/C/D/E options) to confirm details.
    
    **Output**: Updated Spec and UI documentation.
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - Append a new "Change Request" task block in `3.plan.md`.
    - **Format**:
      - Use `### Phase X: Change Request (<Date>)` header.
      - List specific Implementation Tasks (API update, UI tweak, Test update).
      - Each task must be verifiable.
    
    **Output**: `3.plan.md` with new tasks appended.
</step_3_update_plan>

<step_4_summary>
    **Action**: Confirm changes and output clear next steps.

    **Output Template**:
    ```markdown
    ## ✅ Feature Updated

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Change Type**: [Spec Change / UI Change / Both]

    ### 📝 Docs Updated
    * **Spec Changes**: [Summarize main logic changes]
    * **UI Changes**: [Summarize main interface changes] (If applicable)

    ### 📅 Plan Appended
    * Added **N** development tasks to `3.plan.md`
    * Task Types: [API Update / UI Tweak / Test Update / ...]

    ### 📂 Files Modified
    * `[[__DOCS_DIR__]]/features/<ID>_<Name>/1.spec.md` (Updated)
    * `[[__DOCS_DIR__]]/features/<ID>_<Name>/2.ui.md` (Updated, if applicable)
    * `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md` (New tasks appended)

    ---

    ### 🧭 Next Steps (下一步操作)

    | Scenario | Recommended Action | Explanation |
    |:---|:---|:---|
    | **Implement Changes** | `/archi.code <ID>` | Start implementing added development tasks |
    | **Continue Modifying** | `/archi.edit <ID> [New change description]` | If there are other requirement changes |
    | **View Plan** | Check `3.plan.md` | Confirm if new tasks meet expectations |
    | **View Help** | `/archi.help` | Show full command manual |

    > 💡 **Recommendation**: Run `/archi.code <ID>` to start implementing changes.
    ```
</step_4_summary>

</protocol_edit>

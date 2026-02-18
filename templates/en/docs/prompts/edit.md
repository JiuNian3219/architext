<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]`
  **Goal**: Based on new requirements/feedback, update Spec/UI docs of an already managed module and append development plans.

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>English</language>
    <principles>
      1.  **Doc First**: Must modify docs (Spec/UI) first, then generate Plan. Prohibited from skipping docs to change code plans directly.
      2.  **Incremental**: Only append new Tasks to plan.md, keep completed history (unless rollback needed).
      3.  **Conflict Check**: Check if new requirements conflict with tech_stack / design_tokens.
      4.  **Frontmatter Preservation**: Prohibited from destroying existing document Metadata.
    </principles>
</meta>

<step_1_load>
    **Role**: Product Manager
    **Action**:
    - Read `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` spec.md, ui.md, plan.json.
    - [?Major UX Change] Quick search for similar product best practices.
</step_1_load>

<step_2_refine_docs>
    **Role**: Requirements Analyst & Designer
    **Action**:
    - Modify spec.md (logic/rule changes) and ui.md (interface/interaction changes) based on `[context]`.
    - [?UI Modification] Introduce designer perspective, ensure compliance with design_tokens.
    - Ask user questions (A/B/C/D options) to confirm details when requirements are vague.

    **Output**: Updated Spec and UI documents.
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - Append new phase to `plan.json` phases array: `Phase X: Change Request (<Date>)`.
    - List specific Tasks (API update, UI tweak, Test update); each must be verifiable.

    **Output**: plan.json with new tasks appended. Run `npx archi render` to regenerate visual `.md` files.
</step_3_update_plan>

<step_4_summary>
    **Output**: Feature update summary with Spec/UI/Plan change overview and Next Steps table. Recommend running `/archi.code <ID>`.
</step_4_summary>

</protocol_edit>

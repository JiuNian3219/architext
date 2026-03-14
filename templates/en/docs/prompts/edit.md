<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]` | Auto-loaded by Workflow Dispatch on natural language trigger
  **Goal**: Update managed module's Spec/UI docs per new requirements/feedback, and append development plan.

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>English</language>
    <principles>
      1.  **Doc First**: Must modify docs (Spec/UI) first, then generate Plan. Do not skip docs to change code plan.
      2.  **Incremental**: Only append new Tasks to Plan; keep completed history (unless rollback needed).
      3.  **Conflict Check**: Check if new requirements conflict with tech_stack / design_tokens.
      4.  **Frontmatter Preservation**: Do not break existing document Metadata.
      5.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints, not fight IDE planning/execution mechanisms.
    </principles>
</meta>

<step_1_load>
    **Action**:
    - Read spec.md, ui.md, plan.json under `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/`.
    - (UI projects only) Read ui_context.md (locate screen scope and navigation for this feature).
    - Check `Spec-Status` in spec.md: `Full` → normal flow step_2 | `Stub` → step_1_5_enrich.
    - (Major UX change) Quick search for similar product best practices.
</step_1_load>

<step_1_5_enrich>
    **Trigger**: spec.md contains `Spec-Status: Stub` (lightweight snapshot from `/archi.inherit`).

    **Action**:
    1. Inform user: "This task has only a lightweight snapshot; must complete full spec before modification."
    2. Extract source paths from stub "Associated Files"; read each (entry + core logic).
    3. Enrich into full spec from code analysis: keep existing overview and flows; add Gherkin Scenarios + interface/type definitions.
    4. Update `Spec-Status: Stub → Full`.
    5. (UI projects only) If module has UI → generate `ui.md`; if new screens needed, [[SKILL: archi-ui-wireframe|invoke skill]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md`)]].
    6. Generate `plan.json` (all tasks done).
    7. Output enriched spec summary to user.

    **Gate**: Proceed to step_2_refine_docs after user confirms.
    **Exception**: Associated files missing/moved → prompt user to update paths.
</step_1_5_enrich>

<step_2_refine_docs>
    **Action**:
    - Modify spec.md and ui.md per `[context]`.
    - (UI modified) [[SKILL: archi-ui-wireframe|Follow the skill protocol to sync `screens/S-XX.html` + `ui_context.md`]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md`)]]:

      | Change Type | Criteria | Handling |
      |:---|:---|:---|
      | No screen impact | Logic/data change only | Update spec.md only |
      | Minor UI tweak | New/modified state, popup, local area | Call skill to update; output `MODIFIED: screens/S-XX.html` |
      | Screen structure change | Layout refactor, new screen, navigation change | Call skill to update |
      | Task reduction | Screen/region removed entirely | Call skill to remove; output `REMOVED: screens/S-XX.html` |

    - Ask user when requirements are vague.

    **Output**: Updated docs and change summary.
</step_2_refine_docs>

<step_3_update_plan>
    **Action**:
    - Append new Phase to `plan.json` with specific Tasks; each must be verifiable.
    - **Status transition**: When status=`done`, after appending Phase must reset to `active`.

    **Terminal Gate** (do not skip): Standard check (task --check + render).
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 3 | [when status=done] `npx archi task <ID> --status active` | Status reset |

    **Output**: plan.json with new tasks appended; if status transition performed, output `MODIFIED: roadmap.json <ID>.status done→active`. Enter step_4_verify.
</step_3_update_plan>

<step_4_verify>
    **Role**: Independent Reviewer

    [[SUBAGENT: archi-silent-audit|mode: plan-docs, context: Review step_2 updated spec.md/ui.md and step_3 appended plan.json new Phase]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: plan-docs review)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_summary>
    **Pre-signoff Checklist** (confirm each item before Output):
    □ spec.md — updated per context, changes tracked
    □ (if UI changed) ui.md + screens/S-XX.html + ui_context.md — synced
    □ plan.json — new Phase appended (history tasks fully preserved)
    □ (if original status=done) roadmap.json — status reset to active
    □ Step 4 Silent Audit — executed, all CRITICAL issues resolved
    □ Terminal Gate — task --check no ERROR (executed in step_3)

    **Action** (Gate must complete in step_3):
    **Output**: Task update summary with Spec/UI/Plan change overview and Next Steps table. Recommend running `/archi.code <ID>`.
</step_5_summary>

</protocol_edit>

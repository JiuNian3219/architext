<protocol_change_revise>
**Trigger**: Router prompts/change.md dispatch (/archi.change [global-context] no ID and context points to global)
**Goal**: Execute project-level global changes (tech stack, architecture, vision, etc.), analyze impact scope, modify global assets after user confirmation and cascade update affected Task docs.

<meta>
  <style>Strategic, Analytical, Cautious, Traceable</style>
  <language>English</language>
  <principles>
    User Gate: Global changes must be confirmed by user item by item before execution. Do not modify without authorization.
    Impact First: Output complete impact analysis first, then execute modifications.
    Doc Cascade: After global asset changes, must sync update affected Tasks per task-doc-cascade standard.
    Traceability: Each change must be traceable (state change reason and impact scope).
    No Re-routing: If discovered change actually only affects single Task → Prompt to use edit sub-protocol; sub-protocol cannot auto-switch.
  </principles>
</meta>

<step_1_load>
1. Load all global assets: vision / roadmap / map / dictionary / error_codes / tech_stack / env_registry.
[[WHEN: ui | Load design_tokens.json + ui_context.md.]]
[[WHEN: data | Load data_snapshot.json.]]
[[WHEN: api | Load api_snapshot.json.]]
[[WHEN: cli | Load command_api.json.]]
[[WHEN: lib | Load public_api.json.]]
2. Scan tasks/ directory, build Task index (ID / name / status).
3. Based on [context], preliminarily locate affected global asset categories.

Output change intent summary — list preliminarily identified global files.
</step_1_load>

<step_2_interview>
Based on user description and loaded context, clarify change boundaries:

| Clarification Dimension | Description |
|---|---|
| Change Scope | Precisely identify which global files, which rules are affected |
| Change Motivation | Why make this change, what result is expected |
| Exclusion List | Are there Tasks that should not be affected |
| Single Task Check | Does user description actually only affect single Task (if yes → prompt to use edit) |

- When context is clear enough → Merge to step_3 to directly output impact analysis.
- When ambiguities or multiple feasible directions exist → Ask user to confirm (A/B/C/D options).
</step_2_interview>

<step_3_impact>
**Output only, do not modify any files**. This step is "Change Impact Assessment".

Output includes:
- Global asset change list table (file / change content / type)
- Affected Task list table (ID / name / impact point / degree [HIGH/MEDIUM/LOW])
- Items requiring user decision (if any)
- End confirmation guide: OK confirm all / Adjust <specific item> / Cancel

**Gate**: Wait for user confirmation. Cannot enter step_4 without confirmation.
</step_3_impact>

<step_3_5_refinement>
**Trigger**: User reply is not OK, contains corrections, rejections or additions.
Do not execute modifications. Incorporate user feedback, refresh impact assessment and re-output, wait for re-confirmation.
User replies OK → Enter step_4.
</step_3_5_refinement>

<step_4_execute>
**Safety Checkpoint** (Must complete before execution):
1. Check Git working directory status (suggest git status).
2. If uncommitted changes exist → Prompt user to commit or stash first.
3. After working directory is clean, inform: if rollback needed, can execute git checkout -- .

**Phase 1 — Modify Global Assets**: Modify global files per user-confirmed list. Output change summary after each file modification.

[[WHEN: ui |
**Phase 1.5 — Design System Change Check**:
If design_tokens.json has the following changes, must notify user to re-run /archi.ui to regenerate:

| Change Scope | Impact |
|---|---|
| primitivePalette.brand / semanticTokens.colors | Brand color / semantic color changes |
| semanticTokens.typography | Font changes |
| motion.preference / motion.patterns | Animation changes |
| illustration.iconLibrary | Icon library changes |
| layout (radius/spacing/shadow) | Component size/border radius changes |

If above fields unchanged (e.g., only mode.default changed), no need to re-run.
]]

**Phase 2 — Cascade Update Task Docs**: For each affected Task apply:
[[INCLUDE: prompts/change/shared/task-doc-cascade.md]]
</step_4_execute>

<step_5_data_sync>
[[INCLUDE: prompts/change/shared/data-sync-trigger.md]]
</step_5_data_sync>

<step_6_verify>
[[SUBAGENT: archi-silent-audit | mode: plan-docs, context: Review consistency between step_4 Phase 2 cascade-updated Task docs and modified global assets]]
[[NO-SUBAGENT: archi-silent-audit | mode: plan-docs, context: Review consistency between step_4 Phase 2 cascade-updated Task docs and modified global assets]]
[[NO-SKILL: (Please read [[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md, and check in current context per mode: plan-docs)]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_summary>
**Pre-signoff Checklist** (After Gate passes, must confirm each item before output):
□ Safety Checkpoint — Git working directory confirmed (no uncommitted changes or user informed)
□ Phase 1 required files modified: roadmap.json + vision.md + tech_stack.md + map.json + dictionary.json + error_codes.json + env_registry.json
[[WHEN: ui | □ design_tokens.json + ui_context.md modified (if involved) ]]
[[WHEN: data | □ data_snapshot.json modified (if involved) ]]
[[WHEN: api | □ api_snapshot.json modified (if involved) ]]
[[WHEN: cli | □ command_api.json modified (if involved) ]]
[[WHEN: lib | □ public_api.json modified (if involved) ]]
[[WHEN: ui | □ When design system changed, notified user to re-run /archi.ui ]]
□ Phase 2 — Each affected Task's spec.md updated + plan.json appended Revision Phase
□ archi-data-sync executed
□ silent-audit (mode: plan-docs) executed, CRITICAL fixed
□ Consistency confirmed: vision ↔ tech_stack ↔ roadmap ↔ map no orphan references (old terminology/paths cleaned)

**Terminal Gate** (Cannot skip): Standard check (task --check + render).

Output Global Revision Summary (global asset changed file list / Task update list and impact summary / review results) + Next Steps:

| Priority | Action | Description |
|---|---|---|
| Recommended | /archi.code <affected ID> | Re-code affected Tasks per cascade-updated plan |
| Optional | /archi.review <affected ID> | Review change implementation after coding |
[[WHEN: ui | | Recommended (design system change) | /archi.ui | Regenerate screen set | ]]
</step_7_summary>

</protocol_change_revise>
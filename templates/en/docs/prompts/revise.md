<protocol_revise>
  **Trigger**: `/archi.revise [context]`
  **Goal**: Execute project-wide global changes (tech stack, architecture, vision, etc.); analyze impact scope; modify global assets after user confirmation and cascade update affected Task docs.

<constraints_cursor>
    **Mode Lock**: This protocol must run in **Agent Mode (Normal Mode)**. Do not switch to Plan Mode or other read-only modes.
</constraints_cursor>

<meta>
    <style>Strategic, Analytical, Cautious, Traceable</style>
    <language>English</language>
    <principles>
      1.  **User Gate**: Global changes require item-by-item user confirmation before execution. Do not modify without approval.
      2.  **Impact First**: Output complete impact analysis before making changes.
      3.  **Doc Cascade**: After global asset changes, must sync affected Task docs per edit standards.
      4.  **Traceability**: Every change must be traceable — state rationale and impact scope.
    </principles>
</meta>

<step_1_load>
    **Action**:
    1.  **Load**: All global assets (vision/roadmap/map/dictionary/error_codes/tech_stack + conditional: design_tokens/data_snapshot).
    2.  **Scan Task Index**: Scan tasks/ directory; build Task index (ID, name, status).
    3.  **Intent Analysis**: From `[context]`, identify affected global asset categories.

    **Output**: Change intent summary — list initially identified global files; proceed to step_2.
</step_1_load>

<step_2_interview>
    **Role**: Chief Architect
    **Action**:
    Clarify change boundaries from user description and loaded context:

    | Dimension | Description |
    |:---|:---|
    | Change scope | Precisely identify which global files and rules are affected |
    | Change motivation | Why this change; expected outcome |
    | Exclusion list | Any Tasks that should not be affected |

    - When context is clear enough → merge into step_3 and output impact analysis directly.
    - When ambiguity or multiple viable directions → ask user to confirm (A/B/C/D options).
</step_2_interview>

<step_3_impact>
    **Constraint**: **Output only; do not modify any files**. This step produces the "Change Impact Assessment".

    **Output**: Change impact assessment — global asset change list table (file/change content/type), affected Task list table (ID/name/impact points/severity), user decision items (if any). End with confirmation: OK to confirm all; or annotate adjustments.

    **Gate**: Wait for user confirmation. Do not enter step_4 without confirmation.
</step_3_impact>

<step_3_5_refinement>
    **Trigger**: User reply is not OK — contains corrections, rejections, or additional input.
    **Action**: Do not execute changes. Incorporate feedback, refresh impact assessment and re-output; await re-confirmation.
</step_3_5_refinement>

<step_4_execute>
    **Action**:

    **Safety Checkpoint** (must complete before execution):
    1. Check Git working directory status (run `git status`).
    2. If uncommitted changes exist → prompt user to commit or stash first.
    3. Once working directory clean, inform user: to rollback, run `git checkout -- .`.

    **Phase 1 — Modify global assets**:
    Modify global files per user-confirmed list. Output change summary for each file.

    **(UI projects only) Phase 1.5 — Design system change check**:
    If `design_tokens.json` has the following changes, notify user to re-run `archi-ui-wireframe` to regenerate:

    | Change scope | Impact |
    |:---|:---|
    | `primitivePalette.brand` / `semanticTokens.colors` | Brand/semantic color change |
    | `semanticTokens.typography` | Font change |
    | `motion.preference` / `motion.patterns` | Motion change |
    | `illustration.iconLibrary` | Icon library change |
    | `layout` (radius/spacing/shadow) | Component size/radius change |

    > If above fields unchanged (e.g. only `mode.default` changed), no need to re-run.

    **Phase 2 — Cascade update Task docs**:
    For each affected Task, follow `/archi.edit` standards:
    1.  Update `spec.md`.
    2.  (UI projects only) Update `ui.md`; if screen structure affected, [[SKILL: archi-ui-wireframe|run skill (local update mode) to sync]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` and follow its protocol)]].
    3.  Append new Phase to `plan.json`: `Phase X: Global Revision — [Change Topic] (<Date>)`.

    **Output**: Change summary for each file (global + Task). Enter step_5_verify.
</step_4_execute>

<step_5_verify>
    **Role**: Independent Reviewer

    [[SUBAGENT: archi-silent-audit|mode: plan-docs, context: Review step_4 Phase 2 cascade-updated Task docs for alignment with modified global assets]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: plan-docs review dimension table)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_5_verify>

<step_6_summary>
    **Role**: Chief Auditor

    **Pre-signoff Checklist** (confirm each item after Gate passes, before Output):
    □ step_4 Safety Checkpoint — Git workspace confirmed (no uncommitted changes or user informed)
    □ Phase 1 — all confirmed global assets modified, change summary output per file
    □ Phase 1 — Global files check:
      - roadmap.json + vision.md + tech_stack.md + map.json — required
      - dictionary.json + error_codes.json + env_registry.json — required
      - (UI projects only) design_tokens.json + ui_context.md
      - (Data projects only) data_snapshot.json
      - (API projects only) api_snapshot.json
      - (CLI projects only) command_api.json
      - (Lib projects only) public_api.json
    □ (UI projects only, design system changed) User notified to re-run `/archi.ui`
    □ Phase 2 — each affected Task: spec.md updated + plan.json appended Revision Phase
    □ Step 5 Silent Audit — executed, all CRITICAL issues resolved
    □ Consistency confirmed: vision ↔ tech_stack ↔ roadmap ↔ map, no orphan refs (stale terms/paths cleaned)

    **Terminal Gate** (do not skip): Standard check (task --check + render).

    **Action** (after Gate passes):
    1.  Output change summary.

    **Output**: Global Revision Summary — global asset changed files list, Task update list and impact summary, audit result, Next Steps table.
</step_5_summary>

</protocol_revise>

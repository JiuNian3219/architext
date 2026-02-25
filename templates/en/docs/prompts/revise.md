<protocol_revise>
  **Trigger**: `/archi.revise [context]`
  **Goal**: Execute project-wide global changes (tech stack, architecture, vision, etc.), analyze impact scope, modify global assets after user confirmation, and cascade updates to affected Feature documents.

<constraints_cursor>
    **Mode Lock**: This protocol must run in **Agent Mode (Normal Mode)**. Prohibited from switching to Plan Mode or other read-only modes.
</constraints_cursor>

<meta>
    <style>Strategic, Analytical, Cautious, Traceable</style>
    <language>English</language>
    <principles>
      1.  **User Gate**: Global changes require item-by-item user confirmation before execution. Prohibited from modifying without approval.
      2.  **Impact First**: Output complete impact analysis before making any changes.
      3.  **Doc Cascade**: After global asset changes, must update affected Feature docs following edit protocol standards.
      4.  **Traceability**: Every change must be traceable — state rationale and impact scope.
    </principles>
</meta>

<step_1_load>
    **Role**: Systems Analyst
    **Action**:
    1.  **Read Global Assets**:
        - `[[__DOCS_DIR__]]/global/vision.md`
        - `[[__DOCS_DIR__]]/global/roadmap.json`
        - `[[__DOCS_DIR__]]/global/map.json`
        - `[[__DOCS_DIR__]]/global/dictionary.json`
        - `[[__DOCS_DIR__]]/global/error_codes.json`
        - `02_tech_stack.md`
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`
    2.  **Scan Feature Index**: Scan `[[__DOCS_DIR__]]/features/` directory, build Feature index (ID, name, status).
    3.  **Intent Analysis**: Based on user `[context]`, identify which global asset categories are affected.

    **Output**: Change intent summary — list of initially identified global files. Proceed to step_2.
</step_1_load>

<step_2_interview>
    **Role**: Chief Architect
    **Action**:
    Clarify change boundaries based on user description and loaded context:

    | Dimension | Description |
    |:---|:---|
    | Change Scope | Precisely identify which global files and rules are affected |
    | Change Motivation | Why this change is needed, what outcome is expected |
    | Exclusion List | Any Features that should not be affected |

    - Context is clear enough → merge into step_3 and output impact analysis directly.
    - Ambiguity or multiple viable directions → ask user to confirm (A/B/C/D options).
</step_2_interview>

<step_3_impact>
    **Role**: Impact Analyst
    **Constraint**: **Output only, prohibited from modifying any files**. This step produces the "Change Impact Assessment".

    **Output Format**:
    ```
    ## Change Impact Assessment: [Change Topic]

    ### 1. Global Asset Change List
    | File | Change Content | Type |
    |:---|:---|:---|
    | vision.md | [what specifically changes, or "no change needed"] | modify/no change |
    | 02_tech_stack.md | [...] | ... |
    | roadmap.json | [...] | ... |
    | map.json | [...] | ... |
    | dictionary.json | [...] | ... |
    | data_snapshot.json | [...] | ... |
    | design_tokens.json | [...] | ... |
    | error_codes.json | [...] | ... |

    ### 2. Affected Features List
    | Feature ID | Name | Impact Points | Severity |
    |:---|:---|:---|:---|
    | INF-001 | [name] | [which parts of spec/ui/plan are affected] | High/Med/Low |

    ### 3. Items Requiring User Decision (if any)
    - [?] [uncertain item description + options]
    - [?] ...

    ---
    > Reply **OK** to confirm all; or annotate items that need adjustment.
    ```

    **Gate**: Wait for user confirmation. Prohibited from entering step_4 without confirmation.
</step_3_impact>

<step_3_5_refinement>
    **Role**: Consultant
    **Trigger**: User replies non-OK, contains corrections, rejections, or additional input.
    **Action**: Do not execute changes. Incorporate user feedback, refresh and re-output the impact assessment. Wait for re-confirmation.
</step_3_5_refinement>

<step_4_execute>
    **Role**: Execution Engineer
    **Action**:

    **Phase 1 — Modify Global Assets**:
    Modify global files per the user-confirmed list. Output change summary for each file.

    **[?UI] Phase 1.5 — Design System Change Check**:
    If `design_tokens.json` has any of the following changes, notify the user after Phase 2:

    | Change scope | Impact | Action |
    |:---|:---|:---|
    | `primitivePalette.brand` / `semanticTokens.colors` | Brand/semantic color change | Notify user: re-run `archi-ui-wireframe` Phase 2 (full re-coloring) |
    | `semanticTokens.typography` | Font change | Notify user: re-run Phase 2 |
    | `motion.preference` / `motion.patterns` | Motion change | Notify user: re-run Phase 2 |
    | `illustration.iconLibrary` | Icon library change | Notify user: re-run Phase 2 |
    | `layout` (radius/spacing/shadow) | Component size/radius change | Notify user: re-run Phase 2 |

    > If none of the above fields changed (e.g., only `mode.default` changed), Phase 2 re-run is not needed.

    **Phase 2 — Cascade Update Feature Docs**:
    For each affected Feature, follow `/archi.edit` standards:
    1.  Update `spec.md` (logic/rules that need adjustment due to global changes).
    2.  [?UI] Update `ui.md` (scope/interaction adjustments due to global changes); if `ui_concept.html` screen structure is affected, sync the relevant screens (run `archi-ui-wireframe` Skill in incremental update mode).
    3.  Append new Phase to `plan.json` `phases`: `Phase X: Global Revision — [Change Topic] (<Date>)`, listing implementation tasks.

    **Output**: Change summary for each file (global + Feature).
</step_4_execute>

<step_5_summary>
    **Role**: Auditor
    **Checklist**:
    1.  Cross-consistency between global assets (vision ↔ tech_stack ↔ roadmap ↔ map).
    2.  Feature docs aligned with updated global assets.
    3.  No orphaned references (stale terms/paths in dictionary/map cleaned up).

    **Terminal Gate** (Do not skip; must complete before output summary):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | No ERROR-level issues |
    | 2 | `npx archi render` | `.md` views generated |

    **Action** (After Gate passes):
    1.  Output change summary.

    **Output**:
    ```
    ## Global Revision Summary: [Change Topic]

    **Global Assets Modified**: [list of modified files]
    **Features Updated**: [list of updated Features + impact summary each]
    **Audit Result**: [pass/risk items]

    ### Next Steps
    | Priority | Action | Description |
    |:---|:---|:---|
    | ... | ... | ... |
    ```
</step_5_summary>

</protocol_revise>

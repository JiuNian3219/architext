<protocol_remove>
  **Trigger**: `/archi.remove <id>`
  **Goal**: Decommission the specified Task from the project — delete docs, code, global refs; ensure zero residue.

<meta>
    <style>Surgical, Cautious, Thorough</style>
    <language>English</language>
    <principles>
      1.  **Dependency Safety**: When other tasks depend on this Task, must decouple first to continue.
      2.  **Confirmation Gate**: Delete is irreversible; must show full impact and get explicit user confirmation.
      3.  **Zero Residue**: Cleanup must cover all layers (docs/code/global data/addressing entries).
      4.  **No Side Effects**: Only delete target Task content; do not touch unrelated files.
    </principles>
</meta>

<step_1_resolve>
    **Action**:
    1.  **Resolve ID**: Parse `<id>` from roadmap.json → Task Name, Slug, status.
    2.  **ID Not Found** → Error and list available task IDs.
    3.  **Load**: task docs directory, roadmap.json (deps), map.json (architecture reg), 99_context_glue.md (associations).

    **Output**: Target Task info (ID, name, status, associated file count).
</step_1_resolve>

<step_2_impact>
    **Action**: Scan layer by layer; generate impact list.

    ### 2.1 Dependency check (blocking)

    Scan roadmap.json all tasks `deps`; find tasks depending on `<id>`.

    | Condition | Handling |
    |:---|:---|
    | No downstream deps | Pass |
    | Has downstream deps and `pending`/`blocked` | List; ask: remove dep and continue or abort |
    | Has downstream deps and `active`/`done` | **Block** — must `/archi.edit` to decouple first |

    ### 2.2 Code file identification

    Locate code files via: context_glue paths, map.json registered modules, plan.json mentioned files, Slug-named or clearly owned files.

    ### 2.3 Global ref scan

    | File | Scan content |
    |:---|:---|
    | `roadmap.json` | Task entry + deps refs |
    | `map.json` | Module entry + featureRelations where deleted Task is aggregator |
    | `99_context_glue.md` | Association entries |
    | `dictionary.json` | Exclusive terms (mark only) |
    | `error_codes.json` | Exclusive error codes (mark only) |

    ### 2.4 Aggregator linkage check

    [[SUBAGENT: archi-feature-relations|mode: cleanup, context: Check deleted Task refs in featureRelations; output impact report]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`, follow mode: cleanup logic)]]

    ### 2.5 Cross-Task refs

    Scan other Tasks' `spec.md`; check refs to deleted Task's interface/components/data. Mark refs as `[Breaking]`.

    **Output**: Output decommission impact report to user — include Task status, docs and code to delete (file/source table), global ref cleanup items (roadmap/map/context_glue), (if any) term/error code residue (manual confirm needed), (if any) aggregator linkage table, (if any) cross-Task ref [Breaking] table. End: OK to execute / Abort to cancel.

    **Gate**: Proceed to step_3 only after user replies OK. Re-warn when `[Breaking]` refs exist.
</step_2_impact>

<step_3_execute>
    **Role**: Surgeon
    **Action**: Execute in this order (order immutable).

    | # | Action | Target |
    |:---|:---|:---|
    | 1 | Delete code files/dirs | Code paths from step_2 |
    | 2 | Delete Task docs dir | `[[__DOCS_DIR__]]/tasks/<id>_<slug>/` |
    | 3 | Update `roadmap.json` | Remove task entry; clean deps refs |
    | 4 | Update `map.json` | Remove module entry + featureRelations entry |
    | 5 | Update `99_context_glue.md` | Remove association entries |
    | 6 | [?exclusive terms] Update `dictionary.json` | Remove or mark deprecated |
    | 7 | [?exclusive error codes] Update `error_codes.json` | Remove or mark deprecated |
    | 8 | [?aggregator linkage] Check aggregator code | Confirm refs cleaned |

    Record operation log after each step.
</step_3_execute>

<step_4_verify>
    **Terminal Gate** (do not skip): Standard check (task --check + render).
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 3 | Run project build command | Zero compile errors; no import/require to deleted module |

    If build fails or residual refs found → locate, fix, re-check.
</step_4_verify>

<step_5_summary>
    **Output**: Decommission completion summary:
    - **Deleted**: N doc files, N code files
    - **Cleaned**: refs in roadmap / map / context_glue
    - **Build status**: Pass/Fail
    - **[?if any] Manual follow-up**: Term/error code/cross-Task ref residue
    - **Git Commit Suggestion**: `feat(remove): decommission <ID> <Name>`
</step_5_summary>

</protocol_remove>

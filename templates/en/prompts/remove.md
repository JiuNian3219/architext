<protocol_remove>
  **Trigger**: `/archi.remove <id>`
  **Goal**: Completely decommission specified Task from project — Delete documents, code, global references, ensure zero residue.

<meta>
    <style>Surgical, Cautious, Thorough</style>
    <language>English</language>
    <principles>
      1.  **Dependency Safety**: When other tasks depend on this Task, must first resolve dependencies before continuing.
      2.  **Confirmation Gate**: Delete operation is irreversible, must show full impact to user and get explicit confirmation.
      3.  **Zero Residue**: Cleanup must cover all associated layers (documents/code/global data/addressing entries).
      4.  **No Side Effects**: Only delete content related to target Task, do not touch unrelated files.
    </principles>
</meta>

<step_1_resolve>
    **Action**:
    0.  **Context Pack Gate**: Prioritize consuming Context Pack produced by `00_system.md` Front Pipeline; if missing fill first. If `missing_or_stale` non-empty, handle gaps first or explain to user.
    1.  **Resolve ID**: Parse `<id>` from Context Pack / roadmap.json → Task Name, Slug, status.
    2.  **ID Not Found** → Error and list available task IDs.
    3.  **Load**: Task docs directory, roadmap.json (dependencies), map.json (architecture registration).

    **Output**: Target Task basic info (ID, name, status, associated file count).
</step_1_resolve>

<step_2_impact>
    **Action**: Scan layer by layer, generate impact list.

    ### 2.1 Dependency Check (Blocking Level)

    Scan all tasks' `deps` in roadmap.json, find tasks depending on `<id>`.

    | Situation | Handling |
    |:---|:---|
    | No downstream dependencies | Pass |
    | Has downstream dependencies and `pending`/`blocked` | List, ask: Remove dependency and continue or Abort |
    | Has downstream dependencies and `active`/`done` | **Block** — Must first `/archi.change` to decouple |

    ### 2.2 Code File Identification

    Locate code files through: map.json registered modules, plan.json mentioned files, files named by Slug or explicitly attributed.

    ### 2.3 Global Reference Scan

    | File | Scan Content |
    |:---|:---|
    | `roadmap.json` | Task entry + deps references |
    | `map.json` | Module entry + featureRelations entries referencing deleted code/docs |
    | `dictionary.json` | Exclusive terms (only mark) |
    | `error_codes.json` | Exclusive error codes (only mark) |

    ### 2.4 featureRelations Linkage Check

[[SUBAGENT: archi-feature-relations|mode: cleanup, context: Check deleted code/doc paths in featureRelations source/targets, output impact report]]
[[NO-SUBAGENT: archi-feature-relations|mode: cleanup, context: Check deleted code/doc paths in featureRelations source/targets, output impact report]]
[[NO-SKILL: (Read `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`, and execute per mode: cleanup logic in current context)]]

    ### 2.5 Cross-Task References

    Scan other Tasks' `spec.md`, check if interfaces/components/data of deleted Task are referenced. Found references mark `[Breaking]`.

    **Output**: Output decommission impact report to user — Contains Task status, to-be-deleted docs and code (file/source table), global reference cleanup items (roadmap/map), (if any) terms/error codes residue (needs manual confirmation), (if any) featureRelations linkage table, (if any) cross-Task reference [Breaking] table. End: OK confirm execution / Abort cancel.

    **Gate**: User replies OK then enter step_3. Has `[Breaking]` references must warn again.
</step_2_impact>

<step_3_execute>
    **Action**: Execute in following order (order cannot be adjusted).

    | # | Operation | Target |
    |:---|:---|:---|
    | 1 | Delete code files/directories | Code paths identified in step_2 |
    | 2 | Delete Task docs directory | `[[__DOCS_DIR__]]/tasks/<id>_<slug>/` |
    | 3 | Update `roadmap.json` | Remove task entry; clean deps references |
    | 4 | Update `map.json` | Remove module entry + featureRelations entry |
    | 5 | [?has exclusive terms] Update `dictionary.json` | Remove or mark deprecated |
    | 7 | [?has exclusive error codes] Update `error_codes.json` | Remove or mark deprecated |
    | 8 | [?has featureRelations linkage] Check linked source/targets | Confirm references cleaned |

    Record operation log after each step completes.
</step_3_execute>

<step_4_verify>
    **Terminal Gate** (Do not skip):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | No ERROR |
    | 2 | `npx archi render` | View generation successful |
    | 3 | Run project build command | Zero compilation errors; no import/require of deleted module |

    Build failed or residual references found → Locate and fix then re-check.
</step_4_verify>

<step_5_summary>
    **Pre-signoff Checklist** (Verify item by item before output):
    □ Code files/directories — Deleted (step_3 operation #1)
    □ tasks/<id>_<slug>/ docs directory — Deleted (step_3 operation #2)
    □ roadmap.json — Task entry + deps references — Cleaned (step_3 operation #3)
    □ map.json — Module entry + featureRelations — Cleaned (step_3 operation #4)
    □ (Has exclusive terms/error codes) dictionary.json + error_codes.json — Handled
    □ Global file cleanup check:
      - vision.md + tech_stack.md — Must check
      - dictionary.json + error_codes.json + env_registry.json — Must check
[[WHEN: ui |       - design_tokens.json + ui_context.md ]]
[[WHEN: data |       - data_snapshot.json ]]
[[WHEN: api |       - api_snapshot.json ]]
[[WHEN: cli |       - command_api.json ]]
[[WHEN: lib |       - public_api.json ]]
    □ Terminal Gate — task --check no ERROR + render successful + project build passed, no residual import references (step_4)

    **Output**: Decommission complete summary:
    - **Deleted**: Docs N files, Code N files
    - **Cleaned**: References in roadmap / map
    - **Build status**: Pass/Fail
    - **[?if any] Needs manual follow-up**: Terms/error codes/cross-Task reference residue
    - **Git Commit Suggestion**: `feat(remove): decommission <ID> <Name>`
</step_5_summary>

</protocol_remove>

<protocol_remove>
  **Trigger**: `/archi.remove <id>`
  **Goal**: Fully decommission the specified Task — delete docs, code, and global references with zero residue.

<meta>
    <style>Surgical, Cautious, Thorough</style>
    <language>English</language>
    <principles>
      1.  **Dependency Safety**: If other tasks depend on this Task, dependencies must be resolved before proceeding.
      2.  **Confirmation Gate**: Deletion is irreversible; must present full impact and obtain explicit confirmation.
      3.  **Zero Residue**: Cleanup must cover all associated layers (docs/code/global data/glue entries).
      4.  **No Side Effects**: Only remove content related to the target Task; forbidden to touch unrelated files.
    </principles>
</meta>

<step_1_resolve>
    **Role**: System Analyst
    **Action**:
    1.  **Resolve ID**: Parse `<id>` from `[[__DOCS_DIR__]]/global/roadmap.json` → Task Name, Slug, status.
    2.  **ID Not Found** → Error with list of available task IDs.
    3.  **Load Context**:
        - `[[__DOCS_DIR__]]/tasks/<id>_<Slug>/` — All docs (spec.md, ui.md, plan.json, etc.)
        - `[[__DOCS_DIR__]]/global/roadmap.json` — Task dependency graph
        - `[[__DOCS_DIR__]]/global/map.json` — Architecture registry
        - `99_context_glue.md` — Code↔doc associations

    **Output**: Target Task info (ID, name, status, associated file count).
</step_1_resolve>

<step_2_impact>
    **Role**: Impact Assessor
    **Action**: Scan each layer to produce an impact manifest.

    ### 2.1 Dependency Check (Blocking)

    Scan all tasks' `deps` in `roadmap.json` for references to `<id>`.

    | Situation | Handling |
    |:---|:---|
    | No downstream deps | Pass, continue |
    | Has downstream deps with `pending`/`blocked` status | List affected tasks; ask user: remove dependency and continue, or abort |
    | Has downstream deps with `active`/`done` status | **Block** — these tasks may use this Task's interfaces/components. Must `/archi.edit` to decouple first |

    ### 2.2 Code File Identification

    Locate code files belonging to this Task via:
    1.  `99_context_glue.md` code paths associated with `<id>`.
    2.  `map.json` modules/directories registered for this Task.
    3.  `plan.json` file paths mentioned in tasks.
    4.  Scan code directories for files named with Slug or clearly scoped to this Task.

    ### 2.3 Global Reference Scan

    | File | Scan Target |
    |:---|:---|
    | `roadmap.json` | Task entry + `deps` references in other tasks |
    | `map.json` | Module registry entries + `featureRelations` entries where the deleted Task is the aggregator |
    | `99_context_glue.md` | Association entries |
    | `dictionary.json` | Terms exclusive to this Task (flag only, no auto-delete) |
    | `error_codes.json` | Error codes exclusive to this Task (flag only, no auto-delete) |

    ### 2.4 Aggregation Linkage Check

    Read `map.json.featureRelations`; determine whether the deleted Task falls within any aggregator's `sources` coverage.

    | Situation | Handling |
    |:---|:---|
    | Not in any aggregator's sources range | No special handling |
    | In an aggregator's sources range | List in impact report; prompt to check if aggregator content needs to be cleaned up after deletion |
    | Deleted Task is itself an aggregator | Also remove its entry from `featureRelations` |

    ### 2.5 Cross-Task References

    Scan other Tasks' `spec.md` for references to the target Task's interfaces, components, or data. Flag as `[Breaking]`.

    **Output**: Impact report to user:
    ```
    ### Decommission Impact Report: <ID> <Name>

    **Task Status**: [status]

    **Docs to delete**:
    - [[__DOCS_DIR__]]/tasks/<id>_<slug>/  (N files)

    **Code to delete**:
    | File/Directory | Source |
    |:---|:---|
    | src/xxx/xxx.ts | context_glue |
    | src/xxx/ | map.json |

    **Global reference cleanup**:
    - roadmap.json: remove task <id>, clean N deps references
    - map.json: remove N module entries
    - context_glue: remove N associations

    **[?present] Terms/error codes residue** (manual confirmation needed):
    - dictionary.json: [term1], [term2]
    - error_codes.json: [ERR_XXX]

    **[?present] Aggregation linkage** (check needed):
    | Aggregator | checkNote |
    |:---|:---|
    | [aggregator ID/path] | [checkNote content] |

    **[?present] Cross-Task references [Breaking]**:
    | Referencing Task | Reference Content | Suggestion |
    |:---|:---|:---|
    | FEAT-005 spec.md | Calls <id>'s UserAPI | /archi.edit FEAT-005 to decouple first |

    ---
    > Reply **OK** to confirm; reply **abort** to cancel.
    ```

    **Gate**: Proceed to step_3 after user replies OK. Re-warn if `[Breaking]` cross-Task refs exist.
</step_2_impact>

<step_3_execute>
    **Role**: Surgeon
    **Action**: Execute in this order (order is mandatory).

    | # | Operation | Target |
    |:---|:---|:---|
    | 1 | Delete code files/directories | Code paths from step_2 |
    | 2 | Delete Task doc directory | `[[__DOCS_DIR__]]/tasks/<id>_<slug>/` |
    | 3 | Update `roadmap.json` | Remove task entry; clean `deps` refs to `<id>` in other tasks |
    | 4 | Update `map.json` | Remove module entries; if this Task is an aggregator, also remove its `featureRelations` entry |
    | 5 | Update `99_context_glue.md` | Remove association entries for this Task |
    | 6 | [?exclusive terms] Update `dictionary.json` | Remove or mark deprecated |
    | 7 | [?exclusive codes] Update `error_codes.json` | Remove or mark deprecated |
    | 8 | [?aggregation linkage] Check aggregator code | Verify aggregator no longer references the deleted Task |

    Log each operation (file path + operation type) as it completes.
</step_3_execute>

<step_4_verify>
    **Role**: Verification Engineer
    **Terminal Gate** (Do not skip; must complete before step_5 output):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | No ERROR-level issues, no dangling deps |
    | 2 | `npx archi render` | `.md` views generated |
    | 3 | Run project build command | Zero compilation errors |

    | Check | Pass Criteria |
    |:---|:---|
    | Roadmap consistency | `--check` passes, no dangling deps |
    | Build | Zero compilation errors |
    | Residual refs | No import/require of deleted modules in codebase |

    Build failure or residual refs found → locate, fix, and recheck.
</step_4_verify>

<step_5_summary>
    **Output**: Decommission summary:
    - **Deleted**: N doc files, N code files
    - **Cleaned**: roadmap / map / context_glue references
    - **Build status**: pass/fail
    - **[?present] Manual follow-up needed**: terms/error codes/cross-Task ref residue
    - **Git Commit Suggestion**: `feat(remove): decommission <ID> <Name>`
</step_5_summary>

</protocol_remove>

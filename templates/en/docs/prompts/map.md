<protocol_map>
  **Trigger**: `/archi.map` | Auto-loaded by Workflow Dispatch on natural language trigger
  **Goal**: Scan project actual directory structure, compare with `map.json`, identify additions/stale/changes; update architecture map after user confirmation.

<meta>
    <style>Systematic, Precise, Architecture-Aware</style>
    <language>English</language>
    <principles>
      1.  **Scan vs Map**: Actual filesystem is Ground Truth; map.json is old snapshot.
      2.  **Smart Granularity**: Directory-level by default; when single file has multiple responsibilities, refine to file-level.
      3.  **Architecture Inference**: New entry layer/location must reference existing map pattern + `02_tech_stack.md`.
      4.  **Batch Confirm**: Show all changes at once; user confirms in batch.
      5.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints, not fight IDE planning/execution mechanisms.
    </principles>
</meta>

<step_1_scan>
    **Action**:
    1.  **Read Map**: Read `[[__DOCS_DIR__]]/global/map.json` — current architecture map.
    2.  **Read Tech Stack**: Read `02_tech_stack.md` — directory structure conventions, architecture pattern.
    3.  **Scan Directory Tree**: Scan project directory structure.
        - **Exclude**: `.git/`, `node_modules/`, `dist/`, `build/`, `[[__DOCS_DIR__]]/`, and paths in `.gitignore`.
        - **Depth**: Follow granularity pattern of existing map.json entries.

    **Output**: Internal data (actual dir tree + existing map structure); not shown to user.
</step_1_scan>

<step_2_diff>
    **Action**: Compare actual dir tree with map.json entry by entry; classify as three diff types.

    | Diff Type | Criteria | Handling |
    |:---|:---|:---|
    | **New** | Exists in reality but not in map | Must classify and register |
    | **Stale** | In map but no longer exists | Remove directly |
    | **Suspected Rename** | Map path gone, but new path structure/content highly similar | Mark as rename candidate |

    ### File-level detection

    Quick scan of files in new directories; identify **single file multi-responsibility** → refine granularity to file-level.

    **Output**: Diff list (internal); proceed to step_3.
</step_2_diff>

<step_3_classify>
    **Role**: Chief Architect
    **Action**: Classify new entries by architecture.

    ### Classification strategy

    1.  **Pattern match**: Reference same-level existing entries in map.json.
    2.  **Tech Stack conventions**: Directory structure rules in `02_tech_stack.md`.
    3.  **Content inference**: Read file content (imports, exported types).
    4.  **Cannot determine**: Mark `[?]` for user to specify.

    For each new entry fill: `path`, `layer`, `description`, `[?file-level] contains`.

    **Output**: Classified new entries list (internal); proceed to step_4.
</step_3_classify>

<step_4_propose>
    **Action**: Present full change list to user.

    **Output**:
    ```
    ### Architecture Map Change Proposal

    **Scan scope**: [project root]
    **Current map entries**: N | **After change**: M

    ---

    #### Stale entries (to remove)
    | Path | Original layer |
    |:---|:---|

    #### New entries (to register)
    | Path | Layer | Description | Granularity |
    |:---|:---|:---|:---|

    #### Suspected renames
    | Original path | New path | Confidence |
    |:---|:---|:---|

    ---
    > Reply **OK** to confirm all; or specify modifications.
    ```

    **Gate**: Proceed to step_5 after user confirms.
</step_4_propose>

<step_5_apply>
    **Action**:
    1.  Update map.json per confirmed list (remove stale, add new, handle renames).
    2.  Update `lastUpdated`.

    **Terminal Gate** (do not skip): Standard check (task --check + render).

    **Pre-signoff Checklist** (confirm each item before Output):
    □ User explicitly confirmed change list in step_4 (Gate passed before execution)
    □ Stale entries removed from directoryMapping
    □ New entries correctly classified (path + layer + description all filled)
    □ Renamed entries explicitly handled (not silently ignored)
    □ lastUpdated updated
    □ Terminal Gate — task --check + render passed

    **Output**: Update summary — removed N / added N (M file-level) / renamed N / total entries.
</step_5_apply>

</protocol_map>

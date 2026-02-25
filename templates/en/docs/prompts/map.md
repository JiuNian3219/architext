<protocol_map>
  **Trigger**: `/archi.map`
  **Goal**: Scan actual project directory structure, diff against `map.json`, identify additions/stale/changes, and update the architecture map after user confirmation.

<meta>
    <style>Systematic, Precise, Architecture-Aware</style>
    <language>English</language>
    <principles>
      1.  **Scan vs Map**: Actual filesystem is Ground Truth; map.json is the old snapshot.
      2.  **Smart Granularity**: Directory-level by default; drill to file-level when a single file carries multiple responsibilities.
      3.  **Architecture Inference**: New entry classification must reference existing map patterns + `02_tech_stack.md`.
      4.  **Batch Confirm**: Present all changes at once; user confirms in batch.
    </principles>
</meta>

<step_1_scan>
    **Role**: Surveyor
    **Action**:
    1.  **Read Map**: Read `[[__DOCS_DIR__]]/global/map.json` — current architecture map.
    2.  **Read Tech Stack**: Read `02_tech_stack.md` — directory conventions, architecture patterns.
    3.  **Scan Directory Tree**: Scan project directory structure.
        - **Exclude**: `.git/`, `node_modules/`, `dist/`, `build/`, `[[__DOCS_DIR__]]/`, and paths declared in `.gitignore`.
        - **Depth**: Follow granularity patterns of existing map.json entries. If existing entries include file-level → scan to file-level too.

    **Output**: Internal data (actual tree + existing map structure), not shown to user.
</step_1_scan>

<step_2_diff>
    **Role**: Diff Analyst
    **Action**: Compare actual directory tree against map.json entry by entry, classify into three diff types.

    | Diff Type | Criteria | Handling |
    |:---|:---|:---|
    | **New** | Exists on disk but not in map | Classify and register |
    | **Stale** | In map but no longer exists on disk | Remove directly |
    | **Possible Rename** | Map path missing, but a new path has highly similar structure/content | Flag as rename candidate |

    ### File-Level Detection

    Quick-scan files in new directories (read exports/declarations) to identify **single-file multi-responsibility** cases:
    - A file exporting multiple unrelated classes/functions/modules
    - An entry file aggregating multiple sub-module registrations (e.g. route registration, store registration)
    - A file serving multiple Tasks

    When detected → drill granularity to file-level, register the file separately in map with its contained responsibilities.

    **Output**: Diff list (internal), proceed to step_3.
</step_2_diff>

<step_3_classify>
    **Role**: Chief Architect
    **Action**: Classify new entries by architectural layer.

    ### Classification Strategy

    1.  **Pattern Matching**: Reference existing entries at the same level. If `src/services/auth/` is "Service Layer", then `src/services/payment/` likely is too.
    2.  **Tech Stack Conventions**: Directory structure rules defined in `02_tech_stack.md` (e.g. "commands/ is Task Layer").
    3.  **Content Inference**: Read file contents (imports, export types) to determine architectural role.
    4.  **Uncertain**: Mark as `[?]`, let user specify during confirmation.

    For each new entry, populate:
    - `path`: Directory or file path
    - `layer`: Architectural layer
    - `description`: One-line responsibility description
    - `[?file-level]` `contains`: List of sub-responsibilities in the file

    **Output**: Classified new entries list (internal), proceed to step_4.
</step_3_classify>

<step_4_propose>
    **Role**: Advisor
    **Action**: Present the full change manifest to user.

    **Output**:
    ```
    ### Architecture Map Change Proposal

    **Scan scope**: [project root]
    **Current map entries**: N | **After update**: M

    ---

    #### Stale Entries (will remove)
    | Path | Original Layer |
    |:---|:---|
    | src/legacy/old-module/ | Service Layer |

    #### New Entries (will register)
    | Path | Layer | Description | Granularity |
    |:---|:---|:---|:---|
    | src/services/payment/ | Service Layer | Payment service module | Directory |
    | src/utils/validators.ts | Shared Layer | Form + data + API param validation | File |
    | src/routes/api.ts [?] | [to specify] | Aggregates multiple API route registrations | File |

    #### Possible Renames
    | Original Path | New Path | Confidence |
    |:---|:---|:---|
    | src/helpers/ | src/utils/ | High (file content match) |

    ---
    > Reply **OK** to confirm all; or specify changes:
    > - "src/routes/api.ts belongs to App Layer"
    > - "src/helpers/ is not a rename, keep original entry"
    > - "add src/config/ as Config Layer"
    ```

    **Gate**: Proceed to step_5 after user confirms.
</step_4_propose>

<step_5_apply>
    **Role**: System Administrator
    **Action**:
    1.  Update `[[__DOCS_DIR__]]/global/map.json` per confirmed changes:
        - Remove stale entries
        - Add new entries (with layer, description)
        - Handle renames (update path, preserve other metadata)
    2.  Update `lastUpdated` field.

    **Terminal Gate** (Do not skip; must complete before output summary):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi render` | `.md` views generated |

    **Output**: Update summary:
    - **Removed**: N stale entries
    - **Added**: N entries (M file-level)
    - **Renamed**: N entries
    - **Current map total**: X entries
</step_5_apply>

</protocol_map>

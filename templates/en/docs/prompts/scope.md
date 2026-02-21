<protocol_scope>
  **Trigger**: `/archi.scope [file_path]`
  **Phase**: Requirement Decomposition
  **Goal**: Read Scope Brief, decompose large requirements into multiple Roadmap tasks with dependency relationships.

<meta>
    <style>Strategic, Analytical, Structured</style>
    <language>English</language>
    <principles>
      1.  **Brief-Driven**: Use user-provided Scope Brief as primary input; never brainstorm features from scratch.
      2.  **Incremental**: Append to existing Roadmap; never rewrite existing tasks.
      3.  **User Agency First**: Adopt user-specified choices from Brief as-is; never question or replace.
      4.  **Minimal Questions**: Only ask about information gaps; skip questioning if Brief is sufficient.
      5.  **Option Z Everywhere**: All supplementary questions must include `[Z] Custom`.
    </principles>
</meta>

<step_0_ingest>
    **Role**: Intelligence Analyst
    **Action**:
    1. Parse `[file_path]` from trigger command:
       - If path provided → read that file
       - If no path → look for `scope-brief.md` (project root), then `[[__DOCS_DIR__]]/scope-brief.md`
       - If none found or empty → jump to `<fallback_interview>`

    2. Parse Brief sections and extract:
       - Initiative name and description
       - Feature list
       - Existing design decisions
       - Boundaries & constraints (out of scope, timeline, dependencies, technical limits)
       - Affected existing features
       - References

    > Brief is a one-time input file; user may delete it after processing.

    **Output**: Internal summary (not shown to user), proceed to `<step_1_load>`.
</step_0_ingest>

<step_1_load>
    **Role**: System Analyst
    **Action**:
    1.  **Read Vision**: `[[__DOCS_DIR__]]/global/vision.md` — north star metrics, project boundaries.
    2.  **Read Roadmap**: `[[__DOCS_DIR__]]/global/roadmap.json` — current phase structure, existing tasks (including Legacy), ID numbering watermark.
    3.  **Read Tech Stack**: `02_tech_stack.md` — technical constraints.
    4.  **Read Map**: `[[__DOCS_DIR__]]/global/map.json` — architecture topology, directory mapping.
    5.  **Scan Features**: Scan `[[__DOCS_DIR__]]/features/` directory — understand existing feature summaries (title + key flows, no full read needed).

    **Output**: Internal context summary, proceed to `<step_2_analysis>`.
</step_1_load>

<step_2_analysis>
    **Role**: Chief Product Strategist (CPO)
    **Input**: Step 0 Brief parsing result + Step 1 project context.

    **Action**:

    1. **Vision Alignment Check**: Does the Brief align with vision.md north star metrics? If deviation → flag `[Vision Deviation Warning]`.
    2. **Feature List Completeness**: Does the feature list sufficiently support the initiative goal?
    3. **Impact Assessment**: Brief "Affected Existing Features" → verify against roadmap/features for existence and status.
    4. **Gap Identification**: Check Brief for critical missing information.
    5. **Linkage Check**: Read `map.json.featureRelations`; semantically compare the new feature's description against each `sources` field to determine if it falls within any aggregator's coverage. Surface a linkage reminder in the summary if matched.

    **Gap Levels**:
    - **Required**: Missing prevents reasonable decomposition (e.g., empty feature list)
    - **Recommended**: AI can infer but should confirm (e.g., unclear dependencies)
    - **Optional**: AI can decide autonomously (e.g., feature grouping approach)

    **Decision**:
    - No "Required" or "Recommended" gaps → skip Step 2.5, proceed to Step 3
    - Has gaps → proceed to Step 2.5

    **Output**: Display Brief analysis summary to user:
    ```
    ### SCOPE BRIEF Analysis Report
    > **Initiative**: [Name] | **Scale**: Estimated [N] tasks

    **Vision Alignment**: [Aligned / ⚠️ Deviation — reason]

    **Confirmed Information**:
    - [list]

    **Affected Existing Features**:
    | Feature | Status | Estimated Impact |
    |:---|:---|:---|
    | [ID: Name] | [done/active/stub] | [needs modification/extension/no impact] |

    **[?matched] Linkage Reminder**:
    | Aggregator | checkNote |
    |:---|:---|
    | [aggregator ID/path] | [checkNote content] |

    **Information Gaps** (to be addressed):
    - [gap list]

    **AI Will Auto-Decide** (no action needed):
    - [list]
    ```
</step_2_analysis>

<step_2_5_supplementary>
    **Role**: Product Consultant
    **Trigger**: Only when Step 2 identifies "Required" or "Recommended" gaps.

    **Core Rule: Multiple-Choice First**
    - No open-ended questions. All questions must be **multiple-choice**.
    - AI provides recommended default option (marked `[Recommended]`); user only needs to confirm or switch.
    - Every question must include `[Z] Custom` fallback option.
    - Lower user decision cost: users should be able to choose reasonably without domain expertise.

    **Action**:
    1. Only generate questions for gaps; never ask about information already provided in Brief.
    2. Each question provides 3-5 options + `[Z] Custom`, AI recommended option marked `[Recommended]`.
    3. **Option descriptions must describe concrete behavior**: what this option is, how the project changes if selected, what scenarios it suits. No one-word summaries.
    4. **AI+/AI- must be complete sentences**: explain specific advantages and risk reasons from AI Agent execution perspective. Never write "None" — every approach has trade-offs.
    5. Total questions capped at 3 (merge related questions).

    **Output Format**:
    ```
    ### Supplementary Confirmation

    **[Q1] Question Title**
    > Why this information is needed (one sentence)

    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A [Recommended] | Option name | What it is + what changes + suitable scenarios (2-3 sentences) | Complete sentence | Complete sentence |
    | B | ... | ... | ... | ... |
    | C | ... | ... | ... | ... |
    | Z | Custom | (please describe) | - | - |

    ---
    **INPUT**: `Q1answer | Q2answer | ...` (separate questions with `|`; multi-select within one question with spaces)
    ```
</step_2_5_supplementary>

<step_3_decompose>
    **Role**: Chief Architect
    **Input**: Full Brief + project context + supplementary answers (if any).

    **Action**: Decompose requirement into Roadmap tasks.

    ### Decomposition Rules

    1. **Granularity Standard**: Each task must be completable within a single `/archi.plan` + `/archi.code` cycle. Split if too large.
    2. **ID Generation**: Follow existing Roadmap ID prefix and numbering watermark. If highest FEAT number is FEAT-003, new tasks start from FEAT-004.
    3. **Phase Assignment**:
       - Infrastructure tasks (new Schema, new shared services) → phase-1 (Infrastructure)
       - Feature tasks → phase-2 (Core Features) or new phase
       - If new Phase needed → increment phase ID
    4. **Dependencies**:
       - Inter-new-task dependencies → fill in `deps`
       - New task depends on existing task → fill existing ID in `deps`
       - If Brief declares dependency on existing features → include in deps
    5. **Existing Design Decision Injection**: Designs from Brief "Existing Design Decisions" → inject into corresponding task's `goal` field, append `\n[User Preset] <decision summary>`.
    6. **Affected Existing Features**:
       - If existing feature needs modification → create `EDIT-xxx` task (tag: Edit), note scope and reason in goal
       - If existing feature is Legacy Stub → note in goal that spec must first be enriched via `/archi.edit`

    ### Task JSON Schema

    ```json
    {
      "id": "FEAT-004",
      "title": "Task Title",
      "status": "pending | blocked",
      "goal": "<DoD — input/output/acceptance criteria>",
      "deps": [],
      "tag": "Feature | Infra | Edit",
      "slug": "Task_Title"
    }
    ```

    **Initial Status Rule**:
    - `deps: []` or deps completed → `"status": "pending"`
    - Has incomplete deps → `"status": "blocked"`

    **Output**: Display decomposition plan to user:
    ```
    ### Task Decomposition Plan
    > **Initiative**: [Name] | **Total [N] tasks**

    #### Phase [X]: [Phase Name]
    | ID | Title | Dependencies | Tag | Goal Summary |
    |:---|:---|:---|:---|:---|
    | FEAT-004 | ... | — | Feature | ... |
    | FEAT-005 | ... | FEAT-004 | Feature | ... |

    #### Impact on Existing Features
    | Target Feature | Operation | New Task ID |
    |:---|:---|:---|
    | LEG-01: User Auth | Extend OAuth | EDIT-001 |

    #### Dependency Graph (text)
    FEAT-004 → FEAT-005 → FEAT-006
                        ↘ FEAT-007

    ---
    > Reply **OK** to confirm; or note modifications:
    > - "Merge FEAT-005 and FEAT-006"
    > - "Add a xxx task"
    > - "FEAT-004 should not depend on LEG-01"
    ```

    **Gate**: User must confirm before proceeding to step_4. Do not write to Roadmap without confirmation.
</step_3_decompose>

<step_3_5_refinement>
    **Role**: Consultant
    **Trigger**: User replies non-OK, with merge/split/add/remove/dependency adjustments.
    **Action**: Incorporate user feedback, refresh decomposition plan and re-output, await re-confirmation.
</step_3_5_refinement>

<step_4_roadmap_update>
    **Role**: System Administrator
    **Input**: User-confirmed decomposition plan.

    **Action**:
    1.  Append new tasks to corresponding Phase's `tasks` array in `[[__DOCS_DIR__]]/global/roadmap.json`.
    2.  If new Phase needed → append to `phases` array.
    3.  Update `lastUpdated` field.
    4.  Run `npx archi task --check` to verify consistency.
    5.  Run `npx archi render` to generate readable view.

    **Output**: Write confirmation.
</step_4_roadmap_update>

<step_5_signoff>
    **Action**:
    1.  Run `npx archi task` to display task progress overview.
    2.  Output summary.

    **Output**: Requirement decomposition summary, including:
    - **Brief Source Confirmation**: Initiative name and core objective
    - **New Tasks**: Count and phase distribution
    - **Impact on Existing Features**: Impact list (if any)
    - **Next Steps**:

    | Priority | Action | Description |
    |:---|:---|:---|
    | 1 | `/archi.plan <first pending task ID>` | Deep planning for the first actionable task |
    | 2 | Review roadmap | Confirm dependency relationships and priorities |
</step_5_signoff>

<fallback_interview>
    **Trigger**: Brief file does not exist or is empty.
    **Role**: Product Consultant

    **Action**:
    1. Inform user that `scope-brief.md` was not found. Suggest:
       - Run `npx archi template scope-brief` to fetch template to project root
       - Fill in and re-run `/archi.scope scope-brief.md`
       - Or continue conversation to provide information via interview
    2. If user chooses to continue conversation, guide in this order:
       a. What do you want to build? (Initiative name, one-line description, motivation)
       b. What features does it include? (Specific feature list)
       c. What constraints exist? (Out of scope, dependencies, technical limits)
       d. Which existing features will be affected?
    3. After collection, write information to `scope-brief.md` (project root), then jump to `<step_1_load>`.

    > This mode is for backward compatibility; core flow remains Brief-driven.
</fallback_interview>

</protocol_scope>

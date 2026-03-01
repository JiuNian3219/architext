<protocol_scope>
  **Trigger**: `/archi.scope [file_path]`
  **Phase**: Requirement Decomposition
  **Goal**: Read Scope Brief, decompose large requirements into multiple Roadmap tasks with dependency relationships.

<meta>
    <style>Strategic, Analytical, Structured</style>
    <language>English</language>
    <principles>
      1.  **Brief-Driven**: Use user-provided Scope Brief as primary input; never brainstorm tasks from scratch.
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
       - Task list
       - Existing design decisions
       - Boundaries & constraints (out of scope, timeline, dependencies, technical limits)
       - Affected existing tasks
       - References

    > Brief is a one-time input file; user may delete it after processing.

    **Output**: Internal summary (not shown to user), proceed to `<step_1_load>`.
</step_0_ingest>

<step_1_load>
    **Role**: System Analyst
    **Action**:
    1.  **Read Vision**: `[[__DOCS_DIR__]]/global/vision.md` — read North Star Metric and Boundaries sections only; skip remaining chapters.
    2.  **Read Roadmap**: `[[__DOCS_DIR__]]/global/roadmap.json` — extract only `id/title/status/deps/tag` fields per task (skip `goal/notes`; requirement decomposition does not need these); read current max ID watermark for new task numbering.
    3.  **Read Tech Stack**: `02_tech_stack.md` — technical constraints.
    4.  **Read Map**: `[[__DOCS_DIR__]]/global/map.json` — read `directoryMapping` and `featureRelations` only; skip `logicalTopology` and `criticalUserJourneys`.
    5.  **Scan Tasks**: Scan `[[__DOCS_DIR__]]/tasks/` directory — understand existing task summaries (title + key flows, no full read needed).

    **Output**: Internal context summary, proceed to `<step_2_analysis>`.
</step_1_load>

<step_2_analysis>
    **Role**: Chief Product Strategist (CPO)
    **Input**: Step 0 Brief parsing result + Step 1 project context.

    **Action**:

    1. **Vision Alignment Check**: Does the Brief align with vision.md north star metrics? If deviation → flag `[Vision Deviation Warning]`.
    2. **Task List Completeness**: Does the task list sufficiently support the initiative goal?
    3. **Impact Assessment**: Brief "Affected Existing Tasks" → verify against roadmap/tasks for existence and status.
    4. **Gap Identification**: Check Brief for critical missing information.
    5. **Linkage Check**: Read `map.json.featureRelations`; semantically compare the new task's description against each `sources` field to determine if it falls within any aggregator's coverage. Surface a linkage reminder in the summary if matched.

    **Gap Levels**:
    - **Required**: Missing prevents reasonable decomposition (e.g., empty task list)
    - **Recommended**: AI can infer but should confirm (e.g., unclear dependencies)
    - **Optional**: AI can decide autonomously (e.g., task grouping approach)

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

    **Affected Existing Tasks**:
    | Task | Status | Estimated Impact |
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
    **Input**: Step 2 gap list. Max 3 questions.

    [[SKILL: archi-interview-protocol|Follow the skill's core rules and standard output format.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` and follow its rules)]]
</step_2_5_supplementary>

<step_3_decompose>
    **Role**: Chief Architect
    **Input**: Full Brief + project context + supplementary answers (if any).

    **Action**: [[SKILL: archi-decompose-roadmap|Follow the skill protocol to generate incremental task data from the Scope Brief task list.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` and follow its protocol)]]

    **Display format** (convert Skill output into the following format, present to user and await confirmation):

    ```
    #### Phase 1: Infrastructure
    | ID | Title | Description Summary | Tag |

    #### Phase 2: Core Features
    | ID | Title | Description Summary | Deps | Tag |

    #### Execution Batches (Parallel Groups)
    (Derived from deps via topological sort)
    Batch 1 (ready immediately): ...
    Batch 2 (after Batch 1): ...

    #### NFR Cross-Cutting Concerns (merged, not in Roadmap)
    (From Skill's NFR merge list)
    - [NFR name] → injected into [task ID] | affects: [other task IDs]
    ```

    **Gate**: Proceed to step_4 only after user replies **OK**. Do not write to Roadmap without confirmation. User may refine the plan before confirming (merge/split/adjust deps).
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
    4.  [?New modules] Update `directoryMapping` in `[[__DOCS_DIR__]]/global/map.json`: pre-register inferred module paths for new tasks (based on tech_stack architecture pattern and task descriptions; directory-level only — details to be filled during `/archi.plan`).

    **Terminal Gate** (Do not skip; must complete before output summary):
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | No ERROR-level issues |
    | 2 | `npx archi render` | `.md` views generated |

    **Output**: Write confirmation.
</step_4_roadmap_update>

<step_5_signoff>
    **Action** (Gate must complete in step_4):
    1.  Run `npx archi task` to display task progress overview.
    2.  Output summary.

    **Output**: Requirement decomposition summary, including:
    - **Brief Source Confirmation**: Initiative name and core objective
    - **New Tasks**: Count and phase distribution
    - **Impact on Existing Tasks**: Impact list (if any)
    - **Next Steps**:

    | Priority | Action | Description |
    |:---|:---|:---|
    | [?UI] Recommended | [[SKILL: archi-ui-wireframe|Run skill (append mode)]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` and follow its protocol)]] | Append screens for new tasks to `ui_concept.html`, sync `ui_context.md` |
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
       b. What tasks does it include? (Specific task list)
       c. What constraints exist? (Out of scope, dependencies, technical limits)
       d. Which existing tasks will be affected?
    3. After collection, write information to `scope-brief.md` (project root), then jump to `<step_1_load>`.

    > This mode is for backward compatibility; core flow remains Brief-driven.
</fallback_interview>

</protocol_scope>

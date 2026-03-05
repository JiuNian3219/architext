<protocol_scope>
  **Trigger**: `/archi.scope [file_path]` | Auto-loaded by Workflow Dispatch on natural language trigger
  **Phase**: Requirement Decomposition
  **Goal**: Read Scope Brief, decompose large requirements into Roadmap tasks with dependencies.

<meta>
    <style>Strategic, Analytical, Structured</style>
    <language>English</language>
    <principles>
      1.  **Brief-Driven**: User-provided Scope Brief is the core input; no task brainstorming from thin air.
      2.  **Incremental**: Append to existing Roadmap; do not rewrite existing tasks.
      3.  **User Agency First**: User-filled choices in Brief must be adopted directly; do not question or replace.
      4.  **Minimal Questions**: Ask only for information gaps; skip when Brief is sufficient.
      5.  **Option Z Everywhere**: Supplementary questions must include `[Z] Custom`.
      6.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints, not fight IDE planning/execution mechanisms.
    </principles>
</meta>

<step_0_ingest>
    **Role**: Intelligence Analyst
    **Action**:
    1. Parse `[file_path]` from trigger:
       - If path provided → read that file
       - If not provided → search `scope-brief.md` (project root), then `[[__DOCS_DIR__]]/scope-brief.md`
       - If user entered via natural language description (no file_path param) and above files not found → goto `<fallback_interview>`
       - If neither exists or empty → goto `<fallback_interview>`

    2. Parse Brief sections, extract: initiative name and description, task list, pre-defined design decisions, boundaries and constraints, affected existing tasks, references.

    > Brief is a one-time input file; user may delete after processing.

    **Output**: Internal summary (not shown to user), proceed to `<step_1_load>`.
</step_0_ingest>

<step_1_load>
    **Action**:
    1.  **Load**: vision.md (North Star + Boundaries only), roadmap.json (id/title/status/deps/tag + max ID watermark only), 02_tech_stack.md, map.json (directoryMapping + featureRelations only).
    2.  **Scan Tasks**: Scan tasks/ — understand existing task summaries (title + key flows; full read not needed).

    **Output**: Internal context summary, proceed to `<step_2_analysis>`.
</step_1_load>

<step_2_analysis>
    **Role**: Chief Product Strategist (CPO)
    **Input**: Step 0 Brief parse result + Step 1 project context.

    **Action**:

    1. **Vision alignment check**: Does Brief align with vision.md North Star? If deviation → mark `[Vision Deviation Warning]`.
    2. **Task list completeness**: Sufficient to support initiative goal?
    3. **Impact assessment**: Brief "affected existing tasks" → verify against roadmap/tasks.
    4. **Gap identification**: Key info missing in Brief?
    5. **Linkage check**: [[SUBAGENT: archi-feature-relations|mode: check, context: Compare new task descriptions with featureRelations sources; output linkage reminder if matched]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`, follow mode: check logic)]]

    **Gap levels**: Required → cannot decompose | Can supplement → AI can derive, suggest confirm | Suggested → AI decides

    **Decision**: No "Required" + "Can supplement" gaps → skip Step 2.5 | Has gaps → proceed to Step 2.5

    **Output**: Output SCOPE BRIEF analysis report to user — include initiative name/estimated scale, Vision alignment, confirmed info, affected existing tasks table (task/status/estimated impact), (if matched) linkage reminder table, information gaps, AI auto-decide items.
</step_2_analysis>

<step_2_5_supplementary>
    **Trigger**: Only when Step 2 finds "Required" or "Can supplement" gaps.
    **Input**: Step 2 gap list. Max 3 questions.

    [[SKILL: archi-interview-protocol|Follow the skill's core rules and standard output format for questioning.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` and follow its rules)]]
</step_2_5_supplementary>

<step_3_decompose>
    **Role**: Chief Architect
    **Input**: Full Brief + project context + supplement answers (if any).

    **Action**: [[SKILL: archi-decompose-roadmap|Follow the skill protocol to generate incremental task data from Scope Brief task list.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` and follow its protocol)]]

    **Display format** (convert Skill output to the following format, present to user, await confirmation):

    ```
    #### Phase 1: Infrastructure
    | ID | Title | Description Summary | Tag |

    #### Phase 2: Core Features
    | ID | Title | Description Summary | Deps | Tag |

    #### Execution Batches (parallel execution groups)
    Batch 1 (ready immediately): ...
    Batch 2 (after Batch 1 complete): ...

    #### NFR cross-cutting concerns (merged, not in Roadmap)
    - [NFR name] → inject [task ID] | affects: [other task IDs]
    ```

    **Gate**: Proceed to step_4 only after user replies **OK**; do not write to Roadmap without confirmation.
</step_3_decompose>

<step_3_5_refinement>
    **Trigger**: User reply is not OK — contains merge/split/add/remove/dependency adjustments.
    **Action**: Incorporate user feedback, refresh decomposition plan and re-output, await re-confirmation.
</step_3_5_refinement>

<step_4_roadmap_update>
    **Input**: User-confirmed decomposition plan.

    **Action**:
    1.  Append new tasks to corresponding Phase's `tasks` array in roadmap.json.
    2.  If new Phase needed → append to `phases` array.
    3.  Update `lastUpdated`.
    4.  (New modules) Update map.json `directoryMapping`: pre-register inferred module paths for new tasks.

    **Terminal Gate** (do not skip): Standard check (task --check + render).

    **Output**: Write confirmation.
</step_4_roadmap_update>

<step_5_signoff>
    **Action** (Gate must complete in step_4):
    1.  Run `npx archi task` to output task progress overview.
    2.  Output summary.

    **Output**: Requirement decomposition summary, including:
    - **Brief source confirmation**: Initiative name and core goal
    - **New tasks**: Count and phase distribution
    - **Impact on existing tasks**: Impact list (if any)
    - **Next Steps**:

    | Priority | Action | Notes |
    |:---|:---|:---|
    | (UI projects only) Recommended | [[SKILL: archi-ui-wireframe|Run skill (append mode)]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` and follow its protocol)]] | Append screens for new tasks to `ui_concept.html` |
    | 1 | `/archi.plan <first pending task ID>` | Deep-plan the first executable task |
    | 2 | Review roadmap | Confirm dependency relationships and priorities |
</step_5_signoff>

<fallback_interview>
    **Trigger**: Brief file not found or empty, or user entered via natural language description.

    **Action**:
    1. Inform user that requirements will be gathered via conversation. Suggest:
       - Run `npx archi template scope-brief` to get template to project root
       - Fill in and re-run `/archi.scope scope-brief.md`
       - Or continue conversation and provide info via interview
    2. If user chooses to continue, guide by the following dimensions (skip if already known, 1-2 questions each):
       a. **Motivation & Goals**: Why build this? What problem does it solve? What outcome is expected?
       b. **Scope**: Which features/modules are included? What's excluded?
       c. **Task Breakdown**: Do you have a rough task split in mind? (If not, AI will decompose in step_3)
       d. **Constraints**: Technical limits, time constraints, dependencies?
       e. **Impact**: Which existing features will be affected?
    3. After collection, write to `scope-brief.md` (project root), following scope-brief template structure.
    4. Inform user brief is generated, then goto `<step_1_load>` to continue.
</fallback_interview>

</protocol_scope>

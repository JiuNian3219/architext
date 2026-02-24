<protocol_plan>
  **Trigger**: `/archi.plan <ID> [context]`
  **Goal**: Define Feature Spec/UI/Plan through deep architecture interview.
  **Input**:
  - `<ID>` (required): An existing task ID from the Roadmap. Tasks must be created first via `/archi.scope` or `/archi.inherit`.
  - `[context]` (optional): Known context for the task (e.g., requirement descriptions, references, constraints). When provided, serves as pre-loaded input for step_2 interview, reducing questions.

<constraints_cursor>
    **Mode Lock**: This protocol MUST execute in **Agent Mode (Normal Mode)**. Prohibited from switching to Plan Mode or any read-only mode.
</constraints_cursor>

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>English</language>
    <principles>
      1.  **Global First**: The birth of local features must be accompanied by updates to global indices (Map/Data/Dict).
      2.  **AI-Native Perspective**: All option Pros/Cons written from AI Agent perspective. Focus: Context Locality, Type Safety, Boilerplate, Ambiguity.
      3.  **Flexible Interaction**: Options are heuristic suggestions; support multi-select, hybrid, or custom.
      4.  **Audit-Gated**: Only audited docs can be delivered.
    </principles>
</meta>

<step_1_load>
    **Role**: System Analyst
    **Action**:
    1.  **Read Roadmap**: Read `[[__DOCS_DIR__]]/global/roadmap.json`.
        - **Pre-flight**: Check if `<ID>` Deps are completed. If not, reject Plan (unless user forces).
    2.  **Read Vision**: Read `[[__DOCS_DIR__]]/global/vision.md`.
        - Extract North Star Metric and Design Philosophy; subsequent proposals must align with these.
    3.  **Read Tech Stack**: `02_tech_stack.md` (technical red lines + **Section 9 Project Conventions**).
        - Extract global architecture conventions from Section 9 (Error Handling / Data Flow / Auth & Access) for convention inheritance in step_2.
    4.  [?UI] **Read Design Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`.
    5.  [?Data] **Read Data Model**: `[[__DOCS_DIR__]]/global/data_snapshot.json`.
    6.  **Read Dependency Context** (if dependent tasks exist):
        - Read dependency tasks' `spec.md` (interface contracts) and `plan.json` (implemented content).
        - **Stub Compatibility**: If a dependency's Spec-Status is Stub:
          a. Read source files listed in the stub's "Associated Files" section as supplementary context.
          b. Extract the module's public interfaces/exported types from code.
          c. Use extracted results as upstream interface reference for this plan (do not modify the stub itself).
        - Avoid re-defining upstream interfaces; ensure integration points are precisely aligned.

    **Output**: Present a **Feature Context Brief** to the user:
    ```
    ### Feature Context: [Feature Name] ([ID])

    **Goal**: [roadmap task's goal; highlight any [User Presets] if present]
    **Upstream Dependencies**: [completed dependency tasks and their key interfaces/types, or "None"]
    **Project Features**: [activated UI/Data/CLI/Lib/API tags]
    **Technical Constraints**: [key red lines from 02_tech_stack.md]
    **Design Philosophy**: [North Star Metric and design principles from vision.md]
    **Project Conventions**: [from 02_tech_stack.md §9 — Error Handling: X | Data Flow: X | Auth: X, or "Not set" if absent]
    ```
    Retain full context materials internally, proceed to step_2.
</step_1_load>

<step_2_interview>
    **Role**: Architect

    ---

    ### Unified Proposal

    **Core principle**: Merge feature design and architecture decisions into **one single output**; user confirms or overrides in one round.

    **Action**:

    #### Part 1: Feature Design

    AI **selects which modules to output** based on the feature's nature, from the following material library:

    | Material | When applicable |
    |:---|:---|
    | Flow description (user journey / system flow / command flow) | Multi-step interaction or processing chain |
    | Core entities & data | New or modified entities involved; existing entities use `→ ref: data_snapshot.json#EntityName` |
    | Touchpoints (pages / commands / endpoints / methods) | User-facing or external interfaces exist |
    | Pre-defined decisions | When goal contains `[User Preset]` → highlight and enforce strictly |

    **Reference rules**:
    - Entities/types already in global → `ref: data_snapshot.json#X`, only describe what this feature **adds or modifies**
    - Design philosophy/principles → `ref: vision.md#PrincipleName`, no need to restate
    - Upstream interfaces → `ref: features/<dep_ID>/spec.md#InterfaceName`
    - Existing design tokens/components → `ref: design_tokens.json#preset` / `ref: dictionary.json#component`

    **Universal requirement**: Use this feature's specific entity names and operation names; no generic descriptions


    #### Part 2: Architecture Recommendations

    [[SKILL: Follow `archi-plan-options` Skill's three-step selection logic (Convention Inheritance -> Tag Routing -> Recommend vs. Expand) to generate architecture recommendations across five dimensions.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-plan-options/SKILL.md` and follow its three-step logic)]]

    When expanding a Q-table, follow the format in [[SKILL: `archi-interview-protocol` Skill's standard output format]][[NO-SKILL: `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md`]].

    #### Output Format

    ```
    ## Feature Proposal: [Feature Name] ([ID])

    ### Feature Design
    [Output per complexity level, see Part 1 above]

    ### Architecture Recommendations
    | Dimension | Recommended | Source | Rationale |
    |:---|:---|:---|:---|
    | Core Structure | [Recommended option] | Feature | [1-2 sentences specific to this feature] |
    | Interaction Pattern | [Recommended option] | Feature | [Rationale] |
    | Error Handling | [Convention value] | Project Convention | ref: 02_tech_stack.md §9 |
    | ... | ... | ... | ... |

    [Only expand option table for dimensions requiring user decision]:
    **[Q<n>] Question title**
    > Why user decision is needed (one sentence)

    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A [Recommended] | ... | Concrete behavior (2-3 sentences) | Full sentence | Full sentence |
    | B | ... | ... | ... | ... |
    | Z | Custom | (Describe) | - | - |

    ---
    > Reply **OK** to accept all recommendations; or annotate what to change, e.g.:
    > - Design correction: "Registration doesn't need email verification step"
    > - Dimension override: "Core Structure=C, Error Handling=B D"
    > - Question answer: "Q1=B"
    ```

    **⌨️ INPUT**: Reply **OK** to accept all; or free-text annotations for changes. No fixed format required.
</step_2_interview>

<step_2_5_refinement>
    **Role**: Consultant
    **Trigger**: User reply is not OK — contains corrections, questions, overrides, or logic conflicts.
    **Action**: Do NOT generate docs. Incorporate user feedback, refresh Unified Proposal and re-output. Wait for confirmation.
    - If feature design question → Compare alternatives, re-propose design
    - If architecture dimension question → Explain differences in this feature's context, update recommendation
    - If dimension override → Replace recommendation directly and adjust related design
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: System Admin
    **Constraint**: MUST update the following global files **BEFORE** generating Feature docs.

    **Boundary**: Only register **project business domain** content. Architext framework concepts (scripts, scaffold, roadmap, plan, etc.) and framework infrastructure errors are prohibited from registration in global files.

    **Action Checklist**:
    1.  **`map.json`**: Register `[[__DOCS_DIR__]]/features/<ID>_<Slug>` in `directoryMapping`; define module responsibility and dependencies in `logicalTopology`.
    2.  **`dictionary.json`**: Extract **project business** new terms from the proposal to fill `entities`/`verbs`; register new shared tools to `utilities`; register new public components to `components`.
    3.  [?Data] **`data_snapshot.json`**: Add/modify Schema based on Core Structure recommendation. Prohibited from writing "TBD"; must write field names and types.
    4.  **`error_codes.json`**: Register new **business** error codes based on Error Handling recommendation. Framework script errors are handled by exit code + stderr; prohibited from registration.
    5.  **`map.json` featureRelations**: Determine if this feature is an "aggregator" — i.e., its core responsibility is to **list, summarize, or dynamically reflect** a class of other features (e.g., "list all commands", "aggregate all page entries", "register all routes"). If yes, append one record to `featureRelations`:
        ```json
        {
          "aggregator": "<this feature ID or file path>",
          "sources": "<one-sentence description of what is aggregated, e.g. 'all CLI command features'>",
          "evidence": "<basis, e.g. 'spec.md §X states this feature dynamically lists all Y-type features'>",
          "checkNote": "When features of this type are added or removed, check whether <aggregator> needs to be updated"
        }
        ```
        If not an aggregator, skip this step.

    **Output**: Change diffs of above files (brief).
</step_3_global_sync>

<step_4_generate>
    **Role**: Doc Engineer
    **Input**: Confirmed Unified Proposal (feature design + architecture recommendations) + updated global context.
    **Action**: Generate standard docs under `[[__DOCS_DIR__]]/features/<ID>_<Slug>/`.

    **1. `spec.md`** (Mandatory):
    - Template: `templates/spec.template.md`.
    - Convert confirmed feature design and architecture recommendations to Gherkin Scenarios.
    - Each Scenario must map to a concrete flow step or exception path from the feature design; do not invent scenarios.
    - If upstream task, must include explicit Interface/Type definitions.

    **2. `ui.md` + `ui.preview.html`** [?UI]:
    - **`ui.md`**: Template `templates/ui.template.md`. Convert Interaction Pattern recommendation to ITP v3.0 description; reference componentPresets from `design_tokens.json`.
    - **`ui.preview.html`**: Template `templates/ui.preview.template.html`. Generate browser-openable visual preview based on `ui.md` component tree; must include all states (Default/Loading/Empty/Error); use Tailwind CDN + actual color values from design_tokens. Prompt user to open in browser to confirm visual appearance after generation.

    **3. `plan.json`** (Mandatory):
    - Template: `templates/plan.template.json`.
    - Dynamically adjust Phases by project type; ensure each Task's context is self-contained.
    - Task descriptions explicitly state "Additive Only" + "Respect Unknowns".
    - **`decisions`**: Fill per dimension; `choice` supports multi-select (e.g. `A B`, space-separated), custom (`Z: …`); `rationale` must explain reasoning for code phase; do not leave empty.
    - **`notes`**: Fill each task's `notes` with: `[scope] · [spec ref] · [key constraints] · Verify: [concrete operation]`; used by `/archi.code` step_4 to locate context and run e2e; do not leave empty.
      > Example: `Implement POST /auth/login · spec §3.1 · JWT must not contain password · Verify: curl POST /auth/login returns 200 + token field`
    - Run `npx archi render` after generation to produce readable `.md` view.
</step_4_generate>

<step_5_audit>
    **Role**: Chief Auditor
    **Checklist**:
    1.  **Design Fidelity**: Do Scenarios fully cover confirmed feature design (flow steps and exception paths)?
    2.  **Tech Consistency**: Any undeclared tech used?
    3.  **Data Integrity**: Do Scenario entities match confirmed core entities?
    4.  **Error Handling**: Is Error Handling recommendation covered?
    5.  **AX Compliance**: Are Anti-Clobbering and Interface Stability rules followed?

    Silently fix issues; mark critical issues with `⚠️ Risk Warning`.
</step_5_audit>

<step_6_signoff>
    **Action**:
    1.  Run `npx archi task --check` to verify Roadmap consistency.
    2.  Run `npx archi task <ID> --status active` to mark task as in-progress.
    3.  Run `npx archi render` to regenerate visual `.md` files.
    4.  Output summary.

    **Output**: Feature definition summary with Architecture Confirmation table (each dimension's final choice and rationale) and Next Steps table.
</step_6_signoff>

</protocol_plan>

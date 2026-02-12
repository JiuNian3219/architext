<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: Define Feature Spec/UI/Plan through deep architecture interview.
  **Logic**:
  - If input is **ID** (exists in Roadmap): Directly read context.
  - If input is **Context** (new requirement): Auto generate ID, append to Roadmap, then start interview.

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
    1.  **Read Roadmap**: Read `[[__DOCS_DIR__]]/global/00_roadmap.md`.
        - **Pre-flight**: Check if `<ID>` Deps are completed. If not, reject Plan (unless user forces).
    2.  **Read Tech Stack**: `02_tech_stack.md` (technical red lines).
    3.  [?UI] **Read Design Tokens**: `[[__DOCS_DIR__]]/global/03_design_tokens.md`.
    4.  [?Data] **Read Data Model**: `[[__DOCS_DIR__]]/global/04_data_snapshot.md`.
    5.  **Read Dependency Context** (if dependent tasks exist):
        - Read dependency tasks' `spec.md` (interface contracts) and `plan.md` (implemented content).
        - Avoid re-defining upstream interfaces; ensure integration points are precisely aligned.

    **Output**: Interview context materials (including key interface info from dependency tasks).
</step_1_load>

<step_2_interview>
    **Role**: Architect
    **Action**: Based on `[ctx]` and project status, present implementation option questions in 5 dimensions.

    ---

    **Q1. Data Model & Schema Strategy**
    > Decide data structure.

    **Web/Backend Example**:
    - **[A] Flat / Single Entity**: Single entity table.
      > `AI+`: Context local to one file, low error rate | `AI-`: None
    - **[B] 1:N Relation**: Standard parent-child.
      > `AI+`: Standard pattern | `AI-`: Must update two model files + relation logic
    - **[C] M:N Relation**: Many-to-many.
      > `AI+`: None | `AI-`: High risk of missing intermediate table or transaction logic
    - **[D] Recursive / Tree**: Tree/recursive structure.
      > `AI+`: None | `AI-`: Recursive generation prone to infinite loops or stack overflow
    - **[E] JSON / EAV**: Dynamic fields/JSON column.
      > `AI+`: Flexible schema | `AI-`: Loses type hints, AI cannot infer structure from schema
    - **[F] Virtual / Computed**: Virtual/computed properties.
      > `AI+`: No data migration needed | `AI-`: Complex query logic, prone to inefficient queries
    - **[Z] Custom**: (Please describe)

    **Q2. Interaction & Presentation Pattern**
    > Decide user interaction method.

    **Web/UI Project**:
    - **[A] CRUD Table/List**: Standard CRUD.
      > `AI+`: Standard components easy to generate | `AI-`: None
    - **[B] Wizard / Stepper**: Step-by-step wizard.
      > `AI+`: Explicit step state | `AI-`: Complex cross-step state management
    - **[C] Dashboard / Kanban**: Board/card view.
      > `AI+`: None | `AI-`: Drag logic depends on poorly documented 3rd-party libs, high hallucination risk
    - **[D] Modal / Drawer Drill-down**: Modal/drawer drill-down.
      > `AI+`: Localized context | `AI-`: Z-index/Focus Trap bugs common
    - **[E] Infinite Scroll / Feed**: Feed.
      > `AI+`: None | `AI-`: Virtualization logic extremely hard to get right
    - **[F] Editor / Canvas**: Editor/canvas.
      > `AI+`: None | `AI-`: Canvas API is imperative, much harder to generate than declarative DOM
    - **[Z] Custom**: (Please describe)

    **Q3. State Sync & Data Flow**
    > How data syncs between client, server, and storage.

    - **[A] Standard REST/Request**: Standard request/response.
      > `AI+`: Atomic operations, stateless, easy to test | `AI-`: None
    - **[B] Optimistic UI**: Optimistic update.
      > `AI+`: None | `AI-`: Rollback logic often forgotten
    - **[C] Polling / SWR**: Polling/SWR.
      > `AI+`: Libraries like React Query handle well | `AI-`: None
    - **[D] Realtime (Socket/SSE)**: Realtime push.
      > `AI+`: None | `AI-`: Connection state and reconnection logic extremely hard to generate correctly
    - **[E] Local-First / Offline**: Local-first.
      > `AI+`: None | `AI-`: Sync conflict resolution is advanced algorithmic work
    - **[F] Background Job / Async**: Async tasks.
      > `AI+`: Decoupled | `AI-`: Requires additional Worker context
    - **[Z] Custom**: (Please describe)

    **Q4. Edge Cases & Error Handling**
    > Feature-specific failure mode handling.

    - **[A] Fail Fast / Toast**: Fail fast with notification.
      > `AI+`: Simple one-line call | `AI-`: None
    - **[B] Form Validation**: Form-level validation.
      > `AI+`: Zod Schema as strong context for UI generation | `AI-`: Regex accuracy unstable
    - **[C] Retry Mechanism**: Auto retry.
      > `AI+`: None | `AI-`: Idempotency logic hard to verify
    - **[D] Fallback UI / Skeleton**: Skeleton/fallback UI.
      > `AI+`: Standard pattern | `AI-`: Requires parallel UI structure generation
    - **[E] Draft / Auto-save**: Draft/auto-save.
      > `AI+`: None | `AI-`: Storage throttling logic needed
    - **[F] Undo / Redo**: Undo/redo.
      > `AI+`: None | `AI-`: Complex state snapshot logic
    - **[Z] Custom**: (Please describe)

    **Q5. Access Control**
    > Who can perform this operation.

    - **[A] Public**: Public.
      > `AI+`: No auth middleware needed | `AI-`: None
    - **[B] Authenticated**: Logged-in users.
      > `AI+`: Standard middleware | `AI-`: None
    - **[C] Owner Only**: Resource owner only.
      > `AI+`: Simple `user.id === resource.ownerId` | `AI-`: None
    - **[D] Role Based (RBAC)**: Specific roles.
      > `AI+`: Explicit rules | `AI-`: Complex guard logic, high context load
    - **[E] Shared / Team**: Team members visible.
      > `AI+`: None | `AI-`: Permission check involves complex Join queries
    - **[F] Tier / Subscription**: Paid/subscription restriction.
      > `AI+`: None | `AI-`: Mocking payment state is difficult
    - **[Z] Custom**: (Please describe)

    ---

    **Goal**: Lock `spec`, `ui`, `04_data`.

    **⌨️ INPUT (Flexible Reply)**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Role**: Consultant
    **Trigger**: User reply contains "unsure", "difference", "suggest" or obvious logic conflict.
    **Action**: Do NOT generate docs. Explain confusion, compare options, propose new suggestions, wait for confirmation.
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: System Admin
    **Constraint**: MUST update the following global files **BEFORE** generating Feature docs.

    **Action Checklist**:
    1.  **`01_map.md`**: Register `[[__DOCS_DIR__]]/features/<ID>_<Slug>` in Directory Mapping; define module responsibility and dependencies in Logical Topology.
    2.  **`02_dictionary.md`**: Extract new terms from interview to fill table; register new public components/modules.
    3.  [?Data] **`04_data_snapshot.md`**: Add/modify Schema based on Q1 choice. Prohibited from writing "TBD"; must write field names and types.
    4.  **`05_error_codes.md`**: Register new business error codes based on Q4 choice.

    **Output**: Change diffs of above files (brief).
</step_3_global_sync>

<step_4_generate>
    **Role**: Doc Engineer
    **Input**: Interview results + updated global context.
    **Action**: Generate standard docs under `[[__DOCS_DIR__]]/features/<ID>_<Slug>/`.

    **1. `spec.md`** (Mandatory):
    - Template: `templates/spec.template.md`.
    - Convert Q1 + Q4 to Gherkin Scenarios.
    - If upstream task, must include explicit Interface/Type definitions.

    **2. `ui.md`** [?UI]:
    - Template: `templates/ui.template.md`.
    - Convert Q2 to ITP v3.0 description; use semantic naming mapped to design_tokens.

    **3. `plan.md`** (Mandatory):
    - Template: `templates/plan.template.md`.
    - Dynamically adjust Phases by project type; ensure each Task's context is self-contained.
    - Task descriptions explicitly state "Additive Only" + "Respect Unknowns".
</step_4_generate>

<step_5_audit>
    **Role**: Chief Auditor
    **Checklist**:
    1.  **Tech Consistency**: Any undeclared tech used?
    2.  **Data Integrity**: Do data entities in Scenarios actually exist?
    3.  **Error Handling**: Is Q4 choice covered?
    4.  **AX Compliance**: Are Anti-Clobbering and Interface Stability rules followed?

    Silently fix issues; mark critical issues with `⚠️ Risk Warning`.
</step_5_audit>

<step_6_signoff>
    **Action**:
    1.  Run `npx archi task --check` to verify Roadmap consistency.
    2.  Run `npx archi task <ID> --status active` to mark task as in-progress.
    3.  Output summary.

    **Output**: Feature definition summary with Decisions Summary table (Q1-Q5 choices and impacts) and Next Steps table.
</step_6_signoff>

</protocol_plan>

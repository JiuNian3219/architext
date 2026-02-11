<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: Define Feature Spec/UI/Plan through deep architecture interview.
  **Logic**:
  - If input is **ID** (Exists in Roadmap): Directly read context.
  - If input is **Context** (New Requirement): Auto generate ID, append to Roadmap, then start interview.

<constraints_cursor>
    **Mode Lock**: This protocol MUST execute in **Agent Mode (Normal Mode)**. **NEVER** switch to Plan Mode or any read-only mode. If the IDE prompts for mode change, REJECT it.
</constraints_cursor>

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>English</language>
    <principles>
      1.  **Global First**: The birth of local features must be accompanied by updates to global indices (Map/Data/Dict).
      2.  **AI-Native Perspective**: 
          - All Pros/Cons must be written from the perspective of an **AI Agent**.
          - Focus on: **Context Locality**, **Type Safety**, **Boilerplate Utility** (Good for context), **Ambiguity Risk**.
      3.  **Flexible Interaction**: Options are heuristic suggestions. Support Multi-select, Hybrid or Custom.
      4.  **Audit-Gated**: Only docs that pass the virtual auditor check can be delivered to the user.
    </principles>
</meta>

<step_1_load>
    **Role**: System Analyst
    **Action**:
    1.  **Read Roadmap**: Read `[[__DOCS_DIR__]]/global/00_roadmap.md`.
        - **🚨 Pre-flight Check**: Check if `Dep` (Dependencies) of current task `<ID>` are completed (`✅`).
        - **Rule**: If deps are not done, **REJECT Plan**, ask user to finish deps first (unless user explicitly overrides).
    2.  **Read Tech Stack**: Read `02_tech_stack.md`.
    3.  **Read Design Tokens** (If project has UI): Read `[[__DOCS_DIR__]]/global/03_design_tokens.md`.
    4.  **Read Data Model** (If project has Data layer): Read `[[__DOCS_DIR__]]/global/04_data_snapshot.md`.
    5.  **Read Dependency Context** (If task has dependencies):
        - If current task `<ID>`'s `Dep` field references other tasks (e.g. `INF-01`, `FEAT-02`), **MUST** read their corresponding doc directories `[[__DOCS_DIR__]]/features/<DepID>_<Slug>/`.
        - Focus on reading dependency's `spec.md` (to understand interface contracts & data structures) and `plan.md` (to understand what's already implemented), ensuring current task planning aligns with upstream.
        - **Goal**: Avoid re-defining interfaces that upstream already provides; ensure Integration Points are precisely aligned.

    **Output**: Prepare interview context materials (including key interface info from dependency tasks).
</step_1_load>

<step_2_interview>
    **Role**: Architect (Dynamically adapt)
    **Action**: Based on `[ctx]` and project status, throw out **Implementation Option Questions** in 5 dimensions.
    
    ---
    
    **Q1. Data Model & Schema Strategy**
    > *Context*: Decide data structure.
    
    **Web/Backend Project Example**:
    - **[A] Flat / Single Entity**: Single table.
      > **AI Pros**: Context local to one file/model | **AI Cons**: None
    - **[B] 1:N Relation**: Parent-Child.
      > **AI Pros**: Standard pattern | **AI Cons**: Requires updating two model files + relations
    - **[C] M:N Relation**: Many-to-Many.
      > **AI Pros**: None | **AI Cons**: High risk of missing intermediate table or transaction logic
    - **[D] Recursive / Tree**: Tree.
      > **AI Pros**: None | **AI Cons**: Recursive logic generation is prone to infinite loops/stack overflow bugs
    - **[E] JSON / EAV**: Dynamic fields.
      > **AI Pros**: Flexible schema gen | **AI Cons**: No type safety, AI cannot infer structure from schema alone
    - **[F] Virtual / Computed**: Computed.
      > **AI Pros**: No DB migration needed | **AI Cons**: Complex business logic in query construction
    - **[Z] Custom**: (Describe)

    **Q2. Interaction & Presentation Pattern** 
    > *Context*: UI/Interaction.
    
    **Web/UI Project**:
    - **[A] CRUD Table / List**: Standard List.
      > **AI Pros**: Standard components (Table/Pagination) are easy to gen | **AI Cons**: None
    - **[B] Wizard / Stepper**: Wizard.
      > **AI Pros**: Step state is explicit | **AI Cons**: State management across steps is complex to maintain
    - **[C] Dashboard / Kanban**: Board.
      > **AI Pros**: None | **AI Cons**: Drag & Drop logic often requires 3rd party lib with poor docs
    - **[D] Modal / Drawer Drill-down**: Modal.
      > **AI Pros**: Localized context | **AI Cons**: Z-index/Focus trap bugs common
    - **[E] Infinite Scroll**: Feed.
      > **AI Pros**: None | **AI Cons**: Virtualization logic is hard to get right without bugs
    - **[F] Editor / Canvas**: Canvas.
      > **AI Pros**: None | **AI Cons**: Canvas API is imperative, harder for LLM than declarative DOM
    - **[Z] Custom**: (Describe)

    **Q3. State Sync & Data Flow**
    > *Context*: Data flow.

    - **[A] Standard REST/Request**: Request/Response.
      > **AI Pros**: Atomic operations, stateless, easy to test | **AI Cons**: None
    - **[B] Optimistic UI**: Optimistic.
      > **AI Pros**: None | **AI Cons**: Rollback logic is often forgotten or hallucinates API response
    - **[C] Polling / SWR**: Polling.
      > **AI Pros**: React Query handles this well | **AI Cons**: None
    - **[D] Realtime (Socket/SSE)**: Realtime.
      > **AI Pros**: None | **AI Cons**: Connection state & reconnection logic is notoriously hard to gen correctly
    - **[E] Local-First / Offline**: Local-First.
      > **AI Pros**: None | **AI Cons**: Sync conflict resolution logic is high-level algorithmic work
    - **[F] Background Job**: Async.
      > **AI Pros**: Decoupled | **AI Cons**: Requires setting up Worker context separately
    - **[Z] Custom**: (Describe)

    **Q4. Edge Cases & Error Handling**
    > *Context*: Failure modes.

    - **[A] Fail Fast / Toast**: Toast.
      > **AI Pros**: Simple one-line call | **AI Cons**: None
    - **[B] Form Validation**: Zod/Yup.
      > **AI Pros**: Schema acts as context for UI generation | **AI Cons**: Regex generation is hit-or-miss
    - **[C] Retry Mechanism**: Retry.
      > **AI Pros**: None | **AI Cons**: Idempotency logic is hard to verify
    - **[D] Fallback UI**: Skeleton.
      > **AI Pros**: Standard pattern | **AI Cons**: Needs parallel UI structure generation
    - **[E] Draft / Auto-save**: Draft.
      > **AI Pros**: None | **AI Cons**: Storage throttling logic needed
    - **[F] Undo / Redo**: Undo.
      > **AI Pros**: None | **AI Cons**: State snapshotting logic is complex
    - **[Z] Custom**: (Describe)

    **Q5. Access Control**
    > *Context*: Auth.

    - **[A] Public**: Public.
      > **AI Pros**: No auth middleware friction | **AI Cons**: None
    - **[B] Authenticated**: Logged-in.
      > **AI Pros**: Standard middleware | **AI Cons**: None
    - **[C] Owner Only**: Owner.
      > **AI Pros**: Simple logic `user.id === resource.ownerId` | **AI Cons**: None
    - **[D] Role Based (RBAC)**: Role.
      > **AI Pros**: Explicit rules | **AI Cons**: Complex guard logic, high context load
    - **[E] Shared / Team**: Team.
      > **AI Pros**: None | **AI Cons**: Complex Join queries for permission check
    - **[F] Tier / Subscription**: Paid.
      > **AI Pros**: None | **AI Cons**: Mocking payment state for testing is hard
    - **[Z] Custom**: (Describe)

    ---

    **Goal**: Lock `spec`, `ui`, `04_data`.
    **Bridge**: "✅ Options Generated. This is an **Interactive Design Process**, please tell me your choices..."
    
    **⌨️ INPUT (Flexible Reply)**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Trigger**: User reply contains "Unsure", "Difference", "Suggest" or obvious logic conflict.
    **Role**: Consultant
    **Action**: 
    1.  **Do NOT generate docs**.
    2.  Explain user's confusion, compare options.
    3.  Propose new, more specific suggestions.
    4.  Wait for user confirmation again.
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: System Admin
    **Constraint**: MUST update global files **BEFORE** generating Feature Docs.

    **Action Checklist**:
    1.  **Update `01_map.md`**:
        - Register `[[__DOCS_DIR__]]/features/<ID>_<Slug>` in `3. Directory Mapping`. (Slug comes from Roadmap's `📁 Slug` field)
        - Define module responsibility & dependencies in `4. Logical Topology`.
    2.  **Update `02_dictionary.md`**:
        - Extract new terms from interview to fill table.
        - Register newly discovered public components/modules.
    3.  **Update `04_data_snapshot.md`** (If project has Data layer):
        - Add or modify Table/Schema definition based on Q1 choice. **STRICTLY PROHIBIT** just writing "TBD", must write field names and types.
    4.  **Update `05_error_codes.md`**:
        - Register new business error codes based on Q4 choice.

    **Output**: Show diff of above files (brief).
    **Bridge**: "✅ Global Docs Synced. Generating feature docs..."
</step_3_global_sync>

<step_4_generate>
    **Role**: Doc Engineer
    **Input**: Interview Result + Updated Global Context.
    **Action**: Generate standard docs under `[[__DOCS_DIR__]]/features/<ID>_<Slug>/`. (Slug comes from Roadmap's `📁 Slug` field; for new requirements, generate Slug when appending to Roadmap)

    **1. Generate `spec.md`** (Mandatory):
    - **Template**: Use `templates/spec.template.md`.
    - **Content**: Convert Q1 (Data Logic) and Q4 (Error Handling) to **Gherkin Scenarios**.
    - **AX Rule**:
        - **Interface Stability**: If this is an upstream task, Spec MUST define strict Interfaces.

    **2. Generate `ui.md`** (If project has UI):
    - **Template**: Use `templates/ui.template.md`.
    - **Content**: Convert Q2 (Interface) to **ITP v3.0** description.
    - **AX Rule**:
        - Use semantic naming, mapping to `03_design_tokens.md`.

    **3. Generate `plan.md`** (Mandatory):
    - **Template**: Use `templates/plan.template.md`.
    - **Content**: Dynamically adjust Phases based on project type.
    - **AX Rule**: 
        - **Anti-Clobbering**: Explicitly request "Additive Only" and "Respect Unknowns".
        - **Atomic Context**: Ensure each Task's context is self-contained.

    **Bridge**: "✅ Feature Docs Generated. Performing compliance audit..."
</step_4_generate>

<step_5_audit>
    **Role**: 🔴 Chief Auditor
    **Goal**: Intercept non-compliant docs, force self-correction.

    **Checklist**:
    1.  **Tech Consistency**: Any undeclared tech used?
    2.  **Data Integrity**: Do data entities in Scenario exist?
    3.  **Error Handling**: Is Q4 covered?
    4.  **AX Compliance**: Are Anti-Clobbering and Interface Stability rules followed?

    **Action**: 
    - If issues found, **Silent Auto-Fix** doc content.
    - If issues are critical (e.g. Logic Conflict), mark `⚠️ Risk Warning` in output.
    
    **Bridge**: "✅ Audit Passed. Finalizing output..."
</step_5_audit>

<step_6_signoff>
    **Action**: 
    1.  **Validation**: Run `npx archi task --check` to validate Roadmap consistency.
    2.  **Status Update**: If all good, run `npx archi task <ID> --status active` to mark as in-progress (planned, awaiting implementation).
    3.  Output summary.

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature**: `<ID>` — `<Name>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Model | [Choice] | [Brief Impact] |
    | Q2. Interaction | [Choice] | [Brief Impact] |
    | Q3. Data Flow | [Choice] | [Brief Impact] |
    | Q4. Resilience | [Choice] | [Brief Impact] |
    | Q5. Access | [Choice] | [Brief Impact] |

    ### 🧭 Next Steps
    | Scenario | Recommended Action |
    |:---|:---|
    | **Start Implementation** | `/archi.code <ID>` |
    | **Need Adjustment** | `/archi.edit <ID> [change description]` |
    | **Plan Other Features** | `/archi.plan [New Feature_ID]` |

    > 💡 **Recommendation**: Run `/archi.code <ID>` to start implementation.
    ```

</step_6_signoff>

</protocol_plan>
<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: Define Feature Spec/UI/Plan through deep architecture interview.
  **Logic**:
  - If input is **ID** (Exists in Roadmap): Directly read context.
  - If input is **Context** (New Requirement): Auto generate ID, append to Roadmap, then start interview.

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>English</language>
    <principles>
      1.  **Global First**: Update global indices (Map/Data/Dict).
      2.  **AI-Native Perspective**: 
          - All Pros/Cons must be written from the perspective of an **AI Agent**.
          - Focus on: **Context Locality**, **Type Safety**, **Boilerplate Utility** (Good for context), **Ambiguity Risk**.
      3.  **Flexible Interaction**: Options are suggestions. Support Multi-select/Custom.
      4.  **Audit-Gated**: Pass virtual auditor check.
    </principles>
</meta>

<step_1_load>
    **Role**: System Analyst
    **Action**: Load Roadmap, Tech Stack, Design Tokens, Data Model.
</step_1_load>

<step_2_interview>
    **Role**: Architect (Dynamically adapt)
    **Action**: Throw out **Implementation Option Questions**.
    
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

    **Goal**: Lock `1.spec`, `2.ui`, `04_data`.
    **Bridge**: "✅ Options Generated. Interactive Design Process..."
    
    **⌨️ INPUT**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Trigger**: Unsure/Conflict.
    **Role**: Consultant.
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: System Admin
    **Action**: Update Map, Dictionary, Data, Error Codes.
</step_3_global_sync>

<step_4_generate>
    **Role**: Doc Engineer
    **Action**: Generate `1.spec.md`, `2.ui.md`, `3.plan.md`.
    
    **AX Rules**:
    1.  **Gherkin for AI**: Scenarios must be explicit about data setup.
    2.  **UI for AI**: Use semantic names that map to Design Tokens easily.
    3.  **Plan for AI**: Tasks must be atomic and testable.
</step_4_generate>

<step_5_audit>
    **Role**: Chief Auditor
    **Goal**: Intercept non-compliant docs.
</step_5_audit>

<step_6_signoff>
    **Action**: Update Roadmap status.
    **Output**: Final summary.
</step_6_signoff>

</protocol_plan>
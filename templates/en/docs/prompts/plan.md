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
      1.  **Global First**: The birth of local features must be accompanied by updates to global indices (Map/Data/Dict).
      2.  **Option-Based**: Interviews must provide concrete A/B/C/D/E/F implementation paths (at least 6 options), not open-ended Q&A.
      3.  **Flexible Interaction**: 
          - Options are just **heuristic suggestions**.
          - Explicitly inform user that **Multi-select (A+B)**, **Hybrid (A but with B's...)** or **Fully Custom** are supported.
          - i.e.: **Do not fill in mechanically, but use this as a starting point for design.**
      4.  **Rich Context**: Each option must include: Brief, Use Case, Pros/Cons, Technical Impact.
      5.  **Audit-Gated**: Only docs that pass the virtual auditor check can be delivered to the user.
      6.  **Frontmatter Preservation**: STRICTLY PROHIBIT deleting or modifying YAML Frontmatter of existing files.
    </principles>
</meta>

<step_1_load>
    **Role**: System Analyst
    **Action**:
    1.  **Read Roadmap**: Is target task `<id>` in `Ready` state? (Prevent jumping dependencies).
    2.  **Read Tech Stack**: Read `02_tech_stack.md` (Confirm technical red lines & project type).
    3.  **Benchmark Check**: Search for similar products or open source projects (if not defined in `start.md`), ensure design is not reinventing the wheel.
    4.  **Read Design Tokens** (If project has UI): Read `[[__DOCS_DIR__]]/global/03_design_tokens.md` (Confirm visual physics).
    5.  **Read Data Model** (If project has Data layer): Read `[[__DOCS_DIR__]]/global/04_data_snapshot.md` (Prepare Schema change).
    6.  **Identify Project Type**: Identify project type based on Tech Stack (Web/CLI/Backend/Library/Mobile/Embedded etc.).

    **Output**: Prepare interview context materials, clarify project type and reference benchmarks.
    **Bridge**: "✅ Context Loaded. Reference benchmarks are **[Benchmarks]**, generating targeted architecture decision questions..."
</step_1_load>

<step_2_interview>
    **Role**: Architect (Dynamically adapt based on project type)
    **Action**: Based on `[ctx]` and project status, throw out **Implementation Option Questions** in 5 dimensions.
    **Constraint**: 
    - Each question must provide **A/B/C/D/E/F** six concrete options + **Z** (Custom).
    - **Anti-Redundancy**: Strictly PROHIBIT asking Tech Stack questions already locked in `02_tech_stack.md` (e.g. "Which DB to use"). **Only ask "HOW to use" that tech**.
    
    ---
    
    **Q1. Data Model & Schema Strategy**
    > *Context*: Based on selected DB (Tech Stack), decide data structure for this feature.
    
    **Web/Backend Project Example**:
    - **[A] Flat / Single Entity**: Single entity table. *Use*: Independent resource, no complex relation. *Impact*: Simple CRUD.
      > **Pros**: Fast dev, no Join | **Cons**: Low extensibility
    - **[B] 1:N Relation (Parent-Child)**: Standard parent-child. *Use*: Comments, Order Items. *Impact*: FK constraints.
      > **Pros**: Data integrity | **Cons**: Join query needed
    - **[C] M:N Relation (Junction)**: Many-to-Many. *Use*: Tags, Followers, Favorites. *Impact*: Intermediate table needed.
      > **Pros**: Flexible | **Cons**: Complex query, Transaction needed
    - **[D] Recursive / Tree**: Tree/Recursive structure. *Use*: Directories, Org chart, Nested replies. *Impact*: CTE query or Adjacency List.
      > **Pros**: Infinite hierarchy | **Cons**: Recursive performance cost
    - **[E] JSON / EAV (Flexible)**: Dynamic fields/JSON column. *Use*: User config, Polymorphic attrs. *Impact*: Hard to index.
      > **Pros**: Flexible Schema | **Cons**: Weak consistency
    - **[F] Virtual / Computed**: Virtual/Computed props. *Use*: Stats report, Aggregated view. *Impact*: DB View or Real-time compute.
      > **Pros**: No storage needed | **Cons**: Compute intensive
    - **[Z] Custom**: (Please describe)

    **CLI/Library Project Example**:
    - **[A] Transient (In-Memory)**: Transient memory object. *Use*: One-off command. *Impact*: Destroyed on exit.
    - **[B] Serialized File**: Serialized file (JSON/YAML). *Use*: Simple persistence. *Impact*: IO cost.
    - **[C] SQLite (Embedded)**: Embedded SQL. *Use*: Complex local query. *Impact*: Native binding dependency.
    - ... (Generate others based on scenario)

    ---

    **Q2. Interaction & Presentation Pattern** 
    > *Context*: Decide how user operates this feature.
    
    **Web/UI Project**:
    - **[A] CRUD Table / List**: Standard CRUD List. *Use*: Admin, Resource list.
      > **Pros**: High efficiency, Standard | **Cons**: Boring
    - **[B] Wizard / Stepper**: Step-by-step wizard. *Use*: Complex form, Onboarding.
      > **Pros**: Lower cognitive load | **Cons**: Long path
    - **[C] Dashboard / Kanban**: Board/Card view. *Use*: Task mgmt, Status flow.
      > **Pros**: Intuitive, Drag friendly | **Cons**: High screen space req
    - **[D] Modal / Drawer Drill-down**: Modal/Drawer drill-down. *Use*: Lightweight action keeping context.
      > **Pros**: Stay on page | **Cons**: Limited depth
    - **[E] Infinite Scroll / Feed**: Information feed. *Use*: Social, Browsing.
      > **Pros**: Immersive | **Cons**: Hard to locate
    - **[F] Editor / Canvas**: Editor/Canvas. *Use*: Creation, Layout.
      > **Pros**: High freedom | **Cons**: Extremely complex impl
    - **[Z] Custom**: (Please describe)

    **CLI Project**:
    - **[A] Arguments & Flags**: One-time args input. *Use*: Scriptable call.
    - **[B] Interactive Prompts**: Interactive Q&A. *Use*: Guiding user.
    - **[C] TUI (Text UI)**: Full screen Terminal UI. *Use*: Complex monitoring/mgmt.
    - ...

    ---

    **Q3. State Sync & Data Flow**
    > *Context*: How data syncs between client, server and storage.

    - **[A] Standard REST/Request**: Standard Request/Response. *Use*: Most scenarios.
      > **Pros**: Simple, Stateless | **Cons**: Non-realtime
    - **[B] Optimistic UI**: Optimistic update. *Use*: High freq small actions (Like, Star).
      > **Pros**: Extremely smooth | **Cons**: Rollback handling
    - **[C] Polling / SWR**: Polling/SWR. *Use*: Near-realtime (Build progress).
      > **Pros**: Easy implementation | **Cons**: Waste bandwidth
    - **[D] Realtime (Socket/SSE)**: Realtime push. *Use*: Chat, Collab, Notification.
      > **Pros**: Realtime | **Cons**: Connection mgmt cost
    - **[E] Local-First / Offline**: Local-First/Offline. *Use*: Notes, Editor.
      > **Pros**: Offline available | **Cons**: Conflict resolution hard
    - **[F] Background Job / Async**: Async job. *Use*: Export, AI Gen, Heavy task.
      > **Pros**: Non-blocking UI | **Cons**: Queue mgmt needed
    - **[Z] Custom**: (Please describe)

    ---

    **Q4. Edge Cases & Error Handling**
    > *Context*: Handling specific failure modes of this feature.

    - **[A] Fail Fast / Toast**: Fail fast with toast. *Use*: Normal action.
    - **[B] Form Validation**: Form level validation. *Use*: Input error.
    - **[C] Retry Mechanism**: Auto retry. *Use*: Network fluctuation.
    - **[D] Fallback UI / Skeleton**: Skeleton/Fallback UI. *Use*: Loading or partial fail.
    - **[E] Draft / Auto-save**: Draft/Auto-save. *Use*: Long content edit, prevent loss.
    - **[F] Undo / Redo**: Undo/Redo. *Use*: Complex edit action.
    - **[Z] Custom**: (Please describe)

    ---

    **Q5. Access Control**
    > *Context*: Who can do this? (Based on Auth system in Tech Stack)

    - **[A] Public**: Public. *Use*: Landing page, Public blog.
    - **[B] Authenticated**: Logged-in user. *Use*: General feature.
    - **[C] Owner Only**: Resource owner only. *Use*: Edit/Delete own content.
    - **[D] Role Based (RBAC)**: Specific role (Admin/Editor). *Use*: Mgmt feature.
    - **[E] Shared / Team**: Team member visible. *Use*: Collab resource.
    - **[F] Tier / Subscription**: Paid/Sub limit. *Use*: Premium feature.
    - **[Z] Custom**: (Please describe)

    ---

    **Goal**: Lock `1.spec` (Logic), `2.ui` (Visual, if applicable), `04_data` (Schema, if applicable).
    **Bridge**: "✅ Options Generated. This is an **Interactive Design Process**, please tell me your choices..."
    
    **⌨️ INPUT (Flexible Reply)**:
    - **Single**: `A | B | C | D | E`
    - **Multi**: `A+B | ...`
    - **Modify**: `A (but change...) | ...`
    - **Ask**: `Q2 I'm not sure, please explain diff between B and C` (Trigger Round 2)
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
        - Register `[[__DOCS_DIR__]]/features/<ID>_<Name>` in `3. Directory Mapping`.
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
    **Action**: Generate standard docs under `[[__DOCS_DIR__]]/features/<ID>_<Name>/`.

    **1. Generate `1.spec.md`** (Mandatory):
    - **Template**: Use `templates/spec.template.md`.
    - **Content**: Convert Q1 (Data Logic) and Q4 (Error Handling) to **Gherkin Scenarios**.
    - **Rule**: Reference Table/Struct names from `04_data_snapshot.md` and Error Codes from `05_error_codes.md` (if applicable).

    **2. Generate `2.ui.md`** (If project has UI):
    - **Role**: UI/UX Designer (Designer Mode)
    - **Action**: 
        - Introduce **Designer Mode**: Simulate professional designer perspective, considering aesthetics, layout balance, and interaction experience, not just function.
        - Reference `03_design_tokens.md` for design.
    - **Template**: Use `templates/ui.template.md`.
    - **Content**: Convert Q2 (Interface) to **ITP v3.0** description or corresponding CLI output spec.
    - **Rule**: 
        - STRICTLY PROHIBIT hardcoding color/size values, MUST use Tokens from `03_design_tokens.md` (if applicable).
        - **Aesthetics**: Avoid "Engineer Aesthetics", focus on whitespace, hierarchy, and visual guidance.


    **3. Generate `3.plan.md`** (Mandatory):
    - **Template**: Use `templates/plan.template.md`.
    - **Content**: Dynamically adjust Phases based on project type:
      - **Web Project**: Phase 1 (API/Data), Phase 2 (UI), Phase 3 (Integration)
      - **CLI Project**: Phase 1 (Core Logic), Phase 2 (Interface/Output), Phase 3 (Testing)
      - **Backend Project**: Phase 1 (Domain), Phase 2 (API), Phase 3 (Integration)
      - **Library Project**: Phase 1 (Core API), Phase 2 (Implementations), Phase 3 (Docs & Examples)
    - **Rule**: Each Checkbox must be a measurable atomic task.

    **Bridge**: "✅ Feature Docs Generated. Performing compliance audit..."
</step_4_generate>

<step_5_audit>
    **Role**: 🔴 Chief Auditor
    **Goal**: Intercept non-compliant docs, force self-correction.

    **Checklist (Dynamically adapt based on project type)**:
    1.  **Tech Consistency**:
        - Scan all generated docs.
        - Check if technologies not declared in `02_tech_stack.md` are used.
        - ❌ Violation: Auto-fix or warn.
    2.  **Visual Compliance (If project has UI)**: 
        - Scan `2.ui.md`.
        - ❌ Found: Hardcoded color values, pixel values.
        - ✅ Require: Must use Design Tokens.
    3.  **Data Integrity (If project has Data layer)**:
        - Scan `1.spec.md`.
        - Check if data changes in Scenarios reference real tables/structs in `04_data`.
    4.  **Error Handling Check**:
        - Scan `1.spec.md` and `3.plan.md`.
        - Check if error handling strategy chosen in Q4 is covered.
    5.  **SOTA Pattern Check**:
        - Scan all generated code/pseudocode.
        - Check if aligned with best practices defined in `02_tech_stack.md`.
        - ❌ Found Violation of Anti-Patterns (e.g. `02_tech_stack.md` §8 Anti-Patterns).
    6.  **Accessibility (If project has UI)**:
        - Scan `2.ui.md`.
        - Check if necessary accessibility attributes are planned.

    **Action**: 
    - If issues found, **Silent Auto-Fix** doc content.
    - If issues are critical (e.g. Logic Conflict), mark `⚠️ Risk Warning` in output.
    
    **Bridge**: "✅ Audit Passed. Finalizing output..."
</step_5_audit>

<step_6_signoff>
    **Action**: 
    1. Update `[[__DOCS_DIR__]]/global/00_roadmap.md` status to `🟢 In Progress`, and add Docs link.
    2. Output summary.

    **Constraint**:
    - **State Recovery**: Even after multiple rounds of conversation, final output **MUST contain AND ONLY contain** the following standard block. Do not output filler like "Okay, here is the result".

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Project Type**: `<Web/CLI/Backend/Library/Mobile>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Model | [Choice] | [Brief Impact] |
    | Q2. Interaction | [Choice] | [Brief Impact] |
    | Q3. Data Flow | [Choice] | [Brief Impact] |
    | Q4. Resilience | [Choice] | [Brief Impact] |
    | Q5. Access | [Choice] | [Brief Impact] |

    ### 📂 Global Updates
    * Map: Registered `features/<ID>_<Name>` (`01_map`)
    * Schema: [Added/Modified] (if applicable) (`04_data`)
    * Error Codes: [Added] (if applicable) (`05_error`)

    ### 📄 Local Docs Generated
    * 📄 `[[__DOCS_DIR__]]/features/<ID>_<Name>/1.spec.md`
    * 🎨 `[[__DOCS_DIR__]]/features/<ID>_<Name>/2.ui.md` (if applicable)
    * 🗓️ `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md`

    ### 🧭 Next Steps

    | Scenario | Recommended Action | Explanation |
    |:---|:---|:---|
    | **Start Implementation** | `/archi.code <ID>` | Start code implementation, follow task list in `3.plan.md` |
    | **Check Docs** | Check generated `1.spec.md` and `2.ui.md` | Confirm if docs meet expectations |
    | **Need Adjustment** | `/archi.edit <ID> [Change Description]` | If requirements need change, update Spec/UI docs |
    | **Plan New Feature** | `/archi.plan [New Feature_ID]` | If more features need planning |
    | **View Help** | `/archi.help` | Show full command manual |

    > 💡 **Recommendation**: Run `/archi.code <ID>` to start code implementation.
    ```

</step_6_signoff>

</protocol_plan>
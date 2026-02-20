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
    1.  **Read Roadmap**: Read `[[__DOCS_DIR__]]/global/roadmap.json`.
        - **Pre-flight**: Check if `<ID>` Deps are completed. If not, reject Plan (unless user forces).
    2.  **Read Vision**: Read `[[__DOCS_DIR__]]/global/vision.md`.
        - Extract North Star Metric and Design Philosophy; subsequent proposals must align with these.
    3.  **Read Tech Stack**: `02_tech_stack.md` (technical red lines).
    4.  [?UI] **Read Design Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`.
    5.  [?Data] **Read Data Model**: `[[__DOCS_DIR__]]/global/data_snapshot.json`.
    6.  **Read Dependency Context** (if dependent tasks exist):
        - Read dependency tasks' `spec.md` (interface contracts) and `plan.json` (implemented content).
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
    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Flat / Single Entity | Single entity table | Context local to one file, low error rate | None |
    | B | 1:N Relation | Standard parent-child | Standard pattern | Must update two model files + relation logic |
    | C | M:N Relation | Many-to-many | None | High risk of missing intermediate table or transaction logic |
    | D | Recursive / Tree | Tree/recursive structure | None | Recursive generation prone to infinite loops or stack overflow |
    | E | JSON / EAV | Dynamic fields/JSON column | Flexible schema | Loses type hints, AI cannot infer structure from schema |
    | F | Virtual / Computed | Virtual/computed properties | No data migration needed | Complex query logic, prone to inefficient queries |
    | Z | Custom | (Please describe) | - | - |

    **Q2. Interaction & Presentation Pattern**
    > Decide user interaction method.

    **Web/UI Project**:
    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | CRUD Table/List | Standard CRUD | Standard components easy to generate | None |
    | B | Wizard / Stepper | Step-by-step wizard | Explicit step state | Complex cross-step state management |
    | C | Dashboard / Kanban | Board/card view | None | Drag logic depends on poorly documented 3rd-party libs, high hallucination risk |
    | D | Modal / Drawer Drill-down | Modal/drawer drill-down | Localized context | Z-index/Focus Trap bugs common |
    | E | Infinite Scroll / Feed | Feed | None | Virtualization logic extremely hard to get right |
    | F | Editor / Canvas | Editor/canvas | None | Canvas API is imperative, much harder to generate than declarative DOM |
    | Z | Custom | (Please describe) | - | - |

    **Q3. State Sync & Data Flow**
    > How data syncs between client, server, and storage.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Standard REST/Request | Standard request/response | Atomic operations, stateless, easy to test | None |
    | B | Optimistic UI | Optimistic update | None | Rollback logic often forgotten |
    | C | Polling / SWR | Polling/SWR | Libraries like React Query handle well | None |
    | D | Realtime (Socket/SSE) | Realtime push | None | Connection state and reconnection logic extremely hard to generate correctly |
    | E | Local-First / Offline | Local-first | None | Sync conflict resolution is advanced algorithmic work |
    | F | Background Job / Async | Async tasks | Decoupled | Requires additional Worker context |
    | Z | Custom | (Please describe) | - | - |

    **Q4. Edge Cases & Error Handling**
    > Feature-specific failure mode handling.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Fail Fast / Toast | Fail fast with notification | Simple one-line call | None |
    | B | Form Validation | Form-level validation | Zod Schema as strong context for UI generation | Regex accuracy unstable |
    | C | Retry Mechanism | Auto retry | None | Idempotency logic hard to verify |
    | D | Fallback UI / Skeleton | Skeleton/fallback UI | Standard pattern | Requires parallel UI structure generation |
    | E | Draft / Auto-save | Draft/auto-save | None | Storage throttling logic needed |
    | F | Undo / Redo | Undo/redo | None | Complex state snapshot logic |
    | Z | Custom | (Please describe) | - | - |

    **Q5. Access Control**
    > Who can perform this operation.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Public | Public | No auth middleware needed | None |
    | B | Authenticated | Logged-in users | Standard middleware | None |
    | C | Owner Only | Resource owner only | Simple `user.id === resource.ownerId` | None |
    | D | Role Based (RBAC) | Specific roles | Explicit rules | Complex guard logic, high context load |
    | E | Shared / Team | Team members visible | None | Permission check involves complex Join queries |
    | F | Tier / Subscription | Paid/subscription restriction | None | Mocking payment state is difficult |
    | Z | Custom | (Please describe) | - | - |

    ---

    **Goal**: Lock `spec`, `ui`, `data_snapshot.json`.

    **⌨️ INPUT (Flexible Reply)**: Reply in question order; use `|` to separate answers between questions. Within one question, use `A`, `A B` (multi-select, space-separated), or `Z: user description`. Example: `A B | D keep it simple | C`.
</step_2_interview>

<step_2_5_refinement>
    **Role**: Consultant
    **Trigger**: User reply contains "unsure", "difference", "suggest" or obvious logic conflict.
    **Action**: Do NOT generate docs. Explain confusion, compare options, propose new suggestions, wait for confirmation.
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: System Admin
    **Constraint**: MUST update the following global files **BEFORE** generating Feature docs.

    **Boundary**: Only register **project business domain** content. Architext framework concepts (scripts, scaffold, roadmap, plan, etc.) and framework infrastructure errors are prohibited from registration in global files.

    **Action Checklist**:
    1.  **`map.json`**: Register `[[__DOCS_DIR__]]/features/<ID>_<Slug>` in `directoryMapping`; define module responsibility and dependencies in `logicalTopology`.
    2.  **`dictionary.json`**: Extract **project business** new terms from interview to fill `entities`/`verbs`; register new shared tools to `utilities`; register new public components to `components`.
    3.  [?Data] **`data_snapshot.json`**: Add/modify Schema based on Q1 choice. Prohibited from writing "TBD"; must write field names and types.
    4.  **`error_codes.json`**: Register new **business** error codes based on Q4 choice. Framework script errors are handled by exit code + stderr; prohibited from registration.

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

    **2. `ui.md` + `ui.preview.html`** [?UI]:
    - **`ui.md`**: Template `templates/ui.template.md`. Convert Q2 to ITP v3.0 description; reference componentPresets from `design_tokens.json`.
    - **`ui.preview.html`**: Template `templates/ui.preview.template.html`. Generate browser-openable visual preview based on `ui.md` component tree; must include all states (Default/Loading/Empty/Error); use Tailwind CDN + actual color values from design_tokens. Prompt user to open in browser to confirm visual appearance after generation.

    **3. `plan.json`** (Mandatory):
    - Template: `templates/plan.template.json`.
    - Dynamically adjust Phases by project type; ensure each Task's context is self-contained.
    - Task descriptions explicitly state "Additive Only" + "Respect Unknowns".
    - **`decisions`**: Fill per Q1-Q5 dimensions; `choice` supports multi-select (e.g. `A B`, space-separated), custom (`Z: …`); `rationale` must explain combination meaning or custom intent for code phase; do not leave empty.
    - **`notes`**: Fill each task's `notes` with execution shorthand (scope, spec section ref, key constraints) for `/archi.code` phase; do not leave empty.
    - Run `npx archi render` after generation to produce readable `.md` view.
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
    3.  Run `npx archi render` to regenerate visual `.md` files.
    4.  Output summary.

    **Output**: Feature definition summary with Decisions Summary table (Q1-Q5 choices and impacts) and Next Steps table.
</step_6_signoff>

</protocol_plan>

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

    For each applicable dimension, AI directly provides a **recommended approach** with rationale, rather than presenting the full option table.

    **Rules**:
    1. **Convention Inheritance**: Read project conventions from `02_tech_stack.md` Section 9. Dimensions with existing conventions → inherit as recommendation, mark source as `Project Convention`, do NOT expand option table (unless this feature has a **clear specific need** to deviate). Dimensions without conventions → follow rules below.
    2. Select applicable dimensions by project tags (UI/Data/CLI/Lib/API); skip inapplicable ones
    3. For each applicable dimension: AI picks the **best recommended option** from the reference library, writes rationale (1-2 sentences, specific to this feature)
    4. Only when a dimension has **two or more viable options whose choice significantly impacts implementation**, expand to a full option table for user decision
    5. Expanded option table rules unchanged: 3-5 options + `[Z] Custom`; descriptions must state concrete behavior; AI+/AI- must be full sentences, never "None"
    6. **Feature Contextualization (Critical)**: Must use entity names, operation names, and business flow from the feature design to describe options; no generic copy-paste

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

    ---

    ### Reference Option Library (AI internal use, not directly shown to user)

    The following are reference option libraries for each dimension. AI references these when selecting
    recommendations or expanding option tables in Part 2, but must rewrite using this feature's context.

    ---

    ### Dimension 1: Core Structure (Required)

    Route by project tags to the corresponding option library:

    #### [?Data] Data Model & Relation Strategy
    > How this feature's data is stored and organized.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Flat / Single Entity | All data in a single table/document, no foreign keys. E.g. "system_settings" table with one row per user's config. Fits independent entities, fixed fields, no cross-table joins | Context stays in one file; AI generates CRUD without cross-file tracking, lowest error rate | When data has natural hierarchy, flattening causes redundancy; splitting later is costly |
    | B | 1:N Relation | One parent has many children via FK. E.g. "User→Posts", post table has userId. Fits clear parent-child, children depend on parent | Most common pattern; AI generates JOINs and cascades accurately | Must maintain two Models + relation logic; AI may omit cascade delete/update or nested serialization |
    | C | M:N Relation | Two entities many-to-many via junction table. E.g. "Student↔Course" via enrollment. Fits mutually independent entities that need linking | Junction structure is standard, relation is clear | Easy to miss junction table and transactions; junction often needs extra fields (e.g. enrolledAt) that AI forgets |
    | D | Recursive / Tree | Self-reference forms tree. E.g. "comment replies", "nested folders", parentId points to self. Fits variable-depth hierarchy, categories, trees | Single table for any depth, schema is simple | Recursive query/rendering risks infinite loop or stack overflow; AI often misses recursion base case |
    | E | JSON / EAV | JSON column or Entity-Attribute-Value for dynamic fields. E.g. custom form fields vary by user. Fits schema that varies by user/scenario | Schema flexible; new fields need no migration | Lose DB-level type checks and indexes; AI cannot infer structure from schema, runtime type errors likely |
    | F | Virtual / Computed | Data derived from other fields, not stored. E.g. "order total = price × qty". Fits derived data, aggregates, formatting | No migration; data always consistent with source | Logic scattered in query layer; AI may produce N+1 or inefficient aggregates |
    | Z | Custom | (Describe your schema) | - | - |

    #### [?CLI] Input/Output & Config Design
    > How this feature receives input and what output format it produces.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Pure Args/Flags | All input via CLI args, e.g. `cmd --name foo --verbose`. No interaction. Fits scripts, CI/CD pipelines | Input is explicit; AI infers parser and help | Many args hurt recall; complex nested config hard to express in CLI |
    | B | Interactive Prompts | Step-by-step prompts after run: "Project name?" → "Template?" → "Confirm?". Fits init wizards, config generators | Each prompt step is isolated; AI generates logic step-wise | Must handle Ctrl+C, back, defaults; tests need stdin mock |
    | C | Hybrid (Args + Prompts) | Prefer CLI args; prompt for missing values. E.g. `cmd --name foo` skips name prompt. Fits both scripts and manual use | Best of both; modern CLI practice | Must keep arg parsing and prompts consistent |
    | D | Config File | Read from config, e.g. `cmd --config config.json`. Fits many params, versioned config | JSON Schema for validation; AI can generate parser from Schema | Handle file missing, malformed, Schema migration |
    | E | Stdin / Pipe | Data from stdin/pipe, e.g. `cat data.json | cmd process`. Fits data pipelines, Unix composition | Clear Parser contract | Streaming and encoding (UTF-8 BOM, etc.) error-prone |
    | Z | Custom | (Describe your I/O approach) | - | - |

    #### [?Lib] Public API & Type Design
    > How this feature is exposed to consumers.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Single Function | Export one or few functions, `import { fn } from 'lib'`. Fits stateless utilities (format, validate, convert) | Simplest interface; AI generates examples and tests accurately | Function signature grows as features expand |
    | B | Class / Instance | Export class, `new MyLib(config)` then call methods. Fits stateful modules with multiple operations | Class structure is clear; AI understands lifecycle | Deep inheritance complicates context; AI can mix up this binding |
    | C | Builder / Fluent | Chain calls: `lib.create().withName('x').build()`. Fits many optional configs, progressive build | Chain narrows types in TS; type-safe | Order constraints and generics are complex; AI may misgenerate types |
    | D | Config Object | Accept config object: `init({ name: 'x', plugins: [...] })`. Fits many init params | interface/Zod defines shape; AI infers behavior well | Config bloat, default merging complexity |
    | E | Plugin / Middleware | Slim core, extend via plugins. E.g. Express middleware, Vite plugins. Fits highly extensible frameworks | Core stays small; AI can generate plugins independently | Plugin interaction, order, type safety hard |
    | Z | Custom | (Describe your API design) | - | - |

    #### [?API] Interface & Route Design
    > API endpoint structure and call style for this feature.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | RESTful CRUD | Standard REST: GET/POST/GET/:id/PUT/DELETE for resources. Fits clear entities, standard CRUD | REST is ubiquitous; AI has strong training data | Complex queries and cross-resource ops strain pure REST |
    | B | RPC-Style Actions | Action endpoints, e.g. `POST /send-invite`, `POST /calculate-price`. Fits actions not mapping to CRUD | Endpoint semantics explicit; AI infers from name | No uniform convention; naming drift, endpoint bloat |
    | C | GraphQL | Single endpoint + query language; client picks fields. Fits changing frontend needs | Schema as docs; strong typing; flexible queries | Resolver N+1, fine-grained auth complex; DataLoader bugs common |
    | D | Nested Sub-resource | Nested routes for hierarchy: `GET /users/:id/posts`, `POST /teams/:id/members` | Routes reflect data; AI infers query logic | Deep nesting makes URLs long; must validate parent ownership |
    | Z | Custom | (Describe your API design) | - | - |

    ---

    ### Dimension 2: Interaction Pattern (Required)

    #### [?UI] Presentation & Interaction Mode
    > What UI the user sees and how they interact.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | CRUD Table/List | Data in table/list; filter/sort/paginate; click row for detail; add/edit/delete buttons. Classic data management; fits admin, resource lists | Table UI has most training data; highest accuracy | Pagination+sort+filter combo, state management |
    | B | Wizard / Stepper | Multi-step flow: Step 1 basics → Step 2 config → Step 3 confirm. Progress bar, step indicator, back/next. Fits registration, wizards | Each step isolated; AI generates Step components | Cross-step data sharing and validation complex |
    | C | Dashboard / Kanban | Cards/columns; drag between columns. E.g. "Todo→In Progress→Done". Click card for detail. Fits task management, workflows | Visual, each card is unit of context | Drag logic relies on poorly documented libs; AI hallucination risk |
    | D | Modal / Drawer | Click list item → overlay or drawer for detail/edit. Close returns to list. Fits quick edit without routing | Localized context; no route change | Z-index, focus trap, Escape, scroll lock bugs common |
    | E | Infinite Scroll / Feed | Load more on scroll; endless stream. Fits social feeds, news | Basic "load more" is simple | Virtual scroll hard; scroll restore, fast scroll white flash |
    | F | Editor / Canvas | Rich text or canvas for free input/draw/drag. Fits doc editors, flowchart tools | High ceiling for power users | Canvas imperative; Rich text Selection API very complex |
    | Z | Custom | (Describe your interaction approach) | - | - |

    #### [?CLI] User Interaction Mode
    > How user interacts with this CLI and what feedback they see.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Silent / Batch | No interaction; stdout on success, stderr on fail. Fits pipe tools like grep, jq | Simplest; easy to test | No progress feedback during run |
    | B | Progress / Spinner | Progress bar or spinner; summary at end. Fits long-running tasks | clack/ora support; few lines to wire | Non-TTY fallback, terminal width changes |
    | C | Interactive Menu | select/multiselect/confirm. Fits many entry points, browsing | Menu structure clear; AI generates handlers | Deep menus poor UX; fallback for non-interactive terminals |
    | D | REPL / Shell | Loop: input command → output → repeat. Fits explorers, debuggers | Each round independent | Session state, history, tab completion |
    | E | Watch / Daemon | Run continuously; react to changes. Fits tsc --watch, nodemon | Event-driven model clear | Cross-platform watch, debounce, graceful exit |
    | Z | Custom | (Describe your interaction approach) | - | - |

    #### [?API] Client Integration Mode
    > How callers integrate with this API.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Direct HTTP Call | Client fetches directly, e.g. `fetch('/api/users')` | No extra layer; simplest | Types manual; drift on change; repeated code |
    | B | SDK / Client Lib | Typed SDK; `import { api } from 'sdk'` | Strong typing; compile-time change detection | Must maintain SDK, releases |
    | C | Code Generation | Generate from OpenAPI/GraphQL Schema | Types auto; zero manual maintenance | Limited customization; Schema changes need regeneration |
    | D | Webhook / Event | API pushes to client endpoint. Fits async events | Decoupled; no polling | Signature, retry idempotency, timeout often overlooked |
    | Z | Custom | (Describe your integration approach) | - | - |

    #### [?Lib] Consumer Usage Mode
    > How consumers use this library.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Import & Call | Direct import and call: `import { parse } from 'lib'; parse(data)` | Simplest; high example/test accuracy | Public signature changes often as features grow |
    | B | Register & Use | Register config then use: `createApp(config); app.use(plugin); app.start()` | Init vs use separated | Registration order and lifecycle need docs |
    | C | Decorator / Annotation | Declare with decorators: `@Route('/users') class UserCtrl` | Declarative, less boilerplate | TS decorator spec evolving; AI may confuse versions |
    | Z | Custom | (Describe how consumers use it) | - | - |

    ---

    ### Dimension 3: Data Flow (Conditional + Convention Inheritance)

    **Ask when**: Project has [?UI+Data] or [?UI+API]; skip for pure [?CLI]/[?Lib].
    **Convention Inheritance**: If `02_tech_stack.md` §9 Data Flow has a value → auto-inherit, do not ask. Only expand option table when this feature needs to deviate from project default (e.g. needs Realtime while project default is Standard Request).

    #### [?UI] State Sync & Data Flow
    > How data flows between frontend and backend.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Standard Request | User action → request → wait → update UI. Classic request-response | Atomic, stateless; AI generates fetch+loading/error reliably | Every action waits for round-trip |
    | B | Optimistic UI | Update UI immediately; sync in background. Rollback on fail | Feels fast; no lag | Rollback logic often forgotten |
    | C | Polling / SWR | Periodic refetch or on focus | React Query/SWR handle well | Polling interval and cache invalidation need tuning |
    | D | Realtime (Socket/SSE) | Server pushes via WebSocket/SSE | Lowest latency | Reconnect, heartbeat, ordering hard |
    | E | Local-First / Offline | Data in local DB; sync when online | Offline works | Conflict resolution (CRDT/OT) is advanced |
    | F | Background Job | User triggers; work done async. Fits exports, batch jobs | Main thread decoupled | Task queue, status, completion notification |
    | Z | Custom | (Describe your data flow) | - | - |

    ---

    ### Dimension 4: Error Handling (Convention Inheritance)

    > `02_tech_stack.md` §9 establishes the project-level error handling strategy → auto-inherit, do not ask.
    > Only supplement when this feature has **special exception scenarios not covered by the project convention** (e.g. feature needs Undo/Redo but project convention only has Fail Fast).

    **Reference options** (AI adjusts wording by project type):
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Fail Fast / Notify | Stop on error; notify user (Toast/Alert/stderr). Default for most ops | One throw + global handler; AI rarely wrong | Abrupt; notification spam |
    | B | Form Validation | Validate before submit; block invalid input. E.g. "Invalid email", "Min 8 chars" | Schema for validation + types; AI accurate | Complex rules (async uniqueness, cross-field) error-prone |
    | C | Retry / Recovery | Auto-retry or retry button. E.g. request fails, retry 3x | Retry logic reusable | Must ensure idempotency; AI hard to verify |
    | D | Fallback / Skeleton | Skeleton/placeholder on load fail or empty | Skeleton is standard; AI accurate | Parallel UI for loading/empty/error |
    | E | Draft / Auto-save | Periodically save draft. E.g. long form every 30s | Save logic as Hook/utility | Debounce, conflict detection |
    | F | Undo / Redo | Undo after action. E.g. delete → Undo within 5s | Builds user confidence | State snapshot and history stack complex |
    | Z | Custom | (Describe your error handling) | - | - |

    ---

    ### Dimension 5: Access & Scope (Conditional + Convention Inheritance)

    **Ask when**: Project has [?Web/API] for auth; or [?Lib] for encapsulation; pure [?CLI] usually skip.
    **Convention Inheritance**: If `02_tech_stack.md` §9 Auth & Access has a value → auth **mechanism** is inherited (e.g. JWT/RBAC), but **permission level** remains a per-feature decision (e.g. Public vs Owner Only for a specific feature).

    #### [?Web/API] Access Control
    > Who can perform this operation and see what data. Auth mechanism inherits from project convention; only the permission level for this feature needs to be decided here.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Public | No auth. Fits public pages, public API | No auth middleware | Need rate limiting; vulnerable to abuse |
    | B | Authenticated | Logged-in users only | JWT/Session middleware; mature | Token refresh, multi-device logout |
    | C | Owner Only | Only resource creator | Simple `user.id === resource.ownerId` | Transfer and proxy scenarios need more |
    | D | Role Based (RBAC) | By role: admin/editor/viewer | Rules enumerable; AI generates guards | Guards scattered; role nesting complex |
    | E | Team / Shared | Team members. Fits collaboration | Boundary is team | Team membership query, cross-team sharing |
    | F | Tier / Subscription | By tier: free 3 projects, Pro unlimited | Config-driven; decoupled | Mocking payment state for tests hard |
    | Z | Custom | (Describe your auth approach) | - | - |

    #### [?Lib] Encapsulation & Visibility
    > How code is encapsulated; what is exposed.

    **Reference options**:
    | ID | Option | Description | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Full Public | All exported; consumers touch internals | AI sees full API | Any refactor can be breaking |
    | B | Facade / Entry Point | Single index.ts; selective exports | Public surface small; AI reads index | Must maintain export list |
    | C | Internal / Private | Minimal public API; rest internal | Smallest public; lowest breaking risk | AI lacks context when changing internal |
    | Z | Custom | (Describe encapsulation) | - | - |

    ---

    **Goal**: Lock `spec`, `ui` (if applicable), `data_snapshot.json` (if applicable).

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
    - **`notes`**: Fill each task's `notes` with execution shorthand (scope, spec section ref, key constraints) for `/archi.code` phase; do not leave empty.
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

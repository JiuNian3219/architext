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
      3.  **Rich Context**: Each option must include: Brief, Use Case, Pros/Cons, Technical Impact.
      4.  **Audit-Gated**: Only docs that pass the virtual auditor check can be delivered to the user.
      5.  **Frontmatter Preservation**: STRICTLY PROHIBIT deleting or modifying YAML Frontmatter of existing files.
      6.  **Project-Type Adaptive**: Questions and options must dynamically adapt to project type (Web/CLI/Backend/Library/Mobile etc.).
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
    - Each option must include: **Brief** | **Use Case** | **Pros** | **Cons** | **Technical Impact**.
    - Questions must dynamically adapt to project type (Skip or replace inapplicable questions).

    ---
    
    **Q1. Data & Logic Architecture**
    > *Context*: Decide the core data structure and business logic organization of the feature.
    
    **Web/Backend Project Example**:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Flat Table** | Single flat table | Simple CRUD, no complex relations | Simple query, good performance | Hard to extend complex relations | No ORM advanced features needed |
    | **B. Relational** | Relational multi-table | Clear entity relations | Data integrity, scalable | Complex query, JOINs needed | Migration tool needed |
    | **C. Nested/Tree** | Recursive tree structure | Comments, Categories, Org Chart | Supports hierarchy | Recursive query performance | CTE or Adjacency List needed |
    | **D. Event Sourcing** | Event sourcing | Audit trail, undo required | Full history, replayable | High complexity, storage cost | Event Store needed |
    | **E. Document/NoSQL** | Document/JSON storage | Semi-structured, flexible schema | Flexible, no Migration | Weak consistency, limited query | MongoDB/DynamoDB |
    | **F. Hybrid** | Hybrid solution | Core relational + Extended document | Balance of both | Highest complexity | Multi-datasource management |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    **CLI/Library Project Example**:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. In-Memory** | Pure memory struct | Stateless command, one-off execution | Simple, no dependency | No persistence | Only std lib needed |
    | **B. Config File** | Config file storage | User config, state persistence | Simple persistence | Concurrency issues, format limit | TOML/YAML/JSON parsing |
    | **C. SQLite Embedded** | Embedded DB | Complex query, large data | Full SQL support | Binary size increase | SQLite binding needed |
    | **D. Key-Value Store** | Key-Value Store | Simple cache, fast lookup | Minimal API | No complex query | RocksDB/sled/redb |
    | **E. Plugin System** | Plugin data source | Support multiple backends | Extensible, flexible | Complex interface design | Trait/Interface abstraction |
    | **F. External Service** | External service dep | Need remote data | Centralized management | Network dep, offline handling | HTTP Client/gRPC |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    ---

    **Q2. Interface & Presentation** 
    > *Context*: Decide how the feature interacts with users/external systems.
    > **Note**: Meaning differs based on project type.

    **Web Project (UI)** - Component Split & Layout:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Inline Block** | Embedded component | Feature as part of page | Intuitive, full context | Occupies page space | No extra route |
    | **B. Modal/Dialog** | Overlay dialog | Temporary action, stay on page | Focused, lightweight | Obstructs content, flow break | Dialog management needed |
    | **C. Drawer/Sidebar** | Side panel | Details view, stay on main view | Keep context | Responsive design complex | Layout system support needed |
    | **D. Full Page** | Independent page | Complex flow, need focus | Full space, independent URL | Nav needed, jump cost | Route config needed |
    | **E. Split View** | Split view | Contrast, preview scenarios | Multi-info display | High screen space requirement | Complex responsive |
    | **F. Tab/Accordion** | Tab/Accordion | Multi-panel switch | Save space | Hidden content invisible | Tab component dependency |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    **CLI Project** - Output & Interaction:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Plain Text** | Plain text output | Simple info, pipeable | Universal, scriptable | Unclear info hierarchy | No extra dependency |
    | **B. Colored Output** | Colored text | Human readable, level distinction | Good readability | No color terminal support issue | chalk/picocolors |
    | **C. Table/Grid** | Table display | Structured data display | Tidy, aligned | Width limit | cli-table/tty-table |
    | **D. Interactive TUI** | Interactive TUI | Complex interaction, multi-step | Rich experience | Complex dev | ink/blessed/ratatui |
    | **E. Progress/Spinner** | Progress indicator | Long running op | Good user feedback | Added complexity | ora/indicatif |
    | **F. Structured Output** | JSON/YAML output | Machine consumption, API integration | Parsable, integration friendly | Not human friendly | Serialization lib |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    **Backend/API Project** - Interface Protocol:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. REST API** | Standard RESTful | General purpose, 3rd party integration | Standardized, rich tools | Over/Under fetching | OpenAPI docs |
    | **B. GraphQL** | Flexible query lang | Complex data relations, multi-client | Precise fetch, type safe | Learning curve, N+1 problem | GraphQL Server |
    | **C. gRPC** | High performance RPC | Microservices, low latency | High perf, type safe | Hard to debug, browser limited | Protobuf definition |
    | **D. WebSocket** | Real-time bidirectional | Real-time update, chat, collab | Real-time push | Connection management complex | WS server support |
    | **E. Message Queue** | Async Message Queue | Decoupling, peak shaving, eventual consistency | High availability, scalable | Latency, complexity | RabbitMQ/Kafka |
    | **F. Server-Sent Events** | Server-Sent Events | One-way real-time update | Simple, HTTP compatible | One-way only, conn limit | SSE support |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    **Library Project** - API Design Style:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Builder Pattern** | Chained builder | Complex object config | Good readability, progressive | Code verbosity | Extra types needed |
    | **B. Fluent API** | Fluent interface | DSL style interface | Expressive | Hard to debug | Method returns self |
    | **C. Functional** | Functional API | Stateless, composable | Testable, no side effects | Learning curve | Higher-order function support |
    | **D. Object-Oriented** | Traditional OOP | Familiar pattern, encapsulate state | Intuitive, good IDE support | Inheritance complexity | Class/Interface design |
    | **E. Macro/DSL** | Macro/DSL | Reduce boilerplate, high expressiveness | Concise, specialized | Hard to debug, compile time | Macro system support |
    | **F. Callback/Event** | Callback/Event | Async handling, extension points | Flexible, extensible | Callback hell risk | Event system design |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    ---

    **Q3. State & Data Flow**
    > *Context*: Decide how data flows, caches, and syncs in the system.

    **Web Project**:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Server-Only** | Pure server state | Simple CRUD, SEO priority | Simple, no client complexity | Slow interaction response | SSR/MPA architecture |
    | **B. Client Cache** | Client cache | Frequent read, reduce requests | Fast response, reduce server load | Consistency issues | React Query/SWR |
    | **C. Optimistic UI** | Optimistic update | Write heavy, experience priority | Instant feedback, good UX | Rollback complex | State rollback logic |
    | **D. Real-time Sync** | Real-time sync | Collab, chat, notification | Data real-time | Connection mgmt, high cost | WebSocket/Firebase |
    | **E. Local-First** | Local first | Offline support, PWA | Offline available, fast | Conflict resolution complex | IndexedDB/CRDT |
    | **F. Hybrid** | Hybrid strategy | Choose by scenario | Flexible, optimized | Highest complexity | Multi-strategy management |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    **CLI/Backend/Library Project**:
    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Stateless** | Stateless | Pure function, independent exec | Simple, parallelizable | Cannot cache computation | Pure function design |
    | **B. Thread-Local** | Thread local state | Multi-thread, isolated state | Thread safe | Hard to share across threads | TLS/Thread Pool |
    | **C. Shared Mutable** | Shared mutable state | Need cross-component share | Direct, simple | Race condition risk | Mutex/RwLock |
    | **D. Actor Model** | Actor model | High concurrency, message passing | Lock-free, scalable | Learning curve | Tokio/Actix |
    | **E. Immutable** | Immutable state | Functional, no side effects | Thread safe, reason-able | Performance (copy) | Persistent data structures |
    | **F. Global Singleton** | Global singleton | Config, Logger, Connection Pool | Simple access | Hard to test, coupling | Lazy/OnceCell |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    ---

    **Q4. Error Handling & Resilience**
    > *Context*: Decide how system handles exceptions, failures, and edge cases.

    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Exception-Based** | Throw exception | Traditional lang, simple flow | Intuitive, break control flow | Implicit control flow, perf | try/catch/throw |
    | **B. Result Type** | Result/Either type | Explicit error handling, type safe | Forced handling, type safe | Verbose code | Rust Result/TS fp-ts |
    | **C. Error Code** | Return error code | C style, low level lib | Good perf, simple | Easy to ignore, weak semantic | Error code enum def |
    | **D. Fallback/Default** | Fallback default | Non-critical path, fault tolerance | Non-blocking, user friendly | Hide issues | Default value strategy |
    | **E. Retry with Backoff** | Retry & Backoff | Network req, temporary failure | Self-healing | Latency, complexity | Retry lib/Exponential backoff |
    | **F. Circuit Breaker** | Circuit Breaker | Microservices, prevent cascade | Fast fail, protect downstream | Config complex | Circuit breaker lib |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    ---

    **Q5. Security & Authorization**
    > *Context*: Decide feature access control and security policy.

    | Option | Brief | Use Case | Pros | Cons | Technical Impact |
    |:---|:---|:---|:---|:---|:---|
    | **A. Public/Open** | Fully open | Public resource, no sensitive data | Simple, no auth overhead | No access control | No auth middleware |
    | **B. API Key** | API Key auth | Service-to-service, simple scenario | Simple implementation | Key leak risk | Key management |
    | **C. Session-Based** | Session auth | Traditional Web App | Mature, strong control | Server state, hard to scale | Session storage |
    | **D. JWT Token** | JWT Stateless Token | Distributed, Microservices | Stateless, scalable | Hard to revoke token | JWT lib/verify |
    | **E. OAuth2/OIDC** | OAuth2/OpenID | 3rd party login, SSO | Standardized, secure | Complex, learning curve | OAuth Provider |
    | **F. RBAC/ABAC** | Role/Attribute perm | Complex permission control | Granular control | Design complex | Permission model design |
    | **Z. Custom** | (Please describe) | - | - | - | - |

    ---

    **Goal**: Lock down specific content of `1.spec` (Logic), `2.ui` (Visual, if applicable), `04_data` (Schema, if applicable).
    **Bridge**: "✅ Options Generated. Architect (User), please make decisions based on the detailed comparison above..."
    
    **⌨️ INPUT (Pipeline Reply)**:
    > **Format**: `Q1 | Q2 | Q3 | Q4 | Q5`
    > **Example**: `B | A | C | B | D`
    > **Custom Example**: `B | Z="CLI + JSON Dual Output" | C | B | A`
</step_2_interview>

<step_3_global_sync>
    **Role**: System Admin
    **Constraint**: MUST update the following global files **BEFORE** generating Feature Docs.

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

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Project Type**: `<Web/CLI/Backend/Library/Mobile>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Architecture | [Choice] | [Brief Impact] |
    | Q2. Interface/Presentation | [Choice] | [Brief Impact] |
    | Q3. State/Data Flow | [Choice] | [Brief Impact] |
    | Q4. Error Handling | [Choice] | [Brief Impact] |
    | Q5. Security | [Choice] | [Brief Impact] |

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

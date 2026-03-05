---
name: archi-plan-options
type: subprocess
description: Architext architecture decision option library. Defines candidate approaches and AI+/AI- analysis for five core dimensions (Core Structure / Interaction Pattern / Data Flow / Error Handling / Access & Scope), covering Web/CLI/API/Lib/Mobile/MiniApp/Extension/Desktop/AI Agent project types. Includes convention inheritance rules, project tag routing logic, and recommend vs. expand criteria. Referenced by /archi.plan step_2 Part 2 (architecture recommendation phase).
---

# Architecture Decision Option Library

## System Flow Position

```
/archi.plan step_2 Part 2
    ↓
[This Skill] three-step selection logic
    ↓
Direct recommendation row (most dimensions) or Q-table (when user decision needed)
    ↓
Written into Task Proposal architecture recommendation table
```

> **Skill responsibility boundary**:
> - Responsible for: candidate option content per dimension, convention inheritance rules, recommend vs. expand judgment
> - Not responsible for: Q-table format rules (see `archi-interview-protocol` Skill), Unified Proposal output format (see plan.md step_2)

---

## Selection Logic (3 Steps, Execute in Order)

### Step 1 · Convention Inheritance Check

Read `02_tech_stack.md` Section 9 (project conventions).

| Situation | Action |
|:---|:---|
| This dimension has a project convention | Inherit directly as recommendation, mark source as `Project Convention`, **do not expand option table** (unless this feature has a clear specific need to deviate) |
| This dimension has no project convention | Proceed to Step 2 |

### Step 2 · Project Tag Routing

Use project tags activated in step_1_load (`ui` / `data` / `cli` / `lib` / `api` / `mobile` / `miniapp` / `extension` / `desktop` / `ai`) to select applicable dimensions; skip inapplicable ones. Routing rules are in each dimension's heading.

### Step 3 · Recommend vs. Expand

| Condition | Action |
|:---|:---|
| There is a clearly superior option (context is sufficient) | Recommend directly with 1–2 sentence rationale; do not expand option table |
| 2+ viable options exist and the choice significantly impacts implementation | Expand Q-table (format: see `archi-interview-protocol` Skill) |

**Feature Contextualization (Critical)**: Whether recommending or expanding, use entity names, operation names, and business flow confirmed in the feature design. Never copy-paste generic descriptions.

---

## Dimension 1 · Core Structure (always apply)

Route to the applicable option library by project tag:

### [?Data] Data Model & Relationship Strategy

> Determines how this feature's data is stored and organized.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Flat / Single Entity | All data in a single table/document, no foreign keys. Suited for independent entities with fixed fields and no cross-table relations | Context concentrated in one file; AI generates CRUD without cross-file relationship tracking — lowest error rate | Forcing flat structure when data has natural hierarchy causes field redundancy; splitting later is costly |
| B | 1:N Relation | One parent entity owns multiple children via foreign keys. Suited for clear parent-child relationships where children depend on the parent | Most common relational pattern; AI has ample training data; high accuracy for JOIN queries and cascade operations | Must maintain two Models and association logic; AI may miss cascaded deletes/updates or nested serialization |
| C | M:N Relation | Many-to-many between two entities requiring a junction table. Suited for entities that aren't subordinate but need association | Junction table structure is standardized; relationship semantics are clear | Extremely easy to miss junction table creation and transaction logic; junction tables often need extra fields that AI frequently forgets |
| D | Recursive / Tree | Entity self-references to form a tree. Suited for hierarchies of unknown depth: categories, directories, comment trees | A single table can represent any depth; schema is concise | Recursive queries/rendering easily cause infinite loops or stack overflow; AI-generated recursion termination conditions are often incomplete |
| E | JSON / EAV | Stores dynamic fields in a JSON column or EAV pattern. Suited for uncertain schemas or fields that vary by user/context | Schema is flexible; adding fields requires no database migration | Loses DB-level type validation and indexing; AI cannot infer field structure from schema; prone to runtime type errors |
| F | Virtual / Computed | Data is not stored directly; computed from other fields at runtime. Suited for derived data, aggregate stats, formatted display | No data migration needed; data always stays consistent with source | Computation logic scattered across query layer; AI easily writes N+1 queries or inefficient aggregation |
| Z | Custom | (describe your data structure approach) | - | - |

### [?CLI] Input/Output & Configuration Design

> Determines how this feature receives input and presents output.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Pure Args/Flags | All input via command-line arguments. Suited for automated script calls, CI/CD pipelines | Input structure is explicit; AI can infer parsing code and help docs directly from argument definitions | High memory cost for users when there are many flags; complex nested config is hard to express on the command line |
| B | Interactive Prompts | Guided input via interactive Q&A after launch. Suited for init wizards, config generators, and other guided scenarios | Each prompt step is independent; AI can generate handling logic one by one in sequence | Must handle Ctrl+C cancel, back-navigation, and defaults; testing requires mocking stdin |
| C | Hybrid (Args + Prompts) | Reads CLI args first; prompts only for missing inputs. Suited for both script calls and manual use | Balances automation and interactivity; best practice for modern CLIs | Must maintain two logic paths (arg parsing + interactive prompts); AI must ensure both paths behave consistently |
| D | Config File | Reads input from a config file. Suited for many parameters that benefit from version-controlled configuration | Config can be strictly validated with JSON Schema; AI can generate parsing code from the schema | Must handle file-not-found, malformed format, and schema version migration edge cases |
| E | Stdin / Pipe | Receives data from stdin or pipe. Suited for data processing pipelines and combining with Unix commands | Input format can define a clear Parser contract | Streaming reads and encoding handling are error-prone; must handle empty input and very large files |
| Z | Custom | (describe your input/output approach) | - | - |

### [?Lib] Public API & Type Design

> Determines the interface shape this feature exposes to consumers.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Single Function | Exports one or a few independent functions. Suited for single-purpose, stateless utility functions | Simplest interface; AI achieves highest accuracy generating usage examples and unit tests | Function signatures may bloat when features expand |
| B | Class / Instance | Exports a class; consumers create instances and call methods. Suited for modules maintaining internal state with multiple related operations | Clear constructor + methods structure; AI easily understands object lifecycle | Deep inheritance increases context complexity; AI often makes mistakes tracking `this` binding |
| C | Builder / Fluent | Configuration built via method chaining. Suited for many optional configs and progressive construction | In TypeScript, chaining can progressively narrow types — good type safety | Call order constraints and generic gymnastics are complex; AI often generates incorrect type definitions |
| D | Config Object | Accepts a config object as primary input. Suited for many init params needing unified management | Config object can be strictly defined with interface/Zod; AI infers behavior from types very accurately | Heavy docs and validation logic when config options proliferate; merging defaults for optional fields is error-prone |
| E | Plugin / Middleware | Lean core; features extended via plugins/middleware. Suited for highly extensible framework-level libraries | Simple core code; AI can generate each plugin independently | Plugin interactions, execution order, and type safety are hard to guarantee; AI easily generates conflicting plugins |
| Z | Custom | (describe your API design approach) | - | - |

### [?API] Interface Contract & Route Design

> Determines the API endpoint structure and invocation pattern for this feature.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | RESTful CRUD | Standard REST resource routes. Suited for entities with clear CRUD operations | REST is the most prevalent API pattern; AI has extensive training data; highest accuracy for routes + controllers | Complex queries and cross-resource operations have limited expressiveness in pure REST; non-standard endpoints proliferate |
| B | RPC-Style Actions | Action-oriented endpoints, e.g. `POST /send-invite`. Suited for business actions that can't map cleanly to CRUD verbs | Endpoint semantics are explicit; AI can infer implementation logic directly from the action name | No unified convention; endpoint naming is inconsistent; hard to maintain as count grows |
| C | GraphQL | Single endpoint + schema query language. Suited for frontends with varying data needs that need to reduce round trips | Schema is documentation; strong typing; frontend freely composes queries | Resolver N+1 issues and fine-grained auth are complex; AI-generated DataLoader code often has caching bugs |
| D | Nested Sub-resource | Nested routes express parent-child relationships, e.g. `GET /users/:id/posts`. Suited for resources with clear hierarchy | Route structure mirrors data relationships; AI can infer query logic from routes | Nesting beyond 2 levels makes routes verbose; auth checks must verify parent resource ownership at each level |
| Z | Custom | (describe your API design approach) | - | - |

### [?Mobile] Navigation Architecture Strategy

> Determines where this feature sits in the mobile navigation hierarchy and how it is reached.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Stack Navigator | Hierarchical page stack; users navigate deeper and can go back. Suited for flows with clear depth | Most common mobile navigation pattern; AI generates push/pop with high accuracy | Deep nesting requires complex route parameter passing; parameter type safety easily lost |
| B | Tab Navigator | Fixed bottom/top tab bar switching between feature entry points. Suited for parallel features users switch frequently | Tab structure is fixed and explicit; AI can generate each Tab independently without interference | State isolation between Tabs and shared data sync require extra handling; AI easily misses data refresh on Tab switch |
| C | Drawer Navigator | Side-drawer navigation menu. Suited for many features that don't fit a Tab bar, like admin-style apps | Drawer menu structure is clear; AI accurately generates list items and route mappings | Drawer gesture conflicts with inner list scroll; cross-platform behavior differences AI often ignores |
| D | Modal / Bottom Sheet | Modal page or bottom slide-up panel without leaving the current context. Suited for quick actions, filters, confirmations | Context is localized; no root navigation needed; AI generates conditional rendering accurately | Focus Trap, gesture-close, keyboard-raise adaptation AI often handles incompletely; iOS/Android behavior differences |
| Z | Custom | (describe your mobile navigation approach) | - | - |

### [?MiniApp] Page Architecture & Request Strategy

> Determines the organization of this feature within the mini-program page structure and network request encapsulation.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Single Page | Feature is completed within a single mini-program page with no cross-page navigation. Suited for focused, low-step features | Page context is concentrated; AI can generate the full logic in a single file with low error rate | Logic bloats as features grow, reducing maintainability |
| B | Page + Sub-page Flow | Main page + navigated detail/edit sub-pages passing params via `navigateTo`. Suited for clear parent-child relationships | Each page has clear responsibility; AI can generate pages independently without context overlap | Cross-page parameter passing requires serialization; large data needs EventBus or global store, which AI easily misses |
| C | Tabbar + Module | Bottom Tabbar framework + independent module pages. Suited for parallel-feature main application shells | Tabbar structure is stable; AI can generate each Tab's content modularly | Cross-Tab data sharing requires global state management; mini-program store ecosystems are fragmented, AI's choice often confused |
| D | WebView Hybrid | Embeds H5 pages in WebView for complex rich-text editing or reusing existing web assets | Can reuse web tech stack; high feature completeness | WebView-to-native communication via bridge; AI-generated message protocols easily have compatibility issues; limited by platform sandbox |
| Z | Custom | (describe your mini-program page approach) | - | - |

### [?Extension] Architecture Layer Assignment Strategy

> Determines whether the core logic lives in the Background Service Worker, Content Script, or Popup layer.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Background-Centric | Core logic in Background Service Worker; other layers only do UI display and message forwarding. Suited for features needing persistent execution and cross-tab shared state | Logic centralized; message protocol is one-way and clear; AI can generate main logic in a single file | Service Worker lifespan is short (MV3); must handle wake-up and state persistence |
| B | Content-Centric | Main logic injected into the page's Content Script for deep DOM interaction. Suited for page enhancement, text selection, content modification | Can directly manipulate the page DOM without message relay | JS environments are isolated (isolated world); must communicate via window.postMessage; AI often confuses isolation boundaries |
| C | Popup-Centric | Main interaction and logic in the Popup page; Background only acts as minimal permission proxy. Suited for simple, click-to-use tool extensions | Popup is just a regular webpage; AI generates UI code identical to web | State lost when Popup closes; must persist to chrome.storage; Popup and Background have independent lifecycles |
| D | Full Architecture | Background + Content + Popup each handle specific responsibilities, coordinated via a message bus. Suited for complex multi-function extensions | Clear layer separation; each layer can be developed and tested independently | Three-layer message protocol is complex; AI easily misses message routing or confuses sender/receiver |
| Z | Custom | (describe your extension architecture approach) | - | - |

### [?Desktop] Process Model & IPC Strategy

> Determines how this feature's business logic is distributed between the Main process and Renderer process.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Main-Centric | Core business logic in the Main process; Renderer only handles display and user input. Suited for frequent system API calls (filesystem, native menus, system notifications) | Logic centralized in Main; AI generates business logic in one place; types constrained via IPC contract | Main process blocking makes the entire app unresponsive; Renderer must await IPC responses; AI easily forgets async handling |
| B | Renderer-Centric | Business logic primarily in Renderer; Main only exposes minimal system API proxies. Suited for UI-centric apps with few system calls | Renderer can use browser standard APIs; AI generates code identical to web development | System calls require contextBridge preloading; AI often forgets to declare preload whitelist, causing security issues |
| C | Worker Thread | Computation-heavy logic moved to Worker Thread to avoid blocking the UI thread. Suited for file processing, data transformation, heavy tasks | Decouples heavy tasks from UI; good responsiveness | Worker Thread cannot directly access DOM or IPC; must communicate via MessageChannel; AI easily misses serialization constraints |
| Z | Custom | (describe your desktop process distribution approach) | - | - |

### [?AI] LLM Integration & Agent Architecture Strategy

> Determines how this feature integrates LLM capabilities, organizes Prompts, and manages Agent execution flow.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Direct API Call | Calls LLM Provider API (OpenAI/Claude/Gemini, etc.) directly. Suited for simple features with no need to switch providers | Simplest implementation; AI generates SDK call code with high accuracy | Tightly coupled to provider; switching models requires code changes; streaming output handling inconsistent across providers |
| B | Provider Abstraction | Wraps a unified LLM client interface with swappable provider backends. Suited for supporting multiple models or local models | Interface is stable; AI can generate call code targeting the abstraction without caring about the underlying provider | Abstraction design is complex; capability differences between providers (context window, tool calling format) are hard to fully unify |
| C | Tool / Function Calling | Defines Tool Schema for the LLM; LLM decides when to invoke tools. Suited for AI actively calling external capabilities (search, code execution, DB queries) | Tool Schema is structured; AI can generate call adapter code from type definitions | Retry strategies for tool execution errors and state management for concurrent multi-tool calls are easily missed |
| D | Multi-Agent Orchestration | Multiple specialized Agents collaborate on complex tasks with a router/orchestrator role. Suited for workflows too complex for a single conversation | Each Agent has a single responsibility; AI can independently generate each Agent's Prompt and toolset | State passing between Agents, cycle detection, and cost control are extremely hard to design correctly; AI-generated orchestration logic easily produces infinite loops |
| Z | Custom | (describe your AI integration approach) | - | - |

---

## Dimension 2 · Interaction Pattern (always apply)

### [?UI] Display & Interaction Mode

> Determines what the user sees and how they interact.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | CRUD Table/List | Data in table or list with filter/sort/pagination, click to detail. Suited for admin panels, resource lists | Table component is the most AI-trained UI pattern; highest code generation accuracy | Large datasets require combined pagination+sorting+filtering logic; interaction state management is heavy |
| B | Wizard / Stepper | Splits complex operations into multi-step pages with progress bar and step indicator. Suited for registration flows, config wizards, multi-step forms | Each step's state is independently clear; AI can generate Step components one by one | Cross-step data sharing and validation are complex; AI easily misses state passing between steps |
| C | Dashboard / Kanban | Displays data as cards/columns with drag-and-drop. Suited for task management, status workflows, project boards | Visually intuitive; each card is an independent context unit | Drag-and-drop depends on third-party libs; AI has high hallucination risk for drag logic; many cross-browser compatibility issues |
| D | Modal / Drawer | Clicking a list item opens a floating modal or side drawer for detail/edit. Suited for quick edits that don't warrant a dedicated page | Context is localized; no route navigation needed | Z-index stacking, Focus Trap, Escape-to-close, and background scroll lock details frequently have bugs |
| E | Infinite Scroll / Feed | Auto-loads more content when scrolling to bottom, forming an endless feed. Suited for content consumption | Basic "load more" logic is simple | Virtual scrolling is extremely hard to get right; scroll position restoration and fast-scroll blank frames are very difficult for AI |
| F | Editor / Canvas | Rich text editor or free-form canvas interaction area. Suited for content creation / visual editing | High feature ceiling; great user freedom | Canvas is an imperative API, much harder to generate than declarative DOM; Selection API is extremely complex |
| Z | Custom | (describe your interaction approach) | - | - |

### [?CLI] User Interaction Mode

> Determines how users interact with this CLI feature and what feedback they see.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Silent / Batch | No interaction; pure silent execution — success to stdout, failure to stderr. Suited for scripts/pipeline steps | Simplest implementation; no I/O side effects; testing only requires asserting stdout | User gets no progress feedback during execution |
| B | Progress / Spinner | Shows progress bar or spinner during execution; prints result summary when done. Suited for time-consuming operations | Standard pattern; clack/ora libs have great support; a few lines to integrate | Must handle non-TTY environment degradation and terminal width changes |
| C | Interactive Menu | Shows a menu for the user to select actions. Suited for many feature entry points where users need to browse and choose | Menu structure is clear; AI can generate each option's handling logic individually | Deep menu hierarchies give poor UX; must handle fallback for non-interactive terminals |
| D | REPL / Shell | Enters a continuous interactive loop. Suited for exploratory tools, debuggers | Each interaction round is independent; AI can handle commands one by one | Must maintain session state, command history, and tab completion; high implementation complexity |
| E | Watch / Daemon | Runs continuously and watches for changes, automatically triggering actions. Suited for dev tools, file sync, auto-build | Event-driven model is clear; each trigger is handled independently | Cross-platform file watcher compatibility, debounce logic, and graceful shutdown are all pain points |
| Z | Custom | (describe your interaction approach) | - | - |

### [?API] Client Integration Mode

> Determines how callers integrate with and use this API.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Direct HTTP Call | Client sends HTTP requests directly. Simplest integration | No extra abstraction layer; AI generates request code most simply and directly | Type safety must be maintained manually; clients easily drift out of sync when interfaces change |
| B | SDK / Client Lib | Provides a packaged client SDK; callers use typed method calls | Strong type safety; interface changes caught at compile time | Must maintain SDK code and release versioning separately, adding overhead |
| C | Code Generation | Generates client code and type definitions automatically from OpenAPI/GraphQL schema | Schema is the contract; types auto-generated with zero manual maintenance | Generated code has limited customizability; schema changes require regeneration and compatibility checks |
| D | Webhook / Event | API proactively notifies clients via webhook callbacks. Suited for async event-driven scenarios | Decoupled; async notification requires no polling | Webhook signature verification, retry idempotency, and timeout handling are frequently missed by AI |
| Z | Custom | (describe your integration approach) | - | - |

### [?Lib] Consumer Usage Mode

> Determines how consumers use this library's features.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Import & Call | Directly import functions/classes and call them. Most direct; zero-config to get started | Simplest usage; AI achieves highest accuracy for example code and tests | May require frequent public signature changes when features expand, affecting downstream consumers |
| B | Register & Use | Register configuration first, then use. Suited for libraries needing initialization and lifecycle management | Init and usage phases are separated; AI can generate logic in stages | Registration order and lifecycle constraints need clear docs; AI may generate incorrect call sequences |
| C | Decorator / Annotation | Declare behavior via decorators. Suited for framework-level libs; declarative config reduces boilerplate | Declarative code is concise; intent is clear | TS decorator proposal is still evolving; AI may confuse old and new decorator syntax |
| Z | Custom | (describe your consumer usage approach) | - | - |

### [?Mobile] Mobile Interaction Mode

> Determines how users operate this feature on mobile devices and what feedback they see.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Standard List / Card | Data displayed as a list or cards; tap to see detail. Suited for content browsing and management features | Similar to Web CRUD Table; AI generates FlatList/ScrollView with high accuracy | Large lists need FlatList virtualization; pull-to-refresh and load-more boundary handling AI often misses |
| B | Form / Wizard | Multi-step forms or guided input. Suited for registration and creation flows | Each step's form is independent; AI can progressively generate fields and validation | Keyboard pop-up causing view occlusion requires KeyboardAvoidingView; cross-step data sharing needs state lifting |
| C | Gesture-Driven | Relies on swipe, long-press gestures (e.g., swipe-to-delete, drag-to-reorder). Suited for lightweight, high-frequency interactions | Gesture semantics are intuitive; user interactions feel smooth | Gesture conflicts (inner scroll vs. outer gesture) are extremely hard to debug; cross-platform gesture lib API differences AI easily confuses |
| D | Bottom Sheet / Action Sheet | Tap triggers a bottom slide-up panel or action menu. Suited for secondary actions, filters, quick selections | No route navigation; context is localized | Gesture-to-close, keyboard coordination, and nested scroll need careful handling; iOS/Android behavioral differences AI often ignores |
| Z | Custom | (describe your mobile interaction approach) | - | - |

### [?MiniApp] Mini-Program Interaction Mode

> Determines how users interact with this feature inside the mini-program.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Native Components | Uses platform native components (button, input, scroll-view) following platform UI guidelines. Suited for most standard features | Native components are platform-guaranteed; AI generates standard mini-program code with high accuracy | Native component style customization is limited; CSS support less complete than web |
| B | Custom Component | Encapsulates reusable UI units as custom components. Suited for high customization or multi-use scenarios | Component encapsulation improves context locality; AI can generate each component independently | Mini-program custom components have slot/properties/triggerEvent nuances different from web components; AI easily confuses them |
| C | Half-Screen / Full-Screen Popup | Half-screen popup or full-screen overlay. Suited for detail viewing, confirmation actions, filter panels | Popup structure is clear; AI generates conditional rendering logic accurately | z-index management and animation transitions need attention due to WeChat mini-program's renderer layer behavior |
| Z | Custom | (describe your mini-program interaction approach) | - | - |

### [?Extension] Extension Interaction Entry Mode

> Determines through which entry point users interact with the extension feature.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Browser Action Popup | Clicking the extension icon opens a small Popup window. Suited for config panels, quick actions, status displays | Popup is a standalone HTML page; AI generates code identical to regular web | Popup dimensions are limited (~600×600px); state is destroyed on close; data must be persisted to chrome.storage |
| B | Context Menu | Injects options into the right-click context menu. Suited for quick processing of selected text/links/images | Menu item registration logic is simple; AI can generate it in one pass | Menu display conditions must be precisely declared; operation results must be relayed to users via messages |
| C | Content Injection | Injects buttons, floating icons, or toolbars into target pages. Suited for page enhancement features | The injected UI's HTML/CSS is self-contained; AI can generate it independently | Must handle page style pollution (using Shadow DOM isolation); injection points may break when target page's DOM changes |
| D | Side Panel | Browser sidebar (Chrome sidePanel API), always present on the right. Suited for persistent tool panels | Full page space available; natural browser-native integration UX | sidePanel API is relatively new; limited cross-browser compatibility; requires user to manually enable |
| Z | Custom | (describe your extension interaction approach) | - | - |

### [?Desktop] Desktop Interaction Mode

> Determines how users interact with this desktop application feature and which system-level UI paradigm to use.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Window-Based UI | Standard application window; UI is similar to a web app. Suited for feature-rich apps requiring larger workspace | AI-generated web UI code can be reused directly; desktop increment is only IPC calls | Must handle multi-window management, window-size memory, and other desktop-specific details |
| B | Tray / Menu Bar App | Persistent system tray or macOS menu bar app; clicking opens a small floating window. Suited for background services and quick-view tools | Small, fixed interaction surface; AI can complete in minimal context | Tray icons must have light/dark variants; floating window size and position need precise calculation |
| C | Global Hotkey Trigger | Global keyboard shortcut to summon the app cross-application. Suited for Spotlight-style launchers and clipboard managers | Users don't need to switch focus; smooth UX | Registering global hotkeys requires system permissions; key conflicts are unpredictable; macOS/Windows registration APIs differ |
| D | Native Dialogs | Uses system native file pickers, dialogs, and notifications. Suited for file operations and system-level alerts | Zero style maintenance cost; users are familiar | Native dialog API calls differ between Electron and Tauri; must consult docs |
| Z | Custom | (describe your desktop interaction approach) | - | - |

### [?AI] Agent Interaction Output Mode

> Determines how users trigger AI capabilities and how they receive AI output.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Chat Interface | Conversational input/output with multi-turn context. Suited for open-ended Q&A and assisted creation features | Conversation structure is linear; AI can generate handling logic per message pair | Multi-turn context Token management (trimming/summarization) is easily overlooked; response quality drops sharply when context window is exceeded |
| B | Command-Driven | User issues structured commands; AI executes and returns results. Suited for AI-assisted specific tasks (code generation, document reorganization) | Command format can be schema-driven; AI generates parsing and execution logic accurately | Must handle command parse failures and missing parameters with graceful degradation; users must learn command syntax |
| C | Streaming Output | AI output is progressively rendered as a stream; users see generation in real time. Suited for long-form generated content | Streaming API pattern is standard (SSE/Stream); supported by all major SDKs | Retrying on stream interruption and rolling back already-rendered content are complex; AI often struggles with Markdown streaming render escaping bugs |
| D | Autonomous Agent | AI autonomously plans and executes multi-step tasks, returning complete results. Suited for complex workflow automation | No need for users to intervene step-by-step; end-to-end task completion | Observability of intermediate steps (progress display), partial rollback on failure, and cost control are extremely hard to implement correctly |
| Z | Custom | (describe your AI interaction output approach) | - | - |

---

## Dimension 3 · Data Flow

**Applicability**: Applies when project has `[?UI+Data]` or `[?UI+API]` tags; skip for pure `[?CLI]`/`[?Lib]`.
**Convention inheritance**: If `02_tech_stack.md` §9 Data Flow has a value → auto-inherit, do not expand option table. Only expand if this feature needs to deviate from the project default.

### [?UI] State Sync & Data Flow

> How data flows and syncs between the frontend and backend.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Standard Request | User action → send request → wait for response → update UI. Suited for most standard CRUD operations | Atomic operations, stateless; AI's most reliable pattern for fetch + loading/error state handling | Every operation waits for a network round trip; feels slow when operations are frequent |
| B | Optimistic UI | Update UI immediately after user action (assuming success); sync request in background. Suited for frequent operations that succeed most of the time | User experience is extremely fast; no interaction lag | Rollback logic (restoring state when server returns failure) is frequently forgotten; AI easily writes optimistic update without rollback |
| C | Polling / SWR | Periodically re-fetches data, or refreshes on window focus. Suited for near-real-time data that doesn't need millisecond updates | React Query/SWR libs are mature; AI only needs to configure staleTime/refetchInterval | Polling interval and cache invalidation strategy need balancing; misconfiguration causes pointless request storms |
| D | Realtime (Socket/SSE) | Server proactively pushes data to client. Suited for live chat, real-time collaboration, stock tickers | Lowest latency; data syncs in real time; best user experience | Reconnect logic, heartbeat keep-alive, and message ordering guarantees are extremely hard to implement correctly; AI-generated WebSocket code often has connection leaks |
| E | Local-First / Offline | Data stored locally first; synced to server when online. Suited for weak network or offline-required scenarios | Works offline; unaffected by network | Conflict resolution algorithms (CRDT/OT) are advanced problems; AI struggles to correctly implement multi-client concurrent conflict merging |
| F | Background Job | Returns immediately after user trigger; background processes async work. Suited for long operations (batch processing, file generation) | Decoupled from main thread; API response is fast | Requires extra task queue, status querying, and completion notification mechanisms |
| Z | Custom | (describe your data flow approach) | - | - |

---

## Dimension 4 · Error Handling (convention inheritance)

**Convention inheritance**: If `02_tech_stack.md` §9 Error Handling has an established project-level strategy → auto-inherit, do not expand option table.
Only add supplementary handling if this feature has **special exception scenarios not covered by the project convention** (e.g., this feature needs Undo/Redo but the project convention only has Fail Fast).

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Fail Fast / Notify | Abort immediately on error and notify user; no recovery attempt. Default strategy for most non-critical operations | Simplest implementation (one-line throw + global error handler); AI almost never gets this wrong | User experience feels harsh; notification spam when operations fail frequently |
| B | Form Validation | Field-level/form-level validation before submission blocks invalid input from reaching the backend | Zod/Yup schema can serve for both validation and type inference; AI accurately generates UI feedback from schema | Complex validation rules (async uniqueness, cross-field dependencies) — regex and timing are often wrong |
| C | Retry / Recovery | Auto-retry on failure or provides a manual retry button. Suited for unstable networks or intermittently failing external services | Retry logic can be encapsulated as a general utility function; highly reusable | Operation must be idempotent (no side effects from repeated execution); AI struggles to verify idempotency |
| D | Fallback / Skeleton | Shows degraded UI (skeleton screen, empty state) instead of blank page when loading fails or data is empty | Skeleton screen is a standard UI pattern; high AI generation accuracy | Must maintain parallel UI structures for each state (loading/empty/error); component count doubles |
| E | Draft / Auto-save | Automatically saves drafts periodically during user editing to prevent accidental data loss | Save logic can be abstracted into a reusable Hook/utility function | Save throttling (debounce/throttle) and conflict detection need careful handling |
| F | Undo / Redo | Supports undo/redo after operations. Suited for scenarios where users might make consequential mistakes | Increases user confidence; reduces anxiety about mistakes | State snapshot and history stack management logic is complex; AI-generated undo stacks often have memory leaks or state inconsistency |
| Z | Custom | (describe your error handling approach) | - | - |

---

## Dimension 5 · Access & Scope

**Applicability**: Ask about access control when project has `[?Web/API]` tags; ask about mini-program authorization when project has `[?MiniApp]` tags; ask about encapsulation when project has `[?Lib]` tags; typically skip for pure `[?CLI]`.
**Convention inheritance**: If `02_tech_stack.md` §9 Auth & Access has a value → authentication **mechanism** is inherited (e.g. JWT/RBAC), but **permission level** is still a feature-level decision (e.g. this feature: Public vs. Owner Only).

### [?Web/API] Access Control

> Who can perform this feature's operations and see its data. Auth mechanism inherits project convention; this only decides the permission level for this feature.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Public | Fully open; no login required. Suited for public content accessible to anonymous users | No auth middleware needed; simplest API layer | Must add rate limiting to prevent abuse; public endpoints are easy targets for scrapers and malicious calls |
| B | Authenticated | Logged-in users only. Suited for personal pages, order lists, and other identity-required scenarios | Standard JWT/Session middleware; AI's most mature implementation | Must handle token expiry refresh, multi-device session eviction, and other session management logic |
| C | Owner Only | Only the resource creator can act on it. Suited for "only edit your own content" scenarios | Simple ownership check; one line of code | If resources can be transferred or have delegated operation scenarios, a simple owner check isn't enough |
| D | Role Based (RBAC) | Permissions by role: admin/editor/viewer. Suited for admin panels, multi-role collaboration systems | Permission rules are explicit and enumerable; AI can generate guard logic from a role matrix | Guard logic scattered across every endpoint; high context load; role nesting makes permission inheritance complex |
| E | Team / Shared | Team/org members can access. Suited for collaboration, multi-tenant systems | Permission boundary is at team granularity; appropriate scope | Must query team membership table with complex JOINs; cross-team sharing adds further complexity |
| F | Tier / Subscription | Feature-gated by subscription tier. Suited for SaaS products with tiered features | Rules can be config-driven; decoupled from business logic | Mocking payment state and billing logic is difficult; tests require large volumes of fixture data |
| Z | Custom | (describe your access control approach) | - | - |

### [?MiniApp] Mini-Program Authorization Mode

> Determines which platform authorization level this feature requires.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Anonymous | No authorization needed; anonymous access. Suited for browse-only features | No auth flow; AI generates the simplest implementation | Must add rate limiting to prevent abuse; no user identity means no ability to associate history data |
| B | Platform Auth (openid) | Silent authorization obtains openid without showing a permission dialog. Suited for most features needing user distinction but not full profile data | No user action required; code2session flow is standard; AI generation accuracy is high | openid is unique only within the same mini-program/platform; cross-platform or cross-mini-program scenarios need unionid |
| C | Phone Binding | Dialog authorization to obtain phone number, bound to business account. Suited for real identity association or integration with existing account systems | Platform handles authenticity verification; business side only needs to store the association | Phone number authorization has strict UI restrictions (must use button component, JS trigger forbidden); AI easily generates non-compliant trigger methods |
| D | Full Profile Auth | Requests full user profile authorization (nickname/avatar). Suited for social features or scenarios requiring user info display | Single authorization obtains complete user information | WeChat tightened this authorization in 2022; must use new getUserProfile API; deprecated getUserInfo is common in AI training data causing confusion |
| Z | Custom | (describe your mini-program authorization approach) | - | - |

### [?Lib] Encapsulation & Visibility

> How this feature's code is organized and what is exposed to consumers.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Full Public | All features and types exported publicly. Suited for small, transparent utility libraries | AI doesn't need to guess which APIs are public; all types are traceable | Oversized public surface; any internal refactor is potentially a breaking change |
| B | Facade / Entry Point | Curated public API exported through a single entry file (index.ts); internals not exposed directly | Small, explicit public surface; AI can understand all available APIs from index.ts | Must continuously maintain the export list; new features must be explicitly added to the facade |
| C | Internal / Private | Only minimal public interface exposed; most implementation marked internal. Suited for core libs, security-sensitive modules | Smallest public surface; lowest risk of breaking changes | AI lacks context when modifying internal code; must frequently read source code |
| Z | Custom | (describe your encapsulation approach) | - | - |

---

> **Intermediate artifact**: This Skill is a subroutine. After producing a recommendation row or Q-table, control returns to `/archi.plan` step_2, where the caller assembles the output into the Task Proposal's architecture recommendation table.

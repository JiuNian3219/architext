---
name: archi-plan-options
description: Architext architecture decision option library. Defines candidate approaches and AI+/AI- analysis for five core dimensions (Core Structure / Interaction Pattern / Data Flow / Error Handling / Access & Scope). Includes convention inheritance rules, project tag routing logic, and recommend vs. expand criteria. Referenced by /archi.plan step_2 Part 2 (architecture recommendation phase).
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
Written into Feature Proposal architecture recommendation table
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

Use project tags activated in step_1_load (`[?UI]` / `[?Data]` / `[?CLI]` / `[?Lib]` / `[?API]`) to select applicable dimensions; skip inapplicable ones. Routing rules are in each dimension's heading.

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

**Applicability**: Ask about access control when project has `[?Web/API]` tags; ask about encapsulation when project has `[?Lib]` tags; typically skip for pure `[?CLI]`.
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

### [?Lib] Encapsulation & Visibility

> How this feature's code is organized and what is exposed to consumers.

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A | Full Public | All features and types exported publicly. Suited for small, transparent utility libraries | AI doesn't need to guess which APIs are public; all types are traceable | Oversized public surface; any internal refactor is potentially a breaking change |
| B | Facade / Entry Point | Curated public API exported through a single entry file (index.ts); internals not exposed directly | Small, explicit public surface; AI can understand all available APIs from index.ts | Must continuously maintain the export list; new features must be explicitly added to the facade |
| C | Internal / Private | Only minimal public interface exposed; most implementation marked internal. Suited for core libs, security-sensitive modules | Smallest public surface; lowest risk of breaking changes | AI lacks context when modifying internal code; must frequently read source code |
| Z | Custom | (describe your encapsulation approach) | - | - |

---

> **Intermediate artifact**: This Skill is a subroutine. After producing a recommendation row or Q-table, control returns to `/archi.plan` step_2, where the caller assembles the output into the Feature Proposal's architecture recommendation table.

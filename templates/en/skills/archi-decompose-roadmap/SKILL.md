---
name: archi-decompose-roadmap
description: Architext task decomposition expert. Five-step method: calibrate project type for infrastructure checklist, extract business Tasks and Infra tasks via dual perspective, identify Polish tasks, route NFR cross-cutting concerns by weight (inject vs. standalone), build dependency chain and output parallel batches. Task type encoded by ID prefix (INF/FEAT/POLISH/EDIT); tag field carries business domain labels. Produces Tier 1 Schema-compliant roadmap.json tasks as input contracts for `/archi.plan`.
---

# Roadmap Task Decomposition

## System Flow Context

```
Brief → [This Skill] → roadmap.json tasks
                            ↓
                   /archi.plan <task-id>
                   reads: vision.md + map.json + tech_stack.md
                   writes: spec.md (behavior spec / acceptance criteria)
                          ui.md (task UI scope) [?UI]
                          plan.json (executable steps + test checkboxes)
                   also updates: map.json / dictionary.json / data_snapshot.json
                   visual ref: [[__DOCS_DIR__]]/global/ui_context.md [?UI]
                            ↓
                   /archi.code → reads spec.md + ui.md + plan.json → writes code
```

> **Skill responsibility boundary**:
> - Owns: task what (description), done criteria (goal), dependency chain, design decision injection, Core interface contracts
> - Does NOT own: file paths (map.json), variable naming (dictionary.json), test cases (plan.json), UI component structure (ui.md)
>
> **Schema constraint (Tier 1 Strict)**: roadmap.json validated by CLI Zod Schema. **Adding or removing fields is forbidden.**

## Invocation Mode

| Mode | Triggered By | Input | Constraint |
|:---|:---|:---|:---|
| From Scratch | `/archi.start` | Brief task list | No EDIT tasks allowed |
| Incremental | `/archi.scope` | Brief + existing Roadmap context | Never modify existing tasks; continue ID watermark |

---

## Decomposition Framework (5 Steps)

### Step 0 · Project Type Calibration

Identify project type from Brief's tech stack / description. Establish standard infrastructure checklist to prevent Step 2 from missing framework-level Infra.

| Project Type | Scaffold Must Include (beyond common build toolchain) |
|:---|:---|
| Web SPA / PWA | Routing skeleton (e.g. React Router) + global App Shell (layout / Provider / theme injection) |
| Full-Stack Web (SSR/SSG) | Routing conventions (loader/action/pages) + API Routes layer + global layout + Auth session management (Cookie/JWT); [?UI] theme injection |
| CLI Tool | Logger module + AppError handling layer + command registration entry |
| API Service (REST / GraphQL) | Router layer + middleware layer + DB connection layer + global error handling; [?GraphQL] Schema definition layer + DataLoader |
| Mobile App (native/cross-platform) | Navigation skeleton (React Navigation / Go Router) + platform adapter (iOS/Android permissions, native modules) + env config (dev/staging/prod) |
| Mini Program | Page routing config + global app.js/ts + request wrapper |
| Browser Extension | manifest.json (V2/V3) + Background Service Worker + Content Script injection + message bus (background ↔ content ↔ popup) + Popup/Options entry |
| Desktop App (standalone) | Main process entry (Electron main / Tauri main.rs) + IPC bridge + system capabilities (tray, hotkey) + native FS wrapper |
| Web + Desktop (Hybrid) | Web scaffold base + desktop runtime (Tauri/Electron) + system capabilities (tray, global hotkey, notifications); **desktop integration must be separate INF subtask** (OS differences, distinct from Web stack) |
| Library / SDK / NPM Package | Dual output (CJS + ESM) + public API entry (barrel index.ts) + type declaration (.d.ts) + Changelog / version toolchain; **no business Tasks, INF only** |
| Real-time / Collaborative App | WebSocket service layer + event Schema (shared types) + room/session management; [?CRDT] conflict resolution |
| AI Agent / MCP Tool | LLM client abstraction (provider-agnostic) + Prompt template management + Tool/Function Calling Schema + conversation state / Memory; [?MCP] MCP protocol adapter |

**Actions (two outputs)**:
1. **Inject Step 2 INF-01**: Write scaffold checklist for the project type into INF-01 description.
2. **Inject Step 1 scenario constraints**: Limit scenario phrasing by project type:

| Project Type | Scenario Template | Forbidden Terms |
|:---|:---|:---|
| CLI Tool | `User can [run command/args] → [terminal output]` | page, route, component, UI |
| Library / SDK | `Caller can [invoke API X] → [return Y]` | user, interface, interaction |
| API Service | `Client can [HTTP METHOD /path] → [response structure]` | frontend, page, component |
| Mini Program | `User can [page name] [action] → [visible result in WeChat]` | backend route, REST |
| Web SPA / Full-Stack / Mobile / Desktop | `User can [action] → [perceivable result]` | (no special limit) |

---

### Step 1 · PM Perspective → Business Tasks

Extract user scenarios from Brief, aggregate into business Tasks.

1. Convert each feature into scenario: `User can [action] → [perceivable result]`
2. Scenarios sharing the same core flow → merge into one business Task
   > **Note**: "Shared domain/theme" ≠ "Shared core flow". Scenarios in the same domain (e.g. "community interaction") but with distinct UI areas and implementation domains must be split per signals below; do not merge by theme alone. "Shared core flow" means: same UI view, same data entity, same state flow.
3. Granularity calibration (core rule: **one task = one `/archi.plan` session = one `tasks/<slug>/` subdir**):

    **Behavior perspective (PM)**:

    | Signal | Action |
    |:---|:---|
    | Description contains "and" (two independent concerns) | Split |
    | DoD has > 4 acceptance criteria | Split |
    | Task spans > 3 independent UI areas or implementation domains | Split |
    | Single spec.md cannot fully describe behavior in one `/archi.plan` | Split |
    | Two tasks have >50% file overlap | Merge |

    > **Note**: If "B only makes sense after A", that is a dependency — **do not merge**; declare `deps: [A]` for B in Step 4.

    **Implementation perspective (Engineering, independent of behavior; either triggers split)**:

    | Signal | Action | Example |
    |:---|:---|:---|
    | Task contains ≥2 **implementation domains**, each independently unit-testable | Split | Pure compute layer + UI render layer → separate |
    | Implementation requires ≥3 independent technical concerns | Split | Character rendering + state machine + animation API → three things |
    | One concern has independent boundary complexity (IME, Canvas, third-party chart API) | Extract that concern | Input capture + IME as separate task |

    > **Why engineering perspective**: Behavior describes "what user sees"; engineering describes "what AI must grasp when implementing". A task can be behaviorally cohesive (same page) but span multiple domains; AI in `/archi.code` will lose focus with too-wide context.

    **Granularity cap**:

    > A Roadmap Task = the smallest functional unit that **AI can produce a cohesive spec.md without further decomposition** (HTN Primitive executability).

    *Proxy metrics at decomposition (judge directly from Brief)*:

    | Proxy Metric | Cap | Action if exceeded |
    |:---|:---|:---|
    | Independent user operation flows in task description | ≤ 3 | Split |
    | Independent data entities (each with own state flow) | ≤ 2 | Split |
    | "and/or/and also" connecting independent concerns | ≤ 1 | Split |
    | Task cannot be validated without running another business Task | — | Check coupling, redraw interface boundary (INVEST-I) |

    > If `/archi.plan` estimates spec.md Scenario > 6 or plan.json Phase > 4, pause and prompt user to return to `/archi.scope` for re-split; do not force into a single task.

**DoD format** (by task type):

| Task Type | goal format |
|:---|:---|
| `FEAT-xx` | `When done, user can <verifiable user behavior>; boundary: <explicitly out of scope>` |
| `INF-xx` | `When done, <infrastructure deliverable description>, verified by <verification command>; boundary: <explicitly out of scope>` |
| `POLISH-xx` | `When done, <quality metric> improves from <baseline> to <target>; boundary: <explicitly out of scope>` |

> DoD is the basis for `/archi.plan` to generate spec.md acceptance criteria and plan.json test cases. FEAT must describe user-perceivable results; INF must describe infrastructure deliverables and verification; POLISH must describe quantifiable quality targets. Do not write implementation details (file paths, function names, test commands decided at plan stage).

Belong to parent task, do not make standalone: **lightweight** result page / completion page, empty state page, confirmation modal.

> **Exception**: Result page with independent data viz (chart lib), complex animation logic, or independent business logic → must be standalone business Task.

---

### Step 2 · Architect Perspective → Infra Tasks

Derive shared foundations from business Tasks; no preset infrastructure.

For each business Task ask: multiple Tasks depend on X and X must exist before Task → X is Infra task.

| Infra Type | Criteria |
|:---|:---|
| Project scaffold / global Schema / type definitions | All business Tasks depend; must cover Step 0 project type checklist |
| Shared core engine (typing engine, rule engine, etc.) | Either: ① ≥2 business Tasks directly call; ② pure logic layer, independently unit-testable, fully decoupled from UI. Use `INF-xx` ID (infrastructure by nature), `tag` can label domain (e.g. `Core`, `Engine`) |
| Third-party integration layer | Multiple business Tasks reuse same external service |

**Shared engine planning contract**: Shared core engine INF tasks must declare main export interfaces (function signatures or key interface names) at end of `description`.
Downstream `/archi.plan` sessions can align to that interface without reading upstream implementation.

**Infra task granularity: avoid over-fragmentation, forbid cross-layer stacking**:

- **No over-fragmentation**: Same-layer config items with no substantive technical difference (ESLint + Prettier + TypeScript strict + commitlint) → merge.
- **No cross-layer stacking**: Each architecture layer has distinct implementation details; merging blurs AI context; stacking layers into one INF task lengthens critical path and delays all business Tasks.

> **Architecture layer reference** (each has independent implementation boundary; in principle each as separate task):
> Project scaffold (build / code quality toolchain) | Data layer (DB connection / ORM / migrations) | Auth layer (Auth middleware / Session / JWT) | API router layer (route registration / middleware chain / global error handling) | Frontend infrastructure (theme / Design Token / global layout) | Third-party service integration (each service as separate INF task)

| Signal | Action |
|:---|:---|
| Related config items within same architecture layer | Merge |
| Spans independent architecture layers (e.g. DB connection + Auth middleware) | Split |
| Completely different tech stacks (e.g. local storage vs theme config) | Split |
| Involves OS-level system API (tray, global hotkey, file association) | **Force split** (Step 0 rule, overrides "same-layer merge") |
| Infra deliverable directly called by ≥2 business Tasks (interface-type) | Standalone task (must declare export interface contract) |

**Implicit standard feature scan** (often absent from Brief; must proactively add):

*Add as standalone business Task (Phase 2, user-visible behavior)*:

| Check | Trigger |
|:---|:---|
| User Profile / account settings page | Project has Auth (INF layer has auth middleware) |
| Account security / password settings page | Has Auth and user can change password or bind third-party account |
| Notification center / message list page | Has notification infra and notifications have read/unread state |

*Add as INF task (Phase 1, infrastructure)*:

| Check | Trigger |
|:---|:---|
| Notification infrastructure (server push / message queue) | ≥1 Task mentions "notification/reminder" but no INF Task |
| Search infrastructure (PG FTS index / external engine) | ≥2 business Tasks describe "search"; decide approach here, downstream Tasks depend |
| Permission / role management (RBAC) | Has Auth and ≥2 user roles (e.g. admin / user) |
| File storage integration (S3 / OSS wrapper) | ≥1 Task involves file upload / download / preview |
| Email / SMS sending integration | Task mentions "send email / verification code / SMS" |
| Payment integration | Task mentions "payment / order / checkout / refund" |

---

### Step 3 · NFR Filtering and Polish Task Identification

Route cross-cutting concerns by **effort weight**: lightweight → inject into goal; heavyweight → standalone `POLISH-xx` task.

> **"First task" definition** (for NFR injection): In dependency chain, task whose `deps` only include INF layer (no business pre-deps) and earliest to involve that NFR. If multiple candidates in same Batch, take smallest ID.

**Criteria**:

| Signal | Action |
|:---|:---|
| Only needs "do in passing" within business Task (e.g. use i18n key instead of hardcode) | **NFR inject** — append to first related task goal: `[NFR] <description>` |
| Needs standalone infrastructure (e.g. integrate next-intl, create translation file structure) | **INF task** — create `INF-xx`, Phase 1 |
| Needs cross-feature dedicated work, acceptance independently measurable (e.g. Lighthouse ≥ 90, full a11y audit) | **POLISH task** — create `POLISH-xx`, Phase 3 |

**By type**:

| Type | Lightweight → NFR inject | Heavyweight → Standalone |
|:---|:---|:---|
| Internationalization | Use i18n key within business Task | Integrate i18n framework + translation file structure → `INF-xx`; full translation coverage + language switch UI → `POLISH-xx` |
| Visual theme (config) | Brand color Token into scaffold | — |
| Visual theme (functional) | — | Dark/light toggle + OS preference detection → `FEAT-xx` (user-visible behavior) |
| Animation style | Transition duration into first Task with animation | — |
| Performance optimization | Lazy load / cache within single Task | Cross-feature optimization (LCP < 2s, bundle size target) → `POLISH-xx` |
| Accessibility | ARIA attributes within single Task | Full a11y audit + fixes → `POLISH-xx` |
| Packaging / distribution | — | Desktop packaging + auto-update config → `POLISH-xx` |

---

### Step 4 · Dependencies and Parallel Optimization

- **Real dependency chain**: Forbid all business Tasks depending only on `INF-01`; reflect real business relationships.
- **Business entity dependency (overrides minimal deps)**: If feature B's core subject is produced by feature A (B's data entity does not exist before A), B must declare dep on A. Example: Usage Log records Prompt; Prompt created by FEAT-Prompt_Create → Usage Log Task must depend on Prompt Task, not just INF layer.
- **Minimal dependency principle**: Do not add unnecessary deps; maximize Batch parallelism.

---

## Task Rules

1. **ID prefix and task type**:

   ID prefix is the **sole identifier** of task type; `/archi.plan` selects spec acceptance format by prefix.

   | ID Prefix | Task Type | Meaning | Phase |
   |:---|:---|:---|:---|
   | `INF-xx` | Infrastructure | Scaffold, Schema, toolchain, third-party integration | Phase 1 |
   | `FEAT-xx` | Feature | Business functionality: user-perceivable behavior | Phase 2 |
   | `POLISH-xx` | Quality | Performance, full i18n, a11y audit, packaging | Phase 3 |
   | `EDIT-xx` | Edit | Modify existing functionality (incremental mode only) | Same Phase as modified task |

   Continue ID watermark from max per prefix + 1; new project starts from `INF-01` / `FEAT-01`.

2. **Phase structure**:

   | Phase | ID | Name | Content |
   |:---|:---|:---|:---|
   | Phase 1 | `phase-infra` | Infrastructure | INF-xx tasks (scaffold, data layer, auth, API skeleton) |
   | Phase 2 | `phase-core` | Core Features | FEAT-xx tasks (business features) |
   | Phase 3 | `phase-polish` | Polish & Launch | POLISH-xx tasks (quality, packaging); omit if Brief has no polish needs |

3. **tag field = business domain label**:

   `tag` labels the **business domain** (e.g. `Core`, `Community`, `Auth`, `Data`), free text, determined by Brief.

   > **Note**: `tag` does NOT determine task type — task type is determined by ID prefix. E.g. `FEAT-05` (`tag: Community`) has task type Feature, not Community.

4. **Design decision injection**: Brief design decisions → inject into task `goal` end: `[User Preset] <content>`; do not repeat same decision across tasks. `/archi.plan` treats as hard constraint, writes into spec.md without asking.

5. **EDIT tasks**: Modify existing functionality → create `EDIT-xxx`, goal states scope; incremental mode only.

6. **Slug naming**: `slug` = `tasks/<slug>/` folder name, must clearly express task content, format `Pascal_Snake_Case` (e.g. `Typing_Engine_Core`). One task per subdir, no duplicates.

---

## Task JSON Schema (Tier 1 Strict, no add/remove fields)

```json
{
  "id": "FEAT-01",
  "title": "Task Title In English",
  "status": "pending | blocked",
  "description": "<1-2 sentences on what this task builds and scope. Shared engine tasks must declare main export interfaces at end>",
  "goal": "When done, user can <verifiable user behavior>; boundary: <explicitly out of scope>",
  "deps": ["INF-01"],
  "tag": "<business domain label, free text. e.g. Core, Community, Auth, Data, UI>",
  "slug": "Task_Title_Snake_Case"
}
```

> **ID prefix vs tag responsibility separation**:
> - `id` prefix (`INF-` / `FEAT-` / `POLISH-` / `EDIT-`) = task type, determines `/archi.plan` spec acceptance format
> - `tag` = business domain label, for human categorization only, does not affect AI behavior

`deps` empty or all `done` → `pending`; has incomplete deps → `blocked`

---

## Intermediate Outputs

> This Skill is a subroutine: after producing structured data, control returns to caller.
> - `/archi.scope` → caller shows user for confirmation, writes to `roadmap.json` on OK
> - `/archi.start` → caller writes directly to `roadmap.json`

Three outputs:

**① Task data** (directly maps to `roadmap.json` phases/tasks):

```json
{
  "phases": [
    {
      "id": "phase-infra",
      "name": "Infrastructure",
      "tasks": [
        { "id": "INF-01", "title": "...", "status": "pending", "description": "...", "goal": "...", "deps": [], "tag": "Infra", "slug": "..." }
      ]
    },
    {
      "id": "phase-core",
      "name": "Core Features",
      "tasks": [
        { "id": "FEAT-01", "title": "...", "status": "blocked", "description": "...", "goal": "...", "deps": ["INF-01"], "tag": "Core", "slug": "..." }
      ]
    },
    {
      "id": "phase-polish",
      "name": "Polish & Launch",
      "tasks": [
        { "id": "POLISH-01", "title": "...", "status": "blocked", "description": "...", "goal": "...", "deps": ["FEAT-01"], "tag": "Quality", "slug": "..." }
      ]
    }
  ]
}
```

**② NFR merge list** (return with task data; caller appends as `nfr` top-level field; `/archi.plan` step_1_load must read):

| NFR Name | Inject Task ID | Constraint Summary | Affected (other task IDs) |
|:---|:---|:---|:---|
| (example) i18n | FEAT-01 | All copy via i18n key, no hardcoded strings | FEAT-02, FEAT-03 |

**③ Parallel execution batches** (DAG layer diagram; same Layer can run in parallel):

```
Layer 0 ║ INF-01
Layer 1 ║ INF-02 · INF-03              ← both depend on INF-01
Layer 2 ║ FEAT-01 · FEAT-02            ← each depends on INF-02 / INF-03
Layer 3 ║ FEAT-03                      ← depends on FEAT-01
Layer 4 ║ POLISH-01 · POLISH-02        ← depend on related FEAT tasks
```

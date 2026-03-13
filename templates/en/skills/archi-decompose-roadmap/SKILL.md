---
name: archi-decompose-roadmap
description: Decompose project requirements into roadmap tasks. Use when initializing a project or scoping new features.
---

# Roadmap Task Decomposition

## System Flow Context

```
Brief → [This Skill] → roadmap.json → /archi.plan → spec/ui/plan → /archi.code
```

**Skill Boundary**:
- Owns: task what, done criteria (goal), dependency chain, design decision injection
- Does NOT own: file paths (map.json), variable naming (dictionary.json), test cases (plan.json), UI structure (ui.md)

**Schema Constraint (Tier 1)**: roadmap.json validated by CLI Zod; no add/remove fields.

## Invocation Modes

| Mode | Source | Input | Constraint |
|:---|:---|:---|:---|
| From Scratch | `/archi.start` | Brief task list | No EDIT tasks |
| Incremental | `/archi.scope` | Brief + existing Roadmap | Never modify existing; continue ID watermark |

## Decomposition Framework (5 Steps)

### Step 0 · Project Type Calibration

Identify project type; establish infrastructure checklist to prevent Step 2 omissions.

| Project Type | Scaffold Must Include |
|:---|:---|
| Web SPA / PWA | Routing skeleton + App Shell (layout / Provider / theme injection) |
| Full-Stack Web | Routing conventions + API Routes + global layout + Auth Session; [UI] theme injection |
| CLI Tool | Logger + AppError + command registration entry |
| API Service | Router layer + middleware + DB connection + global error handling; [GraphQL] Schema + DataLoader |
| Mobile App | Navigation skeleton + platform adapter + env config |
| Mini Program | Page routing config + app.js/ts + request wrapper |
| Browser Extension | manifest + Background SW + Content Script + message bus |
| Desktop App | Main process entry + IPC bridge + system capabilities |
| Web + Desktop (Hybrid) | Web base + desktop runtime; **desktop integration as separate INF subtask** (OS differences) |
| Library / SDK | Dual output (CJS+ESM) + barrel index + types + Changelog; **no business Tasks** |
| Real-time / Collaborative | WebSocket layer + event Schema + room management; [CRDT] conflict resolution |
| AI Agent / MCP | LLM abstraction + Prompt templates + Tool Schema + Memory; [MCP] MCP adapter |

**Actions**:
1. Write scaffold checklist into INF-01 description
2. Limit Step 1 scenario phrasing by project type:

| Project Type | Scenario Template | Forbidden Terms |
|:---|:---|:---|
| CLI | `User can [run command/args] → [terminal output]` | page, route, component, UI |
| Library / SDK | `Caller can [invoke API X] → [return Y]` | user, interface, interaction |
| API Service | `Client can [HTTP METHOD /path] → [response]` | frontend, page, component |
| Mini Program | `User can [page name] [action] → [visible result]` | backend route, REST |
| Web/Mobile/Desktop | `User can [action] → [perceivable result]` | — |

### Step 1 · PM Perspective → Business Tasks

Extract scenarios from Brief; convert to pattern: `User can [action] → [perceivable result]`

**Merge Condition**: Share same core flow (same UI view, same data entity, shared state flow)
> "Shared domain/theme" ≠ "Shared core flow". Same domain but distinct UI/implementation domains → split.

**Split Signals**:
| Signal | Action |
|:---|:---|
| Description contains "and" (two independent concerns) | Split |
| DoD has > 4 acceptance criteria | Split |
| Spans > 3 independent UI areas or implementation domains | Split |
| Single spec.md cannot describe in one `/archi.plan` | Split |
| Two tasks have >50% file overlap | Merge |

> If "A must complete before B makes sense", that's dependency; **do not merge**; declare `deps: [A]` for B in Step 4.

**Dual-Perspective Judgment** (independent; either triggers split):

| Perspective | Signal | Action | Example |
|:---|:---|:---|:---|
| Behavior (PM) | Description contains "and", DoD >4 items, spans 3+ UI areas | Split | User management + Order management → separate |
| Engineering | Task contains ≥2 **implementation domains**, each independently testable | Split | Pure compute layer + UI render layer → separate |
| Engineering | Implementation requires ≥3 independent technical concerns | Split | Char rendering + State machine + Animation API → three things |
| Engineering | One concern has independent boundary complexity | Extract that concern | Input capture + IME as separate task |

> Behavior describes "what user sees"; Engineering describes "what AI must grasp when implementing". A task behaviorally cohesive but spanning multiple domains will cause AI to lose focus in `/archi.code`.

**Granularity Cap**:

> Roadmap Task = **smallest functional unit that AI can produce a cohesive spec.md without further decomposition** (HTN Primitive executability).

| Proxy Metric | Cap | Action if exceeded |
|:---|:---|:---|
| Independent user operation flows | ≤ 3 | Split |
| Independent data entities (each with state flow) | ≤ 2 | Split |
| "and/or/and also" connecting concerns | ≤ 1 | Split |
| Cannot validate without running another business Task | — | Check coupling, redraw interface boundary (INVEST-I) |

> If `/archi.plan` estimates spec.md Scenario > 6 or plan.json Phase > 4, pause and prompt to return to `/archi.scope` for re-split.

**DoD Format**:
| Type | Format |
|:---|:---|
| `FEAT-xx` | `When done, user can <verifiable behavior>; boundary: <out of scope>` |
| `INF-xx` | `When done, <deliverable>, verified by <command>; boundary: <out of scope>` |
| `POLISH-xx` | `When done, <metric> improves from <baseline> to <target>; boundary: <out of scope>` |

> DoD is basis for `/archi.plan` to generate spec.md acceptance criteria and plan.json test cases. Do not write implementation details (file paths, function names decided at plan stage).

Exempt (belong to parent): lightweight result/completion/empty pages, confirmation modals (without independent data viz or complex animation)
> **Exception**: Result page with independent data visualization (chart lib), complex animation logic, or independent business logic → standalone Task.

### Step 2 · Architect Perspective → Infra Tasks

Derive shared foundations: multiple Tasks depend on X and X must exist before Task → X is Infra.

| Infra Type | Criteria |
|:---|:---|
| Project scaffold / global Schema | All business Tasks depend; must cover Step 0 checklist |
| Shared core engine | Either: ① 2+ business Tasks directly call; ② pure logic, independently testable, UI-decoupled. `tag` can label `Core`/`Engine` |
| Third-party integration | Multiple business Tasks reuse same external service |

**Shared Engine Planning Contract**: Shared core engine INF tasks must declare main export interfaces (function signatures or key interface names) at end of `description`. Downstream `/archi.plan` can align to that interface without reading upstream implementation.

**Infra Task Granularity: avoid over-fragmentation, forbid cross-layer stacking**:
- **No over-fragmentation**: Same-layer configs (ESLint + Prettier + TS strict) → merge
- **No cross-layer stacking**: Each layer as separate task; cross-layer stacking lengthens critical path and delays business Tasks

> **Architecture Layer Reference** (each independent boundary): Project scaffold | Data layer | Auth layer | API router layer | Frontend infrastructure | Third-party integration

| Signal | Action |
|:---|:---|
| Related config items within same layer | Merge |
| Spans independent layers (e.g. DB + Auth) | Split |
| Completely different tech stacks | Split |
| Involves OS-level API (tray, hotkey) | **Force split** (Step 0 rule) |
| Deliverable directly called by ≥2 business Tasks | Standalone (must declare export interface) |

**Implicit Standard Feature Scan** (often absent from Brief; proactively add):

| Check | Trigger | Assignment |
|:---|:---|:---|
| User Profile / account settings page | Has Auth | FEAT-xx (Phase 2) |
| Account security / password settings | Has Auth and can change password/bind third-party | FEAT-xx (Phase 2) |
| Notification center / message list | Has notification infra and read/unread state | FEAT-xx (Phase 2) |
| Notification infrastructure | Task mentions "notification" but no INF | INF-xx (Phase 1) |
| Search infrastructure | 2+ business Tasks describe "search" | INF-xx (Phase 1) |
| RBAC permission management | Has Auth and 2+ roles | INF-xx (Phase 1) |
| File storage (S3/OSS) | Task involves file upload/download/preview | INF-xx (Phase 1) |
| Email/SMS/payment integration | Task mentions corresponding feature | INF-xx (Phase 1) |

### Step 3 · NFR Filtering and Polish Identification

Route by effort weight.

> **"First task" definition** (for NFR injection): In dependency chain, task whose `deps` only include INF layer (no business pre-deps) and earliest to involve that NFR. If multiple candidates in same layer, take smallest ID.

**Criteria**:
| Signal | Action |
|:---|:---|
| Only needs "do in passing" (e.g. use i18n key) | **NFR inject** — append to first task goal: `[NFR] <description>` |
| Needs standalone infrastructure (e.g. integrate i18n framework) | **INF task** — Phase 1 |
| Independently measurable (e.g. Lighthouse ≥ 90) | **POLISH task** — Phase 3 |

| Type | Lightweight → NFR inject | Heavyweight → Standalone |
|:---|:---|:---|
| Internationalization | Use i18n key within business Task | Integrate framework → `INF-xx`; full translation → `POLISH-xx` |
| Visual theme (config) | Brand color Token into scaffold | — |
| Visual theme (functional) | — | Dark/light toggle + OS preference detection → `FEAT-xx` |
| Animation style | Transition duration into first Task with animation | — |
| Performance optimization | Lazy load / cache within single Task | LCP < 2s, bundle size → `POLISH-xx` |
| Accessibility | ARIA attributes within single Task | Full a11y audit → `POLISH-xx` |
| Packaging / distribution | — | Desktop packaging + auto-update → `POLISH-xx` |

### Step 4 · Dependencies and Parallel Optimization

- **Real dependency chain**: forbid all business Tasks only on `INF-01`; reflect real business relationships
- **Business entity dependency (overrides minimal deps)**: If B's core subject produced by A, B depends on A. Example: Usage Log records Prompt; Prompt created by FEAT-Prompt_Create → Usage Log Task depends on Prompt Task
- **Minimal dependency**: no unnecessary deps; maximize parallelism

## Task Rules

1. **ID Prefixes**: `INF-xx` (infrastructure) | `FEAT-xx` (business feature) | `POLISH-xx` (quality polish) | `EDIT-xx` (edit, incremental only)

2. **Phase Structure**:
| Phase | ID | Content |
|:---|:---|:---|
| Phase 1 | `phase-infra` | INF-xx (scaffold, data layer, auth, API skeleton) |
| Phase 2 | `phase-core` | FEAT-xx (business features) |
| Phase 3 | `phase-polish` | POLISH-xx (quality optimization); omit if Brief has no polish needs |

3. **tag field**: business domain label (e.g. Core, Auth, Data); does NOT determine task type

4. **Design decision injection**: Brief decisions → inject into task goal end: `[User Preset] <content>`; do not repeat same decision across tasks

5. **Slug**: `Pascal_Snake_Case`, maps to `tasks/<slug>/` folder

## Task JSON Schema (Tier 1, no add/remove fields)

```json
{
  "id": "FEAT-01",
  "title": "Task Title",
  "status": "pending | blocked",
  "description": "1-2 sentences. Shared engine tasks must declare main exports at end",
  "goal": "When done, user can <behavior>; boundary: <out of scope>",
  "deps": ["INF-01"],
  "tag": "business domain label",
  "slug": "Task_Slug"
}
```

`deps` all `done` → `pending`; has incomplete `deps` → `blocked`

## Outputs

**① Task Data**: `roadmap.json` `phases[].tasks[]` structure

**② NFR Merge List** (roadmap `nfr` top-level field):
| NFR | Inject Task | Constraint Summary | Affected |
|:---|:---|:---|:---|
| i18n | FEAT-01 | All copy via i18n key | FEAT-02, FEAT-03 |

**③ Parallel Batches** (DAG topological layers):
```
Layer 0 ║ INF-01
Layer 1 ║ INF-02 · INF-03
Layer 2 ║ FEAT-01 · FEAT-02
Layer 3 ║ FEAT-03
Layer 4 ║ POLISH-01 · POLISH-02
```

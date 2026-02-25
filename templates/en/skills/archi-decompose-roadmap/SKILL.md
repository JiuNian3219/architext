---
name: archi-decompose-roadmap
description: Architext task decomposition expert. Five-step method: first calibrate project type to anchor the infrastructure checklist, then apply dual-perspective extraction for Feature and Infra tasks. NFR cross-cutting concerns are merged into goal fields (never standalone tasks). Produces Tier 1 Schema-compliant roadmap.json tasks as input contracts for `/archi.plan`. Use whenever Roadmap tasks need to be generated or appended.
---

# Roadmap Task Decomposition

## System Flow Context

```
Brief → [This Skill] → roadmap.json tasks
                              ↓
                     /archi.plan <task-id>
                     reads: vision.md + map.json + tech_stack.md
                     writes: spec.md (behavior spec / acceptance criteria)
                             ui.md (component structure, AI coding truth source) [?UI]
                   visual ref: [[__DOCS_DIR__]]/global/ui_context.md [?UI]
                             plan.json (executable steps + test case checkboxes)
                     also updates: map.json / dictionary.json / data_snapshot.json
                              ↓
                     /archi.code → reads spec.md + ui.md + plan.json → writes code
```

> **Skill responsibility boundary**:
> - Owns: task what (description), done criteria (goal), dependency chain, design decision injection, Core interface contracts
> - Does NOT own: file paths (map.json owns), variable naming (dictionary.json owns), test cases (plan.json owns), UI component structure (ui.md owns)
>
> **Schema constraint (Tier 1 Strict)**: roadmap.json is validated by CLI Zod Schema. **Adding or removing fields is forbidden.**

## Invocation Mode

| Mode | Triggered By | Input | Constraint |
|:---|:---|:---|:---|
| From Scratch | `/archi.start` | Brief feature list | No EDIT tasks allowed |
| Incremental | `/archi.scope` | Brief + existing Roadmap context | Never modify existing tasks, continue ID watermark |

---

## Decomposition Framework (5 Steps)

### Step 0 · Project Type Calibration

Identify the project type from the Brief's tech stack / description. Establish a standard infrastructure checklist to prevent Step 2 from missing framework-level Infra.

| Project Type | Scaffold Must Include (beyond common build toolchain) |
|:---|:---|
| Web SPA / PWA | Routing skeleton (e.g. React Router), global App Shell (layout / Provider / theme injection) |
| CLI Tool | Logger module, AppError handling layer, command registration entry |
| API Service | Router layer, middleware layer, DB connection layer, global error handling |
| Mini Program | Page routing config, global app.js/ts, request wrapper layer |

**Action**: Inject the calibration result into the INF-01 description in Step 2, ensuring the scaffold task covers the checklist for this project type.

---

### Step 1 · PM Perspective → Feature Tasks

Extract user scenarios from the Brief feature descriptions and aggregate them into Feature tasks.

1. Convert each feature into scenario format: `User can [action] → [perceivable outcome]`
2. Scenarios sharing the same core flow → merge into one Feature task
3. Granularity calibration (core principle: **one task = one `/archi.plan` session = one `features/<slug>/` subdirectory**):

    **Behavior perspective (PM)**:

    | Signal | Action |
    |:---|:---|
    | Description contains "and" (two independent concerns) | Split |
    | DoD exceeds 4 acceptance criteria | Split |
    | Task spans 3+ independent UI areas or implementation domains | Split |
    | A single `/archi.plan` session cannot fully describe behavior in one spec.md | Split |
    | Two tasks share >50% of their file set | Merge |
    | One task is meaningless without the other | Merge |

    **Engineering perspective (independent of behavior — either trigger = split)**:

    | Signal | Action | Example |
    |:---|:---|:---|
    | Task contains ≥2 **implementation domains**, each independently unit-testable | Split | Pure logic layer + UI rendering layer → separate tasks |
    | Implementation requires mastering ≥3 independent technical concerns simultaneously | Split | Char rendering + state machine + animation API → three distinct things |
    | A concern has its own significant boundary complexity (e.g. IME, Canvas, third-party chart API) | Extract that concern | Input capture + IME → own task |

    > **Why add the engineering perspective**: The behavior perspective describes "what the user sees"; the engineering perspective describes "what the AI must simultaneously master during `/archi.code`". A task that is behaviorally cohesive (same screen) but spans multiple unrelated implementation domains will cause the AI to lose focus and produce poor cross-domain code.

    **Granularity hard limits (quantitative)**:

    > One Roadmap Task = the minimum functional unit that can produce **one cohesive spec.md + one executable plan.json**.

    | Metric | Limit | Action when exceeded |
    |:---|:---|:---|
    | spec.md Scenario count | ≤ 6 | Return to `/archi.scope` to split — task is too large |
    | plan.json Phase count | ≤ 4 | Same |

    > These limits serve as a predictive check during decomposition. If during `/archi.plan` the estimated counts are projected to exceed these limits, pause and prompt the user to return to `/archi.scope` for re-splitting. Never force-fit into a single task.

**DoD format**: `When done, user can <verifiable user behavior>; boundary: <what is explicitly excluded>`

> DoD is the baseline for `/archi.plan` to write spec.md acceptance criteria and plan.json test cases. It must precisely describe user-perceivable outcomes. Implementation details (file paths, function names, test commands) are determined in the plan phase — do not include them here.

The following belong to the parent task — never create standalone tasks for: **lightweight** result/completion pages, empty-state pages, confirmation dialogs.

> **Exemption**: If a result page contains independent data visualization components (charting libraries), complex animation logic, or independent business calculations, the parent-task rule does **not** apply — it must become its own Feature task.

---

### Step 2 · Architect Perspective → Infra Tasks

Derive shared foundations from Feature tasks. Never pre-assume infrastructure.

For all Feature tasks, ask: do multiple Features depend on X, and must X exist before any Feature can run? → X is an Infra task.

| Infra Type | Criteria |
|:---|:---|
| Project scaffolding / global Schema / type definitions | All Features depend on it; must cover the Step 0 project type checklist |
| Shared core engine (typing engine, rules engine, etc.) | Meets **any one** of: ① 2+ Features call it directly; ② Pure logic layer, independently unit-testable, fully decoupled from UI. `tag: Core` |
| Third-party integration layer | Multiple Features reuse the same external service |

**Core Task Planning Contract**: Tasks with `tag: Core` must end their `description` with a declaration of their primary exported interface (function signature or key interface name). Downstream Feature `/archi.plan` sessions can wire directly to this interface without reading upstream implementation, ensuring cross-task planning consistency and predictability.

**Infra task granularity principle (opposite of Feature — lean toward merging)**:

Infra tasks don't carry business logic. AI executing them operates in a narrow context and is not at risk of "domain overload". Over-splitting Infra only adds dependency chain complexity with no benefit.

| Signal | Action |
|:---|:---|
| Same engineering category, same execution window, related tech stack | Merge (e.g. scaffolding + CI + router skeleton → one INF task) |
| Completely different tech stack AND clearly different execution timing | Split (e.g. Dexie.js storage layer vs. Shadcn theme config) |
| An Infra output is called directly by ≥2 Features (interface-type) | Keep as its own task (must declare exported interface contract) |

---

### Step 3 · NFR Filter

The following types **must never become standalone tasks**: inject into the `goal` of the first task that implements the capability (`[NFR] <note>`); other affected tasks are noted only in the NFR list below. `/archi.plan` will propagate these NFRs into the constraints section of the corresponding spec.md.

| Type | Common Forms | Note |
|:---|:---|:---|
| Internationalization | i18n, multi-language, translation copy | — |
| Visual theme (config) | Brand color tokens, Tailwind theme colors, CSS variable definitions | NFR — inject into scaffold task |
| Visual theme (feature) | Dark/light toggle button, OS preference detection, theme persistence | **Not NFR** — must be a standalone Feature task (user-visible behavior) |
| Animation style conventions | Page transition approach, duration standards | NFR — inject into the first Feature goal that includes animation |
| Performance | Lazy loading, virtual list, cache strategy | — |
| Accessibility | A11y, keyboard navigation, screen reader | — |

---

### Step 4 · Dependency & Parallelism Optimization

- **Real dependency chains**: Never attach all Features to `INF-01` only. Dependencies must reflect real business relationships.
- **Minimal dependency principle**: Tasks that can run in parallel must not carry unnecessary deps — maximize Batch parallelism.

---

## Task Rules

1. **ID generation**: Continue existing Roadmap ID watermark, increment each prefix from its max value. Fresh projects start at `INF-01` / `FEAT-01`.

2. **Phase assignment**:

   | Task Type | Phase |
   |:---|:---|
   | Project scaffolding, Schema, global types | Phase 1 (Infrastructure) |
   | Shared core engine (identified in Step 2) | Phase 1 (Infrastructure) |
   | Business Feature | Phase 2 (Core Features) |
   | EDIT-xxx (modifying existing feature) | Same Phase as the modified task |

3. **Design decision injection**: Existing decisions from the Brief → append to corresponding task `goal`: `[User Preset] <content>`. Never repeat the same global decision across multiple tasks. `/archi.plan` treats these as non-negotiable hard constraints, writing them directly into spec.md without re-asking.

4. **EDIT tasks**: When an existing feature must be modified → create `EDIT-xxx` (`tag: Edit`), goal describes the modification scope. Only used in Incremental mode.

5. **Slug naming**: `slug` is the `features/<slug>/` folder name. Must clearly express the task content, in `Pascal_Snake_Case` format (e.g. `Typing_Engine_Core`). Each task maps to exactly one unique feature subdirectory — no duplicates.

---

## Task JSON Schema (Tier 1 Strict — no field additions or removals)

```json
{
  "id": "FEAT-01",
  "title": "Task Title In English",
  "status": "pending | blocked",
  "description": "<1-2 sentences describing what this task builds and what it covers. Core tasks must end with a declaration of their primary exported interface>",
  "goal": "When done, user can <verifiable user behavior>; boundary: <what is explicitly excluded>",
  "deps": ["INF-01"],
  "tag": "Infra | Core | Feature | Edit",
  "slug": "Task_Title_Snake_Case"
}
```

`deps` empty or all `done` → `pending`; any unfinished dep → `blocked`

---

## Intermediate Output

> This Skill is a subroutine: once structured data is produced, control returns to the caller.
> - `/archi.scope` → caller displays to user for confirmation, then writes to `roadmap.json` after "OK"
> - `/archi.start` → caller writes directly to `roadmap.json`

Produces two parts:

**① Task data** (maps directly to `roadmap.json` phases/tasks structure):

```json
{
  "phases": [
    {
      "id": "phase-1",
      "name": "Infrastructure",
      "tasks": [
        { "id": "INF-01", "title": "...", "status": "pending", "description": "...", "goal": "...", "deps": [], "tag": "Infra", "slug": "..." }
      ]
    },
    {
      "id": "phase-2",
      "name": "Core Features",
      "tasks": [
        { "id": "FEAT-01", "title": "...", "status": "blocked", "description": "...", "goal": "...", "deps": ["INF-01"], "tag": "Feature", "slug": "..." }
      ]
    }
  ]
}
```

**② NFR merge list** (metadata for the caller to display):

- [NFR name] → injected into [task ID] goal | affected: [other task IDs]

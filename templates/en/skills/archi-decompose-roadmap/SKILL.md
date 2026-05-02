---
name: archi-decompose-roadmap
description: Decompose requirements into roadmap tasks. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called via `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` in `/archi.*` protocols.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only downgrade to inline Skill when no subagent.
- **Boundary**: Only return protocol-required structured artifacts, subsequent write, confirm and signoff handled by calling protocol.


# Roadmap Task Decomposition

## Invocation Modes

- **From scratch** (`/archi.init` start): Brief feature list + ui_context → Generate complete Roadmap. Do not generate EDIT tasks.
- **Incremental append** (`/archi.plan` decompose): Brief + existing Roadmap → Append new tasks. Do not modify existing tasks, ID uses unused range.

**Schema Constraint (Tier 1)**: roadmap.json validated by CLI Zod, do not add/remove fields.

---

## Core Philosophy: Minimum Deliverable Vertical Slice

**One Task完成后, 启动项目能验证一条完整的功能路径。**

Vertical slice = End-to-end delivery unit from data layer to user touchpoint layer. Each Task contains all code needed for that slice (Schema / API / State management / Page / Route), after completion can independently verify without depending on subsequent Tasks.

**Four Baselines**:
1. **Runnable**: After Task completes, starting project can traverse at least one functional path
2. **Cohesive**: Code for shared components/state/modules must be within same Task
3. **Controllable**: Single Task involves 3-6 new files/modules, AI can complete in one session
4. **Verifiable**: After Task completes, has corresponding automated test proving functionality correct

---

## Effort Judgment

Before outputting any tasks, classify the requirement as `single-task` or `multi-task` and give rationale:
- Independent acceptance flows: 2+ user/command/API flows → `multi-task`
- Concern count: covers >2 concerns among data/API/UI/auth/sync/import-export, etc. → `multi-task`
- Estimated files/modules: candidate Task exceeds 6 new files/modules → split further
- Implementation controllability: cannot fit one implementation session → split further

Output must include `effortJudgment`: `conclusion`, `rationale`, and `splitSignals`. Do not compress a large requirement into one Task just to keep the result short.

---

## Refactor Task Granularity

Signals: split existing files, reorganize directories, adjust module boundaries, code too concentrated, CSS modules, split server.

These requests still enter `/archi.plan` decompose, but they are not greenfield feature planning. Decompose only appends a few tasks to roadmap; how to split files, create directories, migrate components, and update imports belongs in later detail `plan.json`.

Split basis:
- Each roadmap task must have independent delivery value, independent acceptance, or risk that needs separate isolation
- Small structure cleanup should tend to merge; do not mechanically split just because multiple files, directories, or components are involved
- Frontend, backend, styles, data migration, and similar areas split only when verification risk, dependency order, or release boundary is clearly different

Do not output these as roadmap tasks: create directories, extract constants, extract utilities, split one individual component, migrate one CSS file. These are implementation steps for later `/archi.plan <ID>` detail `plan.json`.

Before output, explain why each item is a roadmap task rather than an implementation step in detail `plan.json`. If it is only "a few files are too concentrated and should be split", usually produce very few tasks; if it is genuinely large refactor work, more tasks are allowed, but each must be justified by independent delivery / independent acceptance / risk isolation.

---

## Decomposition Framework

### Step 0 · Project Type + Slice Strategy

Select slice dimension based on project highest-level feature. Multi-feature projects take highest by priority: **ui > cli > api > lib**.

| Project feature | Slice Dimension | Atomic Unit | Acceptance Template |
|:---|:---|:---|:---|
| ui (Web/Mobile/Desktop/Miniapp) | User journey sub-flow | A group of coupled pages + corresponding API + shared state | Start project, traverse a complete path in UI |
| cli | Command group | Complete implementation of one command (parse+process+output+error) | Execute command in terminal for correct output |
| api | Resource domain | Complete endpoint set for one entity + middleware + validation | Request all endpoints for that resource for correct responses |
| lib | Public API surface | A group of related exported functions/classes + types + implementation | Import and call, types and behavior correct |

**Scaffold (INF-01) Allowlist — Only Allow Following Content**:

- **ui**: Framework init + Route shell + App Shell + Global layout
- **cli**: Entry + Command registration framework + logger + AppError
- **api**: Route layer shell + Global error handling + Middleware mount points
- **lib**: Dual-output config + Barrel index + Type declarations
- **Common (as needed)**: Package manager + Monorepo structure / DB connection pool + ORM config (without schema and migration files) / Docker dev environment / Linter + Formatter

**INF-01 Additional Include (as needed)**: Test infrastructure — Test framework config (Vitest / Jest / Playwright config) + Test helpers (test utils, DB test container setup), ensuring subsequent FEAT can write tests directly.

**INF-01 Prohibited Include**: Business Schema and migration / Auth and authorization / Third-party SDK / Render pipeline / Business middleware. These all go into first FEAT using them (see Step 3 INF Blacklist).

---

### Step 1 · Identify Feature Domains

Extract feature domains from Brief per Step 0 slice dimension (ui = user journey groups; api = entity endpoint sets; cli = command groups; lib = export sets). Cross-entity shared mechanisms (auth, permissions) = Independent feature domain.

---

### Step 2 · Feature Domain → Task (Merge and Split)

Each feature domain first as candidate Task, then execute split and merge checks.

#### Split Check (Task too large?)

Split when: Involves >6 new files | Contains multiple independently verifiable sub-flows | Needs simultaneous >2 different concerns.

Split method: By **independently deliverable sub-flow**, each sub-Task after completion can independently verify and internal code highly coupled.

Split sub-tasks imply grouping via ID prefix (e.g. `FEAT-01-01`, `FEAT-01-02` share `FEAT-01` prefix), no explicit parent task record needed. Each task is executable.

```
Feature domain: Auth system
├── FEAT-02-01: Login flow (Login page + auth store + Route guard + Navbar state + Login API)
├── FEAT-02-02: Registration flow (Registration page + Registration API + Auto-login after registration)
└── FEAT-02-03: Password reset (Reset page + Send/Reset API)
```

#### Merge Check (Task too granular?)

Merge when: Two Tasks share same component/state | Output incomplete after completion | Only involves 1-2 files | After split one would heavily refactor other's code.

```
❌ FEAT-03-01: Create article (editor+createAPI)
   FEAT-03-02: Edit article (modify editor+editAPI)← Need to modify 03-01's form

✅ FEAT-03-01: Article create and edit (Editor + Create/Edit/Save API + Form + Draft state)
```

#### Shared Data Model Ownership

When multiple Tasks involve same Schema, **first writer** creates base fields (including fields other Tasks need to read), subsequent Tasks only extend fields, and note in goal "Extend <Model> Schema: Add <field list>". First writer = Task earliest in dependency chain that writes to that Schema.

#### Granularity Verification Checklist

Beyond four baselines, each Task additionally checks:

- [ ] **Not incomplete**: Doesn't exist "obviously missing a piece after completion"?
- [ ] **Not overreaching**: Won't heavily modify code other Tasks already produced?
- [ ] **Verification self-contained**: Every capability referenced in verification is implemented in this Task or deps chain?
- [ ] **Boundary complete**: Boundary says "Not doing X (B's job)", confirmed B explicitly includes X?

---

### Step 3 · INF / POLISH / PLATFORM

#### INF Tasks

INF four conditions (all met): Pure infrastructure + No UI + Physical blocking + Used by 2+ FEATs. Used by only 1 FEAT → Fold into that FEAT. Allowlist see Step 0 scaffold section.

**INF Blacklist (Go to FEAT, regardless of how many Tasks use)**: Auth and authorization / Third-party SDK / Render pipeline / Business middleware / Schema + migration. Rationale: Cannot verify without business context. Prohibit "Full Schema" INF — Business tables created by FEAT as needed (see Step 2 Shared Data Model Ownership).

**INF Granularity Judgment (Independent of FEAT rules)**: INF doesn't apply Step 2 split/merge checks. INF splits by **independently verifiable infrastructure layer**. Judgment method: Group INF allowlist content by "has independent verification command" — Content verifiable with different commands belongs to different layers, must split. Content that must split to verify separately belongs to same layer. Split condition: Single INF involves ≥2 independently verifiable layers must split. Same-layer content merges into one INF. After split INFs ensure stacking order via deps. Project with single layer keeps single INF-01. Each INF's goal must include concrete verification command for that layer.

#### POLISH / PLATFORM

POLISH: Independently measurable quality optimization (Lighthouse, i18n, a11y, bundle), goes in phase-polish.

PLATFORM: CI/CD, logging, monitoring etc ops capabilities, goes in phase-platform, doesn't participate in FEAT dependency chain.

#### NFR Injection

Lightweight NFR → Dual track: ① Add `[NFR] <description>` to first related FEAT's goal; ② Record in top-level `nfr[]` array (taskId + constraint + impact). First task = deps only INF and earliest involves that NFR, same layer take smallest ID.

#### Test Injection

Tests delivered synchronously with features, do not allow "finish first then add tests".

- Each FEAT's goal end appends `[TEST]` block, listing **specific test scenarios** (not just "write tests")
- FEATs involving user-perceivable paths must have at least one E2E
- INF-01 contains test infrastructure config (framework config + test utils)
- Test scenarios must specify input / action / expected result, and cover normal path + at least one boundary or error path
- Prohibit only writing "call succeeds", "file exists", "tests pass", "cover logic" etc descriptions that cannot prove behavior

`[TEST]` block format: `[TEST] Unit: <scenario> | Component: <scenario> (ui type) | E2E: <verification path>`

#### Seed Data Strategy

- Data-heavy projects (blog, CMS, e-commerce): First FEAT creating Schema also contains seed script
- Simple data projects: Each FEAT builds data in test setup
- Goal must note data prerequisite for verification (e.g. "Verification prerequisite: Need N articles in different states")

#### Design Spec Injection (ui project)

- **INF-01** contains Design Token system (CSS variables / Tailwind config), goal lists Token values
- **First ui FEAT** injects `[DESIGN]` global visual constraints (motion, border-radius, shadows, breakpoints)
- Subsequent FEATs only append `[DESIGN]` when involving special visual handling

---

### Step 4 · Dependency Chain

**Sequential Development Principle**: Assume single person developing sequentially, no intentional parallelism.

Dependency determination rules:

- B's code calls A's module → B deps A
- B's data entity created by A → B deps A
- B and A operate different data entities, code doesn't cross → No dependency (still sequentially ordered by default)
- Sub-Tasks in same feature domain → Usually have dependencies, ordered by sub-flow sequence

**Content-Type Project Browse-Create Dependency**: Browse-type Task's verification needs content data existing. Two approaches: ① Browse Task deps Create Task (recommended, reflects real business flow); ② Verification uses seed data (manual DB insert), but must note in goal "Verification prerequisite: Manual test data insertion required". Prohibit verification referencing capabilities not in this Task or deps chain.

**Prohibit** all business Tasks only hanging on INF-01, must reflect real business relationships.

**Dependency Chain Example** (abstract form, actual IDs per project naming):

```
INF-01 → INF-02 (if INF split by layer) → FEAT-A → FEAT-B
INF-01 → INF-03
INF-02 + INF-03 → FEAT-C → FEAT-D
FEAT-B + FEAT-C → FEAT-E
```

---

### Step 5 · Output Assembly

#### Top-Level Structure

Flat `tasks` array + `nfr` array, execution order derived from deps topological sort.

#### Task Fields

Required: `id` (`INF-xx`/`FEAT-xx`/`FEAT-xx-01`/`POLISH-xx`/`PLATFORM-xx`/`EDIT-xx`), `phase` (`infra`/`core`/`polish`/`platform`), `title`, `status` (`pending` when generated), `description` (≤50 chars, not repeating goal), `goal` (format see below), `deps` (ID array), `tag` (business tag), `slug` (`Pascal_Snake_Case` → `tasks/<slug>/`).

Optional: `screens` (ui only, screen ID array).

#### Goal Format

```
After completion, <acceptance sentence (per project type)>.
Involves: <logical unit names, do not write file paths. Example: Login page + auth store + Route guard + POST /auth/login>
Implementation hints: <Key tech choices and implementation points, help executing AI avoid detours. Example: Use mature library for OAuth flow; Store session in DB; Email unique constraint needs to handle OAuth-first registration conflict>
Verification: <Specific step-by-step verification, not result description. Example: Visit /dashboard → redirected to /login → OAuth login → jump back to /dashboard → navbar shows username>
Boundary: <Explicitly not doing, and mark which Task is responsible. Example: Excludes registration flow (FEAT-02-02), excludes password reset (FEAT-02-03)>

[TEST]
- Unit: <Specific test scenario>
- E2E: <Specific verification path>
```

Acceptance sentence per project type: ui = `User can [action] → [perceivable result]`; cli = `User can [run command] → [terminal output]`; api = `Client can [HTTP METHOD /path] → [response structure]`; lib = `Caller can [call API] → [return result]`. INF/POLISH/PLATFORM goals also need "Verification" and "Boundary".

Brief has design decisions → Inject into goal: `[User Preset] <content>`, same decision do not repeat across multiple Tasks.

#### Task JSON Example

```
{
  "id": "FEAT-02-01",
  "phase": "core",
  "title": "Login Flow",
  "status": "pending",
  "description": "OAuth login + session + route guard + navbar state",
  "goal": "After completion, user can login via OAuth on login page → navbar shows logged-in state, unauthenticated access to protected pages gets redirected. Involves: Login page + auth store + Route guard + Navbar user status area + Login API + User/Session Schema (first writer). Implementation hints: Use mature library for OAuth flow; Store session in DB; Admin role determined via environment variable whitelist. Verification: Visit protected page → redirected to login → OAuth login succeeds and jumps back → navbar shows username → Logout → session invalid. Boundary: Excludes registration (FEAT-02-02), excludes password reset (FEAT-02-03). [TEST] Unit: Session validation (valid/invalid/expired) + Admin whitelist check. E2E: Unauthenticated → Redirect → Login → Jump back → Logout → Session invalid.",
  "deps": ["INF-01"],
  "screens": ["S-03"],
  "tag": "Auth",
  "slug": "Auth_Login_Flow"
}
```

---

## Output Verification

- [ ] Output includes `effortJudgment` with single-task / multi-task judgment and split rationale
- [ ] Refactor requirements are not mechanically split by file/component/directory/step; each roadmap task has independent delivery, independent acceptance, or risk-isolation rationale
- [ ] `roadmap.json` has valid `tasks[]` flat array + `nfr[]`
- [ ] Each Task passes four baselines + granularity verification checklist
- [ ] Each FEAT's goal contains: Verification + Boundary (with Task ID) + Implementation hints + `[TEST]` (specific scenarios)
- [ ] INF only contains allowlist content; No "Full Schema" INF
- [ ] Dependency chain reflects real business relationships (not all hanging on INF-01)
- [ ] Sub-task ID prefixes consistent (FEAT-01-01, FEAT-01-02)
- [ ] ui project: INF-01 contains Tokens + Test infrastructure; First ui FEAT contains `[DESIGN]`
- [ ] Data-heavy: First Schema FEAT contains seed

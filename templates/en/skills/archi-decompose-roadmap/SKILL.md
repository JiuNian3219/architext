---
name: archi-decompose-roadmap
description: Decompose project requirements into roadmap tasks. Use when initializing a project or scoping new features.
---

# Roadmap Task Decomposition

## Invocation Modes

- **From Scratch** (`/archi.start`): Brief feature list + ui_context → Generate complete Roadmap. No EDIT tasks.
- **Incremental** (`/archi.scope`): Brief + existing Roadmap → Append new tasks. No modification of existing tasks; ID follows watermark.

**Schema Constraint (Tier 1)**: roadmap.json validated by CLI Zod; no add/remove fields.

---

## Core Philosophy: Minimal Deliverable Vertical Slice

**One Task completed → Start project to verify a complete feature path.**

Vertical slice = End-to-end delivery unit from data layer to user touchpoint. Each Task includes all code for that slice (Schema / API / state management / page / routing); after completion, can independently verify without depending on later Tasks.

**Four Baselines**:

1. **Runnable**: Task done → Start project to walk through at least one feature path
2. **Cohesive**: Shared component/state/module code must be within same Task
3. **Controllable**: Single Task involves 3-6 new files/modules, AI can complete in one session
4. **Verifiable**: Task done → Has corresponding automated test proving correctness (AI code must have test coverage)

---

## Decomposition Framework

### Step 0 · Project Type + Slice Strategy

Choose slice dimension based on project's highest-layer feature. Multi-feature projects take highest priority: **ui > cli > api > lib**.

| Project feature | Slice dimension | Atomic unit | Acceptance template |
| --- | --- | --- | --- |
| ui (Web/Mobile/Desktop/Mini Program) | User journey sub-flow | Coupled pages group + corresponding API + shared state | Start project, walk through a complete path on interface |
| cli | Command group | Complete implementation of one command (parse+process+output+error) | Terminal execute command to get correct output |
| api | Resource domain | Complete endpoint set of one entity + middleware + validation | Request all endpoints of that resource return correct response |
| lib | Public API facet | Related export functions/classes group + types + implementation | Import and call, types and behavior correct |

**Scaffold (INF-01) Whitelist — Only Allow Following Content**:

- **ui**: Framework initialization + routing shell + App Shell + global layout
- **cli**: Entry + command registration framework + logger + AppError
- **api**: Routing layer shell + global error handling + middleware mount point
- **lib**: Dual output config (CJS+ESM) + barrel index + type declaration
- **Common (as needed)**: Package manager + monorepo structure / DB connection pool + ORM config (no schema and migration files) / Docker dev environment / Linter + Formatter

**INF-01 Extra Include (as needed)**: Test infrastructure — test framework config (Vitest / Jest / Playwright config) + test utils (test utils, DB test container setup), ensure subsequent FEAT can write tests directly.

**INF-01 Forbidden Include**: Business Schema and migration / Auth / Third-party SDK / Rendering pipeline / Business middleware. These all belong to first FEAT using them (see Step 3 INF blacklist).

---

### Step 1 · Identify Feature Domains

Extract feature domains from Brief by Step 0 slice dimension (ui = user journey grouping; api = entity endpoint set; cli = command group; lib = export set). Cross-entity shared mechanisms (auth, permissions) = Independent feature domain.

---

### Step 2 · Feature Domain → Task (Merge and Split)

Each feature domain first as candidate Task, then execute split and merge checks.

#### Split Check (Task too large?)

Split when: Involves >6 new files | Contains multiple independently verifiable sub-flows | Needs handle >2 different concerns simultaneously.

Split method: Split by **independently deliverable sub-flows**, each sub-task after completion can independently verify and internal code highly coupled. Split subtasks imply grouping relationship via ID prefix (e.g. `FEAT-01-01`, `FEAT-01-02` share `FEAT-01` prefix), no explicit parent task record. Every task is executable.

```
Feature domain: Auth system
├── FEAT-02-01: Login flow (login page + auth store + route guard + navbar state + login API)
├── FEAT-02-02: Register flow (register page + register API + auto login after register)
└── FEAT-02-03: Password reset (reset page + send/reset API)
```

#### Merge Check (Task too fragmented?)

Merge when: Two Tasks share same component/state | Output incomplete after completion | Only involves 1-2 files | After split one side heavily refactors other side's code.

```
❌ FEAT-03-01: Create article (editor+create API)
   FEAT-03-02: Edit article (modify editor+edit API) ← Needs modify 03-01's form
✅ FEAT-03-01: Article create and edit (editor + create/edit/save API + form + draft state)
```

#### Shared Data Model Ownership

When multiple Tasks involve same Schema, **first writer** creates base fields (including fields needed by other Tasks for reading), subsequent Tasks only extend fields, and note in goal: "Extend <Model> Schema: Add <field list>". First writer = Earliest Task in dependency chain performing write operation on that Schema.

#### Granularity Verification Checklist

Besides four baselines, each Task extra check:

- [ ]  **Not incomplete**: No "clearly missing piece after completion"?
- [ ]  **Not cross-boundary**: Won't heavily modify other Task's existing code?
- [ ]  **Verification self-contained**: Every capability referenced in verification method, already implemented in this Task or deps chain?
- [ ]  **Boundary no blind spot**: Boundary says "No X (B's job)", confirmed B explicitly includes X?

---

### Step 3 · INF / POLISH / PLATFORM

#### INF Tasks

INF four conditions (all met): Pure backend + No UI + Physical blocker + Used by 2+ FEAT. Only used by 1 FEAT → Merge into that FEAT. Whitelist see Step 0 scaffold section.

**INF Blacklist (Belong to FEAT, no matter how many Tasks use)**: Auth / Third-party SDK / Rendering pipeline / Business middleware / Schema + migration. Reason: Cannot verify without business scenario.

No "Full Schema" INF — Business tables created by FEAT as needed (see Step 2 shared data model ownership).

**INF Granularity Rule (Independent from FEAT rules)**:

INF doesn't apply Step 2 split/merge check. INF splits by **independently verifiable infrastructure layer**. Method: Group INF whitelist content by "whether has independent verification command" — content verifiable via different commands belongs to different layer, must split; content must split to verify separately belongs to same layer. Split condition: Single INF involves ≥2 independently verifiable layers must split. Same layer content merges into one INF. After split INFs ensure stacking order via deps. Project only involves single layer → Keep single INF-01. Each INF's goal must include specific verification command for that layer.

#### POLISH / PLATFORM

POLISH: Independently measurable quality optimization (Lighthouse, translation, a11y, packaging), put in phase-polish. PLATFORM: CI/CD, logging, monitoring etc. ops capabilities, put in phase-platform, not participate in FEAT dependency chain.

#### NFR Injection

Lightweight NFR → Dual track: ① First related FEAT's goal append `[NFR] <description>`; ② Top-level `nfr[]` array record (taskId + constraint + impact). First task = deps only contains INF and earliest involves that NFR, same layer take smallest ID.

#### Test Injection

Tests deliver with features synchronously, no "finish first then add tests".

- Each FEAT's goal end append `[TEST]` block, list **specific test scenarios** (not just "write tests" three words)
- FEAT involving user-perceivable paths must have at least one E2E
- INF-01 includes test infrastructure config (framework config + test utils)

`[TEST]` block format: `[TEST] Unit: <scenario> | Component: <scenario> (ui type) | E2E: <verify path>`

#### Seed Data Strategy

- Data-intensive projects (blog, CMS, e-commerce): First FEAT creating Schema also includes seed script
- Data-simple projects: Each FEAT builds own data in test setup
- Goal must note verification data prerequisite (e.g. "Verification prerequisite: Need N articles with different statuses")

#### Design Spec Injection (ui projects)

- **INF-01** includes design Token system (CSS variables / Tailwind config), goal list Token values
- **First ui FEAT** inject `[DESIGN]` global visual constraints (motion, radius, shadow, breakpoints)
- Subsequent FEAT only append `[DESIGN]` when involving special visual handling

---

### Step 4 · Dependency Chain

**Sequential Development Principle**: Assume single-person sequential development, don't actively parallelize.

Dependency determination rules:

- B's code calls A's module → B deps A
- B's data entity created by A → B deps A
- B and A operate different data entities, code doesn't cross → No dependency (default still sequence order)
- Sub-tasks of same feature domain → Usually have dependency, order by sub-flow sequence

**Content-type project browse-create dependency**: Browse-type Task verification needs content data exists. Two approaches: ① Browse Task deps Create Task (recommended, reflects real business flow); ② Verification method uses seed data (manual insert DB), but must note in goal "Verification prerequisite: Need manually insert test data". Forbidden verification method reference capability not existing in this Task and deps chain.

**Forbidden** all business Tasks only hang INF-01, must reflect real business relationships.

---

### Step 5 · Output Assembly

#### Top-level Structure

Flat `tasks` array + `nfr` array, execution order derived from deps topological sort.

#### Task Fields

Required: `id` (`INF-xx`/`FEAT-xx`/`FEAT-xx-01`/`POLISH-xx`/`PLATFORM-xx`/`EDIT-xx`), `phase` (`infra`/`core`/`polish`/`platform`), `title`, `status` (generated as `pending`), `description` (≤50 chars, don't repeat goal), `goal` (format below), `deps` (ID array), `tag` (business tag), `slug` (`Pascal_Snake_Case` → `tasks/<slug>/`). Optional: `screens` (ui only, screen ID array).

#### goal Format

```jsx
When done, <acceptance sentence (by project type)>.
Involves: <logical unit names, no file paths. Example: login page + auth store + route guard + POST /auth/login>
Implementation hints: <key tech choices and implementation points, help executing AI avoid detours. Example: password hash use argon2; session store PG; email unique constraint need handle OAuth-first-register conflict>
Verification method: <specific step-by-step verification, not result description. Example: visit /dashboard → redirected to /login → login with GitHub → jump back to /dashboard → navbar shows username>
Boundary: <explicitly not doing, and note which Task handles. Example: No register flow (FEAT-02-02), No password reset (FEAT-02-03)>
[TEST]
- Unit: <specific test scenario>
- E2E: <specific verify path>
```

Acceptance sentence by project type: ui = `User can [action] → [perceivable result]`; cli = `User can [run command] → [terminal output]`; api = `Client can [HTTP METHOD /path] → [response structure]`; lib = `Caller can [call API] → [return result]`.

INF/POLISH/PLATFORM goal also needs "Verification method" and "Boundary".

Brief has design decisions → Inject goal: `[User preset] <content>`, same decision forbidden across multiple Tasks.

#### Task JSON Example

```json
{
  "id": "FEAT-02-01",
  "phase": "core",
  "title": "Login flow",
  "status": "blocked",
  "description": "OAuth login + session + route guard + navbar state",
  "goal": "When done, user can login via OAuth on login page, navbar shows avatar after login, access protected page without login redirects. Involves: login page + auth store + route guard + navbar user state area + login API + User/Session Schema (first writer). Implementation hints: Use Lucia Auth v3 + arctic handle OAuth flow; session store PG; admin role via ADMIN_EMAILS env whitelist. Verification method: visit /dashboard → redirected to /login → click GitHub login → OAuth callback → jump back to /dashboard → navbar shows username → click logout → session invalid → visit /dashboard again → redirected. Boundary: No register (FEAT-02-02), No password reset (FEAT-02-03). [TEST] Unit: validateRequest() valid/invalid/expired session three cases; admin email whitelist logic. E2E: access protected page without login → redirect → login → jump back → logout → session invalid.",
  "deps": ["INF-01"],
  "screens": ["S-03"],
  "tag": "Auth",
  "slug": "Auth_Login_Flow"
}
```

---

## Example: Blog Project (ui + api + data)

**Brief**: User can browse articles, register/login, create/edit/publish articles, comment interact.

**Step 0**: Full-stack Web (SSR), highest feature = ui → Slice dimension = user journey sub-flow

**Step 1 — Feature domains**: Content creation(S-05,S-06) | Content browsing(S-01,S-02) | Auth(S-03,S-04,navbar) | Interaction(S-02 comment area)

**Step 2 — Task list**:

- **INF-01: Project structure + framework shell** — pnpm workspace + Turborepo + Next.js App Router shell + App Shell + global layout + design Token. Verify: `pnpm dev` → blank page accessible
- **INF-02: Data layer environment** — Docker Compose + Drizzle ORM config + DB connection pool. deps: INF-01. Verify: `docker-compose up` → `drizzle-kit push` connect success
- **INF-03: Toolchain + test infrastructure** — ESLint/Prettier/commitlint + Vitest config + test utils. deps: INF-01. Verify: `pnpm lint` + `pnpm test` empty suite pass
- **FEAT-01-01: Article create and edit** — Editor page + form + draft auto-save + Article Schema create (first writer). deps: INF-02 + INF-03. ~5 files
    - **FEAT-01-02: Article publish and manage** — Publish/hide/delete API + manage list + status transition (extend Article fields). ~4 files
- **FEAT-02: Article browse** — Home list(S-01) + detail page(S-02) + read API + pagination. deps: FEAT-01-02. ~4 files
- **FEAT-03-01: Login flow** — Login page(S-03) + auth store + route guard + navbar state + login API + Reader Schema create. deps: INF-02 + INF-03. ~5 files
    - **FEAT-03-02: Register flow** — Register page(S-04) + register API + reuse auth store. ~3 files
- **FEAT-04: Comment and interaction** — Comment area + like/bookmark + related API + Comment/Like/Bookmark Schema create + personal center record. deps: FEAT-02 + FEAT-03-01. ~6 files

> Note: INF split into three by layer (framework / data / toolchain), each has independent verify command. FEAT deps point to actually needed INF (need DB point INF-02, need test point INF-03). FEAT-02 (browse) deps FEAT-01-02 (create) reflects browse-create dependency pattern. FEAT-04 merged comment and like/bookmark (after split like/bookmark only ~2 files too fragmented).
>

**Dependency chain**:

```jsx
INF-01 → INF-02 → FEAT-01-01 → FEAT-01-02 → FEAT-02
INF-01 → INF-03
INF-02 + INF-03 → FEAT-03-01 → FEAT-03-02
FEAT-02 + FEAT-03-01 → FEAT-04
```

---

## Output Verification

- [ ]  `roadmap.json` has valid flat `tasks[]` array + `nfr[]`
- [ ]  Each Task passes four baselines + granularity verification checklist
- [ ]  Each FEAT's goal has: Verification method + Boundary (note Task ID) + Implementation hints + `[TEST]` (specific scenarios)
- [ ]  INF only has whitelist content; No "full Schema" INF
- [ ]  Dependency chain reflects real business relationships (not all hang INF-01)
- [ ]  Subtask ID prefix consistent (FEAT-01-01, FEAT-01-02)
- [ ]  ui project: INF-01 has Token + test infrastructure; First ui FEAT has `[DESIGN]`
- [ ]  Data-intensive: First Schema FEAT has seed
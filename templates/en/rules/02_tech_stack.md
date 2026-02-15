---
description: Technical Standards & Technology Stack. Contains language versions, framework choices, coding conventions, naming rules, and forbidden patterns. Consult when writing code.
globs: **/*
applyTo: **/*
alwaysApply: false
---

# Tech Stack & Engineering Standards: [Project Name]

> **Role:** The "Law" of the codebase. Defines tools, structure, and engineering workflows.
> **Status:** [Active]
> **Note:** This is a template file. Needs to be filled with specific content based on project type (Web/CLI/Backend/Library/Mobile, etc.).
> Certain sections (like UI Protocol) apply only to UI projects and should be adjusted or removed as needed.

## 1. Global Mandates

* **No Hardcoding:** All secrets and API addresses must use environment variables. Hardcoding is strictly forbidden.
* **No Dead Code:** Committed code must be clean. Commented-out code blocks or useless `TODO`s are strictly forbidden.
* **Comments for Why:** Comments explain "Why" (business context), not just "What".

---

## 2. Technology Selection

### Core Stack
* **Framework:** [e.g. Next.js 14 (App Router) / NestJS / Express / FastAPI / Gin]
* **Language:** [e.g. TypeScript (Strict Mode) / Python 3.11+ / Rust / Go 1.21+]
* **Styling** (if project has UI): [e.g. TailwindCSS + Shadcn/UI / CSS Modules / Styled Components]
* **State** (if project has frontend state management): [e.g. Zustand (Client) + React Query (Server) / Redux / MobX]
* **Database** (if project has data layer): [e.g. PostgreSQL + Prisma ORM / MongoDB / SQLite / Redis]

### Infrastructure
* **Package Manager:** [e.g. pnpm / npm / yarn / cargo / go mod / pip]
* **Runtime:** [e.g. Node.js 20+ / Python 3.11+ / Rust / Go 1.21+ / Bun]
* **Build Tool:** [e.g. tsup / vite / webpack / cargo / go build]

---

## 3. Coding & Naming Standards

### Naming Conventions
* **Files:** [e.g. `kebab-case` (e.g., `user-profile.ts` / `user_profile.py` / `user_profile.rs`)]
* **Components/Classes:** [e.g. `PascalCase` (e.g., `UserProfile` / `UserService` / `UserRepository`)]
* **Functions/Methods:** [e.g. `camelCase` (e.g., `handleSubmit`) or `snake_case` (Python/Rust)]
* **Constants:** [e.g. `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY` / `MAX_RETRY_COUNT`)]
* **Private Members:** [e.g. `_privateMethod` (JavaScript) / `__private` (Python) / `private_field` (Rust)]

### Code Patterns
* **Export Style:** [e.g. Must use Named Export (`export const`), Default Export is strictly forbidden.]
* **Type Definitions:** [e.g. Must use `interface` for objects, `type` for unions.]
* **Error Handling:** [e.g. Must use Result type (Rust) / Exception handling (Python/Java) / Error return (Go)]
* **Async Patterns:** [e.g. Prefer Async/Await, avoid `.then()` chains.]

---

## 4. UI Protocol: ITP v3.0 (Atomic Standard) [Optional - Only for UI Projects]
<!-- Core UI Description Protocol, all .ui.md files must follow this DSL -->
> **Note:** If project has no UI (e.g. CLI, Backend API, Library), remove this section.

### 4.1 Naming (PrefixFunction)
Component naming must follow `Prefix+Function` format, arbitrary naming is forbidden:
* **Btn**: Button (e.g., `BtnSubmit`)
* **Inp**: Input (e.g., `InpEmail`)
* **Txt**: Text/Label (e.g., `TxtTitle`)
* **Box**: Container/Div (e.g., `BoxHeader`)
* **Img**: Image/Icon (e.g., `ImgAvatar`)
* **List/Card/Modal**: As named.

### 4.2 Syntax Structure
* **Definition**: `Name [Layout] (Style/Content) -> #Interaction`
* **Layout Keywords**: `[Row]`, `[Col]`, `[Center]`, `[Between]`, `[Fill]`, `[Grid]`
* **Example**:
```

    BoxHeader [Row, Between]
      TxtTitle [H2] (Text: "Login")
      BtnClose [Ghost] (Icon: X) -> #CloseModal

```

### 4.3 Delta Syntax
* **Usage**: Used to modify existing UI snapshots (`pages/*.md`).
* **Format**: `@Locator { + Add, ~ Modify, - Remove }`

---

## 5. Testing & Verification

### Static Analysis (Commands)
* **Build:** [e.g. `pnpm build` / `cargo build` / `go build` / `python -m py_compile`]
* **Type Check:** [e.g. `pnpm type-check` / `mypy .` / N/A]
* **Lint:** [e.g. `pnpm lint` / `ruff check .` / `cargo clippy` / `golangci-lint run`]
* **Format:** [e.g. `pnpm format:check` / `ruff format --check` / `cargo fmt --check`]

### Test Suite
* **Unit:** Tool: [e.g. Vitest / Jest / pytest / cargo test / go test]  Scope: [e.g. Utils functions, core business logic, algorithms]  Rule: [e.g. Must Mock external deps; no snapshot tests for volatile UI]
* **Integration:** Tool: [e.g. Vitest + Testcontainers / pytest + Docker]  Scope: [e.g. API→DB write chain / CLI full execution flow]
* **E2E:** Tool: [e.g. [?Web] Playwright / Cypress  [?API] Supertest / httpie  [?CLI] bats / shell script  [?Lib] example project + automation script  [?Mobile] Detox / Maestro]  Scope: [e.g. [?Web] Critical user journeys  [?API] Key endpoint full chain  [?CLI] Key command full flow  [?Lib] Public API typical usage scenarios]
* **Test Command:** [e.g. `pnpm test` / `pytest` / `cargo test` / `go test ./...`]

### Environment Scripts
> Must generate `scripts/` directory during `/archi.start` INF-01 phase (generate `.sh` / `.ps1` per OS).

* **`scripts/validate`** — Automated quality check (AI runs after every code change): all Static Analysis items + Test Command.
* **`scripts/dev-up`** — Bring up dev environment: Install → Build → Start Dev Server → Health Check.
  - **Install:** [e.g. `pnpm install` / `pip install -r requirements.txt` / `cargo build` / `go mod download`]
  - **Dev Command:** [e.g. `npm run dev` / `python manage.py runserver` / `cargo run` / N/A]
  - **Health Check:** [e.g. `curl http://localhost:3000/api/health` / `./bin/cli --version` / `python -c "import mylib"`]
* **`scripts/dev-reset`** — Environment reset (when environment is broken): Kill Processes → Clean Cache → Reinstall → Rebuild → Restart.

---

## 6. Deployment & Release

### CI Pipeline
* **Pre-commit:** [e.g. Must pass Linter and Formatter checks (ESLint/Prettier / ruff/black / clippy / golangci-lint).]
* **Merge Gate:** [e.g. PR must pass all Unit/Integration tests before merge.]
* **Build Check:** [e.g. Must pass build check (`npm run build` / `cargo build` / `go build`).]

### Environment
* **Secrets:** [e.g. Production secrets must be configured via CI platform, strictly forbidden to commit `.env` / `.env.local`.]
* **Database Ops** (if project has DB): [e.g. Schema changes must use Migration files, manual modification of production DB is forbidden.]
* **Binary Distribution** (if project is CLI/Library): [e.g. Use GitHub Releases to publish binaries, support multi-platform builds.]

---

## 3. Architecture & File Placement Strategy

### Repository Architecture
* **Strategy:** [e.g. Monorepo (Turborepo) or Single Repo]
* **Workspace:** [e.g. pnpm workspaces, shared dependencies hoisted to Root.]

### Directory Structure
* **Pattern:** [Architecture Pattern Name]
* **Philosophy**: [Architecture Philosophy]
* **Key Paths**:
    * `[Path_1]`: [Description]
    * `[Path_2]`: [Description]
* **Constraint**: [Architecture Constraints]

### File Placement Rules
> *Context*: Defines where different types of files should be created. **Must adapt to project type (Web/CLI/API/Lib) and directory structure in `01_map.md`**; table below is placeholder.

| File Type | Placement Strategy | Example (adapt per project) |
| :--- | :--- | :--- |
| **Unit Tests** | [e.g. Colocation or Centralized] | `utils/date.test.ts` / `__tests__/` |
| **Interfaces/Types** | [e.g. Near usage or Global types] | `types/user.d.ts` / `domain/user.entity.ts` |
| **Assets/Images** [?UI] | [e.g. Public or Module assets] | `public/images` / `assets/` |
| **Styles** [?UI] | [e.g. Per-component or Global] | `Button.module.css` / `global.css` |
| **DTOs/Models** [?Data] | [e.g. Domain or Shared] | `domain/user/dto` / `models/` |

---

## 8. Anti-Patterns
* **No [Tech 1]:** [e.g. No Redux - This project is too heavy, do not use.]
* **No [Tech 2]:** [e.g. No Raw SQL - Must use ORM to prevent injection.]
* **No [Pattern 1]:** [e.g. Forbidden to fetch data directly inside components, must encapsulate in Service layer.]
* **No [Pattern 2]:** [e.g. Forbidden to use `any` type (TypeScript) / Forbidden to use `unsafe` code (Rust).]
* **No [Pattern 3]:** [e.g. Forbidden to use `console.log` in production code, must use unified Logger.]

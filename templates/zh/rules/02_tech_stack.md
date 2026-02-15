---
description: Technical Standards & Technology Stack. Contains language versions, framework choices, coding conventions, naming rules, and forbidden patterns. Consult when writing code.
globs: **/*
applyTo: **/*
alwaysApply: false
---

# Tech Stack & Engineering Standards: [项目名称]

> **Role:** The "Law" of the codebase. Defines tools, structure, and engineering workflows.
> **Status:** [Active]
> **Note:** 这是一个模板文件，需要根据项目类型（Web/CLI/Backend/Library/Mobile 等）填充具体内容。
> 某些章节（如 UI Protocol）仅适用于有 UI 的项目，应根据实际情况调整或删除。

## 1. Global Mandates (全局红线)
* **No Hardcoding:** 所有的密钥、API地址必须使用环境变量，严禁硬编码。
* **No Dead Code:** 提交的代码必须是干净的，严禁保留注释掉的代码块或无用的 `TODO`。
* **Comments for Why:** 注释解释“为什么这么做”（业务背景），而不仅仅是“做了什么”。

---

## 2. Technology Selection (技术选型)
### Core Stack
* **Framework:** [例如：Next.js 14 (App Router) / NestJS / Express / FastAPI / Gin]
* **Language:** [例如：TypeScript (Strict Mode) / Python 3.11+ / Rust / Go 1.21+]
* **Styling** (如项目有 UI): [例如：TailwindCSS + Shadcn/UI / CSS Modules / Styled Components]
* **State** (如项目有前端状态管理): [例如：Zustand (Client) + React Query (Server) / Redux / MobX]
* **Database** (如项目有数据层): [例如：PostgreSQL + Prisma ORM / MongoDB / SQLite / Redis]

### Infrastructure
* **Package Manager:** [例如：pnpm / npm / yarn / cargo / go mod / pip]
* **Runtime:** [例如：Node.js 20+ / Python 3.11+ / Rust / Go 1.21+ / Bun]
* **Build Tool:** [例如：tsup / vite / webpack / cargo / go build]

---

## 3. Coding & Naming Standards (代码与命名规范)
### Naming Conventions
* **Files:** [例如：`kebab-case` (e.g., `user-profile.ts` / `user_profile.py` / `user_profile.rs`)]
* **Components/Classes:** [例如：`PascalCase` (e.g., `UserProfile` / `UserService` / `UserRepository`)]
* **Functions/Methods:** [例如：`camelCase` (e.g., `handleSubmit`) 或 `snake_case` (Python/Rust)]
* **Constants:** [例如：`UPPER_SNAKE_CASE` (e.g., `MAX_RETRY` / `MAX_RETRY_COUNT`)]
* **Private Members:** [例如：`_privateMethod` (JavaScript) / `__private` (Python) / `private_field` (Rust)]

### Code Patterns
* **Export Style:** [例如：必须使用 Named Export (`export const`), 严禁使用 Default Export。]
* **Type Definitions:** [例如：必须使用 `interface` 定义对象，使用 `type` 定义联合类型。]
* **Error Handling:** [例如：必须使用 Result 类型 (Rust) / 异常处理 (Python/Java) / 错误返回 (Go)]
* **Async Patterns:** [例如：优先使用 Async/Await，避免 `.then()` 链式调用。]

---

## 4. UI Protocol: ITP v3.0 (Atomic Standard) [可选 - 仅适用于有 UI 的项目]
<!-- 核心 UI 描述协议，所有 .ui.md 文件必须遵循此 DSL -->
> **Note:** 如果项目没有 UI（如 CLI、Backend API、Library），可以删除此章节。

### 4.1 Naming (PrefixFunction)
组件命名必须遵循 `前缀+功能` 格式，严禁随意命名：
* **Btn**: Button (e.g., `BtnSubmit`)
* **Inp**: Input (e.g., `InpEmail`)
* **Txt**: Text/Label (e.g., `TxtTitle`)
* **Box**: Container/Div (e.g., `BoxHeader`)
* **Img**: Image/Icon (e.g., `ImgAvatar`)
* **List/Card/Modal**: As named.

### 4.2 Syntax Structure (语法结构)
* **Definition**: `Name [Layout] (Style/Content) -> #Interaction`
* **Layout Keywords**: `[Row]`, `[Col]`, `[Center]`, `[Between]`, `[Fill]`, `[Grid]`
* **Example**:
```

    BoxHeader [Row, Between]
      TxtTitle [H2] (Text: "Login")
      BtnClose [Ghost] (Icon: X) -> #CloseModal

```

### 4.3 Delta Syntax (差分更新)
* **Usage**: 用于修改现有 UI 快照 (`pages/*.md`)。
* **Format**: `@Locator { + Add, ~ Modify, - Remove }`

---

## 5. Testing & Verification (测试与验证)

### Static Analysis (静态分析命令)
* **Build:** [例如：`pnpm build` / `cargo build` / `go build` / `python -m py_compile`]
* **Type Check:** [例如：`pnpm type-check` / `mypy .` / N/A]
* **Lint:** [例如：`pnpm lint` / `ruff check .` / `cargo clippy` / `golangci-lint run`]
* **Format:** [例如：`pnpm format:check` / `ruff format --check` / `cargo fmt --check`]

### Test Suite (测试套件)
* **Unit:** Tool: [例如：Vitest / Jest / pytest / cargo test / go test]  Scope: [例如：Utils 工具函数、核心业务逻辑、算法]  Rule: [例如：须 Mock 外部依赖；禁对易变 UI 做快照测试]
* **Integration:** Tool: [例如：Vitest + Testcontainers / pytest + Docker]  Scope: [例如：API→DB 写入链路 / CLI 完整执行流程]
* **E2E:** Tool: [例如：[?Web] Playwright / Cypress  [?API] Supertest / httpie  [?CLI] bats / shell script  [?Lib] 示例项目 + 自动化脚本  [?Mobile] Detox / Maestro]  Scope: [例如：[?Web] 核心用户路径  [?API] 关键 endpoint 全链路  [?CLI] 关键命令全流程  [?Lib] 公开 API 典型使用场景]
* **Test Command:** [例如：`pnpm test` / `pytest` / `cargo test` / `go test ./...`]

### Environment Scripts (环境脚本)
> 须在 `/archi.start` INF-01 阶段生成 `scripts/` 目录（按 OS 生成 `.sh` / `.ps1`）。

* **`scripts/validate`** — 自动化质检（AI 每次改完代码后执行）：Static Analysis 全项 + Test Command。
* **`scripts/dev-up`** — 拉起开发环境：Install → Build → Start Dev Server → Health Check。
  - **Install:** [例如：`pnpm install` / `pip install -r requirements.txt` / `cargo build` / `go mod download`]
  - **Dev Command:** [例如：`npm run dev` / `python manage.py runserver` / `cargo run` / N/A]
  - **Health Check:** [例如：`curl http://localhost:3000/api/health` / `./bin/cli --version` / `python -c "import mylib"`]
* **`scripts/dev-reset`** — 环境重置（环境异常时执行）：Kill Processes → Clean Cache → Reinstall → Rebuild → Restart。

---

## 6. Deployment & Release (部署与发布)
### CI Pipeline (流水线)
* **Pre-commit:** [例如：必须通过 Linter 和 Formatter 检查（ESLint/Prettier / ruff/black / clippy / golangci-lint）。]
* **Merge Gate:** [例如：PR 合并前必须通过所有 Unit/Integration 测试。]
* **Build Check:** [例如：必须通过构建检查（`npm run build` / `cargo build` / `go build`）。]

### Environment (环境)
* **Secrets:** [例如：生产环境密钥必须通过 CI 平台配置，严禁提交 `.env` / `.env.local`。]
* **Database Ops** (如项目有数据库): [例如：Schema 变更必须使用 Migration 文件，禁止手动修改生产库。]
* **Binary Distribution** (如项目是 CLI/Library): [例如：使用 GitHub Releases 发布二进制文件，支持多平台构建。]

---

## 3. Architecture & File Placement Strategy (架构与文件归位策略)
### Repository Architecture (仓库形态)
* **Strategy:** [例如：Monorepo (Turborepo) 或 Single Repo (单体仓库)]
* **Workspace:** [例如：pnpm workspaces，共享依赖提升至 Root。]

### Directory Structure (目录结构)
* **Pattern:** [Architecture Pattern Name]
* **Philosophy**: [Architecture Philosophy]
* **Key Paths**:
    * `[Path_1]`: [Description]
    * `[Path_2]`: [Description]
* **Constraint**: [Architecture Constraints]

### File Placement Rules (文件归位逻辑)
> *Context*: 定义不同类型的文件应创建在哪里。**须依据项目类型 (Web/CLI/API/Lib) 与 `01_map.md` 的目录结构自定义**，下表为占位示例。

| File Type | Placement Strategy | Example (依据项目调整) |
| :--- | :--- | :--- |
| **Unit Tests** | [e.g. Colocation 或 Centralized] | `utils/date.test.ts` / `__tests__/` |
| **Interfaces/Types** | [e.g. Near usage 或 Global types] | `types/user.d.ts` / `domain/user.entity.ts` |
| **Assets/Images** [?UI] | [e.g. Public 或 Module assets] | `public/images` / `assets/` |
| **Styles** [?UI] | [e.g. 按组件或全局] | `Button.module.css` / `global.css` |
| **DTOs/Models** [?Data] | [e.g. Domain 或 Shared] | `domain/user/dto` / `models/` |

---

## 8. Anti-Patterns (负面清单)
* **No [技术 1]:** [例如：No Redux - 本项目过重，勿用。]
* **No [技术 2]:** [例如：No Raw SQL - 必须使用 ORM 防止注入。]
* **No [模式 1]:** [例如：禁止在组件内部直接 fetch 数据，必须封装在 Service 层。]
* **No [模式 2]:** [例如：禁止使用 `any` 类型（TypeScript）/ 禁止使用 `unsafe` 代码（Rust）。]
* **No [模式 3]:** [例如：禁止使用 `console.log` 生产代码，必须使用统一的 Logger。]
---
description: Technical Standards & Technology Stack. Contains language versions, framework choices, coding conventions, naming rules, and forbidden patterns. Consult when writing code.
globs: **/*
applyTo: **/*
alwaysApply: true
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

<!-- ═══════ 以下为固定协议（禁修改） ═══════ -->
## 4. UI Protocol: ITP v3.0 (Dual-Artifact) [可选 - 仅适用于有 UI 的项目]
<!-- 核心 UI 描述协议 -->
> **Note:** 如果项目没有 UI（如 CLI、Backend API、Library），可以删除此章节。

### 4.1 Dual-Artifact Strategy (双制品策略)

UI 制品层级：

| 制品 | 格式 | 读者 | 职责 |
|:---|:---|:---|:---|
| `ui_concept.html` | 单文件 HTML | 人类 (浏览器) | **全局视觉真相源** — 所有屏幕的线框图/着色稿 |
| `ui_context.md` | 结构化 Markdown | AI (plan/code/audit/edit) | **AI 屏幕索引** — 屏幕 ID/路由/状态/导航关系/共享组件轻量清单 |
| `ui.md` | ITP v3.0 DSL | AI (code/audit) | 任务级 UI 范围声明 — 指定本任务涵盖的屏幕/组件 |
- `ui_concept.html` 由 `archi-ui-wireframe` Skill 生成，覆盖项目所有用户可见屏幕；仅供人类在浏览器预览
- `ui_context.md` 由同一 Skill 同步生成，是 AI 命令读取 UI 结构信息的唯一入口；禁手动修改
- `ui.md` 仅声明"本任务负责 ui_context.md 中的哪些屏幕/状态"，禁重定义全局布局
- code 阶段以 `ui.md`（任务设计）+ `ui_context.md`（结构/导航）+ `design_tokens.json`（视觉约束）为准；同时以 `ui_concept.html` 为**只读视觉参考**校准布局，用**项目自身技术栈**实现等价视觉效果

### 4.2 Naming (PrefixFunction)
组件命名须遵循 `前缀+功能` 格式：
* **Btn**: Button | **Inp**: Input | **Txt**: Text/Label
* **Box**: Container | **Img**: Image/Icon | **List/Card/Modal**: As named.

### 4.3 Syntax Structure (语法结构)
* **Definition**: `Name [Layout] (Style/Content) -> #Interaction`
* **Layout Keywords**: `[Row]`, `[Col]`, `[Center]`, `[Between]`, `[Fill]`, `[Grid]`
* **Example**:
```
    BoxHeader [Row, Between]
      TxtTitle [H2] (Text: "Login")
      BtnClose [Ghost] (Icon: X) -> #CloseModal
```

### 4.4 Design Tokens (设计令牌)
`design_tokens.json` 定义项目专属视觉语言，由 `/archi.start` 从 Brief 生成：
- `primitivePalette`: 原始色阶（中性灰 + 品牌色）
- `semanticTokens`: 语义色（Background/Primary/Text…）+ 字体规格
- `layout`: 圆角/阴影/间距尺寸
- `motion`: 动效时长/缓动/模式偏好
- `illustration`: 图示风格/图标库
- **code 阶段**: 所有颜色/尺寸/动效值须来自此文件对应字段，禁硬编码魔法值

### 4.5 Delta Syntax (差分更新)
* **Usage**: 用于修改现有 UI 快照。
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
* **E2E:** Tool: [例如：（仅ui项目） Playwright / Cypress （仅api项目） Supertest / httpie （仅cli项目） bats / shell script （仅lib项目） 示例项目 + 自动化脚本 （仅mobile项目） Detox / Maestro]  Scope: [例如：（仅ui项目） 核心用户路径 （仅api项目） 关键 endpoint 全链路 （仅cli项目） 关键命令全流程 （仅lib项目） 公开 API 典型使用场景]
* **Test Command:** [例如：`pnpm test` / `pytest` / `cargo test` / `go test ./...`]

### Environment Scripts (环境脚本)
> **AI Internal Tooling**: 此脚本由 AI 在 INF-01 阶段基于上方命令定义自动生成，实现细节（脚本结构、失败策略、执行方式）由 AI 自决，禁向用户提问。按 OS 生成 `.sh` / `.ps1` 至 `[[__DOCS_DIR__]]/scripts/`。

* **`[[__DOCS_DIR__]]/scripts/validate`** — 自动化质检（AI 每次改完代码后执行）：Static Analysis 全项 + Test Command。
* **`[[__DOCS_DIR__]]/scripts/dev-up`** — 拉起开发环境：Install → Build → Start Dev Server → Health Check。
  - **Install:** [例如：`pnpm install` / `pip install -r requirements.txt` / `cargo build` / `go mod download`]
  - **Dev Command:** [例如：`npm run dev` / `python manage.py runserver` / `cargo run` / N/A]
  - **Health Check:** [例如：`curl http://localhost:3000/api/health` / `./bin/cli --version` / `python -c "import mylib"`]
* **`[[__DOCS_DIR__]]/scripts/dev-reset`** — 环境重置（环境异常时执行）：Kill Processes → Clean Cache → Reinstall → Rebuild → Restart。

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

## 7. Architecture & File Placement Strategy (架构与文件归位策略)
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
> *Context*: 定义不同类型的文件应创建在哪里。**须依据项目类型 (Web/CLI/API/Lib) 与 `map.json` 的目录结构自定义**，下表为占位示例。
> **Critical**: 创建新文件前须查此表。此表填充后即为强制约束，禁凭 AI 默认习惯自行放置。

| File Type | Placement Strategy | Example (依据项目调整) |
| :--- | :--- | :--- |
| **Unit Tests** | [e.g. Centralized 或 Colocation] | `__tests__/utils/date.test.ts` / `utils/date.test.ts` |
| **Interfaces/Types** | [e.g. Near usage 或 Global types] | `types/user.d.ts` / `domain/user.entity.ts` |
| **Assets/Images**（仅ui项目） | [e.g. Public 或 Module assets] | `public/images` / `assets/` |
| **Styles**（仅ui项目） | [e.g. 按组件或全局] | `Button.module.css` / `global.css` |
| **DTOs/Models**（仅data项目） | [e.g. Domain 或 Shared] | `domain/user/dto` / `models/` |

---

## 8. Anti-Patterns (负面清单)
* **No Orphan .gitkeep:** 空目录可用 `.gitkeep` 占位以便 Git 跟踪；目录已有其他文件时须删除 `.gitkeep`。
* **No Rogue File Placement:** 创建新文件前须查 §7 File Placement Rules 表，禁凭 AI 训练数据的默认习惯自行放置（尤其是测试文件）。
* **No [技术 1]:** [例如：No Redux - 本项目过重，勿用。]
* **No [技术 2]:** [例如：No Raw SQL - 必须使用 ORM 防止注入。]
* **No [模式 1]:** [例如：禁止在组件内部直接 fetch 数据，必须封装在 Service 层。]
* **No [模式 2]:** [例如：禁止使用 `any` 类型（TypeScript）/ 禁止使用 `unsafe` 代码（Rust）。]
* **No [模式 3]:** [例如：禁止使用 `console.log` 生产代码，必须使用统一的 Logger。]

---

## 9. Project Conventions (项目约定)
> 全局架构约定，由 `/archi.start` 确立。`/archi.plan` 自动继承，任务无特殊需求时不再逐一提问。
> 任务若需偏离约定，须在提案中明确说明偏离理由。

### Error Handling (错误处理策略)
* **Strategy:** [例如：Fail Fast + Form Validation / Fail Fast (stderr) / Schema Validation + Fail Fast]
* **Rationale:** [例如：表单密集型应用，需前端实时校验 + 后端快速失败]

### Data Flow (数据流模式) （仅ui项目）
* **Default:** [例如：Standard Request + SWR / Realtime (Socket) / Polling]
* **Rationale:** [例如：大部分页面为 CRUD 读写，SWR 做缓存和重新验证]

### Auth & Access (认证与权限) （仅ui或api项目）
* **Mechanism:** [例如：JWT + RBAC / Session + Owner Only / API Key]
* **Rationale:** [例如：多角色后台管理系统，需细粒度权限控制]
---
description: Technical Standards & Technology Stack. Contains language versions, framework choices, coding conventions, naming rules, and forbidden patterns. Consult when writing code.
globs: **/*
applyTo: **/*
alwaysApply: false
---

# Tech Stack & Engineering Standards: [專案名稱]

> **Role:** The "Law" of the codebase. Defines tools, structure, and engineering workflows.
> **Status:** [Active]
> **Note:** 這是一個模板檔案，需要根據專案類型（Web/CLI/Backend/Library/Mobile 等）填充具體內容。
> 某些章節（如 UI Protocol）僅適用於有 UI 的專案，應根據實際情況調整或刪除。

## 1. Global Mandates (全局紅線)
* **No Hardcoding:** 所有的密鑰、API地址必須使用環境變數，嚴禁硬編碼。
* **No Dead Code:** 提交的程式碼必須是乾淨的，嚴禁保留註釋掉的程式碼塊或無用的 `TODO`。
* **Comments for Why:** 註釋解釋「為什麼這麼做」（業務背景），而不僅僅是「做了什麼」。

---

## 2. Technology Selection (技術選型)
### Core Stack
* **Framework:** [例如：Next.js 14 (App Router) / NestJS / Express / FastAPI / Gin]
* **Language:** [例如：TypeScript (Strict Mode) / Python 3.11+ / Rust / Go 1.21+]
* **Styling** (如專案有 UI): [例如：TailwindCSS + Shadcn/UI / CSS Modules / Styled Components]
* **State** (如專案有前端狀態管理): [例如：Zustand (Client) + React Query (Server) / Redux / MobX]
* **Database** (如專案有數據層): [例如：PostgreSQL + Prisma ORM / MongoDB / SQLite / Redis]

### Infrastructure
* **Package Manager:** [例如：pnpm / npm / yarn / cargo / go mod / pip]
* **Runtime:** [例如：Node.js 20+ / Python 3.11+ / Rust / Go 1.21+ / Bun]
* **Build Tool:** [例如：tsup / vite / webpack / cargo / go build]

---

## 3. Coding & Naming Standards (程式碼與命名規範)
### Naming Conventions
* **Files:** [例如：`kebab-case` (e.g., `user-profile.ts` / `user_profile.py` / `user_profile.rs`)]
* **Components/Classes:** [例如：`PascalCase` (e.g., `UserProfile` / `UserService` / `UserRepository`)]
* **Functions/Methods:** [例如：`camelCase` (e.g., `handleSubmit`) 或 `snake_case` (Python/Rust)]
* **Constants:** [例如：`UPPER_SNAKE_CASE` (e.g., `MAX_RETRY` / `MAX_RETRY_COUNT`)]
* **Private Members:** [例如：`_privateMethod` (JavaScript) / `__private` (Python) / `private_field` (Rust)]

### Code Patterns
* **Export Style:** [例如：必須使用 Named Export (`export const`), 嚴禁使用 Default Export。]
* **Type Definitions:** [例如：必須使用 `interface` 定義物件，使用 `type` 定義聯合類型。]
* **Error Handling:** [例如：必須使用 Result 類型 (Rust) / 異常處理 (Python/Java) / 錯誤返回 (Go)]
* **Async Patterns:** [例如：優先使用 Async/Await，避免 `.then()` 鏈式調用。]

---

## 4. UI Protocol: ITP v3.0 (Dual-Artifact) [可選 - 僅適用於有 UI 的專案]
<!-- 核心 UI 描述協議 -->
> **Note:** 如果專案沒有 UI（如 CLI、Backend API、Library），可以刪除此章節。

### 4.1 Dual-Artifact Strategy (雙製品策略)

UI 製品層級：

| 製品 | 格式 | 讀者 | 職責 |
|:---|:---|:---|:---|
| `ui_concept.html` | 單檔案 HTML | 人類 (瀏覽器) | **全域視覺真相源** — 所有畫面的線框圖/著色稿 |
| `ui_context.md` | 結構化 Markdown | AI (plan/code/audit/edit) | **AI 畫面索引** — 畫面 ID/路由/狀態/導覽關係/共享元件輕量清單 |
| `ui.md` | ITP v3.0 DSL | AI (code/audit) | 任務級 UI 範圍聲明 — 指定本任務涵蓋的畫面/元件 |
- `ui_concept.html` 由 `archi-ui-wireframe` Skill 生成，覆蓋專案所有使用者可見畫面；僅供人類在瀏覽器預覽
- `ui_context.md` 由同一 Skill 同步生成，是 AI 命令讀取 UI 結構資訊的唯一入口；禁手動修改
- `ui.md` 僅聲明「本任務負責 ui_context.md 中的哪些畫面/狀態」，禁重定義全域布局
- code 階段以 `ui.md`（任務設計）+ `ui_context.md`（結構/導航）+ `design_tokens.json`（視覺約束）為準；同時以 `ui_concept.html` 為**唯讀視覺參考**校準布局，用**專案自身技術棧**實現等價視覺效果

### 4.2 Naming (PrefixFunction)
元件命名須遵循 `前綴+功能` 格式：
* **Btn**: Button | **Inp**: Input | **Txt**: Text/Label
* **Box**: Container | **Img**: Image/Icon | **List/Card/Modal**: As named.

### 4.3 Syntax Structure (語法結構)
* **Definition**: `Name [Layout] (Style/Content) -> #Interaction`
* **Layout Keywords**: `[Row]`, `[Col]`, `[Center]`, `[Between]`, `[Fill]`, `[Grid]`
* **Example**:
```
    BoxHeader [Row, Between]
      TxtTitle [H2] (Text: "Login")
      BtnClose [Ghost] (Icon: X) -> #CloseModal
```

### 4.4 Design Tokens (設計令牌)
`design_tokens.json` 定義專案專屬視覺語言，由 `/archi.start` 從 Brief 生成：
- `primitivePalette`: 原始色階（中性灰 + 品牌色）
- `semanticTokens`: 語義色（Background/Primary/Text…）+ 字體規格
- `layout`: 圓角/陰影/間距尺寸
- `motion`: 動效時長/緩動/模式偏好
- `illustration`: 圖示風格/圖示庫
- **code 階段**: 所有顏色/尺寸/動效值須來自此檔案對應欄位，禁硬編碼魔法值

### 4.5 Delta Syntax (差分更新)
* **Usage**: 用於修改現有 UI 快照。
* **Format**: `@Locator { + Add, ~ Modify, - Remove }`

---

## 5. Testing & Verification (測試與驗證)

### Static Analysis (靜態分析命令)
* **Build:** [例如：`pnpm build` / `cargo build` / `go build` / `python -m py_compile`]
* **Type Check:** [例如：`pnpm type-check` / `mypy .` / N/A]
* **Lint:** [例如：`pnpm lint` / `ruff check .` / `cargo clippy` / `golangci-lint run`]
* **Format:** [例如：`pnpm format:check` / `ruff format --check` / `cargo fmt --check`]

### Test Suite (測試套件)
* **Unit:** Tool: [例如：Vitest / Jest / pytest / cargo test / go test]  Scope: [例如：Utils 工具函數、核心業務邏輯、算法]  Rule: [例如：須 Mock 外部依賴；禁對易變 UI 做快照測試]
* **Integration:** Tool: [例如：Vitest + Testcontainers / pytest + Docker]  Scope: [例如：API→DB 寫入鏈路 / CLI 完整執行流程]
* **E2E:** Tool: [例如：[?Web] Playwright / Cypress  [?API] Supertest / httpie  [?CLI] bats / shell script  [?Lib] 範例專案 + 自動化腳本  [?Mobile] Detox / Maestro]  Scope: [例如：[?Web] 核心使用者路徑  [?API] 關鍵 endpoint 全鏈路  [?CLI] 關鍵命令全流程  [?Lib] 公開 API 典型使用場景]
* **Test Command:** [例如：`pnpm test` / `pytest` / `cargo test` / `go test ./...`]

### Environment Scripts (環境腳本)
> **AI Internal Tooling**: 此腳本由 AI 在 INF-01 階段基於上方命令定義自動生成，實現細節（腳本結構、失敗策略、執行方式）由 AI 自決，禁向使用者提問。按 OS 生成 `.sh` / `.ps1` 至 `[[__DOCS_DIR__]]/scripts/`。

* **`[[__DOCS_DIR__]]/scripts/validate`** — 自動化質檢（AI 每次改完程式碼後執行）：Static Analysis 全項 + Test Command。
* **`[[__DOCS_DIR__]]/scripts/dev-up`** — 拉起開發環境：Install → Build → Start Dev Server → Health Check。
  - **Install:** [例如：`pnpm install` / `pip install -r requirements.txt` / `cargo build` / `go mod download`]
  - **Dev Command:** [例如：`npm run dev` / `python manage.py runserver` / `cargo run` / N/A]
  - **Health Check:** [例如：`curl http://localhost:3000/api/health` / `./bin/cli --version` / `python -c "import mylib"`]
* **`[[__DOCS_DIR__]]/scripts/dev-reset`** — 環境重置（環境異常時執行）：Kill Processes → Clean Cache → Reinstall → Rebuild → Restart。

---

## 6. Deployment & Release (部署與發佈)
### CI Pipeline (流水線)
* **Pre-commit:** [例如：必須通過 Linter 和 Formatter 檢查（ESLint/Prettier / ruff/black / clippy / golangci-lint）。]
* **Merge Gate:** [例如：PR 合併前必須通過所有 Unit/Integration 測試。]
* **Build Check:** [例如：必須通過構建檢查（`npm run build` / `cargo build` / `go build`）。]

### Environment (環境)
* **Secrets:** [例如：生產環境密鑰必須通過 CI 平台配置，嚴禁提交 `.env` / `.env.local`。]
* **Database Ops** (如專案有數據庫): [例如：Schema 變更必須使用 Migration 檔案，禁止手動修改生產庫。]
* **Binary Distribution** (如專案是 CLI/Library): [例如：使用 GitHub Releases 發佈二進位檔案，支持多平台構建。]

---

## 3. Architecture & File Placement Strategy (架構與檔案歸位策略)
### Repository Architecture (倉庫形態)
* **Strategy:** [例如：Monorepo (Turborepo) 或 Single Repo (單體倉庫)]
* **Workspace:** [例如：pnpm workspaces，共享依賴提升至 Root。]

### Directory Structure (目錄結構)
* **Pattern:** [Architecture Pattern Name]
* **Philosophy**: [Architecture Philosophy]
* **Key Paths**:
    * `[Path_1]`: [Description]
    * `[Path_2]`: [Description]
* **Constraint**: [Architecture Constraints]

### File Placement Rules (檔案歸位邏輯)
> *Context*: 定義不同類型的檔案應創建在哪裡。**須依據專案類型 (Web/CLI/API/Lib) 與 `map.json` 的目錄結構自訂**，下表為佔位示例。
> **Critical**: 建立新檔案前須查此表。此表填充後即為強制約束，禁憑 AI 預設習慣自行放置。

| File Type | Placement Strategy | Example (依據專案調整) |
| :--- | :--- | :--- |
| **Unit Tests** | [e.g. Centralized 或 Colocation] | `__tests__/utils/date.test.ts` / `utils/date.test.ts` |
| **Interfaces/Types** | [e.g. Near usage 或 Global types] | `types/user.d.ts` / `domain/user.entity.ts` |
| **Assets/Images** [?UI] | [e.g. Public 或 Module assets] | `public/images` / `assets/` |
| **Styles** [?UI] | [e.g. 按元件或全域] | `Button.module.css` / `global.css` |
| **DTOs/Models** [?Data] | [e.g. Domain 或 Shared] | `domain/user/dto` / `models/` |

---

## 8. Anti-Patterns (負面清單)
* **No Orphan .gitkeep:** 空目錄可用 `.gitkeep` 占位以便 Git 追蹤；目錄已有其他檔案時須刪除 `.gitkeep`。
* **No Rogue File Placement:** 建立新檔案前須查 §3 File Placement Rules 表，禁憑 AI 訓練資料的預設習慣自行放置（尤其是測試檔案）。
* **No [技術 1]:** [例如：No Redux - 本專案過重，勿用。]
* **No [技術 2]:** [例如：No Raw SQL - 必須使用 ORM 防止注入。]
* **No [模式 1]:** [例如：禁止在組件內部直接 fetch 數據，必須封裝在 Service 層。]
* **No [模式 2]:** [例如：禁止使用 `any` 類型（TypeScript）/ 禁止使用 `unsafe` 程式碼（Rust）。]
* **No [模式 3]:** [例如：禁止使用 `console.log` 生產程式碼，必須使用統一的 Logger。]

---

## 9. Project Conventions (專案約定)
> 全域架構約定，由 `/archi.start` 確立。`/archi.plan` 自動繼承，任務無特殊需求時不再逐一提問。
> 任務若需偏離約定，須在提案中明確說明偏離理由。

### Error Handling (錯誤處理策略)
* **Strategy:** [例如：Fail Fast + Form Validation / Fail Fast (stderr) / Schema Validation + Fail Fast]
* **Rationale:** [例如：表單密集型應用，需前端即時校驗 + 後端快速失敗]

### Data Flow (資料流模式) [?UI]
* **Default:** [例如：Standard Request + SWR / Realtime (Socket) / Polling]
* **Rationale:** [例如：大部分頁面為 CRUD 讀寫，SWR 做快取和重新驗證]

### Auth & Access (認證與權限) [?Web/API]
* **Mechanism:** [例如：JWT + RBAC / Session + Owner Only / API Key]
* **Rationale:** [例如：多角色後台管理系統，需細粒度權限控制]

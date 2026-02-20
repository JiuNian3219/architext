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

每個 UI 功能產出兩個製品，職責分離：

| 製品 | 格式 | 讀者 | 職責 |
|:---|:---|:---|:---|
| `ui.md` | ITP v3.0 DSL | AI (code/audit) | 元件樹、互動、視覺意圖、狀態 — 結構真相源 |
| `ui.preview.html` | HTML + Tailwind CDN | 人類 (瀏覽器) | 視覺預覽 — 可直接開啟檢視效果 |

- `ui.md` 是給 AI 讀的機器規格書，不需人類舒適閱讀
- `ui.preview.html` 使用 HTML + Tailwind 作為**通用預覽介質**（AI 訓練充分、零依賴、出錯率低），與專案實際技術棧無關
- 兩者須保持一致；code 階段以 `ui.md` 為準，用**專案自身技術棧**實現等價視覺效果

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

### 4.4 Component Presets (元件預設)
`design_tokens.json` 中的 `componentPresets` 用 Tailwind class 描述常用元件的**視覺模式**（佈局、間距、圓角、陰影等）。
- Tailwind class 是「參考實現」，不是必須照抄的程式碼
- `ui.md` 中透過 `(Preset: card)` 引用預設名稱
- `ui.preview.html` 中直接使用 Tailwind class 渲染預覽
- **code 階段**：用專案技術棧實現等價視覺效果（如元件庫的 `<Card>`、SwiftUI 的 `.cardStyle()`、Flutter 的 `Card()` 等）；核心是視覺一致，不是 class 一致

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

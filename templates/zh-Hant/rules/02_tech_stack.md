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

## 4. UI Protocol: ITP v3.0 (Atomic Standard) [可選 - 僅適用於有 UI 的專案]
<!-- 核心 UI 描述協議，所有 .ui.md 檔案必須遵循此 DSL -->
> **Note:** 如果專案沒有 UI（如 CLI、Backend API、Library），可以刪除此章節。

### 4.1 Naming (PrefixFunction)
組件命名必須遵循 `前綴+功能` 格式，嚴禁隨意命名：
* **Btn**: Button (e.g., `BtnSubmit`)
* **Inp**: Input (e.g., `InpEmail`)
* **Txt**: Text/Label (e.g., `TxtTitle`)
* **Box**: Container/Div (e.g., `BoxHeader`)
* **Img**: Image/Icon (e.g., `ImgAvatar`)
* **List/Card/Modal**: As named.

### 4.2 Syntax Structure (語法結構)
* **Definition**: `Name [Layout] (Style/Content) -> #Interaction`
* **Layout Keywords**: `[Row]`, `[Col]`, `[Center]`, `[Between]`, `[Fill]`, `[Grid]`
* **Example**:
```

    BoxHeader [Row, Between]
      TxtTitle [H2] (Text: "Login")
      BtnClose [Ghost] (Icon: X) -> #CloseModal

```

### 4.3 Delta Syntax (差分更新)
* **Usage**: 用於修改現有 UI 快照 (`pages/*.md`)。
* **Format**: `@Locator { + Add, ~ Modify, - Remove }`

---

## 5. Testing Strategy (測試策略)
### Unit Testing (單元測試)
* **Tool:** [例如：Vitest / Jest / pytest / cargo test / go test / unittest]
* **Scope:** [例如：覆蓋所有的 Utils 工具函數、複雜的業務邏輯、核心算法。]
* **Rule:** [例如：必須 Mock 所有外部依賴（API、數據庫、檔案系統）。禁止對易變 UI 進行快照測試（如適用）。]

### Integration Testing (集成測試)
* **Tool:** [例如：Vitest + Testcontainers / pytest + Docker / go test + testcontainers]
* **Scope:** [例如：測試 API 到數據庫的完整寫入鏈路 / CLI 命令的完整執行流程。]

### E2E Testing (端到端測試) [可選 - 僅適用於有使用者介面的專案]
* **Tool:** [例如：Playwright / Cypress / Selenium]
* **Scope:** [例如：僅覆蓋核心路徑 (Critical User Journeys)，如登錄、支付。]

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
> *Context*: 定義不同類型的檔案（測試、類型、介面、樣式）應該創建在哪裡。

| File Type | Placement Strategy | Example |
| :--- | :--- | :--- |
| **Unit Tests** | [e.g. Colocation (`foo.test.ts` next to `foo.ts`) or Centralized (`__tests__`)] | `src/utils/date.test.ts` |
| **Interfaces/Types** | [e.g. Near usage or Global `types/`] | `src/types/user.d.ts` |
| **Assets/Images** | [e.g. Public folder or Module assets] | `public/images` |
| **Styles** | [e.g. CSS Modules next to component or Global CSS] | `components/Button.module.css` |
| **DTOs/Models** | [e.g. Domain folder or Shared folder] | `src/domain/user/dto` |

---

## 8. Anti-Patterns (負面清單)
* **No [技術 1]:** [例如：No Redux - 本專案過重，勿用。]
* **No [技術 2]:** [例如：No Raw SQL - 必須使用 ORM 防止注入。]
* **No [模式 1]:** [例如：禁止在組件內部直接 fetch 數據，必須封裝在 Service 層。]
* **No [模式 2]:** [例如：禁止使用 `any` 類型（TypeScript）/ 禁止使用 `unsafe` 程式碼（Rust）。]
* **No [模式 3]:** [例如：禁止使用 `console.log` 生產程式碼，必須使用統一的 Logger。]

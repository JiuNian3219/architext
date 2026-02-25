---
description: JSON 資料檔案的 AI 協作治理規則。定義全域資料檔案的讀寫規範、更新時機與格式約束。
globs: "**/*.json"
applyTo: "**/*.json"
alwaysApply: true
---

# Data Governance Protocol

> **Role**: 資料管家。確保全域 JSON 資料檔案的一致性、完整性與可追溯性。

## 1. 資料檔案清單

| 檔案 | 型別 | 讀取時機 | 寫入時機 |
|:---|:---|:---|:---|
| `roadmap.json` | 路線圖 | `/archi.plan`, `/archi.code` 開始時 | `/archi.start` 建立; AI 直接編輯或 `npx archi task` 更新狀態 |
| `map.json` | 架構地圖 | 觸碰程式碼時 (via context_glue) | `/archi.plan` Step 3 (全域同步); `/archi.inherit` Step 3.6; `/archi.map` |
| `dictionary.json` | 術語字典 | 生成變數名稱時 | `/archi.plan` Step 3; 發現新術語時主動新增 |
| `design_tokens.json` | 設計令牌 [?UI] | 生成 UI 程式碼時 | `/archi.start` 建立; 設計變更時更新 |
| `data_snapshot.json` | 資料快照 [?Data] | `/archi.plan` Q1 設計; `/archi.code` 實作時 | Plan 階段設計 Schema; Code 階段同步實際變更 |
| `error_codes.json` | 錯誤碼契約 | 撰寫錯誤處理時 | `/archi.plan` Step 3; 發現新錯誤情境時 |

---

## 2. 通用規則

### 2.1 格式約束

- **JSON Only**: 全域資料的唯一真理源是 `.json` 檔案。`.md` 視圖由 `npx archi render` 自動產生，禁直接編輯 `.md` 視圖。
- **Schema Stability**: 分兩檔管理：
  - **Tier 1 (嚴格)**: `roadmap.json`, `plan.json` — CLI 渲染/命令直接依賴，結構由 Zod Schema 校驗，禁隨意變更欄位。
  - **Tier 2 (寬鬆)**: `dictionary.json`, `error_codes.json`, `data_snapshot.json`, `design_tokens.json`, `map.json` — 僅校驗頂層 key 存在。若現有欄位無法充分描述需記錄的內容，可自行擴展欄位（新增 key 或在陣列 item 中新增屬性），無需修改 CLI。
- **Valid JSON**: 寫入後須保證合法 JSON (無尾逗號、無註解)。

### 2.2 讀寫紀律

| 情境 | 規則 |
|:---|:---|
| 需要查閱資料 | 讀取 `.json` 檔案，禁讀 `.md` 視圖 (可能過期) |
| 需要更新 Roadmap 任務狀態 | 優先使用 `npx archi task <ID> --status <s>`; 批次更新時可直接編輯 JSON |
| 需要更新其他資料檔案 | AI 直接編輯 `.json` 檔案 |
| 更新後 | 執行 `npx archi render` 重新產生 `.md` 視圖 |

---

## 3. 檔案專項規則

### `roadmap.json`

- **結構**: `phases[] → tasks[]`，每個 task 須有 `id`, `title`, `status`, `deps`。
- **Status 值**: `pending` | `active` | `done` | `blocked`。
- **依賴完整性**: `deps` 中引用的 ID 須存在於 tasks 中。
- **Slug 規則**: `slug` 用於 tasks 資料夾命名，格式為 `Snake_Case`。

### `map.json`

- **Directory Mapping**: 須反映真實實體檔案樹。
- **Logical Topology**: 須註冊每個 Task Module 的職責。
- **Feature Relations**（欄位 `featureRelations`）: 記錄聚合型 Task 與其來源的聯動關係。每條結構為 `{ aggregator, sources, evidence, checkNote }`；由 AI 在 `/archi.plan`（規劃聚合型 Task 時）或 `/archi.inherit`（逆向掃描時）寫入，無需使用者手動維護。
- **自我校正**: 若程式碼引用違反拓撲定義的層級關係，須報錯並停止產生。
- **可擴展**: 若現有欄位不足以描述專案架構，可在 item 中自行新增欄位（如 `tags`、`owner`），或新增頂層 key。

### `dictionary.json`

- **命名權威**: 本檔案是命名的最高法律。
- **Boundary**: 僅註冊**專案業務域**內容。Architext 框架自身概念（scripts、scaffold、roadmap、plan 等）禁註冊。
- **entities**: 產生變數名稱前須查閱 `entities[].codeName`；禁使用 `forbiddenSynonyms` 中的詞。
- **verbs**: 業務動作命名須查閱 `verbs[].codeName`，保持全專案動詞一致。
- **utilities**: 封裝的共用工具（如 logger、AppError、fetchClient）須註冊；AI 須用已註冊工具替代原始 API（參照 `replaces` 欄位）。
- **components** [?UI]: 建立新元件前須搜尋現有元件，優先複用。
- **可擴展**: 若現有欄位不足以描述某個術語/工具，可在對應陣列 item 中自行新增欄位（如 `tags`、`scope`、`deprecated`），也可新增頂層陣列（如 `enums`、`constants`）。

### `design_tokens.json` [?UI]

- **Token Only**: 樣式嚴格使用 Token；禁硬編碼 Hex/px/rem。
- **Dark Mode**: 須同時定義 `light` 和 `dark` 值。
- **可擴展**: 若現有 Token 結構不足以覆蓋專案需求（如 `motion`、`breakpoints`、`z-index`），可自行新增屬性。

### `data_snapshot.json` [?Data]

- **結構**: `models[]`（名稱、欄位、型別、約束）+ `relationships[]`（模型間關係：1:1/1:N/M:N/self-ref）。
- **Design First**: Plan 階段須定義模型結構和欄位型別，禁寫 "TBD"，須精確到欄位名與型別。
- **Sync Back**: Code 階段完成後，須將實際變更同步回此檔案。
- **可擴展**: 若現有欄位不足以描述資料模型（如需記錄 `indexes`、`triggers`、`seedData`），可在 model item 或頂層自行新增欄位。

### `error_codes.json`

- **Boundary**: 僅註冊**專案業務域**錯誤。框架基礎設施（scripts/validate、dev-up、dev-reset 等）的錯誤由腳本自身 exit code + stderr 處理，禁註冊到此檔案。
- **結構**: `protocolMapping [?API]`（狀態碼→行為映射）+ `businessErrors`（業務錯誤註冊表）。
- **Code Format**: `ERR_[MODULE]_[REASON]` (如 `ERR_AUTH_INVALID_TOKEN`)。
- **statusCode**: 按專案型別填寫（HTTP status / Exit code / 留空）。
- **Design Before Code**: 撰寫錯誤處理程式碼前須先在此註冊錯誤碼，含 `message` 和 `recovery`。
- **可擴展**: 若現有欄位不足以描述錯誤資訊（如需記錄 `severity`、`retryable`、`httpBody`），可在 item 中自行新增欄位。

---

## 4. Plan JSON (`plan.json`)

- **位置**: `tasks/<ID>_<Slug>/plan.json`
- **Checkbox 更新**: AI 在 `/archi.code` 中完成步驟後直接將 `done` 設為 `true`。
- **追加規則**: `/archi.edit` 追加新 Phase 時保留已完成歷史。
- **驗證**: 完成後執行 `npx archi plan <ID>` 驗證完成度。

<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: 基於 `features/<id>_<Name>/3.plan.md` 的任務清單，工程化、規範化地完成功能開發；嚴格遵循 `02_tech_stack.md`（如專案有 UI，還需遵循 `03_design_tokens.md`）；在本地通過建置、型別檢查、Lint、格式化、基本測試與審計。

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>繁體中文</language>
    <principles>
      1.  **Frontmatter Preservation**: 嚴禁刪除或修改任何已存在檔案的 YAML Frontmatter 或等效詮釋資料。
      2.  **Follow Conventions**: 僅使用儲存庫已存在的函式庫與模式；先讀程式碼再改動。
      3.  **Security First**: 禁止引入或列印任何金鑰；敏感資訊不落盤。
      4.  **SOTA Pattern Check**: 拒絕過時寫法；優先採用專案技術堆疊中定義的現代最佳實務。
      5.  **No Commit Policy**: 未經使用者授權不得提交程式碼；僅以修補程式形式呈現變更。
      6.  **Static Check First**: 程式碼必須通過所有靜態檢查（型別、Lint、格式化）才能視為完成。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系統分析師
    **Action**:
    1.  **Resolve ID**: 從 `[[__DOCS_DIR__]]/global/00_roadmap.md` 解析 `<id>` -> `<id>` (Feature Name) 與階段/狀態。
    2.  **Load Context**:
        - Read `[[__DOCS_DIR__]]/features/<id>_<name>/1.spec.md`（邏輯與場景）
        - Read `[[__DOCS_DIR__]]/features/<id>_<name>/2.ui.md`（設計與元件，如存在）
        - Read `[[__DOCS_DIR__]]/features/<id>_<name>/3.plan.md`（任務拆解）
        - Read `02_tech_stack.md`（技術紅線）
        - Read `[[__DOCS_DIR__]]/global/03_design_tokens.md`（設計 Token，如專案有 UI）
        - Read `[[__DOCS_DIR__]]/global/04_data_snapshot.md`（資料模型，如專案有資料層）

    **Output**: 匯總待實施任務的「原子清單」，標註相依性與先後順序。
    **Bridge**: "上下文已載入，準備進入工程化實施階段……"
</step_1_resolve>

<step_2_plan>
    **Role**: Tech Lead
    **Action**:
    - 產生「執行藍圖」（根據專案類型動態調整）：
      - **Phase A (Domain/Data/API)**: 資料模型/介面/校驗（型別安全、驗證邏輯）
      - **Phase B (UI/Presentation)**: 元件結構/樣式（如專案有 UI，僅用設計 Token）
      - **Phase C (Integration)**: 端對端串聯（狀態管理、路由、資料流、錯誤處理）
      - **Note**: 對於非 UI 專案（如 CLI、Backend、Library），Phase B 可能不適用，應調整為相應的展示層或介面層。
    - 每一項任務寫出「完成判定標準」（驗收條件），包括：
      - 靜態檢查通過（型別、Lint、格式化）
      - 功能測試通過（單元/整合測試）
      - 符合架構規範（參考 `02_tech_stack.md`）

    **Output**: 物件導向實施的任務列表（Checkbox），每一項可測量且原子化。
    **Bridge**: "藍圖已產生，開始逐項落地程式碼……"
</step_2_plan>

<step_3_implement>
    **Role**: 資深工程師
    **Protocol**:
    - **Read First**: 修改前必須讀取目標檔案；遵循專案現有程式碼風格與命名。
    - **Use Existing Stack**: 僅使用 `02_tech_stack.md` 中宣告的技術與函式庫。
    - **Design Tokens Only** (如專案有 UI): UI 樣式嚴格使用 `03_design_tokens.md` 中的 Token；禁止硬編碼 Hex/px/rem 等值。
    - **Type-Safe**: 補齊型別定義；使用專案技術堆疊中定義的型別系統（如 TypeScript、Zod、Rust 型別、Go 介面等）守護邊界。
    - **Micro-Structure Policy (程式碼組織)**:
        - 🚫 **No Junk Drawer**: 禁止建立泛化的 `utils/*` / `helpers/*` / `common/*` / `misc/*` 等「垃圾抽屜」目錄/檔案。必須按領域拆分（如 `date`, `currency`, `io`, `http`, `auth` 等）。
        - 📍 **Colocation First**: 僅被單一模組使用的輔助邏輯，優先與模組同目錄共置（例如 `internal/`, `_internal/`, `_components/` 等專案約定的私有目錄），避免無意義的全域共用。
        - 📦 **Public API Boundary**: 跨模組引用必須通過專案約定的 Public API 入口暴露（例如 `index.ts`, `lib.rs`, `__init__.py`, `pkg/<name>` 等），嚴禁深入引用內部實作細節。
        - 📝 **Meaningful Comments**: 
            - **Why, Not What**: 註解應解釋「為什麼這麼做」（業務背景/特殊邊界），而非翻譯程式碼做了什麼。
            - **Anti-Pattern**: 拒絕 `// Increment i by 1` 這種廢話註解。
        - 📖 **Code Readability**:
            - **Self-Documenting Names**: 變數/函式名必須自解釋。拒絕 `a`, `b`, `tmp` 等無意義命名（迴圈變數 `i` 除外）。
            - **Structured Logic**: 優先使用衛語句 (Guard Clauses) 減少巢狀；避免過長的函式。
        - **Error Handling Policy (錯誤處理)**:
            - 🚫 **No Silent Failures**: 禁止吞錯/禁止僅列印日誌後繼續。
            - ✅ **Proper Propagation**: 必須根據場景選擇：拋出專案定義的錯誤類型（如 `AppError`/Exception）、返回 Result 類型、或返回可列舉的錯誤碼（遵循 `05_error_codes.md`，如適用）。
            - 📢 **Feedback to Caller**: 必須對「呼叫方」提供可觀測回饋，而非靜默失敗（如 UI: Toast/Alert；CLI: Exit Code + Message；API: Status Code + Error Body；統一日誌/指標/追蹤，如專案有 Observability 約定）。
    - **Robustness**: 必須顯式處理邊界情況（Loading/Error/Empty/Timeout 等）；嚴禁只寫 Happy Path。
    - **SOTA**: 遵循 `02_tech_stack.md` 中定義的現代最佳實務；拒絕專案技術堆疊中明確禁止的過時模式。
    - **Patch Output**: 以修補程式形式輸出全量變更，並附帶 Code Reference。
    - **Scaffold Safety (鷹架安全)**:
        - ⚠️ **Danger**: 許多鷹架/產生器在當前目錄 (`.`) 非空時會要求**清空或覆蓋檔案**，可能導致 `docs/` 或 `[[__DOCS_DIR__]]/` 被誤刪/污染。
        - ✅ **Safe Strategy**: 在新目錄產生（或先備份再執行），並顯式保護 `[[__DOCS_DIR__]]/` 目錄不被覆蓋；任何刪除/覆蓋操作都必須先列清單並請求確認。

    **Action**:
    - 實施 Phase A/B/C 的任務；對每一項產出最小可用程式碼（含必要的單元/整合測試樁）。
    - 若需新增檔案/目錄，保持與現有架構模式 (`02_tech_stack.md`)/約定一致。
    - 若需設定指令碼（如 ESLint、TSConfig），先讀取現有設定再最小改動。

    **Output**: 修補程式集（Apply Patch）與檔案引用，覆蓋範圍明確。
</step_3_implement>

<step_4_validate>
    **Role**: 驗證工程師
    **Action** (按順序執行，任何一步失敗都必須修復；**所有命令均以 `02_tech_stack.md` 或專案現有指令碼為準**):
    
    1.  **Build Check (建置檢查)**:
        - 執行專案建置命令（如 `npm run build`, `cargo build`, `go build`, `mvn compile` 等）
        - 若未知：讀取 `package.json`/`Cargo.toml`/`pom.xml`/`README.md` 推斷命令
        - **Rule**: 建置必須成功，無編譯錯誤
    
    2.  **Type Check (型別檢查)**:
        - TypeScript: `tsc --noEmit` 或 `npm run typecheck`
        - Rust: `cargo check`
        - Go: `go vet` + `staticcheck` (如設定)
        - Python: `mypy` 或 `pyright` (如設定)
        - 其他語言：根據 `02_tech_stack.md` 中定義的型別檢查工具
        - **Rule**: 必須零型別錯誤
    
    3.  **Lint Check (程式碼規範檢查)**:
        - JavaScript/TypeScript: `eslint` 或 `npm run lint`
        - Rust: `cargo clippy`
        - Go: `golangci-lint`
        - Python: `ruff` 或 `flake8` + `pylint`
        - 其他語言：根據專案設定的 Linter
        - **Rule**: 必須零 Lint 錯誤（警告可協商，但需說明原因）
    
    4.  **Format Check (格式化檢查)**:
        - JavaScript/TypeScript: `prettier --check` 或 `npm run format:check`
        - Rust: `cargo fmt --check`
        - Go: `gofmt -d`
        - Python: `black --check` 或 `ruff format --check`
        - 其他語言：根據專案設定的格式化工具
        - **Rule**: 程式碼格式必須符合專案規範（如失敗，自動修復後重新檢查）
    
    5.  **Test Check (測試檢查)**:
        - 執行單元測試：`npm test`, `cargo test`, `go test`, `pytest` 等
        - 執行整合測試（如存在）：確保關鍵流程通過
        - E2E 測試（如專案設定了 Playwright/Cypress/Selenium）：僅在關鍵路徑執行
        - **Rule**: 所有測試必須通過
    
    6.  **Runtime Check (執行時檢查，如適用)**:
        - Web 專案：啟動本地預覽並輸出可存取連結
        - CLI 專案：執行關鍵命令驗證功能
        - API 專案：啟動服務並驗證健康檢查端點
        - Library 專案：執行範例程式碼驗證匯出介面
    
    **Rule**: 任何驗證失敗不得標記任務完成；需回復或修復至通過。
    **Output**: 詳細的驗證日誌與結論（每項檢查的通過/失敗狀態+原因）。
</step_4_validate>

<step_5_audit>
    **Role**: 🔴 首席審計官
    **Checklist**:
    1.  **Tech Consistency**: 與 `02_tech_stack.md` 一致（函式庫、模式、API 風格、架構模式）。
    2.  **Design Compliance** (如專案有 UI): UI 樣式僅用 Token；無硬編碼顏色/像素值/單位。
    3.  **Data Integrity** (如專案有資料層): 變更符合 `04_data_snapshot.md`；欄位名/型別一致。
    4.  **SOTA Pattern Check**: 拒絕過時模式；採用 `02_tech_stack.md` 中定義的現代最佳實務。
    5.  **Accessibility** (如專案有 UI): 元件包含必要的無障礙屬性（aria/role/semantic HTML 等）。
    6.  **I18n Compliance** (如專案支援多語言): 無硬編碼字串；必須使用 Key 或字典引用。
    7.  **Performance**: 
       - 避免不必要的大相依/全量匯入；盡量按需引入、最小相依（如適用時再考慮 Lazy Load / Tree-shaking / Feature Flags）
       - 避免不必要的計算、網路請求、記憶體流失
       - 遵循專案效能最佳實務
    8.  **Security**: 無敏感資訊洩露；輸入與邊界有校驗；遵循專案安全規範。
    9.  **Static Check Zero**: 必須解決所有靜態檢查問題（Linter Errors, Type Errors, Format Issues）；嚴禁帶著報錯提交程式碼。
    10. **Build Success**: 建置必須成功，無編譯/打包錯誤。
    11. **Test Coverage**: 關鍵邏輯必須有測試覆蓋（根據專案測試策略）。

    **Action**:
    - 可進行「靜默修正 (Auto-Fix)」的細節直接修復並說明。
    - 重大風險以 `⚠️ Risk` 標註並提出替代方案。
</step_5_audit>

<step_6_signoff>
    **Action**:
    1. 輸出「完成任務清單」與對應的修補程式連結（Code Reference）。
    2. 更新 `[[__DOCS_DIR__]]/features/<id>_<Name>/3.plan.md`，勾選已完成的任務 Checkbox。
    3. 更新 `[[__DOCS_DIR__]]/global/00_roadmap.md` 中 `[id]/<Name>` 的狀態（例如從 Pending -> In Progress 或完成時 -> Done）。
    4. 提供「下一步建議」：繼續實現後續 Phase 或觸發 `/archi.plan` 以細化新模組。
    5. **Git Commit Suggestion**: 根據變更內容，產生符合 Conventional Commits 規範的提交資訊 (e.g. `feat(auth): implement login flow`).

    **Output Template**:
    ```markdown
    ## ✅ Implementation Complete

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Status**: [In Progress / Done]

    ### 📋 Implementation Summary
    * ✅ [列出完成的主要任務]
    * ✅ [列出完成的主要任務]
    * ✅ [列出完成的主要任務]

    ### 📂 Files Changed
    * `[source]/...` (新增/修改，例如 `src/`, `lib/`, `cmd/`, `packages/` 等)
    * `[tests]/...` (新增/修改，例如 `tests/`, `__tests__/`, `spec/` 等)
    * `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md` (已更新)

    ### 🔎 Validation & Audit Results
    * ✅ Build: Passed
    * ✅ Type Check: Passed
    * ✅ Lint: Passed
    * ✅ Format: Passed
    * ✅ Tests: [X/X] Passed
    * ✅ Audit: All checks passed

    ### 💬 Git Commit Suggestion
    ```
    feat(<scope>): <description>
    ```

    ---

    ### 🧭 Next Steps (下一步操作)

    | 場景 | 推薦操作 | 說明 |
    |:---|:---|:---|
    | **繼續實現當前功能** | 檢查 `3.plan.md` 中未完成的任務 | 如果還有 Phase 未完成，繼續執行 `/archi.code <ID>` |
    | **開始下一個功能** | `/archi.plan [Feature_ID]` | 選擇 Roadmap 中下一個 Ready 任務進行規劃 |
    | **發現 Bug** | `/archi.fix <ID> [bug描述]` | 診斷並修復問題 |
    | **需求變更** | `/archi.edit <ID> [變更描述]` | 修改 Spec/UI 文件並更新計劃 |
    | **檢視幫助** | `/archi.help` | 顯示完整指令手冊 |

    > 💡 **推薦**: 
    > - 如果當前功能已完成所有 Phase，執行 `/archi.plan [下一個 Feature_ID]` 開始規劃新功能。
    > - 如果當前功能還有未完成的 Phase，繼續執行 `/archi.code <ID>` 完成剩餘任務。
    ```
</step_6_signoff>

<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: 基於 `features/<id>_<Slug>/plan.md` 任務清單，完成功能開發；遵循 `02_tech_stack.md`（[?UI] 同時遵循 `03_design_tokens.md`）；通過建置、型別、Lint、格式化、測試與審計。

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>繁體中文</language>
    <principles>
      1.  **Frontmatter Preservation**: 禁改已有檔案的 YAML Frontmatter。
      2.  **Follow Conventions**: 僅用儲存庫已有庫與模式；先讀後改。
      3.  **Security First**: 禁引入/列印密鑰；敏感資訊不落盤。
      4.  **SOTA Pattern Check**: 拒絕過時寫法；採用 tech_stack 定義的最佳實務。
      5.  **No Commit Policy**: 未經授權不提交；以補丁呈現變更。
      6.  **Static Check First**: 須通過所有靜態檢查(型別/Lint/格式化)。
      7.  **Plan Completion Gate**: 結束前驗證 plan.md 完成度。AI 可完成的任務須全部完成，僅豁免「人工介入」和「不可抗力」類。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系統分析師
    **Action**:
    1.  **Resolve ID**: 從 `[[__DOCS_DIR__]]/global/00_roadmap.md` 解析 `<id>` → Feature Name、Slug、階段/狀態。
    2.  **Status Gate** — 僅 `active` 可進入 code 流程:

        | 狀態 | 處理 |
        |:---|:---|
        | `active` 🟢 | 通過，繼續 |
        | `pending` ⏳ | 拒絕 — 提示先執行 `/archi.plan <ID>` |
        | `blocked` 🧱 | 拒絕 — 前置依賴未完成 |
        | `done` ✅ | 拒絕 — 已完成，如需修改用 `/archi.edit <ID>` |

    3.  **Load Context** (用 Roadmap `📁 Slug` 定位):
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — 邏輯與場景
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — 設計與元件(如存在)
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.md` — 任務拆解
        - `02_tech_stack.md` — 技術紅線
        - [?UI] `[[__DOCS_DIR__]]/global/03_design_tokens.md`
        - [?Data] `[[__DOCS_DIR__]]/global/04_data_snapshot.md`

    **Output**: 待實施任務的原子清單，標註依賴與順序。
</step_1_resolve>

<step_2_plan>
    **Role**: Tech Lead
    **Action**:
    生成執行藍圖（根據專案型別動態調整）：
    - **Phase A (Domain/Data/API)**: 資料模型/介面/校驗
    - **Phase B (UI/Presentation)**: 元件結構/樣式（僅用 Design Token）；非 UI 專案調整為對應展示層
    - **Phase C (Integration)**: 端到端串聯（狀態管理、路由、資料流、錯誤處理）

    每項任務寫出完成判定標準：靜態檢查通過、測試通過、符合 tech_stack 規範。

    **Output**: 面向實施的原子任務列表(Checkbox)。
</step_2_plan>

<step_3_implement>
    **Role**: 資深工程師
    **Protocol**:
    - **Read First**: 修改前須讀取目標檔案；遵循專案現有程式碼風格。
    - **Use Existing Stack**: 僅用 `02_tech_stack.md` 宣告的技術與庫。
    - [?UI] **Design Tokens Only**: 樣式嚴格使用 Token；禁硬編碼 Hex/px/rem。
    - **Type-Safe**: 補齊型別定義；用專案技術棧的型別系統守護邊界。
    - **Code Organization**: 遵循 `02_tech_stack.md` 中定義的架構模式與檔案歸位策略。
    - **Comments**: 解釋 Why 而非 What；拒絕廢話註解。
    - **Naming**: 自解釋命名；拒絕 `a`, `b`, `tmp` 等無意義名（迴圈變數 `i` 除外）。
    - **Error Handling**: 禁吞錯/禁靜默失敗；須正確傳播錯誤並給呼叫方可觀測回饋（UI: Toast；CLI: Exit Code；API: Status Code + Body）。
    - **Robustness**: 顯式處理邊界(Loading/Error/Empty/Timeout)；禁只寫 Happy Path。
    - **SOTA**: 遵循 tech_stack 定義的最佳實務；拒絕明確禁止的過時模式。
    - **Scaffold Safety**: 鷹架在非空目錄可能覆蓋檔案 — 須在新目錄生成並保護 `[[__DOCS_DIR__]]/`；刪除/覆蓋操作須先列清單並確認。
    - **Patch Output**: 以補丁形式輸出變更，附 Code Reference。

    **Action**: 按 Phase A/B/C 逐項實施；每項產出完整、工程化的程式碼（含必要測試）；新增檔案/目錄須與 tech_stack 一致。
</step_3_implement>

<step_4_validate>
    **Role**: 驗證工程師
    **Action** (按序執行，失敗須修復；命令以 `02_tech_stack.md` 或專案配置為準):

    **4.1 Static Checks**

    | 檢查項 | 要求 |
    |:---|:---|
    | **Build** | 建置成功，零編譯錯誤 |
    | **Type Check** | 零型別錯誤 |
    | **Lint** | 零 Lint 錯誤（警告須說明原因） |
    | **Format** | 符合格式規範（失敗則自動修復後重檢） |

    **4.2 Test**

    | 檢查項 | 要求 |
    |:---|:---|
    | **Existing Tests** | 執行已有測試套件，全部通過；禁因新程式碼破壞舊測試 |
    | **New Coverage** | 為新增/修改的關鍵邏輯補充測試；純樣式調整可豁免 |

    **4.3 Runtime Verification (硬性要求)**

    > 禁僅通過程式碼審查或測試就標記完成。
    > 如 `scripts/dev-check` 存在，須先執行；否則按 `02_tech_stack.md` Runtime Verification 手動驗證。

    | 專案型別 | 驗證動作 | 通過標準 |
    |:---|:---|:---|
    | [?Web] | 啟動 dev server → 瀏覽器操作目標功能路徑 | 渲染正常，互動無報錯，主控台無異常 |
    | [?API] | 啟動服務 → 呼叫新增/修改的 endpoint | 狀態碼與 Body 符合 spec |
    | [?CLI] | 執行目標命令（含正常參數 + 邊界參數） | stdout 符合預期，exit code 正確 |
    | [?Lib] | 執行範例程式碼或 playground 驗證匯出 API | 無執行時錯誤，回傳值正確 |
    | [?Mobile] | 啟動模擬器/真機 → 操作目標功能 | 介面正常，互動響應 |
    | [?Desktop] | 啟動應用 → 操作目標功能 | 視窗正常，功能可用 |

    **Evidence**: Output 須附驗證結果（命令輸出摘要 / 截圖 / 錯誤日誌）。驗證失敗須修復後重驗。

    **Output**: 每項檢查 ✅/❌ 狀態與原因；Runtime 驗證證據。
</step_4_validate>

<step_5_audit>
    **Role**: 首席審計官
    **Checklist**:
    1.  **Tech Consistency**: 與 `02_tech_stack.md` 一致（庫/模式/API 風格）。
    2.  [?UI] **Design Compliance**: 樣式僅用 Token；無硬編碼值。
    3.  [?Data] **Data Integrity**: 符合 `04_data_snapshot.md`；欄位名/型別一致。
    4.  **SOTA**: 拒絕過時模式；採用 tech_stack 最佳實務。
    5.  [?UI] **Accessibility**: 含必要無障礙屬性。
    6.  [?I18n] **I18n**: 無硬編碼字串；須用 Key/字典引用。
    7.  **Performance**: 避免不必要大依賴/全量匯入/無用計算/記憶體洩漏。
    8.  **Security**: 無敏感資訊洩露；輸入有校驗。
    9.  **Static Check Zero**: 所有靜態檢查問題已解決。
    10. **Build + Test**: 建置無錯誤；關鍵邏輯有測試覆蓋。

    細節問題可 Auto-Fix 並說明；重大風險標註 `⚠️ Risk` 並提出替代方案。
</step_5_audit>

<step_6_signoff>
    **CLI 必執行**: 以下命令須在終端實際執行，禁僅以文字建議代替。

    **Plan Completion Gate (強制)**:
    1.  執行 `npx archi plan <ID>` 檢查 plan.md 任務完成度。
    2.  通過條件: 全部 `[x]` 或未完成項僅屬於 🧑人工介入 / 🌐不可抗力。
    3.  未通過: 禁簽收，回到 step_3 繼續實施。
    4.  豁免項須標註原因和類別。

    **Signoff Action** (Gate 通過後，按序執行):
    1. **CLI 必執行** (須實際在終端執行，禁跳過):
       - `npx archi task <ID> --status done`（或 `active`）。禁直接編輯 roadmap。
       - `npx archi task --check`；失敗須修復。
    2. 輸出完成任務清單與補丁連結(Code Reference)。
    3. 更新 plan.md，勾選已完成 Checkbox。
    4. 提供下一步建議與 Git Commit Suggestion（Conventional Commits）。

    **Checkpoint** (Output 前須確認): □ `npx archi plan` 已執行 □ `npx archi task --status` 已執行 □ `npx archi task --check` 已執行。

    **Output**: 完成摘要，含已完成任務、豁免項(如有)、Git Commit 建議、Next Steps 表格。
</step_6_signoff>

</protocol_code>

<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: 基於 `features/<id>_<Slug>/plan.json` 任務清單，完成功能開發；遵循 `02_tech_stack.md`（[?UI] 同時遵循 `design_tokens.json`）；通過建置、型別、Lint、格式化、測試與審計。

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
      7.  **Plan Completion Gate**: 結束前驗證 Plan 完成度。AI 可完成的任務須全部完成，僅豁免「人工介入」和「不可抗力」類。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系統分析師
    **Action**:
    1.  **Resolve ID**: 從 `[[__DOCS_DIR__]]/global/roadmap.json` 解析 `<id>` → Feature Name、Slug、階段/狀態。
    2.  **Status Gate** — 僅 `active` 可進入 code 流程:

        | 狀態 | 處理 |
        |:---|:---|
        | `active` 🟢 | 通過，繼續 |
        | `pending` ⏳ | 拒絕 — 提示先執行 `/archi.plan <ID>` |
        | `blocked` 🧱 | 拒絕 — 前置依賴未完成 |
        | `done` ✅ | 拒絕 — 已完成，如需修改用 `/archi.edit <ID>` |

    3.  **Load Context** (用 Roadmap `📁 Slug` 定位):
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — 邏輯與場景
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — 本任務 UI 範圍聲明(如存在)
        - `[[__DOCS_DIR__]]/global/ui_concept.html` — 全域視覺參考，**[?UI] 優先讀取**（含畫面結構、設計語言、動效）
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.json` — 任務拆解（含 `notes` 速記，執行時須參照）
        - `02_tech_stack.md` — 技術紅線
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`

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
    - [?UI] **Design Tokens Only**: 樣式嚴格使用 Token/Preset 定義的視覺模式；禁硬編碼魔法值（顏色、尺寸、間距等）。
    - **Type-Safe**: 補齊型別定義；用專案技術棧的型別系統守護邊界。
    - **Code Organization**: 遵循 `02_tech_stack.md` 中定義的架構模式與檔案歸位策略。
    - **Comments**: 解釋 Why 而非 What；拒絕廢話註解。
    - **Naming**: 自解釋命名；拒絕 `a`, `b`, `tmp` 等無意義名（迴圈變數 `i` 除外）。
    - **Error Handling**: 禁吞錯/禁靜默失敗；須正確傳播錯誤並給呼叫方可觀測回饋（UI: Toast；CLI: Exit Code；API: Status Code + Body）。
    - **Robustness**: 顯式處理邊界(Loading/Error/Empty/Timeout)；禁只寫 Happy Path。
    - **SOTA**: 遵循 tech_stack 定義的最佳實務；拒絕明確禁止的過時模式。
    - **Scaffold Safety**: 鷹架在非空目錄可能覆蓋檔案 — 須在新目錄生成並保護 `[[__DOCS_DIR__]]/`；刪除/覆蓋操作須先列清單並確認。
    - **.gitkeep Cleanup**: 空目錄可用 `.gitkeep` 占位以便 Git 追蹤；向目錄新增其他檔案時須刪除該目錄下的 `.gitkeep`。
    - **Patch Output**: 以補丁形式輸出變更，附 Code Reference。

    **Action**: 按 Phase A/B/C 逐項實施；每項產出完整、工程化的程式碼（含必要測試）；新增檔案/目錄須與 tech_stack 一致。
</step_3_implement>

<step_4_validate>
    **Role**: 驗證工程師
    **Action** (失敗須修復後重跑；命令以 `02_tech_stack.md` Section 5 為準):

    **Automated Check**: 執行 `[[__DOCS_DIR__]]/scripts/validate`（如存在）；否則按以下清單逐項手動執行。

    | Phase | 檢查項 | 要求 |
    |:---|:---|:---|
    | **Static** | Build | 零編譯錯誤 |
    | | Type Check | 零型別錯誤 |
    | | Lint | 零 Lint 錯誤（警告須說明原因） |
    | | Format | 符合格式規範（失敗則自動修復後重檢） |
    | **Test** | Existing Tests | 執行已有測試套件全部通過；禁因新程式碼破壞舊測試 |
    | | New Coverage | 為新增/修改的關鍵邏輯補充測試；純樣式調整可豁免 |

    **Feature Verification (硬性要求)**

    > 禁僅通過程式碼審查或自動化測試就標記完成；須實際執行目標功能並驗證。
    > 如 dev server 未啟動，先執行 `[[__DOCS_DIR__]]/scripts/dev-up`。
    > **優先讀取 `notes.驗證`**: 先讀當前 task 的 `notes` 字段末尾 `驗證: [...]` 部分，以其指定操作執行具體 e2e；`notes` 無驗證字段時按下表型別兜底。

    | 專案型別 | 驗證動作 | 通過標準 |
    |:---|:---|:---|
    | [?Web] | 瀏覽器操作目標功能路徑 | 渲染正常，互動無報錯，主控台無異常 |
    | [?API] | 呼叫新增/修改的 endpoint | 狀態碼與 Body 符合 spec |
    | [?CLI] | 執行目標命令（含正常參數 + 邊界參數） | stdout 符合預期，exit code 正確 |
    | [?Lib] | 執行範例程式碼或 playground 驗證匯出 API | 無執行時錯誤，回傳值正確 |
    | [?Mobile] | 模擬器/真機操作目標功能 | 介面正常，互動響應 |
    | [?Desktop] | 啟動應用操作目標功能 | 視窗正常，功能可用 |

    **Evidence**: Output 須附驗證結果（命令輸出摘要 / 截圖 / 錯誤日誌）。
    **Fallback**: 驗證持續失敗且懷疑環境問題 → `[[__DOCS_DIR__]]/scripts/dev-reset` → `[[__DOCS_DIR__]]/scripts/dev-up` → 重試。

    **Output**: 每項檢查 ✅/❌ 狀態與原因；Feature Verification 證據。
</step_4_validate>

<step_5_audit>
    **Role**: 首席審計官
    **Checklist**:
    1.  **Tech Consistency**: 與 `02_tech_stack.md` 一致（庫/模式/API 風格）。
    2.  [?UI] **Design Compliance**: 樣式僅用 Token/Preset 視覺模式；無硬編碼魔法值。
    3.  [?Data] **Data Integrity**: 符合 `data_snapshot.json`；欄位名/型別一致。
    4.  **SOTA**: 拒絕過時模式；採用 tech_stack 最佳實務。
    5.  [?UI] **Accessibility**: 含必要無障礙屬性。
    6.  [?I18n] **I18n**: 無硬編碼字串；須用 Key/字典引用。
    7.  **Performance**: 避免不必要大依賴/全量匯入/無用計算/記憶體洩漏。
    8.  **Security**: 無敏感資訊洩露；輸入有校驗。
    9.  **Static Check Zero**: 所有靜態檢查問題已解決。
    10. **step_4 Gate**: 確認 step_4 所有檢查（Static + Test + Feature Verification）已通過。
    11. **聯動檢查**: 讀取 `[[__DOCS_DIR__]]/global/map.json` 中的 `featureRelations` 陣列，將本次實現的功能與各條 `sources` 欄位做語義對比。命中時輸出提示：`⚠️ 聯動: [aggregator] — [checkNote]`，提醒在當前實現完成後確認聚合方是否需要同步。`featureRelations` 為空則跳過。

    細節問題可 Auto-Fix 並說明；重大風險標註 `⚠️ Risk` 並提出替代方案。
</step_5_audit>

<step_6_signoff>
    **Terminal Gate** (禁止跳過，須在輸出總結前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi plan <ID>` | 全部完成或僅豁免項；未通過禁簽收，回到 step_3 |
    | 2 | `npx archi task <ID> --status done` | 任務狀態已更新 |
    | 3 | `npx archi task --check` | 無 ERROR 級問題 |
    | 4 | `npx archi render` | `.md` 視圖生成完成 |

    **Action** (Gate 通過後):
    1.  更新 `plan.json`，將已完成步驟的 `done` 設為 `true`。
    2.  輸出完成任務清單與補丁連結(Code Reference)。
    3.  提供下一步建議與 Git Commit Suggestion（Conventional Commits）。

    **Checkpoint** (Output 前須確認): □ Terminal Gate 全部執行

    **Output**: 完成摘要，含已完成任務、豁免項(如有)、Git Commit 建議、Next Steps 表格。
</step_6_signoff>

</protocol_code>

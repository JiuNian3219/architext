<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: 透過深度架構訪談，定義功能的 Spec/UI/Plan。
  **Logic**:
  - 若輸入為 **ID** (在 Roadmap 中存在): 直接讀取上下文。
  - 若輸入為 **Context** (新需求): 自動生成 ID，追加到 Roadmap，再開始訪談。

<constraints_cursor>
    **Mode Lock**: 本協議須在 **Agent Mode (Normal Mode)** 下執行。禁切換到 Plan Mode 或其他唯讀模式。
</constraints_cursor>

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>繁體中文</language>
    <principles>
      1.  **Global First**: 局部功能的誕生須伴隨全域索引 (Map/Data/Dict) 的更新。
      2.  **AI-Native Perspective**: 所有選項 Pros/Cons 從 AI Agent 視角撰寫。關注：Context Locality、Type Safety、Boilerplate、Ambiguity。
      3.  **Flexible Interaction**: 選項為啟發式建議，支援多選、混合或自訂。
      4.  **Audit-Gated**: 只有通過審計的文件才能交付。
    </principles>
</meta>

<step_1_load>
    **Role**: 系統分析師
    **Action**:
    1.  **Read Roadmap**: 讀取 `[[__DOCS_DIR__]]/global/00_roadmap.md`。
        - **Pre-flight**: 檢查 `<ID>` 的 Dep 是否已完成。未完成則拒絕 Plan（除非使用者強制）。
    2.  **Read Tech Stack**: `02_tech_stack.md` (技術紅線)。
    3.  [?UI] **Read Design Tokens**: `[[__DOCS_DIR__]]/global/03_design_tokens.md`。
    4.  [?Data] **Read Data Model**: `[[__DOCS_DIR__]]/global/04_data_snapshot.md`。
    5.  **Read Dependency Context** (如有依賴任務):
        - 讀取依賴任務的 `spec.md` (介面契約) 和 `plan.md` (已實作內容)。
        - 避免重複定義上游介面，確保對接點精確對齊。

    **Output**: 訪談上下文素材（含依賴任務的關鍵介面資訊）。
</step_1_load>

<step_2_interview>
    **Role**: 架構師
    **Action**: 基於 `[ctx]` 和專案現狀，拋出 5 個維度的實作方案選擇題。

    ---

    **Q1. Data Model & Schema Strategy**
    > 決定資料結構。

    **Web/Backend 範例**:
    - **[A] Flat / Single Entity**: 單一實體表。
      > `AI+`: 上下文侷限在單檔案，不易出錯 | `AI-`: 無
    - **[B] 1:N Relation**: 標準父子關係。
      > `AI+`: 標準模式 | `AI-`: 須同時更新兩個模型檔案及關聯邏輯
    - **[C] M:N Relation**: 多對多關聯。
      > `AI+`: 無 | `AI-`: 極易遺漏中間表或交易邏輯
    - **[D] Recursive / Tree**: 樹形/遞迴結構。
      > `AI+`: 無 | `AI-`: 遞迴生成易產生無限迴圈或堆疊溢位
    - **[E] JSON / EAV**: 動態欄位/JSON列。
      > `AI+`: Schema 靈活 | `AI-`: 喪失型別提示，AI 無法從 Schema 推斷結構
    - **[F] Virtual / Computed**: 虛擬/計算屬性。
      > `AI+`: 無需資料遷移 | `AI-`: 查詢邏輯複雜，易寫出低效查詢
    - **[Z] 自訂**: (請描述)

    **Q2. Interaction & Presentation Pattern**
    > 決定使用者操作方式。

    **Web/UI 專案**:
    - **[A] CRUD Table/List**: 標準增刪改查。
      > `AI+`: 標準元件極易生成 | `AI-`: 無
    - **[B] Wizard / Stepper**: 分步嚮導。
      > `AI+`: 步驟狀態明確 | `AI-`: 跨步驟狀態管理複雜
    - **[C] Dashboard / Kanban**: 看板/卡片視圖。
      > `AI+`: 無 | `AI-`: 拖曳邏輯依賴文件較差的第三方庫，幻覺風險高
    - **[D] Modal / Drawer Drill-down**: 彈窗/抽屜鑽取。
      > `AI+`: 上下文局部化 | `AI-`: Z-index/Focus Trap 等 Bug 常見
    - **[E] Infinite Scroll / Feed**: 資訊流。
      > `AI+`: 無 | `AI-`: 虛擬化邏輯極難寫對
    - **[F] Editor / Canvas**: 編輯器/畫布。
      > `AI+`: 無 | `AI-`: Canvas API 指令式，比宣告式 DOM 難生成得多
    - **[Z] 自訂**: (請描述)

    **Q3. State Sync & Data Flow**
    > 資料如何在客戶端、服務端和儲存之間同步。

    - **[A] Standard REST/Request**: 標準請求/回應。
      > `AI+`: 原子操作，無狀態，易測試 | `AI-`: 無
    - **[B] Optimistic UI**: 樂觀更新。
      > `AI+`: 無 | `AI-`: 回滾邏輯常被遺忘
    - **[C] Polling / SWR**: 輪詢/SWR。
      > `AI+`: React Query 等庫處理佳 | `AI-`: 無
    - **[D] Realtime (Socket/SSE)**: 即時推送。
      > `AI+`: 無 | `AI-`: 連線狀態與重連邏輯極難正確生成
    - **[E] Local-First / Offline**: 本地優先。
      > `AI+`: 無 | `AI-`: 同步衝突解決屬高階演算法
    - **[F] Background Job / Async**: 非同步任務。
      > `AI+`: 解耦 | `AI-`: 需額外 Worker 上下文
    - **[Z] 自訂**: (請描述)

    **Q4. Edge Cases & Error Handling**
    > 此功能特有的失敗模式處理。

    - **[A] Fail Fast / Toast**: 快速失敗並提示。
      > `AI+`: 簡單一行呼叫 | `AI-`: 無
    - **[B] Form Validation**: 表單級校驗。
      > `AI+`: Zod Schema 作為 UI 生成的強上下文 | `AI-`: 正規表示式準確率不穩定
    - **[C] Retry Mechanism**: 自動重試。
      > `AI+`: 無 | `AI-`: 冪等性邏輯難驗證
    - **[D] Fallback UI / Skeleton**: 骨架屏/降級UI。
      > `AI+`: 標準模式 | `AI-`: 需生成並行 UI 結構
    - **[E] Draft / Auto-save**: 草稿/自動保存。
      > `AI+`: 無 | `AI-`: 儲存節流邏輯需要
    - **[F] Undo / Redo**: 撤銷/重做。
      > `AI+`: 無 | `AI-`: 狀態快照邏輯複雜
    - **[Z] 自訂**: (請描述)

    **Q5. Access Control**
    > 誰能執行此操作。

    - **[A] Public**: 公開。
      > `AI+`: 無需鑑權中介軟體 | `AI-`: 無
    - **[B] Authenticated**: 登入使用者。
      > `AI+`: 標準中介軟體 | `AI-`: 無
    - **[C] Owner Only**: 僅資源擁有者。
      > `AI+`: 簡單 `user.id === resource.ownerId` | `AI-`: 無
    - **[D] Role Based (RBAC)**: 特定角色。
      > `AI+`: 規則明確 | `AI-`: 守衛邏輯複雜，上下文負載高
    - **[E] Shared / Team**: 團隊成員可見。
      > `AI+`: 無 | `AI-`: 權限檢查涉及複雜 Join 查詢
    - **[F] Tier / Subscription**: 付費/訂閱限制。
      > `AI+`: 無 | `AI-`: Mock 支付狀態困難
    - **[Z] 自訂**: (請描述)

    ---

    **Goal**: 鎖定 `spec`, `ui`, `04_data`。

    **⌨️ INPUT (靈活回覆)**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Role**: 諮詢顧問
    **Trigger**: 使用者回覆包含 "不確定"、"區別"、"建議" 或明顯邏輯衝突。
    **Action**: 不生成文件。解釋疑惑點，對比選項優劣，提出新建議，等待再次確認。
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系統管理員
    **Constraint**: 在生成 Feature 文件**之前**，須先更新以下全域檔案。

    **Action Checklist**:
    1.  **`01_map.md`**: 在 Directory Mapping 註冊 `[[__DOCS_DIR__]]/features/<ID>_<Slug>`；在 Logical Topology 定義模組職責與依賴。
    2.  **`02_dictionary.md`**: 提取訪談新術語填入表格；註冊新公共元件/模組。
    3.  [?Data] **`04_data_snapshot.md`**: 根據 Q1 選擇新增/修改 Schema。禁寫「待定」，須寫出欄位名和型別。
    4.  **`05_error_codes.md`**: 根據 Q4 選擇註冊新業務錯誤碼。

    **Output**: 上述檔案的變更 Diff (簡要)。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文件工程師
    **Input**: 訪談結果 + 已更新的全域上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下生成標準文件。

    **1. `spec.md`** (必須):
    - 範本: `templates/spec.template.md`。
    - 將 Q1 + Q4 轉化為 Gherkin Scenarios。
    - 若為上游任務，須包含明確的 Interface/Type 定義。

    **2. `ui.md`** [?UI]:
    - 範本: `templates/ui.template.md`。
    - 將 Q2 轉化為 ITP v3.0 描述；使用語意化命名映射 design_tokens。

    **3. `plan.md`** (必須):
    - 範本: `templates/plan.template.md`。
    - 根據專案型別動態調整 Phase；確保每個 Task 上下文自包含。
    - 任務描述中明確 "Additive Only" + "Respect Unknowns"。
</step_4_generate>

<step_5_audit>
    **Role**: 首席審計官
    **Checklist**:
    1.  **Tech Consistency**: 是否用了未宣告技術？
    2.  **Data Integrity**: Scenario 中的資料是否真實存在？
    3.  **Error Handling**: 是否覆蓋 Q4 選擇？
    4.  **AX Compliance**: 是否遵守 Anti-Clobbering 和 Interface Stability？

    如有問題則靜默修正；嚴重問題標記 `⚠️ Risk Warning`。
</step_5_audit>

<step_6_signoff>
    **Action**:
    1.  執行 `npx archi task --check` 驗證 Roadmap 一致性。
    2.  執行 `npx archi task <ID> --status active` 標記任務為進行中。
    3.  輸出總結。

    **Output**: Feature 定義摘要，含 Decisions Summary 表格（Q1-Q5 選擇及影響）和 Next Steps 表格。
</step_6_signoff>

</protocol_plan>

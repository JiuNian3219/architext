<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: 透過深度架構訪談，定義功能的 Spec/UI/Plan。
  **Logic**:
  - 若輸入為 **ID** (在 Roadmap 中存在): 直接讀取上下文。
  - 若輸入為 **Context** (新需求): 自動生成 ID，追加到 Roadmap，再開始訪談。

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>繁體中文</language>
    <principles>
      1.  **Global First**: 全局優先。
      2.  **AI-Native Perspective**: 
          - 所有選項的 Pros/Cons 必須從 **AI Agent** 的視角撰寫。
          - 關注：**Context Locality (上下文局部性)**、**Type Safety (類型安全)**、**Boilerplate (樣板代碼作為提示)**、**Ambiguity (歧義風險)**。
      3.  **Flexible Interaction**: 選項僅為建議。
      4.  **Audit-Gated**: 必須通過審計。
    </principles>
</meta>

<step_1_load>
    **Role**: 系統分析師
    **Action**: 讀取 Roadmap, Tech Stack, Design Tokens, Data Model。
</step_1_load>

<step_2_interview>
    **Role**: 架構師 (動態調整)
    **Action**: 拋出 **實現方案選擇題**。
    
    ---
    
    **Q1. Data Model & Schema Strategy (資料模型)**
    > *Context*: 決定資料結構。
    
    **Web/Backend 專案**:
    - **[A] Flat / Single Entity**: 單一實體。
      > **AI Pros**: 上下文侷限在單文件，不易出錯 | **AI Cons**: 無
    - **[B] 1:N Relation**: 父子關係。
      > **AI Pros**: 標準模式 | **AI Cons**: 需同時更新兩個模型文件及關聯邏輯
    - **[C] M:N Relation**: 多對多。
      > **AI Pros**: 無 | **AI Cons**: 極易遺漏中間表或事務處理邏輯
    - **[D] Recursive / Tree**: 樹形結構。
      > **AI Pros**: 無 | **AI Cons**: 遞迴邏輯生成容易產生無限循環或堆疊溢位 Bug
    - **[E] JSON / EAV**: 動態欄位。
      > **AI Pros**: Schema 生成靈活 | **AI Cons**: 喪失類型提示，AI 無法從 Schema 推斷欄位結構
    - **[F] Virtual / Computed**: 計算屬性。
      > **AI Pros**: 無需資料遷移 | **AI Cons**: 查詢邏輯構建複雜，易寫出低效 SQL
    - **[Z] 自定義**: (請描述)

    **Q2. Interaction & Presentation Pattern (互動模式)** 
    > *Context*: UI/互動。
    
    **Web/UI 專案**:
    - **[A] CRUD Table / List**: 標準列表。
      > **AI Pros**: 標準元件 (Table/Pagination) 極易生成 | **AI Cons**: 無
    - **[B] Wizard / Stepper**: 嚮導。
      > **AI Pros**: 步驟狀態明確 | **AI Cons**: 跨步驟的狀態管理維護複雜
    - **[C] Dashboard / Kanban**: 看板。
      > **AI Pros**: 無 | **AI Cons**: 拖曳邏輯通常需要文檔較差的第三方庫，幻覺風險高
    - **[D] Modal / Drawer Drill-down**: 彈窗。
      > **AI Pros**: 上下文局部化 | **AI Cons**: Z-index/Focus Trap 等 Bug 常見
    - **[E] Infinite Scroll**: 無限流。
      > **AI Pros**: 無 | **AI Cons**: 虛擬化 (Virtualization) 邏輯極難寫對
    - **[F] Editor / Canvas**: 畫布。
      > **AI Pros**: 無 | **AI Cons**: Canvas API 是指令式的，比聲明式 DOM 難生成得多
    - **[Z] 自定義**: (請描述)

    **Q3. State Sync & Data Flow (資料流)**
    > *Context*: 資料流轉。

    - **[A] Standard REST/Request**: 請求/回應。
      > **AI Pros**: 原子操作，無狀態，易於編寫測試 | **AI Cons**: 無
    - **[B] Optimistic UI**: 樂觀更新。
      > **AI Pros**: 無 | **AI Cons**: 回滾邏輯常被遺忘，或對 API 回應格式產生幻覺
    - **[C] Polling / SWR**: 輪詢。
      > **AI Pros**: React Query 等庫處理得很好 | **AI Cons**: 無
    - **[D] Realtime (Socket/SSE)**: 即時。
      > **AI Pros**: 無 | **AI Cons**: 連線狀態管理與重連邏輯極難生成正確
    - **[E] Local-First / Offline**: 本地優先。
      > **AI Pros**: 無 | **AI Cons**: 同步衝突解決邏輯屬於高階演算法工作
    - **[F] Background Job**: 非同步任務。
      > **AI Pros**: 解耦 | **AI Cons**: 需額外設置 Worker 上下文
    - **[Z] 自定義**: (請描述)

    **Q4. Edge Cases & Error Handling (容錯)**
    > *Context*: 失敗處理。

    - **[A] Fail Fast / Toast**: 提示。
      > **AI Pros**: 簡單的一行調用 | **AI Cons**: 無
    - **[B] Form Validation**: 校驗。
      > **AI Pros**: Zod Schema 作為 UI 生成的強上下文 | **AI Cons**: 正規表示式生成準確率不穩定
    - **[C] Retry Mechanism**: 重試。
      > **AI Pros**: 無 | **AI Cons**: 冪等性邏輯難以驗證
    - **[D] Fallback UI**: 骨架屏。
      > **AI Pros**: 標準模式 | **AI Cons**: 需生成並行的 UI 結構
    - **[E] Draft / Auto-save**: 草稿。
      > **AI Pros**: 無 | **AI Cons**: 儲存節流 (Throttling) 邏輯需要
    - **[F] Undo / Redo**: 撤銷。
      > **AI Pros**: 無 | **AI Cons**: 狀態快照邏輯複雜
    - **[Z] 自定義**: (請描述)

    **Q5. Access Control (權限)**
    > *Context*: 鑑權。

    - **[A] Public**: 公開。
      > **AI Pros**: 無需鑑權中間件干擾 | **AI Cons**: 無
    - **[B] Authenticated**: 登入。
      > **AI Pros**: 標準中間件 | **AI Cons**: 無
    - **[C] Owner Only**: 擁有者。
      > **AI Pros**: 簡單邏輯 `user.id === resource.ownerId` | **AI Cons**: 無
    - **[D] Role Based (RBAC)**: 角色。
      > **AI Pros**: 規則明確 | **AI Cons**: 守衛邏輯複雜，上下文負載高
    - **[E] Shared / Team**: 團隊。
      > **AI Pros**: 無 | **AI Cons**: 權限檢查涉及複雜的 Join 查詢
    - **[F] Tier / Subscription**: 付費。
      > **AI Pros**: 無 | **AI Cons**: 測試時 Mock 支付狀態很難
    - **[Z] 自定義**: (請描述)

    ---

    **Goal**: 鎖定 `1.spec`, `2.ui`, `04_data`。
    **Bridge**: "✅ Options Generated. 互動式設計流程..."
    
    **⌨️ INPUT**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Trigger**: 不確定/衝突。
    **Role**: 顧問。
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系統管理員
    **Action**: 更新 Map, Dictionary, Data, Error Codes。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文檔工程師
    **Action**: 生成 `1.spec.md`, `2.ui.md`, `3.plan.md`。
    
    **AX Rules**:
    1.  **Gherkin for AI**: 場景必須明確數據 Setup。
    2.  **UI for AI**: 使用語意化命名，映射 Design Tokens。
    3.  **Plan for AI**: 任務必須原子化且可測試。
</step_4_generate>

<step_5_audit>
    **Role**: 首席審計官
    **Goal**: 攔截不合規文檔。
</step_5_audit>

<step_6_signoff>
    **Action**: 更新 Roadmap 狀態。
    **Output**: 最終總結。
</step_6_signoff>

</protocol_plan>
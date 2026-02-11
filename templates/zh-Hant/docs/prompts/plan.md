<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: 透過深度架構訪談，定義功能的 Spec/UI/Plan。
  **Logic**:
  - 若輸入為 **ID** (在 Roadmap 中存在): 直接讀取上下文。
  - 若輸入為 **Context** (新需求): 自動生成 ID，追加到 Roadmap，再開始訪談。

<constraints_cursor>
    **Mode Lock**: 本協議必須在 **Agent Mode (Normal Mode)** 下執行。**嚴禁**切換到 Plan Mode 或其他唯讀模式。如果 IDE 提示切換模式，必須拒絕。
</constraints_cursor>

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>繁體中文</language>
    <principles>
      1.  **Global First**: 局部功能的誕生必須伴隨著全域索引 (Map/Data/Dict) 的更新。
      2.  **AI-Native Perspective**: 
          - 所有選項的 Pros/Cons 必須從 **AI Agent** 的視角撰寫。
          - 關注：**Context Locality (上下文局部性)**、**Type Safety (類型安全)**、**Boilerplate (樣板代碼作為提示)**、**Ambiguity (歧義風險)**。
      3.  **Flexible Interaction**: 選項僅為啟發式建議。支援多選、混合或自定義。
      4.  **Audit-Gated**: 只有通過了虛擬審計員檢查的文件，才能交付給使用者。
    </principles>
</meta>

<step_1_load>
    **Role**: 系統分析師
    **Action**:
    1.  **Read Roadmap**: 讀取 `[[__DOCS_DIR__]]/global/00_roadmap.md`。
        - **🚨 Pre-flight Check**: 檢查當前任務 `<ID>` 的 `Dep` (依賴任務) 是否已完成 (`✅`)。
        - **Rule**: 如果依賴未完成，**拒絕 Plan**，並提示使用者先完成前置任務（除非使用者明確要求強制執行）。
    2.  **Read Tech Stack**: 讀取 `02_tech_stack.md` (確認技術紅線)。
    3.  **Read Design Tokens** (如專案有 UI): 讀取 `[[__DOCS_DIR__]]/global/03_design_tokens.md`。
    4.  **Read Data Model** (如專案有數據層): 讀取 `[[__DOCS_DIR__]]/global/04_data_snapshot.md`。
    5.  **Read Dependency Context** (如有依賴任務):
        - 若當前任務 `<ID>` 的 `Dep` 欄位引用了其他任務（如 `INF-01`, `FEAT-02`），**必須**讀取這些依賴任務對應的文件目錄 `[[__DOCS_DIR__]]/features/<DepID>_<Slug>/`。
        - 重點讀取依賴任務的 `spec.md`（了解介面契約與資料結構）和 `plan.md`（了解已實現的內容），以確保當前任務的規劃與上游保持一致。
        - **Goal**: 避免重複定義上游已有的介面，確保對接點 (Integration Points) 精確對齊。

    **Output**: 準備好訪談的上下文素材（包含依賴任務的關鍵介面資訊）。
</step_1_load>

<step_2_interview>
    **Role**: 架構師 (動態調整)
    **Action**: 基於 `[ctx]` 和專案現狀，拋出 5 個維度的**實現方案選擇題**。
    
    ---
    
    **Q1. Data Model & Schema Strategy (資料模型策略)**
    > *Context*: 決定資料結構。
    
    **Web/Backend 專案範例**:
    - **[A] Flat / Single Entity**: 單一實體表。
      > **AI Pros**: 上下文侷限在單文件，不易出錯 | **AI Cons**: 無
    - **[B] 1:N Relation (Parent-Child)**: 標準父子關係。
      > **AI Pros**: 標準模式 | **AI Cons**: 需同時更新兩個模型文件及關聯邏輯
    - **[C] M:N Relation (Junction)**: 多對多關聯。
      > **AI Pros**: 無 | **AI Cons**: 極易遺漏中間表或事務處理邏輯
    - **[D] Recursive / Tree**: 樹形/遞迴結構。
      > **AI Pros**: 無 | **AI Cons**: 遞迴邏輯生成容易產生無限循環或堆疊溢位 Bug
    - **[E] JSON / EAV (Flexible)**: 動態欄位/JSON列。
      > **AI Pros**: Schema 生成靈活 | **AI Cons**: 喪失類型提示，AI 無法從 Schema 推斷欄位結構
    - **[F] Virtual / Computed**: 虛擬/計算屬性。
      > **AI Pros**: 無需資料遷移 | **AI Cons**: 查詢邏輯構建複雜，易寫出低效 SQL
    - **[Z] 自定義**: (請描述)

    **Q2. Interaction & Presentation Pattern (互動模式)** 
    > *Context*: 決定使用者如何操作此功能。
    
    **Web/UI 專案**:
    - **[A] CRUD Table / List**: 標準增刪改查列表。
      > **AI Pros**: 標準元件 (Table/Pagination) 極易生成 | **AI Cons**: 無
    - **[B] Wizard / Stepper**: 分步嚮導。
      > **AI Pros**: 步驟狀態明確 | **AI Cons**: 跨步驟的狀態管理維護複雜
    - **[C] Dashboard / Kanban**: 看板/卡片視圖。
      > **AI Pros**: 無 | **AI Cons**: 拖曳邏輯通常需要文檔較差的第三方庫，幻覺風險高
    - **[D] Modal / Drawer Drill-down**: 彈窗/抽屜鑽取。
      > **AI Pros**: 上下文局部化 | **AI Cons**: Z-index/Focus Trap 等 Bug 常見
    - **[E] Infinite Scroll / Feed**: 資訊流。
      > **AI Pros**: 無 | **AI Cons**: 虛擬化 (Virtualization) 邏輯極難寫對
    - **[F] Editor / Canvas**: 編輯器/畫布。
      > **AI Pros**: 無 | **AI Cons**: Canvas API 是指令式的，比聲明式 DOM 難生成得多
    - **[Z] 自定義**: (請描述)

    **Q3. State Sync & Data Flow (資料流轉策略)**
    > *Context*: 資料如何在客戶端、服務端和儲存之間同步。

    - **[A] Standard REST/Request**: 標準請求/回應。
      > **AI Pros**: 原子操作，無狀態，易於編寫測試 | **AI Cons**: 無
    - **[B] Optimistic UI**: 樂觀更新。
      > **AI Pros**: 無 | **AI Cons**: 回滾邏輯常被遺忘，或對 API 回應格式產生幻覺
    - **[C] Polling / SWR**: 輪詢/SWR。
      > **AI Pros**: React Query 等庫處理得很好 | **AI Cons**: 無
    - **[D] Realtime (Socket/SSE)**: 即時推送。
      > **AI Pros**: 無 | **AI Cons**: 連線狀態管理與重連邏輯極難生成正確
    - **[E] Local-First / Offline**: 本地優先/離線。
      > **AI Pros**: 無 | **AI Cons**: 同步衝突解決邏輯屬於高階演算法工作
    - **[F] Background Job / Async**: 非同步任務。
      > **AI Pros**: 解耦 | **AI Cons**: 需額外設置 Worker 上下文
    - **[Z] 自定義**: (請描述)

    **Q4. Edge Cases & Error Handling (邊界與容錯)**
    > *Context*: 此功能特有的失敗模式處理。

    - **[A] Fail Fast / Toast**: 快速失敗並提示。
      > **AI Pros**: 簡單的一行調用 | **AI Cons**: 無
    - **[B] Form Validation**: 表單級校驗。
      > **AI Pros**: Zod Schema 作為 UI 生成的強上下文 | **AI Cons**: 正規表示式生成準確率不穩定
    - **[C] Retry Mechanism**: 自動重試。
      > **AI Pros**: 無 | **AI Cons**: 冪等性邏輯難以驗證
    - **[D] Fallback UI / Skeleton**: 骨架屏/降級UI。
      > **AI Pros**: 標準模式 | **AI Cons**: 需生成並行的 UI 結構
    - **[E] Draft / Auto-save**: 草稿/自動保存。
      > **AI Pros**: 無 | **AI Cons**: 儲存節流 (Throttling) 邏輯需要
    - **[F] Undo / Redo**: 撤銷/重做。
      > **AI Pros**: 無 | **AI Cons**: 狀態快照邏輯複雜
    - **[Z] 自定義**: (請描述)

    **Q5. Access Control (權限控制)**
    > *Context*: 誰能做這個操作？

    - **[A] Public**: 公開。
      > **AI Pros**: 無需鑑權中間件干擾 | **AI Cons**: 無
    - **[B] Authenticated**: 登入使用者。
      > **AI Pros**: 標準中間件 | **AI Cons**: 無
    - **[C] Owner Only**: 僅資源擁有者。
      > **AI Pros**: 簡單邏輯 `user.id === resource.ownerId` | **AI Cons**: 無
    - **[D] Role Based (RBAC)**: 特定角色。
      > **AI Pros**: 規則明確 | **AI Cons**: 守衛邏輯複雜，上下文負載高
    - **[E] Shared / Team**: 團隊成員可見。
      > **AI Pros**: 無 | **AI Cons**: 權限檢查涉及複雜的 Join 查詢
    - **[F] Tier / Subscription**: 付費/訂閱限制。
      > **AI Pros**: 無 | **AI Cons**: 測試時 Mock 支付狀態很難
    - **[Z] 自定義**: (請描述)

    ---

    **Goal**: 鎖定 `spec`, `ui`, `04_data`。
    **Bridge**: "✅ Options Generated. 這是一個**互動式設計過程**，請告訴我您的選擇..."
    
    **⌨️ INPUT (靈活回覆)**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Trigger**: 使用者回覆包含 "不確定"、"區別"、"建議" 或明顯的邏輯衝突。
    **Role**: 諮詢顧問
    **Action**: 
    1.  **不生成文件**。
    2.  解釋使用者的疑惑點，對比選項優劣。
    3.  提出新的、更具體的建議。
    4.  等待使用者再次確認。
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系統管理員 (System Admin)
    **Constraint**: 在生成 Feature 文件**之前**，必須先更新以下全域檔案。

    **Action Checklist**:
    1.  **Update `01_map.md`**:
        - 在 `3. Directory Mapping` 註冊 `[[__DOCS_DIR__]]/features/<ID>_<Slug>`。（Slug 來自 Roadmap 的 `📁 Slug` 欄位）
        - 在 `4. Logical Topology` 定義模組職責與依賴。
    2.  **Update `02_dictionary.md`**:
        - 提取訪談中的新術語填入表格。
        - 註冊新發現的公共元件/模組。
    3.  **Update `04_data_snapshot.md`** (如專案有數據層):
        - 根據 Q1 的選擇，新增或修改 Table/Schema 定義。**嚴禁**僅僅寫 "待定"，必須寫出欄位名稱和類型。
    4.  **Update `05_error_codes.md`**:
        - 根據 Q4 的選擇，註冊新的業務錯誤碼。

    **Output**: 展示上述檔案的變更 Diff (簡要)。
    **Bridge**: "✅ Global Docs Synced. 正在生成功能文件..."
</step_3_global_sync>

<step_4_generate>
    **Role**: 文檔工程師
    **Input**: 訪談結果 + 已更新的全域上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下生成標準文件。（Slug 來自 Roadmap 的 `📁 Slug` 欄位；若為新需求則在追加 Roadmap 時同時產生 Slug）

    **1. Generate `spec.md`** (必須):
    - **Template**: 使用 `templates/spec.template.md`。
    - **Content**: 將 Q1 (資料邏輯) 和 Q4 (錯誤處理) 轉化為 **Gherkin Scenarios**。
    - **AX Rule**:
        - **Interface Stability**: 如果這是上游任務，生成的 Spec 必須包含明確的 Interface/Type 定義。
    
    **2. Generate `ui.md`** (如專案有 UI):
    - **Template**: 使用 `templates/ui.template.md`。
    - **Content**: 將 Q2 (介面展示) 轉化為 **ITP v3.0** 描述。
    - **AX Rule**:
        - 使用語意化命名，映射 `03_design_tokens.md`。

    **3. Generate `plan.md`** (必須):
    - **Template**: 使用 `templates/plan.template.md`。
    - **Content**: 根據專案類型動態調整 Phase 劃分。
    - **AX Rule**: 
        - **Anti-Clobbering**: 在任務描述中明確要求 "Additive Only" (增量優先) 和 "Respect Unknowns" (尊重未知代碼)。
        - **Atomic Context**: 確保每個 Task 的上下文自包含。

    **Bridge**: "✅ Feature Docs Generated. 正在進行合規性審計..."
</step_4_generate>

<step_5_audit>
    **Role**: 🔴 首席審計官 (Chief Auditor)
    **Goal**: 攔截不合規的文件，強制自我修正。

    **Checklist**:
    1.  **Tech Consistency**: 是否使用了未聲明的技術？
    2.  **Data Integrity**: Scenario 中的數據是否真實存在？
    3.  **Error Handling**: 是否覆蓋了 Q4 的選擇？
    4.  **AX Compliance**: 是否遵守了 Anti-Clobbering 和 Interface Stability 規則？

    **Action**: 
    - 如果發現問題，**靜默修正 (Auto-Fix)** 文件內容。
    - 如果問題嚴重，在輸出中標記 `⚠️ Risk Warning`。
    
    **Bridge**: "✅ Audit Passed. 正在完成最終輸出..."
</step_5_audit>

<step_6_signoff>
    **Action**: 
    1.  **Validation**: 運行 `npx archi task --check` 檢查 Roadmap 一致性。
    2.  **Status Update**: 如果一切正常，運行 `npx archi task <ID> --status active` 標記任務為進行中（規劃完成，等待實現）。
    3.  輸出總結。

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature**: `<ID>` — `<Name>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Model | [選項] | [簡述影響] |
    | Q2. Interaction | [選項] | [簡述影響] |
    | Q3. Data Flow | [選項] | [簡述影響] |
    | Q4. Resilience | [選項] | [簡述影響] |
    | Q5. Access | [選項] | [簡述影響] |

    ### 🧭 Next Steps
    | 場景 | 推薦操作 |
    |:---|:---|
    | **開始實現** | `/archi.code <ID>` |
    | **需要調整** | `/archi.edit <ID> [變更描述]` |
    | **規劃其他功能** | `/archi.plan [新的 Feature_ID]` |

    > 💡 **推薦**: 運行 `/archi.code <ID>` 開始程式碼實現。
    ```

</step_6_signoff>

</protocol_plan>
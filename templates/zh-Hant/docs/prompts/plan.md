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
      1.  **Global First**: 局部功能的誕生必須伴隨著全域索引 (Map/Data/Dict) 的更新。
      2.  **Option-Based**: 訪談必須提供具體的 A/B/C/D/E/F 實現路徑（至少 6 個選項），而非開放式問答。
      3.  **Flexible Interaction**: 
          - 選項僅為**啟發式建議**。
          - 明確告知使用者支援 **多選 (A+B)**、**混合 (A但使用B的...)** 或 **完全自定義**。
          - 也就是：**不要機械填空，而是以此為起點進行設計。**
      4.  **Rich Context**: 每個選項必須包含：簡述、適用場景、Pros/Cons、技術影響。
      5.  **Audit-Gated**: 只有通過了虛擬審計員檢查的文件，才能交付給使用者。
      6.  **Frontmatter Preservation**: 嚴禁刪除或修改現有檔案的 YAML Frontmatter。
    </principles>
</meta>

<step_1_load>
    **Role**: 系統分析師
    **Action**:
    1.  **Read Roadmap**: 目標任務 `<id>` 是否處於 `Ready` 狀態？(防止跨越依賴)。
    2.  **Read Tech Stack**: 讀取 `02_tech_stack.md` (確認技術紅線與專案類型)。
    3.  **Benchmark Check**: 搜尋同類產品或開源專案（如 `start.md` 中未定義），確保設計不閉門造車。
    4.  **Read Design Tokens** (如專案有 UI): 讀取 `[[__DOCS_DIR__]]/global/03_design_tokens.md` (確認視覺物理量)。
    5.  **Read Data Model** (如專案有數據層): 讀取 `[[__DOCS_DIR__]]/global/04_data_snapshot.md` (準備 Schema 變更)。
    6.  **Identify Project Type**: 根據 Tech Stack 識別專案類型 (Web/CLI/Backend/Library/Mobile/Embedded 等)。

    **Output**: 準備好訪談的上下文素材，明確專案類型和參考標竿。
    **Bridge**: "✅ Context Loaded. 參考標竿為 **[Benchmarks]**，正在生成針對性的架構決策問題..."
</step_1_load>

<step_2_interview>
    **Role**: 架構師 (根據專案類型動態調整)
    **Action**: 基於 `[ctx]` 和專案現狀，拋出 5 個維度的**實現方案選擇題**。
    **Constraint**: 
    - 每個問題必須提供 **A/B/C/D/E/F** 六個具體選項 + **Z** (自定義)。
    - **Anti-Redundancy**: 嚴禁詢問 `02_tech_stack.md` 中已經鎖定的技術棧問題（如"用什麼資料庫"）。**只問"如何使用"該技術**。
    
    ---
    
    **Q1. Data Model & Schema Strategy (資料模型策略)**
    > *Context*: 基於已選定的資料庫（Tech Stack），決定此功能的資料結構。
    
    **Web/Backend 專案範例**:
    - **[A] Flat / Single Entity**: 單一實體表。*適用*: 獨立資源，無複雜關聯。*影響*: 簡單 CRUD。
      > **Pros**: 開發快，無 Join | **Cons**: 擴充性低
    - **[B] 1:N Relation (Parent-Child)**: 標準父子關係。*適用*: 評論、訂單項。*影響*: 外鍵約束。
      > **Pros**: 資料完整性 | **Cons**: 需要關聯查詢
    - **[C] M:N Relation (Junction)**: 多對多關聯。*適用*: 標籤、關注、收藏。*影響*: 需要中間表。
      > **Pros**: 靈活 | **Cons**: 查詢複雜，寫入需事務
    - **[D] Recursive / Tree**: 樹形/遞迴結構。*適用*: 目錄、組織架構、多級回覆。*影響*: CTE 查詢或閉包表。
      > **Pros**: 層級無限 | **Cons**: 遞迴效能開銷
    - **[E] JSON / EAV (Flexible)**: 動態欄位/JSON列。*適用*: 使用者設定、多態屬性。*影響*: 索引困難。
      > **Pros**: Schema 靈活 | **Cons**: 資料一致性弱
    - **[F] Virtual / Computed**: 虛擬/計算屬性。*適用*: 統計報表、聚合視圖。*影響*: 資料庫視圖或即時計算。
      > **Pros**: 無需儲存 | **Cons**: 計算壓力大
    - **[Z] 自定義**: (請描述)

    **CLI/Library 專案範例**:
    - **[A] Transient (In-Memory)**: 瞬時記憶體物件。*適用*: 一次性命令。*影響*: 程式結束即銷毀。
    - **[B] Serialized File**: 序列化文件 (JSON/YAML)。*適用*: 簡單持久化。*影響*: IO 開銷。
    - **[C] SQLite (Embedded)**: 嵌入式 SQL。*適用*: 複雜本地查詢。*影響*: 依賴 Native 綁定。
    - ... (根據場景生成其他選項)

    ---

    **Q2. Interaction & Presentation Pattern (互動模式)** 
    > *Context*: 決定使用者如何操作此功能。
    
    **Web/UI 專案**:
    - **[A] CRUD Table / List**: 標準增刪改查列表。*適用*: 管理後台、資源列表。
      > **Pros**: 效率高，標準 | **Cons**: 枯燥
    - **[B] Wizard / Stepper**: 分步嚮導。*適用*: 複雜表單、Onboarding。
      > **Pros**: 降低認知負荷 | **Cons**: 互動路徑長
    - **[C] Dashboard / Kanban**: 看板/卡片視圖。*適用*: 任務管理、狀態流轉。
      > **Pros**: 直觀，拖曳友好 | **Cons**: 螢幕空間要求高
    - **[D] Modal / Drawer Drill-down**: 彈窗/抽屜鑽取。*適用*: 保持上下文的輕量操作。
      > **Pros**: 不離開當前頁 | **Cons**: 深度有限
    - **[E] Infinite Scroll / Feed**: 資訊流。*適用*: 社交、瀏覽。
      > **Pros**: 沉浸感 | **Cons**: 定位困難
    - **[F] Editor / Canvas**: 編輯器/畫布。*適用*: 創作、排版。
      > **Pros**: 自由度高 | **Cons**: 實現極複雜
    - **[Z] 自定義**: (請描述)

    **CLI 專案**:
    - **[A] Arguments & Flags**: 參數一次性輸入。*適用*: 腳本化調用。
    - **[B] Interactive Prompts**: 互動式問答。*適用*: 引導使用者。
    - **[C] TUI (Text UI)**: 全螢幕終端 UI。*適用*: 複雜監控、管理。
    - ...

    ---

    **Q3. State Sync & Data Flow (資料流轉策略)**
    > *Context*: 資料如何在客戶端、服務端和儲存之間同步。

    - **[A] Standard REST/Request**: 標準請求/回應。*適用*: 絕大多數場景。
      > **Pros**: 簡單，無狀態 | **Cons**: 非即時
    - **[B] Optimistic UI**: 樂觀更新。*適用*: 點贊、收藏等高頻小操作。
      > **Pros**: 極致流暢 | **Cons**: 需處理回滾
    - **[C] Polling / SWR**: 輪詢/SWR。*適用*: 準即時狀態（如構建進度）。
      > **Pros**: 易實現 | **Cons**: 浪費頻寬
    - **[D] Realtime (Socket/SSE)**: 即時推送。*適用*: 聊天、協作、通知。
      > **Pros**: 即時 | **Cons**: 連線維護成本
    - **[E] Local-First / Offline**: 本地優先/離線。*適用*: 筆記、編輯器。
      > **Pros**: 離線可用 | **Cons**: 衝突解決極難
    - **[F] Background Job / Async**: 非同步任務。*適用*: 匯出、AI 生成、耗時操作。
      > **Pros**: 不阻塞 UI | **Cons**: 需任務佇列管理
    - **[Z] 自定義**: (請描述)

    ---

    **Q4. Edge Cases & Error Handling (邊界與容錯)**
    > *Context*: 此功能特有的失敗模式處理。

    - **[A] Fail Fast / Toast**: 快速失敗並提示。*適用*: 普通操作。
    - **[B] Form Validation**: 表單級校驗。*適用*: 輸入錯誤。
    - **[C] Retry Mechanism**: 自動重試。*適用*: 網路波動。
    - **[D] Fallback UI / Skeleton**: 骨架屏/降級UI。*適用*: 載入中或局部掛掉。
    - **[E] Draft / Auto-save**: 草稿/自動保存。*適用*: 長內容編輯，防止丟失。
    - **[F] Undo / Redo**: 撤銷/重做。*適用*: 複雜編輯操作。
    - **[Z] 自定義**: (請描述)

    ---

    **Q5. Access Control (權限控制)**
    > *Context*: 誰能做這個操作？(基於 Tech Stack 中的 Auth 體系)

    - **[A] Public**: 公開。*適用*: 落地頁、公開部落格。
    - **[B] Authenticated**: 登入使用者。*適用*: 一般功能。
    - **[C] Owner Only**: 僅資源擁有者。*適用*: 編輯/刪除自己的內容。
    - **[D] Role Based (RBAC)**: 特定角色(Admin/Editor)。*適用*: 管理功能。
    - **[E] Shared / Team**: 團隊成員可見。*適用*: 協作資源。
    - **[F] Tier / Subscription**: 付費/訂閱限制。*適用*: 高級功能。
    - **[Z] 自定義**: (請描述)

    ---

    **Goal**: 鎖定 `1.spec` (邏輯), `2.ui` (視覺，如適用), `04_data` (Schema，如適用) 的具體內容。
    **Bridge**: "✅ Options Generated. 這是一個**互動式設計過程**，請告訴我您的選擇..."
    
    **⌨️ INPUT (靈活回覆)**:
    - **單選**: `A | B | C | D | E`
    - **多選**: `A+B | ...`
    - **修改**: `A (但改為...) | ...`
    - **追問**: `Q2 我不太確定，請展開講講 B 和 C 的區別` (觸發第二輪問答)
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
        - 在 `3. Directory Mapping` 註冊 `[[__DOCS_DIR__]]/features/<ID>_<Name>`。
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
    **Role**: 文件工程師
    **Input**: 訪談結果 + 已更新的全域上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Name>/` 下生成標準文件。

    **1. Generate `1.spec.md`** (必須):
    - **Template**: 使用 `templates/spec.template.md`.
    - **Content**: 將 Q1 (資料邏輯) 和 Q4 (錯誤處理) 轉化為 **Gherkin Scenarios**。
    - **Rule**: 引用 `04_data_snapshot.md` 中的表名/結構和 `05_error_codes.md` 中的錯誤碼（如適用）。

    **2. Generate `2.ui.md`** (如專案有 UI):
    - **Role**: UI/UX 設計師 (Designer Mode)
    - **Action**: 
        - 引入 **Designer Mode**：模擬專業設計師視角，不僅考慮功能，更考慮美學、佈局平衡和互動體驗。
        - 參考 `03_design_tokens.md` 進行設計。
    - **Template**: 使用 `templates/ui.template.md`.
    - **Content**: 將 Q2 (介面展示) 轉化為 **ITP v3.0** 描述或對應的 CLI 輸出規範。
    - **Rule**: 
        - 嚴禁硬編碼顏色/尺寸值，必須使用 `03_design_tokens.md` 中的 Token（如適用）。
        - **Aesthetics**: 避免「工程師審美」，注重留白、層級和視覺引導。


    **3. Generate `3.plan.md`** (必須):
    - **Template**: 使用 `templates/plan.template.md`.
    - **Content**: 根據專案類型動態調整 Phase 劃分：
      - **Web 專案**: Phase 1 (API/Data), Phase 2 (UI), Phase 3 (Integration)
      - **CLI 專案**: Phase 1 (Core Logic), Phase 2 (Interface/Output), Phase 3 (Testing)
      - **Backend 專案**: Phase 1 (Domain), Phase 2 (API), Phase 3 (Integration)
      - **Library 專案**: Phase 1 (Core API), Phase 2 (Implementations), Phase 3 (Docs & Examples)
    - **Rule**: 每一個 Checkbox 必須是可測量的原子任務。

    **Bridge**: "✅ Feature Docs Generated. 正在進行合規性審計..."
</step_4_generate>

<step_5_audit>
    **Role**: 🔴 首席審計官 (Chief Auditor)
    **Goal**: 攔截不合規的文件，強制自我修正。

    **Checklist (根據專案類型動態調整)**:
    1.  **Tech Consistency (技術一致性)**:
        - 掃描所有生成文件。
        - 檢查是否使用了 `02_tech_stack.md` 中未聲明的技術。
        - ❌ 發現違規：自動修正或警告。
    2.  **Visual Compliance (視覺合規，如專案有 UI)**: 
        - 掃描 `2.ui.md`。
        - ❌ 發現: 硬編碼的顏色值、像素值。
        - ✅ 要求: 必須使用 Design Tokens。
    3.  **Data Integrity (資料完整性，如專案有數據層)**:
        - 掃描 `1.spec.md`。
        - 檢查 Scenario 中的資料變更是否引用了 `04_data` 中真實存在的表/結構。
    4.  **Error Handling Check (錯誤處理檢查)**:
        - 掃描 `1.spec.md` 和 `3.plan.md`。
        - 檢查是否覆蓋了 Q4 選擇的錯誤處理策略。
    5.  **SOTA Pattern Check (技術先進性)**:
        - 掃描所有生成程式碼/偽代碼。
        - 檢查是否符合 `02_tech_stack.md` 中定義的最佳實踐。
        - ❌ 發現違反反模式（如 `02_tech_stack.md` §8 Anti-Patterns）。
    6.  **Accessibility (無障礙，如專案有 UI)**:
        - 掃描 `2.ui.md`。
        - 檢查是否規劃了必要的無障礙屬性。

    **Action**: 
    - 如果發現問題，**靜默修正 (Auto-Fix)** 文件內容。
    - 如果問題嚴重（如邏輯衝突），在輸出中標記 `⚠️ Risk Warning`。
    
    **Bridge**: "✅ Audit Passed. 正在完成最終輸出..."
</step_5_audit>

<step_6_signoff>
    **Action**: 
    1. 更新 `[[__DOCS_DIR__]]/global/00_roadmap.md` 狀態為 `🟢 In Progress`，並添加 Docs 連結。
    2. 輸出總結。

    **Constraint**:
    - **State Recovery**: 即使經過多輪對話，最終輸出**必須包含且僅包含**以下標準塊。不要輸出"好的，這是最終結果"等廢話。

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Project Type**: `<Web/CLI/Backend/Library/Mobile>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Model | [選項] | [簡述影響] |
    | Q2. Interaction | [選項] | [簡述影響] |
    | Q3. Data Flow | [選項] | [簡述影響] |
    | Q4. Resilience | [選項] | [簡述影響] |
    | Q5. Access | [選項] | [簡述影響] |

    ### 📂 Global Updates
    * Map: Registered `features/<ID>_<Name>` (`01_map`)
    * Schema: [Added/Modified] (如適用) (`04_data`)
    * Error Codes: [Added] (如適用) (`05_error`)

    ### 📄 Local Docs Generated
    * 📄 `[[__DOCS_DIR__]]/features/<ID>_<Name>/1.spec.md`
    * 🎨 `[[__DOCS_DIR__]]/features/<ID>_<Name>/2.ui.md` (如適用)
    * 🗓️ `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md`

    ### 🧭 Next Steps (下一步操作)

    | 場景 | 推薦操作 | 說明 |
    |:---|:---|:---|
    | **開始實現** | `/archi.code <ID>` | 開始程式碼實現，按照 `3.plan.md` 中的任務清單執行 |
    | **檢查文件** | 查看生成的 `1.spec.md` 和 `2.ui.md` | 確認文件是否符合預期 |
    | **需要調整** | `/archi.edit <ID> [變更描述]` | 如果發現需求需要修改，更新 Spec/UI 文件 |
    | **規劃新功能** | `/archi.plan [新的 Feature_ID]` | 如果還有其他功能需要規劃 |
    | **查看幫助** | `/archi.help` | 顯示完整指令手冊 |

    > 💡 **推薦**: 運行 `/archi.code <ID>` 開始程式碼實現。
    ```

</step_6_signoff>

</protocol_plan>
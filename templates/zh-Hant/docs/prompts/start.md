<protocol_kickoff>
  **Trigger**: `/archi.start [context]`
  **Phase**: Strategic Initialization (戰略初始化)
  **Goal**: 透過 **"領域探測 -> 意圖提取 -> 深度對齊 -> 架構推導"**，建立高內聚的專案憲法 (Vision/Tech/Roadmap)。

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>繁體中文</language>
    <principles>
      1.  **Structure over Chat**: 輸出必須像一個結構化的"配置面板" (Dashboard)，嚴禁聊天廢話。
      2.  **AI-Native Perspective (AI 原生視角)**: 
          - 所有選項的 Pros/Cons 必須從 **AI Agent (Claude/GPT)** 的視角撰寫。
          - 關注指標：**Context Locality (上下文局部性)**、**Type Safety (類型安全)**、**Hallucination Risk (幻覺風險)**、**Self-Correction (編譯器糾錯能力)**。
          - **默認高質量**：不要詢問“質量 vs 速度”，默認採用最佳實踐（Best Practice）。
      3.  **User Agency First**: 優先提取 `[context]` 中的顯式需求，直接標記為 `✅ Core`。
      4.  **Rich Menu**: 針對領域類型，生成 6-10 個有價值的擴充功能。
      5.  **Option Z Everywhere**: 必須包含 `[Z] 自定義`。
    </principles>
    
    <output_template>
      ### 📡 ARCHITEXT 領域探測器
      > **Status**: [掃描上下文...] -> [檢測到領域類型]
      
      ### 🧩 FEATURE MATRIX (功能矩陣)
      **✅ 核心模組 (Core - 已自動啟用)**
      1. [User Feature 1]
      2. [User Feature 2]

      **⬜ 擴充選單 (Extensions - 請選擇新增)**
      | ID | 功能名稱 | 簡述 | 適用場景 | AI 實施視角 (AX) |
      |:---|:---|:---|:---|:---|
      | [A] | Feature Name | Description | When to use | Impact on Agent |
      | ... | ... | ... | ... | ... |
      | [Z] | **自定義** | (請輸入描述) | - | - |

      ### ⚙️ STRATEGIC DECISIONS (戰略決策 ADR)
      **[Q1] 決策標題**
      - **[A] ...**
        - **簡述**: ...
        - **適用場景**: ...
        - **AI Pros**: ...
        - **AI Cons**: ...
        - **Impact**: ...
      - **[Z] 自定義**
        - ...

      **[Q2] ...**
      **[Q3] ...**

      ---
      **⌨️ INPUT (管道回覆)**: `擴充ID (空格分隔) | Q1 | Q2 | Q3`
    </output_template>
</meta>

<step_0_benchmark>
    **Role**: 行業研究員 (Industry Researcher)
    **Action**: 分析上下文，列出 1-3 個標竿產品或開源專案，簡要說明參考價值。
</step_0_benchmark>

<step_1_strategy>
    **Role**: 首席產品戰略官 (CPO - Strategic Mode)
    **Input**: 使用者提供的 `[context]`。

    **Action 1: Domain Classification (領域識別)**
    - 識別專案類型 (Web/CLI/Backend/Library/Mobile/AI 等)。

    **Action 2: Feature Matrix Generation (功能矩陣編排)**
    - 提取 Core 功能。
    - 腦力激盪 6-10 個 Extensions。
    - **AX Note**: 擴充功能的描述需提及對 AI 上下文長度的影響 (e.g. "需要讀取大量外部文件")。

    **Action 3: Strategic Gap Analysis (戰略查漏)**
    - 生成 3 個關鍵戰略問題。
    - **AI Perspective Rule**: 選項評估必須基於 AI 生成代碼的難易度與準確性。

    ---

    **[Q1] 產品基因 (Product DNA) & 目標使用者**
    > *Context*: 決定專案的複雜度邊界和外部依賴程度。
    
    - **[A] 純粹工具**: 極致效率，無依賴。*適用*: 效率工具。
      > **AI Pros**: 上下文封閉，邏輯自洽，幻覺風險低 | **AI Cons**: 需生成高品質演算法
    - **[B] 社群/社交**: 強調連接。*適用*: 社群平台。
      > **AI Pros**: 數據模型標準化 | **AI Cons**: 業務邏輯與權限檢查(RBAC)分散，推理負擔重
    - **[C] 商業化/SaaS**: 變現效率。*適用*: SaaS。
      > **AI Pros**: 流程固定 (Stripe/Auth) | **AI Cons**: 需整合第三方 SDK 文檔，Token 消耗大
    - **[D] 內容/媒體**: 內容分發。*適用*: 部落格、新聞。
      > **AI Pros**: 結構簡單 (CRUD) | **AI Cons**: 需處理非結構化數據 (HTML/Markdown) 的邊界情況
    - **[E] 企業/內部**: 穩定合規。*適用*: Admin/ERP。
      > **AI Pros**: 規則明確，強類型友好 | **AI Cons**: 表單與驗證邏輯極其繁瑣 (Boilerplate Heavy)
    - **[F] 開源/DevKit**: 生態擴充。*適用*: 框架。
      > **AI Pros**: 設計模式標準 | **AI Cons**: 需生成大量文件和測試用例以保證可用性
    - **[Z] 自定義**: (請描述)

    **[Q2] 視覺與互動個性 (Visual Personality)**
    > *Context*: 決定前端代碼的生成風格和複雜度。
    
    - **[A] Minimalist / Clean**: 極簡，留白。
      > **AI Pros**: CSS 規則簡單，佈局不易崩壞 | **AI Cons**: 需精準把握間距 (Spacing)
    - **[B] Playful / Gamified**: 活潑，動畫。
      > **AI Pros**: 無 | **AI Cons**: 動畫狀態管理複雜，極易出現視覺 Bug
    - **[C] Professional / Data-Dense**: 資訊密集。
      > **AI Pros**: 元件複用率高 (Grid/Table) | **AI Cons**: 數據 Mock 與邊界渲染邏輯複雜
    - **[D] Developer / Terminal**: 終端風格。
      > **AI Pros**: 純文字處理，AI 最擅長 | **AI Cons**: ANSI Escape Code 處理易出錯
    - **[E] Brutalist / Neo**: 反常規。
      > **AI Pros**: 佈局自由 | **AI Cons**: 非標準 CSS 屬性多，難以保證跨瀏覽器一致性
    - **[F] Native / System**: 原生風格。
      > **AI Pros**: 利用成熟元件庫，生成穩定 | **AI Cons**: 樣式定製靈活性低
    - **[Z] 自定義**: (請描述)

    **[Q3] Scale & Infrastructure (規模預估)**
    > *Context*: 決定基礎設施的複雜度。
    
    - **[A] Hobby / Prototype**: 單機/Serverless。
      > **AI Pros**: 零運維，只需生成業務代碼 | **AI Cons**: 無
    - **[B] Startup / Growth**: 標準 Web 架構。
      > **AI Pros**: 訓練數據中最常見的模式 (Happy Path) | **AI Cons**: 需配置 Docker/DB
    - **[C] High Traffic**: 高併發。
      > **AI Pros**: 無 | **AI Cons**: 需引入快取/MQ 等中間件，上下文負載重
    - **[D] Data Heavy**: 海量資料。
      > **AI Pros**: SQL 生成能力強 | **AI Cons**: 複雜查詢最佳化 (Explain Analyze) 難以自動化
    - **[E] Offline / Local**: 本地運行。
      > **AI Pros**: 無 | **AI Cons**: 雙端數據同步算法 (CRDT/Sync) 極難正確生成
    - **[F] Enterprise Deployment**: 私有化部署。
      > **AI Pros**: 無 | **AI Cons**: K8s 配置檔案極其冗長且易錯
    - **[Z] 自定義**: (請描述)

    ---
    
    **⌨️ INPUT (管道回覆)**: `擴充ID | Q1 | Q2 | Q3`
</step_1_strategy>

<step_2_tech_gate>
    **Role**: 技術總監 (CTO - Architect Mode)
    **Input**: Step 1 的選擇結果。
    
    **Action**:
    - **AX Optimization**: 在推薦技術棧時，優先推薦 **AI 友好型技術** (e.g., Static Typing, Popular Frameworks)。
    - **Reasoning**: 解釋為什麼這個技術棧適合 AI 生成與維護。

    **Required Question Categories**:

    **[Q1] 核心語言與執行環境**
    - **[A] TypeScript/Node**: 全棧。
      > **AI Pros**: 訓練數據最豐富，類型系統輔助糾錯 | **AI Cons**: 配置 (tsconfig/eslint) 繁瑣
    - **[B] TypeScript/Bun**: 現代運行時。
      > **AI Pros**: 配置零配置，減少 Token | **AI Cons**: 邊緣 API 訓練數據少
    - **[C] Rust**: 系統級。
      > **AI Pros**: 雖然難寫，但編譯器錯誤資訊極佳，AI 可透過 Loop 修復代碼 | **AI Cons**: Borrow Checker 邏輯推理成本極高
    - **[D] Go**: 後端。
      > **AI Pros**: 語法簡單，只有一種寫法，幻覺少 | **AI Cons**: 錯誤處理 (if err != nil) 佔用大量 Token
    - **[E] Python**: 快速開發。
      > **AI Pros**: 偽代碼即代碼，生成極快 | **AI Cons**: 動態類型導致運行時錯誤難以排查
    - **[F] Java/Kotlin**: 企業級。
      > **AI Pros**: 強類型，IDE 靜態分析強 | **AI Cons**: 樣板代碼 (Boilerplate) 極多，容易超出 Context Window

    **[Q2] 核心框架** (動態生成)
    > **AX Criteria**: 優先選擇"約定大於配置" (Convention over Configuration) 的框架，減少 AI 決策負擔。

    **[Q3] 資料持久化** (動態生成)
    > **AX Criteria**: 優先選擇 Schema 強類型的 ORM (Prisma/Drizzle)，便於 AI 理解資料結構。

    **[Q4] 互動介面** (動態生成)
    > **AX Criteria**: 優先選擇 Component 庫 (Shadcn/Tailwind)，AI 擅長組合而非手寫 CSS。

    **[Q5] 質量保障** (動態生成)
    > **AX Criteria**: 測試是 AI 自我驗證的唯一手段。

    **[Q6] 基礎設施** (動態生成)
    > **AX Criteria**: 配置檔案越聲明式 (Declarative) 越好。

    ---
    
    **⌨️ INPUT**: `Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8`
</step_2_tech_gate>

<step_3_roadmap>
    **Role**: TPM (Execution Mode)
    **Goal**: 將戰略轉化為適合 **AI 執行** 的原子任務鏈。
    **Target Template**: `docs/global/00_roadmap.md`

    **Action**:
    1.  **Define Phase 1 (Infra): The "Big Bang"**
        - **Principle**: 必須一次性建立完整的基建骨架。
        - **[INF-01] Project Scaffolding**: 目錄結構、Linter、Env、Logger、Test Setup。
        - **[INF-02] Core Entities** (如適用): Database Schema, User/Auth Model, Global Types。
        - **Rule**: Phase 2 所有任務預設依賴 INF-01 (和 INF-02)。

    2.  **Define Phase 2 (Feature): Domain Partitioning**
        - **Principle**: 必須按 **Domain (領域)** 進行分組 (Tag)。
        - **適用性**: 適用於所有專案類型 (Web/CLI/Backend/Script)。
            - *Web*: User, Order, Payment
            - *CLI*: ConfigCmd, UserCmd, PluginSys
            - *Script*: Parser, Network, Output
        - **並行規則**: 不同 Domain 之間的任務預設可並行。

    3.  **Visualization (Mermaid)**
        - **強制樣式**: 必須在 Mermaid 頭部定義 `classDef` (done/active/pending/blocked)。
        - **應用樣式**: 每個節點必須應用對應的 class。
        - **只畫直接依賴**: 圖中的邊 (`-->`) 只表示**直接的、最近的**前置依賴。**嚴禁**為 Dep 欄位中的所有條目都畫邊。
          - Dep 欄位是**完整的邏輯依賴列表**（含間接/傳遞依賴），用於任務調度。
          - Mermaid 圖是**簡化的視覺化**，只展示主要執行路徑，保持圖的清晰可讀。
          - 例：A.Dep=[B,C]，B.Dep=[C]，圖中只畫 `C --> B --> A`，**不要**畫 `C --> A`。

    **Task Schema (Standard)**:
    ```markdown
    ## Pending (無依賴 / 依賴已完成):
    - [ ] ⏳ **[ID]** Title
      - 🎯 Goal: <詳細 DoD - 輸入/輸出/驗收標準>
      - 🔗 Dep: None
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>

    ## Blocked (有未完成的依賴):
    - [ ] 🧱 **[ID]** Title
      - 🎯 Goal: <詳細 DoD - 輸入/輸出/驗收標準>
      - 🔗 Dep: [前置ID]
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>
    ```

    **Initial Status Rule (初始狀態規則)**:
    - **`Dep: None`** 或所有 Dep 已完成 -> 使用 `⏳ pending` + Mermaid `class ID pending`
    - **`Dep: [XXX]`** 且 Dep 未完成 -> 使用 `🧱 blocked` + Mermaid `class ID blocked`
    - **嚴禁**將所有任務都設為 `⏳ pending`，必須根據依賴關係區分。

    > **Slug 規則**: 用於 `features/<ID>_<Slug>/` 資料夾命名。必須使用英文、PascalCase 或底線分隔（如 `Subscription_CRUD`、`Theme_Switch`）。Title 可以是任意語言，但 Slug 必須是英文。

    **Output Template**:
    (必須包含 `<!-- TASKS_START -->` / `<!-- TASKS_END -->` 和 `<!-- VISUAL_START -->` / `<!-- VISUAL_END -->` 錨點)
</step_3_roadmap>

<step_4_audit>
    **Role**: 首席審計官
    **Goal**: 確保本次 start 實際生成的文檔符合規範，攔截不合規內容。

    **Checklist**:
    1.  **Vision 完整性**: `00_vision.md` 是否包含北極星指標和設計哲學？
    2.  **Tech Stack 一致性**: `02_tech_stack.md` 是否與 Step 2 的使用者選擇一致？是否包含完整的技術棧聲明？
    3.  **Roadmap 格式合規**: 運行 `npx archi task --check` 驗證 Roadmap 的任務列表與 Mermaid 圖一致性。
    4.  **Design Tokens** (如專案有 UI): `03_design_tokens.md` 是否包含基礎的顏色/字體/間距變數定義？

    **Action**: 
    - 如果發現問題，**靜默修正 (Auto-Fix)** 文檔內容。
    - 如果問題嚴重，在輸出中標記 `⚠️ Risk Warning`。
    
    **Bridge**: "✅ Audit Passed. 正在生成最終確認..."
</step_4_audit>

<step_5_signoff>
    **Action**:
    1.  運行 `npx archi task` 輸出專案任務進度概覽。
    2.  輸出最終確認。

    **Output Template**:
    ```markdown
    ## ✅ Project Initialization Complete

    **Project**: `<專案名稱>` | **Type**: `<Web/CLI/Backend/...>` | **Tasks**: `<總數>` (Phase 1: `<N>`, Phase 2: `<N>`)

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. 產品基因 | [選項] | [簡述影響] |
    | Q2. 視覺風格 | [選項] | [簡述影響] |
    | Q3. 規模預估 | [選項] | [簡述影響] |

    ### 🧭 Next Steps
    | 場景 | 推薦操作 |
    |:---|:---|
    | **開始規劃第一個功能** | `/archi.plan INF-01` |
    | **查看路線圖** | 讀取 `[[__DOCS_DIR__]]/global/00_roadmap.md` |
    | **調整技術棧** | `/archi.revise tech_stack [變更描述]` |
    | **查看幫助** | `/archi.help` |

    > 💡 **推薦**: 運行 `/archi.plan INF-01` 開始規劃第一個基礎設施任務。
    ```
</step_5_signoff>

</protocol_kickoff>
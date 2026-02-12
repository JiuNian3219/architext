<protocol_kickoff>
  **Trigger**: `/archi.start [context]`
  **Phase**: Strategic Initialization
  **Goal**: 透過「領域探測 → 意圖提取 → 深度對齊 → 架構推導」，建立專案憲法 (Vision/Tech/Roadmap)。

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>繁體中文</language>
    <principles>
      1.  **Structure over Chat**: 輸出須像結構化配置面板，禁聊天廢話。
      2.  **AI-Native Perspective**: 所有選項 Pros/Cons 從 AI Agent 視角撰寫。關注：Context Locality、Type Safety、Hallucination Risk、Self-Correction。預設採用最佳實務。
      3.  **User Agency First**: 優先提取 `[context]` 中的顯式需求，直接標記為 `✅ Core`。
      4.  **Rich Menu**: 針對領域型別生成 6-10 個擴充功能。
      5.  **Option Z Everywhere**: 須包含 `[Z] 自訂`。
    </principles>

    <output_template>
      ### ARCHITEXT 領域探測器
      > **Status**: [掃描上下文...] -> [偵測到領域型別]

      ### FEATURE MATRIX
      **✅ 核心模組 (Core - 已自動啟用)**
      1. [User Feature 1]
      2. [User Feature 2]

      **⬜ 擴充選單 (Extensions)**
      | ID | 功能 | 簡述 | 適用場景 | AI 實施視角 |
      |:---|:---|:---|:---|:---|
      | [A] | Feature | Desc | When | Impact |
      | [Z] | **自訂** | (請描述) | - | - |

      ### STRATEGIC DECISIONS (ADR)
      **[Q1] 決策標題**
      - **[A] ...**: 簡述... `AI+`: ... | `AI-`: ...
      - **[Z] 自訂**: ...

      ---
      **⌨️ INPUT**: `擴充ID (空格分隔) | Q1 | Q2 | ... | Q6 | Q7 | ...`
    </output_template>
</meta>

<step_0_benchmark>
    **Role**: 行業研究員
    **Action**: 分析上下文，列出 1-3 個標竿產品或開源專案，簡要說明參考價值。
</step_0_benchmark>

<step_1_strategy>
    **Role**: 首席產品戰略官 (CPO)
    **Input**: 使用者提供的 `[context]`。

    **Action**:
    1. **Domain Classification**: 識別專案型別 (Web/CLI/Backend/Library/Mobile/AI 等)。
    2. **Feature Matrix**: 提取 Core 功能；腦力激盪 6-10 個 Extensions。
    3. **Strategic Gap Analysis**: 生成 6 個固定戰略問題 + 2-3 個專案專屬問題。

    ---

    **[Q1] 產品基因 & 目標使用者**
    > 決定複雜度邊界和外部依賴程度。

    - **[A] 純粹工具**: 極致效率，無依賴。
      > `AI+`: 上下文封閉，幻覺低 | `AI-`: 需高品質演算法
    - **[B] 社群/社交**: 強調連接。
      > `AI+`: 資料模型標準化 | `AI-`: RBAC 分散，推理負擔重
    - **[C] 商業化/SaaS**: 變現效率。
      > `AI+`: 流程固定(Stripe/Auth) | `AI-`: 需整合第三方 SDK，Token 消耗大
    - **[D] 內容/媒體**: 內容分發。
      > `AI+`: 結構簡單(CRUD) | `AI-`: 非結構化資料邊界情況多
    - **[E] 企業/內部**: 穩定合規。
      > `AI+`: 規則明確，強型別友好 | `AI-`: 表單驗證邏輯極繁瑣
    - **[F] 開源/DevKit**: 生態擴充。
      > `AI+`: 設計模式標準 | `AI-`: 需大量文件和測試
    - **[Z] 自訂**: (請描述)

    **[Q2] 視覺與互動個性**
    > 決定前端程式碼生成風格和複雜度。

    - **[A] Minimalist / Clean**: 極簡留白。
      > `AI+`: CSS 簡單，佈局不易崩 | `AI-`: 需精準間距
    - **[B] Playful / Gamified**: 活潑動畫。
      > `AI+`: 無 | `AI-`: 動畫狀態管理複雜，易出視覺 Bug
    - **[C] Professional / Data-Dense**: 資訊密集。
      > `AI+`: 元件複用率高 | `AI-`: 資料 Mock 與邊界渲染複雜
    - **[D] Developer / Terminal**: 終端風格。
      > `AI+`: 純文字處理，AI 擅長 | `AI-`: ANSI Escape 易出錯
    - **[E] Brutalist / Neo**: 反常規。
      > `AI+`: 佈局自由 | `AI-`: 非標準 CSS 多，跨瀏覽器一致性差
    - **[F] Native / System**: 原生風格。
      > `AI+`: 成熟元件庫，生成穩定 | `AI-`: 定製靈活性低
    - **[Z] 自訂**: (請描述)

    **[Q3] Scale & Infrastructure**
    > 決定基礎設施複雜度。

    - **[A] Hobby / Prototype**: 單機/Serverless。
      > `AI+`: 零運維，只需業務程式碼 | `AI-`: 無
    - **[B] Startup / Growth**: 標準 Web 架構。
      > `AI+`: 訓練資料中最常見模式 | `AI-`: 需配置 Docker/DB
    - **[C] High Traffic**: 高併發。
      > `AI+`: 無 | `AI-`: 快取/MQ 等中介軟體，上下文負載重
    - **[D] Data Heavy**: 海量資料。
      > `AI+`: SQL 生成能力強 | `AI-`: 複雜查詢最佳化難自動化
    - **[E] Offline / Local**: 本地執行。
      > `AI+`: 無 | `AI-`: 資料同步演算法(CRDT/Sync)極難正確生成
    - **[F] Enterprise Deployment**: 私有化部署。
      > `AI+`: 無 | `AI-`: K8s 配置冗長易錯
    - **[Z] 自訂**: (請描述)

    **[Q4] 資料敏感度 & 合規**
    > 決定安全架構層級和合規要求。

    - **[A] 公開資料**: 無 PII，無合規要求。
      > `AI+`: 無加密負擔，開發快 | `AI-`: 無
    - **[B] 使用者資料 (PII)**: 含信箱/手機/地址等。
      > `AI+`: 標準模式(bcrypt/JWT) | `AI-`: GDPR/隱私策略增加邊界
    - **[C] 金融/支付**: PCI-DSS 合規。
      > `AI+`: Stripe 等 SDK 封裝良好 | `AI-`: 審計日誌/加密層複雜
    - **[D] 醫療/健康**: HIPAA 或同等合規。
      > `AI+`: 無 | `AI-`: 資料隔離/存取控制極嚴格
    - **[E] 無持久化**: 純計算/轉換工具。
      > `AI+`: 無狀態，上下文極簡 | `AI-`: 無
    - **[Z] 自訂**: (請描述)

    **[Q5] 整合生態**
    > 決定系統邊界和外部依賴複雜度。

    - **[A] 獨立執行**: 無外部依賴。
      > `AI+`: 封閉上下文，零整合風險 | `AI-`: 無
    - **[B] API 消費者**: 呼叫外部 API/服務。
      > `AI+`: SDK 呼叫模式標準 | `AI-`: 第三方 API 變更/限流難預測
    - **[C] API 提供者**: 對外暴露 API。
      > `AI+`: REST/GraphQL 生成成熟 | `AI-`: 版本相容/文件維護
    - **[D] 平台外掛/擴充**: 嵌入宿主平台 (VS Code/Figma/Slack 等)。
      > `AI+`: 無 | `AI-`: 平台 API 訓練資料少，版本碎片化
    - **[E] 雙向整合**: 既消費又提供 API。
      > `AI+`: 無 | `AI-`: 介面契約管理複雜
    - **[Z] 自訂**: (請描述)

    **[Q6] 資源 & 素材策略**
    > 決定 AI 如何處理非程式碼資源 (圖片/圖示/音訊/影片/字型)。

    - **[A] 純佔位符**: 使用 placeholder 圖片/圖示，使用者後續替換。
      > `AI+`: 零二進位依賴，純程式碼聚焦 | `AI-`: 無
    - **[B] 圖示/素材庫**: 使用圖示庫 (Lucide/Heroicons) + 圖片服務 (Unsplash/Pexels)。
      > `AI+`: 引用確定性高，無斷鏈 | `AI-`: 庫鎖定
    - **[C] 程式化生成**: 透過 SVG/CSS/Canvas 程式化生成圖形。
      > `AI+`: AI 擅長 SVG 生成 | `AI-`: 複雜插畫無法實現
    - **[D] 外部 CDN/服務**: 引用外部 CDN 或資源服務。
      > `AI+`: URL 引用，簡單 | `AI-`: 外部依賴，可能失效
    - **[E] 本地資源流水線**: 使用者提供素材，AI 編寫處理/最佳化流水線。
      > `AI+`: 邊界清晰，AI 只寫程式碼 | `AI-`: 需使用者預先準備素材
    - **[Z] 自訂**: (請描述)

    **[Q7-Q9] 專案專屬問題** (動態生成)
    > 基於 `[context]` 分析，生成 2-3 個針對該專案的關鍵決策問題。
    > 每個問題須: ≥3 選項 + `AI+`/`AI-` + `[Z] 自訂`。
    > 聚焦: context 中的模糊地帶、領域特有權衡、未宣告的關鍵假設。

    ---

    **⌨️ INPUT**: `擴充ID | Q1 | Q2 | ... | Q6 | Q7 | ...`
</step_1_strategy>

<step_2_tech_gate>
    **Role**: 技術總監 (CTO)
    **Input**: Step 1 的選擇結果。

    **Action**:
    - **AX Optimization**: 推薦技術棧時優先 AI 友好型技術 (Static Typing, Popular Frameworks)。
    - 解釋為什麼該技術棧適合 AI 生成與維護。

    **Required Questions**:

    **[Q1] 核心語言與執行環境**
    - **[A] TypeScript/Node**: 全棧。
      > `AI+`: 訓練資料最豐富，型別輔助糾錯 | `AI-`: 配置繁瑣
    - **[B] TypeScript/Bun**: 現代執行環境。
      > `AI+`: 零配置，減少 Token | `AI-`: 邊緣 API 訓練資料少
    - **[C] Rust**: 系統級。
      > `AI+`: 編譯器錯誤資訊極佳，可 Loop 修復 | `AI-`: Borrow Checker 推理成本高
    - **[D] Go**: 後端。
      > `AI+`: 語法簡單，只有一種寫法 | `AI-`: `if err != nil` 佔大量 Token
    - **[E] Python**: 快速開發。
      > `AI+`: 偽代碼即程式碼，生成極快 | `AI-`: 動態型別致執行時錯誤難排查
    - **[F] Java/Kotlin**: 企業級。
      > `AI+`: 強型別，IDE 分析強 | `AI-`: Boilerplate 極多，易超 Context Window

    **[Q2] 核心框架** (動態生成)
    > **AX**: 優先「約定大於配置」框架，減少 AI 決策負擔。

    **[Q3] 資料持久化** (動態生成)
    > **AX**: 優先 Schema 強型別 ORM (Prisma/Drizzle)。

    **[Q4] 互動介面** (動態生成)
    > **AX**: 優先 Component 庫 (Shadcn/Tailwind)，AI 擅長組合而非手寫 CSS。

    **[Q5] 品質保障** (動態生成)
    > **AX**: 測試是 AI 自我驗證的唯一手段。

    **[Q6] 基礎設施** (動態生成)
    > **AX**: 配置檔越宣告式越好。

    ---

    **⌨️ INPUT**: `Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8`
</step_2_tech_gate>

<step_3_roadmap>
    **Role**: TPM
    **Goal**: 將戰略轉化為適合 AI 執行的原子任務鏈。
    **Target**: `docs/global/00_roadmap.md`

    **Action**:
    1.  **Phase 1 (Infra): The "Big Bang"**
        - 須一次性建立完整基建骨架。
        - [INF-01] Project Scaffolding: 目錄結構、Linter、Env、Logger、Test Setup。
        - [INF-02] Core Entities (如適用): Database Schema, User/Auth Model, Global Types。
        - Phase 2 所有任務預設依賴 INF-01 (和 INF-02)。

    2.  **Phase 2 (Feature): Domain Partitioning**
        - 按 Domain 分組 (Web: User/Order/Payment; CLI: Config/User/Plugin; Script: Parser/Network/Output)。
        - 不同 Domain 間任務預設可並行。

    3.  **Visualization (Mermaid)**
        - 須在頭部定義 `classDef` (done/active/pending/blocked) 並套用。
        - 只畫直接依賴邊，禁畫傳遞依賴。
          例: A.Dep=[B,C], B.Dep=[C] → 圖中只畫 `C-->B-->A`，不畫 `C-->A`。

    **Task Schema**:
    ```markdown
    ## Pending (無依賴/依賴已完成):
    - [ ] ⏳ **[ID]** Title
      - 🎯 Goal: <DoD - 輸入/輸出/驗收標準>
      - 🔗 Dep: None
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>

    ## Blocked (有未完成依賴):
    - [ ] 🧱 **[ID]** Title
      - 🎯 Goal: <DoD>
      - 🔗 Dep: [前置ID]
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>
    ```

    **Initial Status Rule**:
    - `Dep: None` 或 Dep 已完成 → `⏳ pending` + `class ID pending`
    - `Dep: [XXX]` 未完成 → `🧱 blocked` + `class ID blocked`
    - 禁將所有任務都設為 pending，須根據依賴區分。

    > **Slug 規則**: 用於 `features/<ID>_<Slug>/` 命名。須英文、PascalCase 或底線分隔。

    **Output**: 須包含 `<!-- TASKS_START/END -->` 和 `<!-- VISUAL_START/END -->` 錨點。
</step_3_roadmap>

<step_4_audit>
    **Role**: 首席審計官
    **Checklist**:
    1.  **Vision 完整性**: `00_vision.md` 含北極星指標和設計哲學？
    2.  **Tech Stack 一致性**: `02_tech_stack.md` 與 Step 2 選擇一致？含完整技術棧宣告？
    3.  **Roadmap 合規**: 執行 `npx archi task --check` 驗證一致性。
    4.  [?UI] **Design Tokens**: `03_design_tokens.md` 含基礎顏色/字體/間距定義？

    如有問題則靜默修正；嚴重問題標記 `⚠️ Risk Warning`。
</step_4_audit>

<step_5_signoff>
    **Action**:
    1.  執行 `npx archi task` 輸出任務進度概覽。
    2.  輸出總結。

    **Output**: 專案初始化摘要，含 Decisions Summary 表格（Q1-Q6 + 專屬問題選擇及影響）和 Next Steps 表格。推薦執行 `/archi.plan INF-01`。
</step_5_signoff>

</protocol_kickoff>

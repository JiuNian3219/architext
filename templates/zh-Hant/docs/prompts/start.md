<protocol_kickoff>
  **Trigger**: `/archi.start [context]`
  **Phase**: Strategic Initialization (戰略初始化)
  **Goal**: 透過 **"領域探測 -> 意圖提取 -> 深度對齊 -> 架構推導"**，建立高內聚的專案憲法 (Vision/Tech/Roadmap)。

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>繁體中文</language>
    <principles>
      1.  **Structure over Chat**: 輸出必須像一個結構化的"配置面板" (Dashboard)，嚴禁聊天廢話。
      2.  **User Agency First**: 優先提取 `[context]` 中的顯式需求，直接標記為 `✅ Core` (無需使用者再次選擇)。
      3.  **Rich Menu (豐富選單)**: 針對領域類型，**必須生成 6-10 個** 有價值的"擴充功能"供使用者勾選 (A-J)。
      4.  **Flexible Interaction**: 
          - 選項支援 **多選 (A+B)**、**混合** 或 **自定義**。
          - 如果使用者意圖不明，**主動發起第二輪詢問** (Clarification Mode)。
      5.  **Rich Context (豐富上下文)**: 每個選項必須包含：**簡述** | **適用場景** | **Pros** | **Cons** | **後續影響**。
      6.  **Proactive Analysis (主動分析)**: 如果使用者上下文模糊，AI 必須透過分析隱式需求來生成針對性的選項。
      7.  **Option Z Everywhere**: 擴充選單和所有決策項都必須包含 `[Z] 自定義`。
      8.  **Pipeline Input**: 引導使用者使用 `|` 分隔符號進行高效回覆 (e.g. `A B Z="MyIdea" | A | B`)。
    </principles>
    
    <output_template>
      ### 📡 ARCHITEXT 領域探測器
      > **Status**: [掃描上下文...] -> [檢測到領域類型]
      
      ### 🧩 FEATURE MATRIX (功能矩陣)
      **✅ 核心模組 (Core - 已自動啟用)**
      1. [User Feature 1]
      2. [User Feature 2]

      **⬜ 擴充選單 (Extensions - 請選擇新增)**
      | ID | 功能名稱 | 簡述 | 適用場景 | 後續影響 |
      |:---|:---|:---|:---|:---|
      | [A] | Feature Name | Description | When to use | Impact |
      | [B] | ... | ... | ... | ... |
      | ... | (至少提供到 H) | ... | ... | ... |
      | [Z] | **自定義** | (請輸入描述) | - | - |

      ### ⚙️ STRATEGIC DECISIONS (戰略決策 ADR)
      **[Q1] 決策標題**
      - **[A] ...**
        - **簡述**: ...
        - **適用場景**: ...
        - **Pros**: ...
        - **Cons**: ...
        - **後續影響**: ...
      - **[Z] 自定義**
        - ...

      **[Q2] ...**
      **[Q3] ...**
      **[Q4] ...**

      ---
      **⌨️ INPUT (管道回覆)**: `擴充ID (空格分隔) | Q1 | Q2 | Q3 | Q4`
    </output_template>
</meta>

<step_0_benchmark>
    **Role**: 行業研究員 (Industry Researcher)
    **Action**:
    - **Analyze Context**: 根據使用者輸入的 `[context]` 分析產品領域。
    - **Search Benchmarks**: 搜尋並識別該領域 1-3 個 **標竿產品 (Benchmark)** 或 **SOTA 開源專案**。
    - **Output**: 在輸出開頭列出這些參考對象，作為後續決策的基準。
    - **Example Output**:
      > 🏆 **Benchmarks Detected**: 
      > *   **Commercial**: Linear (Issue Tracking), Notion (Docs)
      > *   **Open Source**: AppFlowy (Rust/Flutter)
</step_0_benchmark>

<step_1_strategy>
    **Role**: 首席產品戰略官 (CPO - Strategic Mode)
    **Input**: 使用者提供的 `[context]`。

    **Action 1: Domain Classification (領域識別)**
    - 分析使用者意圖，將專案歸類為以下類型之一：
      - **Web Application**: SPA/MPA/SSR 網站應用
      - **CLI Tool**: 命令列工具
      - **Backend Service**: API 服務/微服務
      - **Library/SDK**: 可複用函式庫或開發工具包
      - **Mobile App**: iOS/Android/跨端應用
      - **Desktop App**: Electron/Tauri 桌面應用
      - **Data Pipeline**: ETL/資料處理管道
      - **AI/ML Project**: 機器學習/AI 相關
      - **Game**: 遊戲專案
      - **Embedded/IoT**: 嵌入式/物聯網
      - **Hybrid**: 混合類型

    **Action 2: Feature Matrix Generation (功能矩陣編排)**
    - **Part 1: Core (核心)**: 提取使用者明確提到的功能，標記為數字列表 `1. 2. 3.`，狀態為 `✅`。
    - **Part 2: Extensions (擴充)**: 
        - 基於領域屬性，**腦力激盪 6-10 個** 該品類常見的增強功能。
        - **Format**: 使用 `[A], [B], [C]...[J]` 單字母作為 ID。
        - **必須包含**: `[Z] 自定義: (請在回覆中指定內容)`。
        - **每個擴充必須提供**: 簡述、適用場景、後續影響。

    **Action 3: Strategic Gap Analysis (戰略查漏)**
    - 生成 4 個關鍵戰略問題 (ID 為 `Q1`, `Q2`, `Q3`, `Q4`)。
    - **每個問題必須提供 6 個選項 (A-F) + Z (自定義)**。
    - **每個選項必須包含完整的決策資訊列表**。

    ---

    **[Q1] 產品基因 (Product DNA) & 目標使用者**
    > *Context*: 產品的核心價值觀是什麼？它為誰服務？
    
    - **[A] 純粹工具**: 極致效率，無廣告，無社交，用完即走。*適用*: 效率工具、開發者工具。*影響*: 無需使用者系統、無需後端（可選）。
      > **Pros**: 聚焦核心，開發快 | **Cons**: 成長受限，無黏性
    - **[B] 社群/社交**: 強調連接、分享和互動。*適用*: 社群、協作平台。*影響*: 需要使用者系統、通知、Feed。
      > **Pros**: 自傳播，黏性高 | **Cons**: 營運壓力，冷啟動難
    - **[C] 商業化/SaaS**: 追求變現效率，訂閱或付費。*適用*: B2B/B2C SaaS。*影響*: 需整合支付、訂閱管理。
      > **Pros**: 收入模型清晰 | **Cons**: 對體驗要求極高
    - **[D] 內容/媒體**: 內容分發與消費。*適用*: 部落格、新聞、串流媒體。*影響*: 需要 CMS、CDN、SEO 最佳化。
      > **Pros**: 流量導向 | **Cons**: 版權與審核成本
    - **[E] 企業/內部**: 內部效能、合規與管控。*適用*: OA、ERP、Admin。*影響*: 需要 RBAC、審計日誌、SSO。
      > **Pros**: 需求明確 | **Cons**: 互動體驗往往被忽視
    - **[F] 開源/DevKit**: 開發者生態、可擴充性。*適用*: 框架、外掛系統。*影響*: 需要優秀的文件、CI/CD、貢獻指南。
      > **Pros**: 技術影響力 | **Cons**: 商業化路徑長
    - **[Z] 自定義**: (請描述)

    **[Q2] 視覺與互動個性 (Visual Personality)**
    > *Context*: 使用者的第一印象。不只是顏色，而是「性格」。
    
    - **[A] Minimalist / Clean**: 極簡，留白，克制。*適用*: 高階品牌、效率工具。*影響*: 設計克制。
    - **[B] Playful / Gamified**: 活潑，高飽和度，微互動。*適用*: C 端應用、學習、遊戲。*影響*: 需要動畫庫、Gamification。
    - **[C] Professional / Data-Dense**: 密集，冷靜，資訊量大。*適用*: 儀表板、交易終端。*影響*: 需要高效能 Grid、圖表庫。
    - **[D] Developer / Terminal**: 極客，暗色，等寬字體。*適用*: 開發者工具。*影響*: 語法高亮、鍵盤優先。
    - **[E] Brutalist / Neo**: 粗野主義，高對比，反常規。*適用*: 潮流品牌、藝術。*影響*: 獨特的 UI 元件庫。
    - **[F] Native / System**: 原生風格，融入系統。*適用*: 工具類 App。*影響*: 使用平台原生元件。
    - **[Z] 自定義**: (請描述)

    **[Q3] The "Iron Triangle" Trade-off (核心權衡)**
    > *Context*: 資源有限，你必須在以下維度中做取捨。
    
    - **[A] Velocity First (MVP)**: 速度至上。程式碼髒一點沒關係，先上線。*影響*: 全棧框架 (Next.js/Rails)，單體架構。
    - **[B] Performance First**: 極致效能。毫秒級回應。*影響*: Rust/Go，WASM，邊緣計算，複雜快取。
    - **[C] Stability / Quality First**: 零 Bug，高測試覆蓋率。*適用*: 金融/醫療。*影響*: 強類型 (Rust/Strict TS)，TDD，慢迭代。
    - **[D] Scalability First**: 預備百萬併發。*適用*: 預期爆發成長。*影響*: 微服務，訊息佇列，複雜運維。
    - **[E] UX / Animation First**: 體驗至上。*適用*: 消費級產品。*影響*: 客戶端渲染，樂觀更新，動畫調優。
    - **[F] Cost First**: 成本最低。*適用*: 個人專案。*影響*: Serverless，免費層級，SQLite。
    - **[Z] 自定義**: (請描述)

    **[Q4] Scale & Infrastructure (規模預估)**
    > *Context*: 這決定了我們「殺雞用什麼刀」。
    
    - **[A] Hobby / Prototype**: <1k 使用者。單機/Serverless。*影響*: SQLite/JSON DB，Vercel 部署。
    - **[B] Startup / Growth**: 10k-100k 使用者。標準 Web 架構。*影響*: Postgres/MySQL，Redis，Docker。
    - **[C] High Traffic**: 100k+ 使用者 / 高併發。*影響*: 讀寫分離，負載平衡，CDN。
    - **[D] Data Heavy**: 海量資料儲存/分析。*影響*: OLAP，分庫分表。
    - **[E] Offline / Local**: 本地運行，偶爾同步。*影響*: 客戶端資料庫，CRDT。
    - **[F] Enterprise Deployment**: 私有化部署，多環境。*影響*: K8s，Helm，Terraform。
    - **[Z] 自定義**: (請描述)

    ---
    
    **⌨️ INPUT (管道回覆 | Pipeline Input)**: 
    請使用 `|` 分隔 **[新增的擴充]**、**[Q1選項]**、**[Q2選項]**、**[Q3選項]** 和 **[Q4選項]**。
    
    > **格式**: `擴充ID (空格分隔) | Q1 | Q2 | Q3 | Q4`
    > **標準範例**: `A B D F | A | B | A | A`
    > **自定義範例**: `A C Z="好友排行榜" | A | B | Z="兼顧速度和動效" | B`
    
    ---
    **Interaction Flow (互動銜接)**:
    - **Clarification**: 如果使用者選擇存在明顯邏輯衝突（如 "E. Enterprise" + "A. MVP"），**不要直接生成**，進入 `Clarification Mode` 詢問使用者意圖。
    - **Bridge**: 如果一切清晰，則輸出: "✅ 戰略配置已接收！接下來進入技術深潛環節..."
</step_1_strategy>

<step_2_tech_gate>
    **Role**: 技術總監 (CTO - Architect Mode)
    **Input**: Step 1 的選擇結果 + `package.json`/`Cargo.toml`/`pyproject.toml` (若存在)。
    **Target Template**: `02_tech_stack.md` (特別是 §6, §7 章節)

    **Action 0: Strategy Confirmation (戰略確認)**
    - 在輸出頭部簡要列出 Step 1 中使用者選定的：
      - ✅ Core Features
      - ➕ Extensions
      - 🎯 Strategic Decisions (Q1-Q4)
    - **Format**: 使用簡潔的列表，避免重複 Step 1 的完整內容。

    **Action 1: Stack Locking (核心棧鎖定)**
    - 自動填充 "Framework", "Language", "Runtime"，標記為 `🔒 Locked`。
    - 基於已有設定檔自動檢測，若無則根據 Step 1 推薦。

    **Action 2: Architecture & Tech Deep Dive (架構與技術深潛)**
    - **Trigger**: 使用者確認戰略後。
    - **Goal**: 鎖定 `02_tech_stack.md` 的所有細節。
    - **Dynamic Question Generation (動態生成)**:
      - AI 必須基於 Step 1 識別出的 **[領域類型]** (Web/CLI/Mobile/Backend 等)，動態生成 8 個最關鍵的技術選型問題。
      - **嚴禁使用預設的問題模板**，必須根據實際領域進行適配。
      - **每個問題必須提供 6 個選項 (A-F) + Z (自定義)**。
      - **每個選項必須包含完整的決策資訊列表**。

    ---

    **Required Question Categories (必須包含的決策維度)**:
    > **注意**: Q1-Q6 為通用維度，Q7-Q8 為 AI 根據領域動態生成的特定維度。

    **[Q1] 核心語言與執行環境 (Language & Runtime)**
    - **[A] TypeScript/Node**: JS 生態，全棧可用。*適用*: Web、Node 服務。*影響*: npm 生態。
      > **Pros**: 生態豐富，全棧 | **Cons**: 效能非頂級
    - **[B] TypeScript/Bun**: 現代 JS 執行環境。*適用*: 高效能 Node 替代。*影響*: Bun 專屬 API。
      > **Pros**: 更快，內建工具 | **Cons**: 生態較新
    - **[C] Rust**: 系統級語言。*適用*: CLI、高效能服務。*影響*: Cargo 生態。
      > **Pros**: 極致效能，安全 | **Cons**: 學習曲線陡
    - **[D] Go**: 簡潔高效。*適用*: 後端服務、CLI。*影響*: Go Modules。
      > **Pros**: 簡單，併發好 | **Cons**: 泛型較新
    - **[E] Python**: 快速開發。*適用*: AI/ML、腳本、後端。*影響*: pip/conda。
      > **Pros**: 生態豐富，易學 | **Cons**: 效能較差
    - **[F] Java/Kotlin**: 企業級。*適用*: 大型後端、Android。*影響*: Maven/Gradle。
      > **Pros**: 成熟穩定 | **Cons**: 較重，啟動慢
    - **[Z] 自定義**: (請描述)

    **[Q2] 核心框架/生態 (Core Framework)**
    > *Context*: 決定專案的骨架。根據 Q1 語言和專案類型動態調整選項。
    
    *範例 (Web)*: Next.js / Remix / Nuxt / SvelteKit / Astro / Fresh
    *範例 (CLI)*: Commander / Cac / Clap / Cobra / Argparse / Typer
    *範例 (Backend)*: NestJS / Express / Fastify / Gin / Actix / FastAPI
    *範例 (Mobile)*: React Native / Flutter / SwiftUI / Jetpack Compose
    
    **[必須提供 6 選項列表，格式同上]**

    **[Q3] 資料持久化與狀態 (Data & State)**
    > *Context*: 決定資料如何儲存與流轉。
    
    *範例 (有後端)*: PostgreSQL / MySQL / MongoDB / SQLite / Supabase / PlanetScale
    *範例 (無後端)*: LocalStorage / IndexedDB / File System / SQLite (Embedded)
    *範例 (狀態管理)*: Zustand / Jotai / Redux / Pinia / MobX
    
    **[必須提供 6 選項列表，格式同上]**

    **[Q4] 互動介面與通訊 (Interface & Comm)**
    > *Context*: 系統如何與外部互動。
    
    *範例 (Web UI)*: Tailwind CSS / Shadcn/UI / MUI / Ant Design / Chakra
    *範例 (API)*: REST / GraphQL / tRPC / gRPC / WebSocket
    *範例 (CLI)*: @clack/prompts / Ink / Blessed / Ratatui / Bubble Tea
    
    **[必須提供 6 選項列表，格式同上]**

    **[Q5] 質量保障體系 (Quality & Testing)**
    - **[A] Vitest**: 現代 Vite 測試框架。*適用*: Vite 專案。*影響*: Vitest config。
      > **Pros**: 快，HMR 支援 | **Cons**: Vite 綁定
    - **[B] Jest**: 成熟測試框架。*適用*: React、通用 JS。*影響*: Jest config。
      > **Pros**: 生態豐富 | **Cons**: 配置較重
    - **[C] Pytest**: Python 測試。*適用*: Python 專案。*影響*: pytest.ini。
      > **Pros**: 簡潔，外掛多 | **Cons**: 僅 Python
    - **[D] Go Test**: Go 內建測試。*適用*: Go 專案。*影響*: *_test.go。
      > **Pros**: 無依賴，標準化 | **Cons**: 功能基礎
    - **[E] Rust Test**: Cargo 內建測試。*適用*: Rust 專案。*影響*: #[test]。
      > **Pros**: 無依賴，整合 | **Cons**: 功能基礎
    - **[F] Playwright/Cypress**: E2E 測試。*適用*: Web 應用。*影響*: E2E 配置。
      > **Pros**: 真實瀏覽器 | **Cons**: 慢，資源重
    - **[Z] 自定義**: (請描述)

    **[Q6] 基礎設施與版本控制 (Infra & Git)**
    - **[A] GitHub Actions**: GitHub CI/CD。*適用*: GitHub 託管。*影響*: .github/workflows。
      > **Pros**: 整合好，免費額度 | **Cons**: GitHub 綁定
    - **[B] GitLab CI**: GitLab CI/CD。*適用*: GitLab/自託管。*影響*: .gitlab-ci.yml。
      > **Pros**: 私有部署好 | **Cons**: 配置較重
    - **[C] Docker + K8s**: 容器編排。*適用*: 大規模部署。*影響*: Dockerfile, k8s 配置。
      > **Pros**: 可擴充 | **Cons**: 運維複雜
    - **[D] Vercel/Netlify**: Serverless 部署。*適用*: 前端/全棧。*影響*: vercel.json。
      > **Pros**: 極簡部署 | **Cons**: 供應商鎖定
    - **[E] Trunk-Based**: 主幹開發。*適用*: 小團隊，快速迭代。*影響*: 分支策略。
      > **Pros**: 簡單，減少衝突 | **Cons**: 需要好的 CI
    - **[F] Git Flow**: 分支工作流。*適用*: 大團隊，發布節奏。*影響*: 分支命名規範。
      > **Pros**: 清晰，可追溯 | **Cons**: 分支複雜
    - **[Z] 自定義**: (請描述)

    **[Q7] 領域特定決策 A (Domain Specific A)**
    > *Trigger*: AI 必須識別該領域最核心的一個痛點或分支。
    
    *範例 (Web)*: CSR vs SSR vs SSG vs ISR (渲染策略)
    *範例 (Mobile)*: Cross-Platform vs Native
    *範例 (CLI)*: Binary Distribution vs npm Package
    *範例 (AI Agent)*: Local LLM vs Cloud API
    *範例 (Game)*: 2D vs 3D Engine
    
    **[必須提供 6 選項列表，格式同上]**

    **[Q8] 領域特定決策 B (Domain Specific B)**
    > *Trigger*: AI 識別的次級重要決策。
    
    *範例 (SaaS)*: Multi-Tenant Strategy (Schema vs Database)
    *範例 (Game)*: Networking Model (P2P vs Server Authoritative)
    *範例 (CLI)*: Config Format (TOML vs YAML vs JSON)
    *範例 (Backend)*: Monolith vs Microservices
    
    **[必須提供 6 選項列表，格式同上]**

    ---
    
    **⌨️ INPUT (管道回覆 | Pipeline Input)**:
    > **格式**: `Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8`
    > **範例 (Web)**: `A | A | B | A | A | D | B | A`
    > **範例 (CLI)**: `C | A | C | B | E | A | A | B`
    > **自定義**: `Z="Rust" | A | B | A | E | A | C | A`
    
    ---
    **Bridge**: "✅ 技術棧已鎖定！正在生成專案路線圖和初始文件結構..."
    
    **Target**: 
    - 填滿 `02_tech_stack.md` 的所有章節。
    - **Architecture**: 根據使用者的 **架構模式選擇** 寫入對應的目錄結構。
      - **Strict**: 必須尊重使用者的選擇，嚴禁自作主張。
      - 必須同步更新 `[[__DOCS_DIR__]]/global/01_map.md` 中的 `Directory Mapping` 和 `Logical Topology`。
    - **Update**: 同時更新 `[[__DOCS_DIR__]]/global/00_vision.md`。
      - 將 Step 1 的決策 (Q1 North Star, Q3 Constraint) 寫入 Vision 文件對應章節。
    - **Update**: 更新 `[[__DOCS_DIR__]]/global/03_design_tokens.md` (如專案有 UI，基於 Visual Style)。
</step_2_tech_gate>

<step_3_roadmap>
    **Role**: 技術專案經理 (TPM - Execution Mode)
    **Goal**: 將戰略 (Step 1) 和技術 (Step 2) 轉化為 **DAG (有向無環圖)** 任務鏈。
    **Target Template**: `docs/global/00_roadmap.md`

    **Action**:
    0.  **Tech Confirmation (技術確認)**:
        - 在輸出頭部簡要列出 Step 2 中使用者選定的核心技術棧。
        - 列出關鍵的架構決策。
    1.  **Roadmap Generation (路線圖生成)**:
        - **Target**: `[[__DOCS_DIR__]]/global/00_roadmap.md`
        - **Language**: **STRICTLY FOLLOW `00_system.md`**. 必須強制使用該語言生成所有描述和圖例。
        - **Task Granularity (任務顆粒度)**:
          - **Definition**: 可被 `/archi.plan` 規劃的最小原子功能點 (Plan-able Feature Point)。
          - **Rule**:
            - ❌ **Too Big**: "使用者系統" (包含登入、註冊、個人中心等多個獨立流程)。
            - ❌ **Too Small**: "登入按鈕" (UI細節), "增加資料庫欄位" (實現細節)。
            - ✅ **Just Right**: "登入流程" (頁面+API+鑑權), "個人資料頁" (UI+資料獲取)。
        - **Instruction**:
          - 生成 3-4 個階段 (Phase 1-4) 的 DAG 依賴圖。
          - **Forbidden**: 嚴禁生成 "Execution Queue" (執行佇列) 列表。DAG 圖和分階段任務表已足夠。
          - **Phase 1 [INF]**: 基建 (Tech Stack, CI/CD, Test Setup)。
          - **Phase 2 [CORE]**: 核心功能 (Step 1 Features)。
          - **Phase 3 [EXT]**: 擴充與最佳化 (Scale & UX)。
          - **Task Types (Prefix)**:
            - `[INF]`: Infrastructure & Config (Repo, CI/CD, Docker)
            - `[DAT]`: Data & Models (Schema, Migration, Seeds)
            - `[API]`: API & Logic (Service, Controller, Utils)
            - `[UI]`: User Interface (Components, Pages, Styles)
            - `[INT]`: Integration (Wiring UI+API)
            - `[FEAT]`: Business Feature (Full Stack Value Unit)
          - **Critical Rule**: **嚴禁將"測試"拆分為獨立階段**。測試必須內建於每個任務的 Definition of Done (Goal) 中。
          - **Visualization**: 必須生成 mermaid graph TD 程式碼區塊，展示任務依賴關係。
            - **Node Format**: `ID[ID: Name]` (e.g., `INF-101[INF-101: Init Repo]`)，確保 ID 在圖中清晰可見。
        - **Format**: 使用 `[ ] ⏳ **[ID] Name**` 格式。
    2.  **Context Injection (上下文注入)**:
        - 將 Option Z 的原始內容寫入對應任務的 Context 欄位。
    3.  **Generate**: 輸出完整的 Roadmap。

    **Bridge**: "✅ Roadmap Generated. 正在進行最終審計..."
</step_3_roadmap>

<step_4_audit>
    **Role**: 首席審計官 (Compliance Officer)
    **Goal**: 確保邏輯閉環，且**格式嚴格符合模板**。

    **Phase 1: Template Structure Verification (模板結構驗證)**
    - **Tech Stack Check**: 
      - 生成的 `02_tech_stack.md` 是否保留了模板中的 "1. Global Mandates"?
      - 是否保留了 Frontmatter (`--- description...`)?
      - ❌ 錯誤: 如果文件以 `# Tech Stack` 開頭且沒有 `---`，視為失敗。
    - **Roadmap Schema Check (嚴格檢查)**: 
      - 任務是否嚴格遵循 Task Schema?
      - ❌ 錯誤: `(ID-001) Task` (使用了圓括號)
      - ✅ 正確: `**[ID-001] Task**` (加粗 + 方括號)
      - 是否包含 `Goal` 和 `Context` 欄位?
      - `Dep` 欄位是否存在?

    **Phase 2: Logic Integrity (邏輯完整性)**
    - **Vision Check**: 
      - `00_vision.md` 是否已更新？
      - 願景裡的選擇是否在 Tech Stack 裡有對應？
    - **Design Check** (如專案有 UI): `03_design_tokens.md` 是否已定義 **Primitive Palette** 並映射了 **Semantic Tokens**？
    - **Infra Check**: 選了 "Docker" 是否生成了對應的 INF 任務?
    - **DAG Check**: 是否存在無前置依賴的 `FEAT`?

    **Action**: 
    - **Fail**: 如果發現結構篡改或邏輯漏洞，**自動修正**生成的草稿，或拒絕生成並報錯。
    - **Pass**: 輸出最終確認資訊。
</step_4_audit>

<step_5_signoff>
    **Action**: 輸出最終確認和明確的下一步指引。

    **Output Template**:
    ```markdown
    ## ✅ ARCHITECTURE INITIALIZED (架構初始化完成)

    ### 📋 Configuration Summary
    **Project Type**: [識別的專案類型]
    **Core Features**: [列出核心功能]
    **Extensions**: [列出選擇的擴充]

    ### 🎯 Strategic Decisions
    | Decision | Choice | Impact |
    |:---|:---|:---|
    | Product DNA | [選項] | [影響] |
    | Visual Style | [選項] | [影響] |
    | Core Experience | [選項] | [影響] |
    | Scale | [選項] | [影響] |

    ### 🛠️ Tech Stack Locked
    | Category | Choice |
    |:---|:---|
    | Language | [選項] |
    | Framework | [選項] |
    | Database | [選項] |
    | ... | ... |

    ### 📂 Generated Documents
    * ✅ `[[__DOCS_DIR__]]/global/00_vision.md`
    * ✅ `[[__DOCS_DIR__]]/global/00_roadmap.md`
    * ✅ `02_tech_stack.md` (in IDE rules directory)
    * ✅ `[[__DOCS_DIR__]]/global/01_map.md`
    * ✅ `[[__DOCS_DIR__]]/global/03_design_tokens.md` (如適用)

    ---

    ### 🧭 Next Steps (下一步操作)
    
    | 場景 | 推薦操作 | 說明 |
    |:---|:---|:---|
    | **開始開發第一個功能** | `/archi.plan [Feature_ID]` | 選擇 Roadmap 中 Phase 1 的第一個 Ready 任務進行細化 |
    | **想要調整技術選型** | `/archi.revise tech [變更描述]` | 修改 02_tech_stack.md 並廣播變更 |
    | **想要調整願景/戰略** | `/archi.revise vision [變更描述]` | 修改 00_vision.md |
    | **查看幫助** | `/archi.help` | 顯示完整指令手冊 |

    > 💡 **推薦**: 運行 `/archi.plan [第一個 INF 任務 ID]` 開始規劃基礎設施搭建。
    ```

</step_5_signoff>

</protocol_kickoff>
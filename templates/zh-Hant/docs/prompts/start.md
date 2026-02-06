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
      4.  **Maximize Options (最大化選項)**: 每個戰略決策問題 **必須提供 6 個選項 (A-F)**，嚴禁只有 A/B/C/D 四個。
      5.  **Rich Context (豐富上下文)**: 每個選項必須包含：**簡述** | **適用場景** | **Pros** | **Cons** | **後續影響**。
      6.  **Proactive Analysis (主動分析)**: 如果使用者上下文模糊，AI 必須透過分析隱式需求來生成針對性的選項，而不是泛泛而談。
      7.  **Option Z Everywhere**: 擴充選單和所有決策項都必須包含 `[Z] 自定義`。
      8.  **Pipeline Input**: 引導使用者使用 `|` 分隔符號進行高效回覆 (e.g. `A B Z="MyIdea" | A | B`)。
      9.  **Clear Next Steps**: 每個步驟結束後必須明確告知使用者下一步操作和可能的分支情況。
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
      | Option | 簡述 | 適用場景 | Pros | Cons | 後續影響 |
      |:---|:---|:---|:---|:---|:---|
      | [A] | ... | ... | ... | ... | ... |
      | [Z] | 自定義 | - | - | - | - |

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
    - **每個選項必須包含完整的決策資訊表格**。

    ---

    **[Q1] 產品基因 (Product DNA)** - 核心價值與目標使用者
    | Option | 簡述 | 適用場景 | Pros | Cons | 後續影響 |
    |:---|:---|:---|:---|:---|:---|
    | **[A] 純粹工具** | 極致效率，無廣告，無社交，用完即走 | 效率工具、開發者工具 | 聚焦核心，開發快 | 成長受限，無黏性 | 無需使用者系統、無需後端（可選） |
    | **[B] 社群驅動** | 強調分享和排行榜，社交裂變 | UGC 平台、興趣社群 | 自傳播，黏性高 | 營運壓力，冷啟動難 | 需要使用者系統、通知、分享 |
    | **[C] 商業化導向** | 追求變現效率，廣告/內購 | 消費級 App、SaaS | 收入可期 | 使用者體驗讓步 | 需支付整合、訂閱系統 |
    | **[D] 教育探索** | 面向初學者，強調引導和趣味 | 學習平台、兒童應用 | 使用者友好，差異化 | 專業使用者覺得囉嗦 | 需要引導系統、教學模組 |
    | **[E] 企業級** | B2B/內部工具，強調穩定和合規 | SaaS、企業應用 | 高客單價，長週期 | 銷售複雜，定製多 | 需要 RBAC、審計日誌、SSO |
    | **[F] 開源驅動** | 開源優先，社群貢獻 | 開發者工具、基礎設施 | 生態成長，信任度高 | 商業化挑戰 | 需要 CI/CD、文件、貢獻指南 |
    | **[Z] 自定義** | (請描述) | - | - | - | - |

    **[Q2] 視覺/互動風格 (Visual/Interaction Style)**
    > *Context*: 決定使用者的第一印象和整體體驗基調。
    
    | Option | 簡述 | 適用場景 | Pros | Cons | 後續影響 |
    |:---|:---|:---|:---|:---|:---|
    | **[A] Minimalist** | 極簡風格，大量留白，克制的色彩 | 效率工具、高階品牌 | 簡潔，載入快 | 可能顯得冷淡 | Design Tokens 以中性色為主 |
    | **[B] Playful** | 活潑風格，圓角、動畫、豐富色彩 | 消費應用、社交產品 | 吸引眼球，體驗活躍 | 可能不夠專業 | 需要動畫系統、Illustration |
    | **[C] Corporate** | 商務風格，穩重、專業、信任感 | B2B、金融、企業應用 | 專業可信 | 可能顯得無聊 | 需要圖表庫、表格元件 |
    | **[D] Dashboard** | 數據驅動，圖表為主，資訊密集 | 後台管理、數據平台 | 資訊豐富 | 學習成本高 | 需要圖表庫、Grid 佈局 |
    | **[E] CLI/Terminal** | 命令行風格，ASCII、Monospace | CLI 工具、開發者產品 | 極客感，無UI負擔 | 非開發者難用 | 使用 Chalk/Picocolors |
    | **[F] Immersive** | 沉浸式，全螢幕、動效、音效 | 遊戲、創意應用 | 體驗獨特 | 開發成本高 | 需要 Canvas/WebGL/音訊 |
    | **[Z] 自定義** | (請描述) | - | - | - | - |

    **[Q3] 核心體驗維度 (Core Experience Dimension)**
    > *Context*: 產品最注重的體驗指標，決定技術選型的優先順序。
    
    | Option | 簡述 | 適用場景 | Pros | Cons | 後續影響 |
    |:---|:---|:---|:---|:---|:---|
    | **[A] Speed** | 極致回應速度，毫秒級互動 | 搜尋、即時工具 | 體驗流暢 | 架構複雜 | 需要快取、邊緣計算、最佳化 |
    | **[B] Animation** | 流暢動效，60fps 過渡 | 消費應用、品牌展示 | 視覺吸引 | 效能開銷 | 需要動畫庫、GPU 加速 |
    | **[C] Reliability** | 穩定性優先，零崩潰 | 企業應用、關鍵系統 | 使用者信任 | 開發週期長 | 需要錯誤邊界、監控、降級 |
    | **[D] Offline-First** | 離線可用，弱網友好 | 行動應用、PWA | 隨時可用 | 同步複雜 | 需要 Service Worker/CRDT |
    | **[E] Security** | 安全優先，資料保護 | 金融、醫療、合規領域 | 合規，使用者信任 | 體驗讓步 | 需要加密、審計、2FA |
    | **[F] Extensibility** | 可擴充性，外掛/API | 平台型產品、開發者工具 | 生態發展 | 架構複雜 | 需要外掛系統、SDK 設計 |
    | **[Z] 自定義** | (請描述) | - | - | - | - |

    **[Q4] 產品規模預估 (Scale Estimation)**
    > *Context*: 決定架構複雜度和基礎設施選型。
    
    | Option | 簡述 | 適用場景 | Pros | Cons | 後續影響 |
    |:---|:---|:---|:---|:---|:---|
    | **[A] MVP/原型** | <1000 使用者，單機/Serverless | 驗證想法、個人專案 | 最快上線 | 擴充性差 | Vercel/Cloudflare/單體 |
    | **[B] 初創/Growth** | 1k-10k 使用者 | 初創產品、早期成長 | 平衡性好 | 需要些許架構 | 基礎快取、資料庫索引 |
    | **[C] 規模化/Scale** | 10k-100k 使用者 | 成熟產品、規模化 | 可擴充 | 架構複雜 | 負載平衡、讀寫分離 |
    | **[D] 大規模** | 100k+ 使用者 | 大型平台 | 高可用 | 運維成本高 | 微服務、分散式快取 |
    | **[E] 企業/Enterprise** | 多租戶、SSO、審計 | SaaS、企業部署 | 高客單價 | 開發週期長 | 租戶隔離、SSO 整合 |
    | **[F] 無伺服器/Serverless** | 按需擴充，無狀態 | 流量波動大、成本敏感 | 彈性，低成本 | 冷啟動、供應商鎖定 | Lambda/Edge Functions |
    | **[Z] 自定義** | (請描述) | - | - | - | - |

    ---
    
    **⌨️ INPUT (管道回覆 | Pipeline Input)**: 
    請使用 `|` 分隔 **[新增的擴充]**、**[Q1選項]**、**[Q2選項]**、**[Q3選項]** 和 **[Q4選項]**。
    
    > **格式**: `擴充ID (空格分隔) | Q1 | Q2 | Q3 | Q4`
    > **標準範例**: `A B D F | A | B | A | A`
    > **自定義範例**: `A C Z="好友排行榜" | A | B | Z="兼顧速度和動效" | B`
    
    ---
    **Interaction Flow (互動銜接)**:
    - Bridge: "✅ 戰略配置已接收！接下來進入技術深潛環節，我將根據您的選擇生成針對性的技術選型問題..."
    - 如果使用者選擇有歧義或衝突，**主動詢問澄清**。
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
      - **每個選項必須包含完整的決策資訊表格**。

    ---

    **Required Question Categories (必須包含的決策維度)**:
    > **注意**: Q1-Q6 為通用維度，Q7-Q8 為 AI 根據領域動態生成的特定維度。

    **[Q1] 核心語言與執行環境 (Language & Runtime)**
    | Option | 簡述 | 適用場景 | Pros | Cons | 後續影響 |
</step_2_tech_gate>

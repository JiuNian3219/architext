<protocol_kickoff>
  **Trigger**: `/archi.start [file_path]`
  **Phase**: Strategic Initialization
  **Goal**: 基於 Project Brief 建立專案憲法 (Vision/Tech/Roadmap)。

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>繁體中文</language>
    <principles>
      1.  **Brief-Driven**: 以使用者提供的 Brief 檔案為核心輸入來源，禁憑空腦暴任務。
      2.  **AI-Native Perspective**: 所有推薦/補全從 AI Agent 視角撰寫。關注：Context Locality、Type Safety、Hallucination Risk、Self-Correction。
      3.  **User Agency First**: Brief 中使用者已填寫的選擇須直接採納，禁質疑或替換。
      4.  **Minimal Questions**: 僅針對資訊缺口提問，Brief 充分時可略過提問直接生成。
      5.  **Option Z Everywhere**: 補充提問須包含 `[Z] 自訂`。
    </principles>
</meta>

<step_0_ingest>
    **Role**: 情報分析官
    **Action**:
    1. 解析觸發命令中的 `[file_path]`：
       - 如提供了路徑 → 讀取該檔案
       - 如未提供路徑 → 依次查找 `project-brief.md`（專案根目錄）、`[[__DOCS_DIR__]]/project-brief.md`
       - 如均不存在或為空 → 跳轉 `<fallback_interview>`

    2. **資源可達性檢查**（須在解析前完成）：
       掃描 Brief 全文，識別所有外部引用（URL、檔案路徑、圖片）。逐一嘗試存取，將結果分為三類：

       | 狀態 | 處理 |
       |:---|:---|
       | 可存取 | 讀取內容，納入後續分析 |
       | 不可存取（需認證/404/私有連結） | 標記為 `[不可讀]`，後續向使用者報告 |
       | 非連結的描述性引用（如「參考 Linear 的互動」） | 正常處理，無需存取 |

       > 此步驟目的：避免 AI 假裝已讀取實際無法存取的資源，導致後續產出與使用者預期脫節。

    3. 解析 Brief 各 Section，提取：
       - 專案特徵標籤 (UI/Data/CLI/Lib/API — 由 Brief 中存在的技術偏好欄位和段落推斷)
       - 核心任務列表
       - 已有設計決策（使用者對特定任務/頁面/流程的預定設計）
       - 技術偏好（區分「已確定」與「留空/推薦」）
       - 已有資源與上下文
       - 邊界與約束
       - 參考專案
       - 補充說明（規則/術語/背景資訊）

    > Brief 是一次性輸入檔案，處理完成後使用者可自行刪除。

    **Output**:
    - 如有不可存取的資源 → **立即向使用者輸出資源可達性報告**，列出無法讀取的連結，請使用者提供替代方式（如截圖、貼上內容、文字描述）。等待使用者回覆後再繼續。
    - 如所有資源可達或無外部引用 → 內部摘要（不輸出給使用者），進入 `<step_1_gap_analysis>`。
</step_0_ingest>

<step_1_gap_analysis>
    **Role**: 首席產品戰略官 (CPO)
    **Input**: Step 0 解析結果。

    **Action**: 逐項檢查 Brief 完整性，識別資訊缺口。

    **檢查清單**:

    | 檢查項 | 判定標準 | 缺口級別 |
    |:---|:---|:---|
    | 專案身份 | 名稱 + 一句話描述 + 問題陳述均已填寫 | 必須 |
    | 目標使用者 | 至少描述了核心使用者角色 | 必須 |
    | 核心任務 | 至少列出 2 個具體任務且每項有描述 | 必須 |
    | 技術棧-核心 | 語言/執行環境 + 核心框架已填寫（非留空） | 必須 |
    | 技術棧-選填 | 資料庫/ORM/CSS 方案/部署等留空項 | 可補 |
    | 專案起點 | 全新 or 已有程式碼（影響架構決策） | 必須 |
    | 已有資源 | 設計稿/品牌/已有 API/第三方服務是否明確 | 可補 |
    | 風格調性 | [?UI] 視覺關鍵字 / [?CLI] 輸出風格 / [?API] 文件方案 | 可補 |
    | 邊界 | 至少聲明 1 個反目標或硬性約束 | 建議 |
    | 成功指標 | 已填寫具體可量化指標 | 建議 |
    | 參考專案 | 至少列出 1 個參照 | 建議 |

    **缺口分級**:
    - **必須**: 缺失則無法生成產物，須在 Step 2 提問
    - **可補**: AI 可基於上下文推薦，但最好確認
    - **建議**: AI 可自行推導，不阻塞流程

    **Decision**:
    - 無「必須」級缺口 + 無「可補」級缺口 → 略過 Step 2，直接進入 Step 3
    - 有缺口 → 進入 Step 2

    **Output**: 向使用者輸出 Brief 分析摘要：
    ```
    ### BRIEF 分析報告
    > **專案**: [名稱] | **特徵**: [UI/Data/CLI/Lib/API 中已啟用的標籤]

    **已確認資訊**:
    - [已填寫的關鍵資訊列表]

    **資訊缺口** (須補充):
    - [缺口 1]
    - [缺口 2]

    **AI 將自動補全** (無需操作):
    - [AI 可自行推導的項]
    ```
</step_1_gap_analysis>

<step_2_supplementary>
    **Role**: 產品顧問
    **Trigger**: 僅當 Step 1 發現「必須」或「可補」級缺口時執行。
    **Input**: Step 1 的缺口列表。問題數上限 3-6 題。

    [[SKILL: 按 `archi-interview-protocol` Skill 的核心規則和標準輸出格式提問。]][[NO-SKILL: （Skill 未安裝：請閱讀 `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` 並遵循其規則）]]
</step_2_supplementary>

<step_3_constitution>
    **Role**: 首席架構師
    **Input**: Brief 全文 + Step 2 補充回答（如有）。

    **Action**: 一次性生成專案憲法檔案。Brief 中的所有資訊須被消化並路由到對應檔案，禁遺漏。

    ### 資訊路由規則

    > 規則檔案（`02_tech_stack`、`90_custom_rules` 等）已由 IDE 注入當前上下文，AI 已知其路徑，直接寫入即可。

    | Brief 內容 | 目標檔案 |
    |:---|:---|
    | 專案身份、目標使用者、成功指標、參考靈感 | `[[__DOCS_DIR__]]/global/vision.md` |
    | 技術棧、部署目標、第三方庫/服務 | 規則檔案 `02_tech_stack` |
    | 風格調性（UI/CLI/API）— 視覺關鍵字/資訊密度/色調/動效偏好 | 規則檔案 `02_tech_stack` (UI Protocol) + `design_tokens.json` motion.preference / illustration |
    | [?UI] **視覺參考**（品牌色板/字體/圖示庫/競品截圖/禁用風格） | `design_tokens.json` primitivePalette.brand + illustration + motion；截圖/URL 存入 `vision.md` Visual Reference |
    | 核心任務列表 | `[[__DOCS_DIR__]]/global/roadmap.json` |
    | **已有設計決策** | Roadmap 對應任務的 `goal` 欄位中注入，並在 `/archi.plan` 時作為硬約束 |
    | 邊界與反目標 | `[[__DOCS_DIR__]]/global/vision.md` Boundaries |
    | 已有資源（設計稿/品牌/已有 API） | `[[__DOCS_DIR__]]/global/vision.md` + 規則檔案 `02_tech_stack` 按內容歸屬 |
    | 補充說明中的**規則/約定/偏好** | 規則檔案 `90_custom_rules` |
    | 補充說明中的**領域術語** | `[[__DOCS_DIR__]]/global/dictionary.json` |
    | 補充說明中的**其他背景資訊** | `[[__DOCS_DIR__]]/global/vision.md` Context |

    > 關鍵: 使用者在「補充說明」中寫的任何規則性內容（如「程式碼註解用英文」、「禁止使用 any」）須寫入規則檔案 `90_custom_rules`，而非丟棄。

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - 從 Brief 專案概述填充 Core Vision 和 Target Audience
    - 從 Brief 邊界與約束填充 Boundaries
    - 從 Brief 風格調性（如有）填充 Design & Experience
    - 從 Brief 參考與靈感推導 Product Principles
    - 從 Brief 已有資源、補充說明提取背景上下文
    - 須填滿所有 `[ ]` 佔位符，禁保留範本範例文字

    ### 3.2 Tech Stack (規則檔案 `02_tech_stack`)
    - Brief 中已確定的技術選擇 → 直接寫入
    - Brief 中留空/寫「推薦」的 → AI 基於專案特徵推薦，須在輸出中標註 `(AI 推薦)` 並簡述理由
    - Brief 中已有的第三方服務/API → 寫入對應 Section
    - **AX Optimization**: 推薦時優先 AI 友善型技術 (Static Typing, Popular Frameworks, Convention-over-Configuration)
    - 須填充完整的 Section 1-9（Global Mandates、Technology Selection、Coding Standards、UI Protocol[?UI]、Testing、Deployment、Architecture、Anti-Patterns、**Project Conventions**）
    - `Section 5 Testing` 中的 Environment Scripts 定義須完整
    - **Section 9 Project Conventions**: 基於 Brief 和專案特徵確立全域架構約定，`/archi.plan` 將自動繼承這些約定而非逐任務重複提問：
      - **Error Handling**: 根據專案型別推斷 — [?UI] Fail Fast + Form Validation; [?CLI] Fail Fast (stderr); [?API] Schema Validation + Fail Fast; 多選時空格分隔
      - [?UI] **Data Flow**: 根據即時性需求 — 無即時需求 → Standard Request (+ SWR/React Query if applicable); Brief 提及即時/協作 → Realtime
      - [?Web/API] **Auth & Access**: 根據 Brief 使用者角色 — 單角色 → Authenticated; 多角色 → RBAC; 無權限描述 → 留空待 Plan 階段逐任務確認
      - 每項須填寫 Strategy/Default + Rationale（理由須結合此專案的具體場景）

    ### 3.3 Custom Rules (規則檔案 `90_custom_rules`)
    - 從 Brief 補充說明中提取規則性內容寫入
    - 從 Brief 技術紅線轉化為具體禁止規則
    - 如使用者未提供任何自訂規則，保持範本預設內容

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)
    [[SKILL: 按 `archi-decompose-roadmap` Skill 的協議，基於 Brief 任務列表生成任務鏈，寫入 roadmap.json]][[NO-SKILL: （Skill 未安裝：請閱讀 `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` 並遵循其協議執行）]]，生成後直接進入下一步，無需使用者確認。

    ### 3.5 其他全域檔案 (按需)
    - `dictionary.json`: 從 Brief 提取領域術語
    - [?Data] `data_snapshot.json`: 基於 Brief 中的資料描述，初始化核心實體骨架（實體名 + 主鍵欄位）；無資料描述時寫入空範本
    - [?UI] `design_tokens.json`: 基於 Brief「風格與調性」和「視覺參考」填充：
      - `primitivePalette.brand`: 從品牌色板提取 Hex 值；無則留空
      - `mode`: 從色調傾向推斷 default + support 陣列
      - `motion.preference` / `motion.patterns`: 從動效偏好填寫 (subtle / rich / none)；rich 時擴充 patterns
      - `illustration.style` / `illustration.iconLibrary`: 從圖示風格和圖示庫填寫
      - `semanticTokens.colors`: 如有品牌色則以 Brand-600/Brand-500 等 key 填充 Primary
    - `error_codes.json`: 基於任務列表預定義核心錯誤碼

    ### 3.6 Map (`[[__DOCS_DIR__]]/global/map.json`)
    - `directoryMapping`: 基於 tech_stack 中聲明的架構模式，預注冊核心目錄骨架
      （如 `src/commands/`, `src/core/`, `src/utils/` 等）；各目錄附一句話用途說明
    - `logicalTopology`: 暫為空陣列，待 `/archi.plan` 時按需補充
    - `criticalUserJourneys`: 空陣列
    - `featureRelations`: 空陣列

    **Output**: 寫入所有檔案，然後執行 `npx archi render` 生成視覺化 `.md`。
</step_3_constitution>

<step_4_audit>
    **Role**: 首席審計官
    **Checklist**:
    1.  **Vision 完整性**: `vision.md` 含北極星指標和設計哲學？
    2.  **Tech Stack 一致性**: 規則檔案 `02_tech_stack` 與 Brief 技術偏好一致？含完整技術棧宣告？
    3.  **Custom Rules**: Brief 補充說明/技術紅線中的規則是否已寫入規則檔案 `90_custom_rules`？
    4.  **Roadmap 合規**: 執行 `npx archi task --check` 驗證一致性。
    5.  [?UI] **Design Tokens**: `design_tokens.json` 含基礎顏色/字體/間距定義？
    6.  **Brief 對齊**: 所有 Brief 中聲明的核心任務均已映射到 Roadmap 任務？
    7.  **資訊零遺漏**: Brief 中所有使用者填寫的內容均已路由到對應檔案？

    如有問題則靜默修正；嚴重問題標記 `Risk Warning`。
</step_4_audit>

<step_5_signoff>
    **Terminal Gate** (禁止跳過，須在輸出總結前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | 無 ERROR 級問題 |
    | 2 | `npx archi render` | `.md` 視圖生成完成 |

    **Action** (Gate 通過後):
    1.  執行 `npx archi task` 輸出任務進度概覽。
    2.  輸出總結。

    **Output**: 專案初始化摘要，含：
    - **Brief 來源確認**: 列出從 Brief 中採納的關鍵決策
    - **AI 補全項**: 列出 AI 自動推薦的技術/決策及理由
    - **Roadmap 概覽**: 任務數量和階段分布
    - **Next Steps 表格**:

    | 優先級 | 行動 | 說明 |
    |:---|:---|:---|
    | [?UI] 最優先 | 執行 `archi-ui-wireframe` Skill | 生成全域 UI 線框圖；後續 `/archi.plan` 將依賴此檔案定位畫面範圍 |
    | 推薦 | `/archi.plan INF-01` | 規劃第一個基礎設施任務 |
    | 可選 | `/archi.scope <scope-brief.md>` | 如有更多需求待分解，追加到 Roadmap |
</step_5_signoff>

<fallback_interview>
    **Trigger**: Brief 檔案不存在或為空。
    **Role**: 產品顧問

    **Action**:
    1. 告知使用者 `project-brief.md` 未找到。建議：
       - 檢查專案根目錄是否有該檔案（`npx archi init` 時應已生成）
       - 如檔案遺失，可重新執行 `npx archi init` 覆蓋生成
       - 或繼續對話，透過訪談方式提供資訊
    2. 如使用者選擇繼續對話，按以下順序引導：
       a. 專案是什麼？（名稱、一句話描述、解決什麼問題）
       b. 給誰用？（目標使用者）
       c. 核心任務有哪些？（至少 2-3 個）
       d. 用什麼技術？（語言/框架，已確定的部分）
       e. 有什麼約束？（不做的事、時間、相容性要求）
    3. 收集完畢後，將資訊寫入 `project-brief.md`（專案根目錄），然後跳轉 `<step_1_gap_analysis>`。

    > 此模式為向後相容，核心流程仍以 Brief 為準。
</fallback_interview>

</protocol_kickoff>

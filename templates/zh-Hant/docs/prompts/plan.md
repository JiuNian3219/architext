<protocol_plan>
  **Trigger**: `/archi.plan <ID> [context]`
  **Goal**: 透過深度架構訪談，定義功能的 Spec/UI/Plan。
  **Input**:
  - `<ID>` (必填): Roadmap 中已存在的任務 ID。須先透過 `/archi.scope` 或 `/archi.inherit` 建立任務。
  - `[context]` (可選): 任務的已知上下文（如使用者需求描述、參考資料、約束條件）。提供時作為 step_2 訪談的前置輸入，減少提問。

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
    1.  **Read Roadmap**: 讀取 `[[__DOCS_DIR__]]/global/roadmap.json`。
        - **Pre-flight**: 檢查 `<ID>` 的 Dep 是否已完成。未完成則拒絕 Plan（除非使用者強制）。
    2.  **Read Vision**: 讀取 `[[__DOCS_DIR__]]/global/vision.md`。
        - 提取北極星指標和設計哲學，後續方案須與此對齊。
    3.  **Read Tech Stack**: `02_tech_stack.md` (技術紅線)。
    4.  [?UI] **Read Design Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`。
    5.  [?Data] **Read Data Model**: `[[__DOCS_DIR__]]/global/data_snapshot.json`。
    6.  **Read Dependency Context** (如有依賴任務):
        - 讀取依賴任務的 `spec.md` (介面契約) 和 `plan.json` (已實作內容)。
        - **Stub 相容**: 如依賴任務的 Spec-Status 為 Stub：
          a. 讀取 stub 中「關聯檔案」列出的原始碼檔案作為補充上下文。
          b. 從程式碼中提取該模組的公共介面/匯出型別。
          c. 將提取結果作為本次規劃的上游介面參考（不修改 stub 本身）。
        - 避免重複定義上游介面，確保對接點精確對齊。

    **Output**: 向使用者輸出 **Feature Context Brief**：
    ```
    ### Feature Context: [功能名稱] ([ID])

    **目標**: [roadmap task 的 goal，如含 [使用者預設] 須高亮標註]
    **上游依賴**: [已完成的依賴任務及其關鍵介面/型別，無則寫「無」]
    **專案特徵**: [已啟用的 UI/Data/CLI/Lib/API 標籤]
    **技術約束**: [來自 02_tech_stack.md 的關鍵紅線]
    **設計哲學**: [來自 vision.md 的北極星指標和設計原則]
    ```
    內部保留完整上下文素材，進入 step_2。
</step_1_load>

<step_2_interview>
    **Role**: 架構師

    ---

    ### Unified Proposal (一次性提案)

    **核心原則**: 將功能設計和架構決策**合併為一次輸出**，使用者一次確認或覆寫即可。

    **Action**:

    #### Part 1: Feature Design (功能設計)

    AI 根據功能性質**自行決定輸出哪些模組**，從以下素材庫中選取適用項：

    | 素材 | 適用場景 |
    |:---|:---|
    | 流程描述（使用者旅程/系統流程/命令流程） | 有多步互動或處理鏈時 |
    | 核心實體與資料 | 涉及新增或修改實體時；已有實體用 `→ ref: data_snapshot.json#EntityName` 引用 |
    | 互動面（頁面/命令/端點/方法） | 有使用者或外部接觸面時 |
    | 已有決策 | goal 含 `[使用者預設]` 時 → 高亮標註，嚴格遵守 |

    **引用規則**:
    - global 中已定義的實體/型別 → `ref: data_snapshot.json#X`，僅描述本功能**新增或修改**的部分
    - 設計哲學/原則 → `ref: vision.md#原則名`，無需複述
    - 上游介面 → `ref: features/<dep_ID>/spec.md#介面名`
    - 已有設計 Token/元件 → `ref: design_tokens.json#preset` / `ref: dictionary.json#component`

    **通用要求**: 用此功能的具體實體名、操作名描述，禁泛化

    #### Part 2: Architecture Recommendations (架構建議)

    對每個適用維度，AI 直接給出**推薦方案**及理由，而非拋出完整選項表。

    **規則**:
    1. 根據專案特徵標籤（UI/Data/CLI/Lib/API）選擇適用維度，略過不適用的
    2. 對每個適用維度：AI 從參考選項庫中選出**最推薦方案**，寫出推薦理由（1-2 句，結合此功能的具體情況）
    3. 僅當某維度存在**兩個以上合理選項且選擇會顯著影響實作**時，才展開選項表讓使用者選擇
    4. 展開的選項表規則不變：3-5 個選項 + `[Z] 自訂`；說明須描述具體行為；AI+/AI- 須為完整句子，禁寫「無」
    5. **功能上下文化（Critical）**: 須用功能設計中確認的實體名、操作名、業務流程來描述選項，禁照搬泛化描述

    #### Output Format

    ```
    ## Feature Proposal: [功能名稱] ([ID])

    ### 功能設計
    [按複雜度級別輸出，見上方 Part 1]

    ### 架構建議
    | 維度 | 推薦 | 理由 |
    |:---|:---|:---|
    | 核心結構 | [推薦選項] | [結合此功能的 1-2 句理由] |
    | 互動模式 | [推薦選項] | [理由] |
    | 錯誤處理 | [推薦選項] | [理由] |
    | ... | ... | ... |

    [僅對需要使用者裁決的維度展開選項表]:
    **[Q<n>] 問題標題**
    > 為什麼需要使用者決定（一句話）

    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A [推薦] | ... | 具體行為（2-3句） | 完整句子 | 完整句子 |
    | B | ... | ... | ... | ... |
    | Z | 自訂 | (請描述) | - | - |

    ---
    > 回覆 **OK** 接受全部建議；或標註要修改的部分，如：
    > - 設計修正: 「註冊不需要電子郵件驗證步驟」
    > - 維度覆寫: 「核心結構=C, 錯誤處理=B D」
    > - 問題回答: 「Q1=B」
    ```

    ---

    ### 參考選項庫（AI 內部使用，不直接輸出給使用者）

    以下為各維度的參考選項庫。AI 在 Part 2 中從中選取推薦方案或展開選項表時引用，
    但須用此功能的具體上下文重寫描述，禁照搬。

    ---

    ### 維度 1: Core Structure (必問)

    根據專案特徵標籤路由到對應選項庫：

    #### [?Data] 資料模型與關係策略
    > 決定此功能的資料如何儲存和組織。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Flat / Single Entity | 所有資料存在單張表/單個檔案中，無外鍵關聯。如「系統設定」一張表，每行存一個使用者的全部設定項。適合實體獨立、欄位固定、不涉及跨表關聯的場景 | 上下文集中在單檔案，AI 產生 CRUD 不需跨檔案追蹤關係，錯誤率最低 | 當資料天然有從屬關係時強行平鋪，會導致欄位冗餘，後續拆分重構成本高 |
    | B | 1:N Relation | 一個父實體擁有多個子實體，透過外鍵關聯。如「使用者→多篇文章」，文章表用 userId 外鍵指向使用者表。適合主從關係明確、子實體依附父實體存在的場景 | 最常見的關係模式，AI 訓練資料充足，產生 JOIN 查詢和級聯操作的準確率高 | 須同時維護兩個 Model 及關聯邏輯，AI 可能遺漏級聯刪除/更新或巢狀序列化 |
    | C | M:N Relation | 兩個實體間多對多關係，需中間表。如「學生↔課程」用 enrollment 中間表連接。適合兩個實體互不從屬但需要關聯的場景 | 中間表結構標準化，關係語義清晰 | 極易遺漏中間表建立和交易邏輯；中間表常需額外欄位（如 enrolledAt），AI 經常忘記處理 |
    | D | Recursive / Tree | 實體自引用形成樹形結構。如「評論回覆評論」、「資料夾巢狀資料夾」，表中 parentId 指向自身。適合層級深度不確定的分類、目錄、評論樹 | 單表即可表達任意深度，Schema 簡潔 | 遞迴查詢/渲染易產生無限迴圈或堆疊溢位，AI 產生的遞迴終止條件常不完整 |
    | E | JSON / EAV | 用 JSON 欄或 Entity-Attribute-Value 模式儲存動態欄位。如「自訂表單」欄位不固定，用 JSON 存使用者定義的資料。適合 Schema 不確定、欄位因使用者/場景而異的需求 | Schema 靈活，新增欄位無需資料庫遷移 | 喪失資料庫級型別校驗和索引能力，AI 無法從 Schema 推斷結構，產生程式碼時易產生執行時型別錯誤 |
    | F | Virtual / Computed | 資料不直接儲存，從其他欄位即時計算。如「訂單總價=商品單價x數量」。適合衍生資料、統計聚合、格式化展示 | 無需資料遷移，資料始終與源保持一致 | 計算邏輯分散在查詢層，AI 易寫出 N+1 查詢或低效聚合語句 |
    | Z | 自訂 | (請描述你的資料結構方案) | - | - |

    #### [?CLI] 輸入/輸出與設定設計
    > 決定此功能如何接收輸入、以什麼形式輸出結果。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Pure Args/Flags | 所有輸入透過命令列參數傳入，如 `cmd --name foo --verbose`。程式解析參數後直接執行，無互動過程。適合自動化腳本呼叫、CI/CD 管道 | 輸入結構明確，AI 可直接從參數定義推導解析程式碼和說明文件 | 參數過多時使用者記憶成本高，複雜巢狀設定難以透過命令列表達 |
    | B | Interactive Prompts | 執行後透過互動式問答引導輸入，依序跳出「專案名稱？」→「選擇範本？」→「確認？」。適合初始化嚮導、設定產生器等需要引導的場景 | 每個 prompt 步驟獨立，AI 可按順序逐一產生處理邏輯 | 須處理 Ctrl+C 取消、回退上一步、預設值等邊界情況，測試需 Mock stdin |
    | C | Hybrid (Args + Prompts) | 優先讀取命令列參數，缺失項才跳互動提示。如 `cmd --name foo` 略過名稱詢問，其餘照常提示。適合同時服務腳本呼叫和手動操作 | 兼顧自動化與互動，是現代 CLI 的最佳實踐 | 須維護參數解析和互動提示兩套邏輯，AI 須確保兩條路徑行為一致 |
    | D | Config File | 從設定檔讀取輸入，如 `cmd --config config.json`。適合參數數量多、需要版本化管理設定的場景 | 設定可用 JSON Schema 嚴格校驗，AI 可基於 Schema 產生解析程式碼 | 須處理檔案不存在、格式錯誤、Schema 版本遷移等邊界情況 |
    | E | Stdin / Pipe | 從標準輸入或管道接收資料，如 `cat data.json | cmd process`。適合資料處理管道、與 Unix 命令組合使用 | 輸入格式可定義清晰的 Parser 契約 | 串流讀取和編碼處理（UTF-8 BOM 等）易出錯，須處理空輸入和超大檔案 |
    | Z | 自訂 | (請描述你的輸入/輸出方案) | - | - |

    #### [?Lib] 公共 API 與型別設計
    > 決定此功能暴露給消費者的介面形態。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Single Function | 匯出一個或少數獨立函式，消費者 `import { fn } from 'lib'` 直接呼叫。適合功能單一、無狀態的工具函式（如格式化、校驗、轉換） | 介面最簡，AI 產生使用範例和單元測試的準確率最高 | 功能擴展時可能導致函式簽章膨脹（參數愈來愈多） |
    | B | Class / Instance | 匯出類別，消費者 `new MyLib(config)` 建立實例後呼叫方法。適合需維護內部狀態、提供多個關聯操作的模組 | 類別的 constructor + methods 結構清晰，AI 易理解物件生命週期 | 繼承層級過深增加上下文複雜度，AI 追蹤 this 綁定易出錯 |
    | C | Builder / Fluent | 透過鏈式呼叫建置設定，如 `lib.create().withName('x').withSize(10).build()`。適合可選設定項多、需要漸進式建置的場景 | TypeScript 下鏈式呼叫可逐步收窄型別，型別安全好 | 鏈式方法的呼叫順序約束和泛型體操複雜，AI 產生型別定義易出錯 |
    | D | Config Object | 接受一個設定物件作主要輸入，如 `init({ name: 'x', plugins: [...] })`。適合初始化參數多且需統一管理的場景 | 設定物件可用 interface/Zod 嚴格定義，AI 從型別推斷行為非常準確 | 設定項過多時文件和校驗邏輯繁重，可選欄位的預設值合併易出錯 |
    | E | Plugin / Middleware | 核心精簡，功能透過外掛/中介軟體擴展。如 Express 中介軟體管道、Vite 外掛系統。適合需要高度可擴展的框架級庫 | 核心程式碼簡單，AI 可獨立產生每個外掛 | 外掛間互動、執行順序和型別安全難以保證，AI 易產生相互衝突的外掛 |
    | Z | 自訂 | (請描述你的 API 設計方案) | - | - |

    #### [?API] 介面契約與路由設計
    > 決定此功能的 API 端點結構和呼叫方式。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | RESTful CRUD | 標準 REST 資源路由：`GET /users` 列表、`POST /users` 建立、`GET /users/:id` 詳情、`PUT/PATCH` 更新、`DELETE` 刪除。適合實體明確、操作可標準化的增刪改查場景 | REST 是最普及的 API 模式，AI 訓練資料極充足，產生路由+控制器準確率最高 | 複雜查詢和跨資源操作用純 REST 表達力有限，容易產生非標準端點 |
    | B | RPC-Style Actions | 面向操作的端點，如 `POST /send-invite`、`POST /calculate-price`。適合業務動作不能簡單映射到 CRUD 動詞的場景 | 端點語義明確，AI 可從動作名直接推斷實作邏輯 | 缺乏統一範式，端點命名易不一致，數量膨脹後難以維護 |
    | C | GraphQL | 單端點 + Schema 查詢語言，客戶端按需請求欄位和關聯。適合前端資料需求多變、需要減少多次請求的場景 | Schema 即文件，強型別定義，前端自由組合查詢 | Resolver 的 N+1 問題和細粒度權限校驗複雜，AI 產生 DataLoader 常有快取 Bug |
    | D | Nested Sub-resource | 巢狀路由表達從屬關係：`GET /users/:id/posts`、`POST /teams/:id/members`。適合資源間有明確父子關係的場景 | 路由結構反映資料關係，AI 可從路由推斷查詢邏輯 | 巢狀超 2 層路由冗長，權限檢查須逐級驗證父資源所有權 |
    | Z | 自訂 | (請描述你的 API 設計方案) | - | - |

    ---

    ### 維度 2: Interaction Pattern (必問)

    #### [?UI] 展示與互動模式
    > 決定使用者看到什麼介面、如何操作。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | CRUD Table/List | 資料以表格或列表展示，使用者可篩選/排序/翻頁，點擊行進入詳情，透過按鈕新增/編輯/刪除。最經典的資料管理模式，適合後台管理、資源列表 | 表格元件是 AI 訓練資料最充足的 UI 模式，產生程式碼的準確率最高 | 大資料量下需分頁+排序+多條件篩選的組合邏輯，互動狀態管理較多 |
    | B | Wizard / Stepper | 將複雜操作拆為多步頁面：第1步填基本資訊 → 第2步選設定 → 第3步確認提交。帶進度條和步驟指示器，支援前後翻頁。適合註冊流程、設定嚮導、多步表單 | 每步狀態獨立明確，AI 可逐個產生 Step 元件 | 跨步驟資料共用/校驗複雜（如第3步需第1步資料），AI 易遺漏步驟間狀態傳遞 |
    | C | Dashboard / Kanban | 以卡片/列形式展示資料，可拖曳卡片在列間移動。如「待辦→進行中→已完成」的看板，點擊卡片展開詳情。適合任務管理、狀態工作流、專案看板 | 視覺直觀，每張卡片是獨立上下文單元 | 拖曳排序依賴文件較差的第三方庫（dnd-kit 等），AI 產生拖曳邏輯幻覺風險高，跨瀏覽器相容問題多 |
    | D | Modal / Drawer | 點擊列表項後跳出浮層（模態框）或側邊滑出面板（抽屜）展示詳情/編輯表單。操作完關閉回到列表，不離開當前頁面。適合詳情檢視/快速編輯不需要獨立頁面的場景 | 上下文局部化，不需要路由跳轉 | Z-index 層疊、Focus Trap（焦點鎖定）、Escape 關閉、背景捲動鎖定等互動細節常出 Bug |
    | E | Infinite Scroll / Feed | 捲動到底部自動載入更多，形成無限資訊流。如社交 Timeline、新聞 Feed、商品瀑布流。使用者不斷下滑，新內容無縫追加。適合內容消費型場景 | 基本的「載入更多」邏輯簡單 | 虛擬捲動（只渲染可視區 DOM）極難寫對，捲動位置恢復和快速捲動白屏 AI 很難處理好 |
    | F | Editor / Canvas | 富文字編輯區或畫布式自由操作區域。使用者自由輸入/繪製/拖曳元素。如文件編輯器、流程圖工具、白板。適合內容創作/可視化編輯 | 功能上限高，使用者自由度大 | Canvas 是指令式 API，比宣告式 DOM 難產生得多；富文字 Selection API 極為複雜，AI 產生品質遠低於普通 UI |
    | Z | 自訂 | (請描述你的互動方案) | - | - |

    #### [?CLI] 使用者互動模式
    > 決定使用者如何與此 CLI 功能互動、看到什麼回饋。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Silent / Batch | 無互動，純靜默執行。成功輸出結果到 stdout，失敗到 stderr。如 grep、jq 等管道工具。適合作為腳本/管道中一環被其他命令組合呼叫 | 實作最簡，無 I/O 副作用，測試只需斷言 stdout 輸出 | 使用者在執行過程中無法獲得進度回饋，不知道程式在做什麼 |
    | B | Progress / Spinner | 執行期間顯示進度條或旋轉動畫，完成後輸出結果摘要。如 npm install 的下載進度條。適合耗時操作需要回饋執行狀態 | 標準模式，clack/ora 等庫支援完善，幾行程式碼即可接入 | 須處理非 TTY 環境降級（CI 中關閉動畫）、終端寬度變化等邊界情況 |
    | C | Interactive Menu | 展示選單讓使用者選擇操作，如 select/multiselect/confirm 互動問答。適合功能入口多、使用者需瀏覽和選擇的場景 | 選單結構明確，AI 可逐個產生選項處理邏輯 | 選單層級過深體驗差，須處理不支援互動的終端回退方案 |
    | D | REPL / Shell | 進入持續互動迴圈：輸入命令→輸出結果→繼續輸入。如 Node.js REPL、資料庫客戶端。適合探索式工具、偵錯器 | 每輪互動獨立，AI 可逐條命令處理 | 須維護工作階段狀態、命令歷史、Tab 補全，實作複雜度高 |
    | E | Watch / Daemon | 持續執行並監聽變化，自動觸發操作。如 tsc --watch、nodemon。適合開發工具、檔案同步、自動建置 | 事件驅動模型清晰，每次觸發獨立處理 | 跨平台檔案監聽相容性、防抖邏輯、優雅退出（SIGINT/SIGTERM）處理難點多 |
    | Z | 自訂 | (請描述你的互動方案) | - | - |

    #### [?API] 客戶端整合模式
    > 決定呼叫方如何接入和使用此 API。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Direct HTTP Call | 客戶端直接發 HTTP 請求呼叫，如 `fetch('/api/users')`。最簡單直接的整合方式，無需額外封裝 | 無額外抽象層，AI 產生請求程式碼最簡單直接 | 型別安全需手動維護，介面變更時客戶端容易失同步，重複程式碼多 |
    | B | SDK / Client Lib | 提供封裝好的客戶端 SDK，呼叫方 `import { api } from 'sdk'` 後用型別化方法呼叫 | 強型別安全，介面變更在編譯期發現 | 須額外維護 SDK 程式碼和版本發布 |
    | C | Code Generation | 從 OpenAPI/GraphQL Schema 自動產生客戶端程式碼和型別定義 | Schema 即合約，型別自動產生零手動維護 | 產生程式碼訂製性有限，Schema 變更需重新產生 |
    | D | Webhook / Event | API 透過 Webhook 回調主動通知客戶端。適合非同步事件驅動場景 | 解耦，非同步通知無需輪詢 | Webhook 的簽章驗證、重試冪等、逾時處理 AI 容易遺漏 |
    | Z | 自訂 | (請描述你的整合方案) | - | - |

    #### [?Lib] 消費者使用模式
    > 決定消費者如何使用此庫的功能。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Import & Call | 直接匯入函式/類別並呼叫：`import { parse } from 'lib'; parse(data)`。最直接的使用方式 | 使用方式最簡，AI 產生範例程式碼和測試準確率最高 | 功能擴展時可能需頻繁修改公共簽章 |
    | B | Register & Use | 先註冊設定再使用：`const app = createApp(config); app.use(plugin); app.start()` | 初始化與使用階段分離，AI 可分階段產生邏輯 | 註冊時序和生命週期約束需清晰文件 |
    | C | Decorator / Annotation | 透過裝飾器宣告行為：`@Route('/users') class UserCtrl {}` | 宣告式程式碼簡潔，意圖清晰 | TS 裝飾器提案仍在演進，AI 可能混淆舊版與新版語法 |
    | Z | 自訂 | (請描述消費者的使用方式) | - | - |

    ---
    ### 維度 3: Data Flow (條件維度)

    **提問條件**: 專案含 [?UI+Data]、[?UI+API] 標籤時提問；純 [?CLI]/[?Lib] 略過。

    #### [?UI] 狀態同步與資料流
    > 資料如何在前端介面和後端之間流轉和同步。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Standard Request | 使用者操作→發請求→等回應→更新介面。經典請求-回應模式 | 原子操作，無狀態，AI 產生 fetch + loading/error 狀態處理最可靠 | 每次操作須等網路往返 |
    | B | Optimistic UI | 使用者操作後立即更新介面，後台同步發請求。服務端失敗才回滾 | 使用者體感極快，互動無卡頓 | 回滾邏輯常被遺忘 |
    | C | Polling / SWR | 定期自動重新取得資料，或視窗聚焦時重新整理 | React Query/SWR 等庫封裝完善 | 輪詢間隔和快取失效策略需平衡 |
    | D | Realtime (Socket/SSE) | 服務端透過 WebSocket 或 SSE 主動推送資料到客戶端 | 延遲最低，資料即時同步 | 斷線重連、心跳保活、訊息順序保證極難正確實作 |
    | E | Local-First / Offline | 資料優先存本地，連網時與服務端同步 | 離線可用 | 衝突解決演算法是高階問題 |
    | F | Background Job | 使用者觸發後立即返回，後台非同步完成 | 主執行緒解耦，API 回應快 | 須額外實作任務佇列、狀態查詢和完成通知 |
    | Z | 自訂 | (請描述你的資料流方案) | - | - |

    ---
    ### 維度 4: Error Handling (必問)
    > 此功能特有的異常和邊界情況如何處理。

    **參考選項庫**（通用，AI 根據專案型別微調措辭）:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Fail Fast / Notify | 遇到錯誤立即中止操作並通知使用者（Toast/Alert/stderr） | 實作最簡單，AI 幾乎不會寫錯 | 使用者體驗偏生硬 |
    | B | Form Validation | 在使用者提交前進行欄位級/表單級校驗 | Zod/Yup Schema 可同時用於校驗和型別推斷 | 複雜校驗規則 AI 容易寫錯 |
    | C | Retry / Recovery | 操作失敗後自動重試或提供手動重試按鈕 | 重試邏輯可封裝為通用工具函式 | 須確保操作冪等 |
    | D | Fallback / Skeleton | 載入失敗或資料為空時顯示降級 UI | 骨架屏是標準 UI 模式 | 須為每個狀態維護並行 UI 結構 |
    | E | Draft / Auto-save | 使用者編輯過程中自動定期儲存草稿 | 儲存邏輯可抽象為通用 Hook | 儲存節流、衝突偵測須仔細處理 |
    | F | Undo / Redo | 操作後支援撤銷/重做 | 提升使用者信心 | 狀態快照和歷史堆疊管理邏輯複雜 |
    | Z | 自訂 | (請描述你的錯誤處理方案) | - | - |

    ---
    ### 維度 5: Access & Scope (條件維度)

    **提問條件**: 專案含 [?Web/API] 標籤時提問權限控制；含 [?Lib] 標籤時提問封裝策略；純 [?CLI] 通常略過。

    #### [?Web/API] 權限控制
    > 誰能執行此功能的操作、看到什麼資料。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Public | 完全公開，無需登入即可存取 | 無需鑑權中介軟體 | 須額外考慮限流防濫用 |
    | B | Authenticated | 僅登入使用者可存取 | 標準 JWT/Session 中介軟體即可實作 | 須處理 token 過期重新整理、多端登入踢出 |
    | C | Owner Only | 僅資源建立者可操作 | 簡單的所有權檢查 | 資源可轉讓或有代理操作時簡單 owner 檢查不夠用 |
    | D | Role Based (RBAC) | 按角色劃分權限 | 權限規則明確可列舉 | 守衛邏輯分散，角色巢狀時權限繼承複雜 |
    | E | Team / Shared | 團隊/組織成員可存取 | 權限邊界以團隊為單位 | 須查詢團隊成員關係表，跨團隊共用進一步複雜化 |
    | F | Tier / Subscription | 按付費等級限制功能 | 規則可設定化，與業務邏輯解耦 | Mock 支付狀態和計費邏輯困難 |
    | Z | 自訂 | (請描述你的權限方案) | - | - |

    #### [?Lib] 封裝與可見性
    > 此功能的程式碼如何組織封裝，對消費者暴露什麼。

    **參考選項庫**:
    | ID | 選項 | 說明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Full Public | 所有功能和型別全部公開匯出 | AI 無需猜測哪些是公開 API | 公開面過大，任何內部重構都可能是 breaking change |
    | B | Facade / Entry Point | 透過單一入口檔案（index.ts）精選匯出公共 API | 公共面小且明確 | 須持續維護匯出列表 |
    | C | Internal / Private | 僅暴露最小公共介面，大量實作標記為 internal | 最小公開面，breaking change 風險最低 | AI 需要修改 internal 程式碼時缺乏上下文 |
    | Z | 自訂 | (請描述你的封裝策略) | - | - |

    ---

    **Goal**: 鎖定 `spec`, `ui`(如適用), `data_snapshot.json`(如適用)。

    **⌨️ INPUT**: 回覆 **OK** 全部接受；或自由文字標註修改項。無需按固定格式。
</step_2_interview>

<step_2_5_refinement>
    **Role**: 諮詢顧問
    **Trigger**: 使用者回覆非 OK，含修正、疑問、覆寫或明顯邏輯衝突。
    **Action**: 不生成文件。融入使用者回饋，刷新 Unified Proposal 重新輸出，等待再次確認。
    - 如是功能設計疑問 → 給出替代方案對比，重新提出設計
    - 如是架構維度疑問 → 結合此功能具體場景解釋差異，更新推薦
    - 如是維度覆寫 → 直接替換推薦並調整相關設計
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系統管理員
    **Constraint**: 在生成 Feature 文件**之前**，須先更新以下全域檔案。

    **Boundary**: 僅註冊**專案業務域**內容。Architext 框架概念（scripts、scaffold、roadmap、plan 等）和框架基礎設施錯誤禁註冊到全域檔案。

    **Action Checklist**:
    1.  **`map.json`**: 在 `directoryMapping` 註冊 `[[__DOCS_DIR__]]/features/<ID>_<Slug>`；在 `logicalTopology` 定義模組職責與依賴。
    2.  **`dictionary.json`**: 提取提案中的**專案業務**新術語填入 `entities`/`verbs`；註冊新共用工具到 `utilities`；註冊新公共元件到 `components`。
    3.  [?Data] **`data_snapshot.json`**: 根據架構建議中核心結構的選擇新增/修改 Schema。禁寫「待定」，須寫出欄位名和型別。
    4.  **`error_codes.json`**: 根據架構建議中錯誤處理的選擇註冊新**業務**錯誤碼。框架腳本錯誤由 exit code + stderr 處理，禁註冊。

    **Output**: 上述檔案的變更 Diff (簡要)。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文件工程師
    **Input**: 確認的 Unified Proposal（功能設計 + 架構建議）+ 已更新的全域上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下生成標準文件。

    **1. `spec.md`** (必須):
    - 範本: `templates/spec.template.md`。
    - 基於確認的功能設計和架構建議，轉化為 Gherkin Scenarios。
    - 每個 Scenario 須對應功能設計中的具體流程步驟或異常路徑，禁憑空編造場景。
    - 若為上游任務，須包含明確的 Interface/Type 定義。

    **2. `ui.md` + `ui.preview.html`** [?UI]:
    - **`ui.md`**: 範本 `templates/ui.template.md`。基於架構建議中互動模式的選擇轉化為 ITP v3.0 描述；引用 `design_tokens.json` 中的 componentPresets。
    - **`ui.preview.html`**: 範本 `templates/ui.preview.template.html`。基於 `ui.md` 元件樹生成可瀏覽器開啟的視覺預覽；須包含所有狀態(Default/Loading/Empty/Error)；使用 Tailwind CDN + design_tokens 中的實際顏色值。須在生成後提示使用者瀏覽器開啟確認視覺效果。

    **3. `plan.json`** (必須):
    - 範本: `templates/plan.template.json`。
    - 根據專案型別動態調整 Phase；確保每個 Task 上下文自包含。
    - 任務描述中明確 "Additive Only" + "Respect Unknowns"。
    - **`decisions`**: 按各維度填寫；`choice` 支援多選（如 `A B`，空格分隔）、自訂（`Z: …`）；`rationale` 須填寫理由，供 code 階段參照，禁留空。
    - **`notes`**: 每個 task 的 `notes` 須填寫執行時速記（範圍、spec 段落引用、關鍵約束），供 `/archi.code` 階段精確定位，禁留空。
    - 生成後執行 `npx archi render` 生成可讀的 `.md` 視圖。
</step_4_generate>

<step_5_audit>
    **Role**: 首席審計官
    **Checklist**:
    1.  **Design Fidelity**: Spec 中的 Scenarios 是否完整覆蓋確認的功能設計（流程步驟和異常路徑）？
    2.  **Tech Consistency**: 是否用了未宣告技術？
    3.  **Data Integrity**: Scenario 中的實體和欄位是否與確認的核心實體一致？
    4.  **Error Handling**: 是否覆蓋架構建議中錯誤處理的選擇？
    5.  **AX Compliance**: 是否遵守 Anti-Clobbering 和 Interface Stability？

    如有問題則靜默修正；嚴重問題標記 `⚠️ Risk Warning`。
</step_5_audit>

<step_6_signoff>
    **Action**:
    1.  執行 `npx archi task --check` 驗證 Roadmap 一致性。
    2.  執行 `npx archi task <ID> --status active` 標記任務為進行中。
    3.  輸出總結。

    **Output**: Feature 定義摘要，含架構建議確認表（各維度最終選擇及理由）和 Next Steps 表格。
</step_6_signoff>

</protocol_plan>

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
      3.  **Rich Context**: 每個選項必須包含：簡述、適用場景、Pros/Cons、技術影響。
      4.  **Audit-Gated**: 只有通過了虛擬審計員檢查的文件，才能交付給使用者。
      5.  **Frontmatter Preservation**: 嚴禁刪除或修改現有檔案的 YAML Frontmatter。
      6.  **Project-Type Adaptive**: 問題和選項必須根據專案類型（Web/CLI/Backend/Library/Mobile 等）動態調整。
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
    - 每個選項必須包含：**簡述** | **適用場景** | **Pros** | **Cons** | **技術影響**。
    - 問題必須根據專案類型動態調整（不適用的問題可跳過或替換）。

    ---
    
    **Q1. Data & Logic Architecture (資料與邏輯架構)**
    > *Context*: 決定功能的核心資料結構和業務邏輯組織方式。
    
    **Web/Backend 專案範例**:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Flat Table** | 單表扁平結構 | 簡單 CRUD，無複雜關聯 | 查詢簡單，效能好 | 難以擴充複雜關係 | 無需 ORM 進階特性 |
    | **B. Relational** | 關聯式多表設計 | 有明確實體關係 | 資料完整性，可擴充 | 查詢複雜，需 JOIN | 需要 Migration 工具 |
    | **C. Nested/Tree** | 遞迴樹狀結構 | 評論、分類、組織架構 | 支援層級關係 | 遞迴查詢效能 | 需要 CTE 或 Adjacency List |
    | **D. Event Sourcing** | 事件溯源 | 需要完整審計、撤銷 | 完整歷史，可回溯 | 複雜度高，儲存成本 | 需要 Event Store |
    | **E. Document/NoSQL** | 文件型/JSON 儲存 | 半結構化資料，靈活 Schema | 靈活，無 Migration | 一致性弱，查詢受限 | MongoDB/DynamoDB |
    | **F. Hybrid** | 混合方案 | 核心關聯式 + 擴充文件 | 兼顧兩者優勢 | 複雜度最高 | 多資料來源管理 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    **CLI/Library 專案範例**:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. In-Memory** | 純記憶體資料結構 | 無狀態命令，一次性執行 | 簡單，無依賴 | 無持久化 | 僅需 std 庫 |
    | **B. Config File** | 設定檔儲存 | 使用者設定、狀態持久化 | 簡單持久化 | 併發問題，格式限制 | TOML/YAML/JSON 解析 |
    | **C. SQLite Embedded** | 嵌入式資料庫 | 複雜查詢，大量資料 | 完整 SQL 支援 | 增加二進位體積 | 需要 SQLite 綁定 |
    | **D. Key-Value Store** | 鍵值儲存 | 簡單快取，快速尋找 | 極簡 API | 不支援複雜查詢 | RocksDB/sled/redb |
    | **E. Plugin System** | 外掛化資料來源 | 支援多種後端 | 可擴充，靈活 | 介面設計複雜 | Trait/Interface 抽象 |
    | **F. External Service** | 外部服務依賴 | 需要遠端資料 | 資料集中管理 | 網路依賴，需處理離線 | HTTP Client/gRPC |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    ---

    **Q2. Interface & Presentation (介面與展示層)** 
    > *Context*: 決定功能如何與使用者/外部系統互動。
    > **Note**: 根據專案類型，此問題的含義不同。

    **Web 專案 (UI)** - 元件拆分與佈局:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Inline Block** | 嵌入式元件 | 功能作為頁面一部分 | 直觀，上下文完整 | 佔用頁面空間 | 無額外路由 |
    | **B. Modal/Dialog** | 彈窗覆蓋層 | 臨時操作，不離開當前頁 | 焦點集中，輕量 | 遮擋內容，體驗中斷 | 需要彈窗管理 |
    | **C. Drawer/Sidebar** | 側邊滑出面板 | 詳情展示，不離開主視圖 | 保持上下文 | 響應式設計複雜 | 需要佈局系統支援 |
    | **D. Full Page** | 獨立頁面 | 複雜流程，需要專注 | 完整空間，獨立 URL | 需要導航，跳轉成本 | 需要路由配置 |
    | **E. Split View** | 左右/上下分欄 | 對比、預覽場景 | 同時展示多資訊 | 螢幕空間要求高 | 響應式複雜 |
    | **F. Tab/Accordion** | 標籤頁/折疊面板 | 多面板切換 | 節省空間 | 隱藏內容不可見 | Tab 元件依賴 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    **CLI 專案** - 輸出與互動方式:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Plain Text** | 純文字輸出 | 簡單資訊，可管道處理 | 通用，可腳本化 | 資訊層次不清 | 無額外依賴 |
    | **B. Colored Output** | 彩色文字 | 人類可讀，區分資訊級別 | 可讀性好 | 不支援無色終端 | chalk/picocolors |
    | **C. Table/Grid** | 表格展示 | 結構化資料展示 | 整齊，對齊 | 寬度限制 | cli-table/tty-table |
    | **D. Interactive TUI** | 互動式終端 UI | 複雜互動，多步驟 | 豐富體驗 | 開發複雜 | ink/blessed/ratatui |
    | **E. Progress/Spinner** | 進度指示器 | 長時間操作 | 使用者回饋好 | 增加複雜度 | ora/indicatif |
    | **F. Structured Output** | JSON/YAML 輸出 | 機器消費，API 整合 | 可解析，整合友好 | 人類不友好 | 序列化庫 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    **Backend/API 專案** - 介面協議:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. REST API** | 標準 RESTful 介面 | 通用場景，第三方整合 | 標準化，工具豐富 | 過度獲取/獲取不足 | OpenAPI 文件 |
    | **B. GraphQL** | 靈活查詢語言 | 複雜資料關係，多客戶端 | 精確獲取，類型安全 | 學習曲線，N+1 問題 | GraphQL Server |
    | **C. gRPC** | 高效能 RPC | 微服務通訊，低延遲 | 高效能，類型安全 | 偵錯困難，瀏覽器受限 | Protobuf 定義 |
    | **D. WebSocket** | 即時雙向通訊 | 即時更新，聊天，協作 | 即時推送 | 連線管理複雜 | WS 伺服器支援 |
    | **E. Message Queue** | 非同步訊息佇列 | 解耦，削峰，最終一致 | 高可用，可擴充 | 延遲，複雜度 | RabbitMQ/Kafka |
    | **F. Server-Sent Events** | 伺服器推送 | 單向即時更新 | 簡單，HTTP 相容 | 僅單向，連線限制 | SSE 支援 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    **Library 專案** - API 設計風格:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Builder Pattern** | 鏈式建構器 | 複雜物件配置 | 可讀性好，漸進式 | 程式碼量增加 | 需要額外類型 |
    | **B. Fluent API** | 流式調用 | DSL 風格介面 | 表達力強 | 偵錯困難 | 方法返回 self |
    | **C. Functional** | 函數式 API | 無狀態，可組合 | 可測試，無副作用 | 學習曲線 | 高階函數支援 |
    | **D. Object-Oriented** | 傳統 OOP | 熟悉模式，封裝狀態 | 直觀，IDE 支援好 | 繼承複雜度 | 類別/介面設計 |
    | **E. Macro/DSL** | 巨集/領域語言 | 減少樣板，提高表達力 | 簡潔，專用 | 偵錯困難，編譯時間 | 巨集系統支援 |
    | **F. Callback/Event** | 回調/事件驅動 | 非同步處理，擴充點 | 靈活，可擴充 | 回調地獄風險 | 事件系統設計 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    ---

    **Q3. State & Data Flow (狀態與資料流)**
    > *Context*: 決定資料如何在系統中流動、快取和同步。

    **Web 專案**:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Server-Only** | 純服務端狀態 | 簡單 CRUD，SEO 優先 | 簡單，無客戶端複雜度 | 互動回應慢 | SSR/MPA 架構 |
    | **B. Client Cache** | 客戶端快取 | 頻繁讀取，減少請求 | 回應快，減輕伺服器 | 一致性問題 | React Query/SWR |
    | **C. Optimistic UI** | 樂觀更新 | 寫操作多，體驗優先 | 即時回饋，體驗好 | 復原複雜 | 狀態復原邏輯 |
    | **D. Real-time Sync** | 即時同步 | 協作、聊天、通知 | 資料即時 | 連線管理，成本高 | WebSocket/Firebase |
    | **E. Local-First** | 本地優先 | 離線支援，PWA | 離線可用，快速 | 衝突解決複雜 | IndexedDB/CRDT |
    | **F. Hybrid** | 混合策略 | 按場景選擇 | 靈活，最佳化 | 複雜度最高 | 多策略管理 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    **CLI/Backend/Library 專案**:
    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Stateless** | 無狀態 | 純函數，每次獨立執行 | 簡單，可平行 | 無法快取計算 | 純函數設計 |
    | **B. Thread-Local** | 執行緒本地狀態 | 多執行緒，隔離狀態 | 執行緒安全 | 跨執行緒共享困難 | TLS/執行緒池 |
    | **C. Shared Mutable** | 共享可變狀態 | 需要跨元件共享 | 直接，簡單 | 競態風險 | Mutex/RwLock |
    | **D. Actor Model** | Actor 模型 | 高併發，訊息傳遞 | 無鎖，可擴充 | 學習曲線 | Tokio/Actix |
    | **E. Immutable** | 不可變狀態 | 函數式，無副作用 | 執行緒安全，可推理 | 效能（複製） | 持久化資料結構 |
    | **F. Global Singleton** | 全域單例 | 設定、日誌、連線池 | 簡單訪問 | 測試困難，耦合 | 懶載入/OnceCell |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    ---

    **Q4. Error Handling & Resilience (錯誤處理與彈性)**
    > *Context*: 決定系統如何處理異常、失敗和邊界情況。

    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Exception-Based** | 異常拋出 | 傳統語言，簡單流程 | 直觀，跳出控制流 | 隱式控制流，效能 | try/catch/throw |
    | **B. Result Type** | Result/Either 類型 | 顯式錯誤處理，類型安全 | 強制處理，類型安全 | 程式碼冗長 | Rust Result/TS fp-ts |
    | **C. Error Code** | 錯誤碼返回 | C 風格，底層庫 | 效能好，簡單 | 易忽略，語意弱 | 錯誤碼列舉定義 |
    | **D. Fallback/Default** | 降級預設值 | 非關鍵路徑，容錯優先 | 不中斷，使用者友好 | 隱藏問題 | 預設值策略 |
    | **E. Retry with Backoff** | 重試與退避 | 網路請求，臨時故障 | 自癒能力 | 延遲，複雜度 | 重試庫/指數退避 |
    | **F. Circuit Breaker** | 熔斷器 | 微服務，防級聯故障 | 快速失敗，保護下游 | 配置複雜 | 熔斷器庫 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    ---

    **Q5. Security & Authorization (安全與權限)**
    > *Context*: 決定功能的存取控制和安全策略。

    | Option | 簡述 | 適用場景 | Pros | Cons | 技術影響 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Public/Open** | 完全開放 | 公開資源，無敏感資料 | 簡單，無鑑權開銷 | 無存取控制 | 無需鑑權中介軟體 |
    | **B. API Key** | API 金鑰認證 | 服務間調用，簡單場景 | 簡單實現 | 金鑰洩露風險 | 金鑰管理 |
    | **C. Session-Based** | 會話認證 | 傳統 Web 應用 | 成熟，控制力強 | 服務端狀態，擴充難 | Session 儲存 |
    | **D. JWT Token** | JWT 無狀態令牌 | 分散式，微服務 | 無狀態，可擴充 | Token 撤銷困難 | JWT 庫/驗證 |
    | **E. OAuth2/OIDC** | OAuth2/OpenID | 第三方登入，SSO | 標準化，安全 | 複雜，學習曲線 | OAuth Provider |
    | **F. RBAC/ABAC** | 角色/屬性權限 | 複雜權限控制 | 細粒度控制 | 設計複雜 | 權限模型設計 |
    | **Z. 自定義** | (請描述) | - | - | - | - |

    ---

    **Goal**: 鎖定 `1.spec` (邏輯), `2.ui` (視覺，如適用), `04_data` (Schema，如適用) 的具體內容。
    **Bridge**: "✅ Options Generated. 請架構師（使用者）根據上述詳細對比做出決策..."
    
    **⌨️ INPUT (管道回覆)**:
    > **格式**: `Q1 | Q2 | Q3 | Q4 | Q5`
    > **範例**: `B | A | C | B | D`
    > **自定義範例**: `B | Z="命令行 + JSON 雙輸出" | C | B | A`
</step_2_interview>

<step_3_global_sync>
    **Role**: 系統管理員 (System Admin)
    **Constraint**: 在生成 Feature 文件**之前**，必須先更新以下全域檔案。

    **Action Checklist**:
    1.  **Update `01_map.md`**:
        - 在 `3. Directory Mapping` 註冊 `[[__DOCS_DIR__]]/features/<ID>_<Name>`。
        - 在 `4. Logical Topology` 定義模組職責與依賴。
</step_3_global_sync>
</protocol_plan>

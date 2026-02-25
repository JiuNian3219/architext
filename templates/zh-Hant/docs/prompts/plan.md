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
        - **Pre-flight**: 僅讀取 `<ID>` 對應的任務條目及其直接 deps 的 `id/title/status`；檢查 deps 是否已完成，未完成則拒絕 Plan（除非使用者強制）。無需載入其他任務資料。
    2.  **Read Vision**: 讀取 `[[__DOCS_DIR__]]/global/vision.md` — 僅提取北極星指標和設計哲學段落；其餘章節跳過。
    3.  **Read Tech Stack**: `02_tech_stack.md` (技術紅線 + **Section 9 專案約定**)。
        - 提取 Section 9 中的全域架構約定（Error Handling / Data Flow / Auth & Access），供 step_2 約定繼承使用。
    4.  [?UI] **Read Design Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`。
    4.5 [?UI] **Read UI Context**: `[[__DOCS_DIR__]]/global/ui_context.md`（如存在）。
        - 從畫面索引中定位本功能對應的畫面 ID（如 S-03）及其負責的狀態。
        - 鎖定畫面範圍，供 step_4 生成 `ui.md §1` 時直接填入，禁自行發明新畫面 ID。
        - 若 `ui_context.md` 不存在 → 跳過，`ui.md` 按完整 ITP 格式填寫。
    5.  [?Data] **Read Data Model**: `[[__DOCS_DIR__]]/global/data_snapshot.json`。
    6.  **Read Dependency Context** (如有依賴任務):
        - 僅讀依賴任務 `spec.md` 的 Interface/Type 定義段（`## Interface` 或 `## Types` 章節）；不讀 Scenarios 等其餘內容。
        - 僅當當前 spec/plan 出現 `ref: tasks/<dep_id>/spec.md#X` 引用時執行；無引用時跳過。
        - **Stub 相容**: 如依賴任務的 Spec-Status 為 Stub，從 stub「關聯檔案」提取原始碼，讀入口檔案提取公共介面/匯出型別，作為上游介面參考。
        - 避免重複定義上游介面，確保對接點精確對齊。

    **Output**: 向使用者輸出 **Task Context Brief**：
    ```
    ### Task Context: [功能名稱] ([ID])

    **目標**: [roadmap task 的 goal，如含 [使用者預設] 須高亮標註]
    **上游依賴**: [已完成的依賴任務及其關鍵介面/型別，無則寫「無」]
    **專案特徵**: [已啟用的 UI/Data/CLI/Lib/API 標籤]
    **技術約束**: [來自 02_tech_stack.md 的關鍵紅線]
    **設計哲學**: [來自 vision.md 的北極星指標和設計原則]
    **專案約定**: [來自 02_tech_stack.md §9 — Error Handling: X | Data Flow: X | Auth: X，無則寫「未設定」]
    ```
    內部保留完整上下文素材，進入 step_2。
</step_1_load>

<step_1_5_complexity>
    **Role**: 產品顧問
    **Action**: 評估功能複雜度，決定是否走完整 step_2 流程：

    **① 粒度紅線檢查（優先於複雜度判定）**：

    | 指標 | 上限 |
    |:---|:---|
    | 預估 spec.md Scenario 數 | ≤ 6 個 |
    | 預估 plan.json Phase 數 | ≤ 4 個 |

    > 預估方法：根據 step_1 載入的 roadmap task goal 和依賴上下文，快速列舉核心行為路徑數量。超出上限即觸發，無需精確計算。

    **② 複雜度判定（粒度通過後執行）**：

    | 信號 | 判定 | 流程 |
    |:---|:---|:---|
    | 無依賴 + 無新實體 + 無架構決策 + 預估 ≤3 tasks | **Simple** | 跳過 step_2 訪談，直接生成 spec + plan |
    | 有依賴 或 有新實體 或 需架構決策 | **Standard** | 正常執行 step_2 Unified Proposal |

    **Simple 模式**:
    - 跳過 5 維度架構建議和 User Confirm Gate
    - spec 精簡為 1-2 個 Gherkin 場景
    - plan 精簡為單一 Phase
    - signoff 時確認（取代 step_2 的 Gate）
</step_1_5_complexity>

<step_2_interview>
    **Role**: 架構師

    ---

    ### Unified Proposal (一次性提案)

    **核心原則**: 將功能設計和架構決策**合併為一次輸出**，使用者一次確認或覆寫即可。

    **Action**:

    #### Part 1: Task Design (功能設計)

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
    - 上游介面 → `ref: tasks/<dep_ID>/spec.md#介面名`
    - 已有設計 Token/元件 → `ref: design_tokens.json#preset` / `ref: dictionary.json#component`

    **通用要求**: 用此功能的具體實體名、操作名描述，禁泛化


    #### Part 2: Architecture Recommendations (架構建議)

    [[SKILL: 按 `archi-plan-options` Skill 的三步選用邏輯（慣例繼承 → 標籤路由 → 推薦 vs 展開），從五個維度的選項庫中為本功能生成架構建議]][[NO-SKILL: （Skill 未安裝：請閱讀 `[[__DOCS_DIR__]]/skills/archi-plan-options/SKILL.md` 並遵循其三步選用邏輯執行）]]

    展開 Q-table 時，格式遵循 [[SKILL: `archi-interview-protocol` Skill 的標準輸出格式]][[NO-SKILL: `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md`]]。

    #### Output Format

    ```
    ## Task Proposal: [功能名稱] ([ID])

    ### 功能設計
    [按複雜度級別輸出，見上方 Part 1]

    ### 架構建議
    | 維度 | 推薦 | 來源 | 理由 |
    |:---|:---|:---|:---|
    | 核心結構 | [推薦選項] | 功能推薦 | [結合此功能的 1-2 句理由] |
    | 互動模式 | [推薦選項] | 功能推薦 | [理由] |
    | 錯誤處理 | [專案約定值] | 專案約定 | ref: 02_tech_stack.md §9 |
    | ... | ... | ... | ... |

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
    **Constraint**: 在生成 Task 文件**之前**，須先更新以下全域檔案。

    **Boundary**: 僅註冊**專案業務域**內容。Architext 框架概念（scripts、scaffold、roadmap、plan 等）和框架基礎設施錯誤禁註冊到全域檔案。

    **Action Checklist**:
    1.  **`map.json`**: 在 `directoryMapping` 註冊 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>`；在 `logicalTopology` 定義模組職責與依賴。
    2.  **`dictionary.json`**: 提取提案中的**專案業務**新術語填入 `entities`/`verbs`；註冊新共用工具到 `utilities`；註冊新公共元件到 `components`。
    3.  [?Data] **`data_snapshot.json`**: 根據架構建議中核心結構的選擇新增/修改 Schema。禁寫「待定」，須寫出欄位名和型別。
    4.  **`error_codes.json`**: 根據架構建議中錯誤處理的選擇註冊新**業務**錯誤碼。框架腳本錯誤由 exit code + stderr 處理，禁註冊。
    5.  **`map.json` featureRelations**: 判斷本 Task 是否屬於「聚合型 Task」——即其核心職責是**列舉、彙總或動態反映**其他一類 Task（如「列出所有命令」「彙總所有頁面入口」「註冊所有路由」）。若是，在 `featureRelations` 中追加一條記錄：
        ```json
        {
          "aggregator": "<本 Task ID 或檔案路徑>",
          "sources": "<一句話描述聚合來源範圍，如「所有 CLI 命令類 Task」>",
          "evidence": "<依據，如「spec.md §X 描述本 Task 會動態列出所有 Y 類 Task」>",
          "checkNote": "此類 Task 新增或刪除時，檢查 <aggregator> 是否需要同步"
        }
        ```
        若非聚合型 Task，跳過此步。

    **Output**: 上述檔案的變更 Diff (簡要)。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文件工程師
    **Input**: 確認的 Unified Proposal（功能設計 + 架構建議）+ 已更新的全域上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/` 下生成標準文件。

    **1. `spec.md`** (必須):
    - 範本: `templates/spec.template.md`。
    - 基於確認的功能設計和架構建議，轉化為 Gherkin Scenarios。
    - 每個 Scenario 須對應功能設計中的具體流程步驟或異常路徑，禁憑空編造場景。
    - 若為上游任務，須包含明確的 Interface/Type 定義。

    **2. `ui.md`** [?UI]:
    - 範本 `templates/ui.template.md`。
    - **有 `ui_context.md`（主路徑）**:
      1. **UI 偏差檢查**（寫 `ui.md` 前必須執行）：對比 step_2 確認的功能設計與 `ui_context.md` 中的畫面索引，識別偏差：

         | 偏差類型 | 判定標準 | 處理方式 |
         |:---|:---|:---|
         | 無偏差 | 畫面索引與設計一致 | 直接寫 `ui.md`，引用畫面 ID |
         | 輕微增量 | 新增狀態/彈窗/局部區域，不改整體布局 | 呼叫 `archi-ui-wireframe` Skill（Plan 細化模式）更新 `ui_concept.html` + `ui_context.md`，在 `ui.md` 注明 `MODIFIED: S-XX` |
         | 結構性偏差 | 布局重構、新增獨立畫面、流程路徑變化 | **暫停**，向使用者輸出偏差說明，等待 **OK** 後呼叫 Skill 更新 `ui_concept.html` + `ui_context.md`，再寫 `ui.md` |

      2. 完成偏差處理後，按 `ui.template.md` 填寫畫面範圍聲明和差異元件。
    - **無 `ui_context.md`（降級路徑）**: 按完整 ITP v3.0 描述元件樹，引用 `design_tokens.json` Token 定義。

    **3. `plan.json`** (必須):
    - 範本: `templates/plan.template.json`。
    - 根據專案型別動態調整 Phase；確保每個 Task 上下文自包含。
    - 任務描述中明確 "Additive Only" + "Respect Unknowns"。
    - **`decisions`**: 按各維度填寫；`choice` 支援多選（如 `A B`，空格分隔）、自訂（`Z: …`）；`rationale` 須填寫理由，供 code 階段參照，禁留空。
    - **`notes`**: 每個 task 的 `notes` 須填寫：`[範圍] · [spec 引用] · [關鍵約束] · 驗證: [具體操作]`；供 `/archi.code` step_4 精確定位並執行 e2e，禁留空。
      > 示例：`實作 POST /auth/login · spec §3.1 · JWT 禁含 password · 驗證: curl POST /auth/login 返回 200 + token 欄位`
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
    **Terminal Gate** (禁止跳過，須在輸出總結前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | 無 ERROR 級問題 |
    | 2 | `npx archi task <ID> --status active` | 任務已標記為進行中 |
    | 3 | `npx archi render` | `.md` 視圖生成完成 |

    **Action** (Gate 通過後):
    1.  輸出總結。

    **Output**: Task 定義摘要，含架構建議確認表（各維度最終選擇及理由）和 Next Steps 表格。
</step_6_signoff>

</protocol_plan>

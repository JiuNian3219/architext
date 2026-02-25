<protocol_inherit>
  **Trigger**: `/archi.inherit`
  **Phase**: Legacy Adoption
  **Goal**: 逆向分析已有程式碼儲存庫，生成 Architext 文件骨架，將專案納入框架管理。

<meta>
    <style>Analytical, Systematic, Evidence-Based</style>
    <language>繁體中文</language>
    <principles>
      1.  **Code-Driven**: 以程式碼為唯一真相源，禁憑空推測功能。
      2.  **AI-Native Perspective**: 分析從 AI Agent 視角撰寫。關注：Context Locality、Type Safety、Module Boundaries。
      3.  **User Agency First**: AI 的分析須經使用者確認。程式碼解讀有歧義時詢問使用者，禁擅自決定。
      4.  **Minimal Token**: 優先讀配置和入口檔案，避免逐行掃描所有程式碼。
      5.  **Option Z Everywhere**: 補充提問須包含 `[Z] 自訂`。
    </principles>
</meta>

<step_0_recon>
    **Role**: 情報分析官
    **Action**:
    1. 讀取專案根配置檔案（自動識別型別）：

       | 語言/生態 | 配置檔案 |
       |:---|:---|
       | Node.js | package.json, tsconfig.json |
       | Rust | Cargo.toml |
       | Go | go.mod |
       | Python | pyproject.toml, requirements.txt |
       | Java | pom.xml, build.gradle |
       | 其他 | 以根目錄配置檔案為準 |

    2. 讀取 README.md（如存在）。
    3. 掃描目錄結構（頂層 + 核心原始碼目錄兩層深度）。
    4. 推斷專案特徵標籤（UI / Data / CLI / Lib / API — 由目錄結構、依賴和配置推斷）。
    5. 識別入口檔案和核心模組。

    **Output**: 內部摘要（不輸出給使用者），進入 step_1。
</step_0_recon>

<step_1_analysis>
    **Role**: 系統分析師
    **掃描策略**: 中度掃描 — 讀每個模組的入口檔案和核心業務檔案，提取主要流程鏈路。禁逐檔案遍歷。

    **Action**:
    1. 對每個識別出的功能模組：
       - 讀入口檔案 + 1-2 個核心業務檔案
       - 提取主要流程（使用者操作 → 系統處理 → 結果）
       - 記錄關聯檔案路徑
    2. 對共享/基建程式碼（utils, middleware, config）：
       - 僅記錄目錄和職責，不作為功能模組
    3. 從程式碼中提取領域術語和命名慣例。

    **Output**: 向使用者輸出結構化分析報告：
    ```
    ### 程式碼分析報告
    > **專案**: [名稱] | **型別**: [UI/Data/CLI/Lib/API] | **規模**: ~[檔案數] 檔案, [目錄數] 目錄

    **技術棧**:
    | 類別 | 選型 |
    |:---|:---|
    | 語言 | ... |
    | 框架 | ... |
    | 建置 | ... |
    | 測試 | ... |
    | 部署 | ... |

    **架構模式**: [推斷] — [依據]

    **功能模組清單**:
    | # | 模組 | 原始碼位置 | 職責 | 關鍵流程 |
    |:---|:---|:---|:---|:---|
    | 1 | [名稱] | [路徑] | [一句話] | [流程1], [流程2] |

    **共享基建**:
    | 目錄 | 職責 |
    |:---|:---|
    | [路徑] | [描述] |

    **領域術語**: [術語列表]

    **AI 不確定項** (如有):
    - [歧義項]
    ```

    **Gate**: 使用者確認或修正。未確認禁進入 step_2。
</step_1_analysis>

<step_2_supplementary>
    **Role**: 產品顧問
    **Trigger**: 僅當 step_1 有 AI 無法確定的項時執行。無歧義則略過。

    **Action**: 以選擇題形式詢問歧義項。
    - 每題 3-5 選項 + `[Z] 自訂`，AI 推薦項標 `[推薦]`。
    - 總問題數控制在 3 個以內。

    常見歧義：
    - 架構模式無法確認
    - 某目錄職責不明確
    - vision 資訊（北極星指標、設計哲學）程式碼中無法推斷

    **Output Format**:
    ```
    ### 補充確認

    **[Q1] 問題標題**
    > 為什麼需要這個資訊

    | ID | 選項 | 說明 |
    |:---|:---|:---|
    | A [推薦] | ... | ... |
    | B | ... | ... |
    | Z | 自訂 | (請描述) |

    ---
    **INPUT**: `Q1答案 | Q2答案 | ...`
    ```
</step_2_supplementary>

<step_3_constitution>
    **Role**: 首席架構師
    **Input**: Step 1 分析報告 + Step 2 補充（如有）。
    **Action**: 一次性生成專案文件骨架。

    ### 資訊路由規則

    > 規則檔案（`02_tech_stack`、`90_custom_rules` 等）已由 IDE 注入當前上下文，AI 已知其路徑，直接寫入即可。

    | 程式碼中的資訊 | 目標檔案 |
    |:---|:---|
    | README 專案描述、目標使用者、特性列表 | `[[__DOCS_DIR__]]/global/vision.md` |
    | 依賴清單、配置檔案、程式碼模式 | 規則檔案 `02_tech_stack` |
    | 目錄結構、模組依賴、使用者旅程 | `[[__DOCS_DIR__]]/global/map.json` |
    | 領域術語、縮寫、命名慣例 | `[[__DOCS_DIR__]]/global/dictionary.json` |
    | eslint/prettier 等已有規範 | 規則檔案 `90_custom_rules` |
    | 程式碼中的錯誤碼定義 | `[[__DOCS_DIR__]]/global/error_codes.json` |
    | [?UI] CSS 變數/主題配置 | `[[__DOCS_DIR__]]/global/design_tokens.json` |
    | [?Data] Schema/Migration 檔案 | `[[__DOCS_DIR__]]/global/data_snapshot.json` |

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - 從 README + 專案配置推導
    - 無法推導的項標註 `(AI 補全 — 建議使用者審查)`
    - 禁保留範本佔位符

    ### 3.2 Tech Stack (規則檔案 `02_tech_stack`)
    - 已有依賴/配置 → 直接寫入
    - 程式碼中可見的規範（命名、結構） → 寫入 Coding Standards
    - 須填充完整 Section 1-8

    ### 3.3 Custom Rules (規則檔案 `90_custom_rules`)
    - 從 eslint/prettier/editorconfig 等提取規則
    - 從程式碼模式中識別團隊慣例（如 named export 偏好、async/await 風格）

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)

    **結構**:
    ```json
    {
      "version": 1,
      "projectStatus": "active",
      "lastUpdated": "<date>",
      "phases": [
        {
          "id": "phase-0",
          "name": "Legacy",
          "tasks": [
            {
              "id": "LEG-01",
              "title": "<模組名>",
              "status": "done",
              "goal": "<一句話摘要>。詳見 tasks/LEG-01_<Slug>/spec.md",
              "deps": [],
              "tag": "Legacy",
              "slug": "<Slug>"
            }
          ]
        },
        { "id": "phase-1", "name": "Infrastructure", "tasks": [] },
        { "id": "phase-2", "name": "Core Features", "tasks": [] }
      ]
    }
    ```

    **規則**:
    - 功能模組 → `phase-0: Legacy`，status `done`，tag `Legacy`，ID 前綴 `LEG-`
    - 共享/基建程式碼不進 roadmap，僅進 map.json directoryMapping
    - phase-1/2 保留空骨架
    - LEG 間如有依賴關係須在 deps 中體現

    ### 3.5 Task Stub Specs

    為每個 LEG 任務建立 `[[__DOCS_DIR__]]/tasks/LEG-xx_<Slug>/spec.md`：

    ```markdown
    # LEG-xx: [Title]

    > **Spec-Status**: Stub
    > **Source**: 逆向分析自 [原始碼路徑]

    ## 概述
    [一段話描述]

    ## 關鍵流程
    1. **[流程名]**: [A] → [B] → [C]
    2. **[流程名]**: [A] → [B] → [C]

    ## 關聯檔案
    - [角色]: `[路徑]`
    - [角色]: `[路徑]`
    ```

    > Stub 是起點，非終態。後續透過 `/archi.edit` 觸發補全（自動進入 `step_1_5_enrich` 流程）。

    ### 3.6 map.json 填充
    - `directoryMapping`: 每個核心目錄 → `{ "path", "layer", "responsibility", "publicAPI" }`
    - `logicalTopology`: 模組間依賴 → `{ "from", "to", "type" }` (imports / calls / extends)
    - `criticalUserJourneys`: 核心流程 → `{ "name", "steps": ["module → module → ..."] }`
    - `featureRelations`: 掃描程式碼，識別「聚合型模組」並記錄。
      **識別特徵**: 某模組遍歷/枚舉/動態載入同類模組（如 `for (const cmd of allCommands)`、`Object.values(registry)`、讀取目錄後動態 import），或其描述為「彙總/列舉/註冊所有 X」。
      每條記錄格式: `{ "aggregator": "<ID 或檔案路徑>", "sources": "<來源範圍描述>", "evidence": "<程式碼依據>", "checkNote": "此類功能新增或刪除時，檢查 <aggregator> 是否需要同步" }`

    ### 3.7 其他全域文件（按需）
    - `dictionary.json`: 從程式碼提取領域術語
    - [?UI] `design_tokens.json`: 從 CSS 變數/主題提取
    - [?UI] `ui_concept.html` + `ui_context.md`: **不由本命令產生**。繼承完成後，提示使用者執行 `archi-ui-wireframe` Skill 產生全域 UI 線框圖（Skill 同時產生兩個檔案）。
    - [?Data] `data_snapshot.json`: 從 schema/migration 提取
    - `error_codes.json`: 從程式碼中的錯誤定義提取

    **Output**: 寫入所有檔案，執行 `npx archi render`。
</step_3_constitution>

<step_4_audit>
    **Role**: 審計官
    **Checklist**:
    1.  **Vision 對齊**: vision.md 與程式碼實際功能一致？
    2.  **Tech Stack 一致**: 規則檔案 `02_tech_stack` 與 package.json/config 一致？
    3.  **Map 覆蓋**: map.json 覆蓋所有核心目錄？
    4.  **Roadmap 完整**: phase-0 覆蓋所有已識別功能模組？
    5.  **Stub 齊全**: 每個 LEG-xx 都有對應 tasks/ 目錄和 spec.md？
    6.  **Dictionary 無衝突**: 術語無歧義或重複？

    如有問題則靜默修正；嚴重問題標記 `Risk Warning`。
</step_4_audit>

<step_5_signoff>
    **Terminal Gate** (禁止跳過，須在輸出總結前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | 無 ERROR 級問題 |
    | 2 | `npx archi render` | `.md` 視圖生成完成 |

    **Action** (Gate 通過後):
    1.  執行 `npx archi task` 輸出任務概覽。
    2.  輸出總結。

    **Output**: 逆向分析摘要，含:
    - **專案概況**: 型別、規模、核心模組數
    - **Legacy 功能**: LEG-xx 列表（ID / 名稱 / 原始碼位置）
    - **已生成文件**: 檔案清單
    - **AI 補全項**: 標註置信度（高/中/低）
    - **Next Steps**:

    | 優先級 | 動作 | 說明 |
    |:---|:---|:---|
    | 1 | 審查 vision.md | 確認 AI 補全的願景描述是否準確 |
    | 2 | `/archi.edit LEG-xx` | 對核心模組補全完整 spec（自動觸發 Enrich 流程） |
    | 3 | `/archi.scope [file_path]` | 規劃新任務/大模組 |
    | 4 | `/archi.plan <任務ID>` | 對單個任務做深度規劃 |
</step_5_signoff>

</protocol_inherit>

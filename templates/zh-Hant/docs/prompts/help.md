<protocol_help>
  **Trigger**: `/archi.help [lang]`
  **Goal**: 顯示 Architext 完整指令清單，解釋 DDAD (文件驅動開發) 的操作流，並展示專案目錄結構。

<meta>
    <style>Clean, Structured, Manual-Style</style>
    <language>繁體中文</language>
    <principles>
      1.  **Lifecycle-Oriented**: 按專案生命週期 (啟動->定義->變更->執行) 分組，而非簡單的字母排序。
      2.  **Logic Clarity**: 明確解釋核心邏輯 (e.g. 為什麼 `/archi.plan` 不寫程式碼只寫文件)。
      3.  **Bilingual Support**: 根據 `[lang]` (zh/zh-Hant/en) 輸出對應語言，預設為繁體中文。
      4.  **Structure Awareness**: 展示專案目錄結構，幫助使用者理解檔案組織。
    </principles>
</meta>

<step_1_render>
    **Role**: 技術文件工程師
    **Action**: 輸出以下 Markdown 格式的手冊。

    **Content**:

    # Architext Command Manual (v1.1)

    > **Core Philosophy**: **No Docs, No Code.**
    > 所有的程式碼變更必須始於文件 (Define)，終於審計 (Audit)。

    ---

    ## Project Structure (專案目錄結構)

    初始化後，Architext 會在專案中建立以下結構：

    ```
    my-project/
    │
    ├── .cursor/rules/              # Cursor IDE 規則目錄
    │   ├── 00_system.mdc           # 系統憲法 - AI 身份與思維循環
    │   ├── 01_workflow.mdc         # 工作流路由 - 指令識別與模式切換
    │   ├── 02_tech_stack.mdc       # 技術法律 - 技術選型與編碼規範
    │   ├── 90_custom_rules.mdc     # 使用者家規 - 團隊自定義約束
    │   └── 99_context_glue.mdc     # 上下文橋樑 - 程式碼與文件關聯
    │
    ├── .cursor/commands/           # Cursor IDE 指令目錄 (僅 Cursor)
    │   ├── archi.start.md          # /archi.start 指令定義
    │   ├── archi.plan.md           # /archi.plan 指令定義
    │   ├── archi.code.md           # /archi.code 指令定義
    │   ├── archi.fix.md            # /archi.fix 指令定義
    │   ├── archi.edit.md           # /archi.edit 指令定義
    │   └── archi.help.md           # /archi.help 指令定義
    │
    ├── .trae/rules/                # Trae IDE 規則目錄 (同上，副檔名為 .md)
    │   └── ...
    │
    ├── .architext/                 # 文件目錄 (預設名稱，可配置)
    │   │
    │   ├── global/                 # 全域文件 - 專案級資產
    │   │   ├── 00_roadmap.md       # 專案路線圖 - 任務依賴與進度追蹤
    │   │   ├── 00_vision.md        # 專案願景 - 北極星指標與設計哲學
    │   │   ├── 01_map.md           # 架構地圖 - 目錄索引與邏輯拓樸
    │   │   ├── 02_dictionary.md    # 術語字典 - 業務術語與元件註冊
    │   │   ├── 03_design_tokens.md # 設計系統 - 顏色/字體/間距變數 (如有 UI)
    │   │   ├── 04_data_snapshot.md # 數據快照 - 資料庫 Schema 鏡像 (如有數據層)
    │   │   └── 05_error_codes.md   # 錯誤碼契約 - 業務錯誤碼定義
    │   │
    │   ├── prompts/                # Prompt 模板 - 供 AI 讀取的指令協議
    │   │   ├── start.md            # 專案啟動協議
    │   │   ├── plan.md             # 功能規劃協議
    │   │   ├── code.md             # 程式碼實現協議
    │   │   ├── edit.md             # 需求變更協議
    │   │   ├── fix.md              # Bug 修復協議
    │   │   └── help.md             # 幫助手冊 (本檔案)
    │   │
    │   ├── templates/              # 文件模板
    │   │   ├── spec.template.md    # 功能規格模板 (Gherkin)
    │   │   ├── ui.template.md      # UI 設計模板 (ITP v3.0)
    │   │   └── plan.template.md    # 實施計畫模板
    │   │
    │   └── features/               # 功能文件 - 按模組組織
    │       └── <ID>_<Slug>/        # 每個功能一個資料夾
    │           ├── spec.md         # 功能規格 - Gherkin 場景
    │           ├── ui.md           # UI 設計 - ITP 元件樹 (如適用)
    │           └── plan.md         # 實施計畫 - 任務清單
    │
    └── xxx/                        # 業務程式碼 (專案實際程式碼)
        └── ...
    ```

    **說明**:
    - **IDE Rules 目錄**: 根據選擇的 IDE，規則檔案會被複製到對應目錄 (`.cursor/rules/`, `.trae/rules/` 等)
    - **IDE Commands 目錄**: 僅 Cursor 支援，指令檔案會被產生到 `.cursor/commands/` 目錄，檔案名稱格式為 `archi.{指令名}.md`
    - **文件目錄**: 預設使用 `.architext/`，可透過 `architext.json` 配置為其他名稱
    - **副檔名差異**: Cursor 規則檔案使用 `.mdc`，其他 IDE 使用 `.md`

    ---

    ## 1. Initialization (專案啟動)

    | Command | Args | Role (簡述) | Core Logic (核心邏輯) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.start`** | `[context]` | ** Project Cold Start**<br>新專案冷啟動。 | 訪談願景 -> 確認風格 -> 確認技術堆疊 -> **建立 Docs 骨架**。 |
    | **`/archi.inherit`** | `(none)` | ** Legacy Takeover**<br>接管現有的舊專案。 | 全量掃描程式碼 -> 逆向推導 -> **填充 Global Docs**。 |
    | **`/archi.map`** | `(none)` | ** Refresh Map**<br>重新整理目錄地圖。 | 掃描檔案系統 -> **更新 01_map.md**。 |

    ---

    ## 2. Definition (需求定義)

    > **Rule**: 此階段**不寫程式碼**，只生成 `.architext/features/` 下的 Spec/UI/Plan 文件。

    | Command | Args | Role (簡述) | Core Logic (核心邏輯) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.plan`** | `[id \| context]` | ** Feature Planning**<br>定義新功能或細化已有功能。 | 智慧判斷：<br>1. 有 ID -> 讀取已有文件，深度細化。<br>2. 無 ID -> **建新 ID** -> 架構訪談 -> 生成 Spec/UI/Plan。 |
    | **`/archi.adopt`** | `[context]` | ** Adopt Legacy**<br>納管舊程式碼。 | 模糊搜尋程式碼 -> **自動擬定 ID** -> 逆向生成 Spec/UI。 |

    ---

    ## 3. Evolution (變更管理)

    | Command | Args | Role (簡述) | Core Logic (核心邏輯) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.edit`** | `<id> [context]` | ** Modify Spec/UI**<br>修改**局部**功能的需求。 | 讀取舊文件 -> 注入新需求 -> **更新 Spec/UI** -> 追加 Plan。 |
    | **`/archi.revise`** | `<target> [context]` | ** Global Revision**<br>修改**全域**設定 (如技術堆疊)。 | 修改 Vision/Tech/Roadmap -> **廣播變更** (通知相關 Feature)。 |

    ---

    ## 4. Execution (執行與修復)

    | Command | Args | Role (簡述) | Core Logic (核心邏輯) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.code`** | `<id>` | ** Write Code**<br>將文件翻譯為程式碼。 | 讀取 Plan -> 生成/修改程式碼 -> **靜態檢查 + 自動審計**。 |
    | **`/archi.fix`** | `[id] <context>` | ** Bug Fix**<br>修復 Bug (非需求變更)。 | 診斷錯誤 -> 記錄 Plan -> **修復程式碼** (通常不修改 Spec)。 |

    ---

    ## 5. Maintenance (維護與治理)

    | Command | Args | Role (簡述) | Core Logic (核心邏輯) |
    | :--- | :--- | :--- | :--- |
    | **`/archi.map`** | `(none)` | ** Refresh Map**<br>手動重新整理架構地圖。 | 重新掃描目錄樹 -> 更新 `01_map.md` (檔案拓樸)。 |
    | **`/archi.help`** | `[lang]` | ** Manual**<br>顯示本說明書。 | 顯示指令列表、專案結構與用法。 |

    ---

    ## 💡 Quick Decision Guide (快速決策)

    | 場景 | 推薦指令 |
    | :--- | :--- |
    | **新專案**從零開始 | `/archi.start` |
    | **老專案**接管維護 | `/archi.inherit` |
    | **新功能**需求定義 | `/archi.plan [功能描述]` |
    | **已有功能**深度細化 | `/archi.plan [Feature_ID]` |
    | **給老程式碼**補文件 | `/archi.adopt` |
    | **改需求**（局部） | `/archi.edit <id> [變更描述]` |
    | **改全域**（技術堆疊/架構） | `/archi.revise <target> [變更描述]` |
    | **寫程式碼**實現功能 | `/archi.code <id>` |
    | **修 Bug** | `/archi.fix [id] <bug 描述>` |
    | **刷新地圖** | `/archi.map` |

    ---

    ## Typical Workflow (典型工作流)

    ```
    /archi.start [專案描述]     # Step 1: 專案初始化 -> 生成 Vision/Tech/Roadmap
           ↓
    /archi.plan [功能描述]      # Step 2: 功能規劃 -> 生成 Spec/UI/Plan
           ↓
    /archi.code <Feature_ID>    # Step 3: 程式碼實現 -> 靜態檢查 + 審計
           ↓
    (發現 Bug?)
           ↓
    /archi.fix [Feature_ID] <bug 描述>     # Step 4: Bug 修復 (如需)
           ↓
    (需求變更?)
           ↓
    /archi.edit [Feature_ID] <需求變更描述>    # Step 5: 需求變更 (如需) -> 更新 Spec/UI/Plan
           ↓
    /archi.code <Feature_ID>    # Step 6: 繼續實現變更
    ```

    ---

    > ** Next Step**: 
    > - 新專案？運行 `/archi.start [你的專案描述]` 開始初始化。
    > - 已有專案？運行 `/archi.inherit` 接管現有程式碼庫。
    > - 想規劃新功能？運行 `/archi.plan [功能描述]` 開始架構訪談。

</step_1_render>

</protocol_help>

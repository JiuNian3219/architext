<protocol_audit>
  **Trigger**: `/archi.audit [id]`
  **Goal**: 獨立深度程式碼審查。帶 `<id>` 審查該任務的程式碼實現；無 `<id>` 執行專案級體檢。不修改程式碼，僅輸出審查報告與修復工單。

<meta>
    <style>Investigative, Thorough, Evidence-Based</style>
    <language>繁體中文</language>
    <principles>
      1.  **Read-Only**: 禁改任何程式碼檔案。審查 ≠ 修復。
      2.  **Evidence-Based**: 每個發現須附檔案路徑、行號、程式碼片段。
      3.  **Actionable Output**: 每個問題須附推薦修復命令（`/archi.fix`, `/archi.edit` 等）。
      4.  **Vision Anchored**: 始終以 `vision.md` 為方向基準，偵測偏離。
      5.  **Report Persistence**: 審查結果須寫入檔案 — 任務級 → `features/<id>_*/audit.md`（覆蓋），專案級 → `audits/YYYY-MM-DD.md`（按日期存檔，同日覆蓋）。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系統分析師
    **Mode Gate**:

    | 輸入 | 模式 | 後續步驟 |
    |:---|:---|:---|
    | `/archi.audit <id>` | 任務級深度審查 | step_2_task → step_3_report |
    | `/archi.audit` | 專案級體檢 | step_2_project → step_3_report |

    **任務級 — Resolve ID**:
    1.  從 `[[__DOCS_DIR__]]/global/roadmap.json` 解析 `<id>` → Feature Name、Slug、狀態。
    2.  **Status Gate** — 僅 `active` 或 `done` 可審查:

        | 狀態 | 處理 |
        |:---|:---|
        | `active` / `done` | 通過 |
        | `pending` | 拒絕 — 無程式碼可審查，先執行 `/archi.plan` + `/archi.code` |
        | `blocked` | 拒絕 — 前置依賴未完成 |

    3.  **Load Context**:
        - `[[__DOCS_DIR__]]/global/vision.md` — 專案方向基準
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — 功能邏輯
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.json` — 任務清單
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — 元件結構(ITP, 如存在)
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.preview.html` — 視覺參考(如存在)
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/audit.md` — 上次審計報告(如存在，用於對比)
        - `02_tech_stack.md` — 技術紅線
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`
    4.  讀取該任務對應的所有程式碼檔案。

    **專案級 — Load Overview**:
    1.  讀取 `[[__DOCS_DIR__]]/global/vision.md`、`roadmap.json`、`map.json`。
    2.  讀取 `02_tech_stack.md`。
    3.  掃描 `[[__DOCS_DIR__]]/features/` 目錄結構。
    4.  讀取專案程式碼入口檔案與關鍵模組。

    **Output**: 審查範圍與上下文清單。
</step_1_resolve>

<step_2_task>
    **Role**: 首席審計官
    **Scope**: 任務級深度程式碼審查（僅 `/archi.audit <id>` 時執行）。

    逐維度審查，每個發現須附 `檔案:行號` + 程式碼片段 + 嚴重級別：

    | # | 維度 | 審查要點 |
    |:---|:---|:---|
    | 1 | **Vision 對齊** | 實現方向與 `vision.md` 有無衝突或偏離 |
    | 2 | **Spec 完整性** | 程式碼是否覆蓋 `spec.md` 全部場景與邊界 |
    | 3 | **Plan 真實性** | 標記 `done` 的任務是否在程式碼中落地（防虛標） |
    | 4 | **邏輯正確性** | 業務邏輯錯誤、矛盾、遺漏分支、狀態機缺陷 |
    | 5 | **Bug 獵殺** | 空值/undefined、競態、資源洩漏、死迴圈、off-by-one |
    | 6 | **錯誤處理** | 吞錯、靜默失敗、錯誤傳播鏈完整性、使用者可見回饋 |
    | 7 | **Tech Stack 合規** | 對照 `02_tech_stack.md`：違禁模式、過時 API、硬編碼 |
    | 8 | **安全性** | 敏感資訊洩露、輸入未校驗、注入風險、權限檢查 |
    | 9 | **效能** | 不必要全量匯入/大迴圈/無用計算/記憶體洩漏/N+1 查詢 |
    | 10 | [?UI] **Design 合規** | 樣式是否用 Token/Preset 定義的視覺模式；無硬編碼魔法值；實現與 `ui.preview.html` 視覺一致 |
    | 11 | [?Data] **資料一致性** | 欄位名/型別與 `data_snapshot.json` 是否一致 |
    | 12 | [?I18n] **I18n 合規** | 無硬編碼字串；須用 Key/字典引用 |
    | 13 | **Orphan .gitkeep** | 目錄已有其他檔案時仍存在 `.gitkeep` — 須刪除 |

    **Output**: 按維度分組的發現列表，每項含級別、位置、描述。
</step_2_task>

<step_2_project>
    **Role**: 首席審計官
    **Scope**: 專案級健康體檢（僅 `/archi.audit` 無參數時執行）。

    | # | 檢查項 | 說明 |
    |:---|:---|:---|
    | 1 | **Vision 漂移** | `roadmap.json` 任務方向與 `vision.md` 是否一致 |
    | 2 | **架構一致性** | `map.json` vs 實際目錄結構，有無漂移或未註冊模組 |
    | 3 | **Roadmap 健康度** | 一致性 + 進度統計 + 長期 blocked 任務 + 依賴環偵測 |
    | 4 | **檔案完整度** | 各 Feature 是否有 spec.md + plan.json；有無孤兒目錄 |
    | 5 | **Tech Stack 全域合規** | 抽查關鍵入口與模組，偵測全域性違規 |
    | 6 | **跨 Feature 一致性** | 重複邏輯、命名衝突、介面不一致 |
    | 7 | **Orphan .gitkeep** | 目錄已有其他檔案時仍存在 `.gitkeep` — 須刪除 |

    掃描後標註優先級，推薦需深度審查的 Feature：
    - `done` 但 plan 未全部完成的
    - 程式碼量大但無測試的
    - 長期 `active` 未推進的

    **Output**: 專案健康概覽 + 深度審查推薦列表。
</step_2_project>

<step_3_report>
    **Role**: 報告撰寫員
    **Action**:

    **Issue Classification**:

    | 級別 | 含義 | 範例 |
    |:---|:---|:---|
    | `CRITICAL` | 須修復，阻塞發布 | 邏輯錯誤、安全漏洞、資料損壞風險 |
    | `WARNING` | 應修復，有風險 | 缺少錯誤處理、效能隱患、Spec 覆蓋不全 |
    | `INFO` | 建議最佳化 | 命名不規範、缺少註解、可簡化的程式碼 |

    **Issue Format** (每項須包含):
    ```
    [LEVEL] 檔案路徑:行號 — 維度名
      描述：具體問題
      -> 推薦修復：/archi.fix <ID> <描述> 或 /archi.edit <ID> <描述>
    ```

    **Action Routing** (根據問題型別推薦命令):

    | 問題型別 | 推薦命令 |
    |:---|:---|
    | Bug（邏輯錯誤、邊界遺漏） | `/archi.fix <ID> <描述>` |
    | Spec 缺漏（功能未完整實現） | `/archi.edit <ID> <補充描述>` |
    | 架構級問題（全域違規） | `/archi.revise <描述>` |
    | 功能未完成（plan 虛標 done） | `/archi.code <ID>` |
    | 小問題（命名、註解、簡化） | 下次 `/archi.code` 時一併處理 |

    **Report Structure**:
    1.  審查概要（模式、範圍、日期）
    2.  發現列表（按級別排序：CRITICAL → WARNING → INFO）
    3.  統計摘要（各級別數量）
    4.  修復工單彙總（可直接執行的命令列表）
    5.  Next Steps 表格

    **Write Report File**:
    - 任務級 → `[[__DOCS_DIR__]]/features/<id>_<Slug>/audit.md`（覆蓋式）
    - 專案級 → `[[__DOCS_DIR__]]/audits/YYYY-MM-DD.md`（按日期存檔，同日覆蓋）

    **Output**: 完整審查報告（同時輸出到對話和寫入檔案）。
</step_3_report>

</protocol_audit>

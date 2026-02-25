<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]`
  **Goal**: 基於新需求/修改意見，更新已納管模組的 Spec/UI 文件，並追加開發計畫。

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>繁體中文</language>
    <principles>
      1.  **Doc First**: 須先改文件 (Spec/UI)，再生成 Plan。禁跳過文件直接改程式碼計畫。
      2.  **Incremental**: 僅追加新 Task 到 Plan，保留已完成歷史（除非需回滾）。
      3.  **Conflict Check**: 檢查新需求是否與 tech_stack / design_tokens 衝突。
      4.  **Frontmatter Preservation**: 禁破壞現有文件 Metadata。
    </principles>
</meta>

<step_1_load>
    **Role**: 產品經理
    **Action**:
    - 讀取 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/` 下的 spec.md、ui.md、plan.json。
    - [?UI] 讀取 `[[__DOCS_DIR__]]/global/ui_context.md`（定位本功能對應的畫面範圍及導覽關係）。
    - 檢測 spec.md 中的 `Spec-Status` 欄位：
      - `Full` → 正常流程，進入 step_2。
      - `Stub` → 進入 step_1_5_enrich。
    - [?重大 UX 變更] 快速搜尋同類產品最佳實務。
</step_1_load>

<step_1_5_enrich>
    **Role**: 逆向工程師
    **Trigger**: spec.md 中 `Spec-Status: Stub`（由 `/archi.inherit` 生成的輕量快照）。

    **Action**:
    1. 告知使用者：「該功能僅有輕量快照，須先補全完整 spec 才能執行修改。」
    2. 從 stub 的「關聯檔案」section 提取原始碼路徑。
    3. 逐一讀取關聯檔案，中度掃描（入口 + 核心邏輯）。
    4. 基於程式碼分析，將 stub 補全為完整 spec：
       - 保留原有概述和關鍵流程
       - 補充 Gherkin Scenarios（覆蓋正常流程 + 異常路徑）
       - 補充介面/型別定義（如該功能是其他功能的上游）
    5. 更新 `Spec-Status: Stub → Full`。
    6. [?UI] 如模組有 UI → 同步生成或更新 `ui.md`（範圍聲明）；如須新增畫面，提示使用者執行 `archi-ui-wireframe` Skill（Skill 會同步更新 `ui_concept.html` + `ui_context.md`）。
    7. 生成 `plan.json`（全部 task 為 done，記錄已實作內容）。
    8. 向使用者輸出補全後的 spec 摘要。

    **Gate**: 使用者確認補全內容正確後，繼續 step_2_refine_docs。
    **異常**: 關聯檔案不存在/已移動 → 提示使用者更新路徑。
</step_1_5_enrich>

<step_2_refine_docs>
    **Role**: 需求分析師 & 設計師
    **Action**:
    - 根據 `[context]` 修改 spec.md（邏輯/規則變更）和 ui.md（結構/互動變更）。
    - [?UI 修改] 透過 Skill 同步更新 `ui_concept.html` + `ui_context.md`（Skill 為兩個檔案的唯一寫者）：

      | 變更類型 | 判定標準 | 處理方式 |
      |:---|:---|:---|
      | 無畫面影響 | 僅邏輯/資料變更，無視覺差異 | 僅改 spec.md，`ui_concept.html` / `ui_context.md` 不動 |
      | 輕微 UI 調整 | 新增/修改狀態、彈窗、局部區域，不改整體版面 | 呼叫 Skill（修改畫面模式）更新兩個檔案，輸出 `MODIFIED: S-XX` |
      | 畫面結構變更 | 版面重構、新增獨立畫面、導覽路徑變化 | 呼叫 Skill（修改畫面模式）更新兩個檔案，輸出 `MODIFIED: S-XX`；若已完成 Phase 2 著色，同步重新著色 |
      | 功能縮減 | 畫面/區域整體移除 | 呼叫 Skill（刪除畫面模式）更新兩個檔案，輸出 `REMOVED: S-XX` |

    - 需求模糊時向使用者提問 (A/B/C/D 選項) 確認細節。

    **Output**: 更新後的 Spec、UI 文件及 `ui_concept.html` / `ui_context.md` 變更摘要。
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - 在 `plan.json` 的 `phases` 陣列中追加新 Phase 物件。
    - 列出具體 Tasks (API update, UI tweak, Test update)；每項須可驗證。
    - **狀態轉換**: 若當前任務 status=`done`，追加 Phase 後須將狀態重置為 `active`（否則後續 `/archi.code` 將被 Status Gate 拒絕）。

    **Terminal Gate** (禁止跳過，須在 step_4 輸出前全部完成):
    | 步驟 | 命令 | 通過條件 |
    |:---|:---|:---|
    | 1 | `npx archi render` | `.md` 視圖生成完成 |
    | 2 | [當前 status=done] `npx archi task <ID> --status active` | 任務狀態已重置為 active |

    **Output**: 追加了新任務的 plan.json；若執行了狀態轉換，輸出 `MODIFIED: roadmap.json <ID>.status done→active`。
</step_3_update_plan>

<step_4_summary>
    **Action** (Gate 須在 step_3 完成):
    **Output**: Task 更新摘要，含 Spec/UI/Plan 變更概要和 Next Steps 表格。推薦執行 `/archi.code <ID>`。
</step_4_summary>

</protocol_edit>

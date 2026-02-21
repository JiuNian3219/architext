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
    - 讀取 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下的 spec.md、ui.md、ui.preview.html、plan.json。
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
    6. [?UI] 如模組有 UI → 同步生成 `ui.md` + `ui.preview.html`。
    7. 生成 `plan.json`（全部 task 為 done，記錄已實作內容）。
    8. 向使用者輸出補全後的 spec 摘要。

    **Gate**: 使用者確認補全內容正確後，繼續 step_2_refine_docs。
    **異常**: 關聯檔案不存在/已移動 → 提示使用者更新路徑。
</step_1_5_enrich>

<step_2_refine_docs>
    **Role**: 需求分析師 & 設計師
    **Action**:
    - 根據 `[context]` 修改 spec.md（邏輯/規則變更）和 ui.md（結構/互動變更）。
    - [?UI 修改] 同步更新 `ui.preview.html`，引入設計師視角，確保符合 design_tokens 和 componentPresets。
    - 需求模糊時向使用者提問 (A/B/C/D 選項) 確認細節。

    **Output**: 更新後的 Spec 和 UI 文件。
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - 在 `plan.json` 的 `phases` 陣列中追加新 Phase 物件。
    - 列出具體 Tasks (API update, UI tweak, Test update)；每項須可驗證。

    **Output**: 追加了新任務的 plan.json，執行 `npx archi render` 更新 `.md` 視圖。
</step_3_update_plan>

<step_4_summary>
    **Output**: Feature 更新摘要，含 Spec/UI/Plan 變更概要和 Next Steps 表格。推薦執行 `/archi.code <ID>`。
</step_4_summary>

</protocol_edit>

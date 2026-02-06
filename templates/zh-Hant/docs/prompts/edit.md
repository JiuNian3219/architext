<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]`
  **Goal**: 基於使用者的新需求或修改意見 (`[context]`)，更新已納管模組 (`<id>`) 的 Spec 和 UI 文件，並追加相應的開發計畫。

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>繁體中文</language>
    <principles>
      1.  **Doc First**: 必須先修改文件 (Spec/UI)，再產生 Plan。嚴禁跳過文件直接改程式碼計畫。
      2.  **Incremental**: 僅追加新的 Task 到 `3.plan.md`，保留已完成的歷史任務（除非需要回復）。
      3.  **Conflict Check**: 檢查新需求是否與 `02_tech_stack` 或 `03_design_tokens` 衝突。
      4.  **Frontmatter Preservation**: 嚴禁破壞現有文件 Metadata。
    </principles>
</meta>

<step_1_load>
    **Role**: 產品經理
    **Action**:
    - 讀取 `[[__DOCS_DIR__]]/features/<id>_<name>/1.spec.md`。
    - 讀取 `[[__DOCS_DIR__]]/features/<id>_<name>/2.ui.md`。
    - 讀取 `[[__DOCS_DIR__]]/features/<id>_<name>/3.plan.md`。
    - **Benchmark Check** (如涉及重大 UX 變更): 快速搜尋同類產品的最佳實務，避免閉門造車。
    
    **Bridge**: "文件已載入，正在分析需求變更影響……"
</step_1_load>

<step_2_refine_docs>
    **Role**: 需求分析師 & 設計師
    **Action**:
    - 根據 `[context]` 修改 `1.spec.md` (邏輯/規則變更)。
    - 根據 `[context]` 修改 `2.ui.md` (介面/互動變更)。
      - **Designer Mode**: 如修改 UI，請引入設計師視角，確保美觀並符合 `03_design_tokens`。
    - **Interaction**: 如果需求模糊，向使用者提問 (A/B/C/D/E 選項) 確認細節。
    
    **Output**: 更新後的 Spec 和 UI 文件。
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - 在 `3.plan.md` 中追加新的 "Change Request" 任務區塊。
    - **Format**:
      - 使用 `### Phase X: Change Request (<Date>)` 標題。
      - 列出具體的 Implementation Tasks (API update, UI tweak, Test update)。
      - 每一項任務必須可驗證。
    
    **Output**: 追加了新任務的 `3.plan.md`。
</step_3_update_plan>

<step_4_summary>
    **Action**: 確認變更並輸出清晰的下一步指引。

    **Output Template**:
    ```markdown
    ## ✅ Feature Updated

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Change Type**: [Spec Change / UI Change / Both]

    ### 📝 Docs Updated
    * **Spec Changes**: [概括主要邏輯變更]
    * **UI Changes**: [概括主要介面變更] (如適用)

    ### 📅 Plan Appended
    * 新增了 **N** 個開發任務到 `3.plan.md`
    * 任務類型: [API Update / UI Tweak / Test Update / ...]

    ### 📂 Files Modified
    * `[[__DOCS_DIR__]]/features/<ID>_<Name>/1.spec.md` (已更新)
    * `[[__DOCS_DIR__]]/features/<ID>_<Name>/2.ui.md` (已更新，如適用)
    * `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md` (已追加新任務)

    ---

    ### 🧭 Next Steps (下一步操作)

    | 場景 | 推薦操作 | 說明 |
    |:---|:---|:---|
    | **實施變更** | `/archi.code <ID>` | 開始實現新增的開發任務 |
    | **繼續修改** | `/archi.edit <ID> [新的變更描述]` | 如果還有其他需求變更 |
    | **檢視計畫** | 檢查 `3.plan.md` | 確認新增的任務是否符合預期 |
    | **檢視幫助** | `/archi.help` | 顯示完整指令手冊 |

    > 💡 **推薦**: 執行 `/archi.code <ID>` 開始實施變更。
    ```
</step_4_summary>

</protocol_edit>

<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]`
  **Goal**: 基于用户的新需求或修改意见 (`[context]`)，更新已纳管模块 (`<id>`) 的 Spec 和 UI 文档，并追加相应的开发计划。

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>简体中文</language>
    <principles>
      1.  **Doc First**: 必须先修改文档 (Spec/UI)，再生成 Plan。严禁跳过文档直接改代码计划。
      2.  **Incremental**: 仅追加新的 Task 到 `3.plan.md`，保留已完成的历史任务（除非需要回滚）。
      3.  **Conflict Check**: 检查新需求是否与 `02_tech_stack` 或 `03_design_tokens` 冲突。
      4.  **Frontmatter Preservation**: 严禁破坏现有文档 Metadata。
    </principles>
</meta>

<step_1_load>
    **Role**: 产品经理
    **Action**:
    - 读取 `.architext/features/<id>_<name>/1.spec.md`。
    - 读取 `.architext/features/<id>_<name>/2.ui.md`。
    - 读取 `.architext/features/<id>_<name>/3.plan.md`。
    - **Benchmark Check** (如涉及重大 UX 变更): 快速搜索同类产品的最佳实践，避免闭门造车。
    
    **Bridge**: "文档已加载，正在分析需求变更影响……"
</step_1_load>

<step_2_refine_docs>
    **Role**: 需求分析师 & 设计师
    **Action**:
    - 根据 `[context]` 修改 `1.spec.md` (逻辑/规则变更)。
    - 根据 `[context]` 修改 `2.ui.md` (界面/交互变更)。
      - **Designer Mode**: 如修改 UI，请引入设计师视角，确保美观并符合 `03_design_tokens`。
    - **Interaction**: 如果需求模糊，向用户提问 (A/B/C/D/E 选项) 确认细节。
    
    **Output**: 更新后的 Spec 和 UI 文档。
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - 在 `3.plan.md` 中追加新的 "Change Request" 任务块。
    - **Format**:
      - 使用 `### Phase X: Change Request (<Date>)` 标题。
      - 列出具体的 Implementation Tasks (API update, UI tweak, Test update)。
      - 每一项任务必须可验证。
    
    **Output**: 追加了新任务的 `3.plan.md`。
</step_3_update_plan>

<step_4_summary>
    **Action**: 确认变更并输出清晰的下一步指引。

    **Output Template**:
    ```markdown
    ## ✅ Feature Updated

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Change Type**: [Spec Change / UI Change / Both]

    ### 📝 Docs Updated
    * **Spec Changes**: [概括主要逻辑变更]
    * **UI Changes**: [概括主要界面变更] (如适用)

    ### 📅 Plan Appended
    * 新增了 **N** 个开发任务到 `3.plan.md`
    * 任务类型: [API Update / UI Tweak / Test Update / ...]

    ### 📂 Files Modified
    * `.architext/features/<ID>_<Name>/1.spec.md` (已更新)
    * `.architext/features/<ID>_<Name>/2.ui.md` (已更新，如适用)
    * `.architext/features/<ID>_<Name>/3.plan.md` (已追加新任务)

    ---

    ### 🧭 Next Steps (下一步操作)

    | 场景 | 推荐操作 | 说明 |
    |:---|:---|:---|
    | **实施变更** | `/archi.code <ID>` | 开始实现新增的开发任务 |
    | **继续修改** | `/archi.edit <ID> [新的变更描述]` | 如果还有其他需求变更 |
    | **查看计划** | 检查 `3.plan.md` | 确认新增的任务是否符合预期 |
    | **查看帮助** | `/archi.help` | 显示完整指令手册 |

    > 💡 **推荐**: 运行 `/archi.code <ID>` 开始实施变更。
    ```
</step_4_summary>

</protocol_edit>

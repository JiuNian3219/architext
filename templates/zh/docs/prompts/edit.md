<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]`
  **Goal**: 基于新需求/修改意见，更新已纳管模块的 Spec/UI 文档，并追加开发计划。

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>简体中文</language>
    <principles>
      1.  **Doc First**: 须先改文档 (Spec/UI)，再生成 Plan。禁跳过文档直接改代码计划。
      2.  **Incremental**: 仅追加新 Task 到 plan.md，保留已完成历史（除非需回滚）。
      3.  **Conflict Check**: 检查新需求是否与 tech_stack / design_tokens 冲突。
      4.  **Frontmatter Preservation**: 禁破坏现有文档 Metadata。
    </principles>
</meta>

<step_1_load>
    **Role**: 产品经理
    **Action**:
    - 读取 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下的 spec.md、ui.md、plan.md。
    - [?重大 UX 变更] 快速搜索同类产品最佳实践。
</step_1_load>

<step_2_refine_docs>
    **Role**: 需求分析师 & 设计师
    **Action**:
    - 根据 `[context]` 修改 spec.md（逻辑/规则变更）和 ui.md（界面/交互变更）。
    - [?UI 修改] 引入设计师视角，确保符合 design_tokens。
    - 需求模糊时向用户提问 (A/B/C/D 选项) 确认细节。

    **Output**: 更新后的 Spec 和 UI 文档。
</step_2_refine_docs>

<step_3_update_plan>
    **Role**: Tech Lead
    **Action**:
    - 在 plan.md 追加 `### Phase X: Change Request (<Date>)` 任务块。
    - 列出具体 Tasks (API update, UI tweak, Test update)；每项须可验证。

    **Output**: 追加了新任务的 plan.md。
</step_3_update_plan>

<step_4_summary>
    **Output**: Feature 更新摘要，含 Spec/UI/Plan 变更概要和 Next Steps 表格。推荐运行 `/archi.code <ID>`。
</step_4_summary>

</protocol_edit>

<protocol_edit>
  **Trigger**: `/archi.edit <id> [context]` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Goal**: 基于新需求/修改意见，更新已纳管模块的 Spec/UI 文档，并追加开发计划。

<meta>
    <style>Collaborative, Iterative, Traceable</style>
    <language>简体中文</language>
    <principles>
      1.  **Doc First**: 须先改文档 (Spec/UI)，再生成 Plan。禁跳过文档直接改代码计划。
      2.  **Incremental**: 仅追加新 Task 到 Plan，保留已完成历史（除非需回滚）。
      3.  **Conflict Check**: 检查新需求是否与 tech_stack / design_tokens 冲突。
      4.  **Frontmatter Preservation**: 禁破坏现有文档 Metadata。
      5.  **IDE-Native First**: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准和检查点，不对抗 IDE 的规划/执行机制。
    </principles>
</meta>

<step_1_load>
    **Action**:
    - 读取 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/` 下的 spec.md、ui.md、plan.json。
    - （仅ui项目） 读取 ui_context.md（定位本功能对应的屏幕范围及导航关系）。
    - 检测 spec.md 中的 `Spec-Status`：`Full` → 正常流程 step_2 | `Stub` → step_1_5_enrich。
    - （重大UX变更） 快速搜索同类产品最佳实践。
</step_1_load>

<step_1_5_enrich>
    **Trigger**: spec.md 中 `Spec-Status: Stub`（由 `/archi.inherit` 生成的轻量快照）。

    **Action**:
    1. 告知用户："该功能仅有轻量快照，须先补全完整 spec 才能执行修改。"
    2. 从 stub"关联文件"提取源码路径，逐一读取（入口+核心逻辑）。
    3. 基于代码分析补全为完整 spec：保留原有概述和流程，补充 Gherkin Scenarios + 接口/类型定义。
    4. 更新 `Spec-Status: Stub → Full`。
    5. （仅ui项目） 如模块有 UI → 同步生成 `ui.md`；须新增屏幕时，[[SKILL: archi-ui-wireframe|调用 skill]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md`）]]。
    6. 生成 `plan.json`（全部 task 为 done）。
    7. 向用户输出补全后的 spec 摘要。

    **Gate**: 用户确认后继续 step_2_refine_docs。
    **异常**: 关联文件不存在/已移动 → 提示用户更新路径。
</step_1_5_enrich>

<step_2_refine_docs>
    **Action**:
    - 根据 `[context]` 修改 spec.md 和 ui.md。
    - （ui有修改） [[SKILL: archi-ui-wireframe|按 skill 的协议同步更新 `ui_concept.html` + `ui_context.md`]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md`）]]：

      | 变更类型 | 判定标准 | 处理方式 |
      |:---|:---|:---|
      | 无屏幕影响 | 仅逻辑/数据变更 | 仅改 spec.md |
      | 轻微 UI 调整 | 新增/修改状态、弹窗、局部区域 | 调用 skill 更新，输出 `MODIFIED: S-XX` |
      | 屏幕结构变更 | 布局重构、新增屏幕、导航变化 | 调用 skill 更新 |
      | 功能缩减 | 屏幕/区域整体移除 | 调用 skill 删除，输出 `REMOVED: S-XX` |

    - 需求模糊时向用户提问确认。

    **Output**: 更新后的文档及变更摘要。
</step_2_refine_docs>

<step_3_update_plan>
    **Action**:
    - 在 `plan.json` 追加新 Phase，列出具体 Tasks；每项须可验证。
    - **状态转换**: status=`done` 时追加 Phase 后须重置为 `active`。

    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 3 | [当前 status=done] `npx archi task <ID> --status active` | 状态已重置 |

    **Output**: 追加了新任务的 plan.json；若执行状态转换，输出 `MODIFIED: roadmap.json <ID>.status done→active`。进入 step_4_verify。
</step_3_update_plan>

<step_4_verify>
    **Role**: 独立审查官

    [[SUBAGENT: archi-silent-audit|mode: plan-docs, context: 审查 step_2 更新的 spec.md/ui.md 与 step_3 追加的 plan.json 新 Phase]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，按 mode: plan-docs 审查）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_summary>
    **Action** (Gate 须在 step_3 完成):
    **Output**: Task 更新摘要，含 Spec/UI/Plan 变更概要和 Next Steps 表格。推荐运行 `/archi.code <ID>`。
</step_5_summary>

</protocol_edit>

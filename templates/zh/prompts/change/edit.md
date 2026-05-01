<protocol_change_edit>
**Trigger**: 路由器 prompts/change.md 分发（/archi.change [id] <change-context>）
**Goal**: 基于新需求/修改意见，更新已纳管模块的 Spec/UI 文档，并追加开发计划。若未提供 <id>，自动定位相关 Task。

<meta>
  <style>Collaborative, Iterative, Traceable</style>
  <language>简体中文</language>
  <principles>
    Doc First: 须先改文档（Spec/UI），再生成 Plan。禁跳过文档直接改代码计划。
    Incremental: 仅追加新 Task 到 Plan，保留已完成历史（除非需回滚）。
    Conflict Check: 须显式检查新需求与 tech_stack[[WHEN: ui | / design_tokens ]] / dictionary 的冲突。
    Frontmatter Preservation: 禁破坏现有文档 Metadata。
    No Re-routing: 如发现是代码 bug（spec 没问题）→ 提示改用 fix；如发现是全局/跨任务变更 → 提示改用 revise。子协议禁自动切换。
    IDE-Native First: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准与检查点。
  </principles>
</meta>

<step_1_load>
Resolve Target:
- 有 <id> → 锁定 tasks/<ID>_<Slug>/。
- 无 <id> → [[INCLUDE: shared/auto-discovery.md]]

[[INCLUDE: prompts/change/shared/spec-status-check.md]]

读取 tasks/<ID>_<Slug>/ 下的 spec.md / ui.md / plan.json。
[[WHEN: ui | 同时读取 ui_context.md（定位本功能对应的屏幕范围及导航关系）。]]
重大 UX 变更时，快速搜索同类产品最佳实践。
</step_1_load>

<step_2_conflict_check>
对照 [context] 描述的变更，检查与项目宪法的冲突点：

| 检查维度 | 数据源 | 冲突示例 |
|---|---|---|
| 技术栈 | tech_stack.md | 用户要求新增「WebSocket 实时通信」，但 tech_stack 标注 Anti-Patterns 含「避免长连接，统一用 SSE」 |
[[WHEN: ui | | 设计令牌 | design_tokens.json | 用户要求新增紫色高亮，但 design_tokens 品牌色为蓝色系，且 ui-redlines 禁紫色渐变 | ]]
| 术语规范 | dictionary.json | 用户用了「用户中心」，但 dictionary forbiddenSynonyms 标注须用「个人中心」 |
| 既有契约 | error_codes.json[[WHEN: api | / api_snapshot.json ]] | 变更与既有错误码[[WHEN: api | /端点契约 ]]冲突 |
| 项目愿景 | vision.md | 变更与北极星指标 / 边界约束矛盾 |

分支：
- 无冲突 → 进入 step_3。
- **硬冲突**（违背 tech_stack Anti-Patterns / vision 边界 / 设计红线）→ 停下，提示「该变更涉及 X 冲突，建议改用 /archi.change 走 revise（修改全局宪法）或调整变更方案」。
- **软冲突**（与术语/既有契约不一致但可调整）→ 输出冲突清单，询问用户「统一术语 / 重命名既有契约 / 接受冗余」三选一，确认后进入 step_3。
</step_2_conflict_check>

<step_3_intent>
解析 [context]，提取变更意图（变更类型 / 影响范围 / 期望结果）。需求模糊时向用户提问确认（A/B/C/D 选项）。
</step_3_intent>

<step_4_refine_docs>
[[INCLUDE: prompts/change/shared/task-doc-cascade.md]]
</step_4_refine_docs>

<step_5_data_sync>
[[INCLUDE: prompts/change/shared/data-sync-trigger.md]]
</step_5_data_sync>

<step_6_verify>
[[SUBAGENT: archi-silent-audit | mode: plan-docs, context: 审查 step_4 更新的 spec.md / ui.md 与 plan.json 新 Phase 的一致性]]
[[NO-SUBAGENT: archi-silent-audit | mode: plan-docs, context: 审查 step_4 更新的 spec.md / ui.md 与 plan.json 新 Phase 的一致性]]
[[NO-SKILL: （请阅读 [[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md，并在当前上下文按 mode: plan-docs 审查）]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_summary>
**Pre-signoff Checklist**（输出前须逐项确认）:
□ Conflict Check 已执行，冲突已处理或已选择继续策略
□ spec.md 已按 context 更新，Change Log 已留痕
[[WHEN: ui | □ ui 有修改时 ui.md + screens/S-XX.html + ui_context.md 已同步更新 ]]
□ plan.json 新 Phase 已追加（历史任务完整保留）
□ 原 status=done 时 roadmap.json status 已重置为 active
□ archi-data-sync 已执行
□ silent-audit (mode: plan-docs) 已执行，CRITICAL 已修复
□ Terminal Gate — task --check 无 ERROR + render 成功

输出 Task 更新摘要（Spec / UI / Plan 变更概要）+ Next Steps：

| 优先级 | 动作 | 说明 |
|---|---|---|
| 推荐 | /archi.code <ID> | 按更新后的 plan 执行编码 |
| 可选 | /archi.review <ID> | 编码完成后审查 |
</step_7_summary>

</protocol_change_edit>

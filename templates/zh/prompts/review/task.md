<protocol_review_task>
**Trigger**: 路由器 prompts/review.md 分发（/archi.review [id] [context]）
**Goal**: 任务级深度代码审查。Read-Only，仅写 review.md 报告文件。

<meta>
  <style>Investigative, Thorough, Evidence-Based</style>
  <language>简体中文</language>
  <principles>
    Read-Only: 禁改任何代码与文档（仅写 review.md 报告文件）。审查 ≠ 修复。
    Evidence-Based: 每个发现须附文件路径、行号、代码片段。
    Actionable Output: 每个问题须附推荐修复命令（详见 action-routing.md）。
    Vision Anchored: 始终以 vision.md 为方向基准，检测偏离。
    No Re-routing: 如发现项目级问题（roadmap 漂移 / 全局架构异常）→ 提示改用 /archi.review（无 ID 项目级）；禁子协议自动切换。
    IDE-Native First: 利用 IDE 原生能力驱动执行节奏。
  </principles>
</meta>

<step_1_load>
Resolve Target:
- 有 <ID> → 锁定 tasks/<ID>_<Slug>/。
- 无 <ID> → [[INCLUDE: shared/auto-discovery.md]]

Status Gate（仅 active 或 done 可审查）:

| 状态 | 处理 |
|---|---|
| active / done | 通过 |
| pending | 拒绝 — 无代码可审查 |
| blocked | 拒绝 — 前置依赖未完成 |

Load:
- vision.md（方向基准）
- task docs：spec.md / plan.json / 前次 review.md（若有，对比用）
- 项目上下文：tech_stack / map / dictionary / error_codes（详见 00_system.md 数据治理规则）
- [[WHEN: ui | design_tokens.json + ui_context.md + tasks/<ID>/ui.md + screens/ ]]
- [[WHEN: data | data_snapshot.json ]]
- [[WHEN: api | api_snapshot.json ]]
- 该任务对应的所有代码文件

输出审查范围与上下文清单，进入 step_2。
</step_1_load>

<step_2_review>
逐维度审查，每个发现须附 `文件:行号` + 代码片段 + 严重级别。不适用项标 N/A（非静默跳过）。

| # | 维度 | 审查要点 |
|---|---|---|
| 1 | Vision 对齐 | 实现方向与 vision.md 有无冲突或偏离 |
| 2 | Spec 完整性 | 代码是否覆盖 spec.md 全部场景与边界 |
| 3 | Plan 真实性 | 标记 done 的任务是否在代码中落地（防虚标） |
| 4 | 逻辑正确性 | 业务逻辑错误、矛盾、遗漏分支、状态机缺陷 |
| 5 | Bug 猎杀 | 空值/undefined、竞态、资源泄漏、死循环、off-by-one |
| 6 | 错误处理 | 吞错、静默失败、错误传播链完整性、用户可见反馈 |
| 7 | Tech Stack 合规 | 对照 tech_stack.md：违禁模式、过时 API、硬编码 |
| 8 | 安全性 | 敏感信息泄露、输入未校验、注入风险、权限检查 |
| 9 | 性能 | 不必要全量导入/大循环/无用计算/内存泄漏/N+1 查询 |
| 12 | I18n 合规 | 如有I18n要求，需无硬编码字符串；须用 Key/字典引用 |
| 13 | Orphan .gitkeep | 目录已有其他文件时仍存在 .gitkeep — 须删除 |
| 14 | Spec-Code 漂移 | 接口/类型/行为与 spec.md 一致；手动变更已同步文档 |
| 17 | 测试有效性 | 新增/已有测试是否验证真实行为；是否存在只测调用次数、文件存在、对象非空、JSON 可解析、缺边界/负面路径的问题 |
[[WHEN: ui |
| 10 | Design 合规 | Token 使用；无硬编码魔法值；与 screens/S-XX.html 视觉一致 |
| 15 | UI 引用完整性 | ui.md 中 ref: screens/S-XX.html 指针是否仍有效 |
| 16 | Screens 误用检查 | 生产源码不得直接复制 `screens/` 下的 HTML/CSS/JS；必须用项目语言/框架/组件体系重新实现 |
]]
[[WHEN: data |
| 11 | 数据一致性 | 字段名/类型与 data_snapshot.json 一致 |
]]
输出按维度分组的发现列表，每项含级别、位置、描述。进入 step_3。
</step_2_review>

<step_3_classify>
[[INCLUDE: prompts/review/shared/issue-classification.md]]

[[INCLUDE: prompts/review/shared/action-routing.md]]
</step_3_classify>

<step_4_report>
**Pre-signoff Checklist**（写入文件前须逐项确认）:
□ 所有已呈现审查维度全部覆盖；不适用项已标 N/A
□ 每个 CRITICAL / WARNING 发现已附 `文件:行号` + 代码片段
□ 每个发现已附推荐修复命令（按 action-routing.md 路由表生成）
□ 报告结构：审查概要 → 发现列表（CRITICAL → WARNING → INFO）→ 统计摘要 → 修复工单汇总 → Next Steps

[[INCLUDE: prompts/review/shared/report-persistence.md]]

写入路径：`[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/review.md`（覆盖式）

输出审查报告（同时输出到对话和写入文件）+ Next Steps：

| 优先级 | 动作 | 说明 |
|---|---|---|
| 推荐 | /archi.change <ID> [发现描述] | 处理 CRITICAL / WARNING（路由器自动选 fix/edit/revise） |
| 可选 | /archi.code <ID> | 如有未完成项，继续实现 |
</step_4_report>

</protocol_review_task>

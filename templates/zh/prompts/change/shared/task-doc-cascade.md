# 适用场景

- edit 子协议主流程: 单任务的 spec / ui / plan 同步更新。
- revise 子协议 Phase 2: 对每个受影响 Task 应用本流程。

# 级联更新动作

## 更新 spec.md

- 按 context（edit 场景）或全局变更影响（revise 场景）修改 Gherkin Scenarios / 接口定义 / 约束条件。
- 保留 frontmatter，禁破坏 Spec-Status / 创建日期 等元数据。
- 变更须留痕: 在 spec.md 末尾「Change Log」段追加一行 <Date> | <子协议> | <变更摘要>。

[[WHEN: ui |
## 同步 ui.md + screens/

`screens/` 仍然只是 UI 概念稿与验收参照；本流程可以更新参照文件，但不得要求后续编码直接复制其中 HTML/CSS/JS。

按变更类型分发处理:

| 变更类型 | 判定标准 | 处理方式 |
|---|---|---|
| 无屏幕影响 | 仅逻辑/数据/契约变更 | 仅改 spec.md |
| 轻微 UI 调整 | 新增/修改状态、弹窗、局部区域 | [[SKILL: archi-ui-wireframe | 局部更新模式]] [[NO-SKILL: （请阅读 [[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md，并在当前上下文按其协议执行）]]；输出 MODIFIED: screens/S-XX.html |
| 屏幕结构变更 | 布局重构、新增屏幕、导航变化 | 同上，结构性变更 |
| 功能缩减 | 屏幕/区域整体移除 | 同上；输出 REMOVED: screens/S-XX.html |
]]

## 追加 plan.json Phase

[[INCLUDE: prompts/change/shared/plan-phase-append.md]]

# 输出契约

- 每个被修改文件输出 MODIFIED: <file> — <摘要>。
- 一次级联完整结束后输出该 Task 的更新摘要表（spec / ui / plan / status）。

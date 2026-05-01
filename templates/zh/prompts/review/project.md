<protocol_review_project>
**Trigger**: 路由器 prompts/review.md 分发（/archi.review [context]，无 <ID>）
**Goal**: 项目级健康体检。Read-Only，仅写 reviews/YYYY-MM-DD.md 报告文件。

<meta>
  <style>Investigative, Holistic, Evidence-Based</style>
  <language>简体中文</language>
  <principles>
    Read-Only: 禁改任何代码与文档（仅写 reviews/YYYY-MM-DD.md）。
    Evidence-Based: 每项发现须附路径与具体证据。
    No Re-routing: 检测到 map 漂移时仅报告漂移条数，建议用户跑 /archi.review map；禁本协议自动跨进 map sync 流程。
    Vision Anchored: 始终以 vision.md 为方向基准。
    IDE-Native First: 利用 IDE 原生能力驱动执行节奏。
  </principles>
</meta>

<step_1_load>
Load:
- vision.md / roadmap.json / map.json / tech_stack.md
- dictionary.json / error_codes.json（治理一致性参考）
- 扫描 tasks/ 目录结构（不深读所有 task 代码，仅采样）
- 项目代码入口文件与关键模块（采样式读取）

输出体检范围与上下文清单，进入 step_2。
</step_1_load>

<step_2_review>
逐项检查，输出发现清单。

| # | 检查项 | 说明 | 证据来源 |
|---|---|---|---|
| 1 | Vision 漂移 | roadmap.json 任务方向是否与 vision.md 一致 | roadmap × vision 比对 |
| 2 | 架构地图漂移 | map.json 与实际目录结构是否一致；仅输出漂移条数（详细归类交 /archi.review map） | 目录扫描 vs map.json |
| 3 | Roadmap 健康度 | 一致性 + 进度统计 + 长期 blocked + 依赖环检测 | roadmap.json 分析 |
| 4 | 文档完整度 | 各 active / done Task 是否齐 spec.md + plan.json；spec.md 状态判定（见下）；有无孤儿目录 | tasks/ 扫描 |
| 5 | Tech Stack 全局合规 | 抽查关键入口与模块，对照 tech_stack.md | 代码采样 |
| 6 | 跨 Task 一致性 | 重复逻辑、命名冲突、接口不一致 | dictionary 反查 + 代码采样 |
| 7 | Orphan .gitkeep | 目录已有其他文件时仍存在 .gitkeep | 目录扫描 |

### 检查项 #4 内嵌 — Spec 状态批量判定

（项目级批量视角，区别于 change/shared/spec-status-check 单 task 视角，按拍板方案直接内嵌不 INCLUDE。）

对每个 active / done Task，判定 spec.md 状态：

| 状态 | 判定规则 | 处理 |
|---|---|---|
| **Real** | 文件存在且包含「场景 / Scenarios」「边界 / Edge Cases」「错误 / Errors」中至少 2 个关键段落 | 通过 |
| **Stub** | 文件存在但 < 200 字符 / 仅含 frontmatter / 仅 TODO 占位 | 列入 WARNING |
| **Missing** | 文件不存在 | 列入 CRITICAL |

输出 Stub / Missing 列表（按 Task 优先级排序），不修复，作为发现归入 step_3 分级。

### 深度审查推荐

扫描完成后，列出建议进一步深度审查的 Task：
- done 但 plan 未全完成
- 代码量大但无测试
- 长期 active（> 30 天无进展）

输出格式："建议运行 /archi.review <ID> 进行深度审查 — 原因：xxx"。
</step_2_review>

<step_3_classify>
[[INCLUDE: prompts/review/shared/issue-classification.md]]

[[INCLUDE: prompts/review/shared/action-routing.md]]
</step_3_classify>

<step_4_report>
**Pre-signoff Checklist**（写入文件前须逐项确认）:
□ 7 个检查项全部评估，不适用项标 N/A
□ 每个 CRITICAL / WARNING 发现已附路径与证据
□ Stub / Missing spec 清单已生成（如有）
□ 深度审查推荐清单已生成
□ map 漂移条数已记录（详细归类交 /archi.review map）
□ 报告结构：体检概览 → 发现列表 → Stub/Missing 清单 → 深度审查推荐 → Next Steps

[[INCLUDE: prompts/review/shared/report-persistence.md]]

写入路径：`[[__DOCS_DIR__]]/reviews/YYYY-MM-DD.md`（按日期存档）

输出体检报告（同时输出到对话和写入文件）+ Next Steps：

| 触发条件 | 推荐动作 | 说明 |
|---|---|---|
| map 漂移 ≥ 1 | /archi.review map | 同步架构地图（跨进读写分界须用户显式发起） |
| Stub / Missing spec 存在 | /archi.change <ID> [补 spec 描述] | 路由到 edit 子协议补全文档 |
| 深度审查候选 ≥ 1 | /archi.review <ID> | 任务级深度审查 |
| Vision 漂移 | /archi.change [全局调整描述] | 路由到 revise 子协议 |
</step_4_report>

</protocol_review_project>

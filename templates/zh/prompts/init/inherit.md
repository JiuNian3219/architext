<protocol_inherit>
**Trigger**: `/archi.init` 路由到本文件（检测到有源码时）
**Phase**: Legacy Adoption
**Goal**: 逆向分析已有代码仓库，用分析结果填充框架文档骨架，将项目纳入管理。可选提供 Brief 以补充愿景/路线图。

<meta>
	<style>Analytical, Evidence-Based</style>
	<language>简体中文</language>
	<principles>
		Code-Driven: 代码为唯一真相源，禁凭空推测功能。
		Subagent Offloading: 代码分析全部在 archi-code-survey 独立上下文执行，主 agent 不读源码。
	</principles>
</meta>

<step_0_optional_brief>
调用方传入 `brief_path` 或检测到默认 brief 文件时执行，否则设 `has_brief=false` 直接进 step_1。

[[SUBAGENT: archi-brief-scan | 解析 brief_path，扫描资源，输出 brief_data + asset_inventory + unreachable]]
[[NO-SUBAGENT: archi-brief-scan | 解析 brief_path，扫描资源，输出 brief_data + asset_inventory + unreachable]]
[[NO-SKILL: 读取 skills/archi-brief-scan/SKILL.md 并自行执行]]

接管：
- `unreachable` 非空 → 输出可达性报告，等待用户选择
- 设 `has_brief = (status == "ok")`；brief_data / asset_inventory 注入上下文
- 进入 step_1
</step_0_optional_brief>

<step_1_code_survey>
[[SUBAGENT: archi-code-survey | 对项目根执行粗读/细读/术语提取三阶段分析，输出 code_analysis 结构化报告]]
[[NO-SUBAGENT: archi-code-survey | 对项目根执行粗读/细读/术语提取三阶段分析，输出 code_analysis 结构化报告]]
[[NO-SKILL: 读取 skills/archi-code-survey/SKILL.md 按 1a/1b/1c 三阶段执行；大型仓库可能超上下文窗口]]

接管：
1. 将 code_analysis 摘要输出结构化分析报告（项目概况 / 技术栈 / 架构模式 / 功能模块清单 / 共享基建 / 领域术语 / AI 不确定项）
2. **Gate**：用户确认或修正；未确认禁进入 step_2
</step_1_code_survey>

<step_2_supplementary>
仅当 step_1 有 AI 无法确定的项时执行。无歧义则跳过。

[[SKILL: archi-interview-protocol | 对歧义项提问，每题 3-5 选项 + `[Z] 自定义`，总问题数 ≤ 3]]
[[NO-SKILL: 读取 skills/archi-interview-protocol/SKILL.md 并自行执行]]
</step_2_supplementary>

<step_3_constitution>
[[SUBAGENT: archi-constitution-draft | 上下文传入 brief_data (step_0, has_brief=false 时为 null) + code_analysis (step_1) + feature_tags (architext.json)。AI 按 brief_data 是否为 null 适配数据源矩阵对应列。输出 writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SUBAGENT: archi-constitution-draft | 上下文传入 brief_data (step_0, has_brief=false 时为 null) + code_analysis (step_1) + feature_tags (architext.json)。AI 按 brief_data 是否为 null 适配数据源矩阵对应列。输出 writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SKILL: 读取 skills/archi-constitution-draft/SKILL.md 并自行执行]]
</step_3_constitution>

<step_4_verify>
[[SUBAGENT: archi-silent-audit | mode: init，审查 step_3 生成的全局文件（vision, tech_stack, roadmap, map, dictionary, stub specs 等）]]
[[NO-SUBAGENT: archi-silent-audit | mode: init，审查 step_3 生成的全局文件（vision, tech_stack, roadmap, map, dictionary, stub specs 等）]]
[[NO-SKILL: 读取 skills/archi-silent-audit/SKILL.md 按 mode: init 审查维度表执行]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_signoff>
[[INCLUDE: prompts/init/shared/signoff-common.md]]

## inherit 模式签收

附加 checklist：
□ 每个 LEG-xx 均有 `tasks/LEG-xx_<Slug>/spec.md`（Stub 格式，含关联文件列表）
□ Stub 覆盖率报告 — 输出 "N/M 个 LEG 任务为 Stub 状态"；从上下文 code_analysis 读 modules + importedBy，按被依赖次数排序推荐 Top 3 核心模块

执行完毕后向用户输出签收摘要：
- 标题一行：遗产纳管完成
- 六段正文：项目概况（features / 文件数 / 代码行数 / 核心模块数）/ Legacy 功能表（LEG-xx ID + 名称 + 源码位置 + Spec 状态）/ Stub 覆盖率（N/M + Top 3 推荐）/ AI 补全项（按置信度分层）/ Next Steps
- Next Steps 清单：首推 `/archi.change LEG-xx <补核心模块 spec>`；可选 `/archi.plan <file>` 规划新功能 / `/archi.plan <ID>` 单任务规划
[[WHEN: ui | 首推项改为 `/archi.ui`（UI 项目 Adopt 模式优先生成 screens/ 目录） ]]
</step_5_signoff>
</protocol_inherit>

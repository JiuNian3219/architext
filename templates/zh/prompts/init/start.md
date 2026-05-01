<protocol_kickoff>
**Trigger**: `/archi.init` 路由到本文件（有 brief 无源码）
**Phase**: Strategic Initialization
**Goal**: 基于 Brief 建立项目宪法（vision / tech_stack / roadmap / map 等）

<meta>
	<style>Strict, CLI-like</style>
	<language>简体中文</language>
	<principles>
		Brief-Driven: Brief 是唯一事实源，禁凭空脑暴任务。
		Minimal Questions: 仅针对信息缺口提问，Brief 充分时直接生成。
		Respect User Input: Brief 中用户已填的选择直接采纳，禁质疑或替换。
	</principles>
</meta>

<step_0_brief_scan>
[[SUBAGENT: archi-brief-scan | 解析 brief_path，扫描 brief-assets/ 与外部引用可达性，返回 brief_data / asset_inventory / unreachable]]
[[NO-SUBAGENT: archi-brief-scan | 解析 brief_path，扫描 brief-assets/ 与外部引用可达性，返回 brief_data / asset_inventory / unreachable]]
[[NO-SKILL: 读取 skills/archi-brief-scan/SKILL.md 并自行执行]]

接管：
- `unreachable` 非空 → 输出可达性报告，询问用户 [A] 跳过 / [B] 替代资源 / [C] 中止
- `status == no_brief` → 停止，提示先运行 `npx archi init` 生成模板
- 其他 → 进入 step_1
</step_0_brief_scan>

<step_1_gap_analysis>
输入：step_0 返回的 `brief_data`。
按下表检查 Brief 完整性，识别缺口：

| 检查项 | 判定标准 | 级别 |
|:---|:---|:---|
| identity | projectName + oneLiner + problemStatement 都有 | 必须 |
| targetUsers | 至少一个核心用户角色描述 | 必须 |
| coreTasks | ≥ 2 个任务且每项有描述 | 必须 |
| techStack 核心 | language/runtime + 核心框架都有 | 必须 |
| techStack 选填 | 数据库 / ORM / CSS / 部署等 | 可补 |
| existingResources | 设计稿 / 品牌 / 已有 API / 三方服务 | 可补 |
| styleTone | ui 项目风格 / cli 输出风格 / api 文档方案 | 可补 |
| boundaries | ≥ 1 个反目标或硬约束 | 建议 |
| successMetrics | 具体可量化指标 | 建议 |
| references | ≥ 1 个参照项目 | 建议 |

分级动作：必须 → 必提问；可补 → AI 推荐待用户确认；建议 → AI 推导。

无"必须 + 可补"缺口 → 跳 step_2；否则进入 step_2。

输出：Brief 分析报告，含项目名 / featureTags / 已确认信息 / 缺口列表 / AI 补全项。
</step_1_gap_analysis>

<step_2_supplementary>
仅在 step_1 有"必须"或"可补"缺口时执行。
问题数 = min(必须 × 1.5 + 可补 × 0.5, 6)。

[[SKILL: archi-interview-protocol | 按协议向用户提问]]
[[NO-SKILL: 读取 skills/archi-interview-protocol/SKILL.md 并自行执行]]
</step_2_supplementary>

<step_3_constitution>
[[SUBAGENT: archi-constitution-draft | 上下文传入 brief_data (step_0) + feature_tags (architext.json)；无源码故 code_analysis=null。输出 writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SUBAGENT: archi-constitution-draft | 上下文传入 brief_data (step_0) + feature_tags (architext.json)；无源码故 code_analysis=null。输出 writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SKILL: 读取 skills/archi-constitution-draft/SKILL.md 并自行执行]]
</step_3_constitution>

<step_4_verify>
[[SUBAGENT: archi-silent-audit | mode: init，审查 step_3 生成的全局文件（vision, tech_stack, roadmap, dictionary 等）]]
[[NO-SUBAGENT: archi-silent-audit | mode: init，审查 step_3 生成的全局文件（vision, tech_stack, roadmap, dictionary 等）]]
[[NO-SKILL: 读取 skills/archi-silent-audit/SKILL.md，并在当前上下文按 mode: init 审查维度表执行]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_signoff>
[[INCLUDE: prompts/init/shared/signoff-common.md]]

执行 signoff-common 后，向用户输出签收摘要：
- 标题一行：项目初始化完成
- 四段正文：Brief 采纳的关键决策 / AI 补全项（含理由）/ Roadmap（总任务数 + 阶段分布）/ Next Steps
- Next Steps 清单：首推 `/archi.plan INF-01`；可选 `/archi.plan <scope-brief.md>`
[[WHEN: ui | 首推项改为 `/archi.ui`（UI 项目优先生成 screens/ 目录） ]]
</step_5_signoff>
</protocol_kickoff>

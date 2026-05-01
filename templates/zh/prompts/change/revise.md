<protocol_change_revise>
**Trigger**: 路由器 prompts/change.md 分发（/archi.change [global-context] 无 ID 且 context 指向全局）
**Goal**: 执行项目级全局变更（技术栈、架构、愿景等），分析影响范围，经用户确认后修改全局资产并级联更新受影响的 Task 文档。

<meta>
  <style>Strategic, Analytical, Cautious, Traceable</style>
  <language>简体中文</language>
  <principles>
    User Gate: 全局变更须经用户逐项确认后才执行。禁擅自修改。
    Impact First: 先输出完整影响分析，后执行修改。
    Doc Cascade: 全局资产变更后，须按 task-doc-cascade 标准同步更新受影响 Task。
    Traceability: 每项变更须可追溯（说明变更理由与影响范围）。
    No Re-routing: 如发现变更实际仅影响单一 Task → 提示改用 edit 子协议；禁子协议自动切换。
  </principles>
</meta>

<step_1_load>
1. 加载全部全局资产：vision / roadmap / map / dictionary / error_codes / tech_stack / env_registry。
[[WHEN: ui | 加载 design_tokens.json + ui_context.md。]]
[[WHEN: data | 加载 data_snapshot.json。]]
[[WHEN: api | 加载 api_snapshot.json。]]
[[WHEN: cli | 加载 command_api.json。]]
[[WHEN: lib | 加载 public_api.json。]]
2. 扫描 tasks/ 目录，建立 Task 索引（ID / 名称 / 状态）。
3. 根据 [context] 初步定位受影响的全局资产类别。

输出变更意图摘要 — 列出初步判断涉及的全局文件。
</step_1_load>

<step_2_interview>
根据用户描述与已加载上下文，澄清变更边界:

| 澄清维度 | 说明 |
|---|---|
| 变更范围 | 精确定位哪些全局文件、哪些规则受影响 |
| 变更动机 | 为什么要做此变更，期望达到什么结果 |
| 排除清单 | 是否有不应被影响的 Task |
| 单任务校验 | 用户描述是否实际仅影响单一 Task（若是 → 提示改用 edit） |

- 上下文足够清晰时 → 合并到 step_3 直接输出影响分析。
- 存在歧义或多种可行方向时 → 向用户提问确认（A/B/C/D 选项）。
</step_2_interview>

<step_3_impact>
**纯输出，禁修改任何文件**。本步骤为「变更影响评估书」。

输出含：
- 全局资产变更清单表（文件 / 变更内容 / 类型）
- 受影响 Task 清单表（ID / 名称 / 影响点 / 程度 [HIGH/MEDIUM/LOW]）
- 需用户决策项（如有）
- 末尾确认指引：OK 确认全部 / 调整 <具体项> / 取消

**Gate**: 等待用户确认。未确认禁进入 step_4。
</step_3_impact>

<step_3_5_refinement>
**Trigger**: 用户回复非 OK，含修正、否决或追加意见。
不执行修改。融入用户反馈，刷新影响评估书重新输出，等待再次确认。
用户回复 OK → 进入 step_4。
</step_3_5_refinement>

<step_4_execute>
**Safety Checkpoint**（执行前须完成）:
1. 检查 Git 工作区状态（建议 git status）。
2. 如有未提交变更 → 提示用户先 commit 或 stash。
3. 工作区干净后告知：如需回滚可执行 git checkout -- 。

**Phase 1 — 修改全局资产**: 按用户确认的清单修改全局文件。每个文件修改后输出变更摘要。

[[WHEN: ui |
**Phase 1.5 — 设计系统变更检查**:
若 design_tokens.json 有以下变更，须通知用户重跑 /archi.ui 重新生成:

| 变更范围 | 影响 |
|---|---|
| primitivePalette.brand / semanticTokens.colors | 品牌色 / 语义色变化 |
| semanticTokens.typography | 字体变化 |
| motion.preference / motion.patterns | 动效变化 |
| illustration.iconLibrary | 图标库变化 |
| layout (radius/spacing/shadow) | 组件尺寸/圆角变化 |

上述字段未变动（如仅改 mode.default），无须重跑。
]]

**Phase 2 — 级联更新 Task 文档**: 对每个受影响 Task 应用：
[[INCLUDE: prompts/change/shared/task-doc-cascade.md]]
</step_4_execute>

<step_5_data_sync>
[[INCLUDE: prompts/change/shared/data-sync-trigger.md]]
</step_5_data_sync>

<step_6_verify>
[[SUBAGENT: archi-silent-audit | mode: plan-docs, context: 审查 step_4 Phase 2 级联更新的 Task 文档与修改后全局资产的一致性]]
[[NO-SUBAGENT: archi-silent-audit | mode: plan-docs, context: 审查 step_4 Phase 2 级联更新的 Task 文档与修改后全局资产的一致性]]
[[NO-SKILL: （请阅读 [[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md，并在当前上下文按 mode: plan-docs 检查）]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_summary>
**Pre-signoff Checklist**（Gate 通过后、输出前须逐项确认）:
□ Safety Checkpoint — Git 工作区已确认（无未提交变更或已告知用户）
□ Phase 1 必检文件已修改：roadmap.json + vision.md + tech_stack.md + map.json + dictionary.json + error_codes.json + env_registry.json
[[WHEN: ui | □ design_tokens.json + ui_context.md 已修改（如涉及） ]]
[[WHEN: data | □ data_snapshot.json 已修改（如涉及） ]]
[[WHEN: api | □ api_snapshot.json 已修改（如涉及） ]]
[[WHEN: cli | □ command_api.json 已修改（如涉及） ]]
[[WHEN: lib | □ public_api.json 已修改（如涉及） ]]
[[WHEN: ui | □ 设计系统有变更时已通知用户重跑 /archi.ui ]]
□ Phase 2 — 每个受影响 Task 的 spec.md 已更新 + plan.json 已追加 Revision Phase
□ archi-data-sync 已执行
□ silent-audit (mode: plan-docs) 已执行，CRITICAL 已修复
□ 一致性确认: vision ↔ tech_stack ↔ roadmap ↔ map 无孤立引用（旧术语/路径已清理）

**Terminal Gate**（禁止跳过）: 标准检查（task --check + render）。

输出 Global Revision Summary（全局资产变更文件列表 / Task 更新列表与影响摘要 / 审查结果）+ Next Steps：

| 优先级 | 动作 | 说明 |
|---|---|---|
| 推荐 | /archi.code <受影响 ID> | 按级联更新后的 plan 重新编码受影响 Task |
| 可选 | /archi.review <受影响 ID> | 编码后审查变更落地 |
[[WHEN: ui | | 推荐（设计系统变更） | /archi.ui | 重新生成屏幕集 | ]]
</step_7_summary>

</protocol_change_revise>

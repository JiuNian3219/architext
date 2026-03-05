<protocol_revise>
  **Trigger**: `/archi.revise [context]`
  **Goal**: 执行项目级全局变更（技术栈、架构、愿景等），分析影响范围，经用户确认后修改全局资产并级联更新受影响的 Task 文档。

<constraints_cursor>
    **Mode Lock**: 本协议须在 **Agent Mode (Normal Mode)** 下执行。禁切换到 Plan Mode 或其他只读模式。
</constraints_cursor>

<meta>
    <style>Strategic, Analytical, Cautious, Traceable</style>
    <language>简体中文</language>
    <principles>
      1.  **User Gate**: 全局变更须经用户逐项确认后才执行。禁擅自修改。
      2.  **Impact First**: 先输出完整影响分析，后执行修改。
      3.  **Doc Cascade**: 全局资产变更后，须按 edit 标准同步更新受影响的 Task 文档。
      4.  **Traceability**: 每项变更须可追溯 — 说明变更理由和影响范围。
    </principles>
</meta>

<step_1_load>
    **Action**:
    1.  **Load**: 全部全局资产（vision/roadmap/map/dictionary/error_codes/02_tech_stack + 条件: design_tokens/data_snapshot）。
    2.  **Scan Task Index**: 扫描 tasks/ 目录，建立 Task 索引（ID、名称、状态）。
    3.  **Intent Analysis**: 根据 `[context]`，初步定位受影响的全局资产类别。

    **Output**: 变更意图摘要 — 列出初步判断涉及的全局文件，进入 step_2。
</step_1_load>

<step_2_interview>
    **Role**: 首席架构师
    **Action**:
    根据用户描述和已加载上下文，澄清变更边界:

    | 澄清维度 | 说明 |
    |:---|:---|
    | 变更范围 | 精确定位哪些全局文件、哪些规则受影响 |
    | 变更动机 | 为什么要做此变更，期望达到什么结果 |
    | 排除清单 | 是否有不应被影响的 Task |

    - 上下文足够清晰时 → 合并到 step_3 直接输出影响分析。
    - 存在歧义或多种可行方向时 → 向用户提问确认（A/B/C/D 选项）。
</step_2_interview>

<step_3_impact>
    **Constraint**: **纯输出，禁修改任何文件**。此步骤为「变更影响评估书」。

    **Output**: 变更影响评估 — 含全局资产变更清单表（文件/变更内容/类型）、受影响 Task 清单表（ID/名称/影响点/程度）、需用户决策项（如有）。末尾附确认指引：OK 确认全部；或标注需调整部分。

    **Gate**: 等待用户确认。未确认禁进入 step_4。
</step_3_impact>

<step_3_5_refinement>
    **Trigger**: 用户回复非 OK，含修正、否决或追加意见。
    **Action**: 不执行修改。融入用户反馈，刷新影响评估书重新输出，等待再次确认。
</step_3_5_refinement>

<step_4_execute>
    **Action**:

    **Safety Checkpoint** (执行前须完成):
    1. 检查 Git 工作区状态（建议执行 `git status`）。
    2. 如有未提交变更 → 提示用户先 commit 或 stash。
    3. 工作区干净后，告知用户：如需回滚，可执行 `git checkout -- .`。

    **Phase 1 — 修改全局资产**:
    按用户确认的清单修改全局文件。每个文件修改后输出变更摘要。

    **（仅ui项目） Phase 1.5 — 设计系统变更检查**:
    若 `design_tokens.json` 有以下变更，须通知用户需重跑 `archi-ui-wireframe` 重新生成：

    | 变更范围 | 影响 |
    |:---|:---|
    | `primitivePalette.brand` / `semanticTokens.colors` | 品牌色/语义色变化 |
    | `semanticTokens.typography` | 字体变化 |
    | `motion.preference` / `motion.patterns` | 动效变化 |
    | `illustration.iconLibrary` | 图标库变化 |
    | `layout` (radius/spacing/shadow) | 组件尺寸/圆角变化 |

    > 如上述字段未变动（如仅改 `mode.default`），无需重跑。

    **Phase 2 — 级联更新 Task 文档**:
    对每个受影响的 Task，按 `/archi.edit` 标准执行:
    1.  更新 `spec.md`。
    2.  （仅ui项目） 更新 `ui.md`；如屏幕结构受影响，[[SKILL: archi-ui-wireframe|运行 skill（局部更新模式）同步更新]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并遵循其协议执行）]]。
    3.  在 `plan.json` 追加新 Phase: `Phase X: Global Revision — [变更主题] (<Date>)`。

    **Output**: 每个文件的变更摘要（全局 + Task）。
</step_4_execute>

<step_4_5_verify>
    **Role**: 独立审查官

    [[SUBAGENT: archi-silent-audit|mode: plan-docs, context: 审查 step_4 Phase 2 级联更新的 Task 文档，确保与修改后的全局资产一致]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，按 mode: plan-docs 的审查维度表逐项检查）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_5_verify>

<step_5_summary>
    **Role**: 首席审计官
    **Checklist**:
    1.  全局资产间一致性（vision ↔ tech_stack ↔ roadmap ↔ map）。
    2.  Task 文档与更新后的全局资产对齐。
    3.  无孤立引用（dictionary/map 中旧术语/路径是否已清理）。

    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。

    **Action** (Gate 通过后):
    1.  输出变更总结。

    **Output**: Global Revision Summary — 含全局资产变更文件列表、Task 更新列表及影响摘要、审计结果、Next Steps 表格。
</step_5_summary>

</protocol_revise>

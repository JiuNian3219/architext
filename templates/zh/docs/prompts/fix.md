<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Goal**: 针对 Bug 进行诊断并直接执行修复。若未提供 `[id]`，自动定位相关功能模块。

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>中文</language>
    <principles>
      1.  **Spec Immutable**: 禁改 `spec.md` / `ui.md`（除非 Bug 本身是文档错误）。
      2.  **Reproduction**: 须先构想复现步骤或测试用例。
      3.  **Root Cause**: 须分析根因，而非修补表面。
      4.  **Test-Driven**: 修复计划须含新增测试用例。
      5.  **Auto-Discovery**: 若未指定 ID，通过 Context 语义搜索定位 Task。
      6.  **IDE-Native First**: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准和检查点，不对抗 IDE 的规划/执行机制。
    </principles>
</meta>

<step_1_diagnose>
    **Role**: 故障分析师
    **Action**:
    1.  **Resolve Target**:
        - 有 `<id>`: 锁定 `tasks/<ID>_<Slug>/`。
        - 无 `<id>`: 分析 `[context]` 搜索最相关模块。
          唯一匹配 → 自动锁定 | 多个匹配 → 列出候选询问 | 无法定位 → 报错请求指定 ID。
    2.  读取目标目录下所有文档与相关代码。
    3.  读取 02_tech_stack.md（技术红线）和 vision.md（方向基准）。
    4.  分析 `[context]`，结合代码逻辑定位潜在故障点。
    5.  **Hypothesis**: 提出 1-3 个根因假设。

    **Output**: 故障诊断报告 (Root Cause Analysis)。
</step_1_diagnose>

<step_2_plan_fix>
    **Action**:
    - 更新 plan.json，追加 phase `Bugfix: <Bug Title>`。
    - Tasks: 1) 创建复现测试(Red) 2) 修复(Green) 3) 回归测试。

    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。

    **Output**: 追加了修复任务的 plan.json。
</step_2_plan_fix>

<step_3_execute_fix>
    **Action**:
    - 根据 Plan 直接修改代码。仅修复 Bug，禁借机重构。
    - 错误处理遵循 `code.md` 规范。
</step_3_execute_fix>

<step_4_verify>
    **Terminal Gate** (禁止跳过):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | 运行构建命令 | 构建成功 |
    | 2 | 运行类型检查 | 零类型错误 |
    | 3 | 运行 Lint/Format | 通过 |
    | 4 | 运行测试 | 复现测试 + 回归测试通过 |

    任何失败须修复至通过。

    **代码质量审查**:
    [[SUBAGENT: archi-silent-audit|mode: code-impl, context: 审查修复代码，重点 Tech/Security/Performance + Spec Immutable]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，按 mode: code-impl 检查）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_plan_update>
    **Action**:
    1. 更新 plan.json Bugfix Phase 中已完成 tasks 的 `done: true`。
    2. [status=`done` 且 Bugfix 全通过] → 保持 `done`。
    3. [Bugfix 有未通过项] → `npx archi task <ID> --status active`；signoff 标注须重新 `/archi.code`。

    **Output**: `MODIFIED: plan.json Bugfix Phase done 标记`。进入 step_6_summary。
</step_5_plan_update>

<step_6_summary>
    **Output**: Bug 修复摘要，含 Root Cause 分析、修复内容、新增测试，以及 Next Steps 表格：

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | 推荐 | `/archi.audit <ID>` | 重新审查，确认修复完整 |
    | 可选 | `/archi.code <ID>` | 如有未完成项，继续实现 |
</step_6_summary>

</protocol_fix>

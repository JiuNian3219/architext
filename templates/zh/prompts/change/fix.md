<protocol_change_fix>
**Trigger**: 路由器 prompts/change.md 分发（/archi.change [id] <bug-context>）
**Goal**: 针对 Bug 进行诊断并直接执行修复。若未提供 <id>，自动定位相关 Task。

<meta>
  <style>Diagnostic, Surgical, Spec-Compliant</style>
  <language>简体中文</language>
  <principles>
    Spec Immutable: 禁改 spec.md / ui.md（如 bug 实为文档错误，须切换至 edit 子协议）。
    Reproduction First: 须先构想复现步骤或测试用例。
    Root Cause: 须分析根因，禁表面修补。
    Test-Driven: 修复计划须含新增测试用例。
    No Re-routing: 如发现是 spec 错误（非 bug），停下提示用户改用 /archi.change <ID> 走 edit；禁子协议自动切换。
    IDE-Native First: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准与检查点。
  </principles>
</meta>

<step_1_load>
Resolve Target:
- 有 <id> → 锁定 tasks/<ID>_<Slug>/。
- 无 <id> → [[INCLUDE: shared/auto-discovery.md]]

**Spec Readiness Gate**:
- `Spec-Status: Full` 或无该字段（兼容旧文档）→ 继续诊断。
- `Spec-Status: Stub` / `spec.md` 明显缺少行为边界 → 停下，不在 fix 中补文档；提示用户先运行 `/archi.change <ID> 补全 spec：<当前 bug 相关行为边界>`，再回到 fix。
- `spec.md` 缺失 → 停下，提示用户先运行 `/archi.change <ID> 补全缺失 spec`。

读取目标目录下所有文档与相关代码，及项目上下文（tech_stack / vision / error_memory，详见 00_system.md 数据治理规则）。结合 [context] 与代码逻辑定位潜在故障点，进入 step_2。
</step_1_load>

<step_2_diagnose>
提出 1-3 个根因 Hypothesis，每条须含：故障假设描述 / 支持证据（代码片段、错误日志、spec 行为差异）/ 验证方法（如何确认或排除）。

**Spec-Truth 检查**：Hypothesis 指向「spec 写的行为代码没实现 / 代码与 spec 不符」→ 继续 fix。
**Spec-Drift 检查**：如发现「spec 没写这个行为，但用户期望存在」或「spec 与用户期望冲突」→ 停下，提示「这是 spec 缺失/偏差，建议改用 /archi.change <ID> 走 edit」，终止本子协议。
</step_2_diagnose>

<step_3_plan>
追加 plan.json 一个 Bugfix Phase，强制三件套（Reproduction Test → Fix Implementation → Regression Test）。

[[INCLUDE: prompts/change/shared/plan-phase-append.md]]
</step_3_plan>

<step_4_execute>
按 Plan 实施修复：先写复现测试（Red）→ 修代码（Green）→ 跑回归测试。仅修复 Bug，禁借机重构。错误处理遵循 code.md 规范。实时更新 plan.json 中已完成 task 的 done: true。
</step_4_execute>

<step_5_data_sync>
[[INCLUDE: prompts/change/shared/data-sync-trigger.md]]
</step_5_data_sync>

<step_6_verify>
**Terminal Gate**（禁止跳过）:

| 步骤 | 命令 | 通过条件 |
|---|---|---|
| 1 | 运行构建命令 | 构建成功 |
| 2 | 运行类型检查 | 零类型错误 |
| 3 | 运行 Lint/Format | 通过 |
| 4 | 运行测试 | 复现测试 + 回归测试通过 |

任何失败须修复至通过。

[[SUBAGENT: archi-silent-audit | mode: code-impl, context: 审查修复代码，重点 Tech / Security / Performance + Spec Immutable]]
[[NO-SUBAGENT: archi-silent-audit | mode: code-impl, context: 审查修复代码，重点 Tech / Security / Performance + Spec Immutable]]
[[NO-SKILL: （请阅读 [[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md，并在当前上下文按 mode: code-impl 检查）]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_summary>
**Pre-signoff Checklist**（输出前须逐项确认）:
□ Hypothesis 已输出，根因已分析（非表面修补）
□ Spec-Drift 检查已通过（确认是真 bug 而非 spec 缺失）
□ plan.json Bugfix Phase 已追加（含复现测试 + 修复 + 回归测试）
□ 复现测试已创建并验证（Red → Green）
□ 代码修复仅针对 Bug，无借机重构
□ archi-data-sync 已执行
□ 构建 / 类型检查 / Lint / 测试全部通过
□ silent-audit (mode: code-impl) 已执行，CRITICAL 已修复
□ plan.json Bugfix Phase 内 task 的 done 标记已更新；未通过项已 reset → active

输出 Bug 修复摘要（Root Cause / 修复内容 / 新增测试）+ Next Steps：

| 优先级 | 动作 | 说明 |
|---|---|---|
| 推荐 | /archi.review <ID> | 重新审查，确认修复完整 |
| 可选 | /archi.code <ID> | 如有未完成项，继续实现 |
</step_7_summary>

</protocol_change_fix>

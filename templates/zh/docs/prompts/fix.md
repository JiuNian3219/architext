<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: 针对 Bug 进行诊断并直接执行修复。若未提供 `[id]`，自动定位相关功能模块。

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>中文</language>
    <principles>
      1.  **Spec Immutable**: 禁改 `spec.md` / `ui.md`（除非 Bug 本身是文档错误）。
      2.  **Reproduction**: 须先构想复现步骤或测试用例。
      3.  **Root Cause**: 须分析根因，而非修补表面。
      4.  **Test-Driven**: 修复计划须含新增测试用例。
      5.  **Auto-Discovery**: 若未指定 ID，通过 Context 语义搜索定位 Feature。
    </principles>
</meta>

<step_1_diagnose>
    **Role**: 故障分析师
    **Action**:
    1.  **Resolve Target**:
        - 有 `<id>`: 锁定 `features/<ID>_<Slug>/`。
        - 无 `<id>`: 分析 `[context]` 搜索最相关模块。
          唯一匹配 → 自动锁定 | 多个匹配 → 列出候选询问 | 无法定位 → 报错请求指定 ID。
    2.  读取目标目录下所有文档 (`spec.md`, `ui.md`, `plan.json`) 与相关代码。
    3.  分析 `[context]`，结合代码逻辑定位潜在故障点。
    4.  **Hypothesis**: 提出 1-3 个根因假设。

    **Output**: 故障诊断报告 (Root Cause Analysis)。
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: Tech Lead
    **Action**:
    - 更新 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/plan.json`，在 `phases` 中追加 Bugfix Phase。
    - Tasks: 1) 创建复现测试(Red) 2) 修复(Green) 3) 回归测试。

    **Output**: 追加了修复任务的 plan.json，运行 `npx archi render` 更新视图。
</step_2_plan_fix>

<step_3_execute_fix>
    **Role**: 资深工程师 (Surgical Fix — 仅改 Bug，禁扩散)
    **Action**:
    - 根据 Plan 直接修改代码。
    - 仅修复 Bug，禁借机重构或改无关代码。
    - 错误处理遵循 `code.md` 规范（禁吞错/禁静默失败）。
</step_3_execute_fix>

<step_4_verify>
    **Role**: QA 工程师
    **Action**: 执行与 `/archi.code` 相同的验证流程:

    | 检查项 | 要求 |
    |:---|:---|
    | **Build** | 构建成功 |
    | **Type Check** | 零类型错误 |
    | **Lint/Format** | 通过 Lint 和 Format |
    | **Test** | 复现测试 + 回归测试通过 |

    任何失败须修复至通过。
</step_4_verify>

<step_5_summary>
    **Output**: Bug 修复摘要，含 Root Cause 分析、修复内容、新增测试、Next Steps 表格。
</step_5_summary>

</protocol_fix>

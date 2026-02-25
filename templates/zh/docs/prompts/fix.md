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
    3.  读取 `02_tech_stack.md`（确保修复方式不违反技术红线）和 `[[__DOCS_DIR__]]/global/vision.md`（确保修复方向不偏离项目愿景）。
    4.  分析 `[context]`，结合代码逻辑定位潜在故障点。
    5.  **Hypothesis**: 提出 1-3 个根因假设。

    **Output**: 故障诊断报告 (Root Cause Analysis)。
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: Tech Lead
    **Action**:
    - 更新 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/plan.json`，在 `phases` 数组中追加 phase 对象，`name` 为 `Bugfix: <Bug Title>`。
    - Tasks: 1) 创建复现测试(Red) 2) 修复(Green) 3) 回归测试。

    **Terminal Gate** (禁止跳过，须在 step_5 输出前全部完成):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | `npx archi render` | `.md` 视图生成完成 |

    **Output**: 追加了修复任务的 plan.json。
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
    **Terminal Gate** (禁止跳过，须在 step_5 输出前全部完成):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | 运行构建命令 | 构建成功 |
    | 2 | 运行类型检查 | 零类型错误 |
    | 3 | 运行 Lint/Format | 通过 |
    | 4 | 运行测试 | 复现测试 + 回归测试通过 |

    任何失败须修复至通过。
</step_4_verify>

<step_4_5_plan_update>
    **Role**: Tech Lead
    **Action**:
    1. 更新 `plan.json`：将 Bugfix Phase 中已完成的 tasks 的 `done` 设为 `true`。
    2. [当前 status=`done` 且 Bugfix Phase 全部通过] → 保持 `done` 不变。
    3. [Bugfix Phase 有未通过项] → 运行 `npx archi task <ID> --status active`；signoff 输出中标注须重新 `/archi.code` 完成剩余修复。

    **Output**: `MODIFIED: plan.json Bugfix Phase done 标记`（如状态变更，附 `MODIFIED: roadmap.json <ID>.status`）。
</step_4_5_plan_update>

<step_5_summary>
    **Output**: Bug 修复摘要，含 Root Cause 分析、修复内容、新增测试，以及 Next Steps 表格：

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | 推荐 | `/archi.audit <ID>` | 重新审查，确认修复完整且无新引入问题 |
    | 可选 | `/archi.code <ID>` | 如有 Bugfix Phase 未完成项，继续实现 |
</step_5_summary>

</protocol_fix>

<protocol_fix>
  **Trigger**: `/archi.fix [id] <context>`
  **Goal**: 针对特定模块的 Bug (`[context]`) 进行诊断，并在不修改 Spec 的前提下**直接执行修复**。若未提供 `[id]`，AI 应尝试自动定位相关功能模块。

<meta>
    <style>Diagnostic, Surgical, Spec-Compliant</style>
    <language>中文</language>
    <principles>
      1.  **Spec Immutable**: 严禁修改 `1.spec.md` 或 `2.ui.md`（除非 Bug 本身是文档错误）。
      2.  **Reproduction**: 必须先构想复现步骤或测试用例。
      3.  **Root Cause**: 必须分析根本原因，而非仅仅修补表面。
      4.  **Test-Driven**: 修复计划必须包含新增测试用例 (Unit/Integration)。
      5.  **Auto-Discovery**: 若用户未指定 ID，优先通过 Context 语义搜索定位 Feature。
    </principles>
</meta>

<step_1_diagnose>
    **Role**: 侦探 (Debugger)
    **Action**:
    1.  **Resolve Target**:
        - 若提供 `<id>`: 锁定目标 `features/<id>_<name>/`。
        - 若未提供 `<id>`: 分析 `[context]`，在 `features/` 目录下搜索最相关的功能模块。
          - ➡️ 找到唯一匹配: 自动锁定。
          - ➡️ 找到多个匹配: 列出候选列表并询问用户。
          - ➡️ 无法定位: 报错并请求用户指定 ID。
    2.  读取目标目录下的所有文档 (`1.spec.md`, `2.ui.md`, `3.plan.md`) 与相关代码。
    3.  分析 `[context]` 描述，结合代码逻辑定位潜在故障点。
    4.  **Hypothesis**: 提出 1-3 个可能的根本原因假设。

    **Output**: 故障诊断报告 (Root Cause Analysis)。
    **Bridge**: "根因已锁定 (Feature: <Name>)，正在制定外科手术式修复方案……"
</step_1_diagnose>

<step_2_plan_fix>
    **Role**: 医生
    **Action**:
    - 更新 `[[__DOCS_DIR__]]/features/<id>_<name>/3.plan.md`。
    - 追加 `### Bugfix: <Bug Title>` 章节。
    - **Tasks**:
      1.  Create Reproduction Test Case (Red).
      2.  Apply Fix (Green).
      3.  Regression Test.
    
    **Output**: 追加了修复任务的 `3.plan.md`。
</step_2_plan_fix>

<step_3_draft_patch>
    **Role**: 资深工程师
    **Action**:
    - 虽然不直接执行 (由 `/archi.code` 负责)，但在此步骤提供具体的 **Code Suggestion** 或 **Patch Preview**。
    - 展示具体的代码修改思路（Diff 形式）。

    **Output**: 修复代码预览 (Preview)。
</step_3_draft_patch>

<step_3_execute_fix>
    **Role**: 外科医生
    **Action**:
    - **Apply Fix**: 根据 Plan 直接修改代码。
    - **Constraint**: 仅修复 Bug，**禁止**借机重构或修改无关代码。
    - **Error Handling**: 确保修复代码遵循 `code.md` 的错误处理规范 (禁止吞错/禁止仅打印日志后继续)。
</step_3_execute_fix>

<step_4_verify>
    **Role**: 测试员
    **Action**:
    - **Protocol Check**: 执行与 `/archi.code` 相同的 **Validate** 步骤。
    - **Step 1: Build Check**: 构建项目。
    - **Step 2: Type Check**: 必须通过类型检查。
    - **Step 3: Lint/Format**: 必须通过 Lint 和 Format。
    - **Step 4: Test**: 运行复现测试和回归测试。
    
    **Rule**: 任何验证失败不得标记任务完成；需回滚或修复至通过。
</step_4_verify>

<step_5_summary>
    **Action**: 汇总修复结果并输出清晰的下一步指引。

    **Output Template**:
    ```markdown
    ## ✅ Bug Fixed

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Bug Description**: `<Brief description>`

    ### 🐛 Diagnosis (根因分析)
    **Root Cause**: [根本原因分析]
    **Impact**: [影响范围]

    ### ✅ Fix Applied
    * **Files Modified**: 
      * `src/...` (修复内容简述)
      * `tests/...` (新增测试用例)
    * **Plan Updated**: `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md` (已追加修复任务)

    ### 🧪 Verification Results
    * ✅ Reproduction Test: Passed
    * ✅ Regression Test: Passed
    * ✅ Lint/Type Check: Passed
    * ✅ Build: Passed

    ---

    ### 🧭 Next Steps (下一步操作)

    | 场景 | 推荐操作 | 说明 |
    |:---|:---|:---|
    | **继续开发** | `/archi.code <ID>` | 如果还有未完成的功能开发任务 |
    | **测试验证** | 运行完整测试套件 | 确保修复没有引入新的问题 |
    | **发现新 Bug** | `/archi.fix <ID> [bug描述]` | 如果还有其他问题需要修复 |
    | **需求变更** | `/archi.edit <ID> [变更描述]` | 如果需要调整功能需求 |
    | **查看帮助** | `/archi.help` | 显示完整指令手册 |

    > 💡 **推荐**: 
    > - 如果修复已完成且验证通过，可以继续运行 `/archi.code <ID>` 完成其他开发任务。
    > - 建议运行完整的测试套件确保没有引入回归问题。
    ```
</step_5_summary>

</protocol_fix>

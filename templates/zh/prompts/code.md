<protocol_code>
  **Trigger**: `/archi.code <id>` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Goal**: 基于 `tasks/<id>_<Slug>/plan.json` 任务清单，完成功能开发；遵循 `tech_stack.md`[[WHEN: ui | 与 `design_tokens.json` ]]；通过构建、类型、Lint、格式化、测试与审查。

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>简体中文</language>
    <principles>
      1.  **Frontmatter Preservation**: 禁改已有文件的 YAML Frontmatter。
      2.  **Follow Conventions**: 仅用仓库已有库与模式；先读后改。
      3.  **Security First**: 禁引入/打印密钥；敏感信息不落盘。
      4.  **SOTA Pattern Check**: 拒绝过时写法；采用 tech_stack 定义的最佳实践。
      5.  **No Commit Policy**: 未经授权不提交；以补丁呈现变更。
      6.  **Static Check First**: 须通过所有静态检查(类型/Lint/格式化)。
      7.  **Plan Completion Gate**: 结束前验证 Plan 完成度。AI 可完成的任务须全部完成，仅豁免「人工介入」和「不可抗力」类。
      8.  **IDE-Native First**: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准和检查点，不对抗 IDE 的规划/执行机制。
    </principles>
</meta>

<step_1_resolve>
    **Action**:
    0.  **Context Pack Gate**: 优先消费 `00_system.md` Front Pipeline 产出的 Context Pack；缺失则先补齐。若 `missing_or_stale` 非空，先处理缺口或向用户说明。
    1.  **Resolve ID**: 从 Context Pack / roadmap.json 解析 `<id>` → Task Name、Slug、阶段/状态。
    2.  **Status Gate** — 仅 `active` 可直接进入 code 流程。若状态看似阻塞，先做状态校准，避免把“状态未同步”误判为“任务未完成”:

[[SUBAGENT: archi-task-state-reconcile | 当 `<ID>` 为 `pending` 或 `blocked`，或其 deps 未 done 时，按 mode=`target_active` 检查目标任务是否已完成 detail / 前置是否只是状态滞后。只返回 JSON 报告，不修改状态。]]
[[NO-SUBAGENT: archi-task-state-reconcile | 当 `<ID>` 为 `pending` 或 `blocked`，或其 deps 未 done 时，读取 `[[__DOCS_DIR__]]/skills/archi-task-state-reconcile/SKILL.md`，按 mode=`target_active` 在当前上下文执行；只返回 JSON 报告，不修改状态。]]
[[NO-SKILL: 当 `<ID>` 为 `pending` 或 `blocked`，或其 deps 未 done 时，先手动检查 `roadmap.json`、`tasks/<ID>_*/spec.md`、`tasks/<ID>_*/plan.json`、`npx archi plan <ID>` 和 `npx archi task --check`。证据显示只是状态滞后时，先运行推荐的 `npx archi task <ID> --status active/done` 后再重试；证据不足才拒绝。]]

        **Reconcile Handling**:
        - `status_stale_active` → 运行报告中的推荐命令（通常为 `npx archi task <ID> --status active`），再重新执行 Status Gate。
        - deps 返回 `status_stale_done` → 对对应 dep 运行推荐命令（通常为 `npx archi task <DEP_ID> --status done`），再重新执行 Status Gate。
        - `needs_plan` → 拒绝 code，提示先运行 `/archi.plan <ID>`。
        - `actually_incomplete` / `blocked` → 拒绝 code，并输出证据。
        - `inconclusive` → 不猜测，向用户说明需人工确认或补跑检查。

        | 状态 | 处理 |
        |:---|:---|
        | `active` | 通过，继续 |
        | `pending` | 先执行 Reconcile；若仍为 pending，则拒绝 — 提示先运行 `/archi.plan <ID>` |
        | `blocked` | 先执行 Reconcile；若仍为 blocked，则拒绝 — 前置依赖未完成 |
        | `done` | 拒绝 — 已完成，如需修改用 `/archi.change <ID>` |

    3.  **Load**: task docs (spec[[WHEN: ui | /ui ]]/design/plan) + project context (tech_stack[[WHEN: ui | /design_tokens/ui_context/screens]][[WHEN: data | /data_snapshot]][[WHEN: api | /api_snapshot]][[WHEN: cli | /command_api]][[WHEN: lib | /public_api]]) + refs（按 tags 匹配，仅读命中文件）。

    **Output**: 待实施任务的原子清单，标注依赖与顺序。
</step_1_resolve>

<step_2_plan>
    **Action**:
    生成执行蓝图（根据项目类型动态调整）：
    - **Phase A (Domain/Data/API)**: 数据模型/接口/校验
    - **Phase B (UI/Presentation)**: 组件结构/样式（仅用 Design Token）；非 UI 项目调整为对应展示层
    - **Phase C (Integration)**: 端到端串联（状态管理、路由、数据流、错误处理）

    每项任务写出完成判定标准：静态检查通过、测试通过、符合 tech_stack 规范。

    **Output**: 面向实施的原子任务列表(Checkbox)。
</step_2_plan>

<step_3_implement>
[[INCLUDE: shared/test-quality.md]]

    **Protocol**:
    - **Read First**: 修改前须读取目标文件；遵循项目现有代码风格。
    - **Use Existing Stack**: 仅用 `tech_stack.md` 声明的技术与库。
[[WHEN: ui |     - **UI Redlines**:
[[INCLUDE: shared/ui-redlines.md]]
    - **Screens Reference Only**: `[[__DOCS_DIR__]]/global/screens/` 仅是视觉/交互参照，禁复制其中 HTML/CSS/JS 到项目源码；必须用项目自身语言、框架、组件体系和样式方案重新实现。
]]
    - **Type-Safe**: 补齐类型定义；用项目技术栈的类型系统守护边界。
    - **Code Organization**: 遵循 `tech_stack.md` 架构模式与文件归位策略。
    - **Comments**: 解释 Why 而非 What。
    - **Naming**: 自解释命名；拒绝无意义名。
    - 仅Complex任务: **Design Adherence**: 存在 `design.md` 时，实现须严格遵循其状态机/流水线/协议；参数引用 § 3 的值；须满足 § 4 所有 Invariants。
    - **Error Handling**: 禁吞错/禁静默失败；须正确传播并给调用方可观测反馈。
    - **Robustness**: 显式处理边界(Loading/Error/Empty/Timeout)；禁只写 Happy Path。
    - **SOTA**: 遵循 tech_stack 最佳实践；拒绝明确禁止的过时模式。
    - **Scaffold Safety**: 非空目录须保护 `[[__DOCS_DIR__]]/`。
    - **.gitkeep Cleanup**: 向目录新增文件时删除 `.gitkeep`。
    - **Patch Output**: 以补丁形式输出变更，附 Code Reference。
    - **Progress Tracking**: 每完成一个 task 后，立即更新 `plan.json` 对应 `done: true`；禁 signoff 时批量更新。

    **Action**: 按 Phase A/B/C 逐项实施；产出完整、工程化的代码（含必要测试）。
</step_3_implement>

<step_4_validate>
    **Action** (失败须修复后重跑；命令以 `tech_stack.md` Section 5 为准；若未声明则按项目 package/config 推断):

    | Phase | 检查项 | 要求 |
    |:---|:---|:---|
    | **Static** | Build | 零编译错误 |
    | | Type Check | 零类型错误 |
    | | Lint | 零 Lint 错误（警告须说明原因） |
    | | Format | 符合格式规范（失败则自动修复后重检） |
    | **Test** | Existing Tests | 全部通过；禁破坏旧测试 |
    | | New Coverage | 为新增/修改的关键逻辑补充测试 |

    **Task Verification (硬性要求)**

    > 禁仅通过代码审查就标记完成；须实际运行目标功能并验证。
    > **优先读取 `notes.验证`**: 先读当前 task `notes` 末尾 `验证: [...]` 部分执行 e2e；无验证字段时按下表类型兜底。

    | 项目类型 | 验证动作 | 通过标准 |
    |:---|:---|:---|
[[WHEN: ui |     | 本任务涉及ui时 | 浏览器操作目标功能路径 | 渲染正常，交互无报错 | ]]
[[WHEN: api |     | 本任务涉及api时 | 调用新增/修改的 endpoint | 状态码与 Body 符合 spec | ]]
[[WHEN: cli |     | 本任务涉及cli时 | 执行目标命令（含正常+边界参数） | stdout 符合预期，exit code 正确 | ]]
[[WHEN: lib |     | 本任务涉及lib时 | 运行示例代码验证导出 API | 无运行时错误，返回值正确 | ]]
[[WHEN: mobile |     | 本任务涉及mobile时 | 模拟器/真机操作 | 界面正常，交互响应 | ]]
[[WHEN: desktop |     | 本任务涉及desktop时 | 启动应用操作 | 窗口正常，功能可用 | ]]

    **Evidence**: 须附验证结果（命令输出摘要/截图/错误日志）。
    **Output**: 每项检查 ✅/❌ 状态与原因；Task Verification 证据。
</step_4_validate>

<step_5_verify>

    **5A. 代码质量审查**:
[[SUBAGENT: archi-silent-audit|mode: code-impl, context: 审查 step_3 实现的代码（Tech/SOTA/Security/Performance + 条件维度）]]
[[NO-SUBAGENT: archi-silent-audit|mode: code-impl, context: 审查 step_3 实现的代码（Tech/SOTA/Security/Performance + 条件维度）]]
[[NO-SKILL: （请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，并在当前上下文按 mode: code-impl 的审查维度表逐项检查）]]

    **5B. 联动检查**:
[[SUBAGENT: archi-feature-relations|mode: check, context: 将本次实现的功能与 featureRelations sources 做语义对比]]
[[NO-SUBAGENT: archi-feature-relations|mode: check, context: 将本次实现的功能与 featureRelations sources 做语义对比]]
[[NO-SKILL: （请阅读 `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`，并在当前上下文按 mode: check 的逻辑执行）]]

    **5C. 数据治理同步**:
[[SUBAGENT: archi-data-sync|context: 扫描本次实现引入的新业务实体/错误码/Schema，按 00_system.md 规则增量同步]]
[[NO-SUBAGENT: archi-data-sync|context: 扫描本次实现引入的新业务实体/错误码/Schema，按 00_system.md 规则增量同步]]
[[NO-SKILL: （请阅读 `[[__DOCS_DIR__]]/skills/archi-data-sync/SKILL.md`，并在当前上下文按其协议执行同步）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_5_verify>

<step_6_signoff>
    **Terminal Gate** (禁止跳过):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | `npx archi plan <ID>` | 全部完成或仅豁免项；未通过禁签收，回到 step_3 |
    | 2 | `npx archi task --check` | 无 ERROR |
    | 3 | `npx archi render` | 视图生成成功 |
    | 4 | `npx archi task <ID> --status done` | 任务状态已更新 |

    **Action** (Gate 通过后):
    1.  确认 `plan.json` 各 task `done` 标记已全部更新。
    2.  **Drift Warning**: 对比代码变更与 `spec.md` 关键点位。发现超出 spec 覆盖范围 → 标注 `⚠️ Spec 漂移`，建议 `/archi.change <ID>`。
    3.  输出完成任务清单与补丁链接。
    4.  提供下一步建议。

    **Pre-signoff Checklist** (Output 前须逐项确认):
    □ plan.json — 每个 task done 标记已实时更新（非 signoff 时批量操作）
    □ Step 4 — 构建/类型检查/Lint/格式化 全部通过
    □ Step 4 — 每种项目类型的 Task Verification 已执行并附 Evidence
    □ Step 5A Silent Audit — 已执行，所有 CRITICAL 问题已修复
    □ Step 5B featureRelations 联动检查 — 已执行
      - 涉及修改的文件是否影响其他关联文件
    □ Step 5C 数据治理同步 — 已执行
      - dictionary.json + error_codes.json + env_registry.json — 必检
[[WHEN: ui |       - design_tokens.json + ui_context.md ]]
[[WHEN: data |       - data_snapshot.json ]]
[[WHEN: api |       - api_snapshot.json ]]
[[WHEN: cli |       - command_api.json ]]
[[WHEN: lib |       - public_api.json ]]
    □ Terminal Gate — npx archi plan <ID> 全部完成（仅豁免项除外）
    □ Terminal Gate — npx archi task --check 无 ERROR
    □ Terminal Gate — npx archi render 成功
    □ Terminal Gate — npx archi task <ID> --status done 已执行

    **Next-Step Gate**:
    - 当前 `<ID>` 完成后，首要推荐永远是 `/archi.review <ID>`，先审查刚完成的实现。
    - 检查后续 roadmap task 时，必须区分“待规划”和“可实现”：
      - 仅存在于 `roadmap.json`、状态为 `pending`、或缺少 `tasks/<NEXT_ID>_*/spec.md` / `plan.json` → 只能推荐 `/archi.plan <NEXT_ID>`。
      - 只有后续 task 状态为 `active`，且 `spec.md` / `plan.json` 已存在并通过 `npx archi plan <NEXT_ID>`，才允许推荐 `/archi.code <NEXT_ID>`。
    - 禁止把“下一个 pending task”写成 `/archi.code <NEXT_ID>`；未 detail 的 task 不能进入 code。

    **Output**: 完成摘要，含已完成任务、豁免项(如有)、Next Steps：

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | 推荐 | `/archi.review <ID>` | 对实现做独立审查 |
    | （有 Spec 漂移时） | `/archi.change <ID>` | 先更新文档再继续 |
    | （有后续未规划任务时） | `/archi.plan <下一个 pending ID>` | 先生成该任务 spec / plan |
    | （后续任务已 active 且文档完整时） | `/archi.code <下一个 active ID>` | 继续实现已规划任务 |
</step_6_signoff>

</protocol_code>

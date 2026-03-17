<protocol_code>
  **Trigger**: `/archi.code <id>` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Goal**: 基于 `tasks/<id>_<Slug>/plan.json` 任务清单，完成功能开发；遵循 `tech_stack.md`（仅ui项目: 同时遵循 `design_tokens.json`）；通过构建、类型、Lint、格式化、测试与审计。

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
    1.  **Resolve ID**: 从 roadmap.json 解析 `<id>` → Task Name、Slug、阶段/状态。
    2.  **Status Gate** — 仅 `active` 可进入 code 流程:

        | 状态 | 处理 |
        |:---|:---|
        | `active` | 通过，继续 |
        | `pending` | 拒绝 — 提示先运行 `/archi.plan <ID>` |
        | `blocked` | 拒绝 — 前置依赖未完成 |
        | `done` | 拒绝 — 已完成，如需修改用 `/archi.edit <ID>` |

    3.  **Load**: task docs (spec/ui/design/plan) + project context (tech_stack/design_tokens/data_snapshot/ui_context/screens/) + refs（按 tags 匹配，仅读命中文件）。

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
    **Protocol**:
    - **Read First**: 修改前须读取目标文件；遵循项目现有代码风格。
    - **Use Existing Stack**: 仅用 `tech_stack.md` 声明的技术与库。
    - （本任务涉及ui时）[[INCLUDE: shared/ui-redlines.md]]
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
    **Action** (失败须修复后重跑；命令以 `tech_stack.md` Section 5 为准):

    **Automated Check**: 检查 `scripts/validate`：
    - **存在** → 必须运行，结果以脚本输出为准
    - **不存在** → 按以下清单逐项执行

    > **Scripts Check**: 如 `scripts/` 目录不存在 → 建议先运行 `/archi.script` 生成自动化脚本。

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
    | 本任务涉及ui时 | 浏览器操作目标功能路径 | 渲染正常，交互无报错 |
    | 本任务涉及api时 | 调用新增/修改的 endpoint | 状态码与 Body 符合 spec |
    | 本任务涉及cli时 | 执行目标命令（含正常+边界参数） | stdout 符合预期，exit code 正确 |
    | 本任务涉及lib时 | 运行示例代码验证导出 API | 无运行时错误，返回值正确 |
    | 本任务涉及mobile时 | 模拟器/真机操作 | 界面正常，交互响应 |
    | 本任务涉及desktop时 | 启动应用操作 | 窗口正常，功能可用 |

    **Evidence**: 须附验证结果（命令输出摘要/截图/错误日志）。
    **Fallback**: 验证持续失败 → `scripts/dev-reset` → `scripts/dev-up` → 重试。

    **Output**: 每项检查 ✅/❌ 状态与原因；Task Verification 证据。
</step_4_validate>

<step_5_verify>
    **Role**: 独立审查官

    **5A. 代码质量审查**:
    [[SUBAGENT: archi-silent-audit|mode: code-impl, context: 审查 step_3 实现的代码（Tech/SOTA/Security/Performance + 条件维度）]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，按 mode: code-impl 的审查维度表逐项检查）]]

    **5B. 联动检查**:
    [[SUBAGENT: archi-feature-relations|mode: check, context: 将本次实现的功能与 featureRelations sources 做语义对比]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`，按 mode: check 的逻辑执行）]]

    **5C. 数据治理同步**:
    [[SUBAGENT: archi-data-sync|context: 扫描本次实现引入的新业务实体/错误码/Schema，按 00_system.md 规则增量同步]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-data-sync/SKILL.md`，按其执行协议操作）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_5_verify>

<step_6_signoff>
    **Terminal Gate** (禁止跳过):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | `npx archi plan <ID>` | 全部完成或仅豁免项；未通过禁签收，回到 step_3 |
    | 2 | `npx archi task <ID> --status done` | 任务状态已更新 |
    | 3 | 标准检查 (task --check + render) | 无 ERROR + 视图生成 |

    **Action** (Gate 通过后):
    1.  确认 `plan.json` 各 task `done` 标记已全部更新。
    2.  **Drift Warning**: 对比代码变更与 `spec.md` 关键点位。发现超出 spec 覆盖范围 → 标注 `⚠️ Spec 漂移`，建议 `/archi.edit <ID>`。
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
      - （仅ui项目）design_tokens.json + ui_context.md
      - （仅data项目）data_snapshot.json
      - （仅api项目）api_snapshot.json
      - （仅cli项目）command_api.json
      - （仅lib项目）public_api.json
    □ Terminal Gate — npx archi plan <ID> 全部完成（仅豁免项除外）

    **Output**: 完成摘要，含已完成任务、豁免项(如有)、Next Steps：

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | （如无 scripts/） | `/archi.script` | 生成自动化验证脚本（validate/dev-up/dev-reset） |
    | 推荐 | `/archi.audit <ID>` | 对实现做独立审查 |
    | （有 Spec 漂移时） | `/archi.edit <ID>` | 先更新文档再继续 |
    | （有后续 pending 任务时） | `/archi.plan <下一个 pending ID>` | 规划下一个任务 |
</step_6_signoff>

</protocol_code>

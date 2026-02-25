<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: 基于 `features/<id>_<Slug>/plan.json` 任务清单，完成功能开发；遵循 `02_tech_stack.md`（[?UI] 同时遵循 `design_tokens.json`）；通过构建、类型、Lint、格式化、测试与审计。

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
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系统分析师
    **Action**:
    1.  **Resolve ID**: 从 `[[__DOCS_DIR__]]/global/roadmap.json` 解析 `<id>` → Feature Name、Slug、阶段/状态。
    2.  **Status Gate** — 仅 `active` 可进入 code 流程:

        | 状态 | 处理 |
        |:---|:---|
        | `active` 🟢 | 通过，继续 |
        | `pending` ⏳ | 拒绝 — 提示先运行 `/archi.plan <ID>` |
        | `blocked` 🧱 | 拒绝 — 前置依赖未完成 |
        | `done` ✅ | 拒绝 — 已完成，如需修改用 `/archi.edit <ID>` |

    3.  **Load Context** (用 Roadmap `📁 Slug` 定位):
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — 逻辑与场景
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — 本任务 UI 范围声明(如存在)
        - `[[__DOCS_DIR__]]/global/ui_concept.html` — 全局视觉参考，**[?UI] 优先读取**（含屏幕结构、设计语言、动效）
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.json` — 任务拆解（含 `notes` 速记，执行时须参照）
        - `02_tech_stack.md` — 技术红线
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`

    **Output**: 待实施任务的原子清单，标注依赖与顺序。
</step_1_resolve>

<step_2_plan>
    **Role**: Tech Lead
    **Action**:
    生成执行蓝图（根据项目类型动态调整）：
    - **Phase A (Domain/Data/API)**: 数据模型/接口/校验
    - **Phase B (UI/Presentation)**: 组件结构/样式（仅用 Design Token）；非 UI 项目调整为对应展示层
    - **Phase C (Integration)**: 端到端串联（状态管理、路由、数据流、错误处理）

    每项任务写出完成判定标准：静态检查通过、测试通过、符合 tech_stack 规范。

    **Output**: 面向实施的原子任务列表(Checkbox)。
</step_2_plan>

<step_3_implement>
    **Role**: 资深工程师
    **Protocol**:
    - **Read First**: 修改前须读取目标文件；遵循项目现有代码风格。
    - **Use Existing Stack**: 仅用 `02_tech_stack.md` 声明的技术与库。
    - [?UI] **Design Tokens Only**: 样式严格使用 Token/Preset 定义的视觉模式；禁硬编码魔法值（颜色、尺寸、间距等）。
    - **Type-Safe**: 补齐类型定义；用项目技术栈的类型系统守护边界。
    - **Code Organization**: 遵循 `02_tech_stack.md` 中定义的架构模式与文件归位策略。
    - **Comments**: 解释 Why 而非 What；拒绝废话注释。
    - **Naming**: 自解释命名；拒绝 `a`, `b`, `tmp` 等无意义名（循环变量 `i` 除外）。
    - **Error Handling**: 禁吞错/禁静默失败；须正确传播错误并给调用方可观测反馈（UI: Toast；CLI: Exit Code；API: Status Code + Body）。
    - **Robustness**: 显式处理边界(Loading/Error/Empty/Timeout)；禁只写 Happy Path。
    - **SOTA**: 遵循 tech_stack 定义的最佳实践；拒绝明确禁止的过时模式。
    - **Scaffold Safety**: 脚手架在非空目录可能覆盖文件 — 须在新目录生成并保护 `[[__DOCS_DIR__]]/`；删除/覆盖操作须先列清单并确认。
    - **.gitkeep Cleanup**: 空目录可用 `.gitkeep` 占位以便 Git 跟踪；向目录新增其他文件时须删除该目录下的 `.gitkeep`。
    - **Patch Output**: 以补丁形式输出变更，附 Code Reference。

    **Action**: 按 Phase A/B/C 逐项实施；每项产出完整、工程化的代码（含必要测试）；新增文件/目录须与 tech_stack 一致。
</step_3_implement>

<step_4_validate>
    **Role**: 验证工程师
    **Action** (失败须修复后重跑；命令以 `02_tech_stack.md` Section 5 为准):

    **Automated Check**: 运行 `[[__DOCS_DIR__]]/scripts/validate`（如存在）；否则按以下清单逐项手动执行。

    | Phase | 检查项 | 要求 |
    |:---|:---|:---|
    | **Static** | Build | 零编译错误 |
    | | Type Check | 零类型错误 |
    | | Lint | 零 Lint 错误（警告须说明原因） |
    | | Format | 符合格式规范（失败则自动修复后重检） |
    | **Test** | Existing Tests | 运行已有测试套件全部通过；禁因新代码破坏旧测试 |
    | | New Coverage | 为新增/修改的关键逻辑补充测试；纯样式调整可豁免 |

    **Feature Verification (硬性要求)**

    > 禁仅通过代码审查或自动化测试就标记完成；须实际运行目标功能并验证。
    > 如 dev server 未启动，先执行 `[[__DOCS_DIR__]]/scripts/dev-up`。
    > **优先读取 `notes.验证`**: 先读当前 task 的 `notes` 字段末尾 `验证: [...]` 部分，以其指定操作执行具体 e2e；`notes` 无验证字段时按下表类型兜底。

    | 项目类型 | 验证动作 | 通过标准 |
    |:---|:---|:---|
    | [?Web] | 浏览器操作目标功能路径 | 渲染正常，交互无报错，控制台无异常 |
    | [?API] | 调用新增/修改的 endpoint | 状态码与 Body 符合 spec |
    | [?CLI] | 执行目标命令（含正常参数 + 边界参数） | stdout 符合预期，exit code 正确 |
    | [?Lib] | 运行示例代码或 playground 验证导出 API | 无运行时错误，返回值正确 |
    | [?Mobile] | 模拟器/真机操作目标功能 | 界面正常，交互响应 |
    | [?Desktop] | 启动应用操作目标功能 | 窗口正常，功能可用 |

    **Evidence**: Output 须附验证结果（命令输出摘要 / 截图 / 错误日志）。
    **Fallback**: 验证持续失败且怀疑环境问题 → `[[__DOCS_DIR__]]/scripts/dev-reset` → `[[__DOCS_DIR__]]/scripts/dev-up` → 重试。

    **Output**: 每项检查 ✅/❌ 状态与原因；Feature Verification 证据。
</step_4_validate>

<step_5_audit>
    **Role**: 首席审计官
    **Checklist**:
    1.  **Tech Consistency**: 与 `02_tech_stack.md` 一致（库/模式/API 风格）。
    2.  [?UI] **Design Compliance**: 样式仅用 Token/Preset 视觉模式；无硬编码魔法值。
    3.  [?Data] **Data Integrity**: 符合 `data_snapshot.json`；字段名/类型一致。
    4.  **SOTA**: 拒绝过时模式；采用 tech_stack 最佳实践。
    5.  [?UI] **Accessibility**: 含必要无障碍属性。
    6.  [?I18n] **I18n**: 无硬编码字符串；须用 Key/字典引用。
    7.  **Performance**: 避免不必要大依赖/全量导入/无用计算/内存泄漏。
    8.  **Security**: 无敏感信息泄露；输入有校验。
    9.  **Static Check Zero**: 所有静态检查问题已解决。
    10. **step_4 Gate**: 确认 step_4 所有检查（Static + Test + Feature Verification）已通过。
    11. **联动检查**: 读取 `[[__DOCS_DIR__]]/global/map.json` 中的 `featureRelations` 数组，将本次实现的功能与各条 `sources` 字段做语义对比。命中时输出提示：`⚠️ 联动: [aggregator] — [checkNote]`，提醒在当前实现完成后确认聚合方是否需要同步。`featureRelations` 为空则跳过。

    细节问题可 Auto-Fix 并说明；重大风险标注 `⚠️ Risk` 并提出替代方案。
</step_5_audit>

<step_6_signoff>
    **Terminal Gate** (禁止跳过，须在输出总结前全部完成):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | `npx archi plan <ID>` | 全部完成或仅豁免项；未通过禁签收，回到 step_3 |
    | 2 | `npx archi task <ID> --status done` | 任务状态已更新 |
    | 3 | `npx archi task --check` | 无 ERROR 级问题 |
    | 4 | `npx archi render` | `.md` 视图生成完成 |

    **Action** (Gate 通过后):
    1.  更新 `plan.json`，将已完成步骤的 `done` 设为 `true`。
    2.  输出完成任务清单与补丁链接(Code Reference)。
    3.  提供下一步建议与 Git Commit Suggestion（Conventional Commits）。

    **Checkpoint** (Output 前须确认): □ Terminal Gate 全部执行

    **Output**: 完成摘要，含已完成任务、豁免项(如有)、Git Commit 建议、Next Steps 表格。
</step_6_signoff>

</protocol_code>

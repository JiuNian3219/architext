<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: 通过深度架构访谈，定义功能的 Spec/UI/Plan。
  **Logic**:
  - 若输入为 **ID** (在 Roadmap 中存在): 直接读取上下文。
  - 若输入为 **Context** (新需求): 自动生成 ID，追加到 Roadmap，再开始访谈。

<constraints_cursor>
    **Mode Lock**: 本协议须在 **Agent Mode (Normal Mode)** 下执行。禁切换到 Plan Mode 或其他只读模式。
</constraints_cursor>

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>简体中文</language>
    <principles>
      1.  **Global First**: 局部功能的诞生须伴随全局索引 (Map/Data/Dict) 的更新。
      2.  **AI-Native Perspective**: 所有选项 Pros/Cons 从 AI Agent 视角撰写。关注：Context Locality、Type Safety、Boilerplate、Ambiguity。
      3.  **Flexible Interaction**: 选项为启发式建议，支持多选、混合或自定义。
      4.  **Audit-Gated**: 只有通过审计的文档才能交付。
    </principles>
</meta>

<step_1_load>
    **Role**: 系统分析师
    **Action**:
    1.  **Read Roadmap**: 读取 `[[__DOCS_DIR__]]/global/roadmap.json`。
        - **Pre-flight**: 检查 `<ID>` 的 Dep 是否已完成。未完成则拒绝 Plan（除非用户强制）。
    2.  **Read Vision**: 读取 `[[__DOCS_DIR__]]/global/vision.md`。
        - 提取北极星指标和设计哲学，后续方案须与此对齐。
    3.  **Read Tech Stack**: `02_tech_stack.md` (技术红线)。
    4.  [?UI] **Read Design Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`。
    5.  [?Data] **Read Data Model**: `[[__DOCS_DIR__]]/global/data_snapshot.json`。
    6.  **Read Dependency Context** (如有依赖任务):
        - 读取依赖任务的 `spec.md` (接口契约) 和 `plan.json` (已实现内容)。
        - 避免重复定义上游接口，确保对接点精确对齐。

    **Output**: 访谈上下文素材（含依赖任务的关键接口信息）。
</step_1_load>

<step_2_interview>
    **Role**: 架构师
    **Action**: 基于 `[ctx]` 和项目现状，抛出 5 个维度的实现方案选择题。

    ---

    **Q1. Data Model & Schema Strategy**
    > 决定数据结构。

    **Web/Backend 示例**:
    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Flat / Single Entity | 单一实体表 | 上下文局限在单文件，不易出错 | 无 |
    | B | 1:N Relation | 标准父子关系 | 标准模式 | 须同时更新两个模型文件及关联逻辑 |
    | C | M:N Relation | 多对多关联 | 无 | 极易遗漏中间表或事务逻辑 |
    | D | Recursive / Tree | 树形/递归结构 | 无 | 递归生成易产生无限循环或栈溢出 |
    | E | JSON / EAV | 动态字段/JSON列 | Schema 灵活 | 丧失类型提示，AI 无法从 Schema 推断结构 |
    | F | Virtual / Computed | 虚拟/计算属性 | 无需数据迁移 | 查询逻辑复杂，易写出低效查询 |
    | Z | 自定义 | (请描述) | - | - |

    **Q2. Interaction & Presentation Pattern**
    > 决定用户操作方式。

    **Web/UI 项目**:
    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | CRUD Table/List | 标准增删改查 | 标准组件极易生成 | 无 |
    | B | Wizard / Stepper | 分步向导 | 步骤状态明确 | 跨步骤状态管理复杂 |
    | C | Dashboard / Kanban | 看板/卡片视图 | 无 | 拖拽逻辑依赖文档较差的第三方库，幻觉风险高 |
    | D | Modal / Drawer Drill-down | 弹窗/抽屉钻取 | 上下文局部化 | Z-index/Focus Trap 等 Bug 常见 |
    | E | Infinite Scroll / Feed | 信息流 | 无 | 虚拟化逻辑极难写对 |
    | F | Editor / Canvas | 编辑器/画布 | 无 | Canvas API 指令式，比声明式 DOM 难生成得多 |
    | Z | 自定义 | (请描述) | - | - |

    **Q3. State Sync & Data Flow**
    > 数据如何在客户端、服务端和存储之间同步。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Standard REST/Request | 标准请求/响应 | 原子操作，无状态，易测试 | 无 |
    | B | Optimistic UI | 乐观更新 | 无 | 回滚逻辑常被遗忘 |
    | C | Polling / SWR | 轮询/SWR | React Query 等库处理佳 | 无 |
    | D | Realtime (Socket/SSE) | 实时推送 | 无 | 连接状态与重连逻辑极难正确生成 |
    | E | Local-First / Offline | 本地优先 | 无 | 同步冲突解决属高阶算法 |
    | F | Background Job / Async | 异步任务 | 解耦 | 需额外 Worker 上下文 |
    | Z | 自定义 | (请描述) | - | - |

    **Q4. Edge Cases & Error Handling**
    > 此功能特有的失败模式处理。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Fail Fast / Toast | 快速失败并提示 | 简单一行调用 | 无 |
    | B | Form Validation | 表单级校验 | Zod Schema 作为 UI 生成的强上下文 | 正则准确率不稳定 |
    | C | Retry Mechanism | 自动重试 | 无 | 幂等性逻辑难验证 |
    | D | Fallback UI / Skeleton | 骨架屏/降级UI | 标准模式 | 需生成并行 UI 结构 |
    | E | Draft / Auto-save | 草稿/自动保存 | 无 | 存储节流逻辑需要 |
    | F | Undo / Redo | 撤销/重做 | 无 | 状态快照逻辑复杂 |
    | Z | 自定义 | (请描述) | - | - |

    **Q5. Access Control**
    > 谁能执行此操作。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Public | 公开 | 无需鉴权中间件 | 无 |
    | B | Authenticated | 登录用户 | 标准中间件 | 无 |
    | C | Owner Only | 仅资源拥有者 | 简单 `user.id === resource.ownerId` | 无 |
    | D | Role Based (RBAC) | 特定角色 | 规则明确 | 守卫逻辑复杂，上下文负载高 |
    | E | Shared / Team | 团队成员可见 | 无 | 权限检查涉及复杂 Join 查询 |
    | F | Tier / Subscription | 付费/订阅限制 | 无 | Mock 支付状态困难 |
    | Z | 自定义 | (请描述) | - | - |

    ---

    **Goal**: 锁定 `spec`, `ui`, `data_snapshot.json`。

    **⌨️ INPUT (灵活回复)**: 按题号顺序回复，题与题之间用 `|` 分隔；单题内支持 `A`、`A B`（多选，空格分隔）或 `Z: 用户描述`。示例：`A B | D 简单点 | C`。
</step_2_interview>

<step_2_5_refinement>
    **Role**: 咨询顾问
    **Trigger**: 用户回复包含 "不确定"、"区别"、"建议" 或明显逻辑冲突。
    **Action**: 不生成文档。解释疑惑点，对比选项优劣，提出新建议，等待再次确认。
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系统管理员
    **Constraint**: 在生成 Feature 文档**之前**，须先更新以下全局文件。

    **Boundary**: 仅注册**项目业务域**内容。Architext 框架概念（scripts、scaffold、roadmap、plan 等）和框架基础设施错误禁注册到全局文件。

    **Action Checklist**:
    1.  **`map.json`**: 在 `directoryMapping` 注册 `[[__DOCS_DIR__]]/features/<ID>_<Slug>`；在 `logicalTopology` 定义模块职责与依赖。
    2.  **`dictionary.json`**: 提取访谈中的**项目业务**新术语填入 `entities`/`verbs`；注册新共享工具到 `utilities`；注册新公共组件到 `components`。
    3.  [?Data] **`data_snapshot.json`**: 根据 Q1 选择新增/修改 Schema。禁写"待定"，须写出字段名和类型。
    4.  **`error_codes.json`**: 根据 Q4 选择注册新**业务**错误码。框架脚本错误由 exit code + stderr 处理，禁注册。

    **Output**: 上述文件的变更 Diff (简要)。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文档工程师
    **Input**: 访谈结果 + 已更新的全局上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下生成标准文档。

    **1. `spec.md`** (必须):
    - 模板: `templates/spec.template.md`。
    - 将 Q1 + Q4 转化为 Gherkin Scenarios。
    - 若为上游任务，须包含明确的 Interface/Type 定义。

    **2. `ui.md`** [?UI]:
    - 模板: `templates/ui.template.md`。
    - 将 Q2 转化为 ITP v3.0 描述；使用语义化命名映射 design_tokens。

    **3. `plan.json`** (必须):
    - 模板: `templates/plan.template.json`。
    - 根据项目类型动态调整 Phase；确保每个 Task 上下文自包含。
    - 任务描述中明确 "Additive Only" + "Respect Unknowns"。
    - **`decisions`**: 按 Q1-Q5 维度填写；`choice` 支持多选（如 `A B`，空格分隔）、自定义（`Z: …`）；`rationale` 须填写组合含义或自定义意图，供 code 阶段参照，禁留空。
    - **`notes`**: 每个 task 的 `notes` 须填写执行时速记（范围、spec 段落引用、关键约束），供 `/archi.code` 阶段精确定位，禁留空。
    - 生成后运行 `npx archi render` 生成可读的 `.md` 视图。
</step_4_generate>

<step_5_audit>
    **Role**: 首席审计官
    **Checklist**:
    1.  **Tech Consistency**: 是否用了未声明技术？
    2.  **Data Integrity**: Scenario 中的数据是否真实存在？
    3.  **Error Handling**: 是否覆盖 Q4 选择？
    4.  **AX Compliance**: 是否遵守 Anti-Clobbering 和 Interface Stability？

    如有问题则静默修正；严重问题标记 `⚠️ Risk Warning`。
</step_5_audit>

<step_6_signoff>
    **Action**:
    1.  运行 `npx archi task --check` 验证 Roadmap 一致性。
    2.  运行 `npx archi task <ID> --status active` 标记任务为进行中。
    3.  输出总结。

    **Output**: Feature 定义摘要，含 Decisions Summary 表格（Q1-Q5 选择及影响）和 Next Steps 表格。
</step_6_signoff>

</protocol_plan>

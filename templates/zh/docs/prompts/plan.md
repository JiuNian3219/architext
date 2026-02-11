<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: 通过深度架构访谈，定义功能的 Spec/UI/Plan。
  **Logic**:
  - 若输入为 **ID** (在 Roadmap 中存在): 直接读取上下文。
  - 若输入为 **Context** (新需求): 自动生成 ID，追加到 Roadmap，再开始访谈。

<constraints_cursor>
    **Mode Lock**: 本协议必须在 **Agent Mode (Normal Mode)** 下执行。**严禁**切换到 Plan Mode 或其他只读模式。如果 IDE 提示切换模式，必须拒绝。
</constraints_cursor>

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>简体中文</language>
    <principles>
      1.  **Global First**: 局部功能的诞生必须伴随着全局索引 (Map/Data/Dict) 的更新。
      2.  **AI-Native Perspective**: 
          - 所有选项的 Pros/Cons 必须从 **AI Agent** 的视角撰写。
          - 关注：**Context Locality (上下文局部性)**、**Type Safety (类型安全)**、**Boilerplate (样板代码作为提示)**、**Ambiguity (歧义风险)**。
      3.  **Flexible Interaction**: 选项仅为启发式建议。支持多选、混合或自定义。
      4.  **Audit-Gated**: 只有通过了虚拟审计员检查的文档，才能交付给用户。
    </principles>
</meta>

<step_1_load>
    **Role**: 系统分析师
    **Action**:
    1.  **Read Roadmap**: 读取 `[[__DOCS_DIR__]]/global/00_roadmap.md`。
        - **🚨 Pre-flight Check**: 检查当前任务 `<ID>` 的 `Dep` (依赖任务) 是否已完成 (`✅`)。
        - **Rule**: 如果依赖未完成，**拒绝 Plan**，并提示用户先完成前置任务（除非用户明确要求强制执行）。
    2.  **Read Tech Stack**: 读取 `02_tech_stack.md` (确认技术红线)。
    3.  **Read Design Tokens** (如项目有 UI): 读取 `[[__DOCS_DIR__]]/global/03_design_tokens.md`。
    4.  **Read Data Model** (如项目有数据层): 读取 `[[__DOCS_DIR__]]/global/04_data_snapshot.md`。
    5.  **Read Dependency Context** (如有依赖任务): 
        - 若当前任务 `<ID>` 的 `Dep` 字段引用了其他任务（如 `INF-01`, `FEAT-02`），**必须**读取这些依赖任务对应的文档目录 `[[__DOCS_DIR__]]/features/<DepID>_<Slug>/`。
        - 重点读取依赖任务的 `spec.md`（了解接口契约与数据结构）和 `plan.md`（了解已实现的内容），以确保当前任务的规划与上游保持一致。
        - **Goal**: 避免重复定义上游已有的接口，确保对接点 (Integration Points) 精确对齐。

    **Output**: 准备好访谈的上下文素材（包含依赖任务的关键接口信息）。
</step_1_load>

<step_2_interview>
    **Role**: 架构师 (动态调整)
    **Action**: 基于 `[ctx]` 和项目现状，抛出 5 个维度的**实现方案选择题**。
    
    ---
    
    **Q1. Data Model & Schema Strategy (数据模型策略)**
    > *Context*: 决定数据结构。
    
    **Web/Backend 项目示例**:
    - **[A] Flat / Single Entity**: 单一实体表。
      > **AI Pros**: 上下文局限在单文件，不易出错 | **AI Cons**: 无
    - **[B] 1:N Relation (Parent-Child)**: 标准父子关系。
      > **AI Pros**: 标准模式 | **AI Cons**: 需同时更新两个模型文件及关联逻辑
    - **[C] M:N Relation (Junction)**: 多对多关联。
      > **AI Pros**: 无 | **AI Cons**: 极易遗漏中间表或事务处理逻辑
    - **[D] Recursive / Tree**: 树形/递归结构。
      > **AI Pros**: 无 | **AI Cons**: 递归逻辑生成容易产生无限循环或栈溢出 Bug
    - **[E] JSON / EAV (Flexible)**: 动态字段/JSON列。
      > **AI Pros**: Schema 生成灵活 | **AI Cons**: 丧失类型提示，AI 无法从 Schema 推断字段结构
    - **[F] Virtual / Computed**: 虚拟/计算属性。
      > **AI Pros**: 无需数据迁移 | **AI Cons**: 查询逻辑构建复杂，易写出低效 SQL
    - **[Z] 自定义**: (请描述)

    **Q2. Interaction & Presentation Pattern (交互模式)** 
    > *Context*: 决定用户如何操作此功能。
    
    **Web/UI 项目**:
    - **[A] CRUD Table / List**: 标准增删改查列表。
      > **AI Pros**: 标准组件 (Table/Pagination) 极易生成 | **AI Cons**: 无
    - **[B] Wizard / Stepper**: 分步向导。
      > **AI Pros**: 步骤状态明确 | **AI Cons**: 跨步骤的状态管理维护复杂
    - **[C] Dashboard / Kanban**: 看板/卡片视图。
      > **AI Pros**: 无 | **AI Cons**: 拖拽逻辑通常需要文档较差的第三方库，幻觉风险高
    - **[D] Modal / Drawer Drill-down**: 弹窗/抽屉钻取。
      > **AI Pros**: 上下文局部化 | **AI Cons**: Z-index/Focus Trap 等 Bug 常见
    - **[E] Infinite Scroll / Feed**: 信息流。
      > **AI Pros**: 无 | **AI Cons**: 虚拟化 (Virtualization) 逻辑极难写对
    - **[F] Editor / Canvas**: 编辑器/画布。
      > **AI Pros**: 无 | **AI Cons**: Canvas API 是指令式的，比声明式 DOM 难生成得多
    - **[Z] 自定义**: (请描述)

    **Q3. State Sync & Data Flow (数据流转策略)**
    > *Context*: 数据如何在客户端、服务端和存储之间同步。

    - **[A] Standard REST/Request**: 标准请求/响应。
      > **AI Pros**: 原子操作，无状态，易于编写测试 | **AI Cons**: 无
    - **[B] Optimistic UI**: 乐观更新。
      > **AI Pros**: 无 | **AI Cons**: 回滚逻辑常被遗忘，或对 API 响应格式产生幻觉
    - **[C] Polling / SWR**: 轮询/SWR。
      > **AI Pros**: React Query 等库处理得很好 | **AI Cons**: 无
    - **[D] Realtime (Socket/SSE)**: 实时推送。
      > **AI Pros**: 无 | **AI Cons**: 连接状态管理与重连逻辑极难生成正确
    - **[E] Local-First / Offline**: 本地优先/离线。
      > **AI Pros**: 无 | **AI Cons**: 同步冲突解决逻辑属于高阶算法工作
    - **[F] Background Job / Async**: 异步任务。
      > **AI Pros**: 解耦 | **AI Cons**: 需额外设置 Worker 上下文
    - **[Z] 自定义**: (请描述)

    **Q4. Edge Cases & Error Handling (边界与容错)**
    > *Context*: 此功能特有的失败模式处理。

    - **[A] Fail Fast / Toast**: 快速失败并提示。
      > **AI Pros**: 简单的一行调用 | **AI Cons**: 无
    - **[B] Form Validation**: 表单级校验。
      > **AI Pros**: Zod Schema 作为 UI 生成的强上下文 | **AI Cons**: 正则表达式生成准确率不稳定
    - **[C] Retry Mechanism**: 自动重试。
      > **AI Pros**: 无 | **AI Cons**: 幂等性逻辑难以验证
    - **[D] Fallback UI / Skeleton**: 骨架屏/降级UI。
      > **AI Pros**: 标准模式 | **AI Cons**: 需生成并行的 UI 结构
    - **[E] Draft / Auto-save**: 草稿/自动保存。
      > **AI Pros**: 无 | **AI Cons**: 存储节流 (Throttling) 逻辑需要
    - **[F] Undo / Redo**: 撤销/重做。
      > **AI Pros**: 无 | **AI Cons**: 状态快照逻辑复杂
    - **[Z] 自定义**: (请描述)

    **Q5. Access Control (权限控制)**
    > *Context*: 谁能做这个操作？

    - **[A] Public**: 公开。
      > **AI Pros**: 无需鉴权中间件干扰 | **AI Cons**: 无
    - **[B] Authenticated**: 登录用户。
      > **AI Pros**: 标准中间件 | **AI Cons**: 无
    - **[C] Owner Only**: 仅资源拥有者。
      > **AI Pros**: 简单逻辑 `user.id === resource.ownerId` | **AI Cons**: 无
    - **[D] Role Based (RBAC)**: 特定角色。
      > **AI Pros**: 规则明确 | **AI Cons**: 守卫逻辑复杂，上下文负载高
    - **[E] Shared / Team**: 团队成员可见。
      > **AI Pros**: 无 | **AI Cons**: 权限检查涉及复杂的 Join 查询
    - **[F] Tier / Subscription**: 付费/订阅限制。
      > **AI Pros**: 无 | **AI Cons**: 测试时 Mock 支付状态很难
    - **[Z] 自定义**: (请描述)

    ---

    **Goal**: 锁定 `spec`, `ui`, `04_data`。
    **Bridge**: "✅ Options Generated. 这是一个**交互式设计过程**，请告诉我您的选择..."
    
    **⌨️ INPUT (灵活回复)**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Trigger**: 用户回复包含 "不确定"、"区别"、"建议" 或明显的逻辑冲突。
    **Role**: 咨询顾问
    **Action**: 
    1.  **不生成文档**。
    2.  解释用户疑惑的点，对比选项优劣。
    3.  提出新的、更具体的建议。
    4.  等待用户再次确认。
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系统管理员 (System Admin)
    **Constraint**: 在生成 Feature 文档**之前**，必须先更新以下全局文件。

    **Action Checklist**:
    1.  **Update `01_map.md`**:
        - 在 `3. Directory Mapping` 注册 `[[__DOCS_DIR__]]/features/<ID>_<Slug>`。（Slug 来自 Roadmap 的 `📁 Slug` 字段）
        - 在 `4. Logical Topology` 定义模块职责与依赖。
    2.  **Update `02_dictionary.md`**:
        - 提取访谈中的新术语填入表格。
        - 注册新发现的公共组件/模块。
    3.  **Update `04_data_snapshot.md`** (如项目有数据层):
        - 根据 Q1 的选择，新增或修改 Table/Schema 定义。**严禁**仅仅写 "待定"，必须写出字段名和类型。
    4.  **Update `05_error_codes.md`**:
        - 根据 Q4 的选择，注册新的业务错误码。

    **Output**: 展示上述文件的变更 Diff (简要)。
    **Bridge**: "✅ Global Docs Synced. 正在生成功能文档..."
</step_3_global_sync>

<step_4_generate>
    **Role**: 文档工程师
    **Input**: 访谈结果 + 已更新的全局上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下生成标准文档。（Slug 来自 Roadmap 的 `📁 Slug` 字段；若为新需求则在追加 Roadmap 时同时生成 Slug）

    **1. Generate `spec.md`** (必须):
    - **Template**: 使用 `templates/spec.template.md`。
    - **Content**: 将 Q1 (数据逻辑) 和 Q4 (错误处理) 转化为 **Gherkin Scenarios**。
    - **AX Rule**:
        - **Interface Stability**: 如果这是上游任务，生成的 Spec 必须包含明确的 Interface/Type 定义。
    
    **2. Generate `ui.md`** (如项目有 UI):
    - **Template**: 使用 `templates/ui.template.md`。
    - **Content**: 将 Q2 (界面展示) 转化为 **ITP v3.0** 描述。
    - **AX Rule**:
        - 使用语义化命名，映射 `03_design_tokens.md`。

    **3. Generate `plan.md`** (必须):
    - **Template**: 使用 `templates/plan.template.md`。
    - **Content**: 根据项目类型动态调整 Phase 划分。
    - **AX Rule**: 
        - **Anti-Clobbering**: 在任务描述中明确要求 "Additive Only" (增量优先) 和 "Respect Unknowns" (尊重未知代码)。
        - **Atomic Context**: 确保每个 Task 的上下文自包含。

    **Bridge**: "✅ Feature Docs Generated. 正在进行合规性审计..."
</step_4_generate>

<step_5_audit>
    **Role**: 🔴 首席审计官 (Chief Auditor)
    **Goal**: 拦截不合规的文档，强制自我修正。

    **Checklist**:
    1.  **Tech Consistency**: 是否使用了未声明的技术？
    2.  **Data Integrity**: Scenario 中的数据是否真实存在？
    3.  **Error Handling**: 是否覆盖了 Q4 的选择？
    4.  **AX Compliance**: 是否遵守了 Anti-Clobbering 和 Interface Stability 规则？

    **Action**: 
    - 如果发现问题，**静默修正 (Auto-Fix)** 文档内容。
    - 如果问题严重，在输出中标记 `⚠️ Risk Warning`。
    
    **Bridge**: "✅ Audit Passed. 正在完成最终输出..."
</step_5_audit>

<step_6_signoff>
    **Action**: 
    1.  **Validation**: 运行 `npx archi task --check` 检查 Roadmap 一致性。
    2.  **Status Update**: 如果一切正常，运行 `npx archi task <ID> --status active` 标记任务为进行中（规划完成，等待实现）。
    3.  输出总结。

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature**: `<ID>` — `<Name>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Model | [选项] | [简述影响] |
    | Q2. Interaction | [选项] | [简述影响] |
    | Q3. Data Flow | [选项] | [简述影响] |
    | Q4. Resilience | [选项] | [简述影响] |
    | Q5. Access | [选项] | [简述影响] |

    ### 🧭 Next Steps
    | 场景 | 推荐操作 |
    |:---|:---|
    | **开始实现** | `/archi.code <ID>` |
    | **需要调整** | `/archi.edit <ID> [变更描述]` |
    | **规划其他功能** | `/archi.plan [新的 Feature_ID]` |

    > 💡 **推荐**: 运行 `/archi.code <ID>` 开始代码实现。
    ```

</step_6_signoff>

</protocol_plan>
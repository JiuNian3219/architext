<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: 透過深度架構訪談，定義功能的 Spec/UI/Plan。
  **Logic**:
  - 若輸入為 **ID** (在 Roadmap 中存在): 直接讀取上下文。
  - 若輸入為 **Context** (新需求): 自動生成 ID，追加到 Roadmap，再開始訪談。

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>简体中文</language>
    <principles>
      1.  **Global First**: 全局优先。
      2.  **AI-Native Perspective**: 
          - 所有选项的 Pros/Cons 必须从 **AI Agent** 的视角撰写。
          - 关注：**Context Locality (上下文局部性)**、**Type Safety (类型安全)**、**Boilerplate (样板代码作为提示)**、**Ambiguity (歧义风险)**。
      3.  **Flexible Interaction**: 选项仅为建议。
      4.  **Audit-Gated**: 必须通过审计。
    </principles>
</meta>

<step_1_load>
    **Role**: 系统分析师
    **Action**: 读取 Roadmap, Tech Stack, Design Tokens, Data Model。
</step_1_load>

<step_2_interview>
    **Role**: 架构师 (动态调整)
    **Action**: 抛出 **实现方案选择题**。
    
    ---
    
    **Q1. Data Model & Schema Strategy (数据模型)**
    > *Context*: 决定数据结构。
    
    **Web/Backend 项目**:
    - **[A] Flat / Single Entity**: 单一实体。
      > **AI Pros**: 上下文局限在单文件，不易出错 | **AI Cons**: 无
    - **[B] 1:N Relation**: 父子关系。
      > **AI Pros**: 标准模式 | **AI Cons**: 需同时更新两个模型文件及关联逻辑
    - **[C] M:N Relation**: 多对多。
      > **AI Pros**: 无 | **AI Cons**: 极易遗漏中间表或事务处理逻辑
    - **[D] Recursive / Tree**: 树形结构。
      > **AI Pros**: 无 | **AI Cons**: 递归逻辑生成容易产生无限循环或栈溢出 Bug
    - **[E] JSON / EAV**: 动态字段。
      > **AI Pros**: Schema 生成灵活 | **AI Cons**: 丧失类型提示，AI 无法从 Schema 推断字段结构
    - **[F] Virtual / Computed**: 计算属性。
      > **AI Pros**: 无需数据迁移 | **AI Cons**: 查询逻辑构建复杂，易写出低效 SQL
    - **[Z] 自定义**: (请描述)

    **Q2. Interaction & Presentation Pattern (交互模式)** 
    > *Context*: UI/交互。
    
    **Web/UI 项目**:
    - **[A] CRUD Table / List**: 标准列表。
      > **AI Pros**: 标准组件 (Table/Pagination) 极易生成 | **AI Cons**: 无
    - **[B] Wizard / Stepper**: 向导。
      > **AI Pros**: 步骤状态明确 | **AI Cons**: 跨步骤的状态管理维护复杂
    - **[C] Dashboard / Kanban**: 看板。
      > **AI Pros**: 无 | **AI Cons**: 拖拽逻辑通常需要文档较差的第三方库，幻觉风险高
    - **[D] Modal / Drawer Drill-down**: 弹窗。
      > **AI Pros**: 上下文局部化 | **AI Cons**: Z-index/Focus Trap 等 Bug 常见
    - **[E] Infinite Scroll**: 无限流。
      > **AI Pros**: 无 | **AI Cons**: 虚拟化 (Virtualization) 逻辑极难写对
    - **[F] Editor / Canvas**: 画布。
      > **AI Pros**: 无 | **AI Cons**: Canvas API 是指令式的，比声明式 DOM 难生成得多
    - **[Z] 自定义**: (请描述)

    **Q3. State Sync & Data Flow (数据流)**
    > *Context*: 数据流转。

    - **[A] Standard REST/Request**: 请求/响应。
      > **AI Pros**: 原子操作，无状态，易于编写测试 | **AI Cons**: 无
    - **[B] Optimistic UI**: 乐观更新。
      > **AI Pros**: 无 | **AI Cons**: 回滚逻辑常被遗忘，或对 API 响应格式产生幻觉
    - **[C] Polling / SWR**: 轮询。
      > **AI Pros**: React Query 等库处理得很好 | **AI Cons**: 无
    - **[D] Realtime (Socket/SSE)**: 实时。
      > **AI Pros**: 无 | **AI Cons**: 连接状态管理与重连逻辑极难生成正确
    - **[E] Local-First / Offline**: 本地优先。
      > **AI Pros**: 无 | **AI Cons**: 同步冲突解决逻辑属于高阶算法工作
    - **[F] Background Job**: 异步任务。
      > **AI Pros**: 解耦 | **AI Cons**: 需额外设置 Worker 上下文
    - **[Z] 自定义**: (请描述)

    **Q4. Edge Cases & Error Handling (容错)**
    > *Context*: 失败处理。

    - **[A] Fail Fast / Toast**: 提示。
      > **AI Pros**: 简单的一行调用 | **AI Cons**: 无
    - **[B] Form Validation**: 校验。
      > **AI Pros**: Zod Schema 作为 UI 生成的强上下文 | **AI Cons**: 正则表达式生成准确率不稳定
    - **[C] Retry Mechanism**: 重试。
      > **AI Pros**: 无 | **AI Cons**: 幂等性逻辑难以验证
    - **[D] Fallback UI**: 骨架屏。
      > **AI Pros**: 标准模式 | **AI Cons**: 需生成并行的 UI 结构
    - **[E] Draft / Auto-save**: 草稿。
      > **AI Pros**: 无 | **AI Cons**: 存储节流 (Throttling) 逻辑需要
    - **[F] Undo / Redo**: 撤销。
      > **AI Pros**: 无 | **AI Cons**: 状态快照逻辑复杂
    - **[Z] 自定义**: (请描述)

    **Q5. Access Control (权限)**
    > *Context*: 鉴权。

    - **[A] Public**: 公开。
      > **AI Pros**: 无需鉴权中间件干扰 | **AI Cons**: 无
    - **[B] Authenticated**: 登录。
      > **AI Pros**: 标准中间件 | **AI Cons**: 无
    - **[C] Owner Only**: 拥有者。
      > **AI Pros**: 简单逻辑 `user.id === resource.ownerId` | **AI Cons**: 无
    - **[D] Role Based (RBAC)**: 角色。
      > **AI Pros**: 规则明确 | **AI Cons**: 守卫逻辑复杂，上下文负载高
    - **[E] Shared / Team**: 团队。
      > **AI Pros**: 无 | **AI Cons**: 权限检查涉及复杂的 Join 查询
    - **[F] Tier / Subscription**: 付费。
      > **AI Pros**: 无 | **AI Cons**: 测试时 Mock 支付状态很难
    - **[Z] 自定义**: (请描述)

    ---

    **Goal**: 锁定 `1.spec`, `2.ui`, `04_data`。
    **Bridge**: "✅ Options Generated. 交互式设计流程..."
    
    **⌨️ INPUT**: `A | B | ...`
</step_2_interview>

<step_2_5_refinement>
    **Trigger**: 不确定/冲突。
    **Role**: 顾问。
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系统管理员
    **Action**: 更新 Map, Dictionary, Data, Error Codes。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文档工程师
    **Action**: 生成 `1.spec.md`, `2.ui.md`, `3.plan.md`。
    
    **AX Rules**:
    1.  **Gherkin for AI**: 场景必须明确数据 Setup。
    2.  **UI for AI**: 使用语义化命名，映射 Design Tokens。
    3.  **Plan for AI**: 任务必须原子化且可测试。
</step_4_generate>

<step_5_audit>
    **Role**: 首席审计官
    **Goal**: 拦截不合规文档。
</step_5_audit>

<step_6_signoff>
    **Action**: 更新 Roadmap 状态。
    **Output**: 最终总结。
</step_6_signoff>

</protocol_plan>
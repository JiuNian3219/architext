<protocol_plan>
  **Trigger**: `/archi.plan [context]`
  **Goal**: 通过深度架构访谈，定义功能的 Spec/UI/Plan。
  **Logic**:
  - 若输入为 **ID** (在 Roadmap 中存在): 直接读取上下文。
  - 若输入为 **Context** (新需求): 自动生成 ID，追加到 Roadmap，再开始访谈。

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>简体中文</language>
    <principles>
      1.  **Global First**: 局部功能的诞生必须伴随着全局索引 (Map/Data/Dict) 的更新。
      2.  **Option-Based**: 访谈必须提供具体的 A/B/C/D/E/F 实现路径，而非开放式问答。
      3.  **Flexible Interaction**: 
          - 选项仅为**启发式建议**。
          - 明确告知用户支持 **多选 (A+B)**、**混合 (A但使用B的...)** 或 **完全自定义**。
          - 也就是：**不要机械填空，而是以此为起点进行设计。**
      4.  **Rich Context**: 每个选项必须包含：简述、适用场景、Pros/Cons、技术影响。
      5.  **Audit-Gated**: 只有通过了虚拟审计员检查的文档，才能交付给用户。
      6.  **Frontmatter Preservation**: 严禁删除或修改现有文件的 YAML Frontmatter。
    </principles>
</meta>

<step_1_load>
    **Role**: 系统分析师
    **Action**:
    1.  **Read Roadmap**: 目标任务 `<id>` 是否处于 `Ready` 状态？(防止跨越依赖)。
    2.  **Read Tech Stack**: 读取 `02_tech_stack.md` (确认技术红线与项目类型)。
    3.  **Benchmark Check**: 搜索同类产品或开源项目（如 `start.md` 中未定义），确保设计不闭门造车。
    4.  **Read Design Tokens** (如项目有 UI): 读取 `[[__DOCS_DIR__]]/global/03_design_tokens.md` (确认视觉物理量)。
    5.  **Read Data Model** (如项目有数据层): 读取 `[[__DOCS_DIR__]]/global/04_data_snapshot.md` (准备 Schema 变更)。
    6.  **Identify Project Type**: 根据 Tech Stack 识别项目类型 (Web/CLI/Backend/Library/Mobile/Embedded 等)。

    **Output**: 准备好访谈的上下文素材，明确项目类型和参考标杆。
    **Bridge**: "✅ Context Loaded. 参考标杆为 **[Benchmarks]**，正在生成针对性的架构决策问题..."
</step_1_load>

<step_2_interview>
    **Role**: 架构师 (根据项目类型动态调整)
    **Action**: 基于 `[ctx]` 和项目现状，抛出 5 个维度的**实现方案选择题**。
    **Constraint**: 
    - 每个问题必须提供 **A/B/C/D/E/F** 六个具体选项 + **Z** (自定义)。
    - **Anti-Redundancy**: 严禁询问 `02_tech_stack.md` 中已经锁定的技术栈问题（如"用什么数据库"）。**只问"如何使用"该技术**。
    
    ---
    
    **Q1. Data Model & Schema Strategy (数据模型策略)**
    > *Context*: 基于已选定的数据库（Tech Stack），决定此功能的数据结构。
    
    **Web/Backend 项目示例**:
    - **[A] Flat / Single Entity**: 单一实体表。*适用*: 独立资源，无复杂关联。*影响*: 简单 CRUD。
      > **Pros**: 开发快，无 Join | **Cons**: 扩展性低
    - **[B] 1:N Relation (Parent-Child)**: 标准父子关系。*适用*: 评论、订单项。*影响*: 外键约束。
      > **Pros**: 数据完整性 | **Cons**: 需要关联查询
    - **[C] M:N Relation (Junction)**: 多对多关联。*适用*: 标签、关注、收藏。*影响*: 需要中间表。
      > **Pros**: 灵活 | **Cons**: 查询复杂，写入需事务
    - **[D] Recursive / Tree**: 树形/递归结构。*适用*: 目录、组织架构、多级回复。*影响*: CTE 查询或闭包表。
      > **Pros**: 层级无限 | **Cons**: 递归性能开销
    - **[E] JSON / EAV (Flexible)**: 动态字段/JSON列。*适用*: 用户配置、多态属性。*影响*: 索引困难。
      > **Pros**: Schema 灵活 | **Cons**: 数据一致性弱
    - **[F] Virtual / Computed**: 虚拟/计算属性。*适用*: 统计报表、聚合视图。*影响*: 数据库视图或实时计算。
      > **Pros**: 无需存储 | **Cons**: 计算压力大
    - **[Z] 自定义**: (请描述)

    **CLI/Library 项目示例**:
    - **[A] Transient (In-Memory)**: 瞬时内存对象。*适用*: 一次性命令。*影响*: 进程结束即销毁。
    - **[B] Serialized File**: 序列化文件 (JSON/YAML)。*适用*: 简单持久化。*影响*: IO 开销。
    - **[C] SQLite (Embedded)**: 嵌入式 SQL。*适用*: 复杂本地查询。*影响*: 依赖 Native 绑定。
    - ... (根据场景生成其他选项)

    ---

    **Q2. Interaction & Presentation Pattern (交互模式)** 
    > *Context*: 决定用户如何操作此功能。
    
    **Web/UI 项目**:
    - **[A] CRUD Table / List**: 标准增删改查列表。*适用*: 管理后台、资源列表。
      > **Pros**: 效率高，标准 | **Cons**: 枯燥
    - **[B] Wizard / Stepper**: 分步向导。*适用*: 复杂表单、Onboarding。
      > **Pros**: 降低认知负荷 | **Cons**: 交互路径长
    - **[C] Dashboard / Kanban**: 看板/卡片视图。*适用*: 任务管理、状态流转。
      > **Pros**: 直观，拖拽友好 | **Cons**: 屏幕空间要求高
    - **[D] Modal / Drawer Drill-down**: 弹窗/抽屉钻取。*适用*: 保持上下文的轻量操作。
      > **Pros**: 不离开当前页 | **Cons**: 深度有限
    - **[E] Infinite Scroll / Feed**: 信息流。*适用*: 社交、浏览。
      > **Pros**: 沉浸感 | **Cons**: 定位困难
    - **[F] Editor / Canvas**: 编辑器/画布。*适用*: 创作、排版。
      > **Pros**: 自由度高 | **Cons**: 实现极复杂
    - **[Z] 自定义**: (请描述)

    **CLI 项目**:
    - **[A] Arguments & Flags**: 参数一次性输入。*适用*: 脚本化调用。
    - **[B] Interactive Prompts**: 交互式问答。*适用*: 引导用户。
    - **[C] TUI (Text UI)**: 全屏终端 UI。*适用*: 复杂监控、管理。
    - ...

    ---

    **Q3. State Sync & Data Flow (数据流转策略)**
    > *Context*: 数据如何在客户端、服务端和存储之间同步。

    - **[A] Standard REST/Request**: 标准请求/响应。*适用*: 绝大多数场景。
      > **Pros**: 简单，无状态 | **Cons**: 非实时
    - **[B] Optimistic UI**: 乐观更新。*适用*: 点赞、收藏等高频小操作。
      > **Pros**: 极致流畅 | **Cons**: 需处理回滚
    - **[C] Polling / SWR**: 轮询/SWR。*适用*: 准实时状态（如构建进度）。
      > **Pros**: 易实现 | **Cons**: 浪费带宽
    - **[D] Realtime (Socket/SSE)**: 实时推送。*适用*: 聊天、协作、通知。
      > **Pros**: 实时 | **Cons**: 连接维护成本
    - **[E] Local-First / Offline**: 本地优先/离线。*适用*: 笔记、编辑器。
      > **Pros**: 离线可用 | **Cons**: 冲突解决极难
    - **[F] Background Job / Async**: 异步任务。*适用*: 导出、AI 生成、耗时操作。
      > **Pros**: 不阻塞 UI | **Cons**: 需任务队列管理
    - **[Z] 自定义**: (请描述)

    ---

    **Q4. Edge Cases & Error Handling (边界与容错)**
    > *Context*: 此功能特有的失败模式处理。

    - **[A] Fail Fast / Toast**: 快速失败并提示。*适用*: 普通操作。
    - **[B] Form Validation**: 表单级校验。*适用*: 输入错误。
    - **[C] Retry Mechanism**: 自动重试。*适用*: 网络波动。
    - **[D] Fallback UI / Skeleton**: 骨架屏/降级UI。*适用*: 加载中或局部挂掉。
    - **[E] Draft / Auto-save**: 草稿/自动保存。*适用*: 长内容编辑，防止丢失。
    - **[F] Undo / Redo**: 撤销/重做。*适用*: 复杂编辑操作。
    - **[Z] 自定义**: (请描述)

    ---

    **Q5. Access Control (权限控制)**
    > *Context*: 谁能做这个操作？(基于 Tech Stack 中的 Auth 体系)

    - **[A] Public**: 公开。*适用*: 落地页、公开博客。
    - **[B] Authenticated**: 登录用户。*适用*: 一般功能。
    - **[C] Owner Only**: 仅资源拥有者。*适用*: 编辑/删除自己的内容。
    - **[D] Role Based (RBAC)**: 特定角色(Admin/Editor)。*适用*: 管理功能。
    - **[E] Shared / Team**: 团队成员可见。*适用*: 协作资源。
    - **[F] Tier / Subscription**: 付费/订阅限制。*适用*: 高级功能。
    - **[Z] 自定义**: (请描述)

    ---

    **Goal**: 锁定 `1.spec` (逻辑), `2.ui` (视觉，如适用), `04_data` (Schema，如适用) 的具体内容。
    **Bridge**: "✅ Options Generated. 这是一个**交互式设计过程**，请告诉我您的选择..."
    
    **⌨️ INPUT (灵活回复)**:
    - **单选**: `A | B | C | D | E`
    - **多选**: `A+B | ...`
    - **修改**: `A (但改为...) | ...`
    - **追问**: `Q2 我不太确定，请展开讲讲 B 和 C 的区别` (触发第二轮问答)
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
        - 在 `3. Directory Mapping` 注册 `[[__DOCS_DIR__]]/features/<ID>_<Name>`。
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
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Name>/` 下生成标准文档。

    **1. Generate `1.spec.md`** (必须):
    - **Template**: 使用 `templates/spec.template.md`。
    - **Content**: 将 Q1 (数据逻辑) 和 Q4 (错误处理) 转化为 **Gherkin Scenarios**。
    - **Rule**: 引用 `04_data_snapshot.md` 中的表名/结构和 `05_error_codes.md` 中的错误码（如适用）。

    **2. Generate `2.ui.md`** (如项目有 UI):
    - **Role**: UI/UX 设计师 (Designer Mode)
    - **Action**: 
        - 引入 **Designer Mode**：模拟专业设计师视角，不仅考虑功能，更考虑美学、布局平衡和交互体验。
        - 参考 `03_design_tokens.md` 进行设计。
    - **Template**: 使用 `templates/ui.template.md`。
    - **Content**: 将 Q2 (界面展示) 转化为 **ITP v3.0** 描述或对应的 CLI 输出规范。
    - **Rule**: 
        - 严禁硬编码颜色/尺寸值，必须使用 `03_design_tokens.md` 中的 Token（如适用）。
        - **Aesthetics**: 避免“工程师审美”，注重留白、层级和视觉引导。


    **3. Generate `3.plan.md`** (必须):
    - **Template**: 使用 `templates/plan.template.md`。
    - **Content**: 根据项目类型动态调整 Phase 划分：
      - **Web 项目**: Phase 1 (API/Data), Phase 2 (UI), Phase 3 (Integration)
      - **CLI 项目**: Phase 1 (Core Logic), Phase 2 (Interface/Output), Phase 3 (Testing)
      - **Backend 项目**: Phase 1 (Domain), Phase 2 (API), Phase 3 (Integration)
      - **Library 项目**: Phase 1 (Core API), Phase 2 (Implementations), Phase 3 (Docs & Examples)
    - **Rule**: 每一个 Checkbox 必须是可测量的原子任务。

    **Bridge**: "✅ Feature Docs Generated. 正在进行合规性审计..."
</step_4_generate>

<step_5_audit>
    **Role**: 🔴 首席审计官 (Chief Auditor)
    **Goal**: 拦截不合规的文档，强制自我修正。

    **Checklist (根据项目类型动态调整)**:
    1.  **Tech Consistency (技术一致性)**:
        - 扫描所有生成文档。
        - 检查是否使用了 `02_tech_stack.md` 中未声明的技术。
        - ❌ 发现违规：自动修正或警告。
    2.  **Visual Compliance (视觉合规，如项目有 UI)**: 
        - 扫描 `2.ui.md`。
        - ❌ 发现: 硬编码的颜色值、像素值。
        - ✅ 要求: 必须使用 Design Tokens。
    3.  **Data Integrity (数据完整性，如项目有数据层)**:
        - 扫描 `1.spec.md`。
        - 检查 Scenario 中的数据变更是否引用了 `04_data` 中真实存在的表/结构。
    4.  **Error Handling Check (错误处理检查)**:
        - 扫描 `1.spec.md` 和 `3.plan.md`。
        - 检查是否覆盖了 Q4 选择的错误处理策略。
    5.  **SOTA Pattern Check (技术先进性)**:
        - 扫描所有生成代码/伪代码。
        - 检查是否符合 `02_tech_stack.md` 中定义的最佳实践。
        - ❌ 发现违反反模式（如 `02_tech_stack.md` §8 Anti-Patterns）。
    6.  **Accessibility (无障碍，如项目有 UI)**:
        - 扫描 `2.ui.md`。
        - 检查是否规划了必要的无障碍属性。

    **Action**: 
    - 如果发现问题，**静默修正 (Auto-Fix)** 文档内容。
    - 如果问题严重（如逻辑冲突），在输出中标记 `⚠️ Risk Warning`。
    
    **Bridge**: "✅ Audit Passed. 正在完成最终输出..."
</step_5_audit>

<step_6_signoff>
    **Action**: 
    1. 更新 `[[__DOCS_DIR__]]/global/00_roadmap.md` 状态为 `🟢 In Progress`，并添加 Docs 链接。
    2. 输出总结。

    **Constraint**:
    - **State Recovery**: 即使经过多轮对话，最终输出**必须包含且仅包含**以下标准块。不要输出"好的，这是最终结果"等废话。

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Project Type**: `<Web/CLI/Backend/Library/Mobile>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Model | [选项] | [简述影响] |
    | Q2. Interaction | [选项] | [简述影响] |
    | Q3. Data Flow | [选项] | [简述影响] |
    | Q4. Resilience | [选项] | [简述影响] |
    | Q5. Access | [选项] | [简述影响] |

    ### 📂 Global Updates
    * Map: Registered `features/<ID>_<Name>` (`01_map`)
    * Schema: [Added/Modified] (如适用) (`04_data`)
    * Error Codes: [Added] (如适用) (`05_error`)

    ### 📄 Local Docs Generated
    * 📄 `[[__DOCS_DIR__]]/features/<ID>_<Name>/1.spec.md`
    * 🎨 `[[__DOCS_DIR__]]/features/<ID>_<Name>/2.ui.md` (如适用)
    * 🗓️ `[[__DOCS_DIR__]]/features/<ID>_<Name>/3.plan.md`

    ### 🧭 Next Steps (下一步操作)

    | 场景 | 推荐操作 | 说明 |
    |:---|:---|:---|
    | **开始实现** | `/archi.code <ID>` | 开始代码实现，按照 `3.plan.md` 中的任务清单执行 |
    | **检查文档** | 查看生成的 `1.spec.md` 和 `2.ui.md` | 确认文档是否符合预期 |
    | **需要调整** | `/archi.edit <ID> [变更描述]` | 如果发现需求需要修改，更新 Spec/UI 文档 |
    | **规划新功能** | `/archi.plan [新的 Feature_ID]` | 如果还有其他功能需要规划 |
    | **查看帮助** | `/archi.help` | 显示完整指令手册 |

    > 💡 **推荐**: 运行 `/archi.code <ID>` 开始代码实现。
    ```

</step_6_signoff>

</protocol_plan>
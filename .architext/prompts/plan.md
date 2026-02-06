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
      2.  **Option-Based**: 访谈必须提供具体的 A/B/C/D/E/F 实现路径（至少 6 个选项），而非开放式问答。
      3.  **Rich Context**: 每个选项必须包含：简述、适用场景、Pros/Cons、技术影响。
      4.  **Audit-Gated**: 只有通过了虚拟审计员检查的文档，才能交付给用户。
      5.  **Frontmatter Preservation**: 严禁删除或修改现有文件的 YAML Frontmatter。
      6.  **Project-Type Adaptive**: 问题和选项必须根据项目类型（Web/CLI/Backend/Library/Mobile 等）动态调整。
    </principles>
</meta>

<step_1_load>
    **Role**: 系统分析师
    **Action**:
    1.  **Read Roadmap**: 目标任务 `<id>` 是否处于 `Ready` 状态？(防止跨越依赖)。
    2.  **Read Tech Stack**: 读取 `02_tech_stack.md` (确认技术红线与项目类型)。
    3.  **Benchmark Check**: 搜索同类产品或开源项目（如 `start.md` 中未定义），确保设计不闭门造车。
    4.  **Read Design Tokens** (如项目有 UI): 读取 `.architext/global/03_design_tokens.md` (确认视觉物理量)。
    5.  **Read Data Model** (如项目有数据层): 读取 `.architext/global/04_data_snapshot.md` (准备 Schema 变更)。
    6.  **Identify Project Type**: 根据 Tech Stack 识别项目类型 (Web/CLI/Backend/Library/Mobile/Embedded 等)。

    **Output**: 准备好访谈的上下文素材，明确项目类型和参考标杆。
    **Bridge**: "✅ Context Loaded. 参考标杆为 **[Benchmarks]**，正在生成针对性的架构决策问题..."
</step_1_load>

<step_2_interview>
    **Role**: 架构师 (根据项目类型动态调整)
    **Action**: 基于 `[ctx]` 和项目现状，抛出 5 个维度的**实现方案选择题**。
    **Constraint**: 
    - 每个问题必须提供 **A/B/C/D/E/F** 六个具体选项 + **Z** (自定义)。
    - 每个选项必须包含：**简述** | **适用场景** | **Pros** | **Cons** | **技术影响**。
    - 问题必须根据项目类型动态调整（不适用的问题可跳过或替换）。

    ---
    
    **Q1. Data & Logic Architecture (数据与逻辑架构)**
    > *Context*: 决定功能的核心数据结构和业务逻辑组织方式。
    
    **Web/Backend 项目示例**:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Flat Table** | 单表扁平结构 | 简单 CRUD，无复杂关联 | 查询简单，性能好 | 难以扩展复杂关系 | 无需 ORM 高级特性 |
    | **B. Relational** | 关系型多表设计 | 有明确实体关系 | 数据完整性，可扩展 | 查询复杂，需 JOIN | 需要 Migration 工具 |
    | **C. Nested/Tree** | 递归树形结构 | 评论、分类、组织架构 | 支持层级关系 | 递归查询性能 | 需要 CTE 或 Adjacency List |
    | **D. Event Sourcing** | 事件溯源 | 需要完整审计、撤销 | 完整历史，可回溯 | 复杂度高，存储成本 | 需要 Event Store |
    | **E. Document/NoSQL** | 文档型/JSON 存储 | 半结构化数据，灵活 Schema | 灵活，无 Migration | 一致性弱，查询受限 | MongoDB/DynamoDB |
    | **F. Hybrid** | 混合方案 | 核心关系型 + 扩展文档 | 兼顾两者优势 | 复杂度最高 | 多数据源管理 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    **CLI/Library 项目示例**:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. In-Memory** | 纯内存数据结构 | 无状态命令，一次性执行 | 简单，无依赖 | 无持久化 | 仅需 std 库 |
    | **B. Config File** | 配置文件存储 | 用户配置、状态持久化 | 简单持久化 | 并发问题，格式限制 | TOML/YAML/JSON 解析 |
    | **C. SQLite Embedded** | 嵌入式数据库 | 复杂查询，大量数据 | 完整 SQL 支持 | 增加二进制体积 | 需要 SQLite 绑定 |
    | **D. Key-Value Store** | 键值存储 | 简单缓存，快速查找 | 极简 API | 不支持复杂查询 | RocksDB/sled/redb |
    | **E. Plugin System** | 插件化数据源 | 支持多种后端 | 可扩展，灵活 | 接口设计复杂 | Trait/Interface 抽象 |
    | **F. External Service** | 外部服务依赖 | 需要远程数据 | 数据集中管理 | 网络依赖，需处理离线 | HTTP Client/gRPC |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    ---

    **Q2. Interface & Presentation (接口与展示层)** 
    > *Context*: 决定功能如何与用户/外部系统交互。
    > **Note**: 根据项目类型，此问题的含义不同。

    **Web 项目 (UI)** - 组件拆分与布局:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Inline Block** | 嵌入式组件 | 功能作为页面一部分 | 直观，上下文完整 | 占用页面空间 | 无额外路由 |
    | **B. Modal/Dialog** | 弹窗覆盖层 | 临时操作，不离开当前页 | 焦点集中，轻量 | 遮挡内容，体验中断 | 需要弹窗管理 |
    | **C. Drawer/Sidebar** | 侧边滑出面板 | 详情展示，不离开主视图 | 保持上下文 | 响应式设计复杂 | 需要布局系统支持 |
    | **D. Full Page** | 独立页面 | 复杂流程，需要专注 | 完整空间，独立 URL | 需要导航，跳转成本 | 需要路由配置 |
    | **E. Split View** | 左右/上下分栏 | 对比、预览场景 | 同时展示多信息 | 屏幕空间要求高 | 响应式复杂 |
    | **F. Tab/Accordion** | 标签页/折叠面板 | 多面板切换 | 节省空间 | 隐藏内容不可见 | Tab 组件依赖 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    **CLI 项目** - 输出与交互方式:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Plain Text** | 纯文本输出 | 简单信息，可管道处理 | 通用，可脚本化 | 信息层次不清 | 无额外依赖 |
    | **B. Colored Output** | 彩色文本 | 人类可读，区分信息级别 | 可读性好 | 不支持无色终端 | chalk/picocolors |
    | **C. Table/Grid** | 表格展示 | 结构化数据展示 | 整齐，对齐 | 宽度限制 | cli-table/tty-table |
    | **D. Interactive TUI** | 交互式终端 UI | 复杂交互，多步骤 | 丰富体验 | 开发复杂 | ink/blessed/ratatui |
    | **E. Progress/Spinner** | 进度指示器 | 长时间操作 | 用户反馈好 | 增加复杂度 | ora/indicatif |
    | **F. Structured Output** | JSON/YAML 输出 | 机器消费，API 集成 | 可解析，集成友好 | 人类不友好 | 序列化库 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    **Backend/API 项目** - 接口协议:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. REST API** | 标准 RESTful 接口 | 通用场景，第三方集成 | 标准化，工具丰富 | 过度获取/获取不足 | OpenAPI 文档 |
    | **B. GraphQL** | 灵活查询语言 | 复杂数据关系，多客户端 | 精确获取，类型安全 | 学习曲线，N+1 问题 | GraphQL Server |
    | **C. gRPC** | 高性能 RPC | 微服务通信，低延迟 | 高性能，类型安全 | 调试困难，浏览器受限 | Protobuf 定义 |
    | **D. WebSocket** | 实时双向通信 | 实时更新，聊天，协作 | 实时推送 | 连接管理复杂 | WS 服务器支持 |
    | **E. Message Queue** | 异步消息队列 | 解耦，削峰，最终一致 | 高可用，可扩展 | 延迟，复杂度 | RabbitMQ/Kafka |
    | **F. Server-Sent Events** | 服务器推送 | 单向实时更新 | 简单，HTTP 兼容 | 仅单向，连接限制 | SSE 支持 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    **Library 项目** - API 设计风格:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Builder Pattern** | 链式构建器 | 复杂对象配置 | 可读性好，渐进式 | 代码量增加 | 需要额外类型 |
    | **B. Fluent API** | 流式调用 | DSL 风格接口 | 表达力强 | 调试困难 | 方法返回 self |
    | **C. Functional** | 函数式 API | 无状态，可组合 | 可测试，无副作用 | 学习曲线 | 高阶函数支持 |
    | **D. Object-Oriented** | 传统 OOP | 熟悉模式，封装状态 | 直观，IDE 支持好 | 继承复杂度 | 类/接口设计 |
    | **E. Macro/DSL** | 宏/领域语言 | 减少样板，提高表达力 | 简洁，专用 | 调试困难，编译时间 | 宏系统支持 |
    | **F. Callback/Event** | 回调/事件驱动 | 异步处理，扩展点 | 灵活，可扩展 | 回调地狱风险 | 事件系统设计 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    ---

    **Q3. State & Data Flow (状态与数据流)**
    > *Context*: 决定数据如何在系统中流动、缓存和同步。

    **Web 项目**:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Server-Only** | 纯服务端状态 | 简单 CRUD，SEO 优先 | 简单，无客户端复杂度 | 交互响应慢 | SSR/MPA 架构 |
    | **B. Client Cache** | 客户端缓存 | 频繁读取，减少请求 | 响应快，减轻服务器 | 一致性问题 | React Query/SWR |
    | **C. Optimistic UI** | 乐观更新 | 写操作多，体验优先 | 即时反馈，体验好 | 回滚复杂 | 状态回滚逻辑 |
    | **D. Real-time Sync** | 实时同步 | 协作、聊天、通知 | 数据实时 | 连接管理，成本高 | WebSocket/Firebase |
    | **E. Local-First** | 本地优先 | 离线支持，PWA | 离线可用，快速 | 冲突解决复杂 | IndexedDB/CRDT |
    | **F. Hybrid** | 混合策略 | 按场景选择 | 灵活，最优化 | 复杂度最高 | 多策略管理 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    **CLI/Backend/Library 项目**:
    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Stateless** | 无状态 | 纯函数，每次独立执行 | 简单，可并行 | 无法缓存计算 | 纯函数设计 |
    | **B. Thread-Local** | 线程本地状态 | 多线程，隔离状态 | 线程安全 | 跨线程共享困难 | TLS/线程池 |
    | **C. Shared Mutable** | 共享可变状态 | 需要跨组件共享 | 直接，简单 | 竞态风险 | Mutex/RwLock |
    | **D. Actor Model** | Actor 模型 | 高并发，消息传递 | 无锁，可扩展 | 学习曲线 | Tokio/Actix |
    | **E. Immutable** | 不可变状态 | 函数式，无副作用 | 线程安全，可推理 | 性能（复制） | 持久化数据结构 |
    | **F. Global Singleton** | 全局单例 | 配置、日志、连接池 | 简单访问 | 测试困难，耦合 | 懒加载/OnceCell |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    ---

    **Q4. Error Handling & Resilience (错误处理与弹性)**
    > *Context*: 决定系统如何处理异常、失败和边界情况。

    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Exception-Based** | 异常抛出 | 传统语言，简单流程 | 直观，跳出控制流 | 隐式控制流，性能 | try/catch/throw |
    | **B. Result Type** | Result/Either 类型 | 显式错误处理，类型安全 | 强制处理，类型安全 | 代码冗长 | Rust Result/TS fp-ts |
    | **C. Error Code** | 错误码返回 | C 风格，底层库 | 性能好，简单 | 易忽略，语义弱 | 错误码枚举定义 |
    | **D. Fallback/Default** | 降级默认值 | 非关键路径，容错优先 | 不中断，用户友好 | 隐藏问题 | 默认值策略 |
    | **E. Retry with Backoff** | 重试与退避 | 网络请求，临时故障 | 自愈能力 | 延迟，复杂度 | 重试库/指数退避 |
    | **F. Circuit Breaker** | 熔断器 | 微服务，防级联故障 | 快速失败，保护下游 | 配置复杂 | 熔断器库 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    ---

    **Q5. Security & Authorization (安全与权限)**
    > *Context*: 决定功能的访问控制和安全策略。

    | Option | 简述 | 适用场景 | Pros | Cons | 技术影响 |
    |:---|:---|:---|:---|:---|:---|
    | **A. Public/Open** | 完全开放 | 公开资源，无敏感数据 | 简单，无鉴权开销 | 无访问控制 | 无需鉴权中间件 |
    | **B. API Key** | API 密钥认证 | 服务间调用，简单场景 | 简单实现 | 密钥泄露风险 | 密钥管理 |
    | **C. Session-Based** | 会话认证 | 传统 Web 应用 | 成熟，控制力强 | 服务端状态，扩展难 | Session 存储 |
    | **D. JWT Token** | JWT 无状态令牌 | 分布式，微服务 | 无状态，可扩展 | Token 撤销困难 | JWT 库/验证 |
    | **E. OAuth2/OIDC** | OAuth2/OpenID | 第三方登录，SSO | 标准化，安全 | 复杂，学习曲线 | OAuth Provider |
    | **F. RBAC/ABAC** | 角色/属性权限 | 复杂权限控制 | 细粒度控制 | 设计复杂 | 权限模型设计 |
    | **Z. 自定义** | (请描述) | - | - | - | - |

    ---

    **Goal**: 锁定 `1.spec` (逻辑), `2.ui` (视觉，如适用), `04_data` (Schema，如适用) 的具体内容。
    **Bridge**: "✅ Options Generated. 请架构师（用户）根据上述详细对比做出决策..."
    
    **⌨️ INPUT (管道回复)**:
    > **格式**: `Q1 | Q2 | Q3 | Q4 | Q5`
    > **示例**: `B | A | C | B | D`
    > **自定义示例**: `B | Z="命令行 + JSON 双输出" | C | B | A`
</step_2_interview>

<step_3_global_sync>
    **Role**: 系统管理员 (System Admin)
    **Constraint**: 在生成 Feature 文档**之前**，必须先更新以下全局文件。

    **Action Checklist**:
    1.  **Update `01_map.md`**:
        - 在 `3. Directory Mapping` 注册 `.architext/features/<ID>_<Name>`。
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
    **Action**: 在 `.architext/features/<ID>_<Name>/` 下生成标准文档。

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
    1. 更新 `.architext/global/00_roadmap.md` 状态为 `🟢 In Progress`，并添加 Docs 链接。
    2. 输出总结。

    **Output Template**:
    ```markdown
    ## ✅ Feature Definition Complete

    **Feature ID**: `<ID>`
    **Feature Name**: `<Name>`
    **Project Type**: `<Web/CLI/Backend/Library/Mobile>`

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Data Architecture | [选项] | [简述影响] |
    | Q2. Interface/Presentation | [选项] | [简述影响] |
    | Q3. State/Data Flow | [选项] | [简述影响] |
    | Q4. Error Handling | [选项] | [简述影响] |
    | Q5. Security | [选项] | [简述影响] |

    ### 📂 Global Updates
    * Map: Registered `features/<ID>_<Name>` (`01_map`)
    * Schema: [Added/Modified] (如适用) (`04_data`)
    * Error Codes: [Added] (如适用) (`05_error`)

    ### 📄 Local Docs Generated
    * 📄 `.architext/features/<ID>_<Name>/1.spec.md`
    * 🎨 `.architext/features/<ID>_<Name>/2.ui.md` (如适用)
    * 🗓️ `.architext/features/<ID>_<Name>/3.plan.md`

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

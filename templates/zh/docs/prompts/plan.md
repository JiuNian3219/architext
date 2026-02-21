<protocol_plan>
  **Trigger**: `/archi.plan <ID> [context]`
  **Goal**: 通过深度架构访谈，定义功能的 Spec/UI/Plan。
  **Input**:
  - `<ID>` (必填): Roadmap 中已存在的任务 ID。须先通过 `/archi.scope` 或 `/archi.inherit` 创建任务。
  - `[context]` (可选): 任务的已知上下文（如用户需求描述、参考资料、约束条件）。提供时作为 step_2 访谈的前置输入，减少提问。

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
        - **Stub 兼容**: 如依赖任务的 Spec-Status 为 Stub：
          a. 读取 stub 中"关联文件"列出的源码文件作为补充上下文。
          b. 从代码中提取该模块的公共接口/导出类型。
          c. 将提取结果作为本次规划的上游接口参考（不修改 stub 本身）。
        - 避免重复定义上游接口，确保对接点精确对齐。

    **Output**: 向用户输出 **Feature Context Brief**：
    ```
    ### Feature Context: [功能名称] ([ID])

    **目标**: [roadmap task 的 goal，如含 [用户预设] 须高亮标注]
    **上游依赖**: [已完成的依赖任务及其关键接口/类型，无则写"无"]
    **项目特征**: [已激活的 UI/Data/CLI/Lib/API 标签]
    **技术约束**: [来自 02_tech_stack.md 的关键红线]
    **设计哲学**: [来自 vision.md 的北极星指标和设计原则]
    ```
    内部保留完整上下文素材，进入 step_2。
</step_1_load>

<step_2_interview>
    **Role**: 架构师

    ---

    ### Unified Proposal (一次性提案)

    **核心原则**: 将功能设计和架构决策**合并为一次输出**，用户一次确认或覆写即可。

    **Action**:

    #### Part 1: Feature Design (功能设计)

    AI 根据功能性质**自行决定输出哪些模块**，从以下素材库中选取适用项：

    | 素材 | 适用场景 |
    |:---|:---|
    | 流程描述（用户旅程/系统流程/命令流程） | 有多步交互或处理链时 |
    | 核心实体与数据 | 涉及新增或修改实体时；已有实体用 `→ ref: data_snapshot.json#EntityName` 引用 |
    | 交互面（页面/命令/端点/方法） | 有用户或外部接触面时 |
    | 已有决策 | goal 含 `[用户预设]` 时 → 高亮标注，严格遵守 |

    **引用规则**:
    - global 中已定义的实体/类型 → `ref: data_snapshot.json#X`，仅描述本功能**新增或修改**的部分
    - 设计哲学/原则 → `ref: vision.md#原则名`，无需复述
    - 上游接口 → `ref: features/<dep_ID>/spec.md#接口名`
    - 已有设计 Token/组件 → `ref: design_tokens.json#preset` / `ref: dictionary.json#component`

    **通用要求**: 用此功能的具体实体名、操作名描述，禁泛化

    #### Part 2: Architecture Recommendations (架构建议)

    对每个适用维度，AI 直接给出**推荐方案**及理由，而非抛出完整选项表。

    **规则**:
    1. 根据项目特征标签（UI/Data/CLI/Lib/API）选择适用维度，跳过不适用的
    2. 对每个适用维度：AI 从参考选项库中选出**最推荐方案**，写出推荐理由（1-2 句，结合此功能的具体情况）
    3. 仅当某维度存在**两个以上合理选项且选择会显著影响实现**时，才展开选项表让用户选择
    4. 展开的选项表规则不变：3-5 个选项 + `[Z] 自定义`；说明须描述具体行为；AI+/AI- 须为完整句子，禁写"无"
    5. **功能上下文化（Critical）**: 须用功能设计中确认的实体名、操作名、业务流程来描述选项，禁照搬泛化描述

    #### Output Format

    ```
    ## Feature Proposal: [功能名称] ([ID])

    ### 功能设计
    [按复杂度级别输出，见上方 Part 1]

    ### 架构建议
    | 维度 | 推荐 | 理由 |
    |:---|:---|:---|
    | 核心结构 | [推荐选项] | [结合此功能的 1-2 句理由] |
    | 交互模式 | [推荐选项] | [理由] |
    | 错误处理 | [推荐选项] | [理由] |
    | ... | ... | ... |

    [仅对需要用户裁决的维度展开选项表]:
    **[Q<n>] 问题标题**
    > 为什么需要用户决定（一句话）

    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A [推荐] | ... | 具体行为（2-3句） | 完整句子 | 完整句子 |
    | B | ... | ... | ... | ... |
    | Z | 自定义 | (请描述) | - | - |

    ---
    > 回复 **OK** 接受全部建议；或标注要修改的部分，如：
    > - 设计修正: "注册不需要邮箱验证步骤"
    > - 维度覆写: "核心结构=C, 错误处理=B D"
    > - 问题回答: "Q1=B"
    ```

    ---

    ### 参考选项库（AI 内部使用，不直接输出给用户）

    以下为各维度的参考选项库。AI 在 Part 2 中从中选取推荐方案或展开选项表时引用，
    但须用此功能的具体上下文重写描述，禁照搬。

    ---

    ### 维度 1: Core Structure (必问)

    根据项目特征标签路由到对应选项库：

    #### [?Data] 数据模型与关系策略
    > 决定此功能的数据如何存储和组织。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Flat / Single Entity | 所有数据存在单张表/单个文档中，无外键关联。如"系统设置"一张表，每行存一个用户的全部配置项。适合实体独立、字段固定、不涉及跨表关联的场景 | 上下文集中在单文件，AI 生成 CRUD 不需跨文件追踪关系，错误率最低 | 当数据天然有从属关系时强行平铺，会导致字段冗余，后续拆分重构成本高 |
    | B | 1:N Relation | 一个父实体拥有多个子实体，通过外键关联。如"用户→多篇文章"，文章表用 userId 外键指向用户表。适合主从关系明确、子实体依附父实体存在的场景 | 最常见的关系模式，AI 训练数据充足，生成 JOIN 查询和级联操作的准确率高 | 须同时维护两个 Model 及关联逻辑，AI 可能遗漏级联删除/更新或嵌套序列化 |
    | C | M:N Relation | 两个实体间多对多关系，需中间表。如"学生↔课程"用 enrollment 中间表连接。适合两个实体互不从属但需要关联的场景 | 中间表结构标准化，关系语义清晰 | 极易遗漏中间表创建和事务逻辑；中间表常需额外字段（如 enrolledAt），AI 经常忘记处理 |
    | D | Recursive / Tree | 实体自引用形成树形结构。如"评论回复评论"、"文件夹嵌套文件夹"，表中 parentId 指向自身。适合层级深度不确定的分类、目录、评论树 | 单表即可表达任意深度，Schema 简洁 | 递归查询/渲染易产生无限循环或栈溢出，AI 生成的递归终止条件常不完整 |
    | E | JSON / EAV | 用 JSON 列或 Entity-Attribute-Value 模式存储动态字段。如"自定义表单"字段不固定，用 JSON 存用户定义的数据。适合 Schema 不确定、字段因用户/场景而异的需求 | Schema 灵活，新增字段无需数据库迁移 | 丧失数据库级类型校验和索引能力，AI 无法从 Schema 推断字段结构，生成代码时易产生运行时类型错误 |
    | F | Virtual / Computed | 数据不直接存储，从其他字段实时计算。如"订单总价=商品单价x数量"。适合衍生数据、统计聚合、格式化展示 | 无需数据迁移，数据始终与源保持一致 | 计算逻辑分散在查询层，AI 易写出 N+1 查询或低效聚合语句 |
    | Z | 自定义 | (请描述你的数据结构方案) | - | - |

    #### [?CLI] 输入/输出与配置设计
    > 决定此功能如何接收输入、以什么形式输出结果。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Pure Args/Flags | 所有输入通过命令行参数传入，如 `cmd --name foo --verbose`。程序解析参数后直接执行，无交互过程。适合自动化脚本调用、CI/CD 管道 | 输入结构明确，AI 可直接从参数定义推导解析代码和帮助文档 | 参数过多时用户记忆成本高，复杂嵌套配置难以通过命令行表达 |
    | B | Interactive Prompts | 运行后通过交互式问答引导输入，依次弹出"项目名称？"→"选择模板？"→"确认？"。适合初始化向导、配置生成器等需要引导的场景 | 每个 prompt 步骤独立，AI 可按顺序逐一生成处理逻辑 | 须处理 Ctrl+C 取消、回退上一步、默认值等边界情况，测试需 Mock stdin |
    | C | Hybrid (Args + Prompts) | 优先读取命令行参数，缺失项才弹交互提示。如 `cmd --name foo` 跳过名称询问，其余照常提示。适合同时服务脚本调用和手动操作 | 兼顾自动化与交互，是现代 CLI 的最佳实践 | 须维护参数解析和交互提示两套逻辑，AI 须确保两条路径行为一致 |
    | D | Config File | 从配置文件读取输入，如 `cmd --config config.json`。适合参数数量多、需要版本化管理配置的场景 | 配置可用 JSON Schema 严格校验，AI 可基于 Schema 生成解析代码 | 须处理文件不存在、格式错误、Schema 版本迁移等边界情况 |
    | E | Stdin / Pipe | 从标准输入或管道接收数据，如 `cat data.json | cmd process`。适合数据处理管道、与 Unix 命令组合使用 | 输入格式可定义清晰的 Parser 契约 | 流式读取和编码处理（UTF-8 BOM 等）易出错，须处理空输入和超大文件 |
    | Z | 自定义 | (请描述你的输入/输出方案) | - | - |

    #### [?Lib] 公共 API 与类型设计
    > 决定此功能暴露给消费者的接口形态。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Single Function | 导出一个或少数独立函数，消费者 `import { fn } from 'lib'` 直接调用。适合功能单一、无状态的工具函数（如格式化、校验、转换） | 接口最简，AI 生成使用示例和单元测试的准确率最高 | 功能扩展时可能导致函数签名膨胀（参数越来越多） |
    | B | Class / Instance | 导出类，消费者 `new MyLib(config)` 创建实例后调方法。适合需维护内部状态、提供多个关联操作的模块 | 类的 constructor + methods 结构清晰，AI 易理解对象生命周期 | 继承层级过深增加上下文复杂度，AI 追踪 this 绑定易出错 |
    | C | Builder / Fluent | 通过链式调用构建配置，如 `lib.create().withName('x').withSize(10).build()`。适合可选配置项多、需要渐进式构建的场景 | TypeScript 下链式调用可逐步收窄类型，类型安全好 | 链式方法的调用顺序约束和泛型体操复杂，AI 生成类型定义易出错 |
    | D | Config Object | 接受一个配置对象作主要输入，如 `init({ name: 'x', plugins: [...] })`。适合初始化参数多且需统一管理的场景 | 配置对象可用 interface/Zod 严格定义，AI 从类型推断行为非常准确 | 配置项过多时文档和校验逻辑繁重，可选字段的默认值合并易出错 |
    | E | Plugin / Middleware | 核心精简，功能通过插件/中间件扩展。如 Express 中间件管道、Vite 插件系统。适合需要高度可扩展的框架级库 | 核心代码简单，AI 可独立生成每个插件 | 插件间交互、执行顺序和类型安全难以保证，AI 易生成相互冲突的插件 |
    | Z | 自定义 | (请描述你的 API 设计方案) | - | - |

    #### [?API] 接口契约与路由设计
    > 决定此功能的 API 端点结构和调用方式。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | RESTful CRUD | 标准 REST 资源路由：`GET /users` 列表、`POST /users` 创建、`GET /users/:id` 详情、`PUT/PATCH` 更新、`DELETE` 删除。适合实体明确、操作可标准化的增删改查场景 | REST 是最普及的 API 模式，AI 训练数据极充足，生成路由+控制器准确率最高 | 复杂查询和跨资源操作用纯 REST 表达力有限，容易产生非标准端点 |
    | B | RPC-Style Actions | 面向操作的端点，如 `POST /send-invite`、`POST /calculate-price`。适合业务动作不能简单映射到 CRUD 动词的场景 | 端点语义明确，AI 可从动作名直接推断实现逻辑 | 缺乏统一范式，端点命名易不一致，数量膨胀后难以维护 |
    | C | GraphQL | 单端点 + Schema 查询语言，客户端按需请求字段和关联。适合前端数据需求多变、需要减少多次请求的场景 | Schema 即文档，强类型定义，前端自由组合查询 | Resolver 的 N+1 问题和细粒度权限校验复杂，AI 生成 DataLoader 常有缓存 Bug |
    | D | Nested Sub-resource | 嵌套路由表达从属关系：`GET /users/:id/posts`、`POST /teams/:id/members`。适合资源间有明确父子关系的场景 | 路由结构反映数据关系，AI 可从路由推断查询逻辑 | 嵌套超 2 层路由冗长，权限检查须逐级验证父资源所有权 |
    | Z | 自定义 | (请描述你的 API 设计方案) | - | - |

    ---

    ### 维度 2: Interaction Pattern (必问)

    #### [?UI] 展示与交互模式
    > 决定用户看到什么界面、如何操作。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | CRUD Table/List | 数据以表格或列表展示，用户可筛选/排序/翻页，点击行进入详情，通过按钮新增/编辑/删除。最经典的数据管理模式，适合后台管理、资源列表 | 表格组件是 AI 训练数据最充足的 UI 模式，生成代码的准确率最高 | 大数据量下需分页+排序+多条件筛选的组合逻辑，交互状态管理较多 |
    | B | Wizard / Stepper | 将复杂操作拆为多步页面：第1步填基本信息 → 第2步选配置 → 第3步确认提交。带进度条和步骤指示器，支持前后翻页。适合注册流程、配置向导、多步表单 | 每步状态独立明确，AI 可逐个生成 Step 组件 | 跨步骤数据共享/校验复杂（如第3步需第1步数据），AI 易遗漏步骤间状态传递 |
    | C | Dashboard / Kanban | 以卡片/列形式展示数据，可拖拽卡片在列间移动。如"待办→进行中→已完成"的看板，点击卡片展开详情。适合任务管理、状态工作流、项目看板 | 视觉直观，每张卡片是独立上下文单元 | 拖拽排序依赖文档较差的第三方库（dnd-kit 等），AI 生成拖拽逻辑幻觉风险高，跨浏览器兼容问题多 |
    | D | Modal / Drawer | 点击列表项后弹出浮层（模态框）或侧边滑出面板（抽屉）展示详情/编辑表单。操作完关闭回到列表，不离开当前页面。适合详情查看/快速编辑不需要独立页面的场景 | 上下文局部化，不需要路由跳转 | Z-index 层叠、Focus Trap（焦点锁定）、Escape 关闭、背景滚动锁定等交互细节常出 Bug |
    | E | Infinite Scroll / Feed | 滚动到底部自动加载更多，形成无限信息流。如社交 Timeline、新闻 Feed、商品瀑布流。用户不断下滑，新内容无缝追加。适合内容消费型场景 | 基本的"加载更多"逻辑简单 | 虚拟滚动（只渲染可视区 DOM）极难写对，滚动位置恢复和快速滚动白屏 AI 很难处理好 |
    | F | Editor / Canvas | 富文本编辑区或画布式自由操作区域。用户自由输入/绘制/拖拽元素。如文档编辑器、流程图工具、白板。适合内容创作/可视化编辑 | 功能上限高，用户自由度大 | Canvas 是指令式 API，比声明式 DOM 难生成得多；富文本 Selection API 极为复杂，AI 生成质量远低于普通 UI |
    | Z | 自定义 | (请描述你的交互方案) | - | - |

    #### [?CLI] 用户交互模式
    > 决定用户如何与此 CLI 功能互动、看到什么反馈。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Silent / Batch | 无交互，纯静默执行。成功输出结果到 stdout，失败到 stderr。如 grep、jq 等管道工具。适合作为脚本/管道中一环被其他命令组合调用 | 实现最简，无 I/O 副作用，测试只需断言 stdout 输出 | 用户在执行过程中无法获得进度反馈，不知道程序在干什么 |
    | B | Progress / Spinner | 执行期间显示进度条或旋转动画，完成后输出结果摘要。如 npm install 的下载进度条。适合耗时操作需要反馈执行状态 | 标准模式，clack/ora 等库支持完善，几行代码即可接入 | 须处理非 TTY 环境降级（CI 中关闭动画）、终端宽度变化等边界情况 |
    | C | Interactive Menu | 展示菜单让用户选择操作，如 select/multiselect/confirm 交互问答。适合功能入口多、用户需浏览和选择的场景 | 菜单结构明确，AI 可逐个生成选项处理逻辑 | 菜单层级过深体验差，须处理不支持交互的终端回退方案 |
    | D | REPL / Shell | 进入持续交互循环：输入命令→输出结果→继续输入。如 Node.js REPL、数据库客户端。适合探索式工具、调试器 | 每轮交互独立，AI 可逐条命令处理 | 须维护会话状态、命令历史、Tab 补全，实现复杂度高 |
    | E | Watch / Daemon | 持续运行并监听变化，自动触发操作。如 tsc --watch、nodemon。适合开发工具、文件同步、自动构建 | 事件驱动模型清晰，每次触发独立处理 | 跨平台文件监听兼容性、防抖逻辑、优雅退出（SIGINT/SIGTERM）处理难点多 |
    | Z | 自定义 | (请描述你的交互方案) | - | - |

    #### [?API] 客户端集成模式
    > 决定调用方如何接入和使用此 API。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Direct HTTP Call | 客户端直接发 HTTP 请求调用，如 `fetch('/api/users')`。最简单直接的集成方式，无需额外封装 | 无额外抽象层，AI 生成请求代码最简单直接 | 类型安全需手动维护，接口变更时客户端容易失同步，重复代码多 |
    | B | SDK / Client Lib | 提供封装好的客户端 SDK，调用方 `import { api } from 'sdk'` 后用类型化方法调用。如各云服务的官方 SDK | 强类型安全，接口变更在编译期发现 | 须额外维护 SDK 代码和版本发布，增加开发负担 |
    | C | Code Generation | 从 OpenAPI/GraphQL Schema 自动生成客户端代码和类型定义。如 openapi-typescript 生成类型 | Schema 即合约，类型自动生成零手动维护 | 生成代码定制性有限，Schema 变更需重新生成并检查兼容性 |
    | D | Webhook / Event | API 通过 Webhook 回调主动通知客户端。客户端提供接收端点，如支付完成后通知、CI 构建完成通知。适合异步事件驱动场景 | 解耦，异步通知无需轮询 | Webhook 的签名验证、重试幂等、超时处理 AI 容易遗漏 |
    | Z | 自定义 | (请描述你的集成方案) | - | - |

    #### [?Lib] 消费者使用模式
    > 决定消费者如何使用此库的功能。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Import & Call | 直接导入函数/类并调用：`import { parse } from 'lib'; parse(data)`。最直接的使用方式，零配置即可上手 | 使用方式最简，AI 生成示例代码和测试准确率最高 | 功能扩展时可能需频繁修改公共签名，影响下游消费者 |
    | B | Register & Use | 先注册配置再使用：`const app = createApp(config); app.use(plugin); app.start()`。适合需要初始化和生命周期管理的库 | 初始化与使用阶段分离，AI 可分阶段生成逻辑 | 注册时序和生命周期约束需清晰文档，AI 可能生成错误调用顺序 |
    | C | Decorator / Annotation | 通过装饰器声明行为：`@Route('/users') class UserCtrl {}`。适合框架级库，声明式配置减少样板代码 | 声明式代码简洁，意图清晰 | TS 装饰器提案仍在演进，AI 可能混淆旧版（experimentalDecorators）和新版（stage 3）语法 |
    | Z | 自定义 | (请描述消费者的使用方式) | - | - |

    ---

    ### 维度 3: Data Flow (条件维度)

    **提问条件**: 项目含 [?UI+Data]、[?UI+API] 标签时提问；纯 [?CLI]/[?Lib] 跳过。

    #### [?UI] 状态同步与数据流
    > 数据如何在前端界面和后端之间流转和同步。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Standard Request | 用户操作→发请求→等响应→更新界面。经典请求-响应模式，页面发 API 调用显示 loading，收到数据后渲染。适合大多数标准 CRUD 操作 | 原子操作，无状态，AI 生成 fetch + loading/error 状态处理最可靠 | 每次操作须等网络往返，操作频繁时体感较慢 |
    | B | Optimistic UI | 用户操作后立即更新界面（假设成功），后台同步发请求。如点赞后立即 +1，服务端失败才回滚。适合操作频繁且大概率成功的场景 | 用户体感极快，交互无卡顿 | 回滚逻辑（服务端返回失败时恢复原状态）常被遗忘，AI 容易只写乐观更新不写回滚 |
    | C | Polling / SWR | 定期自动重新获取数据，或窗口聚焦时刷新。如列表每 30 秒自动刷新。适合数据需要准实时但不必毫秒级更新的场景 | React Query/SWR 等库封装完善，AI 只需配置 staleTime/refetchInterval | 轮询间隔和缓存失效策略需平衡，不当配置会造成无意义的请求风暴 |
    | D | Realtime (Socket/SSE) | 服务端通过 WebSocket 或 SSE 主动推送数据到客户端。如在线聊天、实时协作、股票行情。客户端建长连接后实时收更新 | 延迟最低，数据实时同步，用户体验最好 | 断线重连、心跳保活、消息顺序保证极难正确实现，AI 生成的 WebSocket 代码常有连接泄漏 |
    | E | Local-First / Offline | 数据优先存本地（IndexedDB/SQLite），联网时与服务端同步。如离线编辑后上线同步。适合弱网/离线必须可用的场景 | 离线可用，不受网络影响 | 冲突解决算法（CRDT/OT）是高阶问题，AI 难以正确实现多端并发冲突合并 |
    | F | Background Job | 用户触发后立即返回，后台异步完成。如"导出报表"提交后排队处理，完成后通知下载。适合耗时操作（批量处理、文件生成） | 主线程解耦，API 响应快 | 须额外实现任务队列、状态查询和完成通知机制 |
    | Z | 自定义 | (请描述你的数据流方案) | - | - |

    ---

    ### 维度 4: Error Handling (必问)

    > 此功能特有的异常和边界情况如何处理。

    **参考选项库**（通用，AI 根据项目类型微调措辞）:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Fail Fast / Notify | 遇到错误立即中止操作并通知用户（Toast/Alert/stderr）。不尝试恢复，让用户决定下一步。适合大多数非关键操作的默认策略 | 实现最简单（一行 throw + 全局错误处理），AI 几乎不会写错 | 用户体验偏生硬，频繁操作失败时通知轰炸 |
    | B | Form Validation | 在用户提交前进行字段级/表单级校验，阻止非法输入到达后端。如"邮箱格式不对"、"密码至少8位"实时提示。适合有用户输入的表单场景 | Zod/Yup Schema 可同时用于校验和类型推断，AI 从 Schema 生成 UI 反馈准确 | 复杂校验规则（异步唯一性、跨字段依赖）的正则和时序 AI 容易写错 |
    | C | Retry / Recovery | 操作失败后自动重试或提供手动重试按钮。如网络请求失败自动重试 3 次，仍失败则提示用户。适合网络不稳定或外部服务间歇性故障的场景 | 重试逻辑可封装为通用工具函数，复用度高 | 须确保操作幂等（重复执行不产生副作用），AI 难以验证幂等性 |
    | D | Fallback / Skeleton | 加载失败或数据为空时显示降级 UI（骨架屏、占位图、空状态提示）而非白屏/崩溃。适合页面初始加载、部分数据缺失的场景 | 骨架屏是标准 UI 模式，AI 生成准确率高 | 须为每个状态（loading/empty/error）维护并行 UI 结构，组件数量翻倍 |
    | E | Draft / Auto-save | 用户编辑过程中自动定期保存草稿，防止意外丢失数据。如编辑长文章时每 30 秒自动保存。适合长时间编辑、内容创作场景 | 保存逻辑可抽象为通用 Hook/工具函数 | 保存节流（debounce/throttle）、冲突检测（他人同时编辑）须仔细处理 |
    | F | Undo / Redo | 操作后支持撤销/重做。如删除后显示"撤销"按钮，5秒内可恢复。适合用户可能误操作且后果较严重的场景 | 提升用户信心，降低操作焦虑 | 状态快照和历史栈管理逻辑复杂，AI 生成 undo 栈经常有内存泄漏或状态不一致 |
    | Z | 自定义 | (请描述你的错误处理方案) | - | - |

    ---

    ### 维度 5: Access & Scope (条件维度)

    **提问条件**: 项目含 [?Web/API] 标签时提问权限控制；含 [?Lib] 标签时提问封装策略；纯 [?CLI] 通常跳过。

    #### [?Web/API] 权限控制
    > 谁能执行此功能的操作、看到什么数据。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Public | 完全公开，无需登录即可访问。如公开展示页、公共 API 端点。适合面向匿名用户的公开内容 | 无需鉴权中间件，API 层最简 | 须额外考虑限流防滥用，公开接口易被爬虫和恶意调用 |
    | B | Authenticated | 仅登录用户可访问。如个人主页、订单列表。用户须提供有效 token/session 才能调用 | 标准 JWT/Session 中间件即可实现，AI 生成成熟度高 | 须处理 token 过期刷新、多端登录踢出等会话管理逻辑 |
    | C | Owner Only | 仅资源创建者可操作。如"只有自己能编辑自己的文章"，查询时加 `WHERE userId = currentUser.id` | 简单的所有权检查，一行代码即可实现 | 如果资源可转让或有代理操作场景，简单 owner 检查不够用 |
    | D | Role Based (RBAC) | 按角色划分权限，如 admin/editor/viewer 各有不同操作权限。适合后台管理、多角色协作系统 | 权限规则明确可枚举，AI 可基于角色矩阵生成守卫逻辑 | 守卫逻辑分散在每个端点，上下文负载高；角色嵌套时权限继承复杂 |
    | E | Team / Shared | 团队/组织成员可访问。如"团队空间内的文档所有成员可见"。适合协作场景、多租户系统 | 权限边界以团队为单位，粒度适中 | 须查询团队成员关系表，涉及复杂 JOIN；跨团队共享进一步复杂化 |
    | F | Tier / Subscription | 按付费等级限制功能。如"免费用户 3 个项目，Pro 无限制"。适合 SaaS 产品的分级功能 | 规则可配置化，与业务逻辑解耦 | Mock 支付状态和计费逻辑困难，测试需要大量 fixture 数据 |
    | Z | 自定义 | (请描述你的权限方案) | - | - |

    #### [?Lib] 封装与可见性
    > 此功能的代码如何组织封装，对消费者暴露什么。

    **参考选项库**:
    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Full Public | 所有功能和类型全部公开导出，消费者可直接访问内部实现。适合透明度高的小型工具库 | AI 无需猜测哪些是公开 API，所有类型都可追溯 | 公开面过大，任何内部重构都可能是 breaking change |
    | B | Facade / Entry Point | 通过单一入口文件（index.ts）精选导出公共 API，内部实现不直接暴露。适合需要稳定公共接口的库 | 公共面小且明确，AI 从 index.ts 即可理解全部可用 API | 须持续维护导出列表，新功能须显式添加到 facade |
    | C | Internal / Private | 仅暴露最小公共接口，大量实现标记为 internal。适合核心库、安全敏感模块 | 最小公开面，breaking change 风险最低 | AI 需要修改 internal 代码时缺乏上下文，须频繁阅读源码 |
    | Z | 自定义 | (请描述你的封装策略) | - | - |

    ---

    **Goal**: 锁定 `spec`, `ui`(如适用), `data_snapshot.json`(如适用)。

    **⌨️ INPUT**: 回复 **OK** 全部接受；或自由文本标注修改项。无需按固定格式。
</step_2_interview>

<step_2_5_refinement>
    **Role**: 咨询顾问
    **Trigger**: 用户回复非 OK，含修正、疑问、覆写或明显逻辑冲突。
    **Action**: 不生成文档。融入用户反馈，刷新 Unified Proposal 重新输出，等待再次确认。
    - 如是功能设计疑问 → 给出替代方案对比，重新提出设计
    - 如是架构维度疑问 → 结合此功能具体场景解释差异，更新推荐
    - 如是维度覆写 → 直接替换推荐并调整相关设计
</step_2_5_refinement>

<step_3_global_sync>
    **Role**: 系统管理员
    **Constraint**: 在生成 Feature 文档**之前**，须先更新以下全局文件。

    **Boundary**: 仅注册**项目业务域**内容。Architext 框架概念（scripts、scaffold、roadmap、plan 等）和框架基础设施错误禁注册到全局文件。

    **Action Checklist**:
    1.  **`map.json`**: 在 `directoryMapping` 注册 `[[__DOCS_DIR__]]/features/<ID>_<Slug>`；在 `logicalTopology` 定义模块职责与依赖。
    2.  **`dictionary.json`**: 提取提案中的**项目业务**新术语填入 `entities`/`verbs`；注册新共享工具到 `utilities`；注册新公共组件到 `components`。
    3.  [?Data] **`data_snapshot.json`**: 根据架构建议中核心结构的选择新增/修改 Schema。禁写"待定"，须写出字段名和类型。
    4.  **`error_codes.json`**: 根据架构建议中错误处理的选择注册新**业务**错误码。框架脚本错误由 exit code + stderr 处理，禁注册。

    **Output**: 上述文件的变更 Diff (简要)。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文档工程师
    **Input**: 确认的 Unified Proposal（功能设计 + 架构建议）+ 已更新的全局上下文。
    **Action**: 在 `[[__DOCS_DIR__]]/features/<ID>_<Slug>/` 下生成标准文档。

    **1. `spec.md`** (必须):
    - 模板: `templates/spec.template.md`。
    - 基于确认的功能设计和架构建议，转化为 Gherkin Scenarios。
    - 每个 Scenario 须对应功能设计中的具体流程步骤或异常路径，禁凭空编造场景。
    - 若为上游任务，须包含明确的 Interface/Type 定义。

    **2. `ui.md` + `ui.preview.html`** [?UI]:
    - **`ui.md`**: 模板 `templates/ui.template.md`。基于架构建议中交互模式的选择转化为 ITP v3.0 描述；引用 `design_tokens.json` 中的 componentPresets。
    - **`ui.preview.html`**: 模板 `templates/ui.preview.template.html`。基于 `ui.md` 组件树生成可浏览器打开的视觉预览；须包含所有状态(Default/Loading/Empty/Error)；使用 Tailwind CDN + design_tokens 中的实际颜色值。须在生成后提示用户浏览器打开确认视觉效果。

    **3. `plan.json`** (必须):
    - 模板: `templates/plan.template.json`。
    - 根据项目类型动态调整 Phase；确保每个 Task 上下文自包含。
    - 任务描述中明确 "Additive Only" + "Respect Unknowns"。
    - **`decisions`**: 按各维度填写；`choice` 支持多选（如 `A B`，空格分隔）、自定义（`Z: …`）；`rationale` 须填写理由，供 code 阶段参照，禁留空。
    - **`notes`**: 每个 task 的 `notes` 须填写执行时速记（范围、spec 段落引用、关键约束），供 `/archi.code` 阶段精确定位，禁留空。
    - 生成后运行 `npx archi render` 生成可读的 `.md` 视图。
</step_4_generate>

<step_5_audit>
    **Role**: 首席审计官
    **Checklist**:
    1.  **Design Fidelity**: Spec 中的 Scenarios 是否完整覆盖确认的功能设计（流程步骤和异常路径）？
    2.  **Tech Consistency**: 是否用了未声明技术？
    3.  **Data Integrity**: Scenario 中的实体和字段是否与确认的核心实体一致？
    4.  **Error Handling**: 是否覆盖架构建议中错误处理的选择？
    5.  **AX Compliance**: 是否遵守 Anti-Clobbering 和 Interface Stability？

    如有问题则静默修正；严重问题标记 `⚠️ Risk Warning`。
</step_5_audit>

<step_6_signoff>
    **Action**:
    1.  运行 `npx archi task --check` 验证 Roadmap 一致性。
    2.  运行 `npx archi task <ID> --status active` 标记任务为进行中。
    3.  输出总结。

    **Output**: Feature 定义摘要，含架构建议确认表（各维度最终选择及理由）和 Next Steps 表格。
</step_6_signoff>

</protocol_plan>

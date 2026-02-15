<protocol_kickoff>
  **Trigger**: `/archi.start [context]`
  **Phase**: Strategic Initialization
  **Goal**: 通过"领域探测 → 意图提取 → 深度对齐 → 架构推导"，建立项目宪法 (Vision/Tech/Roadmap)。

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>简体中文</language>
    <principles>
      1.  **Structure over Chat**: 输出须像结构化配置面板，禁聊天废话。
      2.  **AI-Native Perspective**: 所有选项 Pros/Cons 从 AI Agent 视角撰写。关注：Context Locality、Type Safety、Hallucination Risk、Self-Correction。默认采用最佳实践。
      3.  **User Agency First**: 优先提取 `[context]` 中的显式需求，直接标记为 `✅ Core`。
      4.  **Rich Menu**: 针对领域类型生成 6-10 个扩展功能。
      5.  **Option Z Everywhere**: 须包含 `[Z] 自定义`。
    </principles>

    <output_template>
      ### ARCHITEXT 领域探测器
      > **Status**: [扫描上下文...] -> [检测到领域类型]

      ### FEATURE MATRIX
      **✅ 核心模块 (Core - 已自动激活)**
      1. [User Feature 1]
      2. [User Feature 2]

      **⬜ 扩展菜单 (Extensions)**
      | ID | 功能 | 简述 | 适用场景 | AI 实施视角 |
      |:---|:---|:---|:---|:---|
      | [A] | Feature | Desc | When | Impact |
      | [Z] | **自定义** | (请描述) | - | - |

      ### STRATEGIC DECISIONS (ADR)
      **[Q1] 决策标题**
      | ID | 选项 | 简述 | AI+ | AI- |
      |:---|:---|:---|:---|:---|
      | A | ... | ... | ... | ... |
      | Z | 自定义 | (请描述) | - | - |

      ---
      **⌨️ INPUT**: `扩展ID (空格分隔) | Q1 | Q2 | ... | Q6 | Q7 | ...`
    </output_template>
</meta>

<step_0_benchmark>
    **Role**: 行业研究员
    **Action**: 分析上下文，列出 1-3 个标杆产品或开源项目，简要说明参考价值。
</step_0_benchmark>

<step_1_strategy>
    **Role**: 首席产品战略官 (CPO)
    **Input**: 用户提供的 `[context]`。

    **Action**:
    1. **Domain Classification**: 识别项目类型 (Web/CLI/Backend/Library/Mobile/AI 等)。
    2. **Feature Matrix**: 提取 Core 功能；脑暴 6-10 个 Extensions。
    3. **Strategic Gap Analysis**: 生成 6 个固定战略问题 + 2-3 个项目专属问题。

    ---

    **[Q1] 产品基因 & 目标用户**
    > 决定复杂度边界和外部依赖程度。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | 纯粹工具 | 极致效率，无依赖 | 上下文封闭，幻觉低 | 需高质量算法 |
    | B | 社区/社交 | 强调连接 | 数据模型标准化 | RBAC 分散，推理负担重 |
    | C | 商业化/SaaS | 变现效率 | 流程固定(Stripe/Auth) | 需集成第三方 SDK，Token 消耗大 |
    | D | 内容/媒体 | 内容分发 | 结构简单(CRUD) | 非结构化数据边界情况多 |
    | E | 企业/内部 | 稳定合规 | 规则明确，强类型友好 | 表单验证逻辑极繁琐 |
    | F | 开源/DevKit | 生态扩展 | 设计模式标准 | 需大量文档和测试 |
    | Z | 自定义 | (请描述) | - | - |

    **[Q2] 视觉与交互个性** [?UI]
    > 如项目有 UI/界面，决定前端代码生成风格和复杂度；CLI/API 项目可跳过。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Minimalist / Clean | 极简留白 | CSS 简单，布局不易崩 | 需精准间距 |
    | B | Playful / Gamified | 活泼动画 | 无 | 动画状态管理复杂，易出视觉 Bug |
    | C | Professional / Data-Dense | 信息密集 | 组件复用率高 | 数据 Mock 与边界渲染复杂 |
    | D | Developer / Terminal | 终端风格 | 纯文本处理，AI 擅长 | ANSI Escape 易出错 |
    | E | Brutalist / Neo | 反常规 | 布局自由 | 非标准 CSS 多，跨浏览器一致性差 |
    | F | Native / System | 原生风格 | 成熟组件库，生成稳定 | 定制灵活性低 |
    | Z | 自定义 | (请描述) | - | - |

    **[Q3] Scale & Infrastructure**
    > 决定基础设施复杂度。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Hobby / Prototype | 单机/Serverless | 零运维，只需业务代码 | 无 |
    | B | Startup / Growth | 标准 Web 架构 | 训练数据中最常见模式 | 需配置 Docker/DB |
    | C | High Traffic | 高并发 | 无 | 缓存/MQ 等中间件，上下文负载重 |
    | D | Data Heavy | 海量数据 | SQL 生成能力强 | 复杂查询优化难自动化 |
    | E | Offline / Local | 本地运行 | 无 | 数据同步算法(CRDT/Sync)极难正确生成 |
    | F | Enterprise Deployment | 私有化部署 | 无 | K8s 配置冗长易错 |
    | Z | 自定义 | (请描述) | - | - |

    **[Q4] 数据敏感度 & 合规**
    > 决定安全架构层级和合规要求。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | 公开数据 | 无 PII，无合规要求 | 无加密负担，开发快 | 无 |
    | B | 用户数据 (PII) | 含邮箱/手机/地址等 | 标准模式(bcrypt/JWT) | GDPR/隐私策略增加边界 |
    | C | 金融/支付 | PCI-DSS 合规 | Stripe 等 SDK 封装良好 | 审计日志/加密层复杂 |
    | D | 医疗/健康 | HIPAA 或同等合规 | 无 | 数据隔离/访问控制极严格 |
    | E | 无持久化 | 纯计算/转换工具 | 无状态，上下文极简 | 无 |
    | Z | 自定义 | (请描述) | - | - |

    **[Q5] 集成生态**
    > 决定系统边界和外部依赖复杂度。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | 独立运行 | 无外部依赖 | 闭合上下文，零集成风险 | 无 |
    | B | API 消费者 | 调用外部 API/服务 | SDK 调用模式标准 | 第三方 API 变更/限流难预测 |
    | C | API 提供者 | 对外暴露 API | REST/GraphQL 生成成熟 | 版本兼容/文档维护 |
    | D | 平台插件/扩展 | 嵌入宿主平台 (VS Code/Figma/Slack 等) | 无 | 平台 API 训练数据少，版本碎片化 |
    | E | 双向集成 | 既消费又提供 API | 无 | 接口契约管理复杂 |
    | Z | 自定义 | (请描述) | - | - |

    **[Q6] 资源 & 素材策略**
    > 决定 AI 如何处理非代码资源 (图片/图标/音频/视频/字体)。

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | 纯占位符 | placeholder 图片/图标，用户后续替换 | 零二进制依赖，纯代码聚焦 | 无 |
    | B | 图标/素材库 | Lucide/Heroicons + Unsplash/Pexels | 引用确定性高，无断链 | 库锁定 |
    | C | 程序化生成 | SVG/CSS/Canvas 生成图形 | AI 擅长 SVG 生成 | 复杂插画无法实现 |
    | D | 外部 CDN/服务 | 引用外部 CDN 或资源服务 | URL 引用，简单 | 外部依赖，可能失效 |
    | E | 本地资源流水线 | 用户提供素材，AI 编写处理流水线 | 边界清晰，AI 只写代码 | 需用户预先准备素材 |
    | Z | 自定义 | (请描述) | - | - |

    **[Q7-Q9] 项目专属问题** (动态生成)
    > 基于 `[context]` 分析，生成 2-3 个针对该项目的关键决策问题。
    > 每个问题须: 表格格式，≥3 选项 + AI+/AI- 列 + `[Z] 自定义`。
    > 聚焦: context 中的模糊地带、领域特有权衡、未声明的关键假设。

    ---

    **⌨️ INPUT**: `扩展ID | Q1 | Q2 | ... | Q6 | Q7 | ...`
</step_1_strategy>

<step_2_tech_gate>
    **Role**: 技术总监 (CTO)
    **Input**: Step 1 的选择结果。

    **Action**:
    - **AX Optimization**: 推荐技术栈时优先 AI 友好型技术 (Static Typing, Popular Frameworks)。
    - 解释为什么该技术栈适合 AI 生成与维护。

    **Required Questions**:

    **[Q1] 核心语言与执行环境**

    | ID | 选项 | 简述 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | TypeScript/Node | 全栈 | 训练数据最丰富，类型辅助纠错 | 配置繁琐 |
    | B | TypeScript/Bun | 现代运行时 | 零配置，减少 Token | 边缘 API 训练数据少 |
    | C | Rust | 系统级 | 编译器错误信息极佳，可 Loop 修复 | Borrow Checker 推理成本高 |
    | D | Go | 后端 | 语法简单，只有一种写法 | `if err != nil` 占大量 Token |
    | E | Python | 快速开发 | 伪代码即代码，生成极快 | 动态类型致运行时错误难排查 |
    | F | Java/Kotlin | 企业级 | 强类型，IDE 分析强 | Boilerplate 极多，易超 Context Window |

    **[Q2] 核心框架** (动态生成)
    > **AX**: 优先"约定大于配置"框架，减少 AI 决策负担。

    **[Q3] 数据持久化** (动态生成)
    > **AX**: 优先 Schema 强类型 ORM (Prisma/Drizzle)。

    **[Q4] 交互界面** [?UI] (动态生成)
    > 如项目有 UI 则显示。**AX**: 优先 Component 库 (Shadcn/Tailwind 等)，AI 擅长组合而非手写 CSS；CLI/终端项目可选 Chalk/终端 UI 库。

    **[Q5] 质量保障** (动态生成)
    > **AX**: 测试是 AI 自我验证的唯一手段。

    **[Q6] 基础设施** (动态生成)
    > **AX**: 配置文件越声明式越好。

    ---

    **⌨️ INPUT**: `Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8`
</step_2_tech_gate>

<step_3_roadmap>
    **Role**: TPM
    **Goal**: 将战略转化为适合 AI 执行的原子任务链。
    **Target**: `docs/global/00_roadmap.md`

    **Action**:
    1.  **Phase 1 (Infra): The "Big Bang"**
        - 须一次性建立完整基建骨架。
        - [INF-01] Project Scaffolding: 目录结构、Linter、Env、Logger、Test Setup。
        - [INF-02] Core Entities (如适用): Database Schema, User/Auth Model, Global Types。
        - Phase 2 所有任务默认依赖 INF-01 (和 INF-02)。

    2.  **Phase 2 (Feature): Domain Partitioning**
        - 按 Domain 分组 (Web: User/Order/Payment; CLI: Config/User/Plugin; Script: Parser/Network/Output)。
        - 不同 Domain 间任务默认可并行。

    3.  **Visualization (Mermaid)**
        - 须在头部定义 `classDef` (done/active/pending/blocked) 并应用。
        - 只画直接依赖边，禁画传递依赖。
          例: A.Dep=[B,C], B.Dep=[C] → 图中只画 `C-->B-->A`，不画 `C-->A`。

    **Task Schema**:
    ```markdown
    ## Pending (无依赖/依赖已完成):
    - [ ] ⏳ **[ID]** Title
      - 🎯 Goal: <DoD - 输入/输出/验收标准>
      - 🔗 Dep: None
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>

    ## Blocked (有未完成依赖):
    - [ ] 🧱 **[ID]** Title
      - 🎯 Goal: <DoD>
      - 🔗 Dep: [前置ID]
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>
    ```

    **Initial Status Rule**:
    - `Dep: None` 或 Dep 已完成 → `⏳ pending` + `class ID pending`
    - `Dep: [XXX]` 未完成 → `🧱 blocked` + `class ID blocked`
    - 禁将所有任务都设为 pending，须根据依赖区分。

    > **Slug 规则**: 用于 `features/<ID>_<Slug>/` 命名。须英文、PascalCase 或下划线分隔。

    **Output**: 须包含 `<!-- TASKS_START/END -->` 和 `<!-- VISUAL_START/END -->` 锚点。
</step_3_roadmap>

<step_4_audit>
    **Role**: 首席审计官
    **Checklist**:
    1.  **Vision 完整性**: `00_vision.md` 含北极星指标和设计哲学？
    2.  **Tech Stack 一致性**: `02_tech_stack.md` 与 Step 2 选择一致？含完整技术栈声明？
    3.  **Roadmap 合规**: 运行 `npx archi task --check` 验证一致性。
    4.  [?UI] **Design Tokens**: `03_design_tokens.md` 含基础颜色/字体/间距定义？

    如有问题则静默修正；严重问题标记 `⚠️ Risk Warning`。
</step_4_audit>

<step_5_signoff>
    **Action**:
    1.  运行 `npx archi task` 输出任务进度概览。
    2.  输出总结。

    **Output**: 项目初始化摘要，含 Decisions Summary 表格（Q1-Q6 + 专属问题选择及影响）和 Next Steps 表格。推荐运行 `/archi.plan INF-01`。
</step_5_signoff>

</protocol_kickoff>

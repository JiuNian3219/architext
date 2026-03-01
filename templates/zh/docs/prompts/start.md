<protocol_kickoff>
  **Trigger**: `/archi.start [file_path]`
  **Phase**: Strategic Initialization
  **Goal**: 基于 Project Brief 建立项目宪法 (Vision/Tech/Roadmap)。

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>简体中文</language>
    <principles>
      1.  **Brief-Driven**: 以用户提供的 Brief 文件为核心输入源，禁凭空脑暴任务。
      2.  **AI-Native Perspective**: 所有推荐/补全从 AI Agent 视角撰写。关注：Context Locality、Type Safety、Hallucination Risk、Self-Correction。
      3.  **User Agency First**: Brief 中用户已填写的选择须直接采纳，禁质疑或替换。
      4.  **Minimal Questions**: 仅针对信息缺口提问，Brief 充分时可跳过提问直接生成。
      5.  **Option Z Everywhere**: 补充提问须包含 `[Z] 自定义`。
    </principles>
</meta>

<step_0_ingest>
    **Role**: 情报分析官
    **Action**:
    1. 解析触发命令中的 `[file_path]`：
       - 如提供了路径 → 读取该文件
       - 如未提供路径 → 依次查找 `project-brief.md`（项目根）、`[[__DOCS_DIR__]]/project-brief.md`
       - 如均不存在或为空 → 跳转 `<fallback_interview>`

    2. **资源可达性检查**（须在解析前完成）：
       扫描 Brief 全文，识别所有外部引用（URL、文件路径、图片）。逐一尝试访问，将结果分为三类：

       | 状态 | 处理 |
       |:---|:---|
       | 可访问 | 读取内容，纳入后续分析 |
       | 不可访问（需认证/404/私有链接） | 标记为 `[不可读]`，后续向用户报告 |
       | 非链接的描述性引用（如"参考 Linear 的交互"） | 正常处理，无需访问 |

       > 此步骤的目的：避免 AI 假装已读取实际未能访问的资源，导致后续产出与用户预期脱节。

    3. 解析 Brief 各 Section，提取：
       - 项目特征标签 (UI/Data/CLI/Lib/API — 由 Brief 中存在的技术偏好字段和段落推断)
       - 核心任务列表
       - 已有设计决策（用户对特定任务/页面/流程的预定设计）
       - 技术偏好（区分"已确定"与"留空/推荐"）
       - 已有资源与上下文
       - 边界与约束
       - 参考项目
       - 补充说明（规则/术语/背景信息）

    > Brief 是一次性输入文件，处理完成后用户可自行删除。

    **Output**:
    - 如有不可访问的资源 → **立即向用户输出资源可达性报告**，列出无法读取的链接，请用户提供替代方式（如截图、粘贴内容、文字描述）。等待用户回复后再继续。
    - 如所有资源可达或无外部引用 → 内部摘要（不输出给用户），进入 `<step_1_gap_analysis>`。
</step_0_ingest>

<step_1_gap_analysis>
    **Role**: 首席产品战略官 (CPO)
    **Input**: Step 0 解析结果。

    **Action**: 逐项检查 Brief 完整性，识别信息缺口。

    **检查清单**:

    | 检查项 | 判定标准 | 缺口级别 |
    |:---|:---|:---|
    | 项目身份 | 名称 + 一句话描述 + 问题陈述均已填写 | 必须 |
    | 目标用户 | 至少描述了核心用户角色 | 必须 |
    | 核心任务 | 至少列出 2 个具体任务且每项有描述 | 必须 |
    | 技术栈-核心 | 语言/运行时 + 核心框架已填写（非留空） | 必须 |
    | 技术栈-选填 | 数据库/ORM/CSS方案/部署等留空项 | 可补 |
    | 项目起点 | 全新 or 已有代码（影响架构决策） | 必须 |
    | 已有资源 | 设计稿/品牌/已有API/第三方服务是否明确 | 可补 |
    | 风格调性 | （仅ui项目） 视觉关键词 / （仅cli项目） 输出风格 / （仅api项目） 文档方案 | 可补 |
    | 边界 | 至少声明了 1 个反目标或硬性约束 | 建议 |
    | 成功指标 | 已填写具体可量化指标 | 建议 |
    | 参考项目 | 至少列出 1 个参照 | 建议 |

    **缺口分级**:
    - **必须**: 缺失则无法生成产物，须在 Step 2 提问
    - **可补**: AI 可基于上下文推荐，但最好确认
    - **建议**: AI 可自行推导，不阻塞流程

    **Decision**:
    - 无"必须"级缺口 + 无"可补"级缺口 → 跳过 Step 2，直接进入 Step 3
    - 有缺口 → 进入 Step 2

    **Output**: 向用户输出 Brief 分析摘要：
    ```
    ### BRIEF 分析报告
    > **项目**: [名称] | **特征**: [UI/Data/CLI/Lib/API 中已激活的标签]

    **已确认信息**:
    - [已填写的关键信息列表]

    **信息缺口** (须补充):
    - [缺口 1]
    - [缺口 2]

    **AI 将自动补全** (无需操作):
    - [AI 可自行推导的项]
    ```
</step_1_gap_analysis>

<step_2_supplementary>
    **Role**: 产品顾问
    **Trigger**: 仅当 Step 1 发现"必须"或"可补"级缺口时执行。
    **Input**: Step 1 的缺口列表。问题数上限 3-6 题。

    [[SKILL: archi-interview-protocol|按 skill 的核心规则和标准输出格式提问。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` 并遵循其规则）]]
</step_2_supplementary>

<step_3_constitution>
    **Role**: 首席架构师
    **Input**: Brief 全文 + Step 2 补充回答（如有）。

    **Action**: 一次性生成项目宪法文件。Brief 中的所有信息须被消化并路由到对应文件，禁遗漏。

    ### 信息路由规则

    > 规则文件（`02_tech_stack`、`90_custom_rules` 等）已由 IDE 注入当前上下文，AI 已知其路径，直接写入即可。

    | Brief 内容 | 目标文件 |
    |:---|:---|
    | 项目身份、目标用户、成功指标、参考灵感 | `[[__DOCS_DIR__]]/global/vision.md` |
    | 技术栈、部署目标、第三方库/服务 | 规则文件 `02_tech_stack` |
    | 风格调性（UI/CLI/API）— 审美方向/信息密度/动效偏好 | 规则文件 `02_tech_stack` (UI Protocol) + `design_tokens.json` aestheticDirection + motion.preference + illustration |
    | （仅ui项目） **审美方向** (saas-dark/saas-light/dashboard/marketing/mobile-app/editorial/brutalist/custom) | `design_tokens.json` `aestheticDirection.preset` + `aestheticDirection.customDescription` |
    | （仅ui项目） **视觉参考**（品牌色板/字体/图标库/竞品截图/禁用风格） | `design_tokens.json` primitivePalette.brand + illustration + motion; 截图/URL 存入 `vision.md` Visual Reference |
    | 核心任务列表 | `[[__DOCS_DIR__]]/global/roadmap.json` |
    | **已有设计决策** | Roadmap 对应任务的 `goal` 字段中注入，并在 `/archi.plan` 时作为硬约束 |
    | 边界与反目标 | `[[__DOCS_DIR__]]/global/vision.md` Boundaries |
    | 已有资源（设计稿/品牌/已有API） | `[[__DOCS_DIR__]]/global/vision.md` + 规则文件 `02_tech_stack` 按内容归属 |
    | 补充说明中的**规则/约定/偏好** | 规则文件 `90_custom_rules` |
    | 补充说明中的**领域术语** | `[[__DOCS_DIR__]]/global/dictionary.json` |
    | 补充说明中的**其他背景信息** | `[[__DOCS_DIR__]]/global/vision.md` Context |

    > 关键: 用户在"补充说明"中写的任何规则性内容（如"代码注释用英文"、"禁止使用 any"）须写入规则文件 `90_custom_rules`，而非丢弃。

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - 从 Brief 项目概述填充 Core Vision 和 Target Audience
    - 从 Brief 边界与约束填充 Boundaries
    - 从 Brief 风格调性（如有）填充 Design & Experience
    - 从 Brief 参考与灵感推导 Product Principles
    - 从 Brief 已有资源、补充说明提取背景上下文
    - 须填满所有 `[ ]` 占位符，禁保留模板示例文字

    ### 3.2 Tech Stack (规则文件 `02_tech_stack`)
    - Brief 中已确定的技术选择 → 直接写入
    - Brief 中留空/写"推荐"的 → AI 基于项目特征推荐，须在输出中标注 `(AI 推荐)` 并简述理由
    - Brief 中已有的第三方服务/API → 写入对应 Section
    - **AX Optimization**: 推荐时优先 AI 友好型技术 (Static Typing, Popular Frameworks, Convention-over-Configuration)
    - 须填充完整的 Section 1-9（Global Mandates、Technology Selection、Coding Standards、UI Protocol（仅ui项目）、Testing、Deployment、Architecture、Anti-Patterns、**Project Conventions**）
    - `Section 5 Testing` 中的 Environment Scripts 定义须完整
    - **Section 9 Project Conventions**: 基于 Brief 和项目特征确立全局架构约定，`/archi.plan` 将自动继承这些约定而非逐任务重复提问：
      - **Error Handling**: 根据项目类型推断 — （仅ui项目） Fail Fast + Form Validation; （仅cli项目） Fail Fast (stderr); （仅api项目） Schema Validation + Fail Fast; 多选时空格分隔
      - （仅ui项目） **Data Flow**: 根据实时性需求 — 无实时需求 → Standard Request (+ SWR/React Query if applicable); Brief 提及实时/协作 → Realtime
      - （仅ui或api项目） **Auth & Access**: 根据 Brief 用户角色 — 单角色 → Authenticated; 多角色 → RBAC; 无权限描述 → 留空待 Plan 阶段逐任务确认
      - 每项须填写 Strategy/Default + Rationale（理由须结合此项目的具体场景）

    ### 3.3 Custom Rules (规则文件 `90_custom_rules`)
    - 从 Brief 补充说明中提取规则性内容写入
    - 从 Brief 技术红线转化为具体禁止规则
    - 如用户未提供任何自定义规则，保持模板默认内容

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)
    [[SKILL: archi-decompose-roadmap|按 skill 的协议，基于 Brief 任务列表生成任务链，写入 roadmap.json，生成后直接进入下一步，无需用户确认。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` 并遵循其协议执行）]]

    ### 3.5 其他全局文档 (按需)
    - `dictionary.json`: 从 Brief 提取领域术语
    - （仅data项目） `data_snapshot.json`: 基于 Brief 中的数据描述，初始化核心实体骨架（实体名 + 主键字段）；无数据描述时写入空模板
    - （仅ui项目） `design_tokens.json`: 基于 Brief「风格与调性」和「视觉参考」填充：
      - `aestheticDirection.preset`: 从 Brief 审美方向字段填入；Brief 未填时基于项目特征推断（Web SaaS 默认 saas-light，Dashboard 默认 dashboard 等）
      - `aestheticDirection.customDescription`: 仅 custom 时填入用户描述
      - `primitivePalette.brand`: 从品牌色板提取 Hex 值；无则留空
      - `mode`: 从审美方向推断 default + support 数组（saas-dark → default:"dark"，saas-light → default:"light" 等）
      - `motion.preference` / `motion.patterns`: 从动效偏好填写 (subtle / rich / none)；rich 时扩充 patterns
      - `illustration.style` / `illustration.iconLibrary`: 从图示风格和图标库填写
      - `semanticTokens.colors`: 如有品牌色则以 Brand-600/Brand-500 等 key 填充 Primary
    - `error_codes.json`: 基于任务列表预定义核心错误码

    ### 3.6 Map (`[[__DOCS_DIR__]]/global/map.json`)
    - `directoryMapping`: 基于 tech_stack 中声明的架构模式，预注册核心目录骨架
      （如 `src/commands/`, `src/core/`, `src/utils/` 等）；各目录附一句话用途说明
    - `logicalTopology`: 暂为空数组，待 `/archi.plan` 时按需补充
    - `criticalUserJourneys`: 暂为空数组
    - `featureRelations`: 暂为空数组

    **Output**: 写入所有文件，然后运行 `npx archi render` 生成可视化 `.md`。
</step_3_constitution>

<step_4_verify>
    **Role**: 独立审查官
    [[SUBAGENT: archi-silent-audit|mode: init, context: 审查 step_3 生成的全局文件（vision, tech_stack, roadmap, dictionary 等）]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，按 mode: init 的审查维度表逐项检查）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_4_5_ui_wireframe>
    **Trigger**: 仅当项目 features 含 `ui` 时执行。
    **Action**: [[SKILL: archi-ui-wireframe|按 skill 的协议，自动调用 Phase 1 线框图生成。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并遵循其协议执行）]]
    - 无需用户确认即开始生成
    - 读取刚写入的 vision.md + roadmap.json + design_tokens.json + 02_tech_stack
    - 写入 `ui_concept.html` + `ui_context.md`
    - 输出 Phase 1 线框图摘要，等待用户确认后再进入 Phase 2 着色

    > 此步骤将 UI 线框图生成从"建议的下一步"变为"start 自动完成"，减少用户手动操作。
</step_4_5_ui_wireframe>

<step_5_signoff>
    **Terminal Gate** (禁止跳过，须在输出总结前全部完成):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    [[INCLUDE: shared/terminal-gate-base.md]]

    **Action** (Gate 通过后):
    1.  运行 `npx archi task` 输出任务进度概览。
    2.  输出总结。

    **Output**: 项目初始化摘要，含：
    - **Brief 来源确认**: 列出从 Brief 中采纳的关键决策
    - **AI 补全项**: 列出 AI 自动推荐的技术/决策及理由
    - **Roadmap 概览**: 任务数量和阶段分布
    - **Next Steps 表格**:

    | 优先级 | 行动 | 说明 |
    |:---|:---|:---|
    | （仅ui项目） 推荐 | 回复 **OK** 进入 Phase 2 着色 | Phase 1 线框图已自动生成；确认布局后着色 |
    | 推荐 | `/archi.plan INF-01` | 规划第一个基础设施任务 |
    | 可选 | `/archi.scope <scope-brief.md>` | 如有更多需求待分解，追加到 Roadmap |
</step_5_signoff>

<fallback_interview>
    **Trigger**: Brief 文件不存在或为空。
    **Role**: 产品顾问

    **Action**:
    1. 告知用户 `project-brief.md` 未找到。建议：
       - 检查项目根目录是否有该文件（`npx archi init` 时应已生成）
       - 如文件丢失，可重新运行 `npx archi init` 覆盖生成
       - 或继续对话，通过访谈方式提供信息
    2. 如用户选择继续对话，按以下顺序引导：
       a. 项目是什么？（名称、一句话描述、解决什么问题）
       b. 给谁用？（目标用户）
       c. 核心任务有哪些？（至少 2-3 个）
       d. 用什么技术？（语言/框架，已确定的部分）
       e. 有什么约束？（不做的事、时间、兼容性要求）
    3. 收集完毕后，将信息写入 `project-brief.md`（项目根目录），然后跳转 `<step_1_gap_analysis>`。

    > 此模式为向后兼容，核心流程仍以 Brief 为准。
</fallback_interview>

</protocol_kickoff>

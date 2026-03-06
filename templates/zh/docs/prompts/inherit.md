<protocol_inherit>
  **Trigger**: `/archi.inherit [brief_path]`
  **Phase**: Legacy Adoption
  **Goal**: 逆向分析已有代码仓库，用分析结果填充 init 部署的文档骨架（`[[__DOCS_DIR__]]`），将项目纳入框架管理。填充空占位符，非覆盖用户既有内容。可选提供 Brief 以补充愿景/路线图（适用于代码库尚空、骨架刚搭的场景）。

<meta>
    <style>Analytical, Systematic, Evidence-Based</style>
    <language>简体中文</language>
    <principles>
      1.  **Code-Driven**: 以代码为唯一真相源，禁凭空推测功能。
      2.  **AI-Native Perspective**: 分析从 AI Agent 视角撰写。关注：Context Locality、Type Safety、Module Boundaries。
      3.  **User Agency First**: AI 的分析须经用户确认。代码解读有歧义时询问用户，禁擅自决定。
      4.  **Thorough Discovery, Layered Recording**: 全量读取所有非第三方业务代码（排除 node_modules/vendor/dist 等生成物），不设文件数上限。记录按三档分层：核心模块详细记录流程、共享逻辑记录签名和依赖关系、纯工具记录签名和用途。宁可多读不可遗漏——后续协议无法使用未被记录的代码。
      5.  **Option Z Everywhere**: 补充提问须包含 `[Z] 自定义`。
    </principles>
</meta>

<step_0_recon>
    **Role**: 情报分析官

    **Brief 检测**（仅当用户提供 `[brief_path]` 时）:
    1. 解析 `[brief_path]`：提供了路径 → 读取该文件；未提供 → 依次查找 `project-brief.md`（项目根）、`[[__DOCS_DIR__]]/project-brief.md`
    2. 若文件存在且非空：解析 Brief 各 Section，提取项目身份、核心任务、技术偏好、边界约束、补充说明（与 start 的 step_0_ingest 一致）
    3. 若文件不存在或为空：跳过 Brief，后续仅以代码为输入源

    **代码侦察**:
    1. 读取项目根配置文件（自动识别类型）：

       | 语言/生态 | 配置文件 |
       |:---|:---|
       | Node.js | package.json, tsconfig.json |
       | Rust | Cargo.toml |
       | Go | go.mod |
       | Python | pyproject.toml, requirements.txt |
       | Java | pom.xml, build.gradle |
       | 其他 | 以根目录配置文件为准 |

    2. 读取 README.md（如存在）。
    3. 扫描目录结构（完整深度）。
    4. 推断项目特征标签（UI / Data / CLI / Lib / API — 由目录结构、依赖和配置推断）。
    5. 识别入口文件和核心模块。沿入口文件的 import 链建立模块依赖草图。

    **Output**: 内部摘要（不输出给用户），进入 step_1_analysis。
</step_0_recon>

<step_1_analysis>
    **Role**: 首席产品战略官 (CPO)
    **扫描策略**: 深度扫描 — 从入口文件出发，沿调用链读取所有业务文件。大型模块（>10 文件）优先读被多处 import 的文件。

    **Action**:
    1. 对每个识别出的功能模块：
       - 从入口文件出发，沿 import/调用链逐层读取，直到覆盖该模块的主要业务逻辑
       - 提取主要流程（用户操作 → 系统处理 → 结果）
       - 记录关联文件路径
    2. 对共享/基建代码（utils, middleware, config）：
       读取所有文件，按以下分档记录：
       - **中等档**（业务共享逻辑：auth/validation/error-handling/permission）：记录职责 + 导出函数签名 + 被谁依赖
       - **简要档**（纯工具函数：format/slugify/logger/helpers）：记录函数名 + 参数签名 + 一句话用途
       两者均写入 map.json publicAPI 字段，确保后续协议可发现可复用。
    3. 从代码中提取领域术语和命名约定。

    **Output**: 向用户输出结构化分析报告 — 含项目概况（名称/类型/规模）、技术栈表（语言/框架/构建/测试/部署）、架构模式及依据、功能模块清单（模块/源码位置/职责/关键流程）、共享基建（目录/职责/关键导出接口）、领域术语、AI 不确定项（如有）。

    **Gate**: 用户确认或修正。未确认禁进入 step_2。
</step_1_analysis>

<step_2_supplementary>
    **Trigger**: 仅当 step_1 有 AI 无法确定的项时执行。无歧义则跳过。

    **Action**: 以选择题形式询问歧义项。
    - 每题 3-5 选项 + `[Z] 自定义`，AI 推荐项标 `[推荐]`。
    - 总问题数控制在 3 个以内。

    常见歧义：
    - 架构模式无法确认
    - 某目录职责不明确
    - vision 信息（北极星指标、设计哲学）代码中无法推断

    **Output Format**:
    ```
    ### 补充确认

    **[Q1] 问题标题**
    > 为什么需要这个信息

    | ID | 选项 | 说明 |
    |:---|:---|:---|
    | A [推荐] | ... | ... |
    | B | ... | ... |
    | Z | 自定义 | (请描述) |

    ---
    **INPUT**: `Q1答案 | Q2答案 | ...`
    ```
</step_2_supplementary>

<step_3_constitution>
    **Role**: 首席架构师
    **Input**: Step 0 Brief 解析（如有）+ Step 1 分析报告 + Step 2 补充（如有）。
    **Action**: 一次性填充 init 部署的文档骨架。**有 Brief 时**：Brief 优先于代码（vision/roadmap/tech_stack）；代码仍用于 map、LEG-xx、目录结构。**无 Brief 时**：仅以代码为输入源（保持原逻辑）。

    ### 信息路由规则

    > 规则文件（`02_tech_stack`、`90_custom_rules` 等）已由 IDE 注入当前上下文，AI 已知其路径，直接写入即可。

    **有 Brief 时**（Brief → 目标文件）:
    | Brief 内容 | 目标文件 |
    |:---|:---|
    | 项目身份、目标用户、成功指标、参考灵感 | `[[__DOCS_DIR__]]/global/vision.md` |
    | 技术栈、部署目标、第三方库/服务 | 规则文件 `02_tech_stack` |
    | 核心任务列表 | `[[__DOCS_DIR__]]/global/roadmap.json`（phase-1/2，调用 archi-decompose-roadmap） |
    | 补充说明中的规则/约定/偏好 | 规则文件 `90_custom_rules` |
    | 风格调性（仅ui） | `design_tokens.json` aestheticDirection 等 |

    **代码中的信息**（始终适用）:
    | 信息来源 | 目标文件 |
    |:---|:---|
    | README 描述/特性 | vision.md |
    | 依赖/配置/代码模式 | 02_tech_stack |
    | 目录结构/模块依赖/用户旅程 | map.json |
    | 领域术语/命名约定 | dictionary.json |
    | eslint/prettier 等规范 | 90_custom_rules |
    | 代码中的错误码 | error_codes.json |
    | （仅ui项目）CSS 变量/主题 | design_tokens.json |
    | （仅data项目）Schema/Migration | data_snapshot.json |

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - **有 Brief**：从 Brief 填充（与 start 一致），代码/README 仅作补充
    - **无 Brief**：从 README + 项目配置推导，无法推导的项标注 `(AI 补全 — 建议用户审查)`
    - 禁保留模板占位符

    ### 3.2 Tech Stack (规则文件 `02_tech_stack`)
    - **有 Brief**：Brief 确定的 → 直接写入；留空/推荐的 → AI 推荐；代码依赖作补充
    - **无 Brief**：已有依赖/配置 → 直接写入；可见规范 → 写入 Coding Standards
    - 须填充完整 Section 1-8

    ### 3.3 Custom Rules (规则文件 `90_custom_rules`)
    - **有 Brief**：从补充说明 + 代码 eslint/prettier 合并
    - **无 Brief**：从 eslint/prettier/editorconfig 提取，从代码模式识别团队约定

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)

    **有 Brief 时**：[[SKILL: archi-decompose-roadmap|基于 Brief 任务列表生成 phase-1/2 任务链]]；代码功能模块 → phase-0 LEG-xx（status=done）。合并两者。
    **无 Brief 时**：仅代码功能模块 → phase-0 LEG-xx；phase-1/2 保留空骨架。

    **结构**:
    ```json
    {
      "version": 1,
      "projectStatus": "active",
      "lastUpdated": "<date>",
      "phases": [
        {
          "id": "phase-0",
          "name": "Legacy",
          "tasks": [
            {
              "id": "LEG-01",
              "title": "<模块名>",
              "status": "done",
              "goal": "<一句话摘要>。详见 tasks/LEG-01_<Slug>/spec.md",
              "deps": [],
              "tag": "Legacy",
              "slug": "<Slug>"
            }
          ]
        },
        { "id": "phase-1", "name": "Infrastructure", "tasks": [] },
        { "id": "phase-2", "name": "Core Features", "tasks": [] }
      ]
    }
    ```

    **规则**:
    - 功能模块 → `phase-0: Legacy`，status `done`，tag `Legacy`，ID 前缀 `LEG-`
    - 共享/基建代码不进 roadmap，仅进 map.json directoryMapping
    - LEG 间如有依赖关系须在 deps 中体现

    ### 3.5 Task Stub Specs

    为每个 LEG 任务创建 `[[__DOCS_DIR__]]/tasks/LEG-xx_<Slug>/spec.md`：

    ```markdown
    # LEG-xx: [Title]

    > **Spec-Status**: Stub
    > **Source**: 逆向分析自 [源码路径]

    ## 概述
    [一段话描述]

    ## 关键流程
    1. **[流程名]**: [A] → [B] → [C]

    ## 关联文件
    - [角色]: `[路径]`
    ```

    > Stub 是起点，非终态。后续通过 `/archi.edit` 触发补全（自动进入 `step_1_5_enrich` 流程）。

    ### 3.6 map.json 填充
    - `directoryMapping`: 每个核心目录 → `{ "path", "layer", "responsibility", "publicAPI" }`
    - `logicalTopology`: 模块间依赖 → `{ "from", "to", "type" }` (imports / calls / extends)
    - `criticalUserJourneys`: 核心流程 → `{ "name", "steps": ["module → module → ..."] }`
    - `featureRelations`: 扫描代码，识别「聚合型模块」并记录。
      **识别特征**: 某模块遍历/枚举/动态加载同类模块，或其描述为「汇总/列举/注册所有 X」。
      每条记录格式: `{ "aggregator", "sources", "evidence", "checkNote" }`

    ### 3.7 其他全局文档（按需）
    - `dictionary.json`: 从代码提取领域术语
    - （仅ui项目） `design_tokens.json`: 从 CSS 变量/主题提取
    - （仅data项目） `data_snapshot.json`: 从 schema/migration 提取
    - `error_codes.json`: 从代码中的错误定义提取

    仅ui项目: **UI 概念设计（Adopt 模式）**: [[SKILL: archi-ui-wireframe|调用 skill（adopt 模式），从代码逆向生成 UI 概念设计。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并遵循其 Adopt 协议执行）]]
    - 读取代码中的路由定义、页面组件、布局文件
    - 读取 step_3 写入的 design_tokens.json（含代码提取的 CSS 变量/theme）
    - tokens 不完整时触发 skill 内置引导流程
    - 写入 `ui_concept.html` + `ui_context.md`
    - 输出 UI 概念设计摘要，等待用户确认或反馈调整

    **Output**: 写入所有文件，运行 `npx archi render`。进入 step_4_verify。
</step_3_constitution>

<step_4_verify>
    **Role**: 独立审查官
    [[SUBAGENT: archi-silent-audit|mode: init, context: 审查 step_3 生成的全局文件（vision, tech_stack, roadmap, map, dictionary, stub specs 等）]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，按 mode: init 的审查维度表逐项检查）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_signoff>
    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。

    **Pre-signoff Checklist** (Gate 通过后、输出前须逐项确认):
    □ vision.md — 已填充（无 Brief 时: 推导内容标注了 `(AI 补全 — 建议用户审查)`）
    □ 02_tech_stack.md — Section 1-8 完整填充
    □ roadmap.json — 每个功能模块对应一条 LEG-xx（status: done, tag: Legacy）
    □ tasks/LEG-xx_<Slug>/spec.md — 每条 LEG 均有对应 Stub spec（含关联文件列表）
    □ map.json — directoryMapping + logicalTopology + criticalUserJourneys + featureRelations 均已填充
    □ dictionary.json + error_codes.json — 从代码提取完毕
    □ （仅ui项目）design_tokens.json + ui_concept.html + ui_context.md — Adopt 模式已执行
    □ Step 4 Silent Audit — 已执行，所有 CRITICAL 问题已修复

    **Action** (Checklist 全部确认后):
    1.  运行 `npx archi task` 输出任务概览。
    2.  输出总结。

    **Output**: 逆向分析摘要，含:
    - **项目概况**: 类型、规模、核心模块数
    - **Legacy 功能**: LEG-xx 列表（ID / 名称 / 源码位置）
    - **已生成文档**: 文件清单
    - **AI 补全项**: 标注置信度（高/中/低）
    - **Next Steps**:

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | 1 | 审查 vision.md | 确认 AI 补全的愿景描述是否准确 |
    | 2 | `/archi.edit LEG-xx` | 对核心模块补全完整 spec（自动触发 Enrich 流程） |
    | 3 | `/archi.scope [file_path]` | 规划新功能/大模块 |
    | 4 | `/archi.plan <任务ID>` | 对单个任务做深度规划 |
</step_5_signoff>

</protocol_inherit>

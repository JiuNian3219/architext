<protocol_inherit>
  **Trigger**: `/archi.inherit`
  **Phase**: Legacy Adoption
  **Goal**: 逆向分析已有代码仓库，生成 Architext 文档骨架，将项目纳入框架管理。

<meta>
    <style>Analytical, Systematic, Evidence-Based</style>
    <language>简体中文</language>
    <principles>
      1.  **Code-Driven**: 以代码为唯一真相源，禁凭空推测功能。
      2.  **AI-Native Perspective**: 分析从 AI Agent 视角撰写。关注：Context Locality、Type Safety、Module Boundaries。
      3.  **User Agency First**: AI 的分析须经用户确认。代码解读有歧义时询问用户，禁擅自决定。
      4.  **Minimal Token**: 优先读配置和入口文件，避免逐行扫描所有代码。
      5.  **Option Z Everywhere**: 补充提问须包含 `[Z] 自定义`。
    </principles>
</meta>

<step_0_recon>
    **Role**: 情报分析官
    **Action**:
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
    3. 扫描目录结构（顶层 + 核心源码目录两层深度）。
    4. 推断项目特征标签（UI / Data / CLI / Lib / API — 由目录结构、依赖和配置推断）。
    5. 识别入口文件和核心模块。

    **Output**: 内部摘要（不输出给用户），进入 step_1。
</step_0_recon>

<step_1_analysis>
    **Role**: 系统分析师
    **扫描策略**: 中度扫描 — 读每个模块的入口文件和核心业务文件，提取主要流程链路。禁逐文件遍历。

    **Action**:
    1. 对每个识别出的功能模块：
       - 读入口文件 + 1-2 个核心业务文件
       - 提取主要流程（用户操作 → 系统处理 → 结果）
       - 记录关联文件路径
    2. 对共享/基建代码（utils, middleware, config）：
       - 仅记录目录和职责，不作为功能模块
    3. 从代码中提取领域术语和命名约定。

    **Output**: 向用户输出结构化分析报告：
    ```
    ### 代码分析报告
    > **项目**: [名称] | **类型**: [UI/Data/CLI/Lib/API] | **规模**: ~[文件数] 文件, [目录数] 目录

    **技术栈**:
    | 类别 | 选型 |
    |:---|:---|
    | 语言 | ... |
    | 框架 | ... |
    | 构建 | ... |
    | 测试 | ... |
    | 部署 | ... |

    **架构模式**: [推断] — [依据]

    **功能模块清单**:
    | # | 模块 | 源码位置 | 职责 | 关键流程 |
    |:---|:---|:---|:---|:---|
    | 1 | [名称] | [路径] | [一句话] | [流程1], [流程2] |

    **共享基建**:
    | 目录 | 职责 |
    |:---|:---|
    | [路径] | [描述] |

    **领域术语**: [术语列表]

    **AI 不确定项** (如有):
    - [歧义项]
    ```

    **Gate**: 用户确认或修正。未确认禁进入 step_2。
</step_1_analysis>

<step_2_supplementary>
    **Role**: 产品顾问
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
    **Input**: Step 1 分析报告 + Step 2 补充（如有）。
    **Action**: 一次性生成项目文档骨架。

    ### 信息路由规则

    | 代码中的信息 | 目标文件 |
    |:---|:---|
    | README 项目描述、目标用户、特性列表 | `[[__DOCS_DIR__]]/global/vision.md` |
    | 依赖清单、配置文件、代码模式 | `02_tech_stack.md` |
    | 目录结构、模块依赖、用户旅程 | `[[__DOCS_DIR__]]/global/map.json` |
    | 领域术语、缩写、命名约定 | `[[__DOCS_DIR__]]/global/dictionary.json` |
    | eslint/prettier 等已有规范 | `90_custom_rules.md` |
    | 代码中的错误码定义 | `[[__DOCS_DIR__]]/global/error_codes.json` |
    | [?UI] CSS 变量/主题配置 | `[[__DOCS_DIR__]]/global/design_tokens.json` |
    | [?Data] Schema/Migration 文件 | `[[__DOCS_DIR__]]/global/data_snapshot.json` |

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - 从 README + 项目配置推导
    - 无法推导的项标注 `(AI 补全 — 建议用户审查)`
    - 禁保留模板占位符

    ### 3.2 Tech Stack (`02_tech_stack.md`)
    - 已有依赖/配置 → 直接写入
    - 代码中可见的规范（命名、结构） → 写入 Coding Standards
    - 须填充完整 Section 1-8

    ### 3.3 Custom Rules (`90_custom_rules.md`)
    - 从 eslint/prettier/editorconfig 等提取规则
    - 从代码模式中识别团队约定（如 named export 偏好、async/await 风格）

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)

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
              "goal": "<一句话摘要>。详见 features/LEG-01_<Slug>/spec.md",
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
    - phase-1/2 保留空骨架
    - LEG 间如有依赖关系须在 deps 中体现

    ### 3.5 Feature Stub Specs

    为每个 LEG 任务创建 `[[__DOCS_DIR__]]/features/LEG-xx_<Slug>/spec.md`：

    ```markdown
    # LEG-xx: [Title]

    > **Spec-Status**: Stub
    > **Source**: 逆向分析自 [源码路径]

    ## 概述
    [一段话描述]

    ## 关键流程
    1. **[流程名]**: [A] → [B] → [C]
    2. **[流程名]**: [A] → [B] → [C]

    ## 关联文件
    - [角色]: `[路径]`
    - [角色]: `[路径]`
    ```

    > Stub 是起点，非终态。后续通过 `/archi.adopt` 或 `/archi.edit` 触发补全。

    ### 3.6 map.json 填充
    - `directoryMapping`: 每个核心目录 → `{ "path", "layer", "responsibility", "publicAPI" }`
    - `logicalTopology`: 模块间依赖 → `{ "from", "to", "type" }` (imports / calls / extends)
    - `criticalUserJourneys`: 核心流程 → `{ "name", "steps": ["module → module → ..."] }`

    ### 3.7 其他全局文档（按需）
    - `dictionary.json`: 从代码提取领域术语
    - [?UI] `design_tokens.json`: 从 CSS 变量/主题提取
    - [?Data] `data_snapshot.json`: 从 schema/migration 提取
    - `error_codes.json`: 从代码中的错误定义提取

    **Output**: 写入所有文件，运行 `npx archi render`。
</step_3_constitution>

<step_4_audit>
    **Role**: 审计官
    **Checklist**:
    1.  **Vision 对齐**: vision.md 与代码实际功能一致？
    2.  **Tech Stack 一致**: 02_tech_stack.md 与 package.json/config 一致？
    3.  **Map 覆盖**: map.json 覆盖所有核心目录？
    4.  **Roadmap 完整**: phase-0 覆盖所有已识别功能模块？
    5.  **Stub 齐全**: 每个 LEG-xx 都有对应 features/ 目录和 spec.md？
    6.  **Dictionary 无冲突**: 术语无歧义或重复？

    如有问题则静默修正；严重问题标记 `Risk Warning`。
</step_4_audit>

<step_5_signoff>
    **Action**:
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
    | 2 | `/archi.adopt LEG-xx` | 对核心模块补全完整 spec |
    | 3 | `/archi.scope [file_path]` | 规划新功能/大模块 |
    | 4 | `/archi.plan <任务ID>` | 对单个任务做深度规划 |
</step_5_signoff>

</protocol_inherit>

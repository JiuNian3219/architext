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
    3.  **Read Tech Stack**: `02_tech_stack.md` (技术红线 + **Section 9 项目约定**)。
        - 提取 Section 9 中的全局架构约定（Error Handling / Data Flow / Auth & Access），供 step_2 约定继承使用。
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
    **项目约定**: [来自 02_tech_stack.md §9 — Error Handling: X | Data Flow: X | Auth: X，无则写"未设置"]
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

    [[SKILL: 按 `archi-plan-options` Skill 的三步选用逻辑（约定继承 → 标签路由 → 推荐 vs 展开），从五个维度的选项库中为本功能生成架构建议]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-plan-options/SKILL.md` 并遵循其三步选用逻辑执行）]]

    展开 Q-table 时，格式遵循 [[SKILL: `archi-interview-protocol` Skill 的标准输出格式]][[NO-SKILL: `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md`]]。

    #### Output Format

    ```
    ## Feature Proposal: [功能名称] ([ID])

    ### 功能设计
    [按复杂度级别输出，见上方 Part 1]

    ### 架构建议
    | 维度 | 推荐 | 来源 | 理由 |
    |:---|:---|:---|:---|
    | 核心结构 | [推荐选项] | 功能推荐 | [结合此功能的 1-2 句理由] |
    | 交互模式 | [推荐选项] | 功能推荐 | [理由] |
    | 错误处理 | [项目约定值] | 项目约定 | ref: 02_tech_stack.md §9 |
    | ... | ... | ... | ... |

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
    5.  **`map.json` featureRelations**: 判断本功能是否属于「聚合型功能」——即其核心职责是**列举、汇总或动态反映**其他一类功能（如「列出所有命令」「汇总所有页面入口」「注册所有路由」）。若是，在 `featureRelations` 中追加一条记录：
        ```json
        {
          "aggregator": "<本功能 ID 或文件路径>",
          "sources": "<一句话描述聚合来源范围，如'所有 CLI 命令类功能'>",
          "evidence": "<依据，如'spec.md §X 描述本功能会动态列出所有 Y 类功能'>",
          "checkNote": "此类功能新增或删除时，检查 <aggregator> 是否需要同步"
        }
        ```
        若非聚合型功能，跳过此步。

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
    - **`notes`**: 每个 task 的 `notes` 须填写：`[范围] · [spec 引用] · [关键约束] · 验证: [具体操作]`；供 `/archi.code` step_4 精确定位并执行 e2e，禁留空。
      > 示例：`实现 POST /auth/login · spec §3.1 · JWT 禁含 password · 验证: curl POST /auth/login 返回 200 + token 字段`
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

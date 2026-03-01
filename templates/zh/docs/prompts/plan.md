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
        - **Pre-flight**: 仅读取 `<ID>` 对应的任务条目及其直接 deps 的 `id/title/status`；检查 deps 是否已完成，未完成则拒绝 Plan（除非用户强制）。无需加载其他任务数据。
    2.  **Read Vision**: 读取 `[[__DOCS_DIR__]]/global/vision.md` — 仅提取北极星指标和设计哲学段落；其余章节跳过。
    3.  **Read Tech Stack**: `02_tech_stack.md` (技术红线 + **Section 9 项目约定**)。
        - 提取 Section 9 中的全局架构约定（Error Handling / Data Flow / Auth & Access），供 step_2 约定继承使用。
    4.  （仅ui项目） **Read Design Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`。
    4.5 （仅ui项目） **Read UI Context**: `[[__DOCS_DIR__]]/global/ui_context.md`（如存在）。
        - 从屏幕索引中定位本功能对应的屏幕 ID（如 S-03）及其负责的状态。
        - 锁定屏幕范围，供 step_4 生成 `ui.md §1` 时直接填入，禁自行发明新屏幕 ID。
        - 若 `ui_context.md` 不存在 → 跳过，`ui.md` 按完整 ITP 格式填写。
    5.  （仅data项目） **Read Data Model**: `[[__DOCS_DIR__]]/global/data_snapshot.json`。
    6.  **Read Dependency Context** (如有依赖任务):
        - 仅读依赖任务 `spec.md` 的 Interface/Type 定义段（`## Interface` 或 `## Types` 章节）；不读 Scenarios 等其余内容。
        - 仅当当前 spec/plan 出现 `ref: tasks/<dep_id>/spec.md#X` 引用时执行；无引用时跳过。
        - **Stub 兼容**: 如依赖任务的 Spec-Status 为 Stub，从 stub"关联文件"提取源码，读入口文件提取公共接口/导出类型，作为上游接口参考。
        - 避免重复定义上游接口，确保对接点精确对齐。

    **Output**: 向用户输出 **Task Context Brief**：
    ```
    ### Task Context: [功能名称] ([ID])

    **任务类型**: [从 ID 前缀推断: Infrastructure / Feature / Quality / Edit]
    **目标**: [roadmap task 的 goal，如含 [用户预设] 须高亮标注]
    **上游依赖**: [已完成的依赖任务及其关键接口/类型，无则写"无"]
    **项目特征**: [已激活的 UI/Data/CLI/Lib/API 标签]
    **技术约束**: [来自 02_tech_stack.md 的关键红线]
    **设计哲学**: [来自 vision.md 的北极星指标和设计原则]
    **项目约定**: [来自 02_tech_stack.md §9 — Error Handling: X | Data Flow: X | Auth: X，无则写"未设置"]
    ```
    内部保留完整上下文素材，进入 step_2。
</step_1_load>

<step_1_5_complexity>
    **Role**: 产品顾问
    **Action**: 检测任务类型，评估复杂度，决定流程路径。

    **⓪ Task Type 检测（最先执行）**：

    从 `<ID>` 前缀推断任务类型，贯穿后续所有 step：

    | ID 前缀 | Task Type | spec § 2 主维度 | spec § 4 Interface Exports |
    |:---|:---|:---|:---|
    | `INF-` | Infrastructure | Structural（配置契约） | **必填**（下游基础设施） |
    | `FEAT-` | Feature | Behavioral（行为场景） | 有下游 deps 时必填 |
    | `POLISH-` | Quality | Quantitative（量化目标） | 通常省略 |
    | `EDIT-` | Edit | 继承原任务类型 | 继承 |

    > 混合型任务（如 INF 任务含行为面）可在 § 2 中组合多个维度，用子标题区分。

    **① 粒度红线检查（按 Task Type 调整上限）**：

    | Task Type | Acceptance Criteria 条目上限 | plan.json Phase 上限 |
    |:---|:---|:---|
    | Feature | ≤ 6 个 Scenarios | ≤ 4 个 |
    | Infrastructure | ≤ 8 个 Contracts | ≤ 5 个 |
    | Quality | ≤ 4 个 Targets | ≤ 3 个 |

    > 预估方法：根据 step_1 加载的 roadmap task goal 和依赖上下文，快速列举核心路径数量。超出上限即触发，无需精确计算。

    **② 复杂度判定（粒度通过后执行）**：

    | 信号 | 判定 | 流程 |
    |:---|:---|:---|
    | 无依赖 + 无新实体 + 无架构决策 + 预估 ≤3 tasks | **Simple** | 跳过 step_2 访谈，直接生成 spec + plan |
    | 有依赖 或 有新实体 或 需架构决策 | **Standard** | 正常执行 step_2 Unified Proposal |

    **Simple 模式**:
    - 跳过 5 维度架构建议和 User Confirm Gate
    - spec 精简为 1-2 个 Acceptance Criteria 条目（按 Task Type 选格式）
    - plan 精简为单 Phase
    - signoff 时确认（替代 step_2 的 Gate）

    **③ Design 信号检测（Standard 判定后执行）**：

    Standard 任务中，检测是否需要生成 `design.md`（技术方案设计）：

    | 信号 | 判定 |
    |:---|:---|
    | 架构建议选型的 AI- 含复杂度警告（如"极难正确实现"、"状态管理复杂"、"连接泄漏"） | **Standard + Design** |
    | 涉及自定义状态机、非平凡算法、多组件协调协议、重试/恢复策略 | **Standard + Design** |
    | 标准 CRUD / 配置 / 简单集成 | **Standard**（无 design.md） |

    > Standard + Design 时，step_2 须输出机制预览（Part 1.5），step_4 须额外生成 `design.md`。
</step_1_5_complexity>

<step_2_interview>
    **Role**: 架构师

    ---

    ### Unified Proposal (一次性提案)

    **核心原则**: 将功能设计和架构决策**合并为一次输出**，用户一次确认或覆写即可。

    **Action**:

    #### Part 1: Task Design (功能设计)

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
    - 上游接口 → `ref: tasks/<dep_ID>/spec.md#接口名`
    - 已有设计 Token/组件 → `ref: design_tokens.json#preset` / `ref: dictionary.json#component`

    **通用要求**: 用此功能的具体实体名、操作名描述，禁泛化

    #### Part 2: Architecture Recommendations (架构建议)

    [[SKILL: archi-plan-options|按 skill 的三步选用逻辑（约定继承 → 标签路由 → 推荐 vs 展开），从五个维度的选项库中为本功能生成架构建议。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-plan-options/SKILL.md` 并遵循其三步选用逻辑执行）]]

    展开 Q-table 时，格式遵循 [[SKILL: archi-interview-protocol|skill 的标准输出格式]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` 并遵循其规则执行）]]。

    #### Part 1.5: Mechanism Preview (机制预览) 仅Complex任务:

    仅当 step_1_5 判定为 **Standard + Design** 时输出。列出需要技术方案设计的核心机制及拟用模式：

    ```
    ### 机制预览 (将生成 design.md)
    | 机制 | 模式 | 简述 |
    |:---|:---|:---|
    | [机制名称] | [State Machine / Pipeline / Decision Matrix / Protocol] | [一句话描述] |
    ```

    > 用户可在此增删机制或修改模式选择。

    #### Output Format

    ```
    ## Task Proposal: [功能名称] ([ID])

    ### 功能设计
    [按复杂度级别输出，见上方 Part 1]

    ### 架构建议
    | 维度 | 推荐 | 来源 | 理由 |
    |:---|:---|:---|:---|
    | 核心结构 | [推荐选项] | 功能推荐 | [结合此功能的 1-2 句理由] |
    | 交互模式 | [推荐选项] | 功能推荐 | [理由] |
    | 错误处理 | [项目约定值] | 项目约定 | ref: 02_tech_stack.md §9 |
    | ... | ... | ... | ... |

    [仅 Standard + Design]:
    ### 机制预览 (将生成 design.md)
    | 机制 | 模式 | 简述 |
    |:---|:---|:---|
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
    > - 机制修改: "去掉 Pipeline，重连不需要那么复杂"
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
    **Constraint**: 在生成 Task 文档**之前**，须先更新以下全局文件。

    **Boundary**: 仅注册**项目业务域**内容。Architext 框架概念（scripts、scaffold、roadmap、plan 等）和框架基础设施错误禁注册到全局文件。

    **Action Checklist**:
    1.  **`map.json`**: 在 `directoryMapping` 注册 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>`；在 `logicalTopology` 定义模块职责与依赖。
    2.  **数据治理同步** (`dictionary.json` / `error_codes.json` / `data_snapshot.json` 等): 按 `03_data_governance.md` 规则，将提案中涉及的新业务术语、错误码、Schema 增量同步至对应全局文件。
    3.  **`map.json` featureRelations**: [[SUBAGENT: archi-feature-relations|mode: register, context: 判断本 Task 是否为聚合型，若是则注册 featureRelations 条目]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`，按 mode: register 的逻辑执行）]]

    **Output**: 上述文件的变更 Diff (简要)。
</step_3_global_sync>

<step_4_generate>
    **Role**: 文档工程师
    **Input**: 确认的 Unified Proposal（功能设计 + 架构建议）+ 已更新的全局上下文 + step_1_5 检测的 Task Type。
    **Action**: 在 `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/` 下生成标准文档。

    **1. `spec.md`** (必须):
    - 模板: `templates/spec.template.md`。

    **spec § 2 按 Task Type 选择维度格式**：

    | Task Type | § 2 主维度 | 格式要求 |
    |:---|:---|:---|
    | Feature | Behavioral | Gherkin (Given/When/Then)，每个 Scenario 对应功能设计中的具体流程步骤或异常路径 |
    | Infrastructure | Structural | Configuration Contract，每个配置文件/服务一个 Contract（Path + Key Settings + Constraints + Verify）。Key Settings **须写出具体值**，禁泛化描述（如"配置 X"） |
    | Quality | Quantitative | Quality Target，每个优化目标含 Metric + Baseline + Target + Verify |
    | Edit | 继承原任务 | 同原任务类型 |

    > 混合型任务在 § 2 内用子标题区分维度（如 INF 任务含 Behavioral 子节描述热键行为）。

    **spec § 4 Interface Exports**：INF 任务**必填**（下游基础设施须声明导出约定），FEAT 任务有下游 deps 时必填。
    **spec § 5 Constraints**：**必填** — 从 vision.md + 02_tech_stack.md 提取与本任务相关的红线。

    **通用规则**:
    - 禁凭空编造 Acceptance Criteria 条目，须对应功能设计中的具体内容。
    - 若为上游任务，须在 § 4 包含明确的 Interface/Type 定义。

    **2. `ui.md`** （本任务涉及UI时）:
    - 模板 `templates/ui.template.md`。
    - **有 `ui_context.md`（主路径）**:
      1. **UI 偏差检查**（写 `ui.md` 前必须执行）：对比 step_2 确认的功能设计与 `ui_context.md` 中的屏幕索引，识别偏差。[[SKILL: archi-ui-wireframe|按 skill 的协议处理 UI 偏差]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并遵循其协议执行）]]。判定标准与处理方式：

         | 偏差类型 | 判定标准 | 处理方式 |
         |:---|:---|:---|
         | 无偏差 | 屏幕索引与设计一致 | 直接写 `ui.md`，引用屏幕 ID |
         | 轻微增量 | 新增状态/弹窗/局部区域，不改整体布局 | 调用 skill（Plan 细化模式）更新 `ui_concept.html` + `ui_context.md`，在 `ui.md` 注明 `MODIFIED: S-XX` |
         | 结构性偏差 | 布局重构、新增独立屏幕、流程路径变化 | **暂停**，向用户输出偏差说明，等待 **OK** 后调用 skill 更新 `ui_concept.html` + `ui_context.md`，再写 `ui.md` |

      2. 完成偏差处理后，按 `ui.template.md` 填写屏幕范围声明和差异组件。
    - **无 `ui_context.md`（降级路径）**: 按完整 ITP v3.0 描述组件树，引用 `design_tokens.json` Token 定义。

    **3. 仅Complex任务: `design.md`**:
    - 模板: `templates/design.template.md`。
    - 仅在 step_1_5 判定为 **Standard + Design** 时生成。
    - § 2 Core Mechanisms: 按 step_2 确认的机制预览，调用 [[SKILL: archi-design-patterns|skill 的模式选择指南和标准格式生成机制描述并执行自检]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-design-patterns/SKILL.md` 并遵循其模式格式和自检清单执行）]]。
    - § 3 Parameters: 所有机制中的数值须具体化，禁模糊描述。
    - § 4 Invariants: 每条须可测试，须对应 plan.json 的 test 条目。
    - § 5 Failure Modes: 每个故障须有检测方式 + 降级行为。
    - § 6 Trace Verification: 从 spec § 2 每条 AC 追踪设计路径，有 Gap 须回补。

    **4. `plan.json`** (必须):
    - 模板: `templates/plan.template.json`。
    - 根据项目类型动态调整 Phase；确保每个 Task 上下文自包含。
    - 任务描述中明确 "Additive Only" + "Respect Unknowns"。

    **WBS 分解三原则（生成 plan.json 时须遵循）**：

    **原则 1 — 交付物导向**: 每个 task 的 `title` 描述**产出物**而非活动。
    > ✅ 好: `apps/web/tsconfig.json — strict + path aliases`
    > ❌ 差: `配置 TypeScript`

    **原则 2 — 100% 覆盖**: 生成后须逐项确认覆盖度：
    | 检查项 | 规则 |
    |:---|:---|
    | spec § 2 每个 Acceptance Criteria 条目 | 须有 ≥1 个 task 覆盖 |
    | spec § 4 每个 Interface Export | 须有 task 负责创建/暴露该接口 |
    | spec § 5 每个 Constraint | 须有 task 的 notes 中引用该约束 |
    遗漏则补充 task 直到 100%。

    **原则 3 — 粒度与互斥**:
    | 信号 | 判定 |
    |:---|:---|
    | task 涉及 ≥3 个不相关文件 | 太粗 — 须拆分 |
    | task 的 title 无法对应到具体产出文件 | 太抽象 — 须具体化 |
    | 两个 task 修改同一文件同一区域 | 违反互斥 — 合并或重划边界 |
    | task 的 notes 只有一句话且无验证项 | 信息量不足 — 须补充 |

    **`decisions` 质量标准**:
    - `rationale` **须含实施指导**，不仅说明"为什么选"，须说明"选了怎么配"。
    > ✅ 好: `pnpm workspace 管理 apps/ + packages/；Turborepo pipeline: build→lint→type-check 三级缓存；root scripts 统一入口`
    > ❌ 差: `Brief 明确要求` ← 零实施指导

    **`notes` 质量标准**:
    - 格式: `[产出文件路径或操作对象] · [spec 引用] · [关键约束] · 验证: [可执行命令 + 期望结果]`
    - 供 `/archi.code` step_4 精确定位并执行 e2e，禁留空。
    > ✅ 好: `创建 apps/web/next.config.ts · spec §2.2 · transpilePackages: ['@repo/ui'], output: 'standalone' · 禁 CSS-in-JS · 验证: pnpm --filter web build 成功 (exit 0)`
    > ❌ 差: `配置 Next.js · spec §2.2` ← 无具体内容、无约束、无验证
    > ❌ 差: `创建文件 · spec §2.1 · 验证: 检查文件存在` ← "检查文件存在" 不可执行
    > **Red Flag**: notes 退化为 title 同义重复。每个 notes 须包含 title 中**不存在**的信息量。

    - 生成后运行 `npx archi render` 生成可读的 `.md` 视图。
</step_4_generate>

<step_5_verify>
    **Role**: 独立审查官
    [[SUBAGENT: archi-silent-audit|mode: plan-docs, context: 审查 step_4 生成的文档（spec.md, ui.md, plan.json, design.md）]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`，按 mode: plan-docs 的审查维度表逐项检查）]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_5_verify>

<step_6_signoff>
    **Terminal Gate** (禁止跳过，须在输出总结前全部完成):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    [[INCLUDE: shared/terminal-gate-base.md]]
    | `npx archi task <ID> --status active` | 任务已标记为进行中 |

    **Action** (Gate 通过后):
    1.  输出总结。

    **Output**: Task 定义摘要，含架构建议确认表（各维度最终选择及理由）和 Next Steps 表格。
</step_6_signoff>

</protocol_plan>

<protocol_scope>
  **Trigger**: `/archi.scope [file_path]`
  **Phase**: Requirement Decomposition
  **Goal**: 读取 Scope Brief，将大需求分解为多个 Roadmap 任务并建立依赖关系。

<meta>
    <style>Strategic, Analytical, Structured</style>
    <language>简体中文</language>
    <principles>
      1.  **Brief-Driven**: 以用户提供的 Scope Brief 为核心输入源，禁凭空脑暴功能。
      2.  **Incremental**: 在已有 Roadmap 上追加，禁重写已有任务。
      3.  **User Agency First**: Brief 中用户已填写的选择须直接采纳，禁质疑或替换。
      4.  **Minimal Questions**: 仅针对信息缺口提问，Brief 充分时可跳过提问直接分解。
      5.  **Option Z Everywhere**: 补充提问须包含 `[Z] 自定义`。
    </principles>
</meta>

<step_0_ingest>
    **Role**: 情报分析官
    **Action**:
    1. 解析触发命令中的 `[file_path]`：
       - 如提供了路径 → 读取该文件
       - 如未提供路径 → 依次查找 `scope-brief.md`（项目根）、`[[__DOCS_DIR__]]/scope-brief.md`
       - 如均不存在或为空 → 跳转 `<fallback_interview>`

    2. 解析 Brief 各 Section，提取：
       - 需求名称和描述
       - 功能清单
       - 已有设计决策
       - 边界与约束（不做的事、时间、依赖、技术限制）
       - 受影响的已有功能
       - 参考资料

    > Brief 是一次性输入文件，处理完成后用户可自行删除。

    **Output**: 内部摘要（不输出给用户），进入 `<step_1_load>`。
</step_0_ingest>

<step_1_load>
    **Role**: 系统分析师
    **Action**:
    1.  **Read Vision**: `[[__DOCS_DIR__]]/global/vision.md` — 北极星指标、项目边界。
    2.  **Read Roadmap**: `[[__DOCS_DIR__]]/global/roadmap.json` — 当前 phase 结构、已有 task（含 Legacy）、ID 编号水位。
    3.  **Read Tech Stack**: `02_tech_stack.md` — 技术约束。
    4.  **Read Map**: `[[__DOCS_DIR__]]/global/map.json` — 架构拓扑、目录映射。
    5.  **Scan Features**: 扫描 `[[__DOCS_DIR__]]/features/` 目录 — 了解已有 feature 概要（标题 + 关键流程，无需全文）。

    **Output**: 内部上下文摘要，进入 `<step_2_analysis>`。
</step_1_load>

<step_2_analysis>
    **Role**: 首席产品战略官 (CPO)
    **Input**: Step 0 Brief 解析结果 + Step 1 项目上下文。

    **Action**:

    1. **Vision 对齐检查**: Brief 需求是否与 vision.md 的北极星指标一致？如有偏离 → 在输出中标注 `[Vision 偏离警告]`。
    2. **功能清单完整性**: Brief 功能清单是否足以支撑需求目标？
    3. **影响评估**: Brief 中"受影响的已有功能" → 对照 roadmap/features 验证是否存在、状态如何。
    4. **缺口识别**: 检查 Brief 是否有关键信息缺失。
    5. **联动检查**: 读取 `map.json.featureRelations`，将新功能的描述与各条 `sources` 字段做语义对比，判断新功能是否属于某聚合方的覆盖范围。命中时在摘要中输出联动提示。

    **缺口分级**:
    - **必须**: 缺失则无法合理分解（如功能清单为空）
    - **可补**: AI 可推导但建议确认（如依赖关系不明确）
    - **建议**: AI 可自行决定（如功能分组方式）

    **Decision**:
    - 无"必须"级缺口 + 无"可补"级缺口 → 跳过 Step 2.5，直接进入 Step 3
    - 有缺口 → 进入 Step 2.5

    **Output**: 向用户输出 Brief 分析摘要：
    ```
    ### SCOPE BRIEF 分析报告
    > **需求**: [名称] | **规模**: 预估 [N] 个任务

    **Vision 对齐**: [一致 / ⚠️ 偏离 — 原因]

    **已确认信息**:
    - [列表]

    **受影响的已有功能**:
    | 功能 | 状态 | 预估影响 |
    |:---|:---|:---|
    | [ID: 名称] | [done/active/stub] | [需修改/需扩展/无影响] |

    **[?有命中] 联动提示**:
    | 聚合方 | checkNote |
    |:---|:---|
    | [aggregator ID/路径] | [checkNote 内容] |

    **信息缺口** (须补充):
    - [缺口列表]

    **AI 将自动决定** (无需操作):
    - [列表]
    ```
</step_2_analysis>

<step_2_5_supplementary>
    **Role**: 产品顾问
    **Trigger**: 仅当 Step 2 发现"必须"或"可补"级缺口时执行。

    **核心规则: 选择题优先**
    - 禁开放式提问。所有问题须以**选择题**形式呈现。
    - AI 基于项目上下文给出推荐默认选项（标 `[推荐]`），用户只需确认或换选。
    - 每题必含 `[Z] 自定义` 兜底选项。
    - 降低用户决策成本：用户不需要专业知识也能选出合理方案。

    **Action**:
    1. 仅针对缺口生成提问，禁提问 Brief 中已明确回答的内容。
    2. 每个问题提供 3-5 个选项 + `[Z] 自定义`，AI 推荐项标注 `[推荐]`。
    3. **选项说明须描述具体行为**：这个选项是什么、选了之后项目会怎样、适合什么情况。禁一词概括。
    4. **AI+/AI- 须为完整句子**：从 AI Agent 执行视角说明具体优势和风险原因。禁写"无"——每个方案必有取舍。
    5. 总问题数控制在 3 个以内（合并相关问题）。

    **Output Format**:
    ```
    ### 补充确认

    **[Q1] 问题标题**
    > 为什么需要这个信息（一句话）

    | ID | 选项 | 说明 | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A [推荐] | 选项名 | 是什么 + 选了会怎样 + 适合什么场景（2-3句） | 完整句子 | 完整句子 |
    | B | ... | ... | ... | ... |
    | C | ... | ... | ... | ... |
    | Z | 自定义 | (请描述) | - | - |

    ---
    **INPUT**: `Q1答案 | Q2答案 | ...`（题与题用 `|` 分隔；单题多选用空格）
    ```
</step_2_5_supplementary>

<step_3_decompose>
    **Role**: 首席架构师
    **Input**: Brief 全文 + 项目上下文 + 补充回答（如有）。

    **Action**: [[SKILL: 按 `archi-decompose-roadmap` Skill 的协议，基于 Scope Brief 功能清单生成增量任务数据]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` 并遵循其协议执行）]]

    **展示格式**（将 Skill 产出的任务数据转换为以下格式，向用户呈现后等待确认）：

    ```
    #### Phase 1: Infrastructure
    | ID | 标题 | 描述摘要 | 标签 |

    #### Phase 2: Core Features
    | ID | 标题 | 描述摘要 | 依赖 | 标签 |

    #### Execution Batches（并行执行批次）
    （从 deps 拓扑排序推导，列出每批可同时开工的任务）
    Batch 1（立即可开工）: ...
    Batch 2（等 Batch 1 全完）: ...

    #### NFR 横切关注点（已归并，不入 Roadmap）
    （来自 Skill 的 NFR 归并清单）
    - [NFR 名称] → 注入 [任务 ID] | 影响：[其他任务 ID]
    ```

    **Gate**: 用户回复 **OK** 后进入 step_4；未确认禁写入 Roadmap。用户可在确认前修正方案（合并/拆分/调整依赖）。
</step_3_decompose>

<step_3_5_refinement>
    **Role**: 咨询顾问
    **Trigger**: 用户回复非 OK，含合并/拆分/增删/依赖调整等修正。
    **Action**: 融入用户反馈，刷新分解方案重新输出，等待再次确认。
</step_3_5_refinement>

<step_4_roadmap_update>
    **Role**: 系统管理员
    **Input**: 用户确认的分解方案。

    **Action**:
    1.  将新任务追加到 `[[__DOCS_DIR__]]/global/roadmap.json` 对应 Phase 的 `tasks` 数组中。
    2.  如需新增 Phase → 追加到 `phases` 数组。
    3.  更新 `lastUpdated` 字段。
    4.  运行 `npx archi task --check` 验证一致性。
    5.  运行 `npx archi render` 生成可读视图。

    **Output**: 写入确认。
</step_4_roadmap_update>

<step_5_signoff>
    **Action**:
    1.  运行 `npx archi task` 输出任务进度概览。
    2.  输出总结。

    **Output**: 需求分解摘要，含：
    - **Brief 来源确认**: 需求名称和核心目标
    - **新增任务**: 数量和 Phase 分布
    - **对已有功能的影响**: 影响列表（如有）
    - **Next Steps**:

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | 1 | `/archi.plan <第一个 pending 任务 ID>` | 对首个可执行任务做深度规划 |
    | 2 | 审查 roadmap | 确认依赖关系和优先级 |
</step_5_signoff>

<fallback_interview>
    **Trigger**: Brief 文件不存在或为空。
    **Role**: 产品顾问

    **Action**:
    1. 告知用户 `scope-brief.md` 未找到。建议：
       - 运行 `npx archi template scope-brief` 获取模板到项目根目录
       - 填写后重新运行 `/archi.scope scope-brief.md`
       - 或继续对话，通过访谈方式提供信息
    2. 如用户选择继续对话，按以下顺序引导：
       a. 这次要做什么？（需求名称、一句话描述、动机）
       b. 包含哪些功能？（具体功能列表）
       c. 有什么约束？（不做的事、依赖、技术限制）
       d. 会影响哪些已有功能？
    3. 收集完毕后，将信息写入 `scope-brief.md`（项目根目录），然后跳转 `<step_1_load>`。

    > 此模式为向后兼容，核心流程仍以 Brief 为准。
</fallback_interview>

</protocol_scope>

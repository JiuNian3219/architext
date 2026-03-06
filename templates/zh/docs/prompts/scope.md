<protocol_scope>
  **Trigger**: `/archi.scope [file_path]` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Phase**: Requirement Decomposition
  **Goal**: 读取 Scope Brief，将大需求分解为多个 Roadmap 任务并建立依赖关系。

<meta>
    <style>Strategic, Analytical, Structured</style>
    <language>简体中文</language>
    <principles>
      1.  **Brief-Driven**: 以用户提供的 Scope Brief 为核心输入源，禁凭空脑暴任务。
      2.  **Incremental**: 在已有 Roadmap 上追加，禁重写已有任务。
      3.  **User Agency First**: Brief 中用户已填写的选择须直接采纳，禁质疑或替换。
      4.  **Minimal Questions**: 仅针对信息缺口提问，Brief 充分时可跳过提问直接分解。
      5.  **Option Z Everywhere**: 补充提问须包含 `[Z] 自定义`。
      6.  **IDE-Native First**: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准和检查点，不对抗 IDE 的规划/执行机制。
    </principles>
</meta>

<step_0_ingest>
    **Role**: 情报分析官
    **Action**:
    1. 解析触发命令中的 `[file_path]`：
       - 如提供了路径 → 读取该文件
       - 如未提供路径 → 依次查找 `scope-brief.md`（项目根）、`[[__DOCS_DIR__]]/scope-brief.md`
       - 如用户通过自然语言描述需求进入（无 file_path 参数）且上述文件均不存在 → 跳转 `<fallback_interview>`
       - 如均不存在或为空 → 跳转 `<fallback_interview>`

    2. 解析 Brief 各 Section，提取：需求名称和描述、任务清单、已有设计决策、边界与约束、受影响的已有任务、参考资料。

    > Brief 是一次性输入文件，处理完成后用户可自行删除。

    **Output**: 内部摘要（不输出给用户），进入 `<step_1_load>`。
</step_0_ingest>

<step_1_load>
    **Action**:
    1.  **Load**: vision.md（仅北极星+Boundaries）、roadmap.json（仅 id/title/status/deps/tag + 当前最大 ID 水位）、02_tech_stack.md、map.json（仅 directoryMapping + featureRelations）。
    2.  **Scan Tasks**: 扫描 tasks/ 目录 — 了解已有 Task 概要（标题+关键流程，无需全文）。

    **Output**: 内部上下文摘要，进入 `<step_2_analysis>`。
</step_1_load>

<step_2_analysis>
    **Role**: 首席产品战略官 (CPO)
    **Input**: Step 0 Brief 解析结果 + Step 1 项目上下文。

    **Action**:

    1. **Vision 对齐检查**: Brief 需求是否与 vision.md 北极星一致？偏离 → 标注 `[Vision 偏离警告]`。
    2. **任务清单完整性**: 是否足以支撑需求目标？
    3. **影响评估**: Brief 中"受影响的已有任务" → 对照 roadmap/tasks 验证。
    4. **缺口识别**: Brief 是否有关键信息缺失。
    5. **联动检查**: [[SUBAGENT: archi-feature-relations|mode: check, context: 将新任务描述与 featureRelations sources 做语义对比，命中时输出联动提示]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`，按 mode: check 的逻辑执行）]]

    **缺口分级**: 必须 → 无法分解 | 可补 → AI 可推导建议确认 | 建议 → AI 自决

    **Decision**: 无"必须"+"可补"缺口 → 跳 Step 3 | 有缺口 → 进入 Step 3

    **Output**: 向用户输出 SCOPE BRIEF 分析报告 — 含需求名/预估规模、Vision 对齐状态、已确认信息、受影响已有任务表（任务/状态/预估影响）、（有命中）联动提示表、信息缺口、AI 自动决定项。进入 step_3_supplementary（有缺口）或 step_4_decompose（无缺口）。
</step_2_analysis>

<step_3_supplementary>
    **Trigger**: 仅当 Step 2 发现"必须"或"可补"级缺口时执行。
    **Input**: Step 2 的缺口列表。问题数上限 3 题。

    [[SKILL: archi-interview-protocol|按 skill 的核心规则和标准输出格式提问。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` 并遵循其规则）]]
</step_3_supplementary>

<step_4_decompose>
    **Role**: 首席架构师
    **Input**: Brief 全文 + 项目上下文 + 补充回答（如有）。

    **Action**: [[SKILL: archi-decompose-roadmap|按 skill 的协议，基于 Scope Brief 任务清单生成增量任务数据。]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` 并遵循其协议执行）]]

    **展示格式**（将 Skill 产出转换为以下格式，向用户呈现后等待确认）：

    ```
    #### Phase 1: Infrastructure
    | ID | 标题 | 描述摘要 | 标签 |

    #### Phase 2: Core Features
    | ID | 标题 | 描述摘要 | 依赖 | 标签 |

    #### Execution Batches（并行执行批次）
    Batch 1（立即可开工）: ...
    Batch 2（等 Batch 1 全完）: ...

    #### NFR 横切关注点（已归并，不入 Roadmap）
    - [NFR 名称] → 注入 [任务 ID] | 影响：[其他任务 ID]
    ```

    **Gate**: 用户回复 **OK** 后进入 step_5_roadmap_update；未确认禁写入 Roadmap。
</step_4_decompose>

<step_4_5_refinement>
    **Trigger**: 用户回复非 OK，含合并/拆分/增删/依赖调整等修正。
    **Action**: 融入用户反馈，刷新分解方案重新输出，等待再次确认。

    用户回复 OK → 进入 step_5_roadmap_update。
</step_4_5_refinement>

<step_5_roadmap_update>
    **Input**: 用户确认的分解方案。

    **Action**:
    1.  将新任务追加到 roadmap.json 对应 Phase 的 `tasks` 数组中。
    2.  如需新增 Phase → 追加到 `phases` 数组。
    3.  更新 `lastUpdated`。
    4.  （新模块）更新 map.json `directoryMapping`：为新增任务预注册推断的模块路径。

    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。

    **Output**: 写入确认。进入 step_6_signoff。
</step_5_roadmap_update>

<step_6_signoff>
    **Pre-signoff Checklist** (输出前须逐项确认):
    □ 分解方案已获用户明确确认（回复 OK 后才写入 roadmap — step_4 Gate）
    □ roadmap.json — 任务已追加（非覆盖），lastUpdated 已更新
    □ （有新模块）map.json directoryMapping — 新任务模块路径已预注册
    □ step_5 Terminal Gate — task --check + render 已通过

    **Action** (Gate 须在 step_5 完成):
    1.  运行 `npx archi task` 输出任务进度概览。
    2.  输出总结。

    **Output**: 需求分解摘要，含：
    - **Brief 来源确认**: 需求名称和核心目标
    - **新增任务**: 数量和 Phase 分布
    - **对已有任务的影响**: 影响列表（如有）
    - **Next Steps**:

    | 优先级 | 动作 | 说明 |
    |:---|:---|:---|
    | （仅ui项目） 推荐 | [[SKILL: archi-ui-wireframe|运行 skill（追加模式）]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` 并遵循其协议执行）]] | 为新增任务追加屏幕到 `ui_concept.html` |
    | 1 | `/archi.plan <第一个 pending 任务 ID>` | 对首个可执行任务做深度规划 |
    | 2 | 审查 roadmap | 确认依赖关系和优先级 |
</step_6_signoff>

<fallback_interview>
    **Trigger**: Brief 文件不存在或为空，或用户以自然语言描述需求进入。

    **Action**:
    1. 告知用户将通过对话梳理需求。建议：
       - 运行 `npx archi template scope-brief` 获取模板到项目根目录
       - 填写后重新运行 `/archi.scope scope-brief.md`
       - 或继续对话，通过访谈方式提供信息
    2. 如用户选择继续对话，按以下维度引导（已知信息可跳过，每个维度 1-2 题）：
       a. **动机与目标**: 为什么要做这个？解决什么问题？期望达成什么效果？
       b. **范围**: 包含哪些功能/模块？不包含什么？
       c. **任务拆分**: 心中有没有大致的任务划分？（没有则 AI 在 step_3 代为拆分）
       d. **约束**: 技术限制、时间约束、依赖？
       e. **影响**: 会影响哪些已有功能？
    3. 收集完毕后，将信息写入 `scope-brief.md`（项目根目录），格式遵循 scope-brief 模板结构。
    4. 告知用户 brief 已生成，然后跳转 `<step_1_load>` 继续执行。
</fallback_interview>

</protocol_scope>

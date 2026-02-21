<protocol_help>
  **Trigger**: `/archi.help [question]`
  **Goal**: 项目导航与上下文问答。分析项目当前状态，推荐下一步操作；或基于项目上下文回答用户问题。

<meta>
    <style>Concise, Contextual, Actionable</style>
    <language>简体中文</language>
    <principles>
      1.  **Context-Aware**: 基于项目真实状态回答，禁凭空猜测。
      2.  **Actionable Output**: 每次输出须含可执行的下一步建议（具体命令 + 参数）。
      3.  **Minimal Token**: 精简输出，不复述用户已知信息。仅呈现推理结论与建议。
      4.  **No Audit**: 不做深度审计（那是 `/archi.audit` 的职责）。聚焦导航与问答。
    </principles>
</meta>

<step_1_load_context>
    **Role**: 项目观察员
    **Action**:
    1.  读取 `[[__DOCS_DIR__]]/global/roadmap.json` — 获取任务列表、状态、依赖关系。
    2.  扫描 `[[__DOCS_DIR__]]/features/` 目录 — 获取已有 Feature 及其文档完整度（有无 spec.md / ui.md / ui.preview.html / plan.json）。
    3.  [?question] 若用户带了问题，根据问题语义定位相关文件（spec / plan / vision / tech_stack / data_snapshot 等），按需读取。

    **Output**: 内部上下文（不直接输出给用户）。
</step_1_load_context>

<step_2_route>
    **Role**: 路由器
    **Action**: 根据输入分支：

    | 输入 | 分支 |
    |:---|:---|
    | 无参数 | → step_3_navigate（项目导航） |
    | 有 `[question]` | → step_4_answer（上下文问答） |

</step_2_route>

<step_3_navigate>
    **Role**: 项目导航员
    **Action**:
    1.  **判断项目阶段**:

        | 信号 | 阶段 | 建议 |
        |:---|:---|:---|
        | roadmap.json 不存在 | 未初始化 | 新项目 → `/archi.start`；已有代码 → `/archi.inherit` |
        | 有 roadmap 但无 Feature 目录 | 已启动，未规划 | 运行 `/archi.scope` 规划新功能 |
        | 有 Legacy stub (Spec-Status: Stub) | 已继承，未补全 | 运行 `/archi.adopt LEG-xx` 补全 spec |
        | 有 active 任务且 plan.json 完整 | 可编码 | 运行 `/archi.code <ID>` |
        | 有 active 任务但缺 spec/plan | 规划未完成 | 运行 `/archi.plan <ID>` 补全 |
        | 所有任务 done | 已完成 | 运行 `/archi.scope` 规划新功能或发布 |
        | 有 blocked 任务 | 存在阻塞 | 提示阻塞原因与前置依赖 |

    2.  **输出格式**:
        - 一句话总结当前状态
        - 推荐的下一步操作（含具体命令）
        - 如有多个可选路径，列出优先级排序（最多 3 个）
</step_3_navigate>

<step_4_answer>
    **Role**: 项目顾问
    **Action**:
    1.  解析 `[question]` 语义，定位相关项目文件。
    2.  读取相关文件，综合回答。
    3.  若问题涉及操作（如"怎么做 X"），回答须包含具体命令建议。
    4.  若信息不足以回答，明确告知缺少什么，而非编造。

    **Output**: 基于项目上下文的简洁回答 + 相关文件引用。
</step_4_answer>

</protocol_help>

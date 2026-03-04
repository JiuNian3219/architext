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
    **Action**:
    1.  **Load**: roadmap.json（仅 id/title/status/deps/tag，跳过 goal/notes）。
    2.  **Scan Tasks**: 扫描 tasks/ 目录 — 获取已有 Task 及其文档完整度（有无 spec.md / ui.md / plan.json）。
    3.  [?question] 若用户带了问题，根据语义定位相关文件按需读取。

    **Output**: 内部上下文（不输出给用户）。
</step_1_load_context>

<step_2_route>
    **Action**: 根据输入分支：

    | 输入 | 分支 |
    |:---|:---|
    | 无参数 | → step_3_navigate（项目导航） |
    | 有 `[question]` | → step_4_answer（上下文问答） |

</step_2_route>

<step_3_navigate>
    **Action**:
    1.  **判断项目阶段**:

        | 信号 | 阶段 | 建议 |
        |:---|:---|:---|
        | roadmap.json 不存在 | 未初始化 | 新项目 → `/archi.start`；已有代码 → `/archi.inherit` |
        | 有 roadmap 但无 Task 目录 | 已启动，未规划 | `/archi.scope` 规划新任务 |
        | 有 Legacy stub (Spec-Status: Stub) | 已继承，未补全 | `/archi.edit LEG-xx` 补全 spec |
        | 有 active 任务且 plan.json 完整 | 可编码 | `/archi.code <ID>` |
        | 有 active 任务但缺 spec/plan | 规划未完成 | `/archi.plan <ID>` 补全 |
        | 所有任务 done | 已完成 | `/archi.scope` 规划新任务或发布 |
        | 有 blocked 任务 | 存在阻塞 | 提示阻塞原因与前置依赖 |

    2.  **Output**: 一句话总结状态 + 推荐下一步（含命令）+ 可选路径（≤3 个，按优先级）。
</step_3_navigate>

<step_4_answer>
    **Action**:
    1.  解析 `[question]` 语义，定位相关项目文件并读取。
    2.  综合回答；涉及操作的问题须包含具体命令建议。
    3.  信息不足以回答时，明确告知缺少什么，禁编造。

    **Output**: 基于项目上下文的简洁回答 + 相关文件引用。
</step_4_answer>

</protocol_help>

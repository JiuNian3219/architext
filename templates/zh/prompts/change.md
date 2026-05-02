<protocol_change_router>
**Trigger**: /archi.change [id] [context] | Intent Card 指向 `/archi.change` 时加载
**Goal**: 根据 Intent Card、Context Pack 与用户原话分发到 fix / edit / revise 三个子协议之一。

<meta>
  <style>Intent-Reading, Honest-Routing, Decisive</style>
  <language>简体中文</language>
  <principles>
    1. **Intent Over Parameter**: 路由决策以"用户想做什么"为主，<ID> 等参数仅作次要佐证。
    2. **No Silent Branching**: 意图模糊时停下反问，禁静默路由。
    3. **No Sub-protocol Re-routing**: 子协议执行中如发现协议错配，停下提示用户重选；禁子协议自动切换。
    4. **Honest Refusal**: 三种意图都不匹配时（例如用户其实想新建任务/审查代码），明说原因并建议正确命令。
  </principles>
</meta>

<step_1_route>
优先读取 Intent Card + Context Pack：
- 若 `command` 不是 `/archi.change` → 停止，提示调用方按 Intent Card 加载正确协议。
- 若 Context Pack 缺失 → 回到 `00_system.md` Front Pipeline 补齐；若 `missing_or_stale` 非空，先处理缺口或向用户说明。
- 使用 Context Pack 中的 target / relevant_facts / risk_flags 作为路由依据，不要重新全量读取 Architext 文件。
- 若 `subprotocol` 为 `fix` / `edit` / `revise` 且 `confidence >= 0.75` 且无 `ambiguities` → 采用该路由，同时保留 `routing_reason` 作为依据。
- 若 Intent Card 缺失、低置信度或存在歧义 → 读取用户输入的整句话（不只 `<ID>`），按下表重新判定；仍不确定则进入反问 Gate。

读用户输入时判断真正想做什么。

**三种意图**：

| 用户在描述什么 | 子协议 | 动词 / 上下文信号 | 典型例子 |
|---|---|---|---|
| 修一个 bug / 行为异常 / 报错 / 崩溃 / 不符合预期 | **fix** | 修 / 报错 / 崩溃 / 异常 / 不对 / 有问题 / 跑不起来 | "登录跳转有问题"、"FEAT-A 报 NPE"、"列表不刷新" |
| 给某个任务补需求 / 改 spec / 调范围或边界 | **edit** | 加 / 补 / 改需求 / 调范围 / 改 spec / 边界 | "FEAT-A 加深色模式"、"改最大长度限制"、"补一个边界场景" |
| 改项目方向 / 技术栈 / 架构 / 全局规范 / 跨任务约束 | **revise** | 全局 / 架构 / 技术栈 / 跨任务 / 改用 X / 重构整体 | "全局换错误码格式"、"改用 React 19"、"统一目录结构规范" |

**判定优先级**（高 → 低）：

1. **显式动词信号 + 上下文清晰** → 直接路由
2. **<ID> + 自然语言描述**：以 ID 起头 + 描述 → 读描述判断（fix / edit 多见，revise 通常无 ID）
3. **范围信号**：单 task 范围 → 倾向 fix / edit；跨 task / 项目级 / 全局规范 → 倾向 revise
4. **上下文推断**：刚才在讨论某个 bug / spec / 架构变更 → 沿用同意图
5. 以上都未命中 → **反问 Gate**

**反问 Gate**：

- **多意图同时匹配**（如 "FEAT-A 加个 bug 修复" 同时含 fix + edit 信号）→ 问哪一个为主
- **描述太短**（如 "FEAT-A 改一下"）→ 反问“修 bug、改需求、还是调架构？”

**Honest Refusal**：

描述既不像 bug、也不像 spec 调整、也不像架构 / 全局变更：
- "创建新功能 / 新加任务 / 写新需求" → /archi.plan
- "拆分已有文件 / 代码太集中 / 重组模块" 且是在提出一项新的重构工作，而不是修改全局架构规则 → /archi.plan
- "实现已规划任务 / 开始编码" → /archi.code <ID>
- "审查 / 体检 / 检查代码 / map 同步" → /archi.review
</step_1_route>

<step_2_report>
显性输出路由决策：

路由决策：将走 [子协议] 子协议
意图依据：[从用户描述读出的意图关键词]
下一步动作摘要：[子协议 step_1 将做什么]

确认继续？OK / 调整 / 取消

**Gate**: 等待用户确认。OK → step_3；调整 → 回 step_1 重新判断；取消 → 终止。
</step_2_report>

<step_3_dispatch>
读取目标子协议文件，将 `<ID>` 与 [context] 注入子协议上下文，本路由器退出，子协议接管。

| 子协议 | 文件 |
|---|---|
| fix | `[[__DOCS_DIR__]]/prompts/change/fix.md` |
| edit | `[[__DOCS_DIR__]]/prompts/change/edit.md` |
| revise | `[[__DOCS_DIR__]]/prompts/change/revise.md` |
</step_3_dispatch>

</protocol_change_router>

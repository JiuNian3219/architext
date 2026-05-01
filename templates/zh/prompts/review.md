<protocol_review_router>
**Trigger**: /archi.review [id] [context] | /archi.review map（→ map 别名）| Intent Card 指向 `/archi.review` 时加载
**Goal**: 根据 Intent Card、Context Pack 与用户原话分发到 task / project / map 三个子协议之一。

<meta>
  <style>Intent-Reading, Honest-Routing, Decisive</style>
  <language>简体中文</language>
  <principles>
    1. Intent Over Parameter: 路由决策以"用户想做什么"为主，<ID> 等参数仅作次要佐证。
    2. Read-Only Default: task / project 严格 Read-Only（仅写报告文件）；仅 map 子协议会修改 map.json，且须 Gate 通过。
    3. No Silent Branching: 意图模糊时停下反问，禁静默路由。
    4. No Sub-protocol Re-routing: 子协议执行中如发现协议错配，停下提示用户重选；禁子协议自动切换。
    5. IDE-Native First: 利用 IDE 原生能力驱动执行节奏，本协议定义路由标准与检查点。
  </principles>
</meta>

<step_1_route>
优先读取 Intent Card + Context Pack：
- 若 `command` 不是 `/archi.review` → 停止，提示调用方按 Intent Card 加载正确协议。
- 若 Context Pack 缺失 → 回到 `00_system.md` Front Pipeline 补齐；若 `missing_or_stale` 非空，先处理缺口或向用户说明。
- 使用 Context Pack 中的 target / relevant_facts / risk_flags 作为审查范围依据，不要在 router 内全量扫描项目。
- 若 `subprotocol` 为 `task` / `project` / `map` 且 `confidence >= 0.75` 且无 `ambiguities` → 采用该路由，同时保留 `routing_reason` 作为依据。
- 若 Intent Card 缺失、低置信度或存在歧义 → 读取用户输入的整句话，按下表重新判定；仍不确定则进入反问 Gate。

读用户输入时判断真正想做什么。

**三种意图**：

| 用户在描述什么 | 子协议 | 性质 | 动词 / 上下文信号 | 典型例子 |
|---|---|---|---|---|
| 审查某个任务的代码实现 / 找 task 内的 bug 与质量问题 | **task** | Read-Only | 审查 / 走查 / 检查 / 看一下 / review + ID | "审查 FEAT-A"、"FEAT-A 的代码看一下"、"检查登录功能" |
| 项目整体体检 / 健康度 / 全面质检 / 漂移检测 | **project** | Read-Only | 整体 / 全面 / 体检 / 健康 / 项目级 / 扫一遍 | "全面体检"、"项目健康吗"、"扫一下整体" |
| 架构地图同步 / 目录变更刷新 / map 漂移修复 | **map** | Write（需 Gate） | map / 架构图 / 目录变了 / 重命名 / 同步下 | "刷新 map"、"目录变了同步下"、"重命名了 X 改下架构图" |

**判定优先级**（高 → 低）：

1. **/archi.review map 别名快路径** → 直接路由到 map 子协议，同时跳过 step_2 反问 Gate（已是显式选择）
2. **显式动词信号 + 上下文清晰** → 直接路由
3. **<ID> 存在 + 描述限定 task 范围** → 倾向 task
4. **无 ID + 描述项目级** → 倾向 project
5. **map / 架构图 / 目录变更关键词** → 倾向 map
6. **上下文推断**：刚才在讨论某个 task / 项目体检 → 沿用同意图
7. 以上都未命中 → **反问 Gate**

**反问 Gate**：

- **task vs project 歧义**（如 "审查一下" 无 ID 且描述模糊）→ 问"审查具体某个任务还是项目整体？"
- **task vs map 歧义**（如 "看一下结构"）→ 反问是审查 task / 项目体检 / 还是 map 同步
- **map 信号弱但描述像目录变更** → 提示用户明确，map 子协议会修改文件

**Honest Refusal**：

描述既不是审查、不是体检、不是 map 同步：
- "修 bug / 改 spec / 改架构" → /archi.change
- "实现新功能" → /archi.code <ID>
- "新加任务 / 写新需求" → /archi.plan
</step_1_route>

<step_2_report>
显性输出路由决策：

路由决策：将走 [子协议] 子协议
意图依据：[从用户描述读出的关键词]
下一步动作摘要：[子协议 step_1 将做什么]
读写性质：[Read-Only / Write 需 Gate]

确认继续？OK / 调整 / 取消

**Gate**: 等待用户确认。OK → step_3；调整 → 回 step_1 重新判断；取消 → 终止。
**别名快路径**: 用户用 /archi.review map 直接调用时跳过本 Gate（已是显式选择）。
</step_2_report>

<step_3_dispatch>
读取目标子协议文件，将 `<ID>` 与 [context] 注入子协议上下文，本路由器退出，子协议接管。

| 子协议 | 文件 |
|---|---|
| task | `[[__DOCS_DIR__]]/prompts/review/task.md` |
| project | `[[__DOCS_DIR__]]/prompts/review/project.md` |
| map | `[[__DOCS_DIR__]]/prompts/review/map.md` |
</step_3_dispatch>

</protocol_review_router>

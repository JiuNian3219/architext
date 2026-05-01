<protocol_plan_router>
**Trigger**: `/archi.plan [arg] [context]` | Intent Card 指向 `/archi.plan` 时加载
**Goal**: 根据 Intent Card、Context Pack、`[arg]` 形态与 roadmap 状态，分发到 `plan/decompose.md`（范围分解）或 `plan/detail.md`（任务细化）。

<meta>
  <style>Decisive, Minimal, Non-interactive</style>
  <language>简体中文</language>
  <principles>
    1. **Intent + Context First**: 优先消费 Intent Card 与 Context Pack；显式参数再用「参数形态 + roadmap 存在性」判定。
    2. **Explicit Routing**: 判断结果必须显性输出（用户可中断），禁静默跳转。
    3. **Single-Layer Dispatch**: 本文件不内嵌任何规划逻辑，子协议升级时本文件不受影响。
    4. **Self-Terminating**: 分发后本文件退出，不参与子协议执行。
  </principles>
</meta>

<step_1_scan>
**Action**: 优先读取 Intent Card + Context Pack：
- 若 `command` 不是 `/archi.plan` → 停止，提示调用方按 Intent Card 加载正确协议。
- 若 Context Pack 缺失 → 回到 `00_system.md` Front Pipeline 补齐；若 `missing_or_stale` 非空，先处理缺口或向用户说明。
- 使用 Context Pack 中的 roadmap/task/brief 事实作为路由依据，不要在 router 内重复读取大文件。
- 若 `subprotocol` 为 `decompose` / `detail` 且 `confidence >= 0.75` 且无 `ambiguities` → 采用该路由，并用 `[arg]` / `target.task_id` 补齐子协议参数。
- 若 Intent Card 缺失、低置信度或存在歧义 → 按优先级扫描以下信号，首条匹配即处理：

| # | 信号 | 判定 | 路由目标 |
|:---|:---|:---|:---|
| 1 | `[arg]` 匹配 `^[A-Z]+-\d+$` 且在 `roadmap.json` 中存在 | 合法任务 ID | `plan/detail.md`（`[arg]` 作为 ID，后续为 context） |
| 2 | `[arg]` 匹配 `^[A-Z]+-\d+$` 但 `roadmap.json` 中不存在 | ID 无效 | 停止，报错：任务 `<ID>` 不存在，请先 `/archi.plan <brief>` 追加 |
| 3 | `[arg]` 以 `.md` 结尾且为可读文件路径 | 显式指定 Brief | `plan/decompose.md`（`[arg]` 作为 file_path） |
| 4 | `[arg]` 为空 且 `scope-brief.md`（项目根或 `[[__DOCS_DIR__]]/`）存在 | 默认 Brief | `plan/decompose.md`（由 decompose 自行查找默认路径） |
| 5 | `[arg]` 为空 且默认 Brief 不存在 | 自然语言入口 | `plan/decompose.md`（fallback_interview 路径） |
| 6 | `[arg]` 是其他自然语言/非 ID 非路径 | 视作需求描述 | `plan/decompose.md`（`[arg]` 作为自然语言 context，走 fallback_interview） |
</step_1_scan>

<step_2_report>
**Trigger**: step_1 命中某条确定性路由
**Action**: 显性输出路由决策：

```
判断路由：**<decompose | detail>**
依据：<具体命中的信号，如 "`[arg]=FEAT-07` 匹配 ID 格式且在 roadmap.json 中存在">
子协议：`plan/<decompose|detail>.md`
```
</step_2_report>

<step_3_dispatch>
**Action**:
1. 读取 `[[__DOCS_DIR__]]/prompts/plan/<mode>.md` 内容
2. 从 `[arg] [context]` 提取子协议需要的参数（ID / file_path / 自然语言需求），注入上下文
3. 将子协议作为当前 active protocol，继续执行
4. 本文件退出，不再参与后续流程
</step_3_dispatch>
</protocol_plan_router>

<protocol_ref_router>
**Trigger**: `/archi.ref <sub> [args]` | Intent Card 指向 `/archi.ref` 时加载
**Goal**: 管理外部知识引用（第三方 API、公司内部 SDK、业务规则等），结构化存入 `refs/` 目录，供 `plan` / `code` 按需注入上下文。

<meta>
  <style>Analytical, Precise, Context-Aware</style>
  <language>简体中文</language>
  <principles>
    1. **Summarize, Not Copy**: 禁全量复制原文；提炼为 AI 可高效消费的结构化摘要（关键接口 / 约束 / 示例），压缩比 ≥ 50%。
    2. **Format-Aware**: 根据内容类型自动选择最合适的载体格式（.md / .json / .yaml），保留原始格式的语义优势。详见 [[INCLUDE: prompts/ref/shared/format-selection.md]]。
    3. **Tag-Driven**: 每个 ref 须携带 tags，供 plan / code 按需匹配注入；禁无 tag 引用。
    4. **Index-First**: 所有操作同步更新 `refs/index.json`；AI 通过索引按需加载，禁全量扫描 refs/ 目录。
  </principles>
</meta>

<step_1_route>
路由分两条路径。

**快路径**：用户显式提供 `/archi.ref <sub> [args]` → 严格按下表路由。

| `<sub>` | 子协议 | 作用 |
|:---|:---|:---|
| `add` | `ref/add.md` | 摘要并存储外部知识（核心） |
| `list` | `ref/list.md` | 列出所有已存引用 |
| `update <id>` | `ref/update.md` | 重新摘要指定引用 |
| `remove <id>` | `ref/remove.md` | 删除指定引用 |

**Intent Card 路径**：若由自然语言触发且 Intent Card 指向 `/archi.ref`：
- 先读取 Context Pack；缺失时回到 `00_system.md` Front Pipeline 补齐。
- 使用 Context Pack 中的 refs/index 命中结果与 risk_flags，不要全量扫描 `refs/`。
- `subprotocol` 为 `add` / `list` / `update` / `remove` 且 `confidence >= 0.75` 且无 `ambiguities` → 采用该路由。
- `update` / `remove` 必须保留 `requires_user_confirmation=true`，由子协议执行覆盖/删除确认 Gate。
- 低置信度或有歧义 → 进入意图路径重新判定，仍不确定则反问。

**意图路径**：用户以自然语言表达（或 `/archi.ref` 后不跟子命令）→ 按下表识别意图。

| 子命令 | 动词 / 上下文信号 | 输入伴随信号（高权重）|
|:---|:---|:---|
| `add` | 加 / 存 / 记录 / 收录 / 保存 | 输入含 URL / 文件路径 / 大段粘贴文本 |
| `list` | 列 / 看看有哪些 / 现有 / 查询 / 总览 | — |
| `update <id>` | 刷新 / 更新 / 重新摘要 | 后接已有 id |
| `remove <id>` | 删 / 移除 / 清理 / 去掉 | 后接已有 id |

**典型例子**：

| 用户表述 | 推断子命令 | 关键信号 |
|:---|:---|:---|
| 帮我把这个加进去 | `add` | "加进去" + 当前上下文含内容 |
| 把 https://stripe.com/docs/api 存一下 | `add` | URL 信号极强 |
| 这是我们内部 SDK 的文档，记一下 | `add` | "记一下" + 上下文含文档 |
| 现在有哪些 ref | `list` | 查询列表 |
| 把 stripe-payment 刷新一下 | `update stripe-payment` | "刷新" + 现有 id |
| 删了 twilio-sms | `remove twilio-sms` | "删" + 现有 id |

**判定优先级**（高 → 低）：
1. 显式 `/archi.ref <sub>` 快路径
2. 输入伴随 URL / 文件路径 / 大段粘贴 → 强并到 `add`
3. 动词信号匹配单一子命令 → 路由
4. 上下文推断（例如刚刚在讨论某个 API，随后说“帮我记下”）→ 路由
5. 以上都未命中 → **反问 Gate**

**反问 Gate**：
- 多个子命令同时匹配 → 问用户意图（例如“更新一下”但未提 id 且同时可能是新增 → 问“是新 add 还是 update 某个已有 ref？”）
- update / remove 匹配但 id 未提供 → 提示先跑 `list` 查看可选 id

**完全无法识别** → **Honest Refusal**：
> /archi.ref 未识别意图。可以这样说：
> - “帮我把 X 加进去” / 直接粘贴内容 → add
> - “看看有哪些 ref” → list
> - “刷新 / 删除 <id>” → update / remove
</step_1_route>

<step_2_handoff>
按 `<sub>` 完整执行对应子协议至结束；不允许在子协议执行过程中再次回到路由器（**No Re-routing**）。
</step_2_handoff>
</protocol_ref_router>

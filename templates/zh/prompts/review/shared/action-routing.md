# Action Routing

每个发现须附推荐修复命令。按问题类型对照下表生成：

| 问题类型 | 推荐命令 | 路由器分发到 |
|---|---|---|
| Bug / 行为异常 / 报错 / 崩溃 | `/archi.change <ID> <bug 描述>` | change/fix |
| Spec 缺漏 / Spec-Code 漂移 / 边界未覆盖 / Stub spec | `/archi.change <ID> <补充描述>` | change/edit |
| 架构级问题 / 跨任务一致性 / 全局技术栈违规 / Vision 漂移 | `/archi.change <全局描述>` | change/revise |
| 功能未完成 / Plan 真实性问题（done 但代码未落地） | `/archi.code <ID>` | — |
| 架构地图漂移 / 目录与 map 不一致 | `/archi.review map` | review/map |
| 缺少 spec.md（Missing） | `/archi.change <ID> <补全 spec 描述>` | change/edit |
| 小问题（命名、注释、可简化） | （无单独命令）下次 /archi.code 时一并处理 | — |

# 输出契约

- 推荐命令必须可直接复制粘贴执行（含 <ID> 实际值、含具体描述，不留 `<...>` 占位符）。
- 单一发现可推荐多条命令（如同一文件的 bug + spec 缺失），按主要修复路径排序，第一条为推荐路径。
- 命令字串使用 `/archi.change`，不要再推荐旧的 fix / edit / revise 入口；三类意图已合并到 change 路由器，由路由器按意图分发。

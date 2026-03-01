| 状态 | 处理 |
|:---|:---|
| `active` | 通过，继续 |
| `pending` | 拒绝 — 提示先运行 `/archi.plan <ID>` |
| `blocked` | 拒绝 — 前置依赖未完成 |
| `done` | 拒绝 — 已完成，如需修改用 `/archi.edit <ID>` |
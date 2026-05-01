# Issue Classification

| 级别 | 含义 | 示例 |
|---|---|---|
| **CRITICAL** | 须修复，阻塞发布 | 逻辑错误、安全漏洞、数据损坏风险、Vision 硬冲突、Missing spec |
| **WARNING** | 应修复，有风险 | 缺少错误处理、性能隐患、Spec 覆盖不全、Stub spec、长期 blocked |
| **INFO** | 建议优化 | 命名不规范、缺少注释、可简化的代码、minor 风格问题 |

# Issue Format

## 任务级（含具体行号）

```
[LEVEL] 文件路径:行号 — 维度名
  描述：具体问题（一句话陈述）
  证据：代码片段或具体引用（必要时多行）
  -> 推荐修复：/archi.change <ID> <描述>
```

## 项目级（无具体行号）

```
[LEVEL] <作用域，如 roadmap.json / 整体架构 / tasks/FEAT-A> — 检查项名
  描述：具体问题
  证据：扫描结果摘要
  -> 推荐修复：/archi.review map（或 /archi.change <描述>）
```

# 输出契约

- 同一发现不允许同时出现在 CRITICAL 与 WARNING（按最高级别归类）。
- INFO 级别允许批量合并（同类问题在同一文件中归并为一条），CRITICAL / WARNING 必须逐条独立列出。
- 不适用维度运行时若仍出现且无法判定，标 N/A。

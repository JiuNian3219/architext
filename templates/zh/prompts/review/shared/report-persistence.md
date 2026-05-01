# Report Persistence

## 写入路径

| 子协议 | 路径 | 写入策略 |
|---|---|---|
| task | `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/review.md` | 覆盖式（同一 Task 仅保留最新一次审查） |
| project | `[[__DOCS_DIR__]]/reviews/YYYY-MM-DD.md` | 按日期存档（同一天多次会覆盖当日，跨天累积） |

## 写入语义

- **任务级覆盖**：每次 /archi.review <ID> 重新审查时覆盖前次 review.md。前次内容若需保留，须用户在审查前手动备份（不属本协议职责）。
- **项目级按日存档**：同一天多次跑 /archi.review 会覆盖当日文件；跨天则新建文件。`reviews/` 目录长期累积可用于趋势分析。

## 写入前必检

1. 文件路径所在目录是否存在；不存在则创建。
2. 报告内容须**同时**输出到对话窗口（用户可见）和写入文件（持久化）—— 缺一则视为执行失败。

# 报告结构

按以下顺序组织（task / project 共用，不适用段落直接省略）：

1. **审查/体检概要**（一句话结论 + 严重发现数量统计：N CRITICAL / M WARNING / K INFO）
2. **发现列表**（按 issue-classification.md 格式；CRITICAL → WARNING → INFO 顺序）
3. **统计摘要**（按维度/检查项的发现计数表）
4. **修复工单汇总**（按 action-routing.md 生成的命令清单，可直接复制粘贴）
5. **Next Steps**（推荐的后续命令，含触发条件）

# Frontmatter 约定

报告文件须含 frontmatter：
```
---
type: review | project-review
target: <ID>_<Slug> | project
generatedAt: <ISO 8601 datetime>
findings:
  critical: N
  warning: M
  info: K
---
```

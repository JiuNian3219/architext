# Format Selection

## 格式选择规则

| 内容类型 | 推荐格式 | 理由 |
|:---|:---|:---|
| 网页 / URL / PDF / 纯文本 | `.md` | 结构化摘要，AI 读取效率最高 |
| OpenAPI / Swagger 规范 | `.yaml` | 保留机器可读结构，禁转为 .md |
| JSON Schema / 配置文件 | `.json` | 结构化数据原格式最优 |
| 混合（含大量代码示例） | `.md`（含代码块） | 代码块保留语法 + 加说明上下文 |
| 用户直接粘贴（纯 Markdown） | `.md` | 同格式存储，可精炼 |

## 选择优先级（自上而下匹配）

1. 内容已有强结构（OpenAPI / Swagger / JSON Schema） → **保留原格式**
2. 含 ≥ 3 个代码示例 → `.md` 含代码块
3. 自由文本 / 网页内容 → `.md` 摘要
4. 仍无法判断 → 回退 `.md` 摘要 + 在 frontmatter 标注 `formatHeuristic: fallback`

## 禁止项

- ✘ 把 OpenAPI / JSON Schema 强行转 `.md`（结构丢失，AI 无法机器消费）
- ✘ 把纯散文存为 `.json`（语义不匹配）
- ✘ 不带 frontmatter 的 `.md`（无法被 index 与 plan/code 注入逻辑检索）
---
name: archi-brief-scan
description: Parse project briefs and linked assets for /archi.init. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
allowed-tools: Read, Glob, WebFetch
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只返回协议要求的结构化产物，后续写入、确认和签收由调用协议负责。


## 设计约定

1. **无副作用**：不写文件、不执行命令
2. **解析 + 扫描 + 检查三合一**：Brief 定位 / 资产清点 / 外部引用可达性一次完成
3. **用户交互抽离**：unreachable 仅作输出字段返回主 agent，本 skill 不做 [A/B/C] Gate
4. **缺失即退出**：Brief 完全不存在时返回 `{ status: "no_brief" }`，由调用方决定后续

## 执行阶段

### step_a_locate 定位 Brief

1. 若调用方传入 `brief_path` → 使用该路径
2. 否则按顺序查找，取首个存在且非空的文件：
   - `project-brief.md`（项目根目录）
   - `[[__DOCS_DIR__]]/project-brief.md`
3. 若均不存在或所有候选均为空 → 返回 `{ status: "no_brief" }` 并退出

输出：`brief_file_path` 或 `no_brief` 状态。

### step_b_asset_scan 资产清点与可达性

前置：step_a 成功获取 `brief_file_path`。

**b.1 `brief-assets/` 目录扫描**：检查项目根是否存在 `brief-assets/`，存在则递归枚举所有文件，记录路径与类型（image / pdf / json / md / schema / txt / other）。可读文件读取内容；二进制仅记元信息（类型 + 大小）。

**b.2 Brief 全文外部引用扫描**：匹配 Markdown 链接 `[文本](URL)` / `![alt](URL)`、裸 URL `https?://...`、相对路径 `./...` / `../...`。对每个引用判定类型：

| 类型 | 判定 | 处理 |
|:---|:---|:---|
| `brief-assets/` 本地文件 | 路径以 `./brief-assets/` 或 `brief-assets/` 开头 | 用 b.1 结果匹配，标 `[可达-本地]` |
| 公开 HTTP(S) URL | 可访问（无认证） | 尝试读取，成功标 `[可达-远程]`，失败标 `[不可读]` |
| 需认证链接 | 返回 401/403 或 Notion/Google Drive 私有链接 | 标 `[不可读-需认证]` |
| 失效链接 | 404/超时 | 标 `[不可读-失效]` |
| 纯描述性引用 | 非真实 URL（如"参考 iOS HIG 规范"） | 标 `[描述性-无需访问]` |

**b.3 资产语义标签提取**：Brief 中以 `- [语义标签] 路径` 格式（或变体 `路径 — 语义标签`）引用的资源，记录映射关系：

| 语义标签 | 路由影响 |
|:---|:---|
| `[竞品参考]` / `[视觉参考]` | design_tokens / vision.md Visual Reference |
| `[品牌指南]` | design_tokens primitivePalette |
| `[数据库 Schema]` / `[Schema]` | data_snapshot.json |
| `[API 文档]` / `[OpenAPI]` | api_snapshot.json + vision.md Context |
| `[已有代码]` | 提示调用方本场景更适合 inherit |
| `[品牌 Logo]` / `[素材]` | 仅记录引用关系，不影响宪法文件 |
| 其他自定义标签 | 原样保留，调用方自行解释 |

输出：`asset_inventory`，含 `local_assets` / `external_refs`（含可达性状态）/ `tagged_assets`（语义标签 → 资源路径）/ `unreachable`（不可访问资源列表）。

### step_c_brief_parse 解析 Brief 字段

解析 Brief 各 Section，提取以下字段（缺失字段返回 null，禁伪造数据）：

- `identity`: { projectName, oneLiner, problemStatement }
- `targetUsers`: [{ role, description }]
- `featureTags`: [ui / data / cli / lib / api / mobile / desktop / miniapp / extension / realtime / ai]
- `coreTasks`: [{ title, description, dependencies? }]
- `businessFlow`: 业务流程描述（原文保留）
- `predefinedDecisions`: 用户已做的设计决策
- `techStack`: { language, runtime, framework, database, deployment, ... }（区分 filled / empty / recommended）
- `dataModel`: 数据模型草案（如有）
- `existingAPI`: 已有 API 端点（如有）
- `existingResources`: 设计稿/品牌/已有服务等
- `boundaries`: 反目标与硬性约束
- `styleTone`: 风格调性（仅 ui/cli/api 相关字段）
- `successMetrics`: 成功指标
- `references`: 参考项目
- `supplementaryNotes`: 补充说明原文（保留供后续路由到 90_custom_rules）

输出：`brief_data` 结构化对象。

### step_e_return 返回结果

```
{
  status:          "ok" | "no_brief",
  brief_file_path: string | null,
  brief_data:      <step_c 结果> | null,
  asset_inventory: <step_b 结果> | null
}
```
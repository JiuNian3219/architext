<shared_brief_ingest>
**Contract**:
- **Input**: 调用方提供 `brief_path`（可选，为空时按默认路径查找）
- **Output**: 结构化 Brief 数据对象 + 资源清单，注入调用方上下文
- **Failure Mode**: Brief 完全不存在时返回 `{ status: "no_brief" }`，由调用方决定后续

<step_a_locate>
**Action**:
1. 若调用方传入 `brief_path` → 使用该路径
2. 否则按以下顺序查找，取首个存在且非空的文件：
   - `project-brief.md`（项目根目录）
   - `[[__DOCS_DIR__]]/project-brief.md`
3. 若均不存在或所有候选均为空 → 返回 `{ status: "no_brief" }` 并退出本片段

**Output**: `brief_file_path` 或 `no_brief` 状态
</step_a_locate>

<step_b_asset_scan>
**前置**: step_a 成功获取 `brief_file_path`
**Action**:

**b.1 `brief-assets/` 目录扫描**
- 检查项目根目录是否存在 `brief-assets/` 文件夹
- 若存在，枚举其中所有文件（递归），记录路径与文件类型（image / pdf / json / md / schema / txt / other）
- 读取可读文件的内容；二进制文件仅记录元信息（类型 + 大小）

**b.2 Brief 全文外部引用扫描**
- 读取 Brief 全文，用以下模式匹配所有外部引用：
  - Markdown 链接：`[文本](URL)` 与 `![alt](URL)`
  - 裸 URL：`https?://...`
  - 相对路径引用：`./...` `../...` 特别是 `./brief-assets/...`
- 对每个引用，判定类型：

| 类型 | 判定 | 处理 |
|:---|:---|:---|
| `brief-assets/` 本地文件 | 路径以 `./brief-assets/` 或 `brief-assets/` 开头 | 用 b.1 结果匹配，标记为 `[可达-本地]` |
| 公开 HTTP(S) URL | 可访问（无认证） | 尝试读取，成功标 `[可达-远程]`，失败标 `[不可读]` |
| 需认证链接 | 返回 401/403 或 Notion/Google Drive 私有链接 | 标 `[不可读-需认证]` |
| 失效链接 | 404/超时 | 标 `[不可读-失效]` |
| 纯描述性引用 | 非真实 URL（如"参考 iOS HIG 规范"） | 标 `[描述性-无需访问]` |

**b.3 资产语义标签提取**
- Brief 中以 `- [语义标签] 路径` 格式（或变体 `路径 — 语义标签`）引用的资源，记录映射关系：

| 语义标签 | 路由影响（提示调用方） |
|:---|:---|
[[WHEN: ui | | `[竞品参考]` / `[视觉参考]` | 影响 design_tokens / vision.md Visual Reference | ]]
[[WHEN: ui | | `[品牌指南]` | 影响 design_tokens primitivePalette | ]]
[[WHEN: data | | `[数据库 Schema]` / `[Schema]` | 影响 data_snapshot.json | ]]
[[WHEN: api | | `[API 文档]` / `[OpenAPI]` | 影响 api_snapshot.json + vision.md Context | ]]
| `[已有代码]` | 提示调用方本场景更适合 inherit |
| `[品牌 Logo]` / `[素材]` | 仅记录引用关系，不影响宪法文件 |
| 其他自定义标签 | 原样保留，调用方自行解释 |

**Output**: `asset_inventory` 对象，含：
- `local_assets`: brief-assets/ 下的文件清单
- `external_refs`: 外部引用清单（含可达性状态）
- `tagged_assets`: 语义标签 → 资源路径映射
- `unreachable`: 不可访问资源列表（供调用方决定是否中断）
</step_b_asset_scan>

<step_c_brief_parse>
**Action**: 解析 Brief 各 Section，提取以下字段（缺失字段返回 null，不伪造数据）：

- `identity`: { projectName, oneLiner, problemStatement }
- `targetUsers`: [{ role, description }]
- `featureTags`: [ui / data / cli / lib / api / mobile / desktop / miniapp / extension / realtime / ai]（从 Brief 勾选或推断）
- `coreTasks`: [{ title, description, dependencies? }]
- `businessFlow`: 业务流程描述（原文保留）
- `predefinedDecisions`: 用户已做的设计决策
- `techStack`: { language, runtime, framework, database, deployment, ... }（区分 "filled" / "empty" / "recommended"）
- `dataModel`: 数据模型草案（如有）
- `existingAPI`: 已有 API 端点（如有）
- `existingResources`: 设计稿/品牌/已有服务等
- `boundaries`: 反目标与硬性约束
- `styleTone`: 风格调性（仅 ui/cli/api 相关字段）
- `successMetrics`: 成功指标
- `references`: 参考项目
- `supplementaryNotes`: 补充说明原文（保留供后续路由到 90_custom_rules）

**Output**: `brief_data` 结构化对象
</step_c_brief_parse>

<step_d_reachability_gate>
**Trigger**: 仅当 step_b 的 `unreachable` 非空
**Action**: 立即输出资源可达性报告，暂停执行：

```
### 📎 资源可达性报告

Brief 中引用了以下资源，但无法访问：

| # | 引用 | 状态 | 在 Brief 中的位置 |
|:---|:---|:---|:---|
| 1 | https://figma.com/... | [不可读-需认证] | "已有资源 → 设计稿" |
| 2 | ./designs/hero.png | [不可读-失效] | "视觉参考" |

**请选择**:
- `[A] 跳过这些资源，继续初始化`
- `[B] 提供可访问的替代链接/文件`
- `[C] 中止，补全资源后重试`
```

用户选择前禁止继续。
</step_d_reachability_gate>

<step_e_return>
**Output**: 返回调用方：
{
  status: "ok" | "no_brief",
  brief_file_path,
  brief_data,         // step_c 结果
  asset_inventory,    // step_b 结果
}

> 调用方负责根据 `tagged_assets` 决定如何路由到具体宪法文件（见 init/shared/constitution-files.md 的数据源矩阵）。
</step_e_return>
</shared_brief_ingest>

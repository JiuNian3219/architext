<protocol_ref_add>
**Trigger**: `/archi.ref add [input]`
**Goal**: 解析输入 → 分析关键信息 →（必要时反问）→ 按 Format-Aware 规则存储 → 更新索引。

<step_0_ingest>
解析 `[input]`，确定输入来源：

| input 形式 | 处理 | sourceType |
|:---|:---|:---|
| 本地文件路径（如 ./docs/api.yaml） | 读取文件内容 | `local-file` |
| URL（如 https://...） | 抓取页面内容 | `url` |
| 未提供（对话模式） | 告知用户粘贴内容或提供路径/URL，等待输入 | `manual` |

读取 `[[__DOCS_DIR__]]/refs/index.json`：
- 存在 → 加载现有 id 列表（防重复命名）
- 不存在 → 初始化为 `{ "refs": [] }`
</step_0_ingest>

<step_1_analyze>
1. **内容类型识别**：判断原始内容属于哪种类型，确定推荐存储格式（参照 [[INCLUDE: prompts/ref/shared/format-selection.md]]）。
2. **关键信息提取**：核心接口 / 端点 / 签名 + 参数与类型 + 重要约束 / 限制 + 认证方式（如有）+ 典型示例（≤ 3 个）。
3. **信息缺口识别**：
   - id 命名（推断候选值，禁与现有 id 重复）
   - tags 分类（标准 tag：api / sdk / internal / payment / auth / map / notification / storage / 自定义）
   - 关注侧重点（仅当内容庞大、需聚焦特定接口时）
</step_1_analyze>

<step_2_interview>
**Gate**：仅当 id / tags / 侧重点任一不确定时执行；否则跳过，直接进入 step_3。

向用户提问，问题上限 3 题，选项优先：
- Q1 引用 ID（AI 推断候选 + "自定义" 选项）
- Q2 分类 Tags（多选）
- Q3 关注侧重（仅内容庞大时）

输出引用信息确认卡：内容类型与存储格式 / 内容摘要预览 / Q1 / Q2 /（Q3）。

等待用户回复后进入 step_3_store。
</step_2_interview>

<step_3_store>
1. 确定参数：
   - `id`：用户确认或 AI 推断
   - `format`：由 format-selection 决定
   - `filename`：`{id}.{format}`
   - `tags`：用户选定列表

2. 生成引用文件内容（按 format 分支）：
   - **`.md`**：frontmatter（id / title / tags / sourceType / source / created / updated）+ 4 个 section（核心信息 / 关键接口表 / 重要约束 / 示例 ≤ 3 个）
   - **`.yaml`**：直接存储精简后的 OpenAPI/Swagger（移除冗余 example，保留 schema）
   - **`.json`**：直接存储原始结构（移除注释，保留结构）

3. 写入文件：`[[__DOCS_DIR__]]/refs/{id}.{ext}`

4. 追加索引条目到 `[[__DOCS_DIR__]]/refs/index.json` 的 `refs` 数组：
   - id / title / tags / format / file / sourceType / source / updatedAt

输出：
```
ADDED      [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED   [[__DOCS_DIR__]]/refs/index.json
```
</step_3_store>

<step_4_signoff>
输出添加摘要：
- 引用 ID
- 存储格式 + 选择理由（一句话）
- Tags
- 文件路径
- 使用说明：plan 时按 tag 匹配自动注入 / code 时可手动 INCLUDE / 直接路径引用

**Pre-signoff Checklist**：
1. `refs/{id}.{ext}` 已写入
2. `refs/index.json` 已更新（含本次新增条目）
3. 摘要压缩比 ≥ 50%（对照原文长度自检）
</step_4_signoff>
</protocol_ref_add>
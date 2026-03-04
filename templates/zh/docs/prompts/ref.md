<protocol_ref>
**Trigger**: `/archi.ref <sub> [args]`
**Goal**: 管理外部知识引用（第三方 API、公司内部 SDK、业务规则等），结构化存入 `refs/`，供 `plan`/`code` 按需注入上下文。

**子命令**:
| 子命令 | 格式 | 作用 |
|:---|:---|:---|
| `add` | `/archi.ref add [input]` | 摘要并存储外部知识（核心） |
| `list` | `/archi.ref list` | 列出所有已存引用 |
| `update` | `/archi.ref update <id>` | 重新摘要指定引用 |
| `remove` | `/archi.ref remove <id>` | 删除指定引用 |

<meta>
  <style>Analytical, Precise, Context-Aware</style>
  <language>简体中文</language>
  <principles>
    1. **Summarize, Not Copy**: 禁全量复制原文；须提炼为 AI 可高效使用的结构化摘要（关键接口 / 约束 / 示例），压缩比不低于 50%。
    2. **Format-Aware**: 根据内容类型自动选择最合适的载体格式（`.md` / `.json` / `.yaml`），保留原始格式的语义优势。
    3. **Tag-Driven**: 每个 ref 须携带 tags，供 `plan`/`code` 按需匹配注入，禁无 tag 引用。
    4. **Index-First**: 所有操作须同步更新 `refs/index.json`，AI 通过索引按需加载，禁全量扫描。
  </principles>
</meta>

<!-- ─── 载体格式选择规则 ─── -->
<format_selection>
  **Format-Aware 规则**（step_3_store 执行时参照）：

  | 内容类型 | 推荐格式 | 理由 |
  |:---|:---|:---|
  | 网页 / URL / PDF / 纯文本 | `.md` | 结构化摘要，AI 读取效率最高 |
  | OpenAPI / Swagger 规范 | `.yaml` | 保留机器可读结构，禁转为 .md |
  | JSON Schema / 配置文件 | `.json` | 结构化数据原格式最优 |
  | 混合（含大量代码示例）| `.md`（含代码块）| 代码块保留语法，加说明上下文 |
  | 用户直接粘贴（纯 Markdown） | `.md` | 同格式存储，可精炼 |
</format_selection>

<!-- ═══════════════════════════════════════════════ -->
<!--                   ADD 子命令                   -->
<!-- ═══════════════════════════════════════════════ -->

<sub_add>

<step_0_ingest>
  **Role**: 情报分析官
  **Trigger**: `/archi.ref add [input]`
  **Action**: 解析 `[input]`，确定输入来源。

  | input 形式 | 处理 |
  |:---|:---|
  | 本地文件路径（如 `./docs/api.yaml`） | 读取文件内容，记录 `sourceType: local-file` |
  | URL（如 `https://...`） | 抓取页面内容，记录 `sourceType: url` |
  | 未提供（对话模式）| 告知用户粘贴内容或提供路径/URL，等待输入，记录 `sourceType: manual` |

  检查 `[[__DOCS_DIR__]]/refs/index.json` 是否存在：
  - 存在 → 读取，获取现有 id 列表（防重复命名）
  - 不存在 → 初始化为 `{ "refs": [] }`

  **Output**: 内部（原始内容 + sourceType + 现有 id 列表），进入 `<step_1_analyze>`。
</step_0_ingest>

<step_1_analyze>
  **Action**:
  1. **内容类型识别**: 判断原始内容属于哪种类型（参照 `<format_selection>`），确定推荐存储格式。
  2. **关键信息提取**: 核心接口/端点/签名、参数与类型、重要约束/限制、认证方式（如有）、典型示例（≤3 个）。
  3. **信息缺口识别**: id 命名（推断候选值）、tags 分类（从标准 tag 推断：`api`/`sdk`/`internal`/`payment`/`auth`/`map`/`notification`/`storage`/自定义）、关注侧重点（内容庞大时确认用户最关心的接口）。

  **Output**: 内部分析摘要，进入 `<step_2_interview>`（有缺口时）或直接 `<step_3_store>`（信息完整时）。
</step_1_analyze>

<step_2_interview>
  **Trigger**: 仅当 id / tags / 侧重点任一不确定时执行。
  **Action**: 向用户提问，问题上限 3 题，选项优先。

  **Output**: 引用信息确认 — 含内容类型与存储格式、内容摘要、Q1 引用 ID（AI 推断候选 + 自定义）、Q2 分类 Tags（多选）、（内容庞大时）Q3 关注侧重。

  **Gate**: 等待用户回复后进入 `<step_3_store>`。
</step_2_interview>

<step_3_store>
  **Action**:
  1. 确定存储参数：`id`（用户确认或 AI 推断）、`format`（由 format_selection 决定）、`filename: {id}.{format}`、`tags`。

  2. **生成引用文件内容**（按格式）:
     - **`.md`**: frontmatter（id/title/tags/sourceType/source/created/updated）+ 4 个 section（核心信息、关键接口表、重要约束、示例≤3个）
     - **`.yaml`**: 直接存储精简后的 OpenAPI/Swagger（移除冗余 example 字段，保留 schema）
     - **`.json`**: 直接存储原始结构（移除注释，保留结构）

  3. **写入文件**: `[[__DOCS_DIR__]]/refs/{id}.{ext}`

  4. **更新索引**: 向 `[[__DOCS_DIR__]]/refs/index.json` 的 `refs` 数组追加条目（id/title/tags/format/file/sourceType/updatedAt）。

  **Output**:
  ```
  ADDED  [[__DOCS_DIR__]]/refs/{id}.{ext}
  MODIFIED  [[__DOCS_DIR__]]/refs/index.json
  ```
</step_3_store>

<step_4_signoff_add>
  **Output**: 添加摘要，含引用 ID、存储格式及理由、Tags、文件路径、使用说明（plan 时自动读取 / code 时补充上下文 / 手动引用）。
</step_4_signoff_add>

</sub_add>

<!-- ═══════════════════════════════════════════════ -->
<!--                  LIST 子命令                   -->
<!-- ═══════════════════════════════════════════════ -->

<sub_list>

**Trigger**: `/archi.ref list`
**Action**: 读取 `[[__DOCS_DIR__]]/refs/index.json`。

| 情况 | 处理 |
|:---|:---|
| 索引不存在 / refs 为空 | 提示"当前无引用，运行 `/archi.ref add` 添加第一个" |
| 正常 | 按 tags 分组展示（ID / 标题 / 格式 / 更新时间） |

</sub_list>

<!-- ═══════════════════════════════════════════════ -->
<!--                 UPDATE 子命令                  -->
<!-- ═══════════════════════════════════════════════ -->

<sub_update>

**Trigger**: `/archi.ref update <id>`
**Action**:
1. 从 `index.json` 找到 `<id>` 对应的 `file` 和 `sourceType`。
2. 若 `sourceType` 为 `url` → 重新抓取；`local-file` → 重新读取；`manual` → 提示粘贴新内容。
3. 重新执行 `<step_1_analyze>` + `<step_3_store>`（保留原 id/tags/format，仅刷新内容和 `updatedAt`）。

| 情况 | 处理 |
|:---|:---|
| id 不存在于 index.json | 停止 — 提示检查 id，可运行 `/archi.ref list` 查看 |

</sub_update>

<!-- ═══════════════════════════════════════════════ -->
<!--                 REMOVE 子命令                  -->
<!-- ═══════════════════════════════════════════════ -->

<sub_remove>

**Trigger**: `/archi.ref remove <id>`
**Action**:
1. 从 `index.json` 中找到并移除 `<id>` 条目。
2. 删除对应的 `refs/{id}.{ext}` 文件。
3. 更新 `index.json`。

**Output**:
```
REMOVED  [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED  [[__DOCS_DIR__]]/refs/index.json
```

| 情况 | 处理 |
|:---|:---|
| id 不存在 | 停止 — 提示检查 id，可运行 `/archi.ref list` 查看 |

</sub_remove>

</protocol_ref>

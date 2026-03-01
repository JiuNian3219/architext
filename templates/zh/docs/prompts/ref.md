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
  **Role**: 系统分析师
  **Action**:
  1. **内容类型识别**: 判断原始内容属于哪种类型（参照 `<format_selection>`），确定推荐存储格式。
  2. **关键信息提取**: 从内容中提取：
     - 核心接口/端点/函数签名
     - 参数列表与类型（入参/出参）
     - 重要约束、限制、注意事项
     - 认证/鉴权方式（如有）
     - 典型使用示例（不超过 3 个）
  3. **信息缺口识别**:
     - id 命名（推断一个候选值，如 `wechat-pay`，待用户确认）
     - tags 分类（从以下标准 tag 推断：`api` / `sdk` / `internal` / `payment` / `auth` / `map` / `notification` / `storage` / 自定义）
     - 关注侧重点（若内容庞大，须确认用户最关心哪些接口/功能）

  **Output**: 内部分析摘要，进入 `<step_2_interview>`（有缺口时）或直接 `<step_3_store>`（信息完整时）。
</step_1_analyze>

<step_2_interview>
  **Role**: 产品顾问
  **Trigger**: 仅当 id / tags / 侧重点任一不确定时执行。
  **Action**: 向用户提问，问题上限 3 题，选项优先。

  **Output 格式**:
  ```
  ### 引用信息确认

  **内容类型**: [识别结果] → 将存储为 [.md / .yaml / .json]
  **内容摘要**: [一句话描述原始内容]

  **Q1 — 引用 ID**（用于文件命名和引用）:
  [A] [AI 推断的候选值]（推荐）
  [B] 自定义

  **Q2 — 分类 Tags**（多选）:
  [A] api  [B] sdk  [C] internal  [D] payment  [E] auth  [F] 其他: ___

  （内容庞大时）**Q3 — 关注侧重**:
  [A] 完整保留  [B] 仅保留 [具体接口列表]  [C] 自定义

  **INPUT**: Q1答案 | Q2答案 | Q3答案（如有）
  ```

  **Gate**: 等待用户回复后进入 `<step_3_store>`。
</step_2_interview>

<step_3_store>
  **Role**: 资深工程师
  **Action**:
  1. 确定存储参数：
     - `id`: 用户确认的值（或 AI 推断值）
     - `format`: 由 `<format_selection>` 规则确定的文件扩展名
     - `filename`: `{id}.{format}`
     - `tags`: 用户确认的 tags 列表

  2. **生成引用文件内容**（按格式）:

     **`.md` 格式骨架**:
     ```markdown
     ---
     id: {id}
     title: {标题}
     tags: [{tags}]
     sourceType: url | local-file | manual
     source: {来源路径或 URL，manual 时填 "manual-input"}
     created: {YYYY-MM-DD}
     updated: {YYYY-MM-DD}
     ---

     ## 核心信息
     <!-- 基础 URL、版本、认证方式等 -->

     ## 关键接口
     | 接口/函数 | 路径/签名 | 说明 |
     |:---|:---|:---|

     ## 重要约束与注意事项

     ## 示例
     <!-- 不超过 3 个最具代表性的示例 -->
     ```

     **`.yaml` 格式**: 直接存储原始 OpenAPI/Swagger 内容（精简掉示例响应中冗余的 example 字段，保留 schema 结构）。

     **`.json` 格式**: 直接存储原始 JSON Schema 或配置内容（移除注释、保留结构）。

  3. **写入文件**: `[[__DOCS_DIR__]]/refs/{id}.{ext}`

  4. **更新索引**: 向 `[[__DOCS_DIR__]]/refs/index.json` 的 `refs` 数组追加：
     ```json
     {
       "id": "{id}",
       "title": "{标题}",
       "tags": ["{tags}"],
       "format": "{ext}",
       "file": "{id}.{ext}",
       "sourceType": "url | local-file | manual",
       "updatedAt": "{YYYY-MM-DD}"
     }
     ```

  **Output**:
  ```
  ADDED  [[__DOCS_DIR__]]/refs/{id}.{ext}
  MODIFIED  [[__DOCS_DIR__]]/refs/index.json
  ```
</step_3_store>

<step_4_signoff_add>
  **Output**: 添加摘要，含：
  - **引用 ID**: `{id}`
  - **存储格式**: `{ext}` — 理由（一句话）
  - **Tags**: `[tags]`
  - **文件路径**: `[[__DOCS_DIR__]]/refs/{id}.{ext}`
  - **如何使用**:

  | 场景 | 说明 |
  |:---|:---|
  | `/archi.plan <ID>` | 规划时若任务涉及 `[tags]` 相关功能，AI 将自动读取此 ref |
  | `/archi.code <ID>` | 编码时作为补充上下文注入，提供接口签名和约束细节 |
  | 手动引用 | 在对话中直接提到 "参考 `refs/{id}`" 即可 |
</step_4_signoff_add>

</sub_add>

<!-- ═══════════════════════════════════════════════ -->
<!--                  LIST 子命令                   -->
<!-- ═══════════════════════════════════════════════ -->

<sub_list>

**Role**: 系统分析师
**Trigger**: `/archi.ref list`
**Action**: 读取 `[[__DOCS_DIR__]]/refs/index.json`。

| 情况 | 处理 |
|:---|:---|
| 索引不存在 / refs 为空 | 提示"当前无引用，运行 `/archi.ref add` 添加第一个" |
| 正常 | 按 tags 分组展示 |

**Output**:
```
### 外部知识引用库 (共 N 条)

#### [tag 分组名]
| ID | 标题 | 格式 | 更新时间 |
|:---|:---|:---|:---|
| wechat-pay | 微信支付 V3 API | .md | 2025-01-15 |
| openapi-spec | 内部服务 OpenAPI | .yaml | 2025-01-10 |
```

</sub_list>

<!-- ═══════════════════════════════════════════════ -->
<!--                 UPDATE 子命令                  -->
<!-- ═══════════════════════════════════════════════ -->

<sub_update>

**Role**: 资深工程师
**Trigger**: `/archi.ref update <id>`
**Action**:
1. 从 `index.json` 找到 `<id>` 对应的 `file` 和 `sourceType`。
2. 若 `sourceType` 为 `url` → 重新抓取原始 URL；`local-file` → 重新读取文件；`manual` → 提示用户粘贴新内容。
3. 重新执行 `<step_1_analyze>` + `<step_3_store>`（保留原 id/tags/format，仅刷新内容和 `updatedAt`）。

| 情况 | 处理 |
|:---|:---|
| id 不存在于 index.json | 停止 — 提示检查 id，可运行 `/archi.ref list` 查看 |

</sub_update>

<!-- ═══════════════════════════════════════════════ -->
<!--                 REMOVE 子命令                  -->
<!-- ═══════════════════════════════════════════════ -->

<sub_remove>

**Role**: 系统管理员
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

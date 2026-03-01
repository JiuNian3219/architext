---
description: JSON 数据文件的 AI 协作治理规则。定义全局数据文件的读写规范、更新时机与格式约束。
globs: "**/*.json"
applyTo: "**/*.json"
alwaysApply: true
---

# Data Governance Protocol

> **Role**: 数据管家。确保全局 JSON 数据文件的一致性、完整性与可追溯性。

## 1. 数据文件清单

| 文件 | 类型 | 读取时机 | 写入时机 |
|:---|:---|:---|:---|
| `roadmap.json` | 路线图 | `/archi.plan`, `/archi.code` 开始时 | `/archi.start` 创建; AI 直接编辑或 `npx archi task` 更新状态 |
| `map.json` | 架构地图 | 触碰代码时 (via context_glue) | `/archi.plan` Step 3 (全局同步); `/archi.inherit` Step 3.6; `/archi.map` |
| `dictionary.json` | 术语字典 | 生成变量名/命名时 | `/archi.plan` Step 3; code/fix 后 step_5 自动追加 |
| `design_tokens.json` | 设计令牌（仅ui项目） | 生成 UI 代码时 | `/archi.start` 创建; 设计变更时更新 |
| `data_snapshot.json` | 数据快照（仅data项目） | `/archi.plan` Q1 设计; `/archi.code` 实现时 | Plan 阶段设计 Schema; Code 阶段同步实际变更 |
| `error_codes.json` | 业务错误码 | 编写错误处理时 | `/archi.plan` Step 3; code/fix 后 step_5 自动追加 |
| `api_snapshot.json` | API 端点（仅api项目） | 实现/对接 HTTP 端点时 | `/archi.plan` Step 3 注册端点; Code 阶段同步实际路径 |
| `env_registry.json` | 环境变量（仅api项目） | 引入新配置项时 | Code 阶段引入新 env var 后立即追加 |
| `command_api.json` | 命令签名（仅cli项目） | 实现/修改 CLI 命令时 | `/archi.plan` Step 3 注册命令; Code 阶段同步实际签名 |
| `public_api.json` | 公共导出（仅lib项目） | 新增/修改导出 API 时 | `/archi.plan` Step 3 注册导出; Code 阶段同步实际签名 |

---

## 2. 通用规则

### 2.1 格式约束

- **JSON Only**: 全局数据的唯一真理源是 `.json` 文件。`.md` 视图由 `npx archi render` 自动生成，禁直接编辑 `.md` 视图。
- **Schema Stability**: 分两档管理：
  - **Tier 1 (严格)**: `roadmap.json`, `plan.json` — CLI 渲染/命令直接依赖，结构由 Zod Schema 校验，禁随意变更字段。
  - **Tier 2 (宽松)**: `dictionary.json`, `error_codes.json`, `data_snapshot.json`, `design_tokens.json`, `map.json`, `api_snapshot.json`, `env_registry.json`, `command_api.json`, `public_api.json` — 仅校验顶层 key 存在。若现有字段无法充分描述需记录的内容，可自行扩展字段（添加新 key 或在数组 item 中添加新属性），无需修改 CLI。
- **Valid JSON**: 写入后须保证合法 JSON (无尾逗号、无注释)。

### 2.2 读写纪律

| 场景 | 规则 |
|:---|:---|
| 需要查阅数据 | 读取 `.json` 文件，禁读 `.md` 视图 (可能过期) |
| 需要更新 Roadmap 任务状态 | 优先使用 `npx archi task <ID> --status <s>`; 批量更新时可直接编辑 JSON |
| 需要更新其他数据文件 | AI 直接编辑 `.json` 文件 |
| 更新后 | 运行 `npx archi render` 重新生成 `.md` 视图 |

---

## 3. 文件专项规则

### `roadmap.json`

- **结构**: `phases[] → tasks[]`，每个 task 须有 `id`, `title`, `status`, `deps`。
- **Status 值**: `pending` | `active` | `done` | `blocked`。
- **依赖完整性**: `deps` 中引用的 ID 须存在于 tasks 中。
- **Slug 规则**: `slug` 用于 tasks 文件夹命名，格式为 `Snake_Case`。

### `map.json`

- **Directory Mapping**: 须反映真实物理文件树。
- **Logical Topology**: 须注册每个 Task Module 的职责。
- **Feature Relations**（字段 `featureRelations`）: 记录聚合型 Task 与其来源的联动关系。每条结构为 `{ aggregator, sources, evidence, checkNote }`；由 AI 在 `/archi.plan`（规划聚合型 Task 时）或 `/archi.inherit`（逆向扫描时）写入，无需用户手动维护。
- **自我校正**: 若代码引用违反拓扑定义的层级关系，须报错并停止生成。
- **可扩展**: 若现有字段不足以描述项目架构，可在 item 中自行添加字段（如 `tags`、`owner`），或添加新顶层 key。

### `dictionary.json`

- **命名权威**: 本文件是命名的最高法律。
- **Boundary**: 仅注册**项目业务域**内容。Architext 框架自身概念（scripts、scaffold、roadmap、plan 等）禁注册。
- **entities**: 生成变量名前须查阅 `entities[].codeName`；禁使用 `forbiddenSynonyms` 中的词。
- **verbs**: 业务动作命名须查阅 `verbs[].codeName`，保持全项目动词一致。
- **utilities**: 封装的共享工具（如 logger、AppError、fetchClient）须注册；AI 须用已注册工具替代原始 API（参照 `replaces` 字段）。
- **components** （仅ui项目）: 创建新组件前须搜索现有组件，优先复用。
- **可扩展**: 若现有字段不足以描述某个术语/工具，可在对应数组 item 中自行添加字段（如 `tags`、`scope`、`deprecated`），也可添加新顶层数组（如 `enums`、`constants`）。

### `design_tokens.json` （仅ui项目）

- **Token Only**: 样式严格使用 Token；禁硬编码 Hex/px/rem。
- **Dark Mode**: 须同时定义 `light` 和 `dark` 值。
- **可扩展**: 若现有 Token 结构不足以覆盖项目需求（如 `motion`、`breakpoints`、`z-index`），可自行添加新属性。

### `data_snapshot.json` （仅data项目）

- **结构**: `models[]`（名称、字段、类型、约束）+ `relationships[]`（模型间关系：1:1/1:N/M:N/self-ref）。
- **Design First**: Plan 阶段须定义模型结构和字段类型，禁写 "TBD"，须精确到字段名与类型。
- **Sync Back**: Code 阶段完成后，须将实际变更同步回此文件。
- **可扩展**: 若现有字段不足以描述数据模型（如需记录 `indexes`、`triggers`、`seedData`），可在 model item 或顶层自行添加字段。

### `error_codes.json`

- **Boundary**: 仅注册**项目业务域**错误。框架基础设施（scripts/validate、dev-up、dev-reset 等）的错误由脚本自身 exit code + stderr 处理，禁注册到此文件。
- **结构**: `businessErrors`（业务错误注册表）。HTTP 协议状态码映射见 `api_snapshot.json`。
- **Code Format**: `ERR_[MODULE]_[REASON]` (如 `ERR_AUTH_INVALID_TOKEN`)。
- **statusCode**: 按项目类型填写（HTTP status / Exit code / 留空）。
- **Design Before Code**: 编写错误处理代码前须先在此注册错误码，含 `message` 和 `recovery`。
- **可扩展**: 若现有字段不足以描述错误信息（如需记录 `severity`、`retryable`），可在 item 中自行添加字段。

### `api_snapshot.json` （仅api项目）

- **结构**: `endpoints[]`（端点注册表）+ `protocolMapping[]`（HTTP 状态码→调用方行为映射）。
- **Register First**: 规划端点前须先在此注册，禁实现未登记的端点。
- **owner**: 每个端点须标注归属 Task ID，便于追踪变更来源。
- **可扩展**: 可在 endpoint item 中追加 `tags`、`deprecated`、`version` 等字段。

### `env_registry.json` （仅api项目）

- **Register on Introduce**: 代码中每引入一个新的 `process.env.X` 或等价配置读取，须立即在此追加记录。
- **required**: 必填项标 `true`；有合理默认值的标 `false` 并填写 `default`。
- **example**: 须提供示例值，禁留空（帮助新成员快速配置环境）。
- **可扩展**: 可追加 `sensitive`（是否为密钥）、`validValues`（枚举约束）等字段。

### `command_api.json` （仅cli项目）

- **Register on Introduce**: 每新增或修改 CLI 命令后同步更新此文件。
- **owner**: 每条命令须标注归属 Task ID。
- **可扩展**: 可追加 `examples`、`deprecated`、`since` 等字段。

### `public_api.json` （仅lib项目）

- **Stability First**: 导出 API 一旦标注 `stable`，变更须走 `/archi.edit` 流程，不可随意修改签名。
- **signature**: 须写完整 TypeScript 签名，禁模糊描述（如"返回用户对象"）。
- **owner**: 每条导出须标注归属 Task ID。
- **可扩展**: 可追加 `since`、`examples`、`seeAlso` 等字段。

---

## 4. Plan JSON (`plan.json`)

- **位置**: `tasks/<ID>_<Slug>/plan.json`
- **Checkbox 更新**: AI 在 `/archi.code` 中完成步骤后直接将 `done` 设为 `true`。
- **追加规则**: `/archi.edit` 追加新 Phase 时保留已完成历史。
- **验证**: 完成后运行 `npx archi plan <ID>` 验证完成度。

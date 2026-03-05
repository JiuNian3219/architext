---
description: JSON 数据文件的 AI 协作治理规则。定义全局数据文件的读写规范、更新时机与格式约束。
globs: "**/*.json"
applyTo: "**/*.json"
alwaysApply: true
---

# Data Governance Protocol

> **Role**: 数据管家。确保全局 JSON 数据文件的一致性、完整性与可追溯性。

## 1. 数据文件清单

| 文件 | 读取时机 | 写入时机 |
|:---|:---|:---|
| `roadmap.json` | plan/code 开始时 | start 创建; AI 编辑或 `npx archi task` 更新 |
| `map.json` | 触碰代码时 (via context_glue) | plan Step 3; inherit Step 3.6; /archi.map |
| `dictionary.json` | 生成变量名/命名时 | plan Step 3; code/fix 后 step_5 自动追加 |
| `design_tokens.json`（仅ui） | 生成 UI 代码时 | start 创建; 设计变更时更新 |
| `data_snapshot.json`（仅data） | plan 设计/code 实现时 | Plan 设计 Schema; Code 同步变更 |
| `error_codes.json` | 编写错误处理时 | plan Step 3; code/fix 后 step_5 自动追加 |
| `api_snapshot.json`（仅api） | 实现/对接端点时 | plan Step 3 注册; Code 同步 |
| `env_registry.json`（仅api） | 引入新配置项时 | Code 引入新 env var 后立即追加 |
| `command_api.json`（仅cli） | 实现/修改命令时 | plan Step 3 注册; Code 同步 |
| `public_api.json`（仅lib） | 新增/修改导出时 | plan Step 3 注册; Code 同步 |

---

## 2. 通用规则

### 2.1 格式约束

- **JSON Only**: `.json` 是唯一真理源。`.md` 视图由 `npx archi render` 生成，禁直接编辑。
- **Schema Stability**:
  - **Tier 1 (严格)**: `roadmap.json`, `plan.json` — CLI 直接依赖，Zod Schema 校验，禁随意变更。
  - **Tier 2 (宽松)**: 其余文件仅校验顶层 key。**所有 Tier 2 文件均可自行扩展字段（新 key / 新数组属性），无需改 CLI。**
- **Valid JSON**: 无尾逗号、无注释。

### 2.2 读写纪律

| 场景 | 规则 |
|:---|:---|
| 查阅数据 | 读 `.json`，禁读 `.md` 视图（可能过期） |
| 更新 Roadmap 状态 | 优先 `npx archi task <ID> --status <s>`; 批量时可直接编辑 JSON |
| 更新其他数据 | AI 直接编辑 `.json` |
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
- **Feature Relations**: `featureRelations` 记录聚合型 Task 与来源的联动关系，由 AI 在 plan/inherit 时写入。
- **自我校正**: 代码引用违反拓扑层级关系时，须报错并停止。

### `dictionary.json`

- **命名权威**: `entities[].codeName` 是最高法律；禁用 `forbiddenSynonyms` 中的词。
- **Boundary**: 仅注册项目业务域；Architext 框架概念禁注册。
- verbs 保持全项目动词一致；utilities 须注册并用已注册工具替代原始 API。
- 仅ui项目: components 创建前须搜索复用。

### `design_tokens.json`（仅ui项目）

- **Token Only**: 样式严格使用 Token；禁硬编码 Hex/px/rem。
- **Dark Mode**: 须同时定义 `light` 和 `dark` 值。

### `data_snapshot.json`（仅data项目）

- **结构**: `models[]`（名称/字段/类型/约束）+ `relationships[]`（1:1/1:N/M:N/self-ref）。
- **Design First**: Plan 须定义模型结构，精确到字段名与类型，禁写 "TBD"。
- **Sync Back**: Code 完成后须将实际变更同步回此文件。

### `error_codes.json`

- **Boundary**: 仅注册项目业务域错误；框架基础设施错误禁注册。
- **Code Format**: `ERR_[MODULE]_[REASON]`。
- **Design Before Code**: 编写错误处理前须先注册，含 `message` 和 `recovery`。

### 条件性文件专项

| 文件 | 核心规则 |
|:---|:---|
| `api_snapshot.json`（仅api） | endpoints[] 注册; Register First 禁实现未登记端点; owner 标注 Task ID |
| `env_registry.json`（仅api） | 引入即注册; required/example 必填 |
| `command_api.json`（仅cli） | 修改即同步; owner 标注 Task ID |
| `public_api.json`（仅lib） | stable 变更须走 /archi.edit; 完整 TS 签名; owner 标注 Task ID |

---

## 4. Plan JSON (`plan.json`)

- **位置**: `tasks/<ID>_<Slug>/plan.json`
- **Checkbox 更新**: AI 在 `/archi.code` 中完成步骤后直接将 `done` 设为 `true`。
- **追加规则**: `/archi.edit` 追加新 Phase 时保留已完成历史。
- **验证**: 完成后运行 `npx archi plan <ID>` 验证完成度。

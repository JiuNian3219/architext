# Architext 架构参考

> **受众**：希望理解 Architext 内部机制的贡献者，以及需要精确了解命令行为的 AI 助手。
> **定位**：本文档描述当前命令层、模板资产、resolver 与 scaffold 的真实结构；入门请先看 [README.zh-CN](../README.zh-CN.md)。

---

## 1. 系统概览

Architext 分为两层：

| 层次 | 触发方式 | 职责 |
|:---|:---|:---|
| CLI 工具层 | `npx archi <command>` | 部署/更新框架文件，管理任务状态，校验、渲染、打包与恢复用户数据 |
| AI 协议层 | `/archi.<command>` 或自然语言 | 读取项目上下文，生成/更新文档，规划任务，写代码，审查与维护 |

CLI 层只负责把规则、prompts、skills、模板和全局种子文件放到用户项目；AI 协议层在这些文件上执行工作流。

### 入口模型

当前公开 AI 命令是聚合入口：

| 公开命令 | 子协议 | 用途 |
|:---|:---|:---|
| `/archi.init` | start / inherit / recover | 初始化新项目、纳管已有代码、从 pack 恢复 |
| `/archi.plan` | decompose / detail | 新需求分解，或已有任务深度规划 |
| `/archi.change` | fix / edit / revise | 修 bug、改单任务文档、做全局变更 |
| `/archi.review` | task / project / map | 任务审查、项目体检、map 同步 |
| `/archi.ref` | add / list / update / remove | 管理外部知识引用 |
| `/archi.code` | 单协议 | 按 plan 实现 active 任务 |
| `/archi.ui` | 单协议 | 生成/增量更新 UI 概念设计 |
| `/archi.remove` | 单协议 | 下线任务，删除前必须确认影响范围 |
| `/archi.help` | 单协议 | 推荐下一步或定位信息回答问题 |

旧的 `/archi.start`、`/archi.scope`、`/archi.audit`、`/archi.fix`、`/archi.edit`、`/archi.revise`、`/archi.map` 不再作为公开根入口维护；它们对应的能力由聚合命令路由到子协议。

---

## 2. 文件模型

`src/core/file-model.ts` 是部署资产的单一事实来源。

| 字段 | 来源 | 部署目标 | 说明 |
|:---|:---|:---|:---|
| `rules` | `templates/<lang>/rules/*.md` | 编辑器规则目录 | 例如 `00_system`、`90_custom_rules` |
| `prompts` | `templates/<lang>/prompts/*.md` | 命令目录或 `<docDir>/prompts/<editor>/` | 根聚合命令 |
| `promptDirs` | `templates/<lang>/prompts/<dir>/` | `<docDir>/prompts/<dir>/` | 子协议目录，供聚合命令 INCLUDE/读取 |
| `skills` | `templates/<lang>/skills/<name>/` | 编辑器 skills 目录或 `<docDir>/skills/` | 能力说明与执行协议 |
| `docTemplates` | `templates/<lang>/templates/*` | `<docDir>/templates/` | spec/plan/design/ui/scope brief 模板 |
| `globalSeeds` | `templates/<lang>/global/*` | `<docDir>/global/` | 用户数据，init 创建，update 不覆盖已有内容 |
| `globalDocs` | `templates/<lang>/global/references/*` | `<docDir>/global/references/` | 框架拥有，可随 update 刷新 |
| `globalGuides` | `templates/<lang>/global/guides/*` | `<docDir>/global/guides/` | 结构化 JSON 的短字段说明，框架拥有 |

### 目录约定

用户项目中默认文档目录为 `.architext`：

```
.architext/
  global/
    roadmap.json
    map.json
    dictionary.json
    tech_stack.md
    vision.md
    guides/
    references/
  prompts/
    change/
    init/
    plan/
    ref/
    review/
  refs/
  skills/
  tasks/
  templates/
```

---

## 3. Front Pipeline

`templates/zh/rules/00_system.md` 是所有 AI 协议前的入口纪律。

新命令开始时，AI 先执行两步：

1. **Intent Normalization**：调用 `archi-intent-normalizer`，把用户原话转成 Intent Card，判断公开命令、子协议、目标 ID/文件、置信度与歧义。
2. **Context Fetch**：调用 `archi-context-fetch`，按 Intent Card 读取最小必要上下文，输出 Context Pack。

聚合命令只消费 Intent Card + Context Pack 做路由，不应在 router 内重复全量读取项目文件。

### Skill 调用纪律

- `archi-intent-normalizer`、`archi-context-fetch` 是自动前置技能。
- 重型协议技能（如 decompose、silent-audit、data-sync、feature-relations）优先在独立上下文或子代理中执行。
- 不能使用子代理但支持 Skill 时，`NO-SUBAGENT` 可降级为内联 Skill。
- 不支持 Skill 时，`NO-SKILL` 展开为“当前上下文如何手动执行”的说明。

---

## 4. Resolver 规则

能力标记由 `src/core/capability-resolver.ts` 处理。解析顺序固定为：

```
INCLUDE → WHEN → SUBAGENT → NO-SUBAGENT → SKILL → NO-SKILL → NO-COMMANDS
```

| 标记 | 语义 |
|:---|:---|
| `[[INCLUDE: path]]` | 从 `templates/<lang>` 或部署后的 docDir 基准引入片段 |
| `[[WHEN: feature \| payload]]` | feature 存在时展开 payload，否则删除 |
| `[[SUBAGENT: skill \| args]]` | 支持子代理时展开为子代理调用指令，否则删除 |
| `[[NO-SUBAGENT: skill \| args]]` | 不支持子代理但支持 Skill 时展开为内联 Skill；不支持 Skill 时删除 |
| `[[SKILL: skill \| args]]` | 支持 Skill 时展开为 Skill 调用说明，否则删除 |
| `[[NO-SKILL: payload]]` | 不支持 Skill 时展开手动执行说明，否则删除 |
| `[[NO-COMMANDS: payload]]` | 编辑器不支持命令文件时展开 |

最终部署给 AI 的 prompt 不应解释 resolver 语法本身；`WHEN` 示例、`[[WHEN]]` 说明等应留在开发文档或测试中，不进入执行 prompt。

---

## 5. 全局资产

### 用户数据

| 文件 | 用途 | 主要写入者 |
|:---|:---|:---|
| `vision.md` | 项目方向、目标用户、边界与原则 | init / change(revise) |
| `tech_stack.md` | 技术栈、目录规则、构建/测试命令、禁用模式 | init / change(revise) |
| `roadmap.json` | 任务 DAG、状态、依赖、phase | init / plan / code / change / remove |
| `map.json` | 目录映射、逻辑拓扑、关键路径、featureRelations | init / plan / review map / change / remove |
| `dictionary.json` | 领域术语、命名、组件/动作词注册 | init / plan / code / change |
| `error_codes.json` | 错误码契约 | init / plan / code / change |
| `env_registry.json` | 环境变量注册 | init / plan / code / change |
| `lesson_memory.json` | 可复用教训，来源包括构建/运行/测试失败、用户纠错、错误假设和流程失误 | code / change(fix) |
| `data_snapshot.json` | 数据实体与关系快照 | data feature |
| `api_snapshot.json` | API endpoint 快照 | api feature |
| `command_api.json` | CLI 命令契约 | cli feature |
| `public_api.json` | 库导出 API | lib feature |
| `design_tokens.json` | UI token 与视觉规则 | ui feature |
| `ui_context.md` | UI 屏幕索引 | ui feature |
| `screens/` | UI 视觉/交互参考页面 | ui 命令 |
| `refs/index.json` / `refs/{id}.*` | 外部知识摘要与索引 | ref 命令 |

`screens/` 只用于确定 UI 参照。实现生产页面时，AI 使用项目语言、框架、组件体系和样式方案重新实现。

### Global Guides

`global/guides/*.md` 只覆盖结构化 JSON 文件，用来说明字段结构和不变量。它们不覆盖 `vision.md` / `tech_stack.md` 这类正文型文件。

当前 guides：

`api_snapshot.md`、`command_api.md`、`data_snapshot.md`、`design_tokens.md`、`dictionary.md`、`env_registry.md`、`error_codes.md`、`lesson_memory.md`、`map.md`、`public_api.md`、`roadmap.md`。

Context Fetch 规则：如果后续协议要写某个 global JSON，对应 guide 进入 `must_read`；只读时进入 `optional_read`。高漂移文件（roadmap/map/dictionary/lesson_memory）读写都优先带 guide。

---

## 6. Task 文档

每个任务目录通常位于 `.architext/tasks/<ID>_<Slug>/`。

| 文件 | 用途 | 写入/更新 |
|:---|:---|:---|
| `spec.md` | 验收标准、行为场景、接口/类型、约束 | plan/detail 创建；change/edit 修改；inherit 生成 Stub |
| `plan.json` | Phase、task、decisions、tests、notes | plan/detail 创建；code 实时更新 done；change 追加 phase |
| `ui.md` | 单任务 UI 范围和 screens 引用 | UI feature 的 plan/edit |
| `design.md` | 复杂任务机制、不变量、失败模式、追踪表 | Standard + Design 任务 |
| `review.md` | 任务审查报告 | review/task 覆盖写入 |

`Spec-Status: Stub` 表示仅从已有代码生成的轻量快照。进入修改或实现前，应通过 `/archi.change <ID> ...` 补全为 Full spec。

---

## 7. 命令行为

### /archi.init

路由到 start / inherit / recover：

- pack XML 路径存在：recover。
- 已有 `global/vision.md` 且内容非占位：停止，提示项目已初始化。
- 根目录有 `package.json` / `go.mod` / `Cargo.toml` 等代码信号：inherit。
- 有可读 brief：start。
- 否则询问用户选择空项目、已有代码、或 pack 恢复。

init 完成后必须让用户确认基础文档，尤其是 `roadmap.json`；同时检查 `vision.md`、`tech_stack.md`、`map.json` 是否符合项目真实方向。确认前不应继续进入 `/archi.plan`。

recover 只提示用户运行公开入口 `/archi.init <pack-file>`；`init/recover.md` 是内部子协议名，不是 slash 命令。

### /archi.ui

生成或增量更新 `screens/` 与 `ui_context.md`。完成后必须让用户确认 UI 文档：页面结构、关键流程、组件边界、视觉方向和交互参照都符合预期后，才能把这些内容作为 `/archi.plan` 的上下文。

`screens/` 仍然只是参照。后续实现必须使用项目语言、框架、组件体系和样式方案重新实现，不得直接复用 screens 下页面的 CSS 或源码。

### /archi.plan

- `/archi.plan <ID>`：detail，规划已有 roadmap 任务。
- `/archi.plan <brief.md>`、`/archi.plan <自然语言需求>`、无参数但存在 scope brief：decompose，追加新任务。

detail 的 Terminal Gate 顺序：`npx archi task --check` → `npx archi render` → `npx archi task <ID> --status active`。

### /archi.code

仅允许 `active` 任务进入。执行后必须：

1. 按 plan task 实时更新 `done: true`。
2. 运行构建、类型、Lint、格式化、测试与任务验证。
3. 运行 silent-audit / feature-relations / data-sync。
4. 通过 `npx archi plan <ID>`、`npx archi task --check`、`npx archi render`。
5. 最后执行 `npx archi task <ID> --status done`。

### /archi.change

路由到：

| 子协议 | 场景 | 关键约束 |
|:---|:---|:---|
| fix | 行为异常、报错、崩溃、不符合既有 spec | Spec Immutable；先复现测试，再修复，再回归 |
| edit | 单任务补需求、改 spec/ui、调边界 | Doc First；追加 phase，不覆盖历史 |
| revise | 全局架构、技术栈、跨任务约束变化 | Impact First；用户确认后级联更新 |

### /archi.review

- `/archi.review <ID>`：task 级审查，Read-Only，仅写 `review.md`。
- `/archi.review`：project 级体检，Read-Only，写入 reviews 报告。
- `/archi.review map`：同步 map，可能写 `map.json`，需要 Gate。

审查维度包含 spec-code 漂移、测试有效性、技术栈合规、安全、性能、UI screens 误用等。

### /archi.ref

- add：摘要外部资料并写入 refs。
- list：列出现有 refs。
- update：覆盖前先展示 sourceType、摘要变化、format 漂移和将覆盖文件，等待确认。
- remove：删除前先展示 ref 文件、index 条目、引用命中和影响范围，等待确认。

### /archi.remove

本地删除前必须输出影响范围并等待用户确认。Terminal Gate 应覆盖 `npx archi task --check`、`npx archi render`、项目构建/测试以及残留 import/引用检查。

---

## 9. CLI 工具

| 命令 | 作用 |
|:---|:---|
| `npx archi init` | 部署框架文件和基础目录 |
| `npx archi update` | 刷新框架拥有的文件 |
| `npx archi doctor` | 检查项目健康 |
| `npx archi render` | 生成 JSON 的 Markdown 视图 |
| `npx archi task [--check]` | 查看/校验任务状态 |
| `npx archi task <ID> --status <status>` | 修改任务状态 |
| `npx archi plan <id>` | 检查 plan 完成度 |
| `npx archi pack [-o file]` | 打包 global/tasks/refs 用户数据 |
| `npx archi template <name>` | 输出模板到项目根目录 |
| `npx archi uninstall` | 移除 Architext 框架文件 |

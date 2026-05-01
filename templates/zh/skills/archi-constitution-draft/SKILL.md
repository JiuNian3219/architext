---
name: archi-constitution-draft
description: Generate Architext constitution files during /archi.init. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
allowed-tools: Read, Write, Edit
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只返回协议要求的结构化产物，后续写入、确认和签收由调用协议负责。


## 设计原则

1. **Self-Contained Rules**：数据源矩阵和生成规则内嵌于本 SKILL.md 的 step_1_data_source，为单一真相源
2. **Two-Phase Generation**：先在内存里生成全部文件内容 → 统一落盘；生成阶段失败不写入任何文件
3. **Summary Only**：不向主 agent 报告生成过程中的推理详情，只返回写入清单、AI 补全项、歧义项
4. **Conditional Generation**：feature_tags 未匹配的专项文件（如非 ui 项目不生成 design_tokens.json）直接跳过

## 执行阶段

### step_1_data_source 数据源与规则

**上下文前提**：
- `brief_data`（可选，archi-brief-scan 输出）
- `code_analysis`（可选，archi-code-survey 输出）
- `feature_tags`（architext.json，必有）

按下文矩阵三列按当前数据组合选列执行。

**总规则**：
1. 禁保留模板占位符——所有示例文字必须被替换
2. AI 补全必须标 `(AI 推荐 — 建议用户审查)` + 理由
3. 优先级：用户已填写 > Brief 确定项 > 代码事实 > AI 推荐；高优先级存在时不覆盖低优先级
4. feature_tags 条件生成：只生成与本项目 feature_tags 匹配的专项文件

**数据源矩阵**：

| 目标文件 | 有 brief_data 时 | 有 code_analysis 时 | 两者都有时 |
|:---|:---|:---|:---|
| `vision.md` | brief_data.identity / targetUsers / successMetrics / boundaries / references | README + 项目配置推导（低置信度标注） | Brief 优先，代码补全缺失字段 |
| 规则文件 `tech_stack` | brief_data.techStack（已确定项直写；留空项 AI 推荐） | 依赖清单 + 配置文件 + 代码模式识别 | Brief 确定项 > 代码事实 > AI 推荐 |
| `tech_stack` Section 9 | 按 feature_tags 生成默认策略（见 §3） | 从代码识别已有错误处理/数据流模式 | 代码事实优先（已有约定须尊重） |
| 规则文件 `90_custom_rules` | brief_data.supplementaryNotes 中的规则性内容 | eslint/prettier/editorconfig + 代码中识别的团队约定 | 合并（去重，冲突时标注） |
| `roadmap.json` | brief_data.coreTasks → phase-1/2（调用 archi-decompose-roadmap） | 代码功能模块 → phase-0 LEG-xx (status=done, tag=Legacy) | phase-0 来自代码，phase-1/2 来自 Brief |
| `dictionary.json` | brief_data 全文术语提取 | 代码命名 + 注释提取 | 合并去重 |
| `error_codes.json` | 按 coreTasks 预定义核心错误码 | 从代码中的 throw/Error 定义提取 | 代码事实优先 |
| `env_registry.json` | brief_data.techStack 暗示的环境变量 | 代码中 `process.env` / `os.Getenv` / `os.environ` 引用 | 代码事实优先 |
| `map.json` | techStack 架构模式预注册目录骨架；logicalTopology/journeys 为空 | 实际目录 + import 链 + 用户旅程 | 代码事实优先（map 本质是事实记录） |

[[WHEN: ui | | `design_tokens.json` | brief_data.styleTone + tagged_assets[竞品参考/品牌指南] | CSS 变量 / 主题配置提取 | Brief 优先（风格是设计决策） | ]]
[[WHEN: ui | | `ui_context.md` | coreTasks 按用户旅程切屏幕 | 路由配置 / 页面组件提取 | 代码事实优先（已有屏幕不重编号） | ]]
[[WHEN: data | | `data_snapshot.json` | brief_data.dataModel + tagged_assets[Schema] | Schema / Migration / ORM 模型 | 代码事实优先 | ]]
[[WHEN: api | | `api_snapshot.json` | brief_data.existingAPI + tagged_assets[API 文档] | 路由/控制器代码 | 代码事实优先 | ]]
[[WHEN: cli | | `command_api.json` | coreTasks 中的命令描述 | CLI 入口代码 | 代码事实优先 | ]]
[[WHEN: lib | | `public_api.json` | coreTasks 中的导出描述 | package.json exports / 入口文件 | 代码事实优先 | ]]

**§1 vision.md**：必填 Core Vision / Target Audience / Boundaries / Design & Experience / Product Principles / Context。按矩阵选列；Brief 未提供的字段留空注明"Brief 未提供"；代码推导的低置信度项标 `(AI 补全 — 建议用户审查)`。

**§2 tech_stack**：Section 1-8 按矩阵（Brief 确定项 > 代码事实 > AI 推荐；AI 推荐时优先文档成熟/类型完整/低幻觉风险技术）。Section 9 见 §3。

**§3 Section 9 Project Conventions 默认策略**：

[[WHEN: ui | - Error Handling: Fail Fast + Form Validation ]]
[[WHEN: cli | - Error Handling: Fail Fast (stderr) ]]
[[WHEN: api | - Error Handling: Schema Validation + Fail Fast ]]
[[WHEN: lib | - Error Handling: Typed Error Export + No Throw in Hot Path ]]
[[WHEN: ui | - Data Flow: Brief 未提及推送/订阅/协同 → Standard Request；提及实时 → Realtime（WebSocket/SSE） ]]
[[WHEN: ui | - Auth & Access: 单角色 → Authenticated；多角色 → RBAC；无描述 → 留空标注"待 Plan 阶段决定" ]]
[[WHEN: api | - Auth & Access: 单角色 → Authenticated；多角色 → RBAC；无描述 → 留空标注"待 Plan 阶段决定" ]]

每项必须填 Strategy/Default + Rationale，禁省略 Rationale。有 code_analysis 且代码已存在明确模式时直接记录现状，不套默认策略（代码事实优先）。

**§4 roadmap.json**：

[[INCLUDE: shared/roadmap-structure.md]]

- 有 brief_data：phase-0 保留空；phase-1/2 分解：
  [[SUBAGENT: archi-decompose-roadmap | brief_data.coreTasks + ui_context（若 ui 项目） ]]
  [[NO-SUBAGENT: archi-decompose-roadmap | brief_data.coreTasks + ui_context（若 ui 项目） ]]
  [[NO-SKILL: 读取 skills/archi-decompose-roadmap/SKILL.md 按其协议执行，输入 brief_data.coreTasks + ui_context（若 ui 项目），产出 phase-1/2 任务 ]]
- 有 code_analysis：每个代码功能模块 → phase-0 LEG-xx（status=done, tag=Legacy, goal="一句话摘要。详见 tasks/LEG-xx_<Slug>/spec.md"，deps 从 import 链推断）；每个 LEG 同步生成 Stub spec（见 §5）；共享/基建代码不进 roadmap，仅进 map.json directoryMapping
- 两者都有：分别按上两条；新任务触及 LEG 模块时在 deps 中引用

**§5 Stub Spec**（仅在有 code_analysis 时）：每个 LEG-xx 生成 `[[__DOCS_DIR__]]/tasks/LEG-xx_<Slug>/spec.md`：

[[INCLUDE: shared/leg-stub-template.md]]

Stub 是起点非终态。signoff 阶段须输出 Stub 覆盖率报告，建议用户对核心模块运行 `/archi.change <ID>` 补全。

**§6 map.json**：字段 directoryMapping / logicalTopology / criticalUserJourneys / featureRelations。
- 有 brief_data：directoryMapping 按 tech_stack 架构模式预注册核心目录骨架；其余字段为空；新任务 /archi.plan 时填充
- 有 code_analysis：全部字段从代码分析填充。featureRelations 识别：若模块 A 遍历/枚举/动态加载同类模块 X1/X2/X3，或描述为"汇总/列举/注册所有 X"，标 A 为 aggregator、X* 为 sources；evidence 记触发识别的代码片段（文件:行号）；checkNote: "新增同类 source 时需同步更新 A"
- 两者都有：以 code_analysis 为主；Brief 提及但代码未实现的目录标 `(预留 — Brief 规划)`

[[WHEN: ui |
**§7 ui_context.md**：

[[INCLUDE: shared/ui-context-format.md]]

- 有 brief_data：从 coreTasks 按用户旅程切屏幕（S-01, S-02, ...）；屏幕 ID 永久不变
- 有 code_analysis：从路由配置/页面组件提取（Next.js app/pages、Vue Router、React Router 等）；每路由 → 一屏幕；保留已有命名
- 两者都有：已存在屏幕保留现状；Brief 描述但未实现的屏幕追加 `status: planned`
]]

**§8 其他全局文档**：无条件生成 `dictionary.json` / `error_codes.json` / `env_registry.json`。

### step_2 内存生成

按 step_1 的矩阵与 §1-§9 规则，生成所有应当存在的宪法文件内容到内存（不落盘）。

对每个生成的文件记录：
- path: 相对 docsDir 的路径
- content: 完整内容
- aiAugmented: 该文件中标为 (AI 推荐 / AI 补全) 的字段及理由
- ambiguities: 该文件中的歧义项（如必要）

### step_3 统一落盘

1. 确保父目录存在
2. 按文件一个一个写入 docsDir/global/
3. 任何写入失败 → 立即停止，报告已写入文件列表

### step_4 返回

按调用契约返回 writtenFiles + aiAugmentedFields + ambiguities + renderCommand。renderCommand 仅作返回字段上交，本 skill 不执行。

## 输出契约

```
{
  writtenFiles:      [{ path, type: "vision|tech_stack|roadmap|...", size }],
  aiAugmentedFields: [{ file, field, value, rationale }],
  ambiguities:       [{ file, field, description, options? }],
  renderCommand:     "npx archi render"
}
```

副作用：向 `docsDir/global/` 写入全部宪法文件。

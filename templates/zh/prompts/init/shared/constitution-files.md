<shared_constitution_files>
**Purpose**: 宪法文件生成规则。上下文中可用的变量（由调用者准备好，不通过 INCLUDE 参数传递）：
- `brief_data`（可选）：archi-brief-scan 的输出
- `code_analysis`（可选）：archi-code-survey 的输出
- `feature_tags`：项目特征标签集合（来自 architext.json）

AI 根据当前掌握的数据自动选列：
- 仅有 brief_data → 用"有 brief_data 时"列
- 仅有 code_analysis → 用"有 code_analysis 时"列
- 两者都有 → 用"两者都有时"列

## 总规则

1. **禁保留模板占位符**：所有示例文字必须被替换
2. **AI 补全标注**：无数据源推导的内容必须标 `(AI 推荐 — 建议用户审查)` + 理由
3. **优先级**：用户已填写 > Brief 确定项 > 代码事实 > AI 推荐；高优先级存在时不覆盖低优先级
4. **feature_tags 条件生成**：只生成与本项目 feature_tags 匹配的专项文件；不适用的专项文件不得生成

## 数据源矩阵

每个宪法文件的字段来源：

| 目标文件 | 有 brief_data 时 | 有 code_analysis 时 | 两者都有时 |
|:---|:---|:---|:---|
| `vision.md` | brief_data.identity / targetUsers / successMetrics / boundaries / references | README + 项目配置推导（低置信度标注） | Brief 优先，代码补全缺失字段 |
| 规则文件 `tech_stack` | brief_data.techStack（已确定项直写；留空项 AI 推荐） | 依赖清单 + 配置文件 + 代码模式识别 | Brief 确定项 > 代码事实 > AI 推荐 |
| `tech_stack` Section 9 Project Conventions | 按 feature_tags 生成默认策略（见 §3） | 从代码中识别已有的错误处理/数据流模式 | 代码事实优先（已有约定须尊重） |
| 规则文件 `90_custom_rules` | brief_data.supplementaryNotes 中的规则性内容 | eslint/prettier/editorconfig + 代码中识别的团队约定 | 合并（去重，冲突时标注） |
| `roadmap.json` | brief_data.coreTasks → phase-1/2（调用 archi-decompose-roadmap Skill） | 代码功能模块 → phase-0 LEG-xx (status=done, tag=Legacy) | phase-0 来自代码，phase-1/2 来自 Brief |
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

## §1 vision.md 生成规则

必填字段（任何数据来源下）：
- Core Vision、Target Audience、Boundaries、Design & Experience、Product Principles、Context

从数据源矩阵选匹配的列执行映射；Brief 未提供的字段留空并注明"Brief 未提供"；从代码推导的缺缺信度项标 `(AI 补全 — 建议用户审查)`。

## §2 tech_stack 生成规则

必填 Section 1-9（完整列表见模板）。

**Section 1-8 数据来源**：
- 有 brief_data：brief_data.techStack 已确定项直写；留空项 AI 推荐 + 标 `(AI 推荐)` + 理由；推荐时优先 AI 友好型技术（文档成熟/类型完整/低幻觉风险）
- 有 code_analysis：从依赖清单 / 锁文件 / 配置文件 / 实际代码模式推断
- 两者都有：Brief 确定项 > 代码事实 > AI 推荐

**Section 9 Project Conventions**（见 §3）

## §3 Section 9 Project Conventions 默认策略

[[WHEN: ui | - **Error Handling**: Fail Fast + Form Validation ]]
[[WHEN: cli | - **Error Handling**: Fail Fast (stderr) ]]
[[WHEN: api | - **Error Handling**: Schema Validation + Fail Fast ]]
[[WHEN: lib | - **Error Handling**: Typed Error Export + No Throw in Hot Path ]]
[[WHEN: ui | - **Data Flow**: Brief 未提及推送/订阅/协同 → Standard Request；Brief 提及实时 → Realtime（WebSocket/SSE） ]]
[[WHEN: ui | - **Auth & Access**（UI）：单角色 → Authenticated；多角色 → RBAC；无认证描述 → 留空，标注"待 Plan 阶段决定" ]]
[[WHEN: api | - **Auth & Access**（API）：单角色 → Authenticated；多角色 → RBAC；无认证描述 → 留空，标注"待 Plan 阶段决定" ]]

每项必须填 Strategy/Default + Rationale，禁省略 Rationale。

**有 code_analysis 时的覆盖规则**：若代码中已存在明确的错误处理/认证模式，直接记录现状，不套用默认策略（代码事实优先）。

## §4 roadmap.json 生成规则

**结构**：

```
{
  "version": 1,
  "projectStatus": "active",
  "lastUpdated": "<date>",
  "phases": [
    { "id": "phase-0", "name": "Legacy", "tasks": [ ] },
    { "id": "phase-1", "name": "Infrastructure", "tasks": [ ] },
    { "id": "phase-2", "name": "Core Features", "tasks": [ ] }
  ]
}
```

**有 brief_data**：
- phase-0 保留空数组
- phase-1/2 调用 `archi-decompose-roadmap` Skill，输入 brief_data.coreTasks + ui_context（if ui）

**有 code_analysis**：
- 每个代码功能模块 → phase-0 的一条 LEG-xx：status=done，tag=Legacy，goal="一句话摘要。详见 tasks/LEG-xx_<Slug>/spec.md"，deps=LEG 间从 import 链推断的依赖
- phase-1/2 保留空骨架
- 每个 LEG 同步生成 Stub spec（见 §5）
- 共享/基建代码不进 roadmap，仅进 map.json directoryMapping

**两者都有**：按上两条分别处理。LEG 与新任务之间的依赖：若新任务触及某 LEG 模块，在 deps 中引用。

## §5 Stub Spec 生成规则

仅在有 code_analysis 时执行。对每个 LEG-xx，生成 `[[__DOCS_DIR__]]/tasks/LEG-xx_<Slug>/spec.md`：

```
# LEG-xx: [Title]
> **Spec-Status**: Stub
> **Source**: 逆向分析自 [源码路径]

## 概述
[一段话描述（≤3 句）]

## 关键流程
1. **[流程名]**: [A] → [B] → [C]

## 关联文件
- [角色]: `[路径]`
- [角色]: `[路径]`
```

> Stub 是起点非终态。signoff 阶段须输出 Stub 覆盖率报告，建议用户对核心模块运行 /archi.change 补全。

## §6 map.json 生成规则

统一字段：
- `directoryMapping`: 每个核心目录 → { path, layer, responsibility, publicAPI }
- `logicalTopology`: 模块间依赖 → { from, to, type: "imports" | "calls" | "extends" }
- `criticalUserJourneys`: 核心流程 → { name, steps: [...] }
- `featureRelations`: 聚合型模块关系 → { aggregator, sources, evidence, checkNote }

**有 brief_data**：`directoryMapping` 按 tech_stack 架构模式预注册核心目录骨架；其余字段为空；新任务 /archi.plan 执行时填充。

**有 code_analysis**：全部字段从代码实际分析结果填充。`featureRelations` 识别规则：若模块 A 遍历/枚举/动态加载同类模块 X1/X2/X3，或其描述为"汇总/列举/注册所有 X"，标记 A 为 aggregator，X* 为 sources；evidence 记触发识别的代码片段（文件:行号）；checkNote: "新增同类 source 时需同步更新 A"。

**两者都有**：以 code_analysis 规则为主；Brief 提及但代码未实现的目录，在 directoryMapping 中标 `(预留 — Brief 规划)`。

[[WHEN: ui |
## §7 ui_context.md 生成规则

[[INCLUDE: shared/ui-context-format.md]]

**有 brief_data**：从 brief_data.coreTasks 按用户旅程切屏幕（S-01, S-02, ...）；每个屏幕对应一个核心交互场景；屏幕 ID 永久不变。

**有 code_analysis**：从路由配置 / 页面组件提取屏幕（Next.js 的 app/pages、Vue Router、React Router 等）；每个路由 → 一个屏幕；保留代码中已有的命名对应关系。

**两者都有**：代码中已存在屏幕先入（保留现状）；Brief 描述但代码未实现的屏幕追加（标 `status: planned`）。
]]

## §8 其他全局文档

无条件生成：
- `dictionary.json`
- `error_codes.json`
- `env_registry.json`

按本项目 feature_tags 生成适用的专项文件；不适用的专项文件不得生成。

## §9 写入后动作

1. 所有文件写入完成
2. 运行 `npx archi render` 生成可视化视图
3. 控制权返回调用方（调用方负责进入 step_verify）
</shared_constitution_files>

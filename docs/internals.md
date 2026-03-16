# Architext 架构参考

> **受众**：希望深入理解 Architext 内部机制的贡献者，以及需要精确了解命令行为的 AI 助手。
> **定位**：本文档是 Architext 命令层与资产层的精确技术参考，不是入门教程。
> 如需快速上手，请先阅读 [README](../README.zh-CN.md)；如需贡献代码，请先阅读 [CONTRIBUTING](../CONTRIBUTING.md)。

---

## 1. 系统概述

### 双层架构


| 层次      | 触发方式                  | 工具            | 职责                                               |
| ------- | --------------------- | ------------- | ------------------------------------------------ |
| CLI 工具层 | `npx archi <command>` | 终端命令          | 部署 prompt/规则/Skills、初始化项目、状态变更、健康检查、渲染 JSON、备份恢复 |
| AI 命令层  | `/archi.<command>`    | AI 编辑器 Prompt | 文档生成、架构规划、代码实现、审查修复                              |


CLI 层负责将 AI 命令层所需的 prompt 文件、规则文件、Skills 等部署到用户项目。AI 层在这些文件的基础上驱动 AI 完成开发工作。

### 项目类型标记

协议与模板中通过项目类型标记来决定是否执行特定内容：


| feature | 含义                     |
| ------- | ---------------------- |
| ui      | 有用户界面（Web/移动端/桌面端/小程序） |
| data    | 有数据层（数据库/ORM/本地存储）     |
| api     | 有 HTTP/RPC/GraphQL 接口  |
| cli     | 有命令行入口                 |
| lib     | 作为库/SDK/NPM 包发布        |


其他 feature（mobile/desktop/miniapp/extension/realtime/ai）及中文条件按字面含义判定。

---

## 2. 资产体系

### 全局资产


| 类别         | 文件                 | 用途                                                                          | 写入时机                                                          |
| ---------- | ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **宪法级**    | vision.md          | 项目愿景、北极星指标、设计哲学、目标用户、边界约束                                                   | start/inherit 填充，revise 更新                                    |
|            | tech_stack.md      | 技术选型、编码规范、命名规则、目录结构、Anti-Patterns                                           | start/inherit 填充，revise 更新                                    |
|            | 90_custom_rules.md | 团队习惯、业务约束，黑名单                                                               | start/inherit 填充，用户维护，revise 更新                               |
| **进度与结构**  | roadmap.json       | 任务进度 DAG：ID/标题/状态/依赖/阶段                                                     | start/inherit 填充，scope 追加，plan/code/fix 完成后更新 status          |
|            | map.json           | 架构地图：directoryMapping/logicalTopology/criticalUserJourneys/featureRelations | start/inherit 填充，plan/code/map/revise等 追加、更新，remove 清理        |
| **领域索引**   | dictionary.json    | 统一术语表：codeName、forbiddenSynonyms、动词规范、组件注册                                  | start/inherit 提取填充，plan 注册，code/edit/fix 同步                   |
|            | error_codes.json   | 错误码契约：ERR_MODULE_REASON 格式                                                  | start/inherit 提取填充，plan 注册，code/edit/fix 同步                   |
|            | error_memory.json  | 错误记忆库：错误模式 + 检查点，AI 从错误中学习                                                  | 错误解决后追加，AI 自动维护 checkpoints                                   |
|            | data_snapshot.json | 数据模型快照：models/relationships                                                 | data 项目：start/inherit 提取填充，plan 注册，code/edit/fix 同步，remove 清理 |
|            | api_snapshot.json  | API 端点快照：endpoints                                                          | api 项目：start/inherit 提取填充，plan 注册，code/edit/fix 同步，remove 清理  |
|            | env_registry.json  | 环境变量注册表                                                                     | start/inherit 提取填充，code 引入新 env 时追加，code/edit/fix 同步          |
|            | command_api.json   | CLI 命令注册表                                                                   | cli 项目：start/inherit 提取填充，plan 注册，code/edit/fix 同步，remove 清理  |
|            | public_api.json    | 库导出注册表                                                                      | lib 项目：start/inherit 提取填充，plan 注册，code/edit/fix 同步，remove 清理  |
| **UI 资产链** | design_tokens.json | 色板、语义色、字体、圆角、间距、动效                                                          | start/inherit 填充，ui 生成，revise 更新                              |
| (仅ui项目)    | screens/           | 多文件 UI 概念设计：index.html + S-XX.html + _shared.css                            | ui 命令生成                                                       |
|            | ui_context.md      | AI 屏幕索引：ID/路由/路径/状态                                                         | ui 命令生成，plan/edit 同步                                          |
| **外部引用**   | refs/index.json    | 外部引用索引                                                                      | ref add/update/remove 管理                                      |
|            | refs/{id}.{ext}    | 外部知识摘要                                                                      | ref add/update 时写入                                            |


### Task 文档

每个任务的专属文档：


| 文件        | 用途                                  | 写入时机                            |
| --------- | ----------------------------------- | ------------------------------- |
| spec.md   | 功能规格：Gherkin 场景 / 配置契约 / 接口定义 / 约束  | plan 创建，edit 修改，inherit 创建 Stub |
| plan.json | 实施计划：Phase/Task / decisions / notes | plan 创建，code/edit/fix 追加        |
| ui.md     | 任务级 UI 范围声明                         | plan 创建，edit 修改                 |
| design.md | 核心机制技术方案（Complex 任务）                | plan 创建（可选）                     |
| audit.md  | 审查报告：发现列表 / 修复工单                    | audit 输出                        |


### 执行必读

所有命令执行时必读：

- `00_system.md` — 系统协议
- `map.json` — 用于寻址和依赖检查
- `error_memory.json` — 错误记忆，行动前预判

---

## 3. Prompt 规范

prompt 文件是 AI 命令的核心，每个 `/archi.<command>` 对应一个 prompt 文件。

**文件位置**：`[[__DOCS_DIR__]]/prompts/<command>.md`

**结构规范**：

- `protocol_<name>`：根标签
- `meta`：风格、语言、原则
- `step`_*：执行步骤
- `Pre-signoff Checklist`：输出前必检项
- `Terminal Gate`：必须通过的检查点

---

## 4. 命令体系

### 分类概览


| 类别     | 命令                                                  | 说明                   |
| ------ | --------------------------------------------------- | -------------------- |
| 初始化    | start, inherit                                      | 从零或从已有代码创建项目骨架       |
| 规划     | scope, plan, edit, revise                           | 分解需求、定义规格、变更         |
| 执行     | code, fix, audit                                    | 编码、修复、审查             |
| 维护     | map, remove, help, recover, ref, ui                 | 同步、下线、问答、恢复、引用、UI 设计 |
| CLI 工具 | init, update, doctor, task, render, pack, uninstall | 部署、状态管理、健康检查、渲染、备份   |


### AI 命令详解

**start** `[project-brief.md]`

```
读: project-brief.md（或 fallback 访谈），扫描 brief-assets/，提取外部引用
流程:
  1. Ingest: 解析 Brief，扫描资源，检查资源可达性
  2. Gap Analysis: 检查项目身份/目标用户/核心任务/技术栈完整性，分级缺口
  3. Supplementary: 针对"必须"和"可补"级缺口访谈（≤6题，含[Z]自定义）
  4. Constitution: 按路由规则生成 vision/tech_stack/roadmap/map 等全局资产
  5. Verify: Silent Audit 审查生成的全局文件
  6. Signoff: Terminal Gate（task --check + render）
写: vision.md, tech_stack.md, 90_custom_rules.md, map.json
    roadmap.json, dictionary.json, error_codes.json, env_registry.json
    仅ui项目: design_tokens.json
    仅api项目: api_snapshot.json
    仅cli项目: command_api.json
    仅lib项目: public_api.json
    仅data项目: data_snapshot.json
调用: archi-decompose-roadmap Skill → 生成任务链
```

**inherit** `[brief_path]`

```
读: package.json / README / 目录结构 / 核心模块（brief 可选，补充愿景）
流程:
  1. 扫描代码库结构，提取技术栈信息
  2. 识别已有功能模块，生成 LEG-xx 任务（status=done）
  3. 生成 vision.md（填充项目身份、目标用户）
  4. 生成 tech_stack.md（基于代码检测技术选型）
  5. 生成 map.json（基于实际目录结构）
  6. 生成 Stub 级 spec.md（轻量快照，关联源码路径）
  7. 提取领域术语填充 dictionary.json
  8. 提取错误码填充 error_codes.json
写: vision.md, tech_stack.md, map.json
    roadmap.json (LEG-xx status=done)
    tasks/LEG-xx_*/spec.md (Stub)
    dictionary.json, error_codes.json, env_registry.json
    仅ui项目: design_tokens.json
    仅data项目: data_snapshot.json
    仅api项目: api_snapshot.json
    仅cli项目: command_api.json
    仅lib项目: public_api.json
```

**scope** `[scope-brief.md]`

```
读: vision.md, roadmap.json, map.json, tasks/ 扫描
流程:
  1. 解析 scope-brief，识别新增需求
  2. 对比现有 roadmap，避免重复
  3. 增量追加新任务（禁重写已有任务）
  4. 更新 map.json 注册新任务目录
调用: archi-decompose-roadmap Skill → 分解需求为任务链
写: roadmap.json（增量追加）
    map.json（新任务目录注册）
```

**plan** `<ID>`

```
前置: Status Gate（仅 roadmap 中 pending 任务可 plan）
读: vision.md, tech_stack.md, map.json, 依赖任务 spec+plan
    仅ui项目: design_tokens.json, screens/, ui_context.md
    仅data项目: data_snapshot.json
流程:
  1. Load: 读取项目上下文 + 依赖任务文档
  2. Complexity: 检测任务类型（INF/FEAT/POLISH/EDIT），评估复杂度（Simple/Standard/Standard+Design）
  3. Interview: Unified Proposal（功能设计 + 架构建议），用户确认或反馈
  3.5 Refinement: 用户反馈非 OK 时刷新提案
  4. Global Sync: 更新 map.json，数据治理同步（dictionary/error_codes/data_snapshot等）
  5. Generate: 生成 spec.md, plan.json, 仅ui项目: ui.md, 仅Complex任务: design.md
  6. Verify: Silent Audit 审查生成的文档
  7. Signoff: Terminal Gate（task <ID> --status active），输出 Next Steps
写: tasks/<ID>_*/spec.md, tasks/<ID>_*/plan.json
    仅ui项目: tasks/<ID>_*/ui.md
    仅Complex任务: tasks/<ID>_*/design.md
更新: map.json, dictionary.json, error_codes.json, env_registry.json
      仅data项目: data_snapshot.json
      仅api项目: api_snapshot.json
```

**code** `<ID>`

```
前置: Status Gate（仅 status=active 任务可 code）
读: spec.md, ui.md, plan.json, tech_stack.md, roadmap.json
    本任务涉及ui时: design_tokens.json
    本任务涉及data时: data_snapshot.json
流程:
  1. Resolve: 解析任务 ID，Status Gate 检查，加载任务上下文
  2. Plan: 生成执行蓝图（Phase A Domain/Data/API → Phase B UI → Phase C Integration）
  3. Implement: 按 Phase 逐项实施，实时更新 plan.json done 标记
  4. Validate: 构建/类型检查/Lint/格式化/测试，Task Verification（按项目类型执行验证）
  5. Verify: Silent Audit 代码审查 + featureRelations 联动检查 + Data Sync 数据治理
  6. Signoff: Terminal Gate（plan <ID> 全部完成 + task <ID> --status done）
写: 代码文件（遵循 Code Organization 和 Type-Safe 原则）
    plan.json（Phase done 标记实时更新）
更新: dictionary.json, error_codes.json, env_registry.json
      本任务涉及data时: data_snapshot.json
      本任务涉及api时: api_snapshot.json
```

**fix** `<ID>` `[context]`

```
读: spec.md, ui.md, plan.json, 相关代码, error_memory.json
流程:
  1. Diagnose: 解析/定位任务，读取代码，分析 context，提出 1-3 个根因假设
  2. Plan Fix: 追加 Bugfix Phase 到 plan.json（复现测试 → 修复 → 回归测试）
  3. Execute Fix: 按 Plan 修复代码，禁借机重构
  4. Verify: 构建/类型检查/Lint/测试全部通过，Silent Audit 审查修复代码
  4.5 Data Sync: 扫描修复引入的新业务实体/错误码，增量同步全局文件
  5. Plan Update: 更新 plan.json done 标记，未通过项重置 status=active
  6. Summary: 输出修复摘要（根因/修复内容/新增测试）和 Next Steps
写: 修复的代码文件
    plan.json（Bugfix Phase 追加 + done 标记更新）
约束: Spec Immutable（禁改 spec.md/ui.md，除非 Bug 是文档错误）
      Reproduction First（须先构想复现步骤或测试用例）
      Root Cause（分析根因，非表面修补）
```

**edit** `<ID>` `[context]`

```
读: tasks/<ID>_*/spec.md, ui.md, plan.json
    本任务涉及ui时: ui_context.md
流程:
  1. Load: 读取 Task 文档，检测 Spec-Status（Full → step_2 | Stub → step_1.5）
  1.5 Enrich: Stub 状态须先补全完整 spec（读取源码提取接口，生成完整 Gherkin Scenarios）
  2. Refine Docs: 根据 context 修改 spec.md/ui.md，UI 偏差时调用 wireframe Skill
  3. Update Plan: 追加新 Phase，原 status=done 时重置为 active
  4. Data Sync: 扫描需求变更引入的新实体/错误码/Schema，增量同步
  4. Verify: Silent Audit 审查更新的文档和 Plan
  6. Summary: 输出更新摘要和 Next Steps（推荐 /archi.code <ID>）
写: 修改后的 spec.md, ui.md
    plan.json（新 Phase 追加，历史保留）
更新: 本任务涉及变更的全局 JSON（dictionary/error_codes/env_registry等）
约束: Doc First（须先改文档再生成 Plan，禁跳过文档直接改代码）
      Incremental（仅追加新 Task，保留已完成历史）
```

**revise** `[context]`

```
读: 全部全局资产（vision/tech_stack/map/roadmap/dictionary/error_codes等）
    tasks/ 目录索引
流程:
  1. Load: 加载全局资产，扫描 Task 索引，分析变更意图
  2. Interview: 澄清变更边界（范围/动机/排除清单），歧义时提问确认
  3. Impact: 输出变更影响评估书（全局资产变更清单 + 受影响 Task 清单 + 需决策项）
  3.5 Refinement: 用户反馈非 OK 时刷新影响评估，等待再次确认
  4. Execute:
     - Safety Checkpoint: Git 工作区状态检查
     - Phase 1: 修改全局资产
     - Phase 1.5（仅ui项目）: 设计系统变更检查，通知重跑 /archi.ui
     - Phase 2: 级联更新受影响 Task（按 edit 标准更新 spec/ui/plan）
  5. Verify: Silent Audit 审查级联更新的 Task 文档
  6. Summary: Terminal Gate + 输出 Global Revision Summary
写: 更新的全局资产
    受影响 Task 的 spec.md, ui.md, plan.json（追加 Revision Phase）
约束: User Gate（须经用户逐项确认后才执行，禁擅自修改）
      Impact First（先输出完整影响分析，后执行修改）
      Doc Cascade（全局资产变更后须同步更新受影响 Task）
```

**audit** `<ID>`

```
读: 代码, spec.md, plan.json, ui.md, vision.md, tech_stack.md
流程:
  1. 代码质量审查（Tech/SOTA/Security/Performance/Spec 符合性）
  2. 跨维度检查（本任务涉及ui时: UI Redlines，本任务涉及data时: Schema 一致性）
  3. 生成发现列表（CRITICAL/WARNING/INFO 分级）
  4. 生成修复工单（每个发现对应修复建议）
写: audit.md（审查报告，只读不修改代码）
产出: 发现列表 + 修复建议 + Next Steps（推荐 /archi.fix <ID>）
```

**ui** `[incremental]`

```
读: design_tokens.json, roadmap.json
    增量模式: ui_context.md（已有屏幕索引）
流程:
  1. 自动检测全量/增量模式
  2. 全量: 基于 design_tokens 生成完整屏幕集
  3. 增量: 对比已有屏幕，识别新增/变更
  4. 生成 screens/ 多文件结构（index.html + S-XX.html + _shared.css）
  5. 更新 ui_context.md 屏幕索引
调用: archi-ui-wireframe Skill
写: screens/index.html（导航枢纽）
    screens/S-XX.html（独立屏幕，ID 永久不变）
    screens/_shared.css（共享样式）
    ui_context.md（屏幕索引：ID/路由/路径/状态）
约束: 屏幕 ID 永久不变；视觉严格遵循 design_tokens
```

**map**

```
读: map.json, tech_stack.md, 实际目录树
流程:
  1. 比对 map.json directoryMapping 与实际目录结构
  2. 识别未注册的目录和新文件
  3. 识别孤立映射（目录已删除但 map 中仍有记录）
  4. 同步更新 directoryMapping
  5. 检查 logicalTopology 一致性
  6. 输出变更摘要
写: 更新的 map.json（比对模式同步）
    新增目录注册到 directoryMapping
    更新 logicalTopology（如职责变更）
```

**remove** `<ID>`

```
前置: 依赖安全检查（无 active/done 下游依赖）
读: roadmap.json, map.json, tasks/
流程:
  1. 检查下游依赖状态（有 active/done 依赖则阻塞）
  2. 删除 Task 代码文件
  3. 删除 Task 文档目录
  4. 更新 roadmap.json（移除或标记 deprecated）
  5. 更新 map.json（清理目录映射）
  6. 清理全局 JSON 引用（dictionary/error_codes 等）
操作: 删除 Task 代码+文档
更新: roadmap.json, map.json
      dictionary.json, error_codes.json, env_registry.json（清理引用）
      仅data项目: data_snapshot.json（清理模型）
      仅api项目: api_snapshot.json（清理端点）
      仅cli项目: command_api.json（清理命令）
      仅lib项目: public_api.json（清理导出）
```

**ref** `add|list|update|remove <id>`

```
读: 文件/URL/粘贴内容（add/update 时）
    refs/index.json
流程:
  add:    读取外部内容 → 生成摘要 → 写入 refs/{id}.md → 更新 index.json
  list:   读取 index.json → 输出引用列表（含 tags 摘要）
  update: 重新读取外部内容 → 更新摘要 → 更新 refs/{id}.md
  remove: 删除 refs/{id}.md → 从 index.json 移除条目
写: refs/{id}.md（外部知识摘要）
    refs/index.json（引用索引：id/tags/path/lastUpdated）
```

**recover** `<pack-file>`

```
读: pack XML 文件（architext-backup-*.xml）
流程:
  1. 解析 XML 结构，验证完整性
  2. 恢复 global/ 目录下所有全局资产
  3. 恢复 tasks/ 目录下所有 Task 文档
  4. 恢复 scripts/ 目录（如有）
  5. 恢复 refs/ 目录（如有）
  6. 重建 map.json 引用关系
  7. 运行 npx archi render 生成可视化视图
写: global/, tasks/, scripts/, refs/（完整恢复）
```

**help** `[query]`

```
读: roadmap.json, tasks/ 目录, map.json
流程:
  1. 分析当前项目状态（活跃任务、已完成任务、阻塞任务）
  2. 无 query 时: 输出项目状态概览 + 下一步行动建议
  3. 有 query 时: 搜索相关任务/文档，提供针对性建议
产出: 命令行建议（无文件变更）
输出格式:
  - 当前活跃任务列表
  - 推荐下一步动作（按优先级排序）
  - 相关命令示例
```

### CLI 工具详解

**init** `[-e editor] [-l lang] [-d path] [-t type]`

```
写: 空的文档骨架（global/, tasks/, refs/ 结构）
    IDE 规则（.cursor/ 或 .claude/）
    Skills 定义
```

**update** `[--dry-run]`

```
读: 远程/本地模板版本
写: prompts/, templates/（静默更新，不影响用户数据）
```

**doctor**

```
读: global/, tasks/, 配置文件
产出: 健康检查报告（schema 校验/缺失检测/一致性检查）
```

**task** `[id] [--status <s>] [--check]`

```
读: roadmap.json
写: roadmap.json（status 字段，唯一直接修改工具）
--check: 依赖完整性验证
```

**render**

```
读: roadmap.json
写: roadmap.md（可视化视图）
```

**pack** `[-o file]`

```
读: global/, tasks/, scripts/, refs/
写: architext-backup-*.xml（打包备份）
```

**uninstall**

```
操作: 移除所有部署文件（保留用户数据）
```

---

## 5. 工作流程

### 阶段顺序

**初始化 → 设计（可选）→ 规划 → 编码 → 审查（可选）→ 循环**


| 顺序  | 阶段      | 命令             | 产出                                     | 说明              |
| --- | ------- | -------------- | -------------------------------------- | --------------- |
| 1   | **初始化** | `/archi.start` | vision.md, roadmap.json, tech_stack.md | 建立项目宪法          |
| 2   | **设计**  | `/archi.ui`    | screens/, ui_context.md                | UI 概念设计，仅 UI 项目 |
| 3   | **规划**  | `/archi.plan`  | spec.md, plan.json, map.json           | 架构访谈，定义规格       |
| 4   | **编码**  | `/archi.code`  | 可运行代码                                  | 按阶段逐步实现         |
| 5   | **审查**  | `/archi.audit` | audit.md                               | 深度审查，建议执行       |
| ↺   | **循环**  | 返回 plan        | —                                      | 继续下一任务          |


### 分支路径

**已有代码项目**

```
inherit → scope → plan → code
```

**追加新需求**

```
scope → plan → code
```

**补全遗留模块**

```
inherit → edit → code
```

**Bug 修复**

```
fix
```

### Gate 重定向


| 命令       | 检查条件               | 处理方式                         |
| -------- | ------------------ | ---------------------------- |
| `code`   | `status=pending`   | 拒绝，要求先 `/archi.plan <ID>`    |
| `code`   | `status=done`      | 拒绝，要求用 `/archi.edit <ID>` 修改 |
| `plan`   | 依赖任务未完成            | 拒绝，要求先完成依赖任务                 |
| `remove` | 有 active/done 下游依赖 | 阻塞，要求先解耦                     |


---


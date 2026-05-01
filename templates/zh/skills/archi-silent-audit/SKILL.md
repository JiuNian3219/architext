---
name: archi-silent-audit
description: Lightweight code and document review. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只返回协议要求的结构化产物，后续写入、确认和签收由调用协议负责。


## 核心原则

- **无证据不报**：每个 finding 必带 `evidence`（原文片段 + 位置）；无可定位证据的猜测一律不报
- **预绑级别**：`severity` 由下方维度库表定义，skill 仅判「触发 / 未触发」不判级别
- **全开一次**：按 mode 筛选的维度单次全跑完，不分阶段不早停
- **级别 ≠ 行动**：发现与级别原样返回，如何响应由调用方协议决定

## 维度库

符号说明：
- **模式** 列：`I` = init、`P` = plan-docs、`C` = code-impl（多个用 ` / ` 分隔）
- **门** 列：`[[WHEN: X]]` = 部署期 features 剩枝；`runtime: X` = 调用时按 `task_meta` 判定；`—` = 无门

| # | ID | 名称 | 模式 | 级别 | 门 | 触发条件 |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | `VISION_ROADMAP_ALIGN` | Vision-Roadmap 对齐 | I | CRITICAL | — | roadmap 任务目标方向与 vision.md 北极星指标方向不一致（任务不服务北极星）|
| 2 | `TECH_STACK_DECLARED` | Tech Stack 声明一致 | I / P / C | CRITICAL | — | init: tech_stack.md 未反映 package.json 真实依赖；plan-docs: spec/plan 用了 tech_stack 未声明的库 / 框架 / API；code-impl: 代码 import 的库不在 tech_stack 中 |
| 3 | `GLOBAL_FILES_COMPLETE` | 全局文件完整性 | I | CRITICAL | — | vision / roadmap / map / dictionary / tech_stack / custom_rules 任一缺失或仅骨架无实质内容 |
| 4 | `INFORMATION_ROUTING` | 信息零遗漏 | I | WARNING | — | Brief / 代码中出现的信息（功能点 / 术语 / 约束）未路由到对应全局文件 |
| 5 | `DESIGN_TOKENS_BASIC` | Design Tokens 基础齐备 | I | CRITICAL | `[[WHEN: ui]]` | design_tokens.json 缺 `aestheticDirection.preset` / `primitivePalette.brand` / 核心字体字号字段 |
| 6 | `DESIGN_FIDELITY` | Design Fidelity | P | CRITICAL | — | spec § 2 未覆盖讨论中确认过的功能设计点（存在遗漏）|
| 7 | `DIMENSION_MATCH` | Dimension Match | P | WARNING | — | spec § 2 维度格式与 Task Type 不匹配（未按 Task Type 规定的维度输出）|
| 8 | `WBS_COVERAGE` | WBS Coverage | P | CRITICAL | — | plan.json 存在 spec AC 条目未被任何 task 覆盖 |
| 9 | `NOTES_QUALITY` | Notes Quality | P | WARNING | — | plan.json task.notes 缺「产出:」/「约束:」/「验证:」任一关键词；或「验证:」值含「适当」「合理」「视情况」「按需」等模糊量词 |
| 10 | `INTERFACE_EXPORTS` | Interface Exports | P | CRITICAL | — | INF 任务 § 4 未填；或下游 deps 存在时未声明接口签名 |
| 11 | `CONSTRAINTS_REDLINES` | Constraints 红线 | P | WARNING | — | spec § 5 缺 vision.md 北极星相关红线或 tech_stack 已知禁用项的红线 |
| 12 | `DATA_INTEGRITY_SPEC` | Data Integrity (spec) | P | CRITICAL | `[[WHEN: data]]` | spec 实体 / 字段与 data_snapshot.json 已有核心实体 / 字段不一致 |
| 13 | `DESIGN_TRACE` | Design Trace | P | WARNING | `runtime: is_complex` | design.md § 6 追溯表存在 AC 未映射到设计节点 |
| 14 | `PARAMETER_SPECIFICITY` | Parameter Specificity | P | INFO | `runtime: is_complex` | design.md § 3 参数表出现「适当」「合理」「视情况」「按需」「一些」等模糊量词 |
| 15 | `DESIGN_SELF_CHECK` | Design Self-Check | P | CRITICAL | `runtime: is_complex` | design.md § 2 机制自检清单任一项标记 ✗ 或空未勾选 |
| 15.5 | `TEST_PLAN_QUALITY` | Test Plan Quality | P | WARNING | — | plan.json tests / task notes 只写「补测试」「跑测试」「覆盖逻辑」等占位句；或未映射 spec AC / bug 复现步骤 |
| 16 | `TECH_STACK_STYLE_MATCH` | Tech Stack 风格一致 | C | WARNING | — | 代码模式 / API 风格偏离 tech_stack.md 声明（如声明 ESM 却用 CommonJS、声明 hooks 优先却用 class component）|
| 17 | `SOTA` | SOTA | C | WARNING | — | 出现 tech_stack 明确列出的反模式；或使用已被同 stack 替代的过时 API |
| 18 | `SECURITY` | Security | C | CRITICAL | — | 代码出现硬编码密钥 / 明文密码；或外部输入未校验直接进入 DB / FS / shell / eval |
| 19 | `PERFORMANCE` | Performance | C | WARNING | — | 明显的全量 import、重复计算、未释放监听器、O(n²) 可优化到 O(n) 的场景 |
| 20 | `UI_TOKEN_COMPLIANCE` | UI Token 合规 | C | CRITICAL | `[[WHEN: ui]]` + `runtime: involves_ui` | 样式值出现硬编码颜色 / 字号 / 间距（非 `var(--*)` 或 token 引用）|
| 21 | `ACCESSIBILITY` | Accessibility | C | WARNING | `[[WHEN: ui]]` + `runtime: involves_ui` | 可交互元素缺 aria-label / 语义标签 / 键盘可达性（button / input / link 缺必要属性）|
| 22 | `DATA_INTEGRITY_CODE` | Data Integrity (code) | C | CRITICAL | `[[WHEN: data]]` + `runtime: involves_data` | 代码实现的字段名 / 类型与 data_snapshot.json 不一致 |
| 23 | `DESIGN_COMPLIANCE_STATE` | Design Compliance 状态 | C | CRITICAL | `runtime: is_complex` | 代码状态转移 / 流程 / 协议与 design.md § 2 不一致 |
| 24 | `INVARIANT_ENFORCEMENT` | Invariant Enforcement | C | CRITICAL | `runtime: is_complex` | design.md § 4 不变量未在代码中通过 assert / 运行时检查 / 类型保护执行 |
| 25 | `PARAMETER_ALIGNMENT` | Parameter Alignment | C | CRITICAL | `runtime: is_complex` | 代码中数值 / 阈值与 design.md § 3 参数表不一致 |
| 26 | `TEST_BEHAVIOR_QUALITY` | Test Behavior Quality | C | WARNING | — | 新增/修改测试只断言 mock 调用次数、文件存在、对象非空、JSON 可解析；缺少行为结果、边界/错误路径或 Red→Green 复现证据 |

## 执行协议

1. 按 `mode` 筛选「模式」列含对应字母的维度
2. 再按「门」列过滤：当前上下文未出现的 feature 维度视为不适用；`runtime:` 按 `task_meta` 当场判
3. 对保留下来的每个维度，按「触发条件」扫描 `context_files` 对应内容
   - `mode: init` 时仅审查本次 init 生成/覆盖后的文件，或 step_3 明确返回的 `writtenFiles`。
   - 若文件仍含 `architextTemplate: true`、`Status: Template`、`template-uninitialized`、`lastUpdated: "TEMPLATE"`，它是 scaffold seed，不是审查对象；不要据此报告 roadmap 与源码不一致、vision 不可理解或全局文档漂移。
4. 命中 → 产出 finding（含 dimension / location / evidence / description）；未命中 → 不输出
5. 所有维度跑完后按 severity 分组输出

## 输出格式

===
### Silent Audit Results (mode: <mode>)

**CRITICAL**:
- dimension: <ID>
  location: <file:line 或 § 编号>
  evidence: "<原文片段>"
  description: <说明>

**WARNING**:
- dimension: <ID>
  location: ...
  evidence: "..."
  description: ...

**INFO**:
- dimension: <ID>
  location: ...
  evidence: "..."
  description: ...

Summary: <X> CRITICAL / <Y> WARNING / <Z> INFO
===

无发现时仅输出：`### Silent Audit Results (mode: <mode>) — ALL PASS`

## 输出验证

- [ ] 每个 finding 的 `evidence` 非空，可在 `context_files` 中定位
- [ ] 每个 finding 的 `severity` 与维度库预绑级别一致
- [ ] 当前 mode 未筛选到的维度不出现在 findings 中
- [ ] `task_meta` 未开的 runtime 门对应维度不出现（如 `is_complex = false` 时不报 Complex 类）
- [ ] Summary 计数与 findings 列表实际数量一致

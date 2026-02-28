---
description: "[?Complex] 技术方案设计 — 定义核心机制的实现策略、状态流转、参数与不变量。仅当任务含非平凡技术决策时生成。"
glue: 衔接 spec.md(WHAT) 与 plan.json(DO)，定义 HOW。plan.json tasks 须覆盖本文档所有机制；spec.md § 2 AC 须可在本设计中追踪出完整路径。
---

# Technical Design: {FEATURE_NAME}

> **Spec**: `spec.md`（验收标准 — 本设计的约束来源）
> **Plan**: `plan.json`（执行任务 — 本设计的下游消费者）
> **Trigger**: [AI: 一句话说明为什么本任务需要技术方案设计]

## 1. Solution Overview

<!-- [AI]: 2-3 句概述技术方案及核心取舍。
  - 引用 plan.json decisions 中的选型结果（如 "Data Flow=Realtime WebSocket"）
  - 说明为何选此方案而非替代方案（如已在 step_2 讨论则简引）
  - 禁重复 spec.md 验收标准内容；本节回答"用什么方式实现"而非"实现什么"
-->

## 2. Core Mechanisms

<!-- [AI]: 本文档主体。按技术需求选用 ≥1 个结构化模式描述核心机制。
  每个机制独立一个子章节（2.1, 2.2, ...），标注模式类型。
  同一任务可组合多个模式（如：连接管理用状态机 + 消息处理用流水线）。

  [[SKILL: archi-design-patterns|按 skill 的模式选择指南选取适用模式，生成标准格式表格并执行自检。自检未通过须修补后重检，全部通过再进入下一个机制。]]
-->

### 2.1 [机制名称] — 模式: [State Machine / Pipeline / Decision Matrix / Protocol]

<!-- 按 archi-design-patterns skill 中对应模式的标准格式填写 -->

## 3. Parameters

<!-- [AI]: 所有机制中的具体数值，集中声明。
  禁模糊描述（如"适当的超时"、"合理的间隔"），须写出具体值 + 单位 + 依据。

  | 参数 | 值 | 单位 | 依据 |
  |:---|:---|:---|:---|
  | [参数名] | [具体值] | [单位] | [为什么是这个值] |
-->

## 4. Invariants

<!-- [AI]: 系统在任何时刻都须满足的断言。每条须可被代码 assert 或测试验证。
  格式: [INV-N] 断言描述

  约束:
  - 每条不变量须对应 plan.json 中至少一个 test 条目或 task notes 中的验证项
  - 不变量是实现的"护栏"：AI 写代码时须确保不违反任何一条
-->

## 5. Failure Modes

<!-- [AI]: 显式列举核心机制可能的故障场景。每个故障须有检测方式和应对策略。

  | 故障 | 检测方式 | 应对策略 | 降级行为 |
  |:---|:---|:---|:---|
  | [故障描述] | [如何发现: 事件/超时/异常类型] | [首选恢复: 重试/重连/回滚] | [恢复失败后: 切换模式/提示用户/静默记录] |

  约束:
  - 检测方式须具体（禁"检测到错误时"，须写"收到 4xx / 心跳 3 次超时 / catch TypeError"）
  - 降级行为须可观测（禁"报错"，须写具体 UI 反馈或 exit code）
-->

## 6. Trace Verification

<!-- [AI]: 从 spec.md § 2 每条 AC 出发，在本设计中追踪执行路径。

  | AC (来自 spec § 2) | 追踪路径 (在本设计中的执行链) | 结果 |
  |:---|:---|:---|
  | [Given X When Y Then Z] | [State A →(event)→ State B →(action)→ State C] 或 [Pipeline Step 1→2→3] | ✓ 可达 |
  | [Given X When Error Then W] | [State A →(error)→ State D; Failure Mode #2 → 降级行为] | ✓ 可达 |

  **Gap Check**: 某条 AC 无法追踪 → 回到 § 2 补充机制或 § 5 补充故障处理。
  所有 AC 均 ✓ 后本设计可交付。
-->

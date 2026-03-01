---
description: Task Specification for {FEATURE_NAME}.
---

# Task Spec: {FEATURE_NAME}

> **Status:** [Draft]
> **Task Type:** [Feature / Infra / Polish]
> **Context:** [AI: 一句话描述本任务的目标和价值]

## 1. Overview

<!-- [AI]: 简述任务背景、目标和用户价值（2-3 句）。
  - FEAT 任务: 从用户视角描述 "As a [Role], I want to [Action], So that [Benefit]"
  - INF 任务: 描述本基础设施支撑的下游范围
  - POLISH 任务: 描述当前状态和优化目标
-->

## 2. Acceptance Criteria

<!-- [AI]: 核心验收契约 — 开发和测试的唯一依据。
  按 Task Type（从 ID 前缀推断）选择适用的维度格式，可组合多个维度。

  === 维度积木（按需组合，至少选一个主维度）===

  ▸ Behavioral（行为维度）[FEAT 主维度]
    用 Gherkin Given/When/Then 定义系统行为路径（正常 + 异常）。

  ▸ Structural（结构维度）[INF 主维度]
    用 Configuration Contract 定义文件/配置的目标状态：
    - Path: 文件路径
    - Key Settings: 关键配置项及具体值（禁泛化描述如"配置 X"）
    - Constraints: 技术红线
    - Verify: 可执行命令 + 期望输出

  ▸ Quantitative（量化维度）[POLISH 主维度]
    用 Quality Target 定义可度量目标：
    - Metric: 指标名
    - Baseline: 当前值
    - Target: 目标值
    - Verify: 测量方式

  ▸ Contractual（契约维度）[集成/共享引擎常用]
    定义对外暴露或对接的接口契约：
    - 外部 API 的 Input/Output/Error 映射
    - 共享模块的导出类型签名

  ▸ Invariant（不变量维度）[重构常用]
    声明必须保持不变的行为/接口：
    - Preserve: [必须不变的行为或接口]
    - Verify: [回归验证方式]

  === 混合型任务示例 ===
  INF 任务可能含 Behavioral 子维度（如热键注册有行为路径）
  FEAT 任务可能含 Structural 子维度（如需创建配置文件）
  用子标题区分不同维度即可。
-->

## 3. Data Requirements

<!-- [AI]: （仅data项目） 声明数据变更，引用 data_snapshot.json 中的表结构。
  无数据变更时写 "N/A"。

  * Schema: [Table Name] -> [Field] (Add/Modify)
  * API: [Method] [Path]
  * Permissions: [Required Role]
-->

## 4. Interface Exports

<!-- [AI]: （有下游消费者时） 本任务暴露给下游任务的公共接口、约定、导入路径。
  下游任务依赖此处声明而非猜测。无下游消费者时省略本节。

  格式:
  | Export | Value | Consumer |
  |:---|:---|:---|
  | [约定/API/path alias/脚本] | [具体值] | [下游任务 ID] |
-->

## 5. Constraints

<!-- [AI]: 从 vision.md + 02_tech_stack.md 提取与本任务相关的红线约束。

  格式:
  - [约束内容] (ref: [来源])
-->

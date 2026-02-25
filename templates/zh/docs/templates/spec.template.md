---
description: Behavioral Specification (Gherkin) for {FEATURE_NAME}.
---

# Task Spec: {FEATURE_NAME}

> **Status:** [Draft]
> **Context:** [AI: Insert a 1-sentence summary of the task's value]

## 1. User Stories

<!-- [AI Instruction]: 简述用户价值，从用户视角描述任务需求 -->

- **As a** [Role] (e.g. 注册用户), **I want to** [Action] (e.g. 发表评论), **So that** [Benefit] (e.g. 与其他用户互动).

## 2. Behavioral Specifications (Gherkin)

<!-- [AI Instruction]: 核心逻辑契约。这是开发和测试的唯一依据。 -->

### Scenario: [Happy Path Name, e.g. 用户成功提交]

- **Given** 用户处于 [前置状态] (e.g. 已登录且表单填写合法)

- **When** 用户执行 [操作] (e.g. 点击提交按钮)

- **Then** 系统应返回 [预期结果] (e.g. 显示成功 Toast)

- **And** 数据库记录应 [状态变更] (Ref: `data_snapshot.json`)

### Scenario: [Edge Case Name, e.g. 网络超时]

- **Given** 用户网络不稳定

- **When** 用户点击提交按钮

- **Then** 系统应显示 [Error Message] (Ref: `error_codes.json`)

- **And** 不应产生脏数据

## 3. Data Requirements

<!-- [AI Instruction]: 明确数据变更，必须引用 `data_snapshot.json` 中的表结构 -->

* **Schema**: [Table Name] -> [Field] (Add/Modify)
  - Example: `Comment` -> `content` (Add), `parent_id` (Add, nullable)

* **API**: [Method] [Path]
  - Example: `POST /api/comments`, `GET /api/comments/:id`

* **Permissions**: [Required Role]
  - Example: `authenticated` (for POST), `public` (for GET)
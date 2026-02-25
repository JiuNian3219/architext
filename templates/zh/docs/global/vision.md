---
description: Project Constitution: Vision, Personas, Principles & Boundaries.
---

# Product Vision: [项目名称]

> **Version:** 1.0.0
> **Status:** Active
> **Role:** The "Constitution" of the project. All Tasks and Specs must align with this.

## 1. Core Vision (核心愿景)

**Elevator Pitch:**
[产品名称] 是一个 [目标市场/类别] 平台，旨在帮助 [目标用户] 解决 [核心痛点]，通过 [核心解决方案/独特点] 实现 [最终价值]。

**North Star Metric (北极星指标):**

* [指标名称]: [描述 - 例如：用户每日专注时长]

---

## 2. Target Audience (目标用户与画像)

### Primary Persona (核心用户)

* **Role:** [例如：备考的学生]
* **Key Traits:** [关键词]
* **Pain Points:**
  * [痛点 1]
  * [痛点 2]
* **Goals:**
  * [希望达成的结果]

---

## 3. Product Principles (产品原则)

* **[原则 1]:** [例如：极简优先 - 任何增加点击的操作都需要额外理由]
* **[原则 2]:** [例如：鼓励而非惩罚 - 完不成任务时给鼓励，而不是红色的警告]

---

## 4. Design & Experience (设计与体验语言) [?UI]

> **Note:** 本节仅适用于有 UI 的项目。具体色值和圆角定义请严格参阅 `[[__DOCS_DIR__]]/global/design_tokens.json`。

### Visual Style (视觉风格)

* **Keywords:** [例如：温暖、专注、无干扰]
* **Density:** [例如：大留白，沉浸式]
* **Animation:** [例如：轻微的微交互，不要花哨的转场]

### Tone of Voice (文案语调)

* **Personality:** [例如：像一个陪读的伙伴，而不是严厉的老师]
* **Do's:** [例如：用"我们一起"代替"你应该"]
* **Don'ts:** [例如：不要使用机械的错误码报错]

---

## 5. Boundaries (边界与反目标)

### In Scope (核心范围)

* [核心功能 A]
* [核心功能 B]

### Out of Scope (明确不做)

* **[反目标 1]:** [例如：不做社交排行榜]
* **[反目标 2]:** [例如：不提供深色模式切换（默认即深色）]

---

## 🤖 AI Maintenance Guide

**Trigger**: 仅在项目初始化 (`/archi.start`) 或重大战略转型 (`/archi.revise`) 时修改。

**Action**:
1.  **Alignment**: 确保 Section 3 (Principles) 与 `02_tech_stack.md` 中的技术选型不冲突。
2.  **Completeness**: 必须填满所有 `[ ]` 占位符，严禁保留 "Example" 字样。
3.  **Consistency**: 所有的 Task Spec (`.spec.md`) 都必须引用此文件的 Vision 以确保不跑题。

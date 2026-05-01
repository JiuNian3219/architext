---
description: Project Constitution: Vision, Personas, Principles & Boundaries.
---

# Product Vision: [Project Name]

> **Version:** 1.0.0
> **Status:** Active
> **Role:** The "Constitution" of the project. All Tasks and Specs must align with this.

## 1. Core Vision

**Elevator Pitch:**
[Product Name] is a [Target Market/Category] platform that helps [Target Users] solve [Core Pain Point], achieving [Ultimate Value] through [Core Solution/Unique Point].

**North Star Metric:**

* [Metric Name]: [Description - E.g., User daily focus time]

---

## 2. Target Audience

### Primary Persona

* **Role:** [E.g., Students preparing for exams]
* **Key Traits:** [Keywords]
* **Pain Points:**
  * [Pain Point 1]
  * [Pain Point 2]
* **Goals:**
  * [Desired outcome]

---

## 3. Product Principles

* **[Principle 1]:** [E.g., Simplicity First - Any action that adds clicks needs extra justification]
* **[Principle 2]:** [E.g., Encourage not Punish - When task isn't completed, give encouragement, not red warnings]

---

## 4. Design & Experience (ui projects only)

> **Note:** This section only applies to projects with UI. For specific color values and border radius definitions, strictly refer to `[[__DOCS_DIR__]]/global/design_tokens.json`.

### Visual Style

* **Keywords:** [E.g., Warm, focused, distraction-free]
* **Density:** [E.g., Large whitespace, immersive]
* **Animation:** [E.g., Light micro-interactions, no flashy transitions]

### Tone of Voice

* **Personality:** [E.g., Like a study companion, not a strict teacher]
* **Do's:** [E.g., Use "let's" instead of "you should"]
* **Don'ts:** [E.g., Don't use mechanical error codes]

---

## 5. Boundaries

### In Scope

* [Core Feature A]
* [Core Feature B]

### Out of Scope

* **[Anti-goal 1]:** [E.g., No social leaderboard]
* **[Anti-goal 2]:** [E.g., No dark mode toggle (dark by default)]

---

## 🤖 AI Maintenance Guide

**Trigger**: Only modify during project initialization (`/archi.start`) or major strategic pivot (`/archi.revise`).

**Action**:
1.  **Alignment**: Ensure Section 3 (Principles) doesn't conflict with tech selection in `tech_stack.md`.
2.  **Completeness**: Must fill all `[ ]` placeholders, "Example" text must not remain.
3.  **Consistency**: All Task Specs (`.spec.md`) must reference this file's Vision to ensure alignment.
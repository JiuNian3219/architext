---
description: Project Constitution: Vision, Personas, Principles & Boundaries.
---

# Product Vision: [Project Name]

> **Version:** 1.0.0
> **Status:** Active
> **Role:** The "Constitution" of the project. All Tasks and Specs must align with this.

## 1. Core Vision

**Elevator Pitch:**
[Product Name] is a [Target Market/Category] platform designed to help [Target User] solve [Core Pain Point], achieving [Ultimate Value] through [Core Solution/Uniqueness].

**North Star Metric:**

* [Metric Name]: [Description - e.g., Daily Focus Time per User]

---

## 2. Target Audience

### Primary Persona

* **Role:** [e.g., Student preparing for exams]
* **Key Traits:** [Keywords]
* **Pain Points:**
  * [Pain Point 1]
  * [Pain Point 2]
* **Goals:**
  * [Desired Outcome]

---

## 3. Product Principles

* **[Principle 1]:** [e.g., Simplicity First - Any extra click needs a reason]
* **[Principle 2]:** [e.g., Encourage over Punish - Give encouragement instead of red warnings when tasks aren't met]

---

## 4. Design & Experience [?UI]

> **Note:** This section applies only to projects with UI. For specific color values and radius definitions, strictly refer to `[[__DOCS_DIR__]]/global/design_tokens.json`.

### Visual Style

* **Keywords:** [e.g., Warm, Focused, Distraction-free]
* **Density:** [e.g., High whitespace, Immersive]
* **Animation:** [e.g., Subtle micro-interactions, no flashy transitions]

### Tone of Voice

* **Personality:** [e.g., Like a study buddy, not a strict teacher]
* **Do's:** [e.g., Use "Let's" instead of "You should"]
* **Don'ts:** [e.g., Don't use robotic error codes]

---

## 5. Boundaries

### In Scope

* [Core Task A]
* [Core Task B]

### Out of Scope

* **[Anti-Goal 1]:** [e.g., No social leaderboards]
* **[Anti-Goal 2]:** [e.g., No dark mode switch (Default is dark)]

---

## 🤖 AI Maintenance Guide

**Trigger**: Only modify during project initialization (`/archi.start`) or major strategic pivot (`/archi.revise`).

**Action**:
1.  **Alignment**: Ensure Section 3 (Principles) conflicts with technology choices in `02_tech_stack.md`.
2.  **Completeness**: Must fill all `[ ]` placeholders, strictly no "Example" text remaining.
3.  **Consistency**: All Task Specs (`.spec.md`) must reference the Vision in this file to ensure alignment.

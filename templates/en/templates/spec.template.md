---
description: Task Specification for {FEATURE_NAME}.
---

# Task Spec: {FEATURE_NAME}

> **Status:** [Draft]
> **Task Type:** [Feature / Infra / Polish]
> **Context:** [AI: One sentence describing this task's goal and value]

## 1. Overview

<!-- [AI]: Briefly describe task background, goal and user value (2-3 sentences).
  - FEAT task: Describe from user perspective "As a [Role], I want to [Action], So that [Benefit]"
  - INF task: Describe downstream scope this infrastructure supports
  - POLISH task: Describe current state and optimization goal
-->

## 2. Acceptance Criteria

<!-- [AI]: Core acceptance contract — sole basis for development and testing.
  Select applicable dimension format by Task Type (inferred from ID prefix), can combine multiple dimensions.

  === Dimension Building Blocks (combine as needed, at least one main dimension)===

  ▸ Behavioral (Behavior Dimension) [FEAT main dimension]
    Define system behavior paths with Gherkin Given/When/Then (normal + exception).

  ▸ Structural (Structure Dimension) [INF main dimension]
    Define target state for files/configs with Configuration Contract:
    - Path: File path
    - Key Settings: Key config items and specific values (no generic descriptions like "configure X")
    - Constraints: Technical red lines
    - Verify: Executable command + expected output

  ▸ Quantitative (Quantity Dimension) [POLISH main dimension]
    Define measurable goals with Quality Target:
    - Metric: Metric name
    - Baseline: Current value
    - Target: Target value
    - Verify: Measurement method

  ▸ Contractual (Contract Dimension) [Integration/shared engine common]
    Define external exposed or incoming interface contracts:
    - External API's Input/Output/Error mapping
    - Shared module's export type signatures

  ▸ Invariant (Invariant Dimension) [Refactoring common]
    Declare behaviors/interfaces that must remain unchanged:
    - Preserve: [Behaviors or interfaces that must not change]
    - Verify: [Regression verification method]

  === Mixed Task Example ===
  INF task may contain Behavioral sub-dimension (e.g. hotkey registration has behavior path)
  FEAT task may contain Structural sub-dimension (e.g. need to create config file)
  Distinguish with subheadings.
-->

## 3. Data Requirements

<!-- [AI]: (data projects only) Declare data changes, reference table structures from data_snapshot.json.
  Write "N/A" when no data changes.

  * Schema: [Table Name] -> [Field] (Add/Modify)
  * API: [Method] [Path]
  * Permissions: [Required Role]
-->

## 4. Interface Exports

<!-- [AI]: (When has downstream consumers) Public interfaces, conventions, import paths this task exposes to downstream tasks.
  Downstream tasks depend on declarations here, not guessing. Omit this section when no downstream consumers.

  Format:
  | Export | Value | Consumer |
  |:---|:---|:---|
  | [Convention/API/path alias/script] | [Specific value] | [Downstream task ID] |
-->

## 5. Constraints

<!-- [AI]: Extract red line constraints related to this task from vision.md + tech_stack.md.

  Format:
  - [Constraint content] (ref: [Source])
-->
---
description: Task Specification for {FEATURE_NAME}.
---

# Task Spec: {FEATURE_NAME}

> **Status:** [Draft]
> **Task Type:** [Feature / Infra / Polish]
> **Context:** [AI: One-sentence summary of this task's goal and value]

## 1. Overview

<!-- [AI]: Brief task background, goal, and user value (2-3 sentences).
  - FEAT task: From user perspective describe "As a [Role], I want to [Action], So that [Benefit]"
  - INF task: Describe the downstream scope this infrastructure supports
  - POLISH task: Describe current state and optimization target
-->

## 2. Acceptance Criteria

<!-- [AI]: Core acceptance contract — sole basis for development and testing.
  Select applicable dimension format by Task Type (inferred from ID prefix); may combine multiple dimensions.

  === Dimension Building Blocks (select at least one primary dimension) ===

  ▸ Behavioral [FEAT primary]
    Use Gherkin Given/When/Then to define system behavior paths (happy + exception).

  ▸ Structural [INF primary]
    Use Configuration Contract to define target state of files/config:
    - Path: file path
    - Key Settings: key config items and concrete values (no generic descriptions like "configure X")
    - Constraints: technical red lines
    - Verify: executable command + expected output

  ▸ Quantitative [POLISH primary]
    Use Quality Target to define measurable goals:
    - Metric: metric name
    - Baseline: current value
    - Target: target value
    - Verify: measurement method

  ▸ Contractual [integration / shared engine]
    Define interface contracts for external exposure or integration:
    - External API Input/Output/Error mapping
    - Shared module export type signatures

  ▸ Invariant [refactoring]
    Declare behavior/interface that must remain unchanged:
    - Preserve: [behavior or interface that must not change]
    - Verify: [regression verification method]

  === Mixed task example ===
  INF task may include Behavioral sub-dimension (e.g. hotkey registration has behavior path)
  FEAT task may include Structural sub-dimension (e.g. config file creation)
  Use sub-headings to distinguish dimensions.
-->

## 3. Data Requirements

<!-- [AI]: [?Data] Declare data changes, reference table structure in data_snapshot.json.
  Write "N/A" when no data changes.

  * Schema: [Table Name] -> [Field] (Add/Modify)
  * API: [Method] [Path]
  * Permissions: [Required Role]
-->

## 4. Interface Exports

<!-- [AI]: [?Upstream] Public interfaces, conventions, import paths this task exposes to downstream tasks.
  Downstream tasks depend on this declaration rather than guessing. Omit when no downstream consumers.

  Format:
  | Export | Value | Consumer |
  |:---|:---|:---|
  | [convention/API/path alias/script] | [concrete value] | [downstream task ID] |
-->

## 5. Constraints

<!-- [AI]: Extract red-line constraints relevant to this task from vision.md + tech_stack.md.

  Format:
  - [constraint content] (ref: [source])
-->

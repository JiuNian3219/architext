---
description: "[?Complex] Technical Design — Defines implementation strategy, state flow, parameters and invariants for core mechanisms. Generated only when the task involves non-trivial technical decisions."
glue: Bridges spec.md (WHAT) and plan.json (DO), defining HOW. plan.json tasks must cover all mechanisms in this doc; spec.md § 2 AC must be traceable to complete paths in this design.
---

# Technical Design: {FEATURE_NAME}

> **Spec**: `spec.md` (Acceptance Criteria — constraint source for this design)
> **Plan**: `plan.json` (Execution tasks — downstream consumer of this design)
> **Trigger**: [AI: One sentence explaining why this task needs technical design]

## 1. Solution Overview

<!-- [AI]: 2-3 sentences summarizing the technical approach and key trade-offs.
  - Reference plan.json decisions (e.g. "Data Flow=Realtime WebSocket")
  - Explain why this approach over alternatives (brief ref if discussed in step_2)
  - Do not repeat spec.md acceptance criteria; this section answers "how to implement" not "what to implement"
-->

## 2. Core Mechanisms

<!-- [AI]: Main body of this doc. Select ≥1 structured pattern per technical need.
  Each mechanism in its own subsection (2.1, 2.2, ...), labeled with pattern type.
  Same task may combine patterns (e.g. State Machine for connection mgmt + Pipeline for message handling).

  [[SKILL: archi-design-patterns|Follow the skill's pattern selection guide, generate standard-format tables and run self-checks. If any check fails, fix and re-check before proceeding to next mechanism.]]
-->

### 2.1 [Mechanism Name] — Pattern: [State Machine / Pipeline / Decision Matrix / Protocol]

<!-- Fill per archi-design-patterns skill's standard format for the chosen pattern -->

## 3. Parameters

<!-- [AI]: All concrete numeric values used across mechanisms, centralized.
  Prohibit vague descriptions (e.g. "appropriate timeout", "reasonable interval"); must state concrete value + unit + rationale.

  | Parameter | Value | Unit | Rationale |
  |:---|:---|:---|:---|
  | [name] | [value] | [unit] | [why this value] |
-->

## 4. Invariants

<!-- [AI]: Assertions that must hold at any time. Each must be assertable or testable.
  Format: [INV-N] assertion description

  Constraints:
  - Each invariant must map to at least one plan.json test entry or task notes verification
  - Invariants are implementation "guardrails": AI must ensure no violation when writing code
-->

## 5. Failure Modes

<!-- [AI]: Explicitly list possible failure scenarios for core mechanisms. Each must have detection and response.

  | Failure | Detection | Response | Fallback |
  |:---|:---|:---|:---|
  | [description] | [how to detect: event/timeout/exception type] | [primary recovery: retry/reconnect/rollback] | [if recovery fails: switch mode/prompt user/silent log] |

  Constraints:
  - Detection must be concrete (no "on error"; write "4xx response / 3 heartbeat timeouts / catch TypeError")
  - Fallback must be observable (no "report error"; write specific UI feedback or exit code)
-->

## 6. Trace Verification

<!-- [AI]: From each spec.md § 2 AC, trace the execution path through this design.

  | AC (from spec § 2) | Trace Path (execution chain in this design) | Result |
  |:---|:---|:---|
  | [Given X When Y Then Z] | [State A →(event)→ State B →(action)→ State C] or [Pipeline Step 1→2→3] | ✓ Reachable |
  | [Given X When Error Then W] | [State A →(error)→ State D; Failure Mode #2 → fallback] | ✓ Reachable |

  **Gap Check**: If an AC cannot be traced → design has a gap; return to § 2 to add mechanism or § 5 to add failure handling.
  Design is deliverable only when all ACs are ✓.
-->

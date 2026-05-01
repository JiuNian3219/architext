---
description: "Complex tasks only: Technical Solution Design — Define core mechanism implementation strategy, state transitions, parameters and invariants. Only generate when task has non-trivial technical decisions."
glue: Bridges spec.md (WHAT) and plan.json (DO), defines HOW. plan.json tasks must cover all mechanisms in this document; spec.md § 2 AC must be traceable to complete path in this design.
---

# Technical Design: {FEATURE_NAME}

> **Spec**: `spec.md` (Acceptance criteria — Constraint source for this design)
> **Plan**: `plan.json` (Execution tasks — Downstream consumer of this design)
> **Trigger**: [AI: One sentence explaining why this task needs technical solution design]

## 1. Solution Overview

<!-- [AI]: 2-3 sentence overview of technical solution and core tradeoffs.
  - Reference selection results from plan.json decisions (e.g. "Data Flow=Realtime WebSocket")
  - Explain why chose this solution over alternatives (brief reference if discussed in step_2)
  - Do not repeat spec.md acceptance criteria content; This section answers "how to implement" not "what to implement"
-->

## 2. Core Mechanisms

<!-- [AI]: Main body of this document. Select ≥1 structured pattern to describe core mechanisms per technical needs.
  Each mechanism independent sub-section (2.1, 2.2, ...), mark pattern type.
  Same task can combine multiple patterns (e.g. Connection management uses state machine + Message processing uses pipeline).

  [[SKILL: archi-design-patterns|Select applicable pattern per skill pattern selection guide, generate standard format table and execute self-check. Self-check not passed must fix then re-check, all pass before entering next mechanism.]]
-->

### 2.1 [Mechanism Name] — Pattern: [State Machine / Pipeline / Decision Matrix / Protocol]

<!-- Fill per corresponding pattern's standard format in archi-design-patterns skill -->

## 3. Parameters

<!-- [AI]: All specific values from mechanisms, centrally declared.
  No vague descriptions (e.g. "appropriate timeout", "reasonable interval"), must write specific value + unit + basis.

  | Parameter | Value | Unit | Basis |
  |:---|:---|:---|:---|
  | [Parameter name] | [Specific value] | [Unit] | [Why this value] |
-->

## 4. Invariants

<!-- [AI]: Assertions system must satisfy at all times. Each must be code assertable or test verifiable.
  Format: [INV-N] Assertion description

  Constraints:
  - Each invariant must correspond to at least one test entry in plan.json or verification item in task notes
  - Invariants are "guard rails" for implementation: AI writing code must ensure none violated
-->

## 5. Failure Modes

<!-- [AI]: Explicitly list possible failure scenarios for core mechanisms. Each failure must have detection method and response strategy.

  | Failure | Detection Method | Response Strategy | Degraded Behavior |
  |:---|:---|:---|:---|
  | [Failure description] | [How to discover: event/timeout/exception type] | [Primary recovery: retry/reconnect/rollback] | [After recovery fails: switch mode/prompt user/silent log] |

  Constraints:
  - Detection method must be specific (not "when error detected", must write "received 4xx / heartbeat 3 timeouts / caught TypeError")
  - Degraded behavior must be observable (not "report error", must write specific UI feedback or exit code)
-->

## 6. Trace Verification

<!-- [AI]: Trace execution path from each AC in spec.md § 2 through this design.

  | AC (from spec § 2) | Trace Path (execution chain in this design) | Result |
  |:---|:---|:---|
  | [Given X When Y Then Z] | [State A →(event)→ State B →(action)→ State C] or [Pipeline Step 1→2→3] | ✓ Reachable |
  | [Given X When Error Then W] | [State A →(error)→ State D; Failure Mode #2 → Degraded behavior] | ✓ Reachable |

  **Gap Check**: Some AC cannot be traced → Return to § 2 add mechanism or § 5 add failure handling.
  After all AC ✓ this design is deliverable.
-->
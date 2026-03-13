---
name: archi-design-patterns
description: Apply structured design patterns for technical solutions. Use when writing design documents or reviewing implementation consistency.
---

# Technical Design Structured Pattern Library

## System Flow Position

```
/archi.plan step_4_generate → design.md § 2
    ↓
[This Skill] pattern selection → format generation → self-check
    ↓
design.md § 2 Core Mechanisms content
```

> **Skill responsibility boundary**:
> - Responsible for: pattern selection guide, standard table formats per pattern, self-check lists
> - Not responsible for: design.md overall structure (see `design.template.md`), parameters/invariants/failure modes (see template §§ 3-5)

---

## Pattern Selection Guide

Select ≥1 pattern per mechanism characteristic. Same feature may combine multiple (e.g. State Machine for connection mgmt + Pipeline for message handling).

| Mechanism Characteristic | Recommended Pattern | Typical Scenarios |
|:---|:---|:---|
| Discrete state set with transitions | **State Machine** | Connection mgmt, workflow engine, component lifecycle, auth flow |
| Data/requests through ordered processing steps | **Pipeline** | Message decode chain, middleware stack, data transform pipe, request interceptor |
| Behavior depends on multi-condition combination | **Decision Matrix** | Permission check, policy routing, degradation rules, feature flags |
| Defined message exchange between two or more components | **Protocol** | Client-server comms, IPC, event bus, Worker messages |

**Execution flow**: Select pattern → fill standard format → **run self-check immediately** → if any item fails, fix and re-check → all pass before next mechanism.

---

## Pattern A: State Machine

### Standard Format

**States**:

| State | Meaning | Entry Condition |
|:---|:---|:---|
| `idle` | [Initial/Idle] | [Init complete or active disconnect] |
| `connecting` | [Connecting] | [Connection request initiated] |
| `connected` | [Connected] | [open event received] |
| ... | ... | ... |

**Transitions**:

| From | → To | Guard (Trigger) | Action (Side Effect) |
|:---|:---|:---|:---|
| `idle` | `connecting` | [User triggers connect] | [Create Socket instance] |
| `connecting` | `connected` | [open event received] | [Start heartbeat, clear retry count] |
| `connecting` | `disconnected` | [Timeout or error event] | [Log error, increment retry count] |
| ... | ... | ... | ... |

### Self-Check List

| # | Check | Verification |
|:---|:---|:---|
| 1 | **Completeness**: No deadlock | Every state has ≥1 outgoing edge |
| 2 | **Reachability**: No orphan | Every non-initial state has ≥1 incoming edge |
| 3 | **Termination**: Exit path exists | Terminal state or stable loop exists |
| 4 | **Determinism**: No ambiguous transition | Outgoing Guards from same state are mutually exclusive |
| 5 | **Exception coverage**: Not Happy Path only | Every non-terminal state has error/timeout outgoing edge |

---

## Pattern B: Pipeline

### Standard Format

| Step | Input | Process | Output | On Error |
|:---|:---|:---|:---|:---|
| 1. [name] | [input type] | [logic] | [output type] | [drop/retry/abort/degrade] |
| 2. [name] | [prev Output] | [logic] | [output type] | [error handling] |
| ... | ... | ... | ... | ... |

### Self-Check List

| # | Check | Verification |
|:---|:---|:---|
| 1 | **Type chain**: No break | Step N Output = Step N+1 Input |
| 2 | **Error handling**: No silent swallow | Every step has On Error |
| 3 | **Idempotency note**: Retry safety clear | Mark which steps are safe to retry, which have side effects |
| 4 | **Recoverability**: Safe termination | Any Step error can recover or exit safely |

---

## Pattern C: Decision Matrix

### Standard Format

| Condition A | Condition B | Condition C | → Behavior | Note |
|:---|:---|:---|:---|:---|
| [val1] | [val1] | [val1] | [behavior] | |
| [val1] | [val1] | [val2] | [behavior] | |
| [val1] | [val2] | * | [behavior] | *=any |
| * | * | * | [fallback] | Default when unmatched |

### Self-Check List

| # | Check | Verification |
|:---|:---|:---|
| 1 | **Exhaustiveness**: No gap | All condition value combos covered (* wildcards for unlisted) |
| 2 | **Unambiguous**: Single match | Same input hits only one row (priority top-to-bottom, or conditions mutually exclusive) |
| 3 | **Fallback row**: Default exists | Last row is * wildcard |
| 4 | **Testable**: Can construct cases | Each row can construct test input |

---

## Pattern D: Protocol

### Standard Format

**Parties**: [Component A] ↔ [Component B]

| Seq | Sender → Receiver | Message | Payload | Expected Response | Timeout |
|:---|:---|:---|:---|:---|:---|
| 1 | [A → B] | `[name]` | {[field: type]} | `[response]` {[field: type]} | [Ns → timeout handling] |
| 2 | [B → A] | `[name]` | {[field: type]} | None (one-way push) | - |
| ... | ... | ... | ... | ... | ... |

### Self-Check List

| # | Check | Verification |
|:---|:---|:---|
| 1 | **Pairing**: Request has response | Messages needing response have Response + Timeout defined |
| 2 | **Type explicit**: No any | Every Payload field has concrete type |
| 3 | **Order dependency**: Precedence declared | Mark which messages must follow which |
| 4 | **Concurrency safe**: Strategy stated | If multiple messages may arrive concurrently, state handling (queue/drop/merge) |

---

> **Intermediate output**: This Skill is a subroutine; after producing mechanism description + self-check results, control returns to caller (step_4_generate or step_5_audit) to continue.

## Output Verification

□ `design.md` § 2 Core Mechanisms populated with selected pattern(s)
□ Self-check list all passed for each pattern

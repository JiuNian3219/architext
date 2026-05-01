---
name: archi-design-patterns
description: Inline helper for structured technical design patterns. Protocol-invoked only; may run in current context.
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called at corresponding step in `/archi.*` protocols.
- **Execution context**: Can execute inline in current context; when involving user questions must return to main dialogue.
- **Boundary**: Only assist generating options, interview questions or structured fragments, does not advance protocol steps independently.


# Technical Design Structured Pattern Library

## System Flow Positioning

```
/archi.plan step_4_generate → design.md § 2
    ↓
[This Skill] Pattern selection → Format generation → Self-check
    ↓
design.md § 2 Core Mechanisms content
```

> **Skill's Responsibility Boundary**:
> - Responsible for: Pattern selection guide, Standard format per pattern, Self-check list
> - Not responsible for: design.md overall structure (see `design.template.md`), Parameters/Invariants/Failure modes (see template §§ 3-5)

---

## Pattern Selection Guide

Select ≥1 pattern based on mechanism characteristics. Same function can combine multiple (e.g. Connection management uses State Machine + Message processing uses Pipeline).

| Mechanism Characteristic | Recommended Pattern | Typical Scenario |
|:---|:---|:---|
| Has discrete state set and inter-state transitions | **State Machine** | Connection management, Workflow engine, Component lifecycle, Auth flow |
| Data/request passes through ordered processing steps | **Pipeline** | Message decode chain, Middleware stack, Data transform pipeline, Request interceptor |
| Behavior depends on multiple condition combinations | **Decision Matrix** | Permission decision, Policy routing, Degradation rules, Feature flags |
| Two or more components have defined message exchange | **Protocol** | Client-server communication, Inter-process IPC, Event bus, Worker message |

**Execution Flow**: Select pattern → Fill corresponding standard format → **Immediately execute self-check** → Has unpassed items must fix then re-check → All pass before entering next mechanism.

---

## Pattern A: State Machine

### Standard Format

**States (State Set)**:

| State | Meaning | Entry Condition |
|:---|:---|:---|
| `idle` | [Initial/Idle] | [Init complete OR Active disconnect] |
| `connecting` | [Connection establishing] | [Initiate connection request] |
| `connected` | [Connected] | [Received open event] |
| ... | ... | ... |

**Transitions (Transition Table)**:

| From | → To | Guard (Trigger Condition) | Action (Side Effect) |
|:---|:---|:---|:---|
| `idle` | `connecting` | [User triggers connection] | [Create Socket instance] |
| `connecting` | `connected` | [Received open event] | [Start heartbeat, Clear retry count] |
| `connecting` | `disconnected` | [Timeout OR error event] | [Log error, Increment retry count] |
| ... | ... | ... | ... |

### Self-Check List

| # | Check Item | Verification Method |
|:---|:---|:---|
| 1 | **Completeness**: No deadlock | Each state has at least one outgoing edge |
| 2 | **Reachability**: No islands | Each non-initial state has at least one incoming edge |
| 3 | **Termination**: Has exit path | Has terminal state or stable-state loop |
| 4 | **Determinism**: No ambiguous transitions | Same state's outgoing edges have Guards mutually exclusive |
| 5 | **Exception coverage**: Not Happy Path Only | Each non-terminal state has error/timeout outgoing edge |

---

## Pattern B: Pipeline

### Standard Format

| Step | Input | Process | Output | On Error |
|:---|:---|:---|:---|:---|
| 1. [Step name] | [Input type] | [Processing logic] | [Output type] | [Drop/Retry/Abort/Degrade] |
| 2. [Step name] | [Previous Output] | [Processing logic] | [Output type] | [Error handling] |
| ... | ... | ... | ... | ... |

### Self-Check List

| # | Check Item | Verification Method |
|:---|:---|:---|
| 1 | **Type chain**: No breaks | Step N Output = Step N+1 Input |
| 2 | **Error handling**: No silent swallow | Each step has On Error |
| 3 | **Idempotency annotation**: Retry safety clear | Mark which steps safely retryable, which have side effects |
| 4 | **Recoverability**: Safe termination | Any Step error can recover or safe exit |

---

## Pattern C: Decision Matrix

### Standard Format

| Condition A | Condition B | Condition C | → Behavior | Note |
|:---|:---|:---|:---|:---|
| [Value1] | [Value1] | [Value1] | [Behavior] | |
| [Value1] | [Value1] | [Value2] | [Behavior] | |
| [Value1] | [Value2] | * | [Behavior] | *=any value |
| * | * | * | [Fallback behavior] | Default handling when unmatched |

### Self-Check List

| # | Check Item | Verification Method |
|:---|:---|:---|
| 1 | **Exhaustiveness**: No omissions | All condition value combinations covered (* wildcard covers unlisted combinations) |
| 2 | **Unambiguous**: Single hit | Same input only hits one row (priority top-to-bottom, or conditions mutually exclusive) |
| 3 | **Fallback row**: Has default handling | Last row is * wildcard |
| 4 | **Testable**: Can construct cases | Each row can construct test input for verification |

---

## Pattern D: Protocol

### Standard Format

**Participants**: [Component A] ↔ [Component B]

| Seq | Sender → Receiver | Message | Payload | Expected Response | Timeout |
|:---|:---|:---|:---|:---|:---|
| 1 | [A → B] | `[Message name]` | {[Field: Type]} | `[Response name]` {[Field: Type]} | [Ns → Timeout handling] |
| 2 | [B → A] | `[Message name]` | {[Field: Type]} | None (one-way push) | - |
| ... | ... | ... | ... | ... | ... |

### Self-Check List

| # | Check Item | Verification Method |
|:---|:---|:---|
| 1 | **Pairing**: Has request has response | Messages needing response all have Response + Timeout defined |
| 2 | **Type clear**: No any | Each Payload field has concrete type |
| 3 | **Sequence dependency**: Pre-declared | Mark which messages must follow which |
| 4 | **Concurrency safe**: Has strategy | When multiple messages concurrent, state handling strategy (queue/drop/merge) |

---

> **Intermediate artifact**: This Skill is subroutine, after producing mechanism description + self-check results returns control to caller (step_4_generate or step_5_audit), continues subsequent flow.

## Output Verification

□ `design.md` § 2 Core Mechanisms filled with selected patterns
□ Each pattern's self-check list all passed
---
name: archi-silent-audit
description: Lightweight code and document review. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called via `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` in `/archi.*` protocols.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only downgrade to inline Skill when no subagent.
- **Boundary**: Only return protocol-required structured artifacts, subsequent write, confirm and signoff handled by calling protocol.


## Core Principles

- **No Evidence No Report**: Each finding must have `evidence` (original snippet + location); guess without locatable evidence never reported
- **Pre-bound Level**: `severity` defined by dimension library table below, skill only judges "Triggered / Not triggered" not level
- **All Open Once**: Dimensions filtered by mode run all at once, not staged, not early-stop
- **Level ≠ Action**: Findings and levels returned as-is, how to respond decided by calling protocol

## Dimension Library

Symbol legend:
- **Mode** column: `I` = init, `P` = plan-docs, `C` = code-impl (Multiple use ` / ` separator)
- **Gate** column: `[[WHEN: X]]` = Deploy-time features filter; `runtime: X` = Judgment at call-time via `task_meta`; `—` = No gate

| # | ID | Name | Mode | Level | Gate | Trigger Condition |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | `VISION_ROADMAP_ALIGN` | Vision-Roadmap Alignment | I | CRITICAL | — | roadmap task goal direction inconsistent with vision.md north star direction (task doesn't serve north star)|
| 2 | `TECH_STACK_DECLARED` | Tech Stack Declaration Consistent | I / P / C | CRITICAL | — | init: tech_stack.md doesn't reflect package.json actual dependencies; plan-docs: spec/plan uses library/framework/API not declared in tech_stack; code-impl: code imports library not in tech_stack |
| 3 | `GLOBAL_FILES_COMPLETE` | Global Files Completeness | I | CRITICAL | — | vision / roadmap / map / dictionary / tech_stack / custom_rules any missing or only skeleton without substance |
| 4 | `INFORMATION_ROUTING` | Information No Leakage | I | WARNING | — | Information in Brief / code (feature points / terms / constraints) not routed to corresponding global files |
| 5 | `DESIGN_TOKENS_BASIC` | Design Tokens Basics Ready | I | CRITICAL | `[[WHEN: ui]]` | design_tokens.json missing `aestheticDirection.preset` / `primitivePalette.brand` / core font size fields |
| 6 | `DESIGN_FIDELITY` | Design Fidelity | P | CRITICAL | — | spec § 2 doesn't cover feature design points confirmed in discussion (has omissions)|
| 7 | `DIMENSION_MATCH` | Dimension Match | P | WARNING | — | spec § 2 dimension format doesn't match Task Type (didn't output per Task Type specified dimensions)|
| 8 | `WBS_COVERAGE` | WBS Coverage | P | CRITICAL | — | plan.json has spec AC entries not covered by any task |
| 9 | `NOTES_QUALITY` | Notes Quality | P | WARNING | — | plan.json task.notes lacks "Output:" / "Constraint:" / "Verification:" any keyword; or "Verification:" value contains "appropriately", "reasonably", "as needed", "per situation" etc vague quantifiers |
| 10 | `INTERFACE_EXPORTS` | Interface Exports | P | CRITICAL | — | INF task § 4 not filled; or downstream deps exist but interface signature not declared |
| 11 | `CONSTRAINTS_REDLINES` | Constraints Red Lines | P | WARNING | — | spec § 5 lacks red lines related to vision.md north star or tech_stack known prohibited items |
| 12 | `DATA_INTEGRITY_SPEC` | Data Integrity (spec) | P | CRITICAL | `[[WHEN: data]]` | spec entity/field inconsistent with data_snapshot.json existing core entity/field |
| 13 | `DESIGN_TRACE` | Design Trace | P | WARNING | `runtime: is_complex` | design.md § 6 trace table has AC not mapped to design node |
| 14 | `PARAMETER_SPECIFICITY` | Parameter Specificity | P | INFO | `runtime: is_complex` | design.md § 3 parameter table has "appropriately", "reasonably", "as needed", "per situation", "some" etc vague quantifiers |
| 15 | `DESIGN_SELF_CHECK` | Design Self-Check | P | CRITICAL | `runtime: is_complex` | design.md § 2 mechanism self-check list any item marked ✗ or empty unchecked |
| 16 | `TECH_STACK_STYLE_MATCH` | Tech Stack Style Consistent | C | WARNING | — | Code pattern / API style deviates from tech_stack.md declaration (e.g. declared ESM but uses CommonJS, declared hooks-first but uses class component)|
| 17 | `SOTA` | SOTA | C | WARNING | — | Appears in tech_stack explicitly listed anti-pattern; or uses deprecated API replaced by same stack |
| 18 | `SECURITY` | Security | C | CRITICAL | — | Code has hardcoded secrets / plaintext passwords; or external input unvalidated directly into DB / FS / shell / eval |
| 19 | `PERFORMANCE` | Performance | C | WARNING | — | Obvious full imports, repeated computation, unreleased listeners, O(n²) optimizable to O(n) scenarios |
| 20 | `UI_TOKEN_COMPLIANCE` | UI Token Compliance | C | CRITICAL | `[[WHEN: ui]]` + `runtime: involves_ui` | Style values have hardcoded color / font size / spacing (not `var(--*)` or token reference)|
| 21 | `ACCESSIBILITY` | Accessibility | C | WARNING | `[[WHEN: ui]]` + `runtime: involves_ui` | Interactive elements lack aria-label / semantic tags / keyboard reachability (button / input / link missing required attributes)|
| 22 | `DATA_INTEGRITY_CODE` | Data Integrity (code) | C | CRITICAL | `[[WHEN: data]]` + `runtime: involves_data` | Code implemented field name / type inconsistent with data_snapshot.json |
| 23 | `DESIGN_COMPLIANCE_STATE` | Design Compliance State | C | CRITICAL | `runtime: is_complex` | Code state transition / flow / protocol inconsistent with design.md § 2 |
| 24 | `INVARIANT_ENFORCEMENT` | Invariant Enforcement | C | CRITICAL | `runtime: is_complex` | design.md § 4 invariants not enforced in code via assert / runtime check / type guard |
| 25 | `PARAMETER_ALIGNMENT` | Parameter Alignment | C | CRITICAL | `runtime: is_complex` | Code values / thresholds inconsistent with design.md § 3 parameter table |

## Execution Protocol

1. Filter dimensions with corresponding letter in "Mode" column by `mode`
2. Then filter by "Gate" column: Dimensions for features not present in current context视为inapplicable; `runtime:` judge via `task_meta` on the spot
3. For each retained dimension, scan corresponding content in `context_files` per "Trigger Condition"
4. Hit → Produce finding (with dimension / location / evidence / description); No hit → No output
5. After all dimensions run, group output by severity

## Output Format

===
### Silent Audit Results (mode: <mode>)

**CRITICAL**:
- dimension: <ID>
  location: <file:line or § number>
  evidence: "<Original snippet>"
  description: <Description>

**WARNING**:
- dimension: <ID>
  location: ...
  evidence: "..."
  description: ...

**INFO**:
- dimension: <ID>
  location: ...
  evidence: "..."
  description: ...

Summary: <X> CRITICAL / <Y> WARNING / <Z> INFO
===

No findings only output: `### Silent Audit Results (mode: <mode>) — ALL PASS`

## Output Verification

- [ ] Each finding's `evidence` non-empty, can be located in `context_files`
- [ ] Each finding's `severity` matches pre-bound level in dimension library
- [ ] Dimensions not filtered by current mode don't appear in findings
- [ ] Dimensions for runtime gates not opened per `task_meta` don't appear (e.g. `is_complex = false` doesn't report Complex-type)
- [ ] Summary count matches actual finding list count
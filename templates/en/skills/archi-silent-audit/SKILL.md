---
name: archi-silent-audit
description: Lightweight code and document review. **Must run in isolated context/subagent.** Use when verifying outputs or checking compliance with specifications.
---

# Embedded Lightweight Review

## System Flow Position

```
/archi.* step_N → Verify phase
    ↓
[This Skill] receives mode param → isolated review → returns finding list
    ↓
Main Agent Signoff (must respond to findings)
```

> **Skill responsibility boundary**:
> - Responsible: Review main Agent output in isolated context, output graded finding list
> - Not responsible: Fix issues (return to main Agent), generate report files (that is audit.md's job), run Terminal Gate commands

> **Relationship with `audit.md`**:
> - `audit.md` = Standalone deep review protocol, generates report file, only user-triggered via `/archi.audit`
> - This Skill = Embedded lightweight check, inline finding list, protocol-triggered
> - Both share review dimension definitions (see `audit.md` step_2_task); this Skill filters by mode

---

## Modes and Review Dimensions

### Mode `init` (caller: start, inherit)

Review global file quality for new/inherited projects.

| # | Dimension | Review Points |
|:---|:---|:---|
| 1 | **Vision-Roadmap alignment** | Roadmap task direction aligns with vision.md north star |
| 2 | **Tech Stack consistency** | `02_tech_stack.md` matches actual deps/config |
| 3 | **Global file completeness** | Required global files present (vision, roadmap, map, dictionary, tech_stack, custom_rules) |
| 4 | **Zero info omission** | All Brief/code info routed to corresponding files |
| 5 | [?UI] **Design Tokens** | `design_tokens.json` has base colors/fonts/spacing |

### Mode `plan-docs` (caller: plan)

Review planning doc (spec/ui/plan) quality.

| # | Dimension | Review Points |
|:---|:---|:---|
| 1 | **Design Fidelity** | spec § 2 fully covers confirmed functional design |
| 2 | **Dimension Match** | spec § 2 dimension format matches Task Type |
| 3 | **Tech Consistency** | No tech not declared in `02_tech_stack.md` |
| 4 | **WBS Coverage** | plan.json 100% covers each AC in spec |
| 5 | **Notes Quality** | plan.json each task notes has deliverable+constraint+executable verification |
| 6 | **Interface Exports** | INF task § 4 filled; interface declared when downstream deps exist |
| 7 | **Constraints** | § 5 includes vision.md + tech_stack red lines |
| 8 | [?Data] **Data Integrity** | Entities and fields match confirmed core entities |
| 9 | [?Complex] **Design Trace** | design.md § 6 all ACs traceable |
| 10 | [?Complex] **Parameter Specificity** | design.md § 3 params concrete (no vague terms) |
| 11 | [?Complex] **Self-Check Pass** | design.md § 2 mechanism self-check list passes |

### Mode `code-impl` (caller: code)

Review code implementation quality.

| # | Dimension | Review Points |
|:---|:---|:---|
| 1 | **Tech Consistency** | Matches `02_tech_stack.md` (libs/patterns/API style) |
| 2 | **SOTA** | Reject outdated patterns; use tech_stack best practices |
| 3 | **Security** | No sensitive info leak; input validated |
| 4 | **Performance** | Avoid unnecessary large deps/full imports/useless computation/memory leaks |
| 5 | [?UI] **Design Compliance** | Styles use Token/Preset only; no hardcoded magic values |
| 6 | [?UI] **Accessibility** | Necessary a11y attributes present |
| 7 | [?Data] **Data Integrity** | Matches `data_snapshot.json`; field names/types consistent |
| 8 | [?i18n] **I18n** | No hardcoded strings; use Key/dictionary reference |
| 9 | [?Complex] **Design Compliance** | State transitions/flows/protocols match design.md § 2 |
| 10 | [?Complex] **Invariant Enforcement** | design.md § 4 invariants have assert/runtime checks in code |
| 11 | [?Complex] **Parameter Alignment** | Code values match design.md § 3 param table |

---

## Execution Protocol

1. **Load context**: Load required docs and code per caller-provided file paths
2. **Filter dimensions by mode**: Execute only dimensions for current mode
3. **Review item by item**: Each dimension outputs PASS or finding (level+location+description)
4. **Output finding list**: Return sorted by level

### Finding Levels

| Level | Meaning | Main Agent must |
|:---|:---|:---|
| `CRITICAL` | Blocking issue | **Must fix** before signoff, cannot skip |
| `WARNING` | Risk | **Must explain** handling in signoff report |
| `INFO` | Suggestion | May decide whether to handle |

### Output Format

```
### Silent Audit Results (mode: <mode>)

**CRITICAL** (must fix):
- [Dimension] location: description

**WARNING** (must explain):
- [Dimension] location: description

**INFO** (suggestion):
- [Dimension] location: description

**Summary**: X CRITICAL / Y WARNING / Z INFO
```

When no findings: `### Silent Audit Results (mode: <mode>) — ALL PASS`

---

> **Intermediate output**: This Skill is a review subprogram; after producing finding list, control returns to caller; main Agent responds to findings in Signoff.

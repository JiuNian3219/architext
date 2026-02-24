---
name: archi-interview-protocol
description: Architext supplementary interview protocol. Standardizes how to ask about information gaps: multiple-choice first, AI recommendation + [Recommended] marking, [Z] Custom fallback, complete AI+/AI- analysis, option descriptions state concrete behavior. Produces standard Q-table and INPUT prompt line, referenced by /archi.start, /archi.scope, and /archi.plan supplementary confirmation steps.
---

# Supplementary Interview Protocol

## System Flow Position

```
Information gap detected
    ↓
[This Skill] → Q-table output → Wait for user INPUT
                                        ↓
                                Caller continues next steps
```

> **Skill responsibility boundary**:
> - Responsible for: how to ask (format / rules / tone)
> - Not responsible for: what to ask (determined by caller's gap list), how to handle user answers (determined by caller)

## Callers & Trigger Conditions

| Caller | Trigger Step | Trigger Condition | Max Questions |
|:---|:---|:---|:---|
| `/archi.start` | step_2_supplementary | Brief has "Required" or "Can supplement" gaps | 3–6 |
| `/archi.scope` | step_2_5_supplementary | Brief has "Required" or "Can supplement" gaps | ≤3 |
| `/archi.plan` | step_2 Part 2 Q-table | Architecture dimension has 2+ viable options whose choice significantly impacts implementation | As needed; recommend directly if possible |

---

## Core Rules

### Principle: Multiple-Choice First

No open-ended questions (e.g., "What database do you want to use?"). All questions are presented as multiple-choice. AI provides a recommended default option based on context; user only needs to confirm or switch. Goal: user can make a reasonable decision without domain expertise.

### Rule Checklist

| # | Rule | Detail |
|:---|:---|:---|
| 1 | **Gaps only** | Never re-ask what the caller or Brief has already answered; directly adopt user's filled-in choices |
| 2 | **Option count** | 3–5 options per question + `[Z] Custom`; too many options means the question should be split |
| 3 | **Recommendation mark** | AI picks the most reasonable option based on project context, marks it `[Recommended]`; must reflect current context, not mechanical defaults |
| 4 | **[Z] fallback** | Every question must include `[Z] Custom (please describe)` as an escape hatch for needs that don't fit presets |
| 5 | **Complete option description** | Description must cover: ① what this option is ② what the project/code looks like if chosen ③ what scenarios it suits (2–3 sentences total); no one-word labels |
| 6 | **AI+/AI- full sentences** | State advantages and risks from AI Agent execution perspective; must be full sentences; never write "None" — every option has trade-offs |
| 7 | **Merge related questions** | Merge strongly related gaps into one question to reduce user decision count; split only weakly related ones |

---

## Standard Output Format

```
### Supplementary Confirmation

**[Q<n>] Question title**
> Why this information is needed (one sentence, so user understands why they're answering)

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A [Recommended] | Option name | What it is + what happens if chosen + what scenarios it suits (2–3 sentences) | Full sentence | Full sentence |
| B | ... | ... | ... | ... |
| C | ... | ... | ... | ... |
| Z | Custom | (please describe) | - | - |

(Repeat Q-table structure above for multiple questions)

---
**INPUT**: `Q1 answer | Q2 answer | ...` (use `|` between questions; space for multi-select within one question, e.g. `A B`)
```

---

## Common Mistakes

| Wrong | Problem | Correct |
|:---|:---|:---|
| `A \| PostgreSQL` | One-word label, can't judge which to pick | `A \| PostgreSQL \| Relational DB suited for well-defined schemas and join queries...` |
| `AI+: Good performance` | Not a full sentence, no substantive info | `AI+: Structured schema lets AI infer CRUD code directly from type definitions, reducing guesswork` |
| `AI-: None` | Every option has trade-offs; "None" is avoidance | `AI-: Migration scripts must stay in sync as schema evolves; AI often misses field changes` |
| Asking about tech stack already answered in Brief | Re-asking erodes trust | Skip; directly adopt the user's filled-in choice |

---

> **Intermediate artifact**: This Skill is a subroutine. After producing the Q-table, control returns to the caller. The caller resumes after the user replies to INPUT.

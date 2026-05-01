---
name: archi-interview-protocol
description: Inline helper for structured multiple-choice interviews. Protocol-invoked only; must return user-facing questions to the main conversation.
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called at corresponding step in `/archi.*` protocols.
- **Execution context**: Can execute inline in current context; when involving user questions must return to main dialogue.
- **Boundary**: Only assist generating options, interview questions or structured fragments, does not advance protocol steps independently.


# Supplementary Interview Protocol

## Core Principles

**Multiple-choice first**. Do not open-ended ask (e.g. "What database do you want?"). Each question gives 3-5 options + `[Z] Custom`, AI recommends one, user confirms or chooses differently. Goal: User without domain knowledge can make reasonable decisions.

## Rules

1. Only ask about `gaps`, do not self-expand topics
2. What user already stated in Brief / `context` do not re-ask, directly adopt
3. Strongly-related gaps merge into one question, weakly-related separate
4. Each question 3-5 options + `[Z] Custom (please describe)` fallback
5. Recommended item marked `[Recommended]`, reason must combine `context`, do not mechanically apply default
6. Option "Description" must contain: What it is / What choosing means for project / What scenarios suitable (2-3 sentences, not one word)
7. `AI+` / `AI-` write complete sentences from AI Agent execution perspective; each option must have tradeoffs, do not write "none"
8. Question count ≤ `max_questions`

## Output Format

```
### Supplementary Confirmation

**[Q<n>] Question Title**
> One sentence explaining why this information is needed

| ID | Option | Description | AI+ | AI- |
|:---|:---|:---|:---|:---|
| A [Recommended] | Option name | 2-3 sentence description | Complete sentence | Complete sentence |
| B | ... | ... | ... | ... |
| Z | Custom | (please describe) | - | - |

(Multiple questions repeat above Q-table)

**INPUT**: `Q1 answer | Q2 answer | ...` (Between questions use `|`; Single question multiple choices use space, e.g. `A B`)
```

## Anti-Example Quick Reference

| Error | Rule Violated | Fix |
|:---|:---|:---|
| `A | PostgreSQL` | #6 One-word description | `A | PostgreSQL | Relational database, Schema fixed then AI infers CRUD stably, suitable for clear entity relationships` |
| `AI+: Good performance` | #7 Not complete sentence | `AI+: Structured Schema lets AI directly infer CRUD from types, reducing guessing` |
| `AI-: None` | #7 Avoiding | `AI-: Migration scripts need sync maintenance as Schema evolves, AI easily misses field changes` |
| Asking about tech stack Brief already stated | #2 | Skip, directly adopt |
---
name: archi-feature-relations
description: Manage featureRelations change-coupling index in map.json. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## Invocation

- **Auto invocation**: No. Only `/archi.*` protocols invoke this skill through explicit `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` markers.
- **Execution context**: Use an isolated subagent when available; otherwise run inline.
- **Boundary**: Return structured artifacts only. The caller owns writing, confirmation, and signoff.

# featureRelations Change-Coupling Handler

## Core Concept

`featureRelations` is a change-coupling index: it records stable "when source changes, check targets" relationships so code or docs are not updated partially.

Entry shape:

```json
{
  "id": "FR-001",
  "source": "Trigger path, directory, glob, module name, or map entry",
  "targets": ["Paths, modules, docs, or map entries that must be checked"],
  "checkRule": "Short executable rule to apply when source changes",
  "evidence": "Brief basis such as file:line, doc path, or task ID"
}
```

## Recognition Scope

Record:
- Code to code: registries, routers, schemas, adapters, generated indexes, public exports.
- Code to docs: API/CLI/config/error changes that require docs, examples, or tests.
- Docs to docs: stable sync relationships between templates, guides, prompts, skills, and roadmap conventions.

Do not record:
- One-off task steps.
- Ordinary import/call relations; those belong in `logicalTopology`.
- Long explanations or full context; keep short rules and traceable evidence.

## Modes

### register

When planning or implementation introduces a new stable coupling relationship, generate one `featureRelations` append entry.

1. Analyze new code/doc artifacts from task/spec/plan/change summary.
2. Decide whether there is a durable "change A, check B" relationship.
3. On hit, output `updates: { action: "append", entry: { id, source, targets, checkRule, evidence } }`.
4. On miss, output `NO STABLE COUPLING` plus a short reason.

### check

Compare changed code/doc paths against existing `featureRelations.source` and `featureRelations.targets` using path and semantic matching.

1. Empty `feature_relations` -> output `NO RELATIONS`.
2. Change hits `source` -> output required `targets` and `checkRule`.
3. Change hits `targets` -> output reverse reminder: confirm the `source` contract still holds.
4. If a new stable relationship is discovered, output an append suggestion; otherwise only output hits.

### cleanup

Clean `featureRelations` for removed or moved code/docs.

1. Removed `source` -> `updates: { action: "remove", index }`.
2. Removed subset of `targets` -> `updates: { action: "update", index, newTargets }`.
3. Output an impact report so the caller can confirm replacement paths or relation validity.

## Output Format

```md
### Feature Relations: <mode>
RESULT: <main result line>
HITS:
- <source> -> <targets>: <checkRule>
updates:
  - action: <append|update|remove>
    <fields>
```

RESULT lines:
- register: `RELATION REGISTERED` or `NO STABLE COUPLING — <reason>`
- check: `HITS: <n>` / `NO HITS` / `NO RELATIONS`
- cleanup: `REMOVED: <n>, UPDATED: <n>` / `NO AFFECTED RELATIONS`

## Output Validation

- [ ] Append entries use only `id/source/targets/checkRule/evidence`.
- [ ] `source` and `targets` prefer short paths, globs, module names, or map entry names.
- [ ] `checkRule` is executable, not vague commentary.
- [ ] No long context and no one-off task steps.
- [ ] All proposed changes are returned in `updates`; the skill does not write `map.json` directly.

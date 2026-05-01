---
name: archi-feature-relations
description: Manage featureRelations linkage in map.json. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called via `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` in `/archi.*` protocols.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only downgrade to inline Skill when no subagent.
- **Boundary**: Only return protocol-required structured artifacts, subsequent write, confirm and signoff handled by calling protocol.


# featureRelations Linkage Handler

## Core Concept

**Aggregator Task**: Task whose core responsibility is to list / aggregate / dynamically reflect another class of Task outputs. When adding or removing source-class Tasks, aggregator Task may need sync.

**Aggregator Determination Necessary Conditions** (all must be met):
1. Code-level echo: Iterates / Enumerates / Dynamically loads same-type modules (`for (const cmd of allCommands)`, `Object.values(registry)`, Read directory then dynamic import)
2. Description-level echo: "Aggregate all X", "Register all X", "List all X", "Dynamically generate X list"

Only matches description-level but actual code is hardcoded list → Not aggregator.

## Modes

### register

Determine if current Task is aggregator, if so generate one featureRelations append entry.

1. Analyze `task_context.spec` + `goal` + `description`
2. Compare against aggregator necessary conditions all met → Aggregator; otherwise non-aggregator
3. Aggregator → Output `updates: { action: "append", entry: { aggregator, sources, evidence, checkNote } }`
   - `aggregator`: Task ID
   - `sources`: Source range description, prefer pattern match over enumeration (e.g. "All `/archi.*` command protocols" not "/archi.init, /archi.plan, ...")
   - `evidence`: Original sentence extracted from spec/goal, proving judgment basis
   - `checkNote`: "When <sources> added or removed, check if <aggregator> needs sync"
4. Non-aggregator → Output `NOT AGGREGATOR` + judgment reason (which necessary condition not hit)

### check

Semantically compare current Task's to-be-implemented features with existing featureRelations' `sources`, output hit linkage prompts.

1. `feature_relations` empty → Output `NO RELATIONS`
2. Compare `task_context.implementedFeatures` with `sources` item by item, semantically belongs to `sources` range then hit
3. Hit → Output `aggregator` + `checkNote`; Unhit list `aggregator` for review

### cleanup

For removed Task, clean related featureRelations entries.

1. Iterate `feature_relations`, classify by reference location:
   - `aggregator == removedTaskId` → `updates: { action: "remove", index }`
   - `sources` description references that Task → `updates: { action: "update", index, newSources }` + `impact: "Check if <aggregator> needs adjustment"`
2. Output impact report

## Output Format

```
### Feature Relations: <mode>
RESULT: <mode main result line>
<Field block, filled per mode>
updates:
  - action: <append|update|remove>
    <fields>
```

**RESULT line per mode**:
- register: `AGGREGATOR REGISTERED` or `NOT AGGREGATOR — <unmet necessary condition>`
- check: `HITS: <n>` or `NO HITS` or `NO RELATIONS`
- cleanup: `REMOVED: <n>, UPDATED: <n>` or `NO AFFECTED RELATIONS`

**Field block**:
- register when output `AGGREGATOR REGISTERED`: `aggregator` / `sources` / `evidence` / `checkNote`
- check when `HITS ≥ 1`: Each hit one line `- <aggregator>: <checkNote>`
- cleanup: `REMOVED:` list + `UPDATED:` list + `IMPACT:` description

## Output Verification

- [ ] register output entry has all four fields (aggregator/sources/evidence/checkNote)
- [ ] `sources` uses pattern description not specific ID enumeration (avoid needing update here when source set changes)
- [ ] check hit determination based on semantic comparison not keyword match
- [ ] cleanup distinguishes `remove` (aggregator deleted) vs `update` (source deleted) two actions
- [ ] All internal changes packaged in `updates` array returned, skill does not directly write map.json
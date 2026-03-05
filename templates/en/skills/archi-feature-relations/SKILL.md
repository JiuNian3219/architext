---
name: archi-feature-relations
type: reviewer
description: featureRelations linkage handler. In isolated context, handles map.json featureRelations register/check/cleanup, ensures aggregator Tasks maintain correct linkage with their sources.
---

# featureRelations Linkage Handler

## System Flow Position

```
/archi.* step_N → Verify phase
    ↓
[This Skill] receives mode param → process featureRelations → return result
    ↓
Main Agent Signoff (confirm linkage prompts)
```

> **Skill responsibility boundary**:
> - Responsible: featureRelations register/check/cleanup
> - Not responsible: Modify business code, modify spec/plan docs

---

## Modes and Behavior

### Mode `register` (caller: plan, inherit)

Determine if current Task is an "aggregator Task"; if so, append to `map.json` featureRelations.

**Aggregator Task criteria**:
- Core responsibility is **listing, aggregating, or dynamically reflecting** other Tasks of a class
- Code pattern: iterate/enumerate/dynamic load of similar modules (`for (const cmd of allCommands)`, `Object.values(registry)`, read dir then dynamic import)
- Description pattern: "aggregate all page entries", "register all routes", "list all commands"

**Action**:
1. Analyze Task spec/goal description
2. Determine if aggregator
3. If yes → append featureRelations entry:
   ```json
   {
     "aggregator": "<Task ID or file path>",
     "sources": "<source scope description>",
     "evidence": "<basis>",
     "checkNote": "When such Tasks are added/removed, check if <aggregator> needs sync"
   }
   ```
4. If no → output `NOT AGGREGATOR`, skip

### Mode `check` (caller: scope, code)

Compare current Task with featureRelations sources field semantically, output linkage prompts.

**Action**:
1. Read `map.json` featureRelations array
2. If featureRelations empty → output `NO RELATIONS`, skip
3. Compare this task/implemented feature with each sources semantically
4. On match, output linkage prompt

### Mode `cleanup` (caller: remove)

Remove featureRelations entries referencing removed Task, assess impact.

**Action**:
1. Read `map.json` featureRelations array
2. Find entries where aggregator or sources references removed Task
3. Assess removal impact:
   - Removed is aggregator → delete entire entry
   - Removed is one of sources → update sources description, prompt to check if aggregator needs adjustment
4. Output impact report

---

## Output Format

### register mode

```
### Feature Relations: register

RESULT: AGGREGATOR REGISTERED
- aggregator: <ID>
- sources: <description>
- evidence: <basis>
```

Or: `RESULT: NOT AGGREGATOR — This Task is not aggregator, skip`

### check mode

```
### Feature Relations: check

HITS:
- [aggregator] — [checkNote]

NO HITS: [no matching relations]
```

Or: `NO RELATIONS — featureRelations is empty`

### cleanup mode

```
### Feature Relations: cleanup

REMOVED:
- [deleted entries]

UPDATED:
- [entries with updated sources]

IMPACT: [impact description]
```

---

> **Intermediate output**: This Skill is a review subprogram; after producing result, control returns to caller.

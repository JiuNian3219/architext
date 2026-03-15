---
name: archi-data-sync
description: Sync data governance files with main agent output. **Must run in isolated context/subagent.** Use when verifying data consistency between code and global data files.
---

# Data Governance Sync Executor

## System Flow Position

```
/archi.* step_N → Verify phase
    ↓
[This Skill] scans output → compare global files → incremental sync → return Diff
    ↓
Main Agent Signoff (confirm Diff)
```

> **Skill responsibility boundary**:
> - Responsible: Scan main Agent output for new business entities/error codes/Schema, compare with global data files, perform incremental sync
> - Not responsible: Modify `00_system.md` itself (this Skill enforces rules, does not define them)
> - Not responsible: Register framework concepts (Architext framework concepts must not be registered to global data files)

---

## Authoritative Rule Source

`00_system.md` "File Index → Global Data Assets" table is the authoritative rule source for data governance. All behavior of this Skill must align with that file.

---

## Sync Scope

| Global file | Sync content | Trigger |
|:---|:---|:---|
| `map.json` | New module registration (directoryMapping), dependency relationships (logicalTopology), impact associations (featureRelations) | When creating new code modules/directories |
| `dictionary.json` | New business entities · actions · shared tools · public components | Output contains unregistered business terms or tools |
| `error_codes.json` | New business error codes | Output contains unregistered error scenarios |
| `env_registry.json` | New env vars | Output introduces new `process.env.X` |
| [?UI] `design_tokens.json` | Style changes | Output has new color/font/spacing/motion definitions |
| [?UI] `ui_context.md` | Screen index changes | Output has new/modified screens |
| [?Data] `data_snapshot.json` | Schema changes | Output has data model add/modify |
| [?API] `api_snapshot.json` | New endpoints | Output has new HTTP/RPC endpoints |
| [?CLI] `command_api.json` | New commands | Output has new CLI commands |
| [?Lib] `public_api.json` | New public exports | Output has new public exports |

---

## Execution Protocol

1. **Read project features**: Read project root `architext.json`, extract `features` field (api/cli/lib/data/ui etc.)
2. **Read global data files**: Load global files matching project features from table above
3. **Scan main Agent output**: Identify changes based on file type:
   - **Code files**: New modules → map.json, new types/interfaces → dictionary.json, new error handling → error_codes.json, new env vars → env_registry.json
   - **UI code**: New colors/fonts/components → design_tokens.json, new routes/screens → ui_context.md
   - **Data code**: New models/fields → data_snapshot.json
   - **API code**: New endpoints → api_snapshot.json
   - **CLI code**: New commands → command_api.json
   - **Lib code**: New exports → public_api.json
4. **Boundary check**: Do not register framework concepts (scripts, scaffold, roadmap, plan, etc.); sync only project business domain content
5. **Deduplication**: Compare with existing entries, avoid duplicate registration
6. **Incremental sync**: Append/modify only, do not delete existing entries
7. **Output change Diff**

### Hard Boundaries

- **No direct append** — Must check existing content boundary before write, avoid duplicates or conflicts
- **No framework concept registration** — Sync only project business domain content
- **No modify `00_system.md`** — This Skill enforces rules, does not define them

### Output Format

```
### Data Sync Results

ADDED:
- dictionary.json: entities += [new entity names]
- error_codes.json: businessErrors += [ERR_CODE]

MODIFIED:
- data_snapshot.json: models.User += [new fields]

NO CHANGE:
- [files with no sync needed]

**Summary**: X files changed / Y added / Z modified
```

When no sync needed: `### Data Sync Results — NO CHANGES`

---

> **Intermediate output**: This Skill is a review subprogram; after producing change Diff, control returns to caller.

## Output Verification

□ Target global JSON files updated (dictionary.json / error_codes.json / data_snapshot.json / etc.)
□ Diff output generated with ADDED/MODIFIED/NO CHANGE sections

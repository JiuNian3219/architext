---
name: archi-data-sync
description: Sync data governance files with protocol outputs. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called via `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` in `/archi.*` protocols.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only downgrade to inline Skill when no subagent.
- **Boundary**: Only return protocol-required structured artifacts, subsequent write, confirm and signoff handled by calling protocol.


# Data Governance Sync Executor

## Sync Matrix

| File | Sync Content | Trigger Condition |
|:---|:---|:---|
| `map.json` | `directoryMapping` / `logicalTopology` / `featureRelations` | New code module or directory |
| `dictionary.json` | New business entity / action / shared tool / public component | Output has unregistered business term or tool |
| `error_codes.json` | New business error code | Output has unregistered error scenario |
| `env_registry.json` | New environment variable | Output introduces new `process.env.X` |
[[WHEN: ui | | ui | `design_tokens.json` | New color / font / spacing / motion | Output has new style definition | ]]
[[WHEN: ui | | ui | `ui_context.md` | Screen index change | Output has new / modified screen | ]]
[[WHEN: data | | data | `data_snapshot.json` | Schema new / field extension | Output has data model change | ]]
[[WHEN: api | | api | `api_snapshot.json` | New HTTP/RPC endpoint | Output has new endpoint | ]]
[[WHEN: cli | | cli | `command_api.json` | New CLI command | Output has new command registration | ]]
[[WHEN: lib | | lib | `public_api.json` | New public export | Output has new export API | ]]

## Execution Protocol

1. Load corresponding `global_files` per `project_features` (fixed four + feature matches)
2. Scan each item in `agent_output`, route to matrix-corresponding result bucket by `type`
3. For each change:
   - Compare against existing entries for dedup; exact duplicate → skip; partial duplicate → merge
   - Pass "boundary check": Hit framework concept blacklist → skip and mark `SKIPPED (framework)` in Diff
   - Removed entries not deleted, only record MODIFIED
4. Summarize into `writes`, each item has `file` / `op` (`append` / `merge`) / `path` (JSON path) / `value`
5. Output Diff + `writes`

## Hard Boundaries

- Do not register framework concepts: `scripts` / `scaffold` / `roadmap` / `plan` / `protocol` / `skill` / `architext.*` etc Architext's own concepts not in project global files
- Do not modify `00_system.md`: This skill is rule executor, not rule maker
- Do not delete: Only append / merge; removed entries handled by `/archi.remove` cleanup path

## Output Format

```
### Data Sync Results
ADDED:
- <file>: <path> += <value summary>
MODIFIED:
- <file>: <path> extended <new field summary>
SKIPPED:
- <file>: <path> — <skip reason (duplicate / framework)>
Summary: <X> files changed / <Y> added / <Z> modified / <W> skipped
writes:
  - file: <file>
    op: <append|merge>
    path: <JSON path>
    value: <specific value>
```
No changes only output: `### Data Sync Results — NO CHANGES`

## Output Verification

- [ ] Diff block corresponds 1:1 with `writes` array entries, counts match
- [ ] Each change went through dedup check, no duplicate entries in `writes`
- [ ] Framework concept entries all in `SKIPPED` not `ADDED`
- [ ] `writes` `op` only `append` / `merge`, no `delete`
- [ ] Feature-triggered files only appear in `writes` when matching `project_features`
- [ ] `00_system.md` not in `writes`
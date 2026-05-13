# Invocation Contract

[[SUBAGENT: archi-data-sync | context: Scan code/doc changes for new business entities/error codes/Schema/endpoints/commands/exports and stable featureRelations coupling, incrementally sync global JSON per 00_system.md data governance rules]]
[[NO-SUBAGENT: archi-data-sync | context: Scan code/doc changes for new business entities/error codes/Schema/endpoints/commands/exports and stable featureRelations coupling, incrementally sync global JSON per 00_system.md data governance rules]]
[[NO-SKILL: (Please read [[__DOCS_DIR__]]/skills/archi-data-sync/SKILL.md, and execute sync in current context per its protocol)]]

# Invocation Timing

| Sub-protocol | Invocation Location |
|---|---|
| fix | step_5_data_sync — After fix code, before Verify |
| edit | step_5_data_sync — After docs and plan update, before Verify |
| revise | step_5_data_sync — After Phase 1 (global assets) + Phase 2 (Task cascade) executed, before Verify |

# Data Governance Coverage (inside archi-data-sync skill)

- map.json — directoryMapping / logicalTopology / featureRelations source/targets (when code/doc changes create stable coupling)
- dictionary.json — New/renamed entities, terms, components
- error_codes.json — New/adjusted error code contracts
- env_registry.json — New/removed environment variables
[[WHEN: ui | - design_tokens.json — New colors/fonts/spacing/animations ]]
[[WHEN: ui | - ui_context.md — Screen index changes ]]
[[WHEN: data | - data_snapshot.json — Schema model changes ]]
[[WHEN: api | - api_snapshot.json — Endpoint contract changes ]]
[[WHEN: cli | - command_api.json — CLI command changes ]]
[[WHEN: lib | - public_api.json — Library export changes ]]

# Output Contract

- After sync complete, output MODIFIED: <file> — <add/delete/modify summary> for each modified JSON.
- When no changes, output INFO: data-sync scan passed, no update needed.

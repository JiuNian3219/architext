## Terminal Gate (Do not skip)
Run `npx archi task --check` + `npx archi render`, both must pass.

## Pre-signoff Checklist
After Gate passes, verify item by item before output:

### General Items
□ `vision.md` — All placeholders replaced, no template example text remaining; code-inferred content (if any) marked `(AI Augmented — suggest user review)`
□ Rules file `tech_stack` — Sections 1-9 completely filled
□ Rules file `tech_stack` Section 9 Project Conventions — Each item has Strategy + Rationale
□ Rules file `90_custom_rules` — Rule content collected
□ `roadmap.json` — Task chain generated (has brief_data → phase-1/2 decomposed by archi-decompose-roadmap; has code_analysis → phase-0 each feature module corresponds to one LEG-xx status=done, tag=Legacy)
□ `map.json` — directoryMapping filled; logicalTopology + criticalUserJourneys + featureRelations all filled when source is code
□ `dictionary.json` — Domain terms extracted
□ `error_codes.json` — Core error codes registered
□ `env_registry.json` — Environment variables registered
□ Silent Audit Skill executed, all CRITICAL issues fixed
[[WHEN: ui | □ `design_tokens.json` — Generated ]]
[[WHEN: ui | □ `ui_context.md` — Screen planning generated (S-01, S-02...) ]]
[[WHEN: data | □ `data_snapshot.json` — Initial entity skeleton written ]]
[[WHEN: api | □ `api_snapshot.json` — Initial API endpoints registered ]]
[[WHEN: cli | □ `command_api.json` — Initial CLI commands registered ]]
[[WHEN: lib | □ `public_api.json` — Initial library exports registered ]]

## Post-Write Actions

After all checklist items pass, run `npx archi task` to output task progress overview.
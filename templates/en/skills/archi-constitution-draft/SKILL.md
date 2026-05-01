---
name: archi-constitution-draft
description: Generate Architext constitution files during /archi.init. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
allowed-tools: Read, Write, Edit
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called via `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` in `/archi.*` protocols.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only downgrade to inline Skill when no subagent.
- **Boundary**: Only return protocol-required structured artifacts, subsequent write, confirm and signoff handled by calling protocol.


## Design Principles

1. **Self-Contained Rules**: Data source matrix and generation rules embedded in this SKILL.md's step_1_data_source, as single source of truth
2. **Two-Phase Generation**: First generate all file content in memory → Unified write; generation phase failure does not write any file
3. **Summary Only**: Do not report reasoning details during generation to main agent, only return write list, AI completion items, ambiguity items
4. **Conditional Generation**: Specific files not matching feature_tags (e.g. non-ui project doesn't generate design_tokens.json) skip directly

## Execution Phases

### step_1_data_source Data Source and Rules

**Context Prerequisites**:
- `brief_data` (optional, archi-brief-scan output)
- `code_analysis` (optional, archi-code-survey output)
- `feature_tags` (architext.json, always present)

Execute per matrix three columns below based on current data combination.

**General Rules**:
1. No template placeholders — All example text must be replaced
2. AI completion must mark `(AI Recommended — suggest user review)` + reason
3. Priority: User filled > Brief determined > Code facts > AI recommended; when higher priority exists, do not override lower
4. feature_tags conditional generation: Only generate specific files matching this project's feature_tags

**Data Source Matrix**:

| Target File | When has brief_data | When has code_analysis | When both |
|:---|:---|:---|:---|
| `vision.md` | brief_data.identity / targetUsers / successMetrics / boundaries / references | README + project config inference (mark low confidence) | Brief priority, code fills missing fields |
| Rules file `tech_stack` | brief_data.techStack (filled items directly; empty items AI recommended) | Dependency list + config files + code pattern recognition | Brief determined > Code facts > AI recommended |
| `tech_stack` Section 9 | Generate default strategy by feature_tags (see §3) | Recognize existing error handling/data flow patterns from code | Code facts priority (existing conventions must be respected) |
| Rules file `90_custom_rules` | Rule content from brief_data.supplementaryNotes | eslint/prettier/editorconfig + team conventions recognized from code | Merge (dedupe, mark conflicts) |
| `roadmap.json` | brief_data.coreTasks → phase-1/2 (call archi-decompose-roadmap) | Code feature modules → phase-0 LEG-xx (status=done, tag=Legacy) | phase-0 from code, phase-1/2 from Brief |
| `dictionary.json` | brief_data full text term extraction | Code naming + comment extraction | Merge dedupe |
| `error_codes.json` | Pre-define core error codes by coreTasks | Extract from throw/Error definitions in code | Code facts priority |
| `env_registry.json` | Environment variables implied by brief_data.techStack | `process.env` / `os.Getenv` / `os.environ` references in code | Code facts priority |
| `map.json` | techStack architecture pattern pre-register directory skeleton; logicalTopology/journeys empty | Actual directories + import chains + user journeys | Code facts priority (map is essentially fact recording) |

[[WHEN: ui | | `design_tokens.json` | brief_data.styleTone + tagged_assets[competitor-ref/brand-guide] | CSS variables / theme config extraction | Brief priority (style is design decision) | ]]
[[WHEN: ui | | `ui_context.md` | coreTasks split screens by user journey | Route config / page component extraction | Code facts priority (existing screens not re-numbered) | ]]
[[WHEN: data | | `data_snapshot.json` | brief_data.dataModel + tagged_assets[Schema] | Schema / Migration / ORM models | Code facts priority | ]]
[[WHEN: api | | `api_snapshot.json` | brief_data.existingAPI + tagged_assets[API-doc] | Route/controller code | Code facts priority | ]]
[[WHEN: cli | | `command_api.json` | Command descriptions in coreTasks | CLI entry code | Code facts priority | ]]
[[WHEN: lib | | `public_api.json` | Export descriptions in coreTasks | package.json exports / entry files | Code facts priority | ]]

**§1 vision.md**: Required Core Vision / Target Audience / Boundaries / Design & Experience / Product Principles / Context. Select column per matrix; fields Brief doesn't provide leave empty and note "Brief not provided"; low confidence items inferred from code mark `(AI Augmented — suggest user review)`.

**§2 tech_stack**: Sections 1-8 per matrix (Brief determined > Code facts > AI recommended; when AI recommending prioritize docs-mature/type-complete/low-hallucination-risk tech). Section 9 see §3.

**§3 Section 9 Project Conventions Default Strategy**:

[[WHEN: ui | - Error Handling: Fail Fast + Form Validation ]]
[[WHEN: cli | - Error Handling: Fail Fast (stderr) ]]
[[WHEN: api | - Error Handling: Schema Validation + Fail Fast ]]
[[WHEN: lib | - Error Handling: Typed Error Export + No Throw in Hot Path ]]
[[WHEN: ui | - Data Flow: Brief doesn't mention push/subscribe/collaboration → Standard Request; mentions realtime → Realtime (WebSocket/SSE) ]]
[[WHEN: ui | - Auth & Access: Single role → Authenticated; multi-role → RBAC; no description → Leave empty mark "Decide at Plan phase" ]]
[[WHEN: api | - Auth & Access: Single role → Authenticated; multi-role → RBAC; no description → Leave empty mark "Decide at Plan phase" ]]

Each item must have Strategy/Default + Rationale filled, do not omit Rationale. When has code_analysis and code already has clear patterns, record as-is directly, do not apply default strategy (code facts priority).

**§4 roadmap.json**:

[[INCLUDE: shared/roadmap-structure.md]]

- Has brief_data: phase-0 remains empty array; phase-1/2 decomposition:
  [[SUBAGENT: archi-decompose-roadmap | brief_data.coreTasks + ui_context (if ui project) ]]
  [[NO-SUBAGENT: archi-decompose-roadmap | brief_data.coreTasks + ui_context (if ui project) ]]
  [[NO-SKILL: Read skills/archi-decompose-roadmap/SKILL.md and execute per its protocol, input brief_data.coreTasks + ui_context (if ui project), produce phase-1/2 tasks ]]
- Has code_analysis: Each code feature module → phase-0 LEG-xx (status=done, tag=Legacy, goal="One sentence summary. See tasks/LEG-xx_<Slug>/spec.md", deps from import chain inference); each LEG synchronously generates Stub spec (see §5); shared/infrastructure code doesn't go into roadmap, only into map.json directoryMapping
- Both: Process per above two rules separately. When new task touches LEG module, reference in deps.

**§5 Stub Spec** (Only when has code_analysis): Each LEG-xx generates `[[__DOCS_DIR__]]/tasks/LEG-xx_<Slug>/spec.md`:

[[INCLUDE: shared/leg-stub-template.md]]

Stub is starting point not end state. Signoff phase must output Stub coverage report, recommend user run `/archi.change <ID>` for core modules.

**§6 map.json**: Fields directoryMapping / logicalTopology / criticalUserJourneys / featureRelations.
- Has brief_data: directoryMapping pre-registers core directory skeleton per tech_stack architecture pattern; other fields empty; new tasks fill when /archi.plan executes
- Has code_analysis: All fields filled from code analysis results. featureRelations recognition: If module A iterates/enumerates/dynamically loads same-type modules X1/X2/X3, or description is "aggregate/list/register all X", mark A as aggregator, X* as sources; evidence records code snippet triggering recognition (file:line); checkNote: "When adding new same-type source, need to sync update A"
- Both: Use code_analysis rules as primary; directories Brief mentions but code doesn't implement mark in directoryMapping as `(reserved — Brief planned)`

[[WHEN: ui |
**§7 ui_context.md**:

[[INCLUDE: shared/ui-context-format.md]]

- Has brief_data: Split screens from coreTasks by user journey (S-01, S-02, ...); screen IDs are permanent
- Has code_analysis: Extract screens from route config/page components (Next.js app/pages, Vue Router, React Router etc); each route → one screen; preserve existing naming in code
- Both: Existing screens in code take precedence (preserve status); screens Brief describes but code doesn't implement are appended (mark `status: planned`)
]]

**§8 Other Global Documents**: Unconditionally generate `dictionary.json` / `error_codes.json` / `env_registry.json`.

### step_2 Memory Generation

Generate all constitution file content that should exist into memory (not write to disk) per matrix and §1-§9 rules in step_1.

For each generated file record:
- path: Path relative to docsDir
- content: Complete content
- aiAugmented: Fields marked (AI Recommended / AI Augmented) in that file and reasons
- ambiguities: Ambiguity items in that file (if needed)

### step_3 Unified Write

1. Ensure parent directories exist
2. Write to docsDir/global/ one file at a time
3. Any write failure → Stop immediately, report written file list

### step_4 Return

Return writtenFiles + aiAugmentedFields + ambiguities + renderCommand per call contract. renderCommand only as return field handed over, this skill does not execute.

## Output Contract

```
{
  writtenFiles:      [{ path, type: "vision|tech_stack|roadmap|...", size }],
  aiAugmentedFields: [{ file, field, value, rationale }],
  ambiguities:       [{ file, field, description, options? }],
  renderCommand:     "npx archi render"
}
```

Side effects: Write all constitution files to `docsDir/global/`.
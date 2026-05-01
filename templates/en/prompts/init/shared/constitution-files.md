<shared_constitution_files>
**Purpose**: Constitution file generation rules. Variables available in context (prepared by caller, not passed via INCLUDE parameters):
- `brief_data` (optional): archi-brief-scan output
- `code_analysis` (optional): archi-code-survey output
- `feature_tags`: Project feature tag set (from architext.json)

AI automatically selects column based on currently available data:
- Only brief_data → Use "when has brief_data" column
- Only code_analysis → Use "when has code_analysis" column
- Both → Use "when both" column

## General Rules

1. **No Template Placeholders**: All example text must be replaced
2. **AI Augmentation Marking**: Content without data source must be marked `(AI Recommended — suggest user review)` + reason
3. **Priority**: User filled > Brief determined > Code facts > AI recommended; when higher priority exists, do not override lower
4. **feature_tags Conditional Generation**: Only generate feature-specific files matching this project's feature_tags; inapplicable specific files must not be generated

## Data Source Matrix

Field sources for each constitution file:

| Target File | When has brief_data | When has code_analysis | When both |
|:---|:---|:---|:---|
| `vision.md` | brief_data.identity / targetUsers / successMetrics / boundaries / references | README + project config inference (mark low confidence) | Brief priority, code fills missing fields |
| Rules file `tech_stack` | brief_data.techStack (filled items directly; empty items AI recommended) | Dependency list + config files + code pattern recognition | Brief determined > Code facts > AI recommended |
| `tech_stack` Section 9 Project Conventions | Generate default strategy by feature_tags (see §3) | Recognize existing error handling/data flow patterns from code | Code facts priority (existing conventions must be respected) |
| Rules file `90_custom_rules` | Rule content from brief_data.supplementaryNotes | eslint/prettier/editorconfig + team conventions recognized from code | Merge (dedupe, mark conflicts) |
| `roadmap.json` | brief_data.coreTasks → phase-1/2 (call archi-decompose-roadmap Skill) | Code feature modules → phase-0 LEG-xx (status=done, tag=Legacy) | phase-0 from code, phase-1/2 from Brief |
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

## §1 vision.md Generation Rules

Required fields (under any data source):
- Core Vision, Target Audience, Boundaries, Design & Experience, Product Principles, Context

Select matching column from data source matrix for mapping; fields Brief doesn't provide leave empty and note "Brief not provided"; low confidence items inferred from code mark `(AI Augmented — suggest user review)`.

## §2 tech_stack Generation Rules

Required Sections 1-9 (complete list see template).

**Section 1-8 Data Sources**:
- Has brief_data: brief_data.techStack filled items directly written; empty items AI recommended + mark `(AI Recommended)` + reason; when recommending prioritize AI-friendly tech (mature docs/complete types/low hallucination risk)
- Has code_analysis: Infer from dependency list / lock files / config files / actual code patterns
- Both: Brief determined > Code facts > AI recommended

**Section 9 Project Conventions** (see §3)

## §3 Section 9 Project Conventions Default Strategy

[[WHEN: ui | - **Error Handling**: Fail Fast + Form Validation ]]
[[WHEN: cli | - **Error Handling**: Fail Fast (stderr) ]]
[[WHEN: api | - **Error Handling**: Schema Validation + Fail Fast ]]
[[WHEN: lib | - **Error Handling**: Typed Error Export + No Throw in Hot Path ]]
[[WHEN: ui | - **Data Flow**: Brief doesn't mention push/subscribe/collaboration → Standard Request; Brief mentions realtime → Realtime (WebSocket/SSE) ]]
[[WHEN: ui | - **Auth & Access** (UI): Single role → Authenticated; multi-role → RBAC; no auth description → Leave empty, mark "Decide at Plan phase" ]]
[[WHEN: api | - **Auth & Access** (API): Single role → Authenticated; multi-role → RBAC; no auth description → Leave empty, mark "Decide at Plan phase" ]]

Each item must have Strategy/Default + Rationale filled, do not omit Rationale.

**Override rule when has code_analysis**: If code already has clear error handling/auth patterns, record as-is directly, do not apply default strategy (code facts priority).

## §4 roadmap.json Generation Rules

**Structure**:

```
{
  "version": 1,
  "projectStatus": "active",
  "lastUpdated": "<date>",
  "phases": [
    { "id": "phase-0", "name": "Legacy", "tasks": [ ] },
    { "id": "phase-1", "name": "Infrastructure", "tasks": [ ] },
    { "id": "phase-2", "name": "Core Features", "tasks": [ ] }
  ]
}
```

**Has brief_data**:
- phase-0 remains empty array
- phase-1/2 call `archi-decompose-roadmap` Skill, input brief_data.coreTasks + ui_context (if ui)

**Has code_analysis**:
- Each code feature module → one LEG-xx in phase-0: status=done, tag=Legacy, goal="One sentence summary. See tasks/LEG-xx_<Slug>/spec.md", deps=LEG dependencies inferred from import chains
- phase-1/2 remain empty skeleton
- Each LEG synchronously generates Stub spec (see §5)
- Shared/infrastructure code does not go into roadmap, only into map.json directoryMapping

**Both**: Process per above two rules. Dependencies between LEG and new tasks: if new task touches a LEG module, reference in deps.

## §5 Stub Spec Generation Rules

Only executed when has code_analysis. For each LEG-xx, generate `[[__DOCS_DIR__]]/tasks/LEG-xx_<Slug>/spec.md`:

```
# LEG-xx: [Title]
> **Spec-Status**: Stub
> **Source**: Reverse analyzed from [source path]

## Overview
[One paragraph description (≤3 sentences)]

## Key Flows
1. **[Flow name]**: [A] → [B] → [C]

## Associated Files
- [Role]: `[path]`
- [Role]: `[path]`
```

> Stub is starting point not end state. Signoff phase must output Stub coverage report, recommend user run /archi.change for core modules.

## §6 map.json Generation Rules

Unified fields:
- `directoryMapping`: Each core directory → { path, layer, responsibility, publicAPI }
- `logicalTopology`: Inter-module dependencies → { from, to, type: "imports" | "calls" | "extends" }
- `criticalUserJourneys`: Core flows → { name, steps: [...] }
- `featureRelations`: Aggregator-type module relations → { aggregator, sources, evidence, checkNote }

**Has brief_data**: `directoryMapping` pre-registers core directory skeleton per tech_stack architecture pattern; other fields empty; new tasks filled when /archi.plan executes.

**Has code_analysis**: All fields filled from code actual analysis results. `featureRelations` recognition rule: If module A iterates/enumerates/dynamically loads same-type modules X1/X2/X3, or its description is "aggregate/list/register all X", mark A as aggregator, X* as sources; evidence records code snippet triggering recognition (file:line); checkNote: "When adding new same-type source, need to sync update A".

**Both**: Use code_analysis rules as primary; directories Brief mentions but code doesn't implement, mark in directoryMapping as `(reserved — Brief planned)`.

[[WHEN: ui |
## §7 ui_context.md Generation Rules

[[INCLUDE: shared/ui-context-format.md]]

**Has brief_data**: Split screens from brief_data.coreTasks by user journey (S-01, S-02, ...); each screen corresponds to a core interaction scenario; screen IDs are permanent.

**Has code_analysis**: Extract screens from route config / page components (Next.js app/pages, Vue Router, React Router etc); each route → one screen; preserve existing naming in code.

**Both**: Existing screens in code take precedence (preserve status); screens Brief describes but code doesn't implement are appended (mark `status: planned`).
]]

## §8 Other Global Documents

Unconditionally generate:
- `dictionary.json`
- `error_codes.json`
- `env_registry.json`

Generate applicable specific files per this project's feature_tags; inapplicable specific files must not be generated.

## §9 Post-Write Actions

1. All files written
2. Run `npx archi render` to generate visual views
3. Return control to caller (caller responsible for entering step_verify)
</shared_constitution_files>
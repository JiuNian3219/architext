---
name: archi-context-fetch
description: Fetch minimal Architext documentation context after an Intent Card. Must run in isolated context/subagent when available. Auto-invoked by 00_system Front Pipeline.
---

## Invocation

- **Auto-invoke**: Yes, called by `00_system.md` Front Pipeline.
- **Trigger location**: Before user request enters protocol routing.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only fallback to `NO-SUBAGENT` / `NO-SKILL` inline execution when no subagent.
- **Boundary**: Only produce structured intermediate artifacts, does not execute protocols, does not modify project files.

# Architext Context Fetch

## Purpose

Read minimally necessary Architext documents based on `Intent Card`, produce structured `Context Pack`. This Skill is "librarian", only responsible for finding files, extracting facts, marking gaps; **does not read product source code, does not modify files, does not execute commands, does not make final decisions for protocol**.

## Inputs

- `intent_card`: archi-intent-normalizer output.
- `protocol_hint`: Protocol about to load, e.g. `/archi.change` or `change/edit`.
- `known_state`: Lightweight state known to caller, e.g. project features, task id, current discussion file.
- `available_files`: Optional. Architext file list already discovered by caller.

## Output Contract

Only output one JSON code block, no explanatory body text.

```json
{
  "context_pack_version": 1,
  "for_intent": "change.edit",
  "target": {
    "task_id": null,
    "task_dir": null,
    "files": [],
    "refs": []
  },
  "must_read": [],
  "optional_read": [],
  "already_read": [],
  "relevant_facts": [
    {
      "source": "global/roadmap.json",
      "fact": "<fact directly usable for execution>",
      "confidence": 0.0
    }
  ],
  "missing_or_stale": [],
  "risk_flags": [],
  "do_not_read": [],
  "next_context_action": "<continue loading protocol / ask first / fill gap first>"
}
```

## Read Budget

1. Read index-type files first, then target files.
2. Large files only extract sections relevant to current Intent, preserve path or section name in `source`.
3. `refs/` only hit via `refs/index.json` by tags / source / id; do not full-scan.
4. `screens/` only return relevant screen file paths and purposes; do not read all screen source code.
5. Product source code is not in this Skill's scope. When source code needed, write to `risk_flags` or `next_context_action` in Context Pack, let subsequent protocol read.

## Global Guides

Global guide only covers structured JSON files, does not cover `vision.md` / `tech_stack.md` etc body documents.

| Global file | Guide |
|:---|:---|
| `global/roadmap.json` | `global/guides/roadmap.md` |
| `global/map.json` | `global/guides/map.md` |
| `global/dictionary.json` | `global/guides/dictionary.md` |
| `global/error_codes.json` | `global/guides/error_codes.md` |
| `global/env_registry.json` | `global/guides/env_registry.md` |
| `global/error_memory.json` | `global/guides/error_memory.md` |
| `global/api_snapshot.json` | `global/guides/api_snapshot.md` |
| `global/command_api.json` | `global/guides/command_api.md` |
| `global/data_snapshot.json` | `global/guides/data_snapshot.md` |
| `global/design_tokens.json` | `global/guides/design_tokens.md` |
| `global/public_api.json` | `global/guides/public_api.md` |

Rules:
- When subsequent protocol writes some global JSON, corresponding guide must enter `must_read`.
- When only reading global JSON, corresponding guide enters `optional_read`.
- `roadmap.json` / `map.json` / `dictionary.json` / `error_memory.json` prone to drift, when reading their guide also enters `must_read`.
- Guide only for field structure and invariants, does not replace global file content.

## Baseline Reads

`init` is a special intent: its purpose is to create or recover global documents, so files just deployed by `npx archi init` must not be treated as project facts.

When `intent_card.command == "/archi.init"` or `for_intent` starts with `init`:
- Do not apply the Baseline Reads below.
- `must_read` only includes routing essentials: Intent Card, pack/brief path from `[args]`, lightweight root file signals (whether package.json/go.mod/Cargo.toml exists), and whether `project-brief.md` exists.
- If initialization state must be checked, only inspect template markers in `global/vision.md` / `global/*.json`; do not extract their body or `_fieldGuide` as `relevant_facts`.
- If `vision.md` contains `architextTemplate: true` / `Status: Template` / `Uninitialized` / `[Project Name]`, put `global/vision.md` and current `global/` seed files (including older `roadmap.json` with `INF-01` / `FEAT-01` example tasks) in `do_not_read` with reason `scaffold_seed_not_project_fact`.
- If any `global/*.json` contains `architextTemplate: true` / `status: "template-uninitialized"` / `lastUpdated == "TEMPLATE"`, also put that file in `do_not_read`.
- Do not output drift, source mismatch, or "cannot understand original content" judgments based on seed roadmap / seed vision / seed json.

All non-init, non-normal-Q&A intent at minimum consider:

- `global/roadmap.json`: Match task id, status, dependencies.
- `global/map.json`: Locate modules, featureRelations, directory mappings.
- `global/tech_stack.md`: Technical constraints, test/build commands, prohibited patterns.
- `global/vision.md`: Direction, boundaries, target users.
- `global/error_memory.json`: Historical errors and user correction experience.

Normal explanation, summary, discussion not involving project files can return empty Context Pack.

## Intent-Specific Reads

### plan.decompose

- `global/roadmap.json`
- `global/vision.md`
- `global/map.json`
- `scope-brief.md` or Brief file Intent Card points to
- UI project add `global/ui_context.md`

### plan.detail

- `global/roadmap.json`
- `global/vision.md`
- `global/tech_stack.md`
- `global/map.json`
- Target task directory's `spec.md` / `plan.json` / `ui.md` / `design.md`, read if exist
- Load corresponding global snapshot per feature

### change.fix

- Target task's `spec.md` / `plan.json` / latest `review.md`
- `global/error_memory.json`
- `global/tech_stack.md`
- `global/map.json`
- Only return source code path candidates for subsequent protocol to read, do not read source code

### change.edit

- Target task's `spec.md` / `plan.json` / `ui.md`
- `global/vision.md`
- `global/tech_stack.md`
- `global/dictionary.json`
- `global/error_codes.json`
- Load corresponding global snapshot per feature

### change.revise

- `global/vision.md`
- `global/tech_stack.md`
- `global/roadmap.json`
- `global/map.json`
- `global/dictionary.json`
- `global/error_codes.json`
- `global/env_registry.json`
- Load corresponding global snapshot per feature
- Affected task's spec/plan path list; only deep-read high-relevance tasks

### code

- Target task's `spec.md` / `plan.json` / `ui.md` / `design.md`
- `global/tech_stack.md`
- `global/map.json`
- `global/dictionary.json`
- `global/error_codes.json`
- `global/env_registry.json`
- Load corresponding global snapshot per feature
- `refs/index.json`, only return refs hitting tags

### review

- task review: Target task docs + `global/map.json` + `global/tech_stack.md`
- project review: Global index files + roadmap overview + map overview
- map review: `global/map.json` + roadmap overview; source directory scan executed by review/map protocol

### remove

- `global/roadmap.json`
- `global/map.json`
- Target task directory
- `global/dictionary.json`
- `global/error_codes.json`
- Load possibly-referencing global snapshots per feature
- Must set `risk_flags`: `delete_requires_confirmation`

### ui

- `global/design_tokens.json`
- `global/ui_context.md`
- `global/roadmap.json`
- Target task's `ui.md` / `spec.md`
- `screens/index.html` only as navigation reference; specific screens read per target

### ref

- `refs/index.json`
- add: Do not full-read refs; check id conflict
- update/remove: Only read target ref file
- update/remove must set `risk_flags`: `overwrite_requires_confirmation` or `delete_requires_confirmation`

### help

- `global/roadmap.json`
- `global/map.json`
- `global/error_memory.json`
- Append files as needed based on user question

## Feature-Specific Snapshots

Only read when project has corresponding feature enabled:

- ui: `global/design_tokens.json`, `global/ui_context.md`, `screens/`
- data: `global/data_snapshot.json`
- api: `global/api_snapshot.json`
- cli: `global/command_api.json`
- lib: `global/public_api.json`

## Missing Or Stale

Write to `missing_or_stale` when:

- Task id Intent Card points to doesn't exist.
- Task status doesn't allow executing target protocol.
- Target task lacks protocol-required files.
- Feature enabled but corresponding global snapshot missing.
- `map.json` cannot find target module or mapping obviously stale.
- `refs/index.json` points to ref file that doesn't exist.

## Risk Flags

Write as needed:

- `needs_user_clarification`
- `delete_requires_confirmation`
- `overwrite_requires_confirmation`
- `dependency_install_requires_confirmation`
- `global_revision`
- `task_blocked`
- `spec_missing`
- `map_stale`
- `error_memory_match`

## Hard Limits

- Do not read all global files, all tasks, all refs or all screens for "completeness".
- Do not treat Context Pack as protocol output; it's only pre-execution context.
- Do not give code modification plans in Context Pack.
- Do not swallow gaps; gaps must go into `missing_or_stale`.

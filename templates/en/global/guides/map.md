# map.json

- `directoryMapping[]`: real source/document directories and their ownership.
- `directoryMapping[].path`: project-relative path.
- `directoryMapping[].layer`: architectural layer.
- `directoryMapping[].responsibility`: what this path owns.
- `directoryMapping[].publicAPI`: exported surface or entry points.
- `logicalTopology[]`: module relationships.
- `logicalTopology[].from/to`: mapped paths or module ids.
- `logicalTopology[].type`: relation type, e.g. imports/calls/extends.
- `criticalUserJourneys[]`: important end-to-end flows.
- `featureRelations[]`: change-coupling index; answers "if source changes, what targets must be checked?"
- `featureRelations[].id`: stable relation id, e.g. `FR-001`.
- `featureRelations[].source`: trigger path, directory, glob, module name, or existing map entry.
- `featureRelations[].targets`: paths, modules, docs, or map entries to check when `source` changes.
- `featureRelations[].checkRule`: short executable sync rule.
- `featureRelations[].evidence`: brief basis such as `file:line`, doc path, or task id.

Examples:
- Command registry source -> command docs/tests targets; check new command registration is reflected everywhere.
- Schema/template source -> guide/tests targets; check field docs and scaffold expectations stay aligned.
- Prompt source -> skill/router targets; check protocol wording and tool invocation remain consistent.

Invariants:
- Mapping must reflect real project paths.
- Update relations when adding/removing linked modules.
- Keep each relation short; do not copy long context into `map.json`.
- Record stable reusable coupling only, not one-off task steps.

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
- `featureRelations[]`: aggregator/source linkage records.

Invariants:
- Mapping must reflect real project paths.
- Update relations when adding/removing linked modules.

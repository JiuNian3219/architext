# data_snapshot.json

- `models[]`: data model registry.
- `models[].name`: canonical model/entity name.
- `models[].fields[]`: field list.
- `fields[].name`: canonical field name.
- `fields[].type`: type or scalar kind.
- `fields[].required`: boolean required flag.
- `relationships[]`: model relationships.

Invariants:
- Field names/types must match planned schema and code.
- Shared models should be extended, not duplicated under synonyms.
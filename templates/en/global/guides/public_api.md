# public_api.json

- `exports[]`: public library export registry.
- `exports[].name`: exported function/class/type name.
- `exports[].signature`: stable TypeScript/API signature.
- `exports[].stability`: stability level.
- `exports[].description`: public behavior summary.
- `exports[].owner`: task id that owns the export.

Invariants:
- Public signature changes require explicit change flow.
- Keep registry aligned with package exports and docs.
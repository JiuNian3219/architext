# roadmap.json

- `version`: schema version.
- `projectStatus`: overall project status.
- `lastUpdated`: ISO date string.
- `tasks[]`: flat roadmap task list.
- `tasks[].id`: stable task id, referenced by deps and commands.
- `tasks[].phase`: `infra | core | polish | platform`.
- `tasks[].title`: task title.
- `tasks[].status`: `pending | active | done | blocked`.
- `tasks[].sourceRef`: optional requirement snapshot ref, e.g. `global/requirements/REQ-20260512-001.md#FEAT-01`.
- `tasks[].deps[]`: existing task ids that must finish first.
- `tasks[].slug`: directory slug for `tasks/<id>_<slug>/`.
- `nfr[]`: non-functional constraints when present.

Invariants:
- `deps[]` only references existing task ids.
- Do not rename existing `id` or `slug`.

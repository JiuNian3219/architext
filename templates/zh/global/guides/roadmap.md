# roadmap.json

- `version`: schema version.
- `projectStatus`: overall project status.
- `lastUpdated`: ISO date string.
- `phases[]`: roadmap phase list.
- `phases[].id`: stable phase id.
- `phases[].name`: display name.
- `phases[].tasks[]`: task list under the phase.
- `tasks[].id`: stable task id, referenced by deps and commands.
- `tasks[].status`: `pending | active | done | blocked`.
- `tasks[].deps[]`: existing task ids that must finish first.
- `tasks[].slug`: directory slug for `tasks/<id>_<slug>/`.
- `nfr[]`: non-functional constraints when present.

Invariants:
- `deps[]` only references existing task ids.
- Do not rename existing `id` or `slug`.

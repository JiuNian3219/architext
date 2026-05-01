```
{
  "version": 1,
  "projectStatus": "active" | "archived" | "paused",
  "lastUpdated": "<ISO date>",
  "phases": [
    { "id": "phase-0", "name": "Legacy",         "tasks": [] },
    { "id": "phase-1", "name": "Infrastructure", "tasks": [] },
    { "id": "phase-2", "name": "Core Features",  "tasks": [] }
  ]
}
```

约定：phase-0 Legacy 仅 inherit 流程有内容；phase-i≥3 按需追加；tasks[] 内部字段由各命令（plan/decompose/edit）扩展。
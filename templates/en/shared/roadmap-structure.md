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

Convention: phase-0 Legacy only has content in inherit flow; phase-i≥3 appended as needed; tasks[] internal fields extended by each command (plan/decompose/edit).
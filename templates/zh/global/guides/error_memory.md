# error_memory.json

- `errorPatterns[]`: reusable runtime/build/test failure lessons.
- `errorPatterns[].id`: stable lesson id.
- `errorPatterns[].matchWhen`: keywords or symptoms.
- `errorPatterns[].cause`: root cause.
- `errorPatterns[].solution`: proven fix.
- `errorPatterns[].lesson`: short future reminder.
- `checkpoints[]`: pre-action reminders from past mistakes.
- `checkpoints[].before`: situation to watch.
- `checkpoints[].check`: action to take before proceeding.

Invariants:
- Add reusable AI/user correction lessons, not one-off noise.
- Keep paths project-relative and non-sensitive.

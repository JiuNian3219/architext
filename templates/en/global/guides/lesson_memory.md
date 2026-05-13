# lesson_memory.json

- `lessons[]`: reusable lessons from runtime/build/test failures, user corrections, wrong assumptions, or process mistakes.
- `lessons[].id`: stable lesson id.
- `lessons[].matchWhen`: keywords, symptoms, or user corrections that trigger this lesson.
- `lessons[].cause`: root cause or repeated mistake.
- `lessons[].solution`: reusable fix or behavioral adjustment.
- `lessons[].lesson`: short future reminder.
- `checkpoints[]`: pre-action reminders from past lessons.
- `checkpoints[].before`: situation to watch.
- `checkpoints[].check`: action to take before proceeding.

Invariants:
- Add reusable lessons, not one-off noise or a dump of every technical error.
- Keep paths project-relative and non-sensitive.

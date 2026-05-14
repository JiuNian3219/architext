# Phase Naming Convention

| Calling Sub-protocol | Phase Name |
|---|---|
| fix    | Bugfix: <Bug Title> (<Date>) |
| edit   | Edit: <Change Topic> (<Date>) |
| revise | Global Revision: <Revision Topic> (<Date>) |

# Phase Internal Task Format

```json
{
  "id": "<phase-id>.<n>",
  "title": "<Verifiable specific action>",
  "done": false,
  "tests": ["<Corresponding test case or verification point>"]
}
```

`tests` must be written as executable, assertable scenarios, specifying input, action, expected result; prohibit placeholder sentences like "add tests", "run tests", "cover logic" that cannot be verified.

Each Task must be verifiable (has clear done criteria), do not write subjective items without done signals like "optimize X".

# Special Phase Templates

## fix Bugfix Phase Three-Piece Set (Mandatory)

Bugfix Phase must add lightweight root-cause metadata on the phase itself:

```json
"problemCause": {
  "summary": "<why the bug happened; do not describe the fix>",
  "evidence": ["<short references only: file, log id, test name, user report>"],
  "confidence": 0.7
}
```

Do not duplicate spec, logs, reproduction steps, fix strategy, lessons, or affected file lists in `problemCause`.

1. Reproduction Test — Create reproduction test case (Red state)
2. Fix Implementation — Fix code (Green)
3. Regression Test — Regression test suite passes

# Status Transition Rules

After appending Phase, decide whether to reset based on current roadmap.json <ID>.status:

| Current status | Handling after appending Phase |
|---|---|
| pending | Reject (pending should go through plan first, should not trigger change) |
| active  | Keep active, no reset needed |
| done    | Reset to active — Execute npx archi task <ID> --status active, output MODIFIED: roadmap.json <ID>.status done→active |
| blocked | Prompt user "This task is currently blocked, need to unblock dependency first"; force override follows same flow as active |

# Terminal Gate

After appending complete, must run npx archi task --check + npx archi render, no ERROR before entering next step.

# Output Contract

- Output MODIFIED: plan.json — appended <Phase Name> with N tasks.
- If status reset executed, additionally output MODIFIED: roadmap.json <ID>.status done→active.

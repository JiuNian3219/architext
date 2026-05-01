# Issue Classification

| Level | Meaning | Example |
|---|---|---|
| **CRITICAL** | Must fix, blocks release | Logic error, security vulnerability, data corruption risk, Vision hard conflict, Missing spec |
| **WARNING** | Should fix, has risk | Missing error handling, performance hazard, Spec coverage incomplete, Stub spec, Long blocked |
| **INFO** | Suggest optimization | Non-standard naming, missing comments, simplifiable code, minor style issues |

# Issue Format

## Task-Level (with specific line number)

```
[LEVEL] file path:line — dimension name
  Description: Specific issue (one sentence statement)
  Evidence: Code snippet or specific reference (multiple lines if needed)
  -> Recommended fix: /archi.change <ID> <description>
```

## Project-Level (no specific line number)

```
[LEVEL] <scope, e.g. roadmap.json / overall architecture / tasks/FEAT-A> — check item name
  Description: Specific issue
  Evidence: Scan result summary
  -> Recommended fix: /archi.review map (or /archi.change <description>)
```

# Output Contract

- Same finding cannot appear in both CRITICAL and WARNING (classify by highest level).
- INFO level can batch merge (same-type issues in same file merged to one entry), CRITICAL / WARNING must list independently.
- Inapplicable dimensions at runtime if still appear and cannot determine, mark N/A.
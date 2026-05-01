# Report Persistence

## Write Path

| Subprotocol | Path | Write Strategy |
|---|---|---|
| task | `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/review.md` | Overwrite (same Task only keeps latest review) |
| project | `[[__DOCS_DIR__]]/reviews/YYYY-MM-DD.md` | Archive by date (multiple times same day overwrites that day, across days accumulates) |

## Write Semantics

- **Task-level overwrite**: Each /archi.review <ID> re-review overwrites previous review.md. If previous content needs preserving, user must manually backup before review (not this protocol's responsibility).
- **Project-level daily archive**: Multiple /archi.review runs same day overwrites that day's file; across days creates new files. `reviews/` directory long-term accumulation can be used for trend analysis.

## Pre-Write Check

1. Does file path's parent directory exist; if not create.
2. Report content must output **simultaneously** to dialogue window (user visible) and write to file (persist) — Missing either视为execution failure.

# Report Structure

Organize in following order (task / project shared, inapplicable sections directly omitted):

1. **Review/Health Summary** (One-sentence conclusion + Severity finding counts: N CRITICAL / M WARNING / K INFO)
2. **Finding List** (Per issue-classification.md format; CRITICAL → WARNING → INFO order)
3. **Statistics Summary** (Finding counts per dimension/check item)
4. **Fix Ticket Summary** (Command list generated per action-routing.md, directly copy-paste)
5. **Next Steps** (Recommended subsequent commands, with trigger conditions)

# Frontmatter Convention

Report file must have frontmatter:
```
---
type: review | project-review
target: <ID>_<Slug> | project
generatedAt: <ISO 8601 datetime>
findings:
  critical: N
  warning: M
  info: K
---
```
# Format Selection

## Format Selection Rules

| Content Type | Recommended Format | Reason |
|:---|:---|:---|
| Webpage / URL / PDF / Plain text | `.md` | Structured summary, highest AI read efficiency |
| OpenAPI / Swagger spec | `.yaml` | Preserve machine-readable structure, do not convert to .md |
| JSON Schema / Config file | `.json` | Structured data original format optimal |
| Mixed (contains many code examples) | `.md` (with code blocks) | Code blocks preserve syntax + add context |
| User direct paste (pure Markdown) | `.md` | Same format storage, can refine |

## Selection Priority (Match from top to bottom)

1. Content already has strong structure (OpenAPI / Swagger / JSON Schema) → **Preserve original format**
2. Contains ≥ 3 code examples → `.md` with code blocks
3. Free text / Webpage content → `.md` summary
4. Still cannot determine → Fallback `.md` summary + mark `formatHeuristic: fallback` in frontmatter

## Prohibited Items

- ✘ Force convert OpenAPI / JSON Schema to `.md` (structure lost, AI cannot machine consume)
- ✘ Store pure prose as `.json` (semantic mismatch)
- ✘ `.md` without frontmatter (cannot be retrieved by index and plan/code injection logic)
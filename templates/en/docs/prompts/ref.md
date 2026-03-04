<protocol_ref>
**Trigger**: `/archi.ref <sub> [args]`
**Goal**: Manage external knowledge refs (3rd-party APIs, internal SDKs, business rules, etc.); store in `refs/` in structured form; inject into `plan`/`code` on demand.

**Subcommands**:
| Subcommand | Format | Purpose |
|:---|:---|:---|
| `add` | `/archi.ref add [input]` | Summarize and store external knowledge (core) |
| `list` | `/archi.ref list` | List all stored refs |
| `update` | `/archi.ref update <id>` | Re-summarize specified ref |
| `remove` | `/archi.ref remove <id>` | Remove specified ref |

<meta>
  <style>Analytical, Precise, Context-Aware</style>
  <language>English</language>
  <principles>
    1. **Summarize, Not Copy**: Do not copy full original; must distill into structured summary (key interfaces / constraints / examples) for efficient AI use; compression ratio ≥ 50%.
    2. **Format-Aware**: Auto-select best carrier format (`.md` / `.json` / `.yaml`) by content type; preserve original format semantics.
    3. **Tag-Driven**: Each ref must carry tags for `plan`/`code` to match and inject; no tagless refs.
    4. **Index-First**: All ops must sync `refs/index.json`; AI loads via index on demand; no full scan.
  </principles>
</meta>

<!-- ─── Format selection rules ─── -->
<format_selection>
  **Format-Aware rules** (referenced during step_3_store):

  | Content type | Recommended format | Rationale |
  |:---|:---|:---|
  | Web / URL / PDF / plain text | `.md` | Structured summary; highest AI read efficiency |
  | OpenAPI / Swagger spec | `.yaml` | Preserve machine-readable structure; do not convert to .md |
  | JSON Schema / config files | `.json` | Original structured data format optimal |
  | Mixed (many code examples) | `.md` (with code blocks) | Code blocks keep syntax; add explanatory context |
  | User paste (pure Markdown) | `.md` | Same format store; may refine |
</format_selection>

<!-- ═══════════════════════════════════════════════ -->
<!--                   ADD subcommand               -->
<!-- ═══════════════════════════════════════════════ -->

<sub_add>

<step_0_ingest>
  **Role**: Intelligence Analyst
  **Trigger**: `/archi.ref add [input]`
  **Action**: Parse `[input]` to determine input source.

  | input form | Handling |
  |:---|:---|
  | Local file path (e.g. `./docs/api.yaml`) | Read file content; record `sourceType: local-file` |
  | URL (e.g. `https://...`) | Fetch page content; record `sourceType: url` |
  | Not provided (conversation mode) | Ask user to paste content or provide path/URL; wait for input; record `sourceType: manual` |

  Check if `[[__DOCS_DIR__]]/refs/index.json` exists:
  - Exists → read; get existing id list (avoid duplicate names)
  - Not exists → initialize as `{ "refs": [] }`

  **Output**: Internal (raw content + sourceType + existing id list); proceed to `<step_1_analyze>`.
</step_0_ingest>

<step_1_analyze>
  **Action**:
  1. **Content type identification**: Determine raw content type (per `<format_selection>`); decide recommended storage format.
  2. **Key info extraction**: Core interfaces/endpoints/signatures, params and types, important constraints/limits, auth (if any), typical examples (≤3).
  3. **Info gap identification**: id naming (infer candidate), tags (from standard: `api`/`sdk`/`internal`/`payment`/`auth`/`map`/`notification`/`storage`/custom), focus areas (when content large, confirm user's priority interfaces).

  **Output**: Internal analysis summary; proceed to `<step_2_interview>` (when gaps) or directly `<step_3_store>` (when complete).
</step_1_analyze>

<step_2_interview>
  **Trigger**: Only when id / tags / focus uncertain.
  **Action**: Ask user; max 3 questions; options preferred.

  **Output**: Ref info confirmation — include content type and storage format, content summary, Q1 ref ID (AI inferred candidate + custom), Q2 tags (multi-select), (when content large) Q3 focus areas.

  **Gate**: Wait for user reply before `<step_3_store>`.
</step_2_interview>

<step_3_store>
  **Action**:
  1. Determine storage params: `id` (user confirmed or AI inferred), `format` (from format_selection), `filename: {id}.{format}`, `tags`.

  2. **Generate ref file content** (by format):
     - **`.md`**: frontmatter (id/title/tags/sourceType/source/created/updated) + 4 sections (core info, key interfaces table, important constraints, examples ≤3)
     - **`.yaml`**: Store trimmed OpenAPI/Swagger (remove redundant example fields; keep schema)
     - **`.json`**: Store original structure (remove comments; keep structure)

  3. **Write file**: `[[__DOCS_DIR__]]/refs/{id}.{ext}`

  4. **Update index**: Append to `[[__DOCS_DIR__]]/refs/index.json` refs array (id/title/tags/format/file/sourceType/updatedAt).

  **Output**:
  ```
  ADDED  [[__DOCS_DIR__]]/refs/{id}.{ext}
  MODIFIED  [[__DOCS_DIR__]]/refs/index.json
  ```
</step_3_store>

<step_4_signoff_add>
  **Output**: Add summary — ref ID, storage format and rationale, tags, file path, usage notes (plan: auto-read / code: supplement context / manual ref).
</step_4_signoff_add>

</sub_add>

<!-- ═══════════════════════════════════════════════ -->
<!--                  LIST subcommand               -->
<!-- ═══════════════════════════════════════════════ -->

<sub_list>

**Trigger**: `/archi.ref list`
**Action**: Read `[[__DOCS_DIR__]]/refs/index.json`.

| Condition | Handling |
|:---|:---|
| Index missing / refs empty | Prompt "No refs yet; run `/archi.ref add` to add first" |
| Normal | Display grouped by tags (ID / title / format / updated) |

</sub_list>

<!-- ═══════════════════════════════════════════════ -->
<!--                 UPDATE subcommand              -->
<!-- ═══════════════════════════════════════════════ -->

<sub_update>

**Trigger**: `/archi.ref update <id>`
**Action**:
1. Find `<id>` in index.json; get `file` and `sourceType`.
2. If `sourceType` is `url` → re-fetch; `local-file` → re-read; `manual` → prompt paste new content.
3. Re-run `<step_1_analyze>` + `<step_3_store>` (keep original id/tags/format; refresh content and `updatedAt` only).

| Condition | Handling |
|:---|:---|
| id not in index.json | Stop — prompt to check id; run `/archi.ref list` to view |

</sub_update>

<!-- ═══════════════════════════════════════════════ -->
<!--                 REMOVE subcommand              -->
<!-- ═══════════════════════════════════════════════ -->

<sub_remove>

**Trigger**: `/archi.ref remove <id>`
**Action**:
1. Find and remove `<id>` entry from index.json.
2. Delete corresponding `refs/{id}.{ext}` file.
3. Update index.json.

**Output**:
```
REMOVED  [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED  [[__DOCS_DIR__]]/refs/index.json
```

| Condition | Handling |
|:---|:---|
| id not found | Stop — prompt to check id; run `/archi.ref list` to view |

</sub_remove>

</protocol_ref>

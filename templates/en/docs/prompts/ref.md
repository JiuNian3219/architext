<protocol_ref>
**Trigger**: `/archi.ref <sub> [args]`
**Goal**: Manage external knowledge references (third-party APIs, internal SDKs, business rules, etc.), store them in `refs/` in a structured way, and inject context into `plan`/`code` on demand.

**Subcommands**:
| Subcommand | Format | Purpose |
|:---|:---|:---|
| `add` | `/archi.ref add [input]` | Summarize and store external knowledge (core) |
| `list` | `/archi.ref list` | List all stored references |
| `update` | `/archi.ref update <id>` | Re-summarize a specified reference |
| `remove` | `/archi.ref remove <id>` | Remove a specified reference |

<meta>
  <style>Analytical, Precise, Context-Aware</style>
  <language>English</language>
  <principles>
    1. **Summarize, Not Copy**: Do not copy full original content; distill into structured summaries (key interfaces / constraints / examples) for efficient AI use, compression ratio ≥ 50%.
    2. **Format-Aware**: Choose the most suitable carrier format (`.md` / `.json` / `.yaml`) based on content type, preserving semantic advantages of the original format.
    3. **Tag-Driven**: Each ref must carry tags for `plan`/`code` to match and inject on demand; no tagless references allowed.
    4. **Index-First**: All operations must sync with `refs/index.json`; AI loads on demand via index, no full scan.
  </principles>
</meta>

<!-- ─── Format selection rules ─── -->
<format_selection>
  **Format-Aware rules** (referenced during step_3_store):

  | Content type | Recommended format | Rationale |
  |:---|:---|:---|
  | Web page / URL / PDF / plain text | `.md` | Structured summary, highest AI read efficiency |
  | OpenAPI / Swagger spec | `.yaml` | Preserve machine-readable structure; do not convert to .md |
  | JSON Schema / config files | `.json` | Original structured data format is optimal |
  | Mixed (with many code examples) | `.md` (with code blocks) | Preserve syntax in code blocks, add explanatory context |
  | User pasted (pure Markdown) | `.md` | Store in same format, may refine |
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
  | Local file path (e.g. `./docs/api.yaml`) | Read file content, record `sourceType: local-file` |
  | URL (e.g. `https://...`) | Fetch page content, record `sourceType: url` |
  | Not provided (conversation mode) | Ask user to paste content or provide path/URL, wait for input, record `sourceType: manual` |

  Check if `[[__DOCS_DIR__]]/refs/index.json` exists:
  - Exists → Read, get existing id list (avoid duplicate names)
  - Not exists → Initialize as `{ "refs": [] }`

  **Output**: Internal (raw content + sourceType + existing id list), proceed to `<step_1_analyze>`.
</step_0_ingest>

<step_1_analyze>
  **Role**: System Analyst
  **Action**:
  1. **Content type identification**: Determine which type the raw content belongs to (see `<format_selection>`), decide recommended storage format.
  2. **Key info extraction**: From content extract:
     - Core interfaces/endpoints/function signatures
     - Parameter list and types (input/output)
     - Important constraints, limits, caveats
     - Auth/authorization (if any)
     - Typical usage examples (≤ 3)
  3. **Info gap identification**:
     - id naming (infer a candidate, e.g. `wechat-pay`, pending user confirmation)
     - tags (infer from standard tags: `api` / `sdk` / `internal` / `payment` / `auth` / `map` / `notification` / `storage` / custom)
     - Focus areas (if content is large, confirm which interfaces/features user cares about)

  **Output**: Internal analysis summary, proceed to `<step_2_interview>` (if gaps) or directly `<step_3_store>` (if complete).
</step_1_analyze>

<step_2_interview>
  **Role**: Product Consultant
  **Trigger**: Execute only when id / tags / focus is uncertain.
  **Action**: Ask user questions, max 3 questions, prefer multiple choice.

  **Output format**:
  ```
  ### Reference info confirmation

  **Content type**: [identified] → will store as [.md / .yaml / .json]
  **Content summary**: [one-sentence description of raw content]

  **Q1 — Reference ID** (for file naming and reference):
  [A] [AI-inferred candidate] (recommended)
  [B] Custom

  **Q2 — Tags** (multi-select):
  [A] api  [B] sdk  [C] internal  [D] payment  [E] auth  [F] Other: ___

  (If content is large) **Q3 — Focus**:
  [A] Keep full  [B] Keep only [specific interface list]  [C] Custom

  **INPUT**: Q1 answer | Q2 answer | Q3 answer (if any)
  ```

  **Gate**: Wait for user reply before `<step_3_store>`.
</step_2_interview>

<step_3_store>
  **Role**: Senior Engineer
  **Action**:
  1. Determine storage params:
     - `id`: User-confirmed value (or AI-inferred)
     - `format`: File extension from `<format_selection>` rules
     - `filename`: `{id}.{format}`
     - `tags`: User-confirmed tags list

  2. **Generate ref file content** (by format):

     **`.md` format skeleton**:
     ```markdown
     ---
     id: {id}
     title: {title}
     tags: [{tags}]
     sourceType: url | local-file | manual
     source: {source path or URL, "manual-input" when manual}
     created: {YYYY-MM-DD}
     updated: {YYYY-MM-DD}
     ---

     ## Core info
     <!-- Base URL, version, auth, etc. -->

     ## Key interfaces
     | Interface/Function | Path/Signature | Description |
     |:---|:---|:---|

     ## Important constraints and caveats

     ## Examples
     <!-- ≤ 3 most representative examples -->
     ```

     **`.yaml` format**: Store original OpenAPI/Swagger content (trim redundant example fields in responses, keep schema structure).

     **`.json` format**: Store original JSON Schema or config (remove comments, keep structure).

  3. **Write file**: `[[__DOCS_DIR__]]/refs/{id}.{ext}`

  4. **Update index**: Append to `[[__DOCS_DIR__]]/refs/index.json` refs array:
     ```json
     {
       "id": "{id}",
       "title": "{title}",
       "tags": ["{tags}"],
       "format": "{ext}",
       "file": "{id}.{ext}",
       "sourceType": "url | local-file | manual",
       "updatedAt": "{YYYY-MM-DD}"
     }
     ```

  **Output**:
  ```
  ADDED  [[__DOCS_DIR__]]/refs/{id}.{ext}
  MODIFIED  [[__DOCS_DIR__]]/refs/index.json
  ```
</step_3_store>

<step_4_signoff_add>
  **Output**: Add summary including:
  - **Reference ID**: `{id}`
  - **Storage format**: `{ext}` — rationale (one sentence)
  - **Tags**: `[tags]`
  - **File path**: `[[__DOCS_DIR__]]/refs/{id}.{ext}`
  - **How to use**:

  | Scenario | Description |
  |:---|:---|
  | `/archi.plan <ID>` | When planning involves `[tags]`-related features, AI auto-reads this ref |
  | `/archi.code <ID>` | Injected as supplementary context during coding, provides interface signatures and constraint details |
  | Manual reference | Mention "see `refs/{id}`" in conversation |
</step_4_signoff_add>

</sub_add>

<!-- ═══════════════════════════════════════════════ -->
<!--                  LIST subcommand               -->
<!-- ═══════════════════════════════════════════════ -->

<sub_list>

**Role**: System Analyst
**Trigger**: `/archi.ref list`
**Action**: Read `[[__DOCS_DIR__]]/refs/index.json`.

| Condition | Handling |
|:---|:---|
| Index missing / refs empty | Prompt "No references yet, run `/archi.ref add` to add the first" |
| Normal | Display grouped by tags |

**Output**:
```
### External knowledge references (N total)

#### [tag group name]
| ID | Title | Format | Updated |
|:---|:---|:---|:---|
| wechat-pay | WeChat Pay V3 API | .md | 2025-01-15 |
| openapi-spec | Internal service OpenAPI | .yaml | 2025-01-10 |
```

</sub_list>

<!-- ═══════════════════════════════════════════════ -->
<!--                 UPDATE subcommand             -->
<!-- ═══════════════════════════════════════════════ -->

<sub_update>

**Role**: Senior Engineer
**Trigger**: `/archi.ref update <id>`
**Action**:
1. Find `<id>` in `index.json`, get `file` and `sourceType`.
2. If `sourceType` is `url` → re-fetch original URL; `local-file` → re-read file; `manual` → prompt user to paste new content.
3. Re-run `<step_1_analyze>` + `<step_3_store>` (keep original id/tags/format, only refresh content and `updatedAt`).

| Condition | Handling |
|:---|:---|
| id not in index.json | Stop — prompt to check id, run `/archi.ref list` to view |

</sub_update>

<!-- ═══════════════════════════════════════════════ -->
<!--                 REMOVE subcommand             -->
<!-- ═══════════════════════════════════════════════ -->

<sub_remove>

**Role**: System Administrator
**Trigger**: `/archi.ref remove <id>`
**Action**:
1. Find and remove `<id>` from `index.json`.
2. Delete corresponding `refs/{id}.{ext}` file.
3. Update `index.json`.

**Output**:
```
REMOVED  [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED  [[__DOCS_DIR__]]/refs/index.json
```

| Condition | Handling |
|:---|:---|
| id not found | Stop — prompt to check id, run `/archi.ref list` to view |

</sub_remove>

</protocol_ref>

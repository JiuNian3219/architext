<protocol_ref_add>
**Trigger**: `/archi.ref add [input]`
**Goal**: Parse input → Analyze key info → (Ask if needed) → Store per Format-Aware rules → Update index.

<step_0_ingest>
Parse `[input]`, determine input source:

| Input Form | Handling | sourceType |
|:---|:---|:---|
| Local file path (e.g. ./docs/api.yaml) | Read file content | `local-file` |
| URL (e.g. https://...) | Fetch page content | `url` |
| Not provided (dialog mode) | Tell user to paste content or provide path/URL, wait for input | `manual` |

Read `[[__DOCS_DIR__]]/refs/index.json`:
- Exists → Load existing id list (prevent duplicate naming)
- Does not exist → Initialize as `{ "refs": [] }`
</step_0_ingest>

<step_1_analyze>
1. **Content type recognition**: Determine what type original content belongs to, determine recommended storage format (refer to [[INCLUDE: prompts/ref/shared/format-selection.md]]).
2. **Key information extraction**: Core interfaces / endpoints / signatures + Parameters and types + Important constraints / limits + Authentication method (if any) + Typical examples (≤ 3).
3. **Information gap identification**:
   - id naming (infer candidate values, do not duplicate existing ids)
   - tags classification (standard tags: api / sdk / internal / payment / auth / map / notification / storage / custom)
   - Focus areas (only when content is large and needs specific interface focus)
</step_1_analyze>

<step_2_interview>
**Gate**: Only execute when id / tags / focus area any is uncertain; otherwise skip, go directly to step_3.

Ask user questions, max 3, options preferred:
- Q1 Reference ID (AI inferred candidates + "Custom" option)
- Q2 Classification Tags (multi-select)
- Q3 Focus area (only when content is large)

Output reference info confirmation card: Content type and storage format / Content summary preview / Q1 / Q2 / (Q3).

Wait for user reply then enter step_3_store.
</step_2_interview>

<step_3_store>
1. Determine parameters:
   - `id`: User confirmed or AI inferred
   - `format`: Decided by format-selection
   - `filename`: `{id}.{format}`
   - `tags`: User selected list

2. Generate reference file content (branch by format):
   - **`.md`**: frontmatter (id / title / tags / sourceType / source / created / updated) + 4 sections (Key info / Key interface table / Important constraints / Examples ≤ 3)
   - **`.yaml`**: Directly store simplified OpenAPI/Swagger (remove redundant examples, preserve schema)
   - **`.json`**: Directly store original structure (remove comments, preserve structure)

3. Write file: `[[__DOCS_DIR__]]/refs/{id}.{ext}`

4. Append index entry to `[[__DOCS_DIR__]]/refs/index.json`'s `refs` array:
   - id / title / tags / format / file / sourceType / source / updatedAt

Output:
```
ADDED      [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED   [[__DOCS_DIR__]]/refs/index.json
```
</step_3_store>

<step_4_signoff>
Output add summary:
- Reference ID
- Storage format + Selection reason (one sentence)
- Tags
- File path
- Usage instructions: Auto-injected by tag match during plan / Can manually INCLUDE during code / Direct path reference

**Pre-signoff Checklist**:
1. `refs/{id}.{ext}` written
2. `refs/index.json` updated (contains new entry)
3. Summary compression ratio ≥ 50% (self-check against original length)
</step_4_signoff>
</protocol_ref_add>
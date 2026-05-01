<protocol_ref_update>
**Trigger**: `/archi.ref update <id>`
**Goal**: Re-fetch source content by sourceType → Re-summarize → Overwrite file and refresh updatedAt. Original id / tags / format / created unchanged.

<step_0_locate>
Read `[[__DOCS_DIR__]]/refs/index.json`, find entry by `<id>`:

| Situation | Handling |
|:---|:---|
| id does not exist | **Stop** — Prompt to check id, can run `/archi.ref list` to view |
| Hit | Load file path and sourceType then enter step_1 |
</step_0_locate>

<step_1_refetch>
Re-fetch source content by sourceType:

| sourceType | Handling |
|:---|:---|
| `url` | Re-fetch original URL |
| `local-file` | Re-read original file path |
| `manual` | Prompt user to paste new content and wait for input |

Fetch failed → **Stop** — Prompt reason (URL unreachable / file doesn't exist / user cancelled), do not modify any file.
</step_1_refetch>

<step_2_re_summarize>
Re-execute content analysis (same as add step_1_analyze):
1. **Content type validation**: Refer to [[INCLUDE: prompts/ref/shared/format-selection.md]]. **Do not change original format** — If source content type drifted (e.g. yaml changed to md doc), only WARNING prompt user to consider remove and re-add, still write in original format.
2. **Key information extraction**: Core interfaces / constraints / examples ≤ 3.
3. **Preserve original id / tags / format**; do not re-ask.
</step_2_re_summarize>

<step_3_preview>
Output update preview card:
- Reference ID / title / tags / sourceType / source
- Will overwrite file: `[[__DOCS_DIR__]]/refs/{id}.{ext}`
- New summary preview: Core changes, preserved interfaces/constraints/examples
- Diff hint: New/deleted/significantly changed topics compared to old summary
- WARNING: If detected source content type drift, prompt user to consider `/archi.ref remove <id>` then `/archi.ref add`

**Gate**: Wait for user explicit **OK** reply then enter step_4_overwrite; Cancel or unconfirmed stops, do not modify any file.
</step_3_preview>

<step_4_overwrite>
1. Overwrite write `[[__DOCS_DIR__]]/refs/{id}.{ext}`:
   - `.md`: Preserve created in original frontmatter, refresh updated
   - `.yaml` / `.json`: Pure content overwrite, updatedAt maintained by index
2. Update `updatedAt` for that entry in `refs/index.json`.

Output:
```
UPDATED    [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED   [[__DOCS_DIR__]]/refs/index.json
```
</step_4_overwrite>

<step_5_signoff>
**Pre-signoff Checklist**:
1. Update preview card has user explicit OK
2. id / tags / format completely consistent with before refresh (no accidental change)
3. `updatedAt` changed, `created` unchanged
4. New summary compression ratio ≥ 50%
5. If detected source content type drift, already prompted user as WARNING in output
</step_5_signoff>
</protocol_ref_update>
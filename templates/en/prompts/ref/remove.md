<protocol_ref_remove>
**Trigger**: `/archi.ref remove <id>`
**Goal**: Delete reference file and remove corresponding entry from index.json.

<step_1_locate>
Read `[[__DOCS_DIR__]]/refs/index.json`, find entry by `<id>`:

| Situation | Handling |
|:---|:---|
| id does not exist | **Stop** — Prompt to check id, can run `/archi.ref list` to view |
| Hit | Load file path then enter step_2 |
</step_1_locate>

<step_2_confirm>
Output delete confirmation card:
- Will delete reference file: `[[__DOCS_DIR__]]/refs/{id}.{ext}`
- Will remove index entry: entry with id = `{id}` in `refs/index.json`
- Hit reference info: title / tags / sourceType / source
- Risk warning: After deletion need to re-add to restore; only exact id match, no fuzzy deletion.

**Gate**: Wait for user explicit **OK** reply then enter step_3_delete; Cancel or unconfirmed stops, do not modify any file.
</step_2_confirm>

<step_3_delete>
1. Delete `[[__DOCS_DIR__]]/refs/{id}.{ext}` (If file already doesn't exist only record WARNING, don't block).
2. Remove entry from `refs/index.json`'s `refs` array.

Output:
```
REMOVED    [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED   [[__DOCS_DIR__]]/refs/index.json
```
</step_3_delete>

<step_4_signoff>
**Pre-signoff Checklist**:
1. Delete confirmation card has user explicit OK
2. `refs/{id}.{ext}` no longer exists
3. `refs/index.json` no longer has that id entry
4. No mistaken deletion of other references (exact id match, no fuzzy match)
</step_4_signoff>
</protocol_ref_remove>
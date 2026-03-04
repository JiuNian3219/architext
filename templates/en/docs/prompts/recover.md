<protocol_recover>
**Trigger**: `/archi.recover <pack-file>`
**Goal**: Read pack file; write all user data (docs, tasks, custom rules) to corresponding paths in current project; complete data restore after framework upgrade.

<meta>
  <style>Precise, Efficient, Non-interactive</style>
  <language>English</language>
  <principles>
    1. **User Data Only**: Pack file contains only user data (`global/`, `tasks/`, `scripts/`, `refs/`, custom rules); write all; no filtering.
    2. **Overwrite Always**: When target path exists, overwrite directly (in upgrade scenario old data is empty template; safe to replace).
    3. **Delta Notation**: Output must label each written file as `ADDED` / `MODIFIED`.
    4. **No Partial Write**: If any file write fails, stop immediately and report; already-written files are not rolled back (idempotent; safe to re-run).
  </principles>
</meta>

<step_1_ingest>
  **Role**: Intelligence Analyst
  **Action**:
  1. Read file at `<pack-file>` path.
  2. Parse XML; extract `path` attribute and CDATA content of each `<file>` element under `<files>`.

  | Condition | Handling |
  |:---|:---|
  | File not found or unreadable | Stop — ask user to check path; suggest running `archi pack` to generate |
  | XML malformed | Stop — suggest file may be corrupted; re-run `archi pack` |
  | `<files>` empty | Stop — inform pack is empty |

  **Output**: Internal file list (path + content); not shown to user.
</step_1_ingest>

<step_2_apply>
  **Action**:
  1. For each `<file>` entry: use `path` (relative to project root) as write target; exists → overwrite (`MODIFIED`), not exists → create (`ADDED`). Write full CDATA content; preserve original line endings and encoding.
  2. Paths in pack may have nested subdirs; ensure parent dirs exist.

  **Output**: Each file's `ADDED` / `MODIFIED` status list.
</step_2_apply>

<step_3_signoff>
  **Output**: Restore summary — total files written (ADDED / MODIFIED counted separately) + Next Steps:

  | Step | Notes |
  |:---|:---|
  | Verify framework state | Run `/archi.help` to check project state and suggested next actions |
  | Clean up pack file | May delete `<pack-file>`; no longer needed |
</step_3_signoff>

</protocol_recover>

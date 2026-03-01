<protocol_recover>
**Trigger**: `/archi.recover <pack-file>`
**Goal**: Read the pack file and write all user data (docs, tasks, custom rules) to their corresponding paths in the current project, completing data restore after a framework upgrade.

<meta>
  <style>Precise, Efficient, Non-interactive</style>
  <language>English</language>
  <principles>
    1. **User Data Only**: The pack file contains only user data (`global/`, `tasks/`, `scripts/`, custom rules) — no framework files. Write all entries without filtering.
    2. **Overwrite Always**: If the target file already exists, overwrite it directly without prompting (in an upgrade scenario, existing files are empty templates and safe to replace).
    3. **Delta Notation**: Label each written file as `ADDED` or `MODIFIED` in the output.
    4. **No Partial Write**: If any file write fails, stop immediately and report. Already-written files are not rolled back (idempotent — safe to re-run).
  </principles>
</meta>

<step_1_ingest>
  **Role**: Intelligence Analyst
  **Action**:
  1. Read the file at the `<pack-file>` path.
  2. Parse the XML; extract the `path` attribute and CDATA content of each `<file>` element under `<files>`.

  | Condition | Action |
  |:---|:---|
  | File not found or unreadable | Stop — ask user to verify path; suggest running `archi pack` to regenerate |
  | XML malformed | Stop — note file may be corrupted; suggest re-running `archi pack` |
  | `<files>` is empty | Stop — inform user the pack is empty |

  **Output**: Internal file list (path + content). Do not output to user.
</step_1_ingest>

<step_2_apply>
  **Role**: Senior Engineer
  **Action**:
  1. For each `<file>` entry:
     - Use the `path` attribute (relative to project root) as the write target.
     - If the target file exists → overwrite (mark as `MODIFIED`).
     - If the target file does not exist → create (mark as `ADDED`).
     - Write the full CDATA content, preserving original line endings and encoding.
  2. Note: paths in the pack may contain nested subdirectories (e.g. `tasks/FEAT-001_auth/spec.md`); ensure parent directories exist before writing.

  **Output**:
  ```
  ADDED     .architext/global/vision.md
  ADDED     .architext/global/roadmap.json
  ADDED     .architext/tasks/FEAT-001_auth/spec.md
  MODIFIED  .cursor/rules/90_custom_rules.mdc
  ...
  ```
</step_2_apply>

<step_3_signoff>
  **Action**:
  1. Output restore summary:
     - Total files written (ADDED and MODIFIED counted separately)
  2. Next Steps:

  | Step | Notes |
  |:---|:---|
  | Verify framework state | Run `/archi.help` to check project status and recommended next actions |
  | Clean up pack file | You may delete `<pack-file>` — it is no longer needed |
</step_3_signoff>

</protocol_recover>

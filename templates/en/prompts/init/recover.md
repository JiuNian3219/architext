<protocol_recover>
**Trigger**: Dispatched by `prompts/init.md` router, parameter is `<pack-file>`
**Goal**: Read pack file, write user data (documents, tasks, custom rules) to corresponding paths in current project, complete data restoration after framework upgrade.

<meta>
		<style>Precise, Safety-First</style>
		<language>English</language>
		<principles>
			User Data Only: pack only contains user data (`global/` / `tasks/` / `refs/` / custom rules), write all, no filtering needed.
			Version Aware: pack version must be compatible with current framework for direct write; incompatible rejects or prompts migration.
			Two-Phase Write: First full parse + validate, then unified write; parse failure does not write any file.
		</principles>
</meta>

<step_0_safety_check>
1. Run `git status --porcelain` to check Git working directory:
   - No uncommitted changes → Pass, enter step_1
   - Has uncommitted changes and `--force` not passed → Output warning and stop:

Detected Git working directory has uncommitted changes (currently <N> modified files). Recovery operation will overwrite files under `global/` / `tasks/` / `refs/`. Please choose:
- [A] Commit/stash current changes first, then re-run `/archi.init <pack-file>` (init router will automatically enter recover)
- [B] Force recovery (discard changes): `/archi.init <pack-file> --force`
- [C] Abort

2. After passing, enter step_1.
</step_0_safety_check>

<step_1_ingest>
1. Read `<pack-file>` path file content
2. Parse XML, extract:
   - Under `<metadata>`: architext version at that time (if exists)
   - Under `<files>`: each `<file>` element's `path` attribute and CDATA content
3. Error handling:

| Situation | Handling |
|:---|:---|
| File does not exist or cannot be read | Stop, tell user to check path, prompt to run `archi pack` first to generate |
| XML format error | Stop, prompt file may be corrupted, re-run `archi pack` |
| `<files>` is empty | Stop, tell pack is empty |

4. Version compatibility check:

| Situation | Handling |
|:---|:---|:---|
| Versions match | Directly enter step_2 |
| Pack version older (same major) | Prompt schema difference, suggest `archi update` first; continue after user confirmation |
| Pack version newer or cross-major downgrade | Reject, require user to use same or newer version of architext |
| Pack has no version metadata (old pack) | Warn "pack version unknown, must run archi doctor after recovery", continue after user confirmation |

5. First phase validation (no write):
   - Each `<file>`'s `path` is non-empty and does not contain `..` escaping project root
   - CDATA content parseable (no truncation)
   - Validation failed → Output failed file list and stop, do not write any file

Output: Internal file list (path + content, not to user); version difference prompt (if any) to user.
</step_1_ingest>

<step_2_apply>
1. For each `<file>` entry: use `path` (relative to project root) as write target
   - Exists → Overwrite (mark `MODIFIED`)
   - Does not exist → Create (mark `ADDED`)
   - Write complete CDATA content, preserve original line breaks and encoding
2. Pack path may contain nested subdirectories, ensure parent directories exist
3. Atomicity suggestion: When underlying supports, write to temp directory first then atomic rename; if not supported, write sequentially, stop immediately on failure and report written file list (idempotent, safe to re-run)

Output: Each file's `ADDED` / `MODIFIED` status list.
</step_2_apply>

<step_3_post_restore_doctor>
1. Run `npx archi doctor`
2. Collect output classified as PASS / WARNING / CRITICAL
3. Has CRITICAL items → Mark explicitly in summary, prompt user to add to next priority list
4. Only WARNING → Summary list, do not block
</step_3_post_restore_doctor>

<step_4_signoff>
Output recovery summary to user:
- Title line: Project recovery complete
- Four body paragraphs: Write statistics (ADDED / MODIFIED / total) / Version info (pack version + current framework + compatibility) / Doctor results (CRITICAL / WARNING / PASS counts) / Next Steps
- Next Steps: Run `/archi.help` to view project status; handle CRITICAL per doctor output (if any); can delete pack file
</step_4_signoff>
</protocol_recover>
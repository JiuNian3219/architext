<protocol_script>
  **Trigger**: `/archi.script`
  **Goal**: Generate/update `.architext/scripts/` based on frozen `tech_stack.md`.
  **When**: After infrastructure tasks (INF-01, etc.) complete, when `tech_stack` commands are actual values (not placeholders) and runnable.

<meta>
    <style>Deterministic, Auto-Detect, Post-Infra</style>
    <language>English</language>
    <principles>
      1. **Post-Infra Only**: Only run after infrastructure is ready, `tech_stack` commands must be actual values.
      2. **Auto-Detect**: Auto-detect OS, generate `.sh` (Unix) and `.ps1` (Windows).
      3. **Tech-Stack Driven**: Strictly extract actual commands from `tech_stack.md`, no hardcoding.
      4. **Idempotent**: Multiple runs produce same result, only write on change.
    </principles>
</meta>

<step_1_ingest>
    **Action**:
    1. Read `[[__DOCS_DIR__]]/global/tech_stack.md`
    2. Read actual project code, extract real commands:
       - `package.json` → `scripts` field (if exists)
       - Config files → `vite.config.*` / `webpack.config.*` / `tsconfig.json`, etc.
       - CI configs → `.github/workflows/` / `.gitlab-ci.yml`, etc. (if exists)
    3. Cross-validate: tech_stack commands vs actual config
       - Consistent → use tech_stack commands
       - Inconsistent → use actual code (tech_stack may be outdated)
    4. Extract commands (skip `[e.g.: ...]` placeholders):
       - **Lint**: Section 3 Static Analysis
       - **Format**: Section 3 Formatter
       - **Build**: Section 3 Build Command
       - **Test**: Section 5 Test Command
       - **Dev**: Section 3 Dev Command
       - **Install**: Section 3 Package Manager + install
    5. Detect current OS (Windows / Unix-like)

    **Output**: Internal command map (tech_stack + actual code cross-validated), enter step_2_generate.
</step_1_ingest>

<step_2_generate>
    **Action**: Generate three scripts based on extracted commands:

    ### validate
    Aggregated checks: Lint → Format Check → Type Check → Build → Test
    - Exit on first failure (exit 1)
    - Colored output (green=pass, red=fail, yellow=skip)

    ### dev-up
    Start environment: Install → Build → Health Check
    - Health Check: Run build artifact (e.g., `--version` for CLI)

    ### dev-reset
    Reset environment: Kill Process → Clean Cache → Reinstall → Rebuild → Health Check
    - Kill: Terminate node/tsx processes
    - Clean: Remove node_modules/.cache, dist, coverage

    **Script Structure**:
    - Unix (`.sh`): `#!/bin/bash`, `set -e`, ANSI colors
    - Windows (`.ps1`): PowerShell, `$ErrorActionPreference`, Write-Host colors

    **Output**: Script content in memory, enter step_3_write.
</step_2_generate>

<step_3_write>
    **Action**:
    1. Ensure `[[__DOCS_DIR__]]/scripts/` directory exists
    2. Compare with existing scripts (if any):
       - Same content → skip
       - Changed → overwrite, mark `MODIFIED`
       - Not exists → write, mark `ADDED`
    3. Write files:
       - Unix: `validate`, `dev-up`, `dev-reset` (no ext, +x)
       - Windows: `validate.ps1`, `dev-up.ps1`, `dev-reset.ps1`

    **Output**: File change list.
</step_3_write>

<step_4_signoff>
    **Terminal Gate** (do not skip): Standard check (task --check + render).

    **Pre-signoff Checklist**:
    □ tech_stack.md — Successfully extracted non-placeholder commands
    □ scripts/ — validate/dev-up/dev-reset generated (Unix + Windows)
    □ Change labels — ADDED / MODIFIED / SKIPPED correctly output

    **Output**:
    ```
    ✅ Scripts Generated

    | Script | OS | Status |
    |:---|:---|:---|
    | validate | Unix | ADDED/MODIFIED/SKIPPED |
    | validate | Windows | ADDED/MODIFIED/SKIPPED |
    | dev-up | Unix | ... |
    | dev-up | Windows | ... |
    | dev-reset | Unix | ... |
    | dev-reset | Windows | ... |

    **Next**: AI will auto-use `scripts/validate` when running `/archi.code`
    ```
</step_4_signoff>

</protocol_script>

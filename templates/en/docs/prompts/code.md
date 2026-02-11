<protocol_code>
  **Trigger**: `/archi.code <id>`
  **Goal**: Based on the task list in `features/<id>_<Slug>/plan.md`, engineer and standardize the feature implementation; strictly follow `02_tech_stack.md` (and `03_design_tokens.md` if the project has UI); pass build, type check, lint, formatting, basic tests, and audit locally.

<meta>
    <style>Deterministic, Type-Safe, SOTA-First</style>
    <language>English</language>
    <principles>
      1.  **Frontmatter Preservation**: Strictly prohibited from deleting or modifying YAML Frontmatter or equivalent metadata of any existing files.
      2.  **Follow Conventions**: Use only existing libraries and patterns in the repository; read code before changing it.
      3.  **Security First**: Prohibit introducing or printing any secrets; sensitive information must not be written to disk.
      4.  **SOTA Pattern Check**: Reject outdated practices; prioritize modern best practices defined in the project tech stack.
      5.  **No Commit Policy**: Do not commit code without user authorization; present changes as patches only.
      6.  **Static Check First**: Code must pass all static checks (Type, Lint, Format) to be considered complete.
      7.  **Plan Completion Gate**: Must verify task completion in `plan.md` before signing off. All AI-completable tasks must be finished; only "Human Intervention Required" and "Force Majeure" tasks are exempt.
    </principles>
</meta>

<step_1_resolve>
    **Role**: System Analyst
    **Action**:
    1.  **Resolve ID**: Parse `<id>` -> Feature Name, `📁 Slug`, and phase/status from `[[__DOCS_DIR__]]/global/00_roadmap.md`.
    2.  **Pre-flight Check (Status Gate)**:
        - Verify that task `<id>` current status is **`active`** (🟢).
        - **Rule**: Only tasks with `active` status can enter the code workflow.
        - If status is `pending` (⏳): **Reject** — "Please run `/archi.plan <ID>` first to complete feature planning. The task will be set to active automatically upon completion."
        - If status is `blocked` (🧱): **Reject** — "Task is blocked. Prerequisites are not yet completed. Please complete dependency tasks first."
        - If status is `done` (✅): **Reject** — "Task is already completed. Use `/archi.edit <ID>` if modifications are needed."
    3.  **Load Context** (Use the `📁 Slug` field from Roadmap to locate the directory):
        - Read `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` (Logic & Scenarios)
        - Read `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` (Design & Components, if exists)
        - Read `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.md` (Task Breakdown)
        - Read `02_tech_stack.md` (Technical Red Lines)
        - Read `[[__DOCS_DIR__]]/global/03_design_tokens.md` (Design Tokens, if project has UI)
        - Read `[[__DOCS_DIR__]]/global/04_data_snapshot.md` (Data Model, if project has Data Layer)

    **Output**: Summarize the "Atomic List" of tasks to be implemented, marking dependencies and order.
    **Bridge**: "Context loaded, preparing to enter the engineering implementation phase..."
</step_1_resolve>

<step_2_plan>
    **Role**: Tech Lead
    **Action**:
    - Generate an "Execution Blueprint" (dynamically adjusted based on project type):
      - **Phase A (Domain/Data/API)**: Data Models/Interfaces/Validation (Type Safety, Verification Logic)
      - **Phase B (UI/Presentation)**: Component Structure/Styling (If project has UI, use Design Tokens only)
      - **Phase C (Integration)**: End-to-End Wiring (State Management, Routing, Data Flow, Error Handling)
      - **Note**: For non-UI projects (e.g., CLI, Backend, Library), Phase B may not apply or should be adjusted to the corresponding Presentation or Interface layer.
    - Write "Completion Criteria" (Acceptance Criteria) for each task, including:
      - Static Checks Passed (Type, Lint, Format)
      - Functional Tests Passed (Unit/Integration Tests)
      - Compliance with Architecture Standards (Ref `02_tech_stack.md`)

    **Output**: Implementation-oriented Task List (Checkbox), each item measurable and atomic.
    **Bridge**: "Blueprint generated, starting code implementation item by item..."
</step_2_plan>

<step_3_implement>
    **Role**: Senior Engineer
    **Protocol**:
    - **Read First**: Must read the target file before modification; follow existing code style and naming conventions.
    - **Use Existing Stack**: Use only technologies and libraries declared in `02_tech_stack.md`.
    - **Design Tokens Only** (If project has UI): UI styles strictly use Tokens from `03_design_tokens.md`; prohibited hardcoding Hex/px/rem values.
    - **Type-Safe**: Complete type definitions; use the type system defined in the project tech stack (e.g., TypeScript, Zod, Rust Types, Go Interfaces) to guard boundaries.
    - **Micro-Structure Policy (Code Organization)**:
        - 🚫 **No Junk Drawer**: Prohibit creating generalized `utils/*` / `helpers/*` / `common/*` / `misc/*` directories/files. Must split by domain (e.g., `date`, `currency`, `io`, `http`, `auth`).
        - 📍 **Colocation First**: Helper logic used only by a single module should be prioritized for colocation in the same directory (e.g., `internal/`, `_internal/`, `_components/` or other project conventions), avoiding meaningless global sharing.
        - 📦 **Public API Boundary**: Cross-module references must be exposed through project-agreed Public API entries (e.g., `index.ts`, `lib.rs`, `__init__.py`, `pkg/<name>`), strictly prohibiting deep references to internal implementation details.
        - 📝 **Meaningful Comments**: 
            - **Why, Not What**: Comments should explain "Why this is done" (Business Context/Special Boundaries), not translate what the code does.
            - **Anti-Pattern**: Reject nonsense comments like `// Increment i by 1`.
        - 📖 **Code Readability**:
            - **Self-Documenting Names**: Variables/Functions must be self-explanatory. Reject meaningless names like `a`, `b`, `tmp` (except loop variable `i`).
            - **Structured Logic**: Prioritize Guard Clauses to reduce nesting; avoid overly long functions.
        - **Error Handling Policy**:
            - 🚫 **No Silent Failures**: Prohibit swallowing errors/printing logs and continuing.
            - ✅ **Proper Propagation**: Must choose based on scenario: Throw project-defined error types (e.g., `AppError`/Exception), return Result types, or return enumerable error codes (follow `05_error_codes.md`, if applicable).
            - 📢 **Feedback to Caller**: Must provide observable feedback to the "Caller", not fail silently (e.g., UI: Toast/Alert; CLI: Exit Code + Message; API: Status Code + Error Body; Unified Logging/Metrics/Tracing if project has Observability conventions).
    - **Robustness**: Must explicitly handle edge cases (Loading/Error/Empty/Timeout, etc.); strictly prohibit writing only the Happy Path.
    - **SOTA**: Follow modern best practices defined in `02_tech_stack.md`; reject outdated patterns explicitly forbidden in the project tech stack.
    - **Patch Output**: Output full changes as patches, with Code References.
    - **Scaffold Safety**:
        - ⚠️ **Danger**: Many scaffolds/generators require **clearing or overwriting files** when the current directory (`.`) is not empty, which may lead to accidental deletion/pollution of `docs/` or `[[__DOCS_DIR__]]/`.
        - ✅ **Safe Strategy**: Generate in a new directory (or backup first), and explicitly protect the `[[__DOCS_DIR__]]/` directory from being overwritten; any deletion/overwrite operation must list the manifest and request confirmation first.

    **Action**:
    - Implement tasks for Phase A/B/C; produce minimum viable code (including necessary Unit/Integration test stubs) for each output.
    - If new files/directories are needed, keep consistency with existing architecture patterns (`02_tech_stack.md`)/conventions.
    - If configuring scripts (e.g., ESLint, TSConfig), read existing config first and make minimal changes.

    **Output**: Patch Set (Apply Patch) and file references, with clear coverage.
</step_3_implement>

<step_4_validate>
    **Role**: Validation Engineer
    **Action** (Execute in order, must fix if any step fails; **all commands are subject to `02_tech_stack.md` or existing project scripts**):
    
    1.  **Build Check**:
        - Run project build command (e.g., `npm run build`, `cargo build`, `go build`, `mvn compile`, etc.)
        - If unknown: Read `package.json`/`Cargo.toml`/`pom.xml`/`README.md` to infer command
        - **Rule**: Build must succeed with no compilation errors
    
    2.  **Type Check**:
        - TypeScript: `tsc --noEmit` or `npm run typecheck`
        - Rust: `cargo check`
        - Go: `go vet` + `staticcheck` (if configured)
        - Python: `mypy` or `pyright` (if configured)
        - Other languages: According to type check tools defined in `02_tech_stack.md`
        - **Rule**: Must have zero type errors
    
    3.  **Lint Check**:
        - JavaScript/TypeScript: `eslint` or `npm run lint`
        - Rust: `cargo clippy`
        - Go: `golangci-lint`
        - Python: `ruff` or `flake8` + `pylint`
        - Other languages: According to project configured Linter
        - **Rule**: Must have zero Lint errors (Warnings negotiable, but must explain reasons)
    
    4.  **Format Check**:
        - JavaScript/TypeScript: `prettier --check` or `npm run format:check`
        - Rust: `cargo fmt --check`
        - Go: `gofmt -d`
        - Python: `black --check` or `ruff format --check`
        - Other languages: According to project configured formatter
        - **Rule**: Code format must comply with project standards (if failed, auto-fix and re-check)
    
    5.  **Test Check**:
        - Run Unit Tests: `npm test`, `cargo test`, `go test`, `pytest`, etc.
        - Run Integration Tests (if exist): Ensure key flows pass
        - E2E Tests (if project configured Playwright/Cypress/Selenium): Execute only on critical paths
        - **Rule**: All tests must pass
    
    6.  **Runtime Check (If applicable)**:
        - Web Project: Start local preview and output accessible link
        - CLI Project: Execute key commands to verify functionality
        - API Project: Start service and verify health check endpoint
        - Library Project: Run example code to verify exported interfaces
    
    **Rule**: Any validation failure must not mark the task as complete; must rollback or fix until passed.
    **Output**: Detailed validation log and conclusion (Pass/Fail status + reason for each check).
</step_4_validate>

<step_5_audit>
    **Role**: 🔴 Chief Auditor
    **Checklist**:
    1.  **Tech Consistency**: Consistent with `02_tech_stack.md` (Libraries, Patterns, API Style, Architecture Patterns).
    2.  **Design Compliance** (If project has UI): UI styles use Tokens only; no hardcoded colors/pixels/units.
    3.  **Data Integrity** (If project has Data Layer): Changes comply with `04_data_snapshot.md`; field names/types match.
    4.  **SOTA Pattern Check**: Reject outdated patterns; adopt modern best practices defined in `02_tech_stack.md`.
    5.  **Accessibility** (If project has UI): Components include necessary accessibility attributes (aria/role/semantic HTML, etc.).
    6.  **I18n Compliance** (If project supports Multi-language): No hardcoded strings; must use Key or dictionary reference.
    7.  **Performance**: 
       - Avoid unnecessary large dependencies/full imports; prefer on-demand import, minimal dependencies (Lazy Load / Tree-shaking / Feature Flags where applicable)
       - Avoid unnecessary computations, network requests, memory leaks
       - Follow project performance best practices
    8.  **Security**: No sensitive info leakage; inputs and boundaries validated; follow project security standards.
    9.  **Static Check Zero**: Must resolve all static check issues (Linter Errors, Type Errors, Format Issues); strictly prohibited to commit code with errors.
    10. **Build Success**: Build must succeed, no compilation/packaging errors.
    11. **Test Coverage**: Critical logic must have test coverage (according to project test strategy).

    **Action**:
    - Directly fix details that can be "Silent Auto-Fixed" and explain.
    - Mark major risks with `⚠️ Risk` and propose alternatives.
</step_5_audit>

<step_6_signoff>
    **🚨 Plan Completion Gate (Mandatory - Pre-Signoff Check)**:
    > Before executing the signoff process, task completion **must** be verified first. Skipping is strictly prohibited.

    1.  **Check Task Completion**: Run `npx archi plan <ID>` to check the completion status of all task Checkboxes in `plan.md`.
    2.  **Pass Criteria**: All tasks are checked `[x]`, **or** uncompleted tasks belong **only** to the following exempt categories:
        - 🧑 **Human Intervention Required**: Manual testing, user acceptance, manual approval, requires real device/environment verification, etc.
        - 🌐 **Force Majeure**: Third-party service unavailable, external dependency not ready, environment/permission restrictions, requires paid resources, etc.
    3.  **Failure Handling**: If there are tasks that **can be completed by AI but are not**, **signing off is strictly prohibited**. Must return to `<step_3_implement>` to continue implementation until all completable tasks are finished.
    4.  **Exemption Annotation**: For exempt uncompleted tasks, must clearly annotate the **reason** and **exemption category** (🧑 Human / 🌐 Force Majeure) in the final output.

    ---

    **Action** (Execute only after Plan Completion Gate passes):
    1. Output "Completed Task List" and corresponding patch links (Code Reference).
    2. Update `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.md`, check the completed task Checkboxes.
    3. **🚨 Roadmap Status Sync (Mandatory)**:
       - Run `npx archi task <ID> --status done` (or `active`, depending on whether all Phases are complete) to update task status.
       - **NEVER** manually edit `00_roadmap.md` to change status. MUST use the CLI command to ensure bidirectional sync between task list and Mermaid graph.
    4. **🚨 Consistency Check (Mandatory)**:
       - Run `npx archi task --check` to validate Roadmap consistency.
       - If check fails, fix inconsistencies and re-run `--check` until it passes.
    5. Provide "Next Step Suggestions": Continue implementing subsequent Phases or trigger `/archi.plan` to refine new modules.
    6. **Git Commit Suggestion**: Generate commit message conforming to Conventional Commits specification based on changes (e.g. `feat(auth): implement login flow`).

    **Output Template**:
    ```markdown
    ## ✅ Implementation Complete

    **Feature**: `<ID>` — `<Name>` | **Status**: [In Progress / Done]

    ### 📋 Completed Tasks
    * ✅ [Major completed task]
    * ✅ [Major completed task]

    ### ⏭️ Exempted Tasks (If any)
    * 🧑 [Task name] — Reason: [Human intervention required]
    * 🌐 [Task name] — Reason: [Force majeure]

    ### 💬 Git Commit Suggestion
    `feat(<scope>): <description>`

    ### 🧭 Next Steps
    | Scenario | Recommended Action |
    |:---|:---|
    | **Continue Implementation** | `/archi.code <ID>` |
    | **Plan New Feature** | `/archi.plan [Feature_ID]` |
    | **Found Bug** | `/archi.fix <ID> [bug description]` |
    | **Requirement Change** | `/archi.edit <ID> [change description]` |
    ```
</step_6_signoff>

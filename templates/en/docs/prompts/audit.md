<protocol_audit>
  **Trigger**: `/archi.audit [id]`
  **Goal**: Independent deep code audit. With `<id>`, audit the task's code implementation; without `<id>`, execute project-level health check. No code modifications — output audit report and fix tickets only.

<meta>
    <style>Investigative, Thorough, Evidence-Based</style>
    <language>English</language>
    <principles>
      1.  **Read-Only**: Prohibited from modifying any code files. Audit ≠ Fix.
      2.  **Evidence-Based**: Every finding must include file path, line number, and code snippet.
      3.  **Actionable Output**: Every issue must include a recommended fix command (`/archi.fix`, `/archi.edit`, etc.).
      4.  **Vision Anchored**: Always use `vision.md` as directional baseline to detect deviations.
      5.  **Report Persistence**: Audit results must be written to file — task-level → `features/<id>_*/audit.md` (overwrite), project-level → `audits/YYYY-MM-DD.md` (date-archived, same-day overwrite).
    </principles>
</meta>

<step_1_resolve>
    **Role**: System Analyst
    **Mode Gate**:

    | Input | Mode | Next Steps |
    |:---|:---|:---|
    | `/archi.audit <id>` | Task-level deep audit | step_2_task → step_3_report |
    | `/archi.audit` | Project-level health check | step_2_project → step_3_report |

    **Task-level — Resolve ID**:
    1.  Parse `<id>` from `[[__DOCS_DIR__]]/global/roadmap.json` → Feature Name, Slug, status.
    2.  **Status Gate** — Only `active` or `done` can be audited:

        | Status | Handling |
        |:---|:---|
        | `active` / `done` | Pass |
        | `pending` | Reject — no code to audit, run `/archi.plan` + `/archi.code` first |
        | `blocked` | Reject — prerequisites not completed |

    3.  **Load Context**:
        - `[[__DOCS_DIR__]]/global/vision.md` — Project directional baseline
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — Feature logic
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.json` — Task checklist
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — Visual design (if exists)
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/audit.md` — Previous audit report (if exists, for comparison)
        - `02_tech_stack.md` — Technical red lines
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`
    4.  Read all code files corresponding to this task.

    **Project-level — Load Overview**:
    1.  Read `[[__DOCS_DIR__]]/global/vision.md`, `roadmap.json`, `map.json`.
    2.  Read `02_tech_stack.md`.
    3.  Scan `[[__DOCS_DIR__]]/features/` directory structure.
    4.  Read project code entry points and key modules.

    **Output**: Audit scope and context inventory.
</step_1_resolve>

<step_2_task>
    **Role**: Chief Auditor
    **Scope**: Task-level deep code audit (execute only for `/archi.audit <id>`).

    Audit dimension by dimension; every finding must include `file:line` + code snippet + severity:

    | # | Dimension | Audit Focus |
    |:---|:---|:---|
    | 1 | **Vision Alignment** | Does the implementation direction conflict with or deviate from `vision.md` |
    | 2 | **Spec Completeness** | Does code cover all scenarios and edge cases in `spec.md` |
    | 3 | **Plan Truthfulness** | Are tasks marked `done` actually implemented in code (detect false marks) |
    | 4 | **Logic Correctness** | Business logic errors, contradictions, missing branches, state machine defects |
    | 5 | **Bug Hunting** | Null/undefined, race conditions, resource leaks, infinite loops, off-by-one |
    | 6 | **Error Handling** | Swallowed errors, silent failures, error propagation chain integrity, user-visible feedback |
    | 7 | **Tech Stack Compliance** | Against `02_tech_stack.md`: forbidden patterns, outdated APIs, hardcoded values |
    | 8 | **Security** | Sensitive info leakage, unvalidated input, injection risks, permission checks |
    | 9 | **Performance** | Unnecessary full imports/large loops/useless computation/memory leaks/N+1 queries |
    | 10 | [?UI] **Design Compliance** | Styles use Tokens only; no hardcoded Hex/px/rem |
    | 11 | [?Data] **Data Integrity** | Field names/types consistent with `data_snapshot.json` |
    | 12 | [?I18n] **I18n Compliance** | No hardcoded strings; must use Key/dictionary references |

    **Output**: Findings list grouped by dimension, each with severity, location, description.
</step_2_task>

<step_2_project>
    **Role**: Chief Auditor
    **Scope**: Project-level health check (execute only for `/archi.audit` without arguments).

    | # | Check Item | Description |
    |:---|:---|:---|
    | 1 | **Vision Drift** | Are `roadmap.json` task directions consistent with `vision.md` |
    | 2 | **Architecture Consistency** | `map.json` vs actual directory structure — drift or unregistered modules |
    | 3 | **Roadmap Health** | Consistency + progress stats + long-term blocked tasks + dependency cycle detection |
    | 4 | **Documentation Completeness** | Each Feature has spec.md + plan.json; detect orphan directories |
    | 5 | **Tech Stack Global Compliance** | Spot-check key entry points and modules for global violations |
    | 6 | **Cross-Feature Consistency** | Duplicate logic, naming conflicts, interface inconsistencies |

    After scanning, prioritize and recommend Features needing deep audit:
    - `done` but plan not fully completed
    - Large codebase but no tests
    - Long-term `active` with no progress

    **Output**: Project health overview + deep audit recommendation list.
</step_2_project>

<step_3_report>
    **Role**: Report Writer
    **Action**:

    **Issue Classification**:

    | Level | Meaning | Example |
    |:---|:---|:---|
    | `CRITICAL` | Must fix, blocks release | Logic errors, security vulnerabilities, data corruption risk |
    | `WARNING` | Should fix, carries risk | Missing error handling, performance hazards, incomplete Spec coverage |
    | `INFO` | Suggested improvement | Naming conventions, missing comments, simplifiable code |

    **Issue Format** (each must include):
    ```
    [LEVEL] file/path:line — Dimension Name
      Description: specific issue
      -> Recommended fix: /archi.fix <ID> <description> or /archi.edit <ID> <description>
    ```

    **Action Routing** (recommend command by issue type):

    | Issue Type | Recommended Command |
    |:---|:---|
    | Bug (logic error, edge case miss) | `/archi.fix <ID> <description>` |
    | Spec gap (feature not fully implemented) | `/archi.edit <ID> <supplement>` |
    | Architecture-level issue (global violation) | `/archi.revise <scope>` |
    | Incomplete feature (plan falsely marked done) | `/archi.code <ID>` |
    | Minor issue (naming, comments, simplification) | Address in next `/archi.code` |

    **Report Structure**:
    1.  Audit summary (mode, scope, date)
    2.  Findings list (sorted by severity: CRITICAL → WARNING → INFO)
    3.  Statistics summary (count per severity level)
    4.  Fix ticket summary (directly executable command list)
    5.  Next Steps table

    **Write Report File**:
    - Task-level → `[[__DOCS_DIR__]]/features/<id>_<Slug>/audit.md` (overwrite)
    - Project-level → `[[__DOCS_DIR__]]/audits/YYYY-MM-DD.md` (date-archived, same-day overwrite)

    **Output**: Complete audit report (output to both conversation and file).
</step_3_report>

</protocol_audit>

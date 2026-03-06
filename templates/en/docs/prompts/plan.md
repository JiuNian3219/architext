<protocol_plan>
  **Trigger**: `/archi.plan <ID> [context]` | Auto-loaded by Workflow Dispatch on natural language trigger
  **Goal**: Define task Spec/UI/Plan through deep architecture interview.
  **Input**:
  - `<ID>` (required): Existing task ID in Roadmap. Must create via `/archi.scope` or `/archi.inherit` first.
  - `[context]` (optional): Known context for the task (e.g. requirement descriptions, references, constraints). When provided, serves as pre-input for step_2 interview, reducing questions.

<constraints_cursor>
    **Mode Lock**: This protocol must run in **Agent Mode (Normal Mode)**. Do not switch to Plan Mode or other read-only modes.
</constraints_cursor>

<meta>
    <style>Architectural, Exhaustive, Strict, Technology-Agnostic</style>
    <language>English</language>
    <principles>
      1.  **Global First**: Local task birth must accompany global index (Map/Data/Dict) updates.
      2.  **AI-Native Perspective**: All option Pros/Cons from AI Agent perspective. Focus: Context Locality, Type Safety, Boilerplate, Ambiguity.
      3.  **Flexible Interaction**: Options are heuristic suggestions; support multi-select, hybrid, or custom.
      4.  **Audit-Gated**: Only audited docs can be delivered.
      5.  **IDE-Native First**: Leverage IDE native capabilities to drive execution rhythm; this protocol defines quality standards and checkpoints, not fight IDE planning/execution mechanisms.
    </principles>
</meta>

<step_1_load>
    **Action**:
    1.  **Pre-flight**: Read roadmap.json; read only `<ID>` entry and direct deps' `id/title/status`; reject if deps incomplete (unless user forces).
    2.  **Load**: vision.md (North Star + design philosophy only), 02_tech_stack.md (red lines + §9 project conventions; extract Error Handling/Data Flow/Auth inheritance), (UI projects only) design_tokens.json + ui_context.md (locate screen IDs, lock scope for step_4; do not invent new IDs; skip if absent), (Data projects only) data_snapshot.json.
    3.  **Dependency Context** (when deps exist): Read only dep task spec.md Interface/Type section; skip if no ref. Stub dep → extract public interfaces from associated files.
    4.  **Refs** (if any): Read refs/index.json; match by tag semantics; load only matched ref files; skip if absent.

    **Output**: Output **Task Context Brief** to user — include task type (from ID prefix), goal (highlight [User Preset]), upstream deps and key interfaces, project feature tags, tech constraints, design philosophy, project conventions (§9 values, or "not set"), external ref ids (matched). Retain full context internally; enter step_2_complexity.
</step_1_load>

<step_2_complexity>
    **Action**: Detect task type, assess complexity, decide flow path.

    **⓪ Task Type + granularity red lines**:

    | ID Prefix | Task Type | spec § 2 Primary Dimension | § 4 Interface | AC Cap | Phase Cap |
    |:---|:---|:---|:---|:---|:---|
    | `INF-` | Infrastructure | Structural (config contracts) | **Required** | ≤ 8 Contracts | ≤ 5 |
    | `FEAT-` | Feature | Behavioral (scenarios) | Required when has downstream deps | ≤ 6 Scenarios | ≤ 4 |
    | `POLISH-` | Quality | Quantitative (targets) | Usually omit | ≤ 4 Targets | ≤ 3 |
    | `EDIT-` | Edit | Inherit from original | Inherit | Inherit | Inherit |

    > Mixed tasks may combine dimensions in § 2 with sub-headings. Trigger split when estimate exceeds cap.

    **① Complexity verdict**:

    | Signal | Verdict | Flow |
    |:---|:---|:---|
    | No deps + no new entities + no arch decision + estimated ≤3 tasks | **Simple** | Skip step_2; generate spec + plan directly (condensed single Phase; confirm at signoff) |
    | Has deps OR new entities OR arch decision needed | **Standard** | Execute step_2 Unified Proposal normally |

    **② Design signal detection** (after Standard):

    | Signal | Verdict |
    |:---|:---|
    | AI- contains complexity warning OR involves custom state machine / non-trivial algorithm / multi-component coordination / retry recovery | **Standard + Design** (step_2 output mechanism preview; step_4 add design.md) |
    | Standard CRUD / config / simple integration | **Standard** |
</step_2_complexity>

<step_3_interview>
    **Role**: Architect

    ---

    ### Unified Proposal (one-shot)

    **Core principle**: Merge task design and architecture decisions into **one output**; user confirms or overrides in one round.

    **Action**:

    #### Part 1: Task Design

    AI **decides which modules to output** by task nature; select from:

    | Material | When applicable |
    |:---|:---|
    | Flow description (user journey / system flow / command flow) | Multi-step interaction or processing chain |
    | Core entities and data | New or modified entities; existing use `→ ref: data_snapshot.json#EntityName` |
    | Touchpoints (page / command / endpoint / method) | User-facing or external surface |
    | Pre-defined decisions | When goal has `[User Preset]` → highlight and enforce strictly |

    **Reference rules**:
    - Entities/types in global → `ref: data_snapshot.json#X`; only describe **additions or changes** for this task
    - Design philosophy/principles → `ref: vision.md#PrincipleName`; no restatement
    - Upstream interfaces → `ref: tasks/<dep_ID>/spec.md#InterfaceName`
    - Existing design tokens/components → `ref: design_tokens.json#preset` / `ref: dictionary.json#component`

    **Universal requirement**: Use this task's concrete entity names and operation names; no generics

    #### Part 2: Architecture Recommendations

    [[SKILL: archi-plan-options|Follow the skill's three-step selection (convention inheritance → tag routing → recommend vs expand) to generate arch recommendations from five dimensions.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-plan-options/SKILL.md` and follow its three-step logic)]]

    When expanding Q-table, follow [[SKILL: archi-interview-protocol|skill's standard output format]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` and follow its rules)]].

    #### Part 1.5: Mechanism Preview (Complex tasks only)

    Output only when step_1_5 verdict is **Standard + Design**. List core mechanisms needing design and intended pattern (Mechanism / Pattern / Brief table). User may add/remove mechanisms or change pattern.

    #### Output Format

    Output **Task Proposal** including: task design (per Part 1), architecture table (dimension/recommendation/source/rationale), (Standard+Design only) mechanism preview table, (dimensions needing user decision only) expanded Q-table (ID/option/description/AI+/AI-, A recommended, Z custom). End with confirmation: OK to accept all; or annotate changes (design fix / dimension override / answer / mechanism change).

    **Goal**: Lock `spec`, `ui` (if applicable), `data_snapshot.json` (if applicable).

    **⌨️ INPUT**: Reply **OK** to accept all (→ enter step_4_global_sync); or free-text changes (→ enter step_3_5_refinement). No fixed format.
</step_3_interview>

<step_3_5_refinement>
    **Trigger**: User reply is not OK — contains corrections, questions, overrides, or logic conflicts.
    **Action**: Do not generate docs. Incorporate feedback, refresh Unified Proposal and re-output; await re-confirmation.
    - If task design question → Compare alternatives, re-propose design
    - If architecture dimension question → Explain differences in this task context, update recommendation
    - If dimension override → Replace recommendation directly and adjust related design

    User replies OK → enter step_4_global_sync.
</step_3_5_refinement>

<step_4_global_sync>
    **Constraint**: Must update the following global files **before** generating Task docs.

    **Boundary**: Only register **project business domain** content. Architext framework concepts (scripts, scaffold, roadmap, plan, etc.) and framework infra errors must not be registered.

    **Action Checklist**:
    1.  **`map.json`**: Register `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>` in `directoryMapping`; define module responsibility and dependencies in `logicalTopology`.
    2.  **Data governance sync** (`dictionary.json` / `error_codes.json` / `data_snapshot.json` etc.): Per `03_data_governance.md`, incrementally sync new business terms, error codes, Schema to corresponding global files.
    3.  **`map.json` featureRelations**: [[SUBAGENT: archi-feature-relations|mode: register, context: Determine if this Task is aggregator; if yes register featureRelations entry]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`, follow mode: register logic)]]

    **Output**: Diff summary of above files. Enter step_5_generate.
</step_4_global_sync>

<step_5_generate>
    **Input**: Confirmed Unified Proposal (task design + arch recommendations) + updated global context + step_1_5 Task Type.
    **Action**: Generate standard docs under `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/`.

    **1. `spec.md`** (required):
    - Template: `templates/spec.template.md`.

    **spec § 2 format by Task Type**:

    | Task Type | § 2 Primary Dimension | Format requirement |
    |:---|:---|:---|
    | Feature | Behavioral | Gherkin (Given/When/Then); each Scenario maps to concrete flow step or exception path in task design |
    | Infrastructure | Structural | Configuration Contract; one per config file/service (Path + Key Settings + Constraints + Verify). Key Settings **must state concrete values**; no generic descriptions |
    | Quality | Quantitative | Quality Target; each goal has Metric + Baseline + Target + Verify |
    | Edit | Inherit from original | Same as original task type |

    > Mixed tasks use sub-headings in § 2 to distinguish dimensions.

    **spec § 4 Interface Exports**: INF **required**; FEAT required when has downstream deps.
    **spec § 5 Constraints**: **Required** — extract relevant red lines from vision.md + 02_tech_stack.md.

    **General rules**:
    - Do not invent AC items; each must map to concrete content in task design.
    - If upstream task, must include explicit Interface/Type definitions in § 4.

    **2. `ui.md`** (when this task involves UI):
    - Template: `templates/ui.template.md`.
    - **With `ui_context.md` (primary path)**:
      1. **UI divergence check** (required before writing `ui.md`): Compare task design with screen index; identify divergence. [[SKILL: archi-ui-wireframe|Follow skill protocol to handle UI divergence]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` and follow its protocol)]].

         | Divergence Type | Criteria | Handling |
         |:---|:---|:---|
         | No divergence | Screen index matches design | Write `ui.md` directly; reference screen ID |
         | Minor addition | New state/popup/local area; overall layout unchanged | Call skill to update `ui_concept.html` + `ui_context.md`; note `MODIFIED: S-XX` |
         | Structural divergence | Layout refactor, new standalone screen, flow path change | **Pause** — output divergence summary to user; wait for **OK**; then call skill to update; then write `ui.md` |

      2. After resolving divergence, fill screen scope and delta components per `ui.template.md`.
    - **Without `ui_context.md` (fallback)**: Describe full ITP v3.0 component tree; reference `design_tokens.json` token definitions.

    **3. Complex tasks only: `design.md`**:
    - Template: `templates/design.template.md`. Generate only when **Standard + Design**.
    - § 2 Core Mechanisms: Per confirmed mechanism preview, call [[SKILL: archi-design-patterns|skill pattern selection guide and standard format to generate mechanism description and run self-check]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-design-patterns/SKILL.md` and follow its pattern format and self-check list)]].
    - § 3 Parameters: Values must be concrete; no vagueness. § 4 Invariants: Must be testable; map to plan.json test entries. § 5 Failure Modes: Must have detection + fallback. § 6 Trace Verification: Trace from each spec § 2 AC to design path; fix gaps.

    **4. `plan.json`** (required):
    - Template: `templates/plan.template.json`. Adjust Phases by project type; each Task context self-contained.
    - Each Phase must include a `rationale` field recording key design decision rationale (user choice / AI recommendation reason).

    **WBS decomposition three principles**:

    **Principle 1 — Deliverable-oriented**: Each task `title` describes **deliverable**, not activity.
    > Red Flag: `Configure TypeScript` ← should be `apps/web/tsconfig.json — strict + path aliases`

    **Principle 2 — 100% coverage**: Each spec § 2 AC → ≥1 task covers; each § 4 Interface → task creates; each § 5 Constraint → task notes references. Add if missing.

    **Principle 3 — Granularity and mutual exclusion**:
    | Signal | Verdict |
    |:---|:---|
    | Task touches ≥3 unrelated files | Too coarse — split |
    | Title cannot map to concrete output file | Too abstract — concretize |
    | Two tasks modify same file same region | Violates mutual exclusion — merge or redraw |
    | Notes single sentence with no verification | Insufficient — supplement |

    **`decisions` quality**: `rationale` must include implementation guidance; not just "why choose" but "how to configure".
    > Red Flag: `Brief explicitly requires` ← zero implementation guidance

    **`notes` quality**: Format `[output file path] · [spec ref] · [key constraints] · Verify: [executable command + expected result]`. Do not leave empty.
    > Red Flag: notes degenerate to title synonym. Each notes must contain information **not in** title.

    - Run `npx archi render` after generation to produce readable `.md` views. Enter step_6_verify.
</step_5_generate>

<step_6_verify>
    **Role**: Independent Reviewer
    [[SUBAGENT: archi-silent-audit|mode: plan-docs, context: Review step_4 generated docs (spec.md, ui.md, plan.json, design.md)]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: plan-docs review dimension table)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_signoff>
    **Terminal Gate** (do not skip): Standard check (task --check + render).
    | Step | Command | Pass Condition |
    |:---|:---|:---|
    | 1 | `npx archi task <ID> --status active` | Task marked as in-progress |

    **Pre-signoff Checklist** (confirm each item after Gate passes, before Output):
    □ spec.md § 2 — ACs/scenarios/contracts map to specific design content (no fabrication)
    □ spec.md § 4 Interface — filled (required for INF tasks / tasks with downstream deps)
    □ spec.md § 5 Constraints — extracted from vision + tech_stack (not empty)
    □ plan.json — every AC in spec § 2 → ≥1 task covering it (100% coverage rule)
    □ plan.json — every task notes includes verification field (not empty, not title paraphrase)
    □ map.json — tasks/<ID>_<Slug> registered in directoryMapping
    □ Global files — new terms/error codes/schemas synced (dictionary/error_codes/data_snapshot)
    □ Step 6 Silent Audit — executed, all CRITICAL issues resolved

    **Action** (after Checklist confirmed):
    1.  Output summary.

    **Output**: Task definition summary with architecture confirmation table (each dimension final choice and rationale) and Next Steps:

    | Priority | Action | Notes |
    |:---|:---|:---|
    | 1 | `/archi.code <ID>` | Spec and Plan are ready; start implementation (requires user confirmation) |
    | Optional | Review spec.md / plan.json | Double-check docs before coding |
</step_6_signoff>

</protocol_plan>

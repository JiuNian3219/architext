<protocol_plan_detail>
**Trigger**: Dispatched by `prompts/plan.md` router, parameter form is `<ID> [context]`
**Goal**: Define function's Spec/UI/Plan through deep architecture interview.
**Boundary**: This protocol only details one existing roadmap task and focuses on how to implement, verify, and test it. It must not split tasks, append roadmap tasks, or create task directories for natural-language requirements; if the current task is clearly too coarse, stop document generation and tell the user to return to `/archi.plan` decompose to adjust the roadmap.
**Input**:
- `<ID>` (required): Task ID existing in Roadmap. Must first decompose scope via `/archi.plan` (no param / with brief), or adopt existing code via `/archi.init` inherit mode.
- `[context]` (optional): Known context for the task (e.g. user requirement description, reference materials, constraints). When provided, serves as pre-input for step_2 interview, reducing questions.

<meta>
		<style>Architectural, Exhaustive, Strict</style>
		<language>English</language>
		<principles>
			Global First: Local function birth must accompany global index (Map/Data/Dict) update.
			Review-Gated: Only documents passing review can be delivered.
		</principles>
</meta>

<step_1_load>
1. **Pre-flight**: Read roadmap.json, only read `<ID>` entry and direct deps' `id/title/status`; if deps incomplete, reject (unless user forces).
2. **Load**: Read project context (vision, tech_stack, read feature-related JSON as needed), see 00_system.md data governance rules.
3. **Dependency Context** (when has dependencies): Only read Interface/Type sections of dependency task spec.md; skip if no reference. Stub dependency → Extract source code public interface from associated files.
4. **Refs** (if any): Read refs/index.json, match by tags semantically, only read hit ref files; skip if doesn't exist.

Output **Task Context Brief**: Task type (inferred from ID prefix) / Goal (highlight [User Preset]) / Upstream dependencies and key interfaces / Project feature tags / Technical constraints / Design philosophy / Project conventions (§9 values, "not set" if absent) / External knowledge references (hit ref id list). Keep full context internally, enter step_2_complexity.
</step_1_load>

<step_2_complexity>
Detect task type, evaluate complexity, decide flow path.

**⓪ Task Type + Document Limits**:
| ID Prefix | Task Type | spec § 2 Main Dimension | § 4 Interface | AC Upper Limit | Phase Upper Limit |
|:---|:---|:---|:---|:---|:---|
| `INF-` | Infrastructure | Structural (Configuration Contract) | **Required** | ≤ 8 Contracts | ≤ 5 |
| `FEAT-` | Feature | Behavioral (Behavior Scenarios) | Required when has downstream deps | ≤ 6 Scenarios | ≤ 4 |
| `POLISH-` | Quality | Quantitative (Quantified Goals) | Usually omitted | ≤ 4 Targets | ≤ 3 |
| `EDIT-` | Edit | Inherits original task type | Inherits | Inherits | Inherits |

> Mixed-type tasks can combine multiple dimensions in section 2, distinguished with subheadings. If the estimate exceeds these limits, the roadmap entry is too coarse; stop document generation and tell the user to return to `/archi.plan` decompose to adjust the roadmap. Do not split inside detail or write a giant task.

**① Complexity Judgment**:
| Signal | Judgment | Flow |
|:---|:---|:---|
| No dependencies + No new entities + No architecture decisions + Estimated ≤3 tasks | **Simple** | Skip step_3, directly generate spec + plan (simplified single Phase, confirm at signoff) |
| Has dependencies OR Has new entities OR Needs architecture decisions | **Standard** | Normal execution step_3 Unified Proposal |

**② Design Signal Detection** (Execute after Standard):
| Signal | Judgment |
|:---|:---|
| AI-contains complexity warning OR Involves custom state machine/non-trivial algorithm/multi-component coordination/retry recovery | **Standard + Design** (step_3 outputs mechanism preview, step_5 additionally generates design.md) |
| Standard CRUD / Configuration / Simple integration | **Standard** |
</step_2_complexity>

<step_3_interview>
### Unified Proposal (One-time Proposal)

Core principle: Combine functional design and architecture decisions into one output, user confirms or overwrites once.

#### Part 1: Task Design (Functional Design)

AI decides which modules to output based on function nature, select applicable items from following material library:

| Material | Applicable Scenarios |
|:---|:---|
| Flow description (User journey/System flow/Command flow) | When has multi-step interaction or processing chain |
[[WHEN: data | | Core entities and data | When involving new or modified entities; existing entities use `→ ref: data_snapshot.json#EntityName` reference | ]]
| Interaction surface (Pages/Commands/Endpoints/Methods) | When has user or external touchpoint |
| Existing decisions | When goal contains `[User Preset]` → Highlight and strictly follow |

**Reference Rules**:
[[WHEN: data | - Entities/types already defined in global → `ref: data_snapshot.json#X`, only describe **new or modified** parts for this function | ]]
- Design philosophy/principles → `ref: vision.md#PrincipleName`, no need to repeat
- Upstream interfaces → `ref: tasks/<dep_ID>/spec.md#InterfaceName`
[[WHEN: ui | - Existing design tokens/components → `ref: design_tokens.json#preset` / `ref: dictionary.json#component` ]]

**General Requirements**: Use this function's specific entity names, operation names to describe, do not generalize

#### Part 2: Architecture Recommendations (Architecture Suggestions)

[[SKILL: archi-plan-options | Generate architecture recommendations for this function per three-step selection logic (convention inheritance → tag routing → recommend vs expand), from five dimensions' option library]]
[[NO-SKILL: Read skills/archi-plan-options/SKILL.md and execute per three-step selection logic]]

When expanding Q-table:
[[SKILL: archi-interview-protocol | Use skill's standard output format]]
[[NO-SKILL: Read skills/archi-interview-protocol/SKILL.md and execute per its rules]]

#### Part 1.5: Mechanism Preview (Mechanism Preview) Complex tasks only:

Only output when step_2 judges **Standard + Design**. List core mechanisms needing technical solution design and proposed patterns (Mechanism / Pattern / Description table). User can add/remove mechanisms or modify pattern selection.

#### Output Format

Output **Task Proposal** containing: Functional design (per Part 1), Architecture recommendation table (Dimension/Recommendation/Source/Reason), (Standard+Design only) Mechanism preview table, (Dimensions needing user decision only) Expanded Q-table (ID/Option/Description/AI+/AI-, A is recommended, Z is custom). Append confirmation instruction at end: OK accept all; or mark modifications (Design correction/Dimension override/Question answer/Mechanism modification).

**Goal**: Lock `spec`[[WHEN: ui | , `ui`]][[WHEN: data | , `data_snapshot.json`]].

**⌨️ INPUT**: Reply **OK** to accept all (→ enter step_4_global_sync); or free text marking modifications (→ enter step_3_5_refinement). No fixed format required.
</step_3_interview>

<step_3_5_refinement>
**Trigger**: User reply is not OK, contains corrections, questions, overrides or obvious logic conflicts.
**Action**: Do not generate documents. Incorporate user feedback, refresh Unified Proposal and re-output, wait for re-confirmation.
- If functional design question → Give alternative comparison, re-propose design
- If architecture dimension question → Explain differences combined with this function's specific scenario, update recommendation
- If dimension override → Directly replace recommendation and adjust related design
User replies OK → Enter step_4_global_sync.
</step_3_5_refinement>

<step_4_global_sync>
**Constraint**: Before generating Task documents, must update following global files first.
**Boundary**: Only register project business domain content. Architext framework concepts (scaffold, roadmap, plan etc) and framework infrastructure errors must not be registered in global files.

**Checklist**:
1. **`map.json`**: Register `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>` in `directoryMapping`; Define module responsibility and dependencies in `logicalTopology`
2. **Data Governance Sync**:
   [[SUBAGENT: archi-data-sync | context: Scan new business entities/error codes/Schema/endpoints/commands/exports introduced in Task proposal, incrementally sync per 00_system.md rules]]
   [[NO-SUBAGENT: archi-data-sync | context: Scan new business entities/error codes/Schema/endpoints/commands/exports introduced in Task proposal, incrementally sync per 00_system.md rules]]
[[NO-SKILL: Read skills/archi-data-sync/SKILL.md, and execute sync in current context per its protocol]]
3. **`map.json` featureRelations**:
   [[SUBAGENT: archi-feature-relations | mode: register, context: Determine if this Task is aggregator type, if so register featureRelations entry]]
   [[NO-SUBAGENT: archi-feature-relations | mode: register, context: Determine if this Task is aggregator type, if so register featureRelations entry]]
   [[NO-SKILL: Read skills/archi-feature-relations/SKILL.md and execute per mode: register logic]]

Output: Change Diff for above files (brief). Enter step_5_generate.
</step_4_global_sync>

<step_5_generate>
[[INCLUDE: shared/test-quality.md]]

**Input**: Confirmed Unified Proposal (functional design + architecture recommendations) + Updated global context + Task Type detected in step_2.

Generate standard documents under `[[__DOCS_DIR__]]/tasks/<ID>_<Slug>/`.

**1. `spec.md`** (required):
- Template: `templates/spec.template.md`.

**spec § 2 Select dimension format by Task Type**:
| Task Type | § 2 Main Dimension | Format Requirements |
|:---|:---|:---|
| Feature | Behavioral | Gherkin (Given/When/Then), each Scenario corresponds to specific flow step or exception path in functional design |
| Infrastructure | Structural | Configuration Contract, one Contract per config file/service (Path + Key Settings + Constraints + Verify). Key Settings **must write specific values**, do not generalize |
| Quality | Quantitative | Quality Target, each optimization goal contains Metric + Baseline + Target + Verify |
| Edit | Inherits original task | Same as original task type |

> Mixed-type tasks distinguish dimensions with subheadings in § 2.

**spec § 4 Interface Exports**: INF tasks **required**, FEAT tasks required when has downstream deps.
**spec § 5 Constraints**: **Required** — Extract red lines related to this task from vision.md + tech_stack.md.

**General Rules**:
- Do not fabricate AC entries, must correspond to specific content in functional design.
- If upstream task, must include explicit Interface/Type definitions in § 4.

[[WHEN: ui |
**2. `ui.md`** (when this task involves UI):
- Template `templates/ui.template.md`.
- **Has `ui_context.md`** (main path):
  1. **UI deviation check** (must execute before writing `ui.md`): Compare functional design with screen index, identify deviations.
     [[SKILL: archi-ui-wireframe | Handle UI deviation per skill protocol]]
     [[NO-SKILL: Read skills/archi-ui-wireframe/SKILL.md and execute per its protocol]]
     | Deviation Type | Judgment Standard | Handling |
     |:---|:---|:---|
     | No deviation | Screen index matches design | Write `ui.md` directly, reference screen IDs |
     | Minor increment | New state/modal/local area, no overall layout change | Call skill to update `screens/S-XX.html` + `ui_context.md`, note `MODIFIED: screens/S-XX.html` |
     | Structural deviation | Layout refactor, new independent screen, flow path change | **Pause**, output deviation description to user, wait for **OK** then call skill to update, then write `ui.md` |
  2. After deviation handling, fill screen scope declaration and differential components per `ui.template.md`.
- **No `ui_context.md`** (fallback path): Describe component tree per full ITP v3.0, reference `design_tokens.json` Token definitions.
]]

**3. Complex tasks only: `design.md`**:
- Template: `templates/design.template.md`. Only generate in **Standard + Design**.
- § 2 Core Mechanisms:
  [[SKILL: archi-design-patterns | Generate mechanism descriptions per skill pattern selection guide and standard format and execute self-check]]
  [[NO-SKILL: Read skills/archi-design-patterns/SKILL.md and execute per its pattern format and self-check list]]
- § 3 Parameters: Values must be specific, no vagueness. § 4 Invariants: Must be testable, corresponding to plan.json test items. § 5 Failure Modes: Must have detection + degradation. § 6 Trace Verification: Trace design path from each AC in spec § 2, fill gaps if found.

**4. `plan.json`** (required):
- Template: `templates/plan.template.json`. Dynamically adjust Phases per project type; each Task context self-contained.
- Each Phase must contain `rationale` field, recording basis for key design decisions in that phase (user choice/AI recommendation reason).

**WBS Decomposition Three Principles**:
**Principle 1 — Deliverable-oriented**: Each task's `title` describes **deliverable** not activity.
> Red Flag: `Configure TypeScript` ← Should be `apps/web/tsconfig.json — strict + path aliases`

**Principle 2 — 100% Coverage**: Each AC in spec § 2 → ≥1 task coverage; Each Interface in § 4 → Has task creating; Each Constraint in § 5 → Has task notes referencing. Fill if missing.

**Principle 3 — Document Task Granularity and Mutual Exclusivity**:
| Signal | Judgment |
|:---|:---|
| Task involves ≥3 unrelated files | Too coarse — stop generation and return to decompose to adjust the roadmap |
| Title cannot correspond to specific output file | Too abstract — make concrete |
| Two tasks modify same file same area | Violates mutual exclusivity — merge or re-partition |
| Notes only has one sentence and no verification items | Insufficient info — supplement |

**`decisions` Quality**: `rationale` must contain implementation guidance, not just "why chosen", must explain "how to configure when chosen".
> Red Flag: `Brief explicitly requires` ← Zero implementation guidance

**`notes` Quality**: Format `[Output file path] · [spec reference] · [Key constraints] · Verification: [Executable command + expected result]`. Do not leave empty.
> Red Flag: Notes devolves into title synonym repetition. Each notes must contain information not present in title.

- After generation run `npx archi render` to generate readable `.md` views. Enter step_6_verify.
</step_5_generate>

<step_6_verify>
[[SUBAGENT: archi-silent-audit | mode: plan-docs, context: Review documents generated in step_5 (spec.md, ui.md, plan.json, design.md)]]
[[NO-SUBAGENT: archi-silent-audit | mode: plan-docs, context: Review documents generated in step_5 (spec.md, ui.md, plan.json, design.md)]]
[[NO-SKILL: Read skills/archi-silent-audit/SKILL.md and check item by item in current context per mode: plan-docs review dimension table]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_6_verify>

<step_7_signoff>
**Terminal Gate** (Do not skip): Standard check (task --check + render).
| Step | Command | Pass Condition |
|:---|:---|:---|
| 1 | `npx archi task --check` | No ERROR |
| 2 | `npx archi render` | View generation successful |
| 3 | `npx archi task <ID> --status active` | Task marked as in progress |

**Pre-signoff Checklist** (Verify item by item after Gate passes, before output):
□ spec.md § 2 — AC/scenarios/contracts correspond to specific content in functional design (no fabrication)
□ spec.md § 4 Interface — Filled (INF tasks / required when has downstream deps)
□ spec.md § 5 Constraints — Extracted from vision + tech_stack (non-empty)
□ plan.json — Each AC in spec § 2 → ≥1 task coverage (100% coverage principle)
□ plan.json — Each task notes contains verification field (non-empty, not title synonym repetition)
□ map.json — tasks/<ID>_<Slug> registered in directoryMapping
□ Global files — New terms/error codes/Schema/Tokens/env vars synced
  - dictionary.json + error_codes.json + env_registry.json — Required
[[WHEN: ui |   - design_tokens.json + ui_context.md ]]
[[WHEN: data |   - data_snapshot.json ]]
[[WHEN: api |   - api_snapshot.json ]]
[[WHEN: cli |   - command_api.json ]]
[[WHEN: lib |   - public_api.json ]]
□ Step 6 Silent Audit — Executed, all CRITICAL issues fixed

After all checklist items confirmed, output Task definition summary, containing architecture recommendation confirmation table (final choice per dimension and reason) and Next Steps:
| Priority | Action | Description |
|:---|:---|:---|
| 1 | `/archi.code <ID>` | Spec and Plan ready, start implementation (requires user confirmation) |
| Optional | Review spec.md / plan.json | Check documents once more before starting work |
</step_7_signoff>
</protocol_plan_detail>

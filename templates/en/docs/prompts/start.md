<protocol_kickoff>
  **Trigger**: `/archi.start [file_path]`
  **Phase**: Strategic Initialization
  **Goal**: Establish Project Constitution (Vision/Tech/Roadmap) from Project Brief.

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>English</language>
    <principles>
      1.  **Brief-Driven**: User-provided Brief file is the core input; no feature brainstorming from thin air.
      2.  **AI-Native Perspective**: All recommendations/completions from AI Agent perspective. Focus: Context Locality, Type Safety, Hallucination Risk, Self-Correction.
      3.  **User Agency First**: User-filled choices in Brief must be adopted directly; do not question or replace.
      4.  **Minimal Questions**: Ask only for information gaps; skip Step 2 when Brief is sufficient.
      5.  **Option Z Everywhere**: Supplementary questions must include `[Z] Custom`.
    </principles>
</meta>

<step_0_ingest>
    **Role**: Intelligence Analyst
    **Action**:
    1. Parse `[file_path]` from trigger:
       - If path provided → read that file
       - If not → search `project-brief.md` (project root), then `[[__DOCS_DIR__]]/project-brief.md`
       - If neither exists or empty → goto `<fallback_interview>`

    2. **Resource Accessibility Check** (must complete before parsing):
       Scan Brief for all external references (URLs, file paths, images). Try to access each; classify:

       | Status | Handling |
       |:---|:---|
       | Accessible | Read content, include in analysis |
       | Inaccessible (auth required/404/private) | Mark `[unreadable]`, report to user later |
       | Non-link references (e.g. "reference Linear's interaction") | Process normally, no fetch |

       > Purpose: Avoid AI pretending it read resources it cannot access, leading to mismatched output.

    3. Parse Brief sections, extract:
       - Project feature tags (UI/Data/CLI/Lib/API — inferred from tech fields and paragraphs)
       - Core feature list
       - Pre-defined design decisions (user's preset design for specific features/pages/flows)
       - Tech preferences (distinguish "confirmed" vs "blank/recommend")
       - Existing resources and context
       - Boundaries and constraints
       - Reference projects
       - Supplementary notes (rules/terminology/background)

    > Brief is a one-time input file; user may delete after processing.

    **Output**:
    - If any resources inaccessible → **Immediately output Resource Accessibility Report** to user, list unreadable links, ask for alternatives (screenshot, paste content, text description). Wait for user reply before continuing.
    - If all accessible or no external refs → Internal summary (no user output), proceed to `<step_1_gap_analysis>`.
</step_0_ingest>

<step_1_gap_analysis>
    **Role**: Chief Product Officer (CPO)
    **Input**: Step 0 parsing result.

    **Action**: Check Brief completeness, identify information gaps.

    **Checklist**:

    | Item | Criteria | Gap Level |
    |:---|:---|:---|
    | Project identity | Name + one-line description + problem statement all filled | Required |
    | Target users | At least core user role described | Required |
    | Core features | At least 2 concrete features, each with description | Required |
    | Tech stack – core | Language/runtime + core framework filled (non-empty) | Required |
    | Tech stack – optional | DB/ORM/CSS/deploy etc. blanks | Can supplement |
    | Project starting point | New project or existing codebase (affects architecture) | Required |
    | Existing resources | Design/brand/existing API/3rd-party services explicit? | Can supplement |
    | Style/tone | [?UI] Visual keywords / [?CLI] Output style / [?API] Doc approach | Can supplement |
    | Boundaries | At least 1 anti-goal or hard constraint declared | Suggested |
    | Success metrics | Concrete quantifiable metrics filled | Suggested |
    | Reference projects | At least 1 reference listed | Suggested |

    **Gap levels**:
    - **Required**: Must ask in Step 2
    - **Can supplement**: AI can recommend but better to confirm
    - **Suggested**: AI can infer, does not block flow

    **Decision**:
    - No "Required" gaps + no "Can supplement" gaps → skip Step 2, go to Step 3
    - Otherwise → go to Step 2

    **Output**: Brief analysis summary:
    ```
    ### BRIEF Analysis Report
    > **Project**: [name] | **Features**: [activated UI/Data/CLI/Lib/API tags]

    **Confirmed**:
    - [list of filled items]

    **Gaps (require supplement)**:
    - [gap 1]
    - [gap 2]

    **AI will auto-complete** (no action):
    - [items AI can infer]
    ```
</step_1_gap_analysis>

<step_2_supplementary>
    **Role**: Product Advisor
    **Trigger**: Only when Step 1 finds "Required" or "Can supplement" gaps.
    **Input**: Step 1 gap list. Max 3–6 questions.

    [[SKILL: Follow `archi-interview-protocol` Skill's core rules and standard output format.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` and follow its rules)]]
</step_2_supplementary>

<step_3_constitution>
    **Role**: Chief Architect
    **Input**: Full Brief text + Step 2 answers (if any).

    **Action**: Generate project constitution files in one pass. All Brief content must be consumed and routed; nothing omitted.

    ### Information Routing Rules

    | Brief content | Target file |
    |:---|:---|
    | Project identity, target users, success metrics, references | `[[__DOCS_DIR__]]/global/vision.md` |
    | Tech stack, deploy target, 3rd-party libs/services | `02_tech_stack.md` |
    | Style/tone (UI/CLI/API) | `02_tech_stack.md` (UI Protocol / Output Convention) |
    | Core feature list | `[[__DOCS_DIR__]]/global/roadmap.json` |
    | **Pre-defined design decisions** | Inject into related tasks' `goal` in Roadmap; treat as hard constraint in `/archi.plan` |
    | Boundaries and anti-goals | `[[__DOCS_DIR__]]/global/vision.md` Boundaries |
    | Existing resources (design/brand/existing API) | `[[__DOCS_DIR__]]/global/vision.md` + `02_tech_stack.md` by content |
    | **Rules/conventions/preferences** from supplementary notes | `90_custom_rules.md` |
    | **Domain terminology** from supplementary notes | `[[__DOCS_DIR__]]/global/dictionary.json` |
    | **Other background info** from supplementary notes | `[[__DOCS_DIR__]]/global/vision.md` Context |

    > Key: Any rule-like content (e.g. "comments in English", "no any") in supplementary notes must go to `90_custom_rules.md`, not discarded.

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - Fill from Brief project overview: Core Vision, Target Audience
    - Fill from Brief boundaries: Boundaries
    - Fill from Brief style/tone (if any): Design & Experience
    - Derive Product Principles from Brief references
    - Extract background context from Brief existing resources + supplementary notes
    - Fill all `[ ]` placeholders; do not retain template example text

    ### 3.2 Tech Stack (`02_tech_stack.md`)
    - Confirmed tech in Brief → write directly
    - Blank/"recommend" in Brief → AI recommends by project features; mark `(AI Recommended)` and brief rationale
    - Brief 3rd-party services/API → write in corresponding Section
    - **AX Optimization**: Prefer AI-friendly tech (Static Typing, Popular Frameworks, Convention-over-Configuration)
    - Fill all Section 1-9 (Global Mandates, Technology Selection, Coding Standards, UI Protocol[?UI], Testing, Deployment, Architecture, Anti-Patterns, **Project Conventions**)
    - Section 5 Testing: Environment Scripts must be complete
    - **Section 9 Project Conventions**: Establish global architecture conventions based on Brief and project features. `/archi.plan` will auto-inherit these instead of re-asking per feature:
      - **Error Handling**: Infer from project type — [?UI] Fail Fast + Form Validation; [?CLI] Fail Fast (stderr); [?API] Schema Validation + Fail Fast; space-separated for multi-select
      - [?UI] **Data Flow**: Based on realtime needs — no realtime → Standard Request (+ SWR/React Query if applicable); Brief mentions realtime/collab → Realtime
      - [?Web/API] **Auth & Access**: Based on Brief user roles — single role → Authenticated; multi-role → RBAC; no auth mentioned → leave empty for per-feature decision in Plan
      - Each item must have Strategy/Default + Rationale (rationale must be specific to this project)

    ### 3.3 Custom Rules (`90_custom_rules.md`)
    - Extract rule-like content from Brief supplementary notes
    - Convert Brief tech red lines into concrete prohibitions
    - If user provided nothing, keep template default

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)
    [[SKILL: Follow the `archi-decompose-roadmap` Skill protocol to generate the task chain from the Brief feature list and write to roadmap.json]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` and follow its protocol)]], then proceed to the next step immediately without user confirmation.

    ### 3.5 Other global docs (as needed)
    - `dictionary.json`: Extract domain terms from Brief
    - [?UI] `design_tokens.json`: Base tokens from UI style
    - `error_codes.json`: Predefine core error codes from feature list

    **Output**: Write all files, then run `npx archi render` to generate visual `.md`.
</step_3_constitution>

<step_4_audit>
    **Role**: Chief Auditor
    **Checklist**:
    1.  **Vision completeness**: Does `vision.md` include North Star metric and design philosophy?
    2.  **Tech Stack consistency**: Is `02_tech_stack.md` aligned with Brief preferences? Contains full stack?
    3.  **Custom Rules**: Did Brief supplementary notes/tech red lines get written to `90_custom_rules.md`?
    4.  **Roadmap compliance**: Run `npx archi task --check` to verify.
    5.  [?UI] **Design Tokens**: Does `design_tokens.json` have base color/font/spacing definitions?
    6.  **Brief alignment**: All Brief core features mapped to Roadmap tasks?
    7.  **Zero omission**: All user-provided content routed to correct files?

    Silently fix issues; mark critical ones with `Risk Warning`.
</step_4_audit>

<step_5_signoff>
    **Action**:
    1.  Run `npx archi task` to output task progress.
    2.  Output summary.

    **Output**: Project init summary including:
    - **Brief adoption**: Key decisions adopted from Brief
    - **AI completions**: Tech/decisions AI recommended and rationale
    - **Roadmap overview**: Task count and phase distribution
    - **Next Steps table**: Recommend running `/archi.plan INF-01`
</step_5_signoff>

<fallback_interview>
    **Trigger**: Brief file not found or empty.
    **Role**: Product Advisor

    **Action**:
    1. Tell user `project-brief.md` not found. Suggest:
       - Check project root for the file (should have been generated by `npx archi init`)
       - If lost, re-run `npx archi init` to regenerate
       - Or continue conversation and provide info via interview
    2. If user continues via conversation, guide in this order:
       a. What is the project? (name, one-line description, problem solved)
       b. Who is it for? (target users)
       c. Core features? (at least 2–3)
       d. Tech stack? (language/framework, confirmed parts)
       e. Constraints? (anti-goals, timeline, compatibility)
    3. After collection, write to `project-brief.md` (project root), then goto `<step_1_gap_analysis>`.

    > Fallback for backward compatibility; Brief remains the primary flow.
</fallback_interview>

</protocol_kickoff>

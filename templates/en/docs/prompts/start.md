<protocol_kickoff>
  **Trigger**: `/archi.start [file_path]`
  **Phase**: Strategic Initialization
  **Goal**: Establish project constitution (Vision/Tech/Roadmap) from Project Brief.

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>English</language>
    <principles>
      1.  **Brief-Driven**: User-provided Brief file is the core input; no task brainstorming from thin air.
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
       - If not provided → search `project-brief.md` (project root), then `[[__DOCS_DIR__]]/project-brief.md`
       - If neither exists or empty → goto `<fallback_interview>`

    2. **Resource Accessibility Check** (must complete before parsing):
       Scan Brief for all external references (URLs, file paths, images). Try to access each:

       | Status | Handling |
       |:---|:---|
       | Accessible | Read content, include in analysis |
       | Inaccessible (auth required/404/private) | Mark `[unreadable]`, report to user later |
       | Non-link descriptive references | Process normally, no fetch |

    3. Parse Brief sections, extract: project feature tags, core task list, pre-defined design decisions, tech preferences (distinguish "confirmed" vs "blank/recommend"), existing resources, boundaries and constraints, reference projects, supplementary notes.

    > Brief is a one-time input file; user may delete after processing.

    **Output**:
    - If any resources inaccessible → **Immediately output Resource Accessibility Report**, wait for user reply before continuing.
    - If all accessible or no external refs → Internal summary, proceed to `<step_1_gap_analysis>`.
</step_0_ingest>

<step_1_gap_analysis>
    **Role**: Chief Product Strategist (CPO)
    **Input**: Step 0 parsing result.

    **Action**: Check Brief completeness item by item, identify information gaps.

    **Checklist**:

    | Item | Criteria | Gap Level |
    |:---|:---|:---|
    | Project identity | Name + one-line description + problem statement all filled | Required |
    | Target users | At least core user role described | Required |
    | Core tasks | At least 2 concrete tasks listed, each with description | Required |
    | Tech stack – core | Language/runtime + core framework filled (non-empty) | Required |
    | Tech stack – optional | DB/ORM/CSS/deploy etc. blanks | Can supplement |
    | Project starting point | New or existing codebase (affects architecture) | Required |
    | Existing resources | Design/brand/existing API/3rd-party services explicit? | Can supplement |
    | Style/tone | (UI projects only) Visual keywords / (CLI projects only) Output style / (API projects only) Doc approach | Can supplement |
    | Boundaries | At least 1 anti-goal or hard constraint declared | Suggested |
    | Success metrics | Concrete quantifiable metrics filled | Suggested |
    | Reference projects | At least 1 reference listed | Suggested |

    **Gap levels**: Required → must ask in Step 2 | Can supplement → AI can recommend, suggest confirm | Suggested → AI can infer

    **Decision**: No "Required" + "Can supplement" gaps → skip Step 2 | Has gaps → proceed to Step 2

    **Output**: Output BRIEF analysis report to user — include project name/feature tags, confirmed items list, information gap list (require supplement), AI auto-complete items.
</step_1_gap_analysis>

<step_2_supplementary>
    **Trigger**: Only when Step 1 finds "Required" or "Can supplement" gaps.
    **Input**: Step 1 gap list. Max 3–6 questions.

    [[SKILL: archi-interview-protocol|Follow the skill's core rules and standard output format for questioning.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-interview-protocol/SKILL.md` and follow its rules)]]
</step_2_supplementary>

<step_3_constitution>
    **Role**: Chief Architect
    **Input**: Full Brief + Step 2 supplement answers (if any).

    **Action**: Generate project constitution files in one pass. All Brief content must be consumed and routed; nothing omitted.

    ### Information Routing Rules

    > Rule files (`02_tech_stack`, `90_custom_rules`, etc.) are already injected into context by IDE; AI knows their paths, write directly.

    | Brief content | Target file |
    |:---|:---|
    | Project identity, target users, success metrics, references | `[[__DOCS_DIR__]]/global/vision.md` |
    | Tech stack, deploy target, 3rd-party libs/services | rule file `02_tech_stack` |
    | Style/tone — aesthetic direction / density / motion preference | `02_tech_stack` (UI Protocol) + `design_tokens.json` |
    | (UI projects only) Aesthetic preset + visual reference (brand palette / font / icon / competitor screenshots) | `design_tokens.json` corresponding fields + `vision.md` Visual Reference |
    | Core task list | `[[__DOCS_DIR__]]/global/roadmap.json` |
    | Pre-defined design decisions | Inject into Roadmap task `goal`; hard constraint in `/archi.plan` |
    | Boundaries and anti-goals | `vision.md` Boundaries |
    | Existing resources | `vision.md` + `02_tech_stack` by content |
    | Rules/conventions/preferences from supplementary notes | rule file `90_custom_rules` |
    | Domain terminology from supplementary notes | `dictionary.json` |
    | Other background from supplementary notes | `vision.md` Context |

    > Key: Rule-like content in supplementary notes must go to `90_custom_rules`; do not discard.

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - Fill from Brief: Core Vision / Target Audience / Boundaries / Design & Experience / Product Principles / background context
    - Fill all placeholders; do not retain template example text

    ### 3.2 Tech Stack (rule file `02_tech_stack`)
    - Brief confirmed → write directly | Blank/"recommend" → AI recommends and mark `(AI Recommended)` + rationale
    - **AX Optimization**: Prefer AI-friendly tech when recommending
    - Fill complete Section 1-9
    - **Section 9 Project Conventions**: Establish global conventions by project features (Error Handling / Data Flow / Auth & Access); `/archi.plan` will auto-inherit
      - Error Handling: (UI projects only) Fail Fast + Form Validation / (CLI projects only) Fail Fast (stderr) / (API projects only) Schema Validation + Fail Fast
      - (UI projects only) Data Flow: No realtime need → Standard Request / Brief mentions realtime → Realtime
      - (UI or API projects only) Auth & Access: Single role → Authenticated / Multi-role → RBAC / No description → leave empty for Plan
      - Each item must have Strategy/Default + Rationale

    ### 3.3 Custom Rules (rule file `90_custom_rules`)
    - Extract rule-like content from Brief supplementary notes + convert tech red lines to prohibitions

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)
    [[SKILL: archi-decompose-roadmap|Follow the skill protocol to generate task chain from Brief task list, write to roadmap.json; proceed to next step immediately without user confirmation.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-decompose-roadmap/SKILL.md` and follow its protocol)]]

    ### 3.5 Other global docs (as needed)
    - `dictionary.json`: Extract domain terms from Brief
    - (Data projects only) `data_snapshot.json`: Initialize core entity skeleton; write empty template if no data description
    - (UI projects only) `design_tokens.json`: Fill aestheticDirection / primitivePalette / mode / motion / illustration / semanticTokens from "Style & Tone" and "Visual Reference"
    - `error_codes.json`: Predefine core error codes from task list

    ### 3.6 Map (`[[__DOCS_DIR__]]/global/map.json`)
    - `directoryMapping`: Pre-register core directory skeleton from tech_stack architecture pattern
    - `logicalTopology` / `criticalUserJourneys` / `featureRelations`: Empty array for now

    **Output**: Write all files, then run `npx archi render`.
</step_3_constitution>

<step_4_verify>
    **Role**: Independent Reviewer
    [[SUBAGENT: archi-silent-audit|mode: init, context: Review step_3 generated global files (vision, tech_stack, roadmap, dictionary, etc.)]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: init review dimension table item by item)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_4_5_ui_wireframe>
    **Trigger**: Only when project features include `ui`.
    **Action**: [[SKILL: archi-ui-wireframe|Follow the skill protocol to auto-invoke Phase 1 wireframe generation.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` and follow its protocol)]]
    - Start generation without user confirmation
    - Read the just-written vision.md + roadmap.json + design_tokens.json + 02_tech_stack
    - Write `ui_concept.html` + `ui_context.md`
    - Output Phase 1 wireframe summary; await user confirmation before Phase 2 styling
</step_4_5_ui_wireframe>

<step_5_signoff>
    **Terminal Gate** (do not skip): Standard check (task --check + render).

    **Action** (after Gate passes):
    1.  Run `npx archi task` to output task progress overview.
    2.  Output summary.

    **Output**: Project init summary, including:
    - **Brief source confirmation**: Key decisions adopted from Brief
    - **AI completions**: Tech/decisions AI recommended and rationale
    - **Roadmap overview**: Task count and phase distribution
    - **Next Steps table**:

    | Priority | Action | Notes |
    |:---|:---|:---|
    | (UI projects only) Recommended | Reply **OK** to enter Phase 2 styling | Phase 1 wireframe auto-generated; confirm layout then style |
    | Recommended | `/archi.plan INF-01` | Plan the first infrastructure task |
    | Optional | `/archi.scope <scope-brief.md>` | If more requirements to decompose, append to Roadmap |
</step_5_signoff>

<fallback_interview>
    **Trigger**: Brief file not found or empty.

    **Action**:
    1. Inform user `project-brief.md` not found. Suggest:
       - Check project root for the file (should have been generated by `npx archi init`)
       - If lost, re-run `npx archi init` to regenerate
       - Or continue conversation and provide info via interview
    2. If user chooses to continue conversation, guide in this order:
       a. What is the project? (name, one-line description, problem solved)
       b. Who is it for? (target users)
       c. What are the core tasks? (at least 2–3)
       d. Tech stack? (language/framework, confirmed parts)
       e. What constraints? (anti-goals, timeline, compatibility)
    3. After collection, write to `project-brief.md` (project root), then goto `<step_1_gap_analysis>`.

    > This mode is for backward compatibility; core flow remains Brief-driven.
</fallback_interview>

</protocol_kickoff>

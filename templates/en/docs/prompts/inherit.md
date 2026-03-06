<protocol_inherit>
  **Trigger**: `/archi.inherit [brief_path]`
  **Phase**: Legacy Adoption
  **Goal**: Reverse-engineer existing codebase to fill the init-deployed document skeleton (`[[__DOCS_DIR__]]`) with analysis results, bringing project under framework governance. Fills empty placeholders; does not overwrite user's existing content. Optionally provide Brief to supplement vision/roadmap (for skeleton repos with minimal code).

<meta>
    <style>Analytical, Systematic, Evidence-Based</style>
    <language>English</language>
    <principles>
      1.  **Code-Driven**: Code is the sole source of truth; no speculation on features without evidence.
      2.  **AI-Native Perspective**: Analysis from AI Agent perspective. Focus: Context Locality, Type Safety, Module Boundaries.
      3.  **User Agency First**: AI analysis must be confirmed by user. When code interpretation is ambiguous, ask user; do not decide unilaterally.
      4.  **Thorough Discovery, Layered Recording**: Read all non-third-party business code (exclude node_modules/vendor/dist and other generated artifacts), no file count limit. Record in three tiers: core modules with detailed flow documentation, shared logic with signatures and dependency relationships, pure utilities with signatures and purpose. Better to over-read than to miss — downstream protocols cannot use code that was not recorded.
      5.  **Option Z Everywhere**: Supplementary questions must include `[Z] Custom`.
    </principles>
</meta>

<step_0_recon>
    **Role**: Intelligence Analyst

    **Brief detection** (only when user provides `[brief_path]`):
    1. Parse `[brief_path]`: if path provided → read that file; if not → search `project-brief.md` (project root), then `[[__DOCS_DIR__]]/project-brief.md`
    2. If file exists and non-empty: parse Brief sections, extract project identity, core tasks, tech preferences, boundaries, supplementary notes (same as start step_0_ingest)
    3. If file missing or empty: skip Brief; subsequent steps use code only as input

    **Code reconnaissance**:
    1. Read project root config files (auto-detect type):

       | Language/Ecosystem | Config Files |
       |:---|:---|
       | Node.js | package.json, tsconfig.json |
       | Rust | Cargo.toml |
       | Go | go.mod |
       | Python | pyproject.toml, requirements.txt |
       | Java | pom.xml, build.gradle |
       | Other | Use root directory config files |

    2. Read README.md (if exists).
    3. Scan directory structure (full depth).
    4. Infer project feature tags (UI / Data / CLI / Lib / API — from directory structure, deps, and config).
    5. Identify entry points and core modules. Trace import chains from entry points to build a module dependency sketch.

    **Output**: Internal summary (not shown to user), proceed to step_1.
</step_0_recon>

<step_1_analysis>
    **Role**: Chief Product Strategist (CPO)
    **Scan strategy**: Deep scan — starting from entry files, follow call chains to read all business files. For large modules (>10 files), prioritize files imported by multiple consumers.

    **Action**:
    1. For each identified functional module:
       - Starting from entry file, follow import/call chains layer by layer until the module's main business logic is covered
       - Extract main flows (user action → system processing → result)
       - Record associated file paths
    2. For shared/infrastructure code (utils, middleware, config):
       Read all files and record in two tiers:
       - **Medium tier** (business shared logic: auth/validation/error-handling/permission): record responsibility + exported function signatures + dependents
       - **Brief tier** (pure utility functions: format/slugify/logger/helpers): record function name + parameter signature + one-line purpose
       Both tiers write to map.json publicAPI field, ensuring downstream protocols can discover and reuse.
    3. Extract domain terminology and naming conventions from code.

    **Output**: Output structured analysis report to user — include project overview (name/type/scale), tech stack table (language/framework/build/test/deploy), architecture pattern and evidence, functional module list (module/source location/responsibility/key flows), shared infrastructure (directory/responsibility/key exported interfaces), domain terminology, AI uncertain items (if any).

    **Gate**: User confirms or corrects. Do not proceed to step_2 without confirmation.
</step_1_analysis>

<step_2_supplementary>
    **Trigger**: Only when step_1 has items AI cannot determine. Skip if no ambiguity.

    **Action**: Ask ambiguous items in multiple-choice format.
    - 3–5 options per question + `[Z] Custom`; AI recommendation marked `[Recommended]`.
    - Total questions capped at 3.

    Common ambiguities:
    - Architecture pattern cannot be confirmed
    - Certain directory responsibility unclear
    - Vision info (North Star metric, design philosophy) cannot be inferred from code

    **Output Format**:
    ```
    ### Supplementary Confirmation

    **[Q1] Question title**
    > Why this info is needed

    | ID | Option | Description |
    |:---|:---|:---|
    | A [Recommended] | ... | ... |
    | B | ... | ... |
    | Z | Custom | (Please describe) |

    ---
    **INPUT**: `Q1 answer | Q2 answer | ...`
    ```
</step_2_supplementary>

<step_3_constitution>
    **Role**: Chief Architect
    **Input**: Step 0 Brief parse (if any) + Step 1 analysis report + Step 2 supplements (if any).
    **Action**: Fill the init-deployed document skeleton in one pass. **With Brief**: Brief takes precedence for vision/roadmap/tech_stack; code still used for map, LEG-xx, directory structure. **Without Brief**: Code only as input (original logic).

    ### Information Routing Rules

    > Rule files (`02_tech_stack`, `90_custom_rules`, etc.) are already injected into context by IDE; AI knows their paths, write directly.

    **With Brief** (Brief → target file):
    | Brief content | Target file |
    |:---|:---|
    | Project identity, target users, success metrics, references | `[[__DOCS_DIR__]]/global/vision.md` |
    | Tech stack, deploy target, 3rd-party libs/services | rule file `02_tech_stack` |
    | Core task list | `[[__DOCS_DIR__]]/global/roadmap.json` (phase-1/2, call archi-decompose-roadmap) |
    | Rules/conventions/preferences from supplementary notes | rule file `90_custom_rules` |
    | Style/tone (UI only) | `design_tokens.json` aestheticDirection etc. |

    **From code** (always applies):
    | Source | Target file |
    |:---|:---|
    | README description/features | vision.md |
    | Dependencies/config/code patterns | 02_tech_stack |
    | Directory structure/module deps/user journeys | map.json |
    | Domain terminology/naming conventions | dictionary.json |
    | eslint/prettier etc. | 90_custom_rules |
    | Error codes in code | error_codes.json |
    | (UI projects only) CSS variables/theme | design_tokens.json |
    | (Data projects only) Schema/Migration | data_snapshot.json |

    ### 3.1 Vision (`[[__DOCS_DIR__]]/global/vision.md`)
    - **With Brief**: Fill from Brief (same as start); code/README as supplement only
    - **Without Brief**: Derive from README + project config; mark un-inferrable items `(AI completion — user review suggested)`
    - Do not retain template placeholders

    ### 3.2 Tech Stack (rule file `02_tech_stack`)
    - **With Brief**: Brief confirmed → write directly; blank/recommend → AI recommends; code deps as supplement
    - **Without Brief**: Existing deps/config → write directly; visible conventions → write to Coding Standards
    - Fill complete Section 1-8

    ### 3.3 Custom Rules (rule file `90_custom_rules`)
    - **With Brief**: Merge supplementary notes + code eslint/prettier
    - **Without Brief**: Extract from eslint/prettier/editorconfig; identify team conventions from code patterns

    ### 3.4 Roadmap (`[[__DOCS_DIR__]]/global/roadmap.json`)

    **With Brief**: [[SKILL: archi-decompose-roadmap|Generate phase-1/2 task chain from Brief task list]]; code functional modules → phase-0 LEG-xx (status=done). Merge both.
    **Without Brief**: Code functional modules only → phase-0 LEG-xx; phase-1/2 remain empty skeletons.

    **Structure**:
    ```json
    {
      "version": 1,
      "projectStatus": "active",
      "lastUpdated": "<date>",
      "phases": [
        {
          "id": "phase-0",
          "name": "Legacy",
          "tasks": [
            {
              "id": "LEG-01",
              "title": "<Module name>",
              "status": "done",
              "goal": "<One-line summary>. See tasks/LEG-01_<Slug>/spec.md",
              "deps": [],
              "tag": "Legacy",
              "slug": "<Slug>"
            }
          ]
        },
        { "id": "phase-1", "name": "Infrastructure", "tasks": [] },
        { "id": "phase-2", "name": "Core Features", "tasks": [] }
      ]
    }
    ```

    **Rules**:
    - Functional modules → `phase-0: Legacy`, status `done`, tag `Legacy`, ID prefix `LEG-`
    - Shared/infrastructure code does not enter roadmap; only map.json directoryMapping
    - Dependencies between LEG tasks must be in deps

    ### 3.5 Task Stub Specs

    Create `[[__DOCS_DIR__]]/tasks/LEG-xx_<Slug>/spec.md` for each LEG task:

    ```markdown
    # LEG-xx: [Title]

    > **Spec-Status**: Stub
    > **Source**: Reverse-engineered from [source path]

    ## Overview
    [One paragraph description]

    ## Key Flows
    1. **[Flow name]**: [A] → [B] → [C]

    ## Associated Files
    - [Role]: `[Path]`
    ```

    > Stub is starting point, not final state. Enrich later via `/archi.edit` (auto-triggers `step_1_5_enrich` flow).

    ### 3.6 map.json population
    - `directoryMapping`: Each core directory → `{ "path", "layer", "responsibility", "publicAPI" }`
    - `logicalTopology`: Inter-module dependencies → `{ "from", "to", "type" }` (imports / calls / extends)
    - `criticalUserJourneys`: Core flows → `{ "name", "steps": ["module → module → ..."] }`
    - `featureRelations`: Scan code to identify "aggregator modules" and record.
      **Recognition pattern**: Module that iterates/enumerates/dynamic-loads same-type modules, or described as "aggregating/listing/registering all X".
      Record format: `{ "aggregator", "sources", "evidence", "checkNote" }`

    ### 3.7 Other global docs (as needed)
    - `dictionary.json`: Extract domain terminology from code
    - (UI projects only) `design_tokens.json`: Extract from CSS variables/theme
    - (Data projects only) `data_snapshot.json`: Extract from schema/migration
    - `error_codes.json`: Extract from error definitions in code

    UI projects only: **UI concept design (Adopt mode)**: [[SKILL: archi-ui-wireframe|Invoke skill (adopt mode) to reverse-generate UI concept design from code.]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md` and follow its Adopt protocol)]]
    - Read route definitions, page components, layout files from code
    - Read design_tokens.json written in step_3 (containing CSS variables/theme extracted from code)
    - When tokens incomplete, triggers skill's built-in guidance flow
    - Write `ui_concept.html` + `ui_context.md`
    - Output UI concept design summary; await user confirmation or feedback for adjustments

    **Output**: Write all files, run `npx archi render`. Enter step_4_verify.
</step_3_constitution>

<step_4_verify>
    **Role**: Independent Reviewer
    [[SUBAGENT: archi-silent-audit|mode: init, context: Review step_3 generated global files (vision, tech_stack, roadmap, map, dictionary, stub specs, etc.)]][[NO-SKILL: (Skill not installed: read `[[__DOCS_DIR__]]/skills/archi-silent-audit/SKILL.md`, follow mode: init review dimension table item by item)]]

    [[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_signoff>
    **Terminal Gate** (do not skip): Standard check (task --check + render).

    **Action** (after Gate passes):
    1.  Run `npx archi task` to output task overview.
    2.  Output summary.

    **Output**: Reverse-engineering summary, including:
    - **Project overview**: Type, scale, core module count
    - **Legacy tasks**: LEG-xx list (ID / name / source location)
    - **Generated docs**: File list
    - **AI completions**: Mark confidence (High/Medium/Low)
    - **Next Steps**:

    | Priority | Action | Notes |
    |:---|:---|:---|
    | 1 | Review vision.md | Confirm AI-completed vision description |
    | 2 | `/archi.edit LEG-xx` | Enrich core module stubs into full spec (auto-triggers Enrich flow) |
    | 3 | `/archi.scope [file_path]` | Plan new features/major modules |
    | 4 | `/archi.plan <task ID>` | Deep-plan individual task |
</step_5_signoff>

</protocol_inherit>

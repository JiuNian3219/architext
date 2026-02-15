<protocol_kickoff>
  **Trigger**: `/archi.start [context]`
  **Phase**: Strategic Initialization
  **Goal**: Establish Project Constitution (Vision/Tech/Roadmap) through "Domain Detection → Intent Extraction → Deep Alignment → Architecture Deduction".

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>English</language>
    <principles>
      1.  **Structure over Chat**: Output must be like a structured config panel; no chatty filler.
      2.  **AI-Native Perspective**: All option Pros/Cons written from AI Agent perspective. Focus: Context Locality, Type Safety, Hallucination Risk, Self-Correction. Default to best practices.
      3.  **User Agency First**: Prioritize extracting explicit requirements from `[context]`, mark as `✅ Core`.
      4.  **Rich Menu**: Generate 6-10 extension features for the domain type.
      5.  **Option Z Everywhere**: Must include `[Z] Custom`.
    </principles>

    <output_template>
      ### ARCHITEXT DOMAIN DETECTOR
      > **Status**: [Scanning Context...] -> [Domain Type Detected]

      ### FEATURE MATRIX
      **✅ Core Modules (Core - Auto Activated)**
      1. [User Feature 1]
      2. [User Feature 2]

      **⬜ Extension Menu (Extensions)**
      | ID | Feature | Brief | Use Case | AI Implementation View |
      |:---|:---|:---|:---|:---|
      | [A] | Feature | Desc | When | Impact |
      | [Z] | **Custom** | (Please describe) | - | - |

      ### STRATEGIC DECISIONS (ADR)
      **[Q1] Decision Title**
      | ID | Option | Brief | AI+ | AI- |
      |:---|:---|:---|:---|:---|
      | A | ... | ... | ... | ... |
      | Z | Custom | (Please describe) | - | - |

      ---
      **⌨️ INPUT**: `ExtensionIDs (space separated) | Q1 | Q2 | ... | Q6 | Q7 | ...`
    </output_template>
</meta>

<step_0_benchmark>
    **Role**: Industry Researcher
    **Action**: Analyze context, list 1-3 benchmark products or open-source projects with brief reference value.
</step_0_benchmark>

<step_1_strategy>
    **Role**: Chief Product Officer (CPO)
    **Input**: `[context]` provided by user.

    **Action**:
    1. **Domain Classification**: Identify project type (Web/CLI/Backend/Library/Mobile/AI etc.).
    2. **Feature Matrix**: Extract Core features; brainstorm 6-10 Extensions.
    3. **Strategic Gap Analysis**: Generate 6 fixed strategic questions + 2-3 project-specific questions.

    ---

    **[Q1] Product DNA & Target Audience**
    > Decides complexity boundary and external dependency level.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Pure Tool | Extreme efficiency, no deps | Closed context, low hallucination | Requires high-quality algorithms |
    | B | Community / Social | Connection focused | Standardized data models | Scattered RBAC, heavy reasoning load |
    | C | Commercial / SaaS | Monetization efficiency | Fixed flows (Stripe/Auth) | Requires 3rd-party SDK integration, high token usage |
    | D | Content / Media | Content distribution | Simple structure (CRUD) | Many unstructured data edge cases |
    | E | Enterprise / Internal | Stability & compliance | Clear rules, strong-typing friendly | Extremely tedious form validation logic |
    | F | Open Source / DevKit | Ecosystem expansion | Standard design patterns | Requires massive docs and tests |
    | Z | Custom | (Please describe) | - | - |

    **[Q2] Visual & Interaction Personality** [?UI]
    > If project has UI, decides frontend code generation style and complexity; CLI/API projects may skip.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Minimalist / Clean | Minimalist whitespace | Simple CSS, layout hard to break | Requires precise spacing |
    | B | Playful / Gamified | Lively animations | None | Complex animation state management, prone to visual bugs |
    | C | Professional / Data-Dense | Info dense | High component reuse | Complex data mock and edge rendering |
    | D | Developer / Terminal | Terminal style | Pure text processing, AI excels | ANSI Escape prone to errors |
    | E | Brutalist / Neo | Anti-conventional | Free layout | Non-standard CSS, poor cross-browser consistency |
    | F | Native / System | Native style | Mature component libs, stable generation | Low customization flexibility |
    | Z | Custom | (Please describe) | - | - |

    **[Q3] Scale & Infrastructure**
    > Decides infrastructure complexity.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Hobby / Prototype | Single/Serverless | Zero ops, just business code | None |
    | B | Startup / Growth | Standard web architecture | Most common pattern in training data | Requires Docker/DB config |
    | C | High Traffic | High concurrency | None | Cache/MQ middleware, heavy context load |
    | D | Data Heavy | Massive data | Strong SQL generation capability | Complex query optimization hard to automate |
    | E | Offline / Local | Local run | None | Data sync algorithms (CRDT/Sync) extremely hard to generate correctly |
    | F | Enterprise Deployment | Private deployment | None | K8s configs verbose and error-prone |
    | Z | Custom | (Please describe) | - | - |

    **[Q4] Data Sensitivity & Compliance**
    > Decides security architecture tier and compliance requirements.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Public Data | No PII, no compliance required | No encryption overhead, fast dev | None |
    | B | User Data (PII) | Contains email/phone/address etc | Standard patterns (bcrypt/JWT) | GDPR/privacy policies add boundaries |
    | C | Financial / Payment | PCI-DSS compliance | Stripe etc. SDKs well-encapsulated | Audit logs/encryption layers complex |
    | D | Medical / Health | HIPAA or equivalent | None | Data isolation/access control extremely strict |
    | E | No Persistence | Pure computation/transformation tool | Stateless, minimal context | None |
    | Z | Custom | (Please describe) | - | - |

    **[Q5] Integration Landscape**
    > Decides system boundary and external dependency complexity.

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Standalone | No external dependencies | Closed context, zero integration risk | None |
    | B | API Consumer | Calls external APIs/services | Standard SDK call patterns | 3rd-party API changes/rate limits unpredictable |
    | C | API Provider | Exposes APIs externally | REST/GraphQL generation mature | Version compat/doc maintenance |
    | D | Platform Plugin/Extension | Embedded in host platform (VS Code/Figma/Slack etc) | None | Platform API training data scarce, version fragmentation |
    | E | Bidirectional Integration | Both consumes and provides APIs | None | Interface contract management complex |
    | Z | Custom | (Please describe) | - | - |

    **[Q6] Resource & Asset Strategy**
    > Decides how AI handles non-code resources (images/icons/audio/video/fonts).

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | Placeholders Only | Placeholder images/icons, user replaces later | Zero binary deps, pure code focus | None |
    | B | Icon/Asset Libraries | Lucide/Heroicons + Unsplash/Pexels | Deterministic references, no broken links | Library lock-in |
    | C | Programmatic Generation | SVG/CSS/Canvas graphics | AI excels at SVG generation | Complex illustrations impossible |
    | D | External CDN/Service | Reference external CDN or asset services | URL-based, simple | External dependency, may break |
    | E | Local Asset Pipeline | User provides assets, AI writes processing pipeline | Clear boundary, AI handles code only | Requires user prep |
    | Z | Custom | (Please describe) | - | - |

    **[Q7-Q9] Project-Specific Questions** (Dynamically Generated)
    > Based on `[context]` analysis, generate 2-3 critical decision questions specific to this project.
    > Each question must use table format: ≥3 options + AI+/AI- columns + `[Z] Custom`.
    > Focus: ambiguities in context, domain-specific trade-offs, unstated critical assumptions.

    ---

    **⌨️ INPUT**: `ExtensionIDs | Q1 | Q2 | ... | Q6 | Q7 | ...`
</step_1_strategy>

<step_2_tech_gate>
    **Role**: CTO
    **Input**: Step 1 selection results.

    **Action**:
    - **AX Optimization**: Prioritize AI-friendly tech when recommending stack (Static Typing, Popular Frameworks).
    - Explain why the stack suits AI generation and maintenance.

    **Required Questions**:

    **[Q1] Core Language & Runtime**

    | ID | Option | Brief | AI+ | AI- |
    |:---|:---|:---|:---|:---|
    | A | TypeScript/Node | Fullstack | Richest training data, types aid error correction | Tedious config |
    | B | TypeScript/Bun | Modern runtime | Zero config, saves tokens | Edge APIs have less training data |
    | C | Rust | System level | Compiler errors excellent for loop repair | Borrow Checker reasoning cost high |
    | D | Go | Backend | Simple syntax, only one way to write | `if err != nil` consumes many tokens |
    | E | Python | Fast development | Pseudocode-like, extremely fast generation | Dynamic typing causes hard-to-debug runtime errors |
    | F | Java/Kotlin | Enterprise | Strong typing, powerful IDE analysis | Extreme boilerplate, easily exceeds Context Window |

    **[Q2] Core Framework** (Dynamic)
    > **AX**: Prioritize "Convention over Configuration" frameworks to reduce AI decision burden.

    **[Q3] Data Persistence** (Dynamic)
    > **AX**: Prioritize Schema-typed ORMs (Prisma/Drizzle).

    **[Q4] Interface & Comm** [?UI] (Dynamic)
    > Show if project has UI. **AX**: Prioritize Component libs (Shadcn/Tailwind etc.), AI excels at composition over raw CSS; for CLI/terminal projects, consider Chalk/terminal UI libs.

    **[Q5] Quality Assurance** (Dynamic)
    > **AX**: Tests are the only means for AI self-verification. Must cover: test tools, test scope, **Runtime verification commands**.

    **[Q6] Infrastructure** (Dynamic)
    > **AX**: The more declarative the config, the better.

    ---

    **⌨️ INPUT**: `Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8`
</step_2_tech_gate>

<step_3_roadmap>
    **Role**: TPM
    **Goal**: Convert strategy into AI-executable atomic task chain.
    **Target**: `docs/global/00_roadmap.md`

    **Action**:
    1.  **Phase 1 (Infra): The "Big Bang"**
        - Must establish complete infrastructure skeleton at once.
        - [INF-01] Project Scaffolding: Directory structure, Linter, Env, Logger, Test Setup, `scripts/dev-check` script (based on `02_tech_stack.md` Runtime Verification definitions).
        - [INF-02] Core Entities (if applicable): Database Schema, User/Auth Model, Global Types.
        - Phase 2 tasks default depend on INF-01 (and INF-02).

    2.  **Phase 2 (Feature): Domain Partitioning**
        - Group by Domain (Web: User/Order/Payment; CLI: Config/User/Plugin; Script: Parser/Network/Output).
        - Tasks in different Domains are parallel by default.

    3.  **Visualization (Mermaid)**
        - Must define `classDef` (done/active/pending/blocked) in header and apply.
        - Draw direct dependency edges only; prohibited from drawing transitive dependencies.
          Example: A.Dep=[B,C], B.Dep=[C] → Graph draws `C-->B-->A` only, NOT `C-->A`.

    **Task Schema**:
    ```markdown
    ## Pending (no dependencies / all deps completed):
    - [ ] ⏳ **[ID]** Title
      - 🎯 Goal: <DoD - Input/Output/Acceptance Criteria>
      - 🔗 Dep: None
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>

    ## Blocked (has unresolved dependencies):
    - [ ] 🧱 **[ID]** Title
      - 🎯 Goal: <DoD>
      - 🔗 Dep: [Prev ID]
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>
    ```

    **Initial Status Rule**:
    - `Dep: None` or Deps completed → `⏳ pending` + `class ID pending`
    - `Dep: [XXX]` unresolved → `🧱 blocked` + `class ID blocked`
    - Prohibited from setting all tasks to pending; must differentiate by dependency status.

    > **Slug Rule**: Used for `features/<ID>_<Slug>/` naming. Must be English, PascalCase or underscore-separated.

    **Output**: Must include `<!-- TASKS_START/END -->` and `<!-- VISUAL_START/END -->` anchors.
</step_3_roadmap>

<step_4_audit>
    **Role**: Chief Auditor
    **Checklist**:
    1.  **Vision Completeness**: Does `00_vision.md` contain North Star Metric and Design Philosophy?
    2.  **Tech Stack Consistency**: Is `02_tech_stack.md` consistent with Step 2 choices? Contains complete stack declarations?
    3.  **Roadmap Compliance**: Run `npx archi task --check` to verify consistency.
    4.  [?UI] **Design Tokens**: Does `03_design_tokens.md` contain basic color/font/spacing definitions?

    Silently fix issues; mark critical issues with `⚠️ Risk Warning`.
</step_4_audit>

<step_5_signoff>
    **Action**:
    1.  Run `npx archi task` to output task progress overview.
    2.  Output summary.

    **Output**: Project initialization summary with Decisions Summary table (Q1-Q6 + project-specific choices and impacts) and Next Steps table. Recommend running `/archi.plan INF-01`.
</step_5_signoff>

</protocol_kickoff>

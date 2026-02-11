<protocol_kickoff>
  **Trigger**: `/archi.start [context]`
  **Phase**: Strategic Initialization
  **Goal**: Establish high-cohesion Project Constitution (Vision/Tech/Roadmap) through **"Domain Detection -> Intent Extraction -> Deep Alignment -> Architecture Deduction"**.

<meta>
    <style>Strict, Professional, CLI-Like</style>
    <language>English</language>
    <principles>
      1.  **Structure over Chat**: Output must be like a structured "Dashboard", strictly NO chatty filler.
      2.  **AI-Native Perspective**: 
          - All Pros/Cons must be written from the perspective of an **AI Agent (Claude/GPT)**.
          - Key Metrics: **Context Locality**, **Type Safety**, **Hallucination Risk**, **Self-Correction**.
          - **Default High Quality**: Do not ask "Quality vs Speed", default to Best Practice.
      3.  **User Agency First**: Prioritize extracting explicit requirements from `[context]`, mark as `✅ Core`.
      4.  **Rich Menu**: Generate 6-10 valuable Extension Features.
      5.  **Option Z Everywhere**: Must include `[Z] Custom`.
    </principles>
    
    <output_template>
      ### 📡 ARCHITEXT DOMAIN DETECTOR
      > **Status**: [Scanning Context...] -> [Domain Type Detected]
      
      ### 🧩 FEATURE MATRIX
      **✅ Core Modules (Core - Auto Activated)**
      1. [User Feature 1]
      2. [User Feature 2]

      **⬜ Extension Menu (Extensions - Please Select)**
      | ID | Feature Name | Brief | Use Case | AI Implementation (AX) |
      |:---|:---|:---|:---|:---|
      | [A] | Feature Name | Description | When to use | Impact on Agent |
      | ... | ... | ... | ... | ... |
      | [Z] | **Custom** | (Please enter description) | - | - |

      ### ⚙️ STRATEGIC DECISIONS (ADR)
      **[Q1] Decision Title**
      - **[A] ...**
        - **Brief**: ...
        - **Use Case**: ...
        - **AI Pros**: ...
        - **AI Cons**: ...
        - **Impact**: ...
      - **[Z] Custom**
        - ...

      **[Q2] ...**
      **[Q3] ...**

      ---
      **⌨️ INPUT (Pipeline Reply)**: `ExtensionIDs (Space separated) | Q1 | Q2 | Q3`
    </output_template>
</meta>

<step_0_benchmark>
    **Role**: Industry Researcher
    **Action**: Analyze context, list 1-3 benchmark products or open-source projects with brief reference value.
</step_0_benchmark>

<step_1_strategy>
    **Role**: CPO (Strategic Mode)
    **Input**: `[context]` provided by user.

    **Action 1: Domain Classification**
    - Identify project type.

    **Action 2: Feature Matrix Generation**
    - Extract Core.
    - Brainstorm 6-10 Extensions.
    - **AX Note**: Describe impact on AI context length.

    **Action 3: Strategic Gap Analysis**
    - Generate 3 key strategic questions.
    - **AI Perspective Rule**: Evaluate based on AI code generation difficulty.

    ---

    **[Q1] Product DNA & Target Audience**
    > *Context*: Decides complexity boundary and external dependencies.
    
    - **[A] Pure Tool**: Extreme efficiency, no deps. *Use*: Efficiency tool.
      > **AI Pros**: Closed context, self-consistent logic, low hallucination | **AI Cons**: Requires high quality algorithm gen
    - **[B] Community / Social**: Connection focused. *Use*: Social platform.
      > **AI Pros**: Standard data models | **AI Cons**: Scattered RBAC logic, heavy reasoning load
    - **[C] Commercial / SaaS**: Monetization. *Use*: SaaS.
      > **AI Pros**: Fixed flows (Stripe/Auth) | **AI Cons**: Integration with 3rd party docs, high token usage
    - **[D] Content / Media**: Content distribution. *Use*: Blog/News.
      > **AI Pros**: Simple structure (CRUD) | **AI Cons**: Handling unstructured data (HTML/Markdown) edge cases
    - **[E] Enterprise / Internal**: Stability & Compliance. *Use*: Admin/ERP.
      > **AI Pros**: Clear rules, strong typing friendly | **AI Cons**: Form & validation logic is extremely boilerplate heavy
    - **[F] Open Source / DevKit**: Ecosystem. *Use*: Framework.
      > **AI Pros**: Standard design patterns | **AI Cons**: Requires generating massive docs/tests for usability
    - **[Z] Custom**: (Please describe)

    **[Q2] Visual & Interaction Personality**
    > *Context*: Decides frontend code generation style and complexity.
    
    - **[A] Minimalist / Clean**: Minimalist, whitespace.
      > **AI Pros**: Simple CSS, layout hard to break | **AI Cons**: Precise spacing reasoning required
    - **[B] Playful / Gamified**: Animation, lively.
      > **AI Pros**: None | **AI Cons**: Complex animation state, high risk of visual bugs
    - **[C] Professional / Data-Dense**: Info dense.
      > **AI Pros**: High component reuse (Grid/Table) | **AI Cons**: Complex data mocking & edge case rendering
    - **[D] Developer / Terminal**: Terminal style.
      > **AI Pros**: Pure text processing (LLM native) | **AI Cons**: ANSI Escape Code handling prone to errors
    - **[E] Brutalist / Neo**: Anti-design.
      > **AI Pros**: Free layout | **AI Cons**: Many non-standard CSS props, hard to ensure cross-browser consistency
    - **[F] Native / System**: Native style.
      > **AI Pros**: Mature component libs, stable gen | **AI Cons**: Low styling flexibility
    - **[Z] Custom**: (Please describe)

    **[Q3] Scale & Infrastructure**
    > *Context*: Decides infra complexity.
    
    - **[A] Hobby / Prototype**: Single/Serverless.
      > **AI Pros**: Zero Ops, just biz code | **AI Cons**: None
    - **[B] Startup / Growth**: Standard Web Arch.
      > **AI Pros**: Most common pattern in training data (Happy Path) | **AI Cons**: Docker/DB config required
    - **[C] High Traffic**: High Concurrency.
      > **AI Pros**: None | **AI Cons**: Cache/MQ middleware required, heavy context load
    - **[D] Data Heavy**: Massive Data.
      > **AI Pros**: Strong SQL gen capability | **AI Cons**: Complex query optimization (Explain Analyze) hard to automate
    - **[E] Offline / Local**: Local run.
      > **AI Pros**: None | **AI Cons**: Dual-end sync algo (CRDT) extremely hard to gen correctly
    - **[F] Enterprise Deployment**: Private deploy.
      > **AI Pros**: None | **AI Cons**: K8s configs are verbose and error-prone
    - **[Z] Custom**: (Please describe)

    ---
    
    **⌨️ INPUT (Pipeline Reply)**: `ExtensionIDs | Q1 | Q2 | Q3`
</step_1_strategy>

<step_2_tech_gate>
    **Role**: CTO (Architect Mode)
    **Input**: Step 1 Result.
    
    **Action**:
    - **AX Optimization**: Prioritize **AI-Friendly Tech** (e.g., Static Typing, Popular Frameworks).
    - **Reasoning**: Explain why this stack fits AI generation & maintenance.

    **Required Question Categories**:

    **[Q1] Core Language & Runtime**
    - **[A] TypeScript/Node**: Fullstack.
      > **AI Pros**: Richest training data, Types aid correction | **AI Cons**: Config (tsconfig/eslint) is tedious
    - **[B] TypeScript/Bun**: Modern Runtime.
      > **AI Pros**: Zero config, saves tokens | **AI Cons**: Edge APIs have less training data
    - **[C] Rust**: System.
      > **AI Pros**: Compiler errors are great for AI Loop repair | **AI Cons**: Borrow Checker reasoning cost is very high
    - **[D] Go**: Backend.
      > **AI Pros**: Simple syntax, one way to do things, low hallucination | **AI Cons**: Error handling (if err != nil) consumes tokens
    - **[E] Python**: Fast Dev.
      > **AI Pros**: Pseudocode-like, fast gen | **AI Cons**: Dynamic typing leads to runtime errors hard to debug
    - **[F] Java/Kotlin**: Enterprise.
      > **AI Pros**: Strong typing, static analysis | **AI Cons**: Extreme Boilerplate, easily exceeds Context Window

    **[Q2] Core Framework** (Dynamic)
    > **AX Criteria**: Prioritize "Convention over Configuration" to reduce AI decision load.

    **[Q3] Data Persistence** (Dynamic)
    > **AX Criteria**: Prioritize Type-Safe ORMs (Prisma/Drizzle) for AI to understand schema.

    **[Q4] Interface & Comm** (Dynamic)
    > **AX Criteria**: Prioritize Component Libs (Shadcn/Tailwind), AI is better at composition than raw CSS.

    **[Q5] Quality Assurance** (Dynamic)
    > **AX Criteria**: Tests are the ONLY way for AI to self-verify.

    **[Q6] Infrastructure** (Dynamic)
    > **AX Criteria**: Declarative configs are better.

    ---
    
    **⌨️ INPUT**: `Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8`
</step_2_tech_gate>

<step_3_roadmap>
    **Role**: TPM (Execution Mode)
    **Goal**: Convert strategy into **AI-Executable** atomic task chain.
    **Target Template**: `docs/global/00_roadmap.md`

    **Action**:
    1.  **Define Phase 1 (Infra): The "Big Bang"**
        - **Principle**: Establish complete infrastructure skeleton at once.
        - **[INF-01] Project Scaffolding**: Directory structure, Linter, Env, Logger, Test Setup.
        - **[INF-02] Core Entities** (If applicable): Database Schema, User/Auth Model, Global Types.
        - **Rule**: Phase 2 tasks default dependency is INF-01 (and INF-02).

    2.  **Define Phase 2 (Feature): Domain Partitioning**
        - **Principle**: Must group by **Domain** (Tag).
        - **Applicability**: All project types (Web/CLI/Backend/Script).
            - *Web*: User, Order, Payment
            - *CLI*: ConfigCmd, UserCmd, PluginSys
            - *Script*: Parser, Network, Output
        - **Parallelism**: Tasks in different Domains are parallel by default.

    3.  **Visualization (Mermaid)**
        - **Constraint**: Must define `classDef` (done/active/pending/blocked) in Mermaid header.
        - **Apply**: Every node must have a class applied.
        - **Direct edges only**: Graph edges (`-->`) represent only the **direct, nearest** prerequisite. Do **NOT** draw edges for every entry in the Dep field.
          - The Dep field is the **complete logical dependency list** (including indirect/transitive deps), used for task scheduling.
          - The Mermaid graph is a **simplified visualization** showing only the primary execution path, keeping the diagram clean and readable.
          - Example: A.Dep=[B,C], B.Dep=[C] — graph draws `C --> B --> A` only, do **NOT** draw `C --> A`.

    **Task Schema (Standard)**:
    ```markdown
    ## Pending (no dependencies / all deps completed):
    - [ ] ⏳ **[ID]** Title
      - 🎯 Goal: <Detailed DoD - Input/Output/Criteria>
      - 🔗 Dep: None
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>

    ## Blocked (has unresolved dependencies):
    - [ ] 🧱 **[ID]** Title
      - 🎯 Goal: <Detailed DoD - Input/Output/Criteria>
      - 🔗 Dep: [Prev ID]
      - 🏷️ Tag: <Domain>
      - 📁 Slug: <English_Slug>
    ```

    **Initial Status Rule**:
    - **`Dep: None`** or all Deps completed -> use `⏳ pending` + Mermaid `class ID pending`
    - **`Dep: [XXX]`** with unresolved Deps -> use `🧱 blocked` + Mermaid `class ID blocked`
    - Do **NOT** set all tasks to `⏳ pending`. You MUST differentiate based on dependency status.

    > **Slug Rule**: Used for `features/<ID>_<Slug>/` directory naming. Must be English, PascalCase or underscore-separated (e.g. `Subscription_CRUD`, `Theme_Switch`). Title can be in any language, but Slug must be English.

    **Output Template**:
    (Must include `<!-- TASKS_START -->` / `<!-- TASKS_END -->` and `<!-- VISUAL_START -->` / `<!-- VISUAL_END -->` anchors)
</step_3_roadmap>

<step_4_audit>
    **Role**: Compliance Officer
    **Goal**: Ensure documents actually generated in this start session meet standards, intercept non-compliant content.

    **Checklist**:
    1.  **Vision Completeness**: Does `00_vision.md` include North Star Metric and Design Philosophy?
    2.  **Tech Stack Consistency**: Does `02_tech_stack.md` match Step 2 user choices? Does it include complete tech stack declarations?
    3.  **Roadmap Format Compliance**: Run `npx archi task --check` to validate task list vs Mermaid graph consistency.
    4.  **Design Tokens** (if project has UI): Does `03_design_tokens.md` include basic color/font/spacing variable definitions?

    **Action**: 
    - If issues found, **silently fix (Auto-Fix)** document content.
    - If issues are severe, mark `⚠️ Risk Warning` in output.
    
    **Bridge**: "✅ Audit Passed. Generating final confirmation..."
</step_4_audit>

<step_5_signoff>
    **Action**:
    1.  Run `npx archi task` to display project task progress overview.
    2.  Output final confirmation.

    **Output Template**:
    ```markdown
    ## ✅ Project Initialization Complete

    **Project**: `<Project Name>` | **Type**: `<Web/CLI/Backend/...>` | **Tasks**: `<Total>` (Phase 1: `<N>`, Phase 2: `<N>`)

    ### 📋 Decisions Summary
    | Question | Choice | Key Impact |
    |:---|:---|:---|
    | Q1. Product DNA | [Choice] | [Brief impact] |
    | Q2. Visual Style | [Choice] | [Brief impact] |
    | Q3. Scale | [Choice] | [Brief impact] |

    ### 🧭 Next Steps
    | Scenario | Recommended Action |
    |:---|:---|
    | **Start planning first feature** | `/archi.plan INF-01` |
    | **View roadmap** | Read `[[__DOCS_DIR__]]/global/00_roadmap.md` |
    | **Adjust tech stack** | `/archi.revise tech_stack [change description]` |
    | **View help** | `/archi.help` |

    > 💡 **Recommendation**: Run `/archi.plan INF-01` to start planning the first infrastructure task.
    ```
</step_5_signoff>

</protocol_kickoff>
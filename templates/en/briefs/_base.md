# Project Brief: [Project Name]

> Fill in as much as possible; leave uncertain fields blank. After completion, run `/archi.start project-brief.md`, and AI will complete missing information through multiple-choice questions.

---

## Project Overview

**Project Name**:
**One-liner Description**: [What the project is, who it serves, what problem it solves]
**Problem Statement**: [Core pain points of target users? Where do existing solutions fall short?]

**Target Users**:
- **Core Users**: [Role/Group]
- **Key Characteristics**: [Technical level, usage scenarios, behavioral habits]

**Success Metrics**: [How to define success? E.g., DAU 1000 / Adopted by 100+ projects / P99 < 200ms]

---

## Functional Requirements

> Core capabilities that must be implemented, describe "what to do" not "how to do it".
> AI will decompose these into specific implementation tasks; here you only need to clarify business goals.

-
-
-

---

## Business Flow

> If your project has clear user journeys or core workflows, describe them here.
> No need to draw diagrams—describe steps in text, AI will understand system behavior from them.
> Leave blank if none, AI will infer from core features.

<!-- Example format:
### [Flow Name]
1. User [action] → System [response]
2. User [action] → System [response]
3. ...
-->

---

## Existing Design Decisions

> If you have clear ideas about certain features/pages/flows, describe them here. AI will follow these in subsequent plan phases and won't overturn them.
> Leave blank if none.
>
> Example format:
> - **[Feature/Page Name]**: Describe specific behavior, flow, constraints
> - Can attach screenshots/sketches (see "Design Assets" below)

---

## Tech Stack

> Fill in confirmed items directly. Leave blank or write "recommended" for uncertain items, AI will recommend based on project characteristics.

**Project Features**: [[__PROJECT_TYPE__]]
<!-- archi init auto-fills (comma-separated feature tags); manually select from ui/data/api/cli/lib/mobile/desktop/miniapp/extension/realtime/ai -->
**Language/Runtime**: [E.g., TypeScript + Node.js 22]
**Core Framework**: [E.g., Next.js 15 / Fastify / Tauri]
**Package Manager**: [E.g., pnpm / npm / yarn / cargo]
**Build Tool**: [E.g., Vite / tsup / Webpack / esbuild / cargo / go build]
**Linter / Formatter**: [E.g., ESLint + Prettier / Biome / ruff / clippy + rustfmt]
<!-- @slot:tech -->
**Deployment Target**: [E.g., Vercel / Docker / npm publish / Binary distribution]
**Key Third-party Libraries**: [E.g., Zod, TanStack Query, Lucia Auth]

**Tech Red Lines** (Forbidden technologies/approaches):
- [E.g., No jQuery; No CSS-in-JS]

---

## Engineering Standards

> Existing engineering conventions. Leave uncertain items blank, AI will recommend reasonable defaults based on tech stack.

**Repository Type**: [Monorepo (Turborepo/Nx/pnpm workspaces) / Single Repo]
**Architecture Pattern**: [E.g., MFA / FSD / Clean Architecture / Layered / No preference (AI recommends)]
**Directory Structure**: [Existing clear structure → describe key directories / None (AI generates based on architecture pattern)]
**Branch Strategy**: [E.g., Trunk-based / Git Flow / GitHub Flow]
**Commit Convention**: [E.g., Conventional Commits (feat/fix/chore) / Custom → describe]

**AI Git Workflow** (Commit conventions when AI executes `/archi.code`):
- **Auto Commit**: [Yes - auto git commit after each Task / No - only generate commit message, user commits manually]
- **Commit Granularity**: [Per Task - one commit per Task / Per Phase - one commit per Phase / As needed]
- **Branch Strategy**: [Work directly on main / New branch per Task `feat/{task-id}`]
- **Auto Push**: [Yes / No]

**Testing Preference**: [E.g., Vitest / Jest / pytest / No special requirements]

---

## Existing Resources & Context

> What AI needs to know about existing things—avoid reinventing the wheel or making conflicting decisions.

**Project Starting Point**: [New project / Based on existing codebase (describe current state and tech debt)]
**Existing API/Backend**: [API doc link / Describe available endpoints / None (need to build from scratch)]
**Third-party Services**: [Confirmed services, e.g., Auth0, Stripe, AWS S3, Resend...]
**Existing Data**: [Existing database/data sources? Format? Need migration? / None]

---

## Design Assets

> Provide visual/design inputs for AI, directly affecting project UI and architecture decision quality.
> Two ways to provide files:
> 1. **Local files**: Put files in `brief-assets/` directory, reference using format below
> 2. **External links**: Fill in URLs directly
>
> Reference format: `- [Semantic Label] ./brief-assets/filename`
>
> Example:
> - [Competitor Reference-Homepage] ./brief-assets/linear-dashboard.png
> - [My Sketch] ./brief-assets/sketch-v1.png
> - [Brand Palette] ./brief-assets/brand-colors.pdf
> - [API Docs] ./brief-assets/api-spec.yaml
> - [Database Schema] ./brief-assets/schema.sql

**Design Screenshots**: [Reference local files using above format / Figma link / None (AI designs itself)]
**Brand Guidelines**: [Existing Logo/colors/fonts → reference files or describe / None]

---

<!-- @slot:style -->

## Boundaries & Constraints

**Explicit Non-goals** (Anti-goals):
- [E.g., No internationalization this phase / No mobile adaptation / No paid features]

**Hard Constraints**:
- **Compatibility**: [E.g., Chrome 90+ / Node 18+ / iOS 15+]
- **Performance**: [E.g., First load < 2s / API P99 < 500ms / No special requirements]
- **Compliance/Accessibility**: [E.g., WCAG 2.1 AA / GDPR / None]

---

## References & Inspiration

| Reference Project | Reference Dimension |
|:---|:---|
| [E.g., Linear] | [Interaction experience, feature management logic] |
| | |

---

## Supplementary Notes

> Any information not covered above: background stories, special requirements, reasons for existing decisions, etc.
# Project Brief: [Project Name]

> Fill in what you can; leave blank if unsure. When done, run `/archi.start project-brief.md` and AI will complete missing info via multiple-choice questions.

---

## Project Overview

**Project Name**:
**One-line description**: [What the project is, who it serves, what problem it solves]
**Problem statement**: [Core pain points for target users? Where do existing solutions fall short?]

**Target users**:
- **Primary users**: [Role/audience]
- **Key characteristics**: [Skill level, usage context, behavioral patterns]

**Success metrics**: [What counts as done? e.g.: DAU 1000 / adopted by 100+ projects / P99 < 200ms]

---

## Core Tasks

> Must-have tasks, each in one paragraph describing expected behavior.
> Detailed specs are defined in `/archi.plan`; here just clarify "what to build."

1.
2.
3.

---

## Business Process

> If your project has clear user journeys or core workflows, describe them here.
> No need for diagrams—describe steps in text; AI will infer system behavior from this.
> Leave blank if not applicable; AI will derive from core tasks.

<!-- Format reference:
### [Process name]
1. User [action] → System [response]
2. User [action] → System [response]
3. ...
-->

---

## Existing Design Decisions

> If you have clear ideas for specific tasks/pages/flows, describe them here. AI will treat these as final in the plan phase and will not override them.
> Leave blank if not applicable.
>
> Format:
> - **[Task/page name]**: Describe behavior, flow, constraints
> - May include screenshot/sketch (see "Design Assets" below)

---

## Tech Stack

> Fill in what's confirmed. Leave blank or write "recommend" for the rest; AI will recommend based on project characteristics.

**Project type**: [[__PROJECT_TYPE__]]
<!-- Auto-filled by archi init; if writing manually, choose from ui/data/api/cli/lib/mobile/desktop/miniapp/extension/realtime/ai -->
**Language/runtime**: [e.g.: TypeScript + Node.js 22]
**Core framework**: [e.g.: Next.js 15 / Fastify / Tauri]
**Package manager**: [e.g.: pnpm / npm / yarn / cargo]
**Build tool**: [e.g.: Vite / tsup / Webpack / esbuild / cargo / go build]
**Linter / Formatter**: [e.g.: ESLint + Prettier / Biome / ruff / clippy + rustfmt]
<!-- @slot:tech -->
**Deployment target**: [e.g.: Vercel / Docker / npm publish / binary distribution]
**Key third-party libraries**: [e.g.: Zod, TanStack Query, Lucia Auth]

**Technical red lines** (banned tech/approaches):
- [e.g.: No jQuery; no CSS-in-JS]

---

## Engineering Standards

> Existing team conventions. Leave blank if unsure; AI will recommend sensible defaults based on your tech stack.

**Repository structure**: [Monorepo (Turborepo/Nx/pnpm workspaces) / single repo]
**Architecture pattern**: [e.g.: MFA / FSD / Clean Architecture / layered / no preference (AI recommends)]
**Directory structure**: [already defined → describe key dirs / none (AI generates based on pattern)]
**Branching strategy**: [e.g.: Trunk-based / Git Flow / GitHub Flow]
**Commit convention**: [e.g.: Conventional Commits (feat/fix/chore) / custom → describe]
**Testing preference**: [e.g.: Vitest / Jest / pytest / no special requirements]

---

## Existing Resources & Context

> What already exists that AI should know—to avoid reinventing or making conflicting decisions.

**Project starting point**: [Greenfield / based on existing repo (brief status and tech debt)]
**Existing API/backend**: [API docs link / brief available endpoints / none (build from scratch)]
**Third-party services**: [Confirmed services, e.g.: Auth0, Stripe, AWS S3, Resend...]
**Existing data**: [Existing DB/data sources? Format? Migration needed? / none]

---

## Design Assets

> Provide visual/design input for AI—directly impacts UI and architecture decision quality.
> Two ways to provide files:
> 1. **Local files**: Place files in `brief-assets/` directory, reference by format below
> 2. **External links**: Paste URL directly
>
> Reference format: `- [semantic label] ./brief-assets/filename`
>
> Format reference:
> - [Competitor reference - home] ./brief-assets/linear-dashboard.png
> - [My sketch] ./brief-assets/sketch-v1.png
> - [Brand palette] ./brief-assets/brand-colors.pdf
> - [API docs] ./brief-assets/api-spec.yaml
> - [Database Schema] ./brief-assets/schema.sql

**Design mockups/screenshots**: [Reference local files per format above / Figma link / none (AI designs)]
**Brand guidelines**: [Existing logo/colors/fonts → reference file or describe / none]

---

<!-- @slot:style -->

## Scope & Constraints

**Explicit non-goals** (anti-goals):
- [e.g.: No i18n this release / no mobile adaption / no paid features]

**Hard constraints**:
- **Compatibility**: [e.g.: Chrome 90+ / Node 18+ / iOS 15+]
- **Performance**: [e.g.: First paint < 2s / API P99 < 500ms / no special requirements]
- **Compliance/accessibility**: [e.g.: WCAG 2.1 AA / GDPR / none]

---

## References & Inspiration

| Reference project | Reference dimension |
|:---|:---|
| [e.g.: Linear] | [Interaction UX, task management logic] |
| | |

---

## Additional Notes

> Anything not covered above: background story, special requirements, rationale for decisions, etc.

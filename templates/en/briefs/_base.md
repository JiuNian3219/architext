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

> MVP must-have tasks (recommend 3–7), each in one sentence describing expected behavior.
> Detailed specs are defined in `/archi.plan`; here just clarify "what to build."

1. 
2. 
3. 

---

## Existing Design Decisions

> If you have clear ideas for specific tasks/pages/flows, describe them here. AI will treat these as final in the plan phase and will not override them.
> Leave blank if not applicable.
>
> Format:
> - **[Task/page name]**: Describe behavior, flow, constraints
> - May include screenshot/sketch links

---

## Tech Stack

> Fill in what's confirmed. Leave blank or write "recommend" for the rest; AI will recommend based on project characteristics.

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
**Design assets**: [Figma link / design mockup screenshots / none (AI designs)]
**Brand guidelines**: [Existing logo/colors/fonts → describe or link / none]
**Existing API/backend**: [API docs link / brief available endpoints / none (build from scratch)]
**Third-party services**: [Confirmed services, e.g.: Auth0, Stripe, AWS S3, Resend...]
**Existing data**: [Existing DB/data sources? Format? Migration needed? / none]

---

<!-- @slot:style -->

## Scope & Constraints

**Explicit non-goals** (anti-goals):
- [e.g.: No i18n this release / no mobile adaption / no paid features]

**Hard constraints**:
- **Timeline**: [e.g.: 4-week MVP / no hard deadline]
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

> Anything not covered above: background story, special requirements, rationale for decisions, team tech preferences, etc.

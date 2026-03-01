<div align="center">

[简体中文](https://github.com/JiuNian3219/architext/blob/main/README.zh-CN.md) · **English**

# 🏛️ Architext

**The AI Architecture Protocol. Define first, build right.**

[![npm version](https://img.shields.io/npm/v/architext?color=blue&label=npm)](https://www.npmjs.com/package/architext)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

**Supported IDEs:** Cursor *(recommended)* · Windsurf · Trae · VS Code · Claude Code · OpenCode

</div>

> **🚧 Early-stage notice**
>
> Architext is in early development. The core workflow (init → start → plan → code) is functional, but rough edges remain. If you run into any issues, please [open an Issue](../../issues) — I'll address it quickly. Every piece of feedback directly shapes the project, and I'm grateful you're willing to try it at this stage.

---

## What is Architext?

Architext is a **Document-Driven AI Development (DDAD)** protocol that upgrades your AI coding assistant from a "random code generator" into a "rigorous world-class architect."

Before a single line of code is written, Architext forces you and your AI to align on: **what** you're building, **why** it matters, and **exactly how** it should be implemented — through structured documents that persist across every chat session.

> **No Docs, No Code.** Code is just a downstream artifact of documents.

Architext targets **small-to-medium applications**, designed for **solo developers** or **solo + AI assistant** workflows. Whether you use chat-based AI today or a future JARVIS-like persistent assistant, the document-driven approach gives AI stable context, clear execution boundaries, and keeps you in control of every decision.

Architext operates in two layers:

| Layer | How to trigger | Responsibility |
|:---|:---|:---|
| **CLI Tool Layer** | `npx archi <command>` | Deploy rule files, prompts, and skills into your project |
| **AI Command Layer** | `/archi.<command>` in AI chat | Generate documents, plan features, write code, audit |

The CLI layer bootstraps the project once. The AI command layer drives all development work on top of those files.

---

## Why Architext?

|  | AI Full-Agency Mode<br>*(Trae Solo / Bolt / v0)* | **Architext** |
|:---|:---|:---|
| **Core Assumption** | AI knows what you want | You know what you want, but haven't thought it through yet |
| **AI's Role** | Full agent — decides and executes | Product consultant + strict executor |
| **Your Role** | Reviewer (see it after it's done) | Decision-maker (see the full picture before build) |
| **Information Flow** | AI → You ("does this work?") | You → AI ("here's exactly what I need") |
| **Ownership** | AI implicitly decides the logic | You explicitly define, AI strictly executes |

> Other tools let AI make decisions for you. Architext helps you make better decisions with AI.

---

## Quick Start

**Step 1 — CLI: deploy the framework**

```bash
npm install -g architext
npx archi init
```

```
✔ Select language    › English
✔ Select IDE(s)      › Cursor   (multiselect — Cursor / Windsurf / Trae / VS Code / Claude Code / OpenCode)
✔ Select project type › Web SPA / PWA
✔ Generate project-brief.md? › Yes (fill in project requirements for /archi.start or /archi.inherit)

● Deploying Architext...
✔ Docs deployed      → .architext/
      prompts/  global/  templates/  tasks/
✔ Rules deployed     → .cursor/rules/           (Cursor: .mdc)
      00_system · 01_workflow · 02_tech_stack · 03_data_governance
      04_cli_tools · 90_custom_rules · 99_context_glue
✔ Commands deployed  → .cursor/commands/        (Cursor only)
      archi.start · archi.scope · archi.plan · archi.code · archi.audit · ...
✔ Skills deployed    → .cursor/skills/          (Cursor)
      archi-decompose-roadmap · archi-interview-protocol · archi-plan-options · archi-ui-wireframe
✔ project-brief.md generated → project root

◆ Done! Fill in project-brief.md, then run /archi.start in your AI editor.
```

**Step 2 — AI chat: initialize your project**

When you choose to generate it, `archi init` creates a tailored `project-brief.md` at your project root. Fill it in, then run:

```
/archi.start project-brief.md
```

The AI reads the brief, interviews you on key decisions, and generates the project's foundation documents (`vision.md`, `roadmap.json`, `tech_stack`, etc.).

> **Existing codebase?** Skip `/archi.start` and use `/archi.inherit` instead — it reverse-engineers your project and registers existing features as `LEG-xx` tasks. Optional: pass `project-brief.md` when the codebase is minimal (skeleton repo) to supplement vision and roadmap.

---

## How It Works

The main trunk of a project lifecycle. Everything happens in your AI chat window.

```
project-brief.md → /archi.start → [/archi.scope] → /archi.plan → /archi.code → /archi.audit
                                         ↑
                               use when you have extra requirements to decompose
```

**Stage 1 — Initialize**

```
You:  /archi.start project-brief.md

AI:   [Analyzing project brief...]
      [Interviewing you on tech stack, architecture style, project type...]

      ✔ ADDED:    .architext/global/vision.md
      ✔ ADDED:    .architext/global/roadmap.json
      ✔ ADDED:    .architext/global/dictionary.json
      ✔ ADDED:    .architext/global/error_codes.json
      ✔ ADDED:    .architext/global/ui_context.md       (UI projects only)
      ✔ ADDED:    .architext/global/ui_concept.html     (UI projects only)
      ✔ MODIFIED: .cursor/rules/02_tech_stack.mdc    (filled with project tech decisions)
      ✔ MODIFIED: .cursor/rules/90_custom_rules.mdc  (filled with team conventions)

      Next: run /archi.scope to decompose requirements into tasks.
```

> **Existing codebase?** Use `/archi.inherit` instead — it reverse-engineers your project and registers existing features as `LEG-xx` tasks. Also generates `map.json`.

**Stage 2 — Decompose (optional)**

> Use `/archi.scope` when you have requirements beyond what's in the initial brief. If the brief already covers everything, go straight to Stage 3.

```
You:  /archi.scope scope-brief.md           ← provide a file, or run bare to trigger an interview

AI:   [Reading vision.md, roadmap.json, map.json, tech_stack...]
      [Scanning existing tasks for impact analysis...]

      Decomposed into 3 tasks:
      ✔ MODIFIED: .architext/global/roadmap.json
        ADDED task FEAT-001 · auth-login        (status: pending)
        ADDED task FEAT-002 · auth-session      (status: pending, deps: FEAT-001)
        ADDED task FEAT-003 · user-profile      (status: pending, deps: FEAT-001)
```

**Stage 3 — Plan**

```
You:  /archi.plan FEAT-001

AI:   [Reading vision.md, tech_stack.md, map.json, dep specs...]
      [Interviewing you on logic, data flow, edge cases...]

      Q1. Authentication method? [A] JWT  [B] Session Cookie  [C] OAuth  [Recommended: A]
      Q2. Should sessions persist across devices? [Y/N]
      Q3. ...

You:  A | N | ...

AI:   ✔ ADDED:    .architext/tasks/FEAT-001_auth-login/spec.md
      ✔ ADDED:    .architext/tasks/FEAT-001_auth-login/plan.json
      ✔ ADDED:    .architext/tasks/FEAT-001_auth-login/ui.md           (UI projects only)
      ✔ MODIFIED: .architext/global/roadmap.json    (FEAT-001: pending → active)
      ✔ MODIFIED: .architext/global/map.json
      ✔ MODIFIED: .architext/global/dictionary.json
```

Before any code is written, review the generated documents:
- `spec.md` — Feature logic, Gherkin acceptance criteria, interface contracts
- `plan.json` — Implementation phases, file-level task breakdown, decisions
- `ui.md` — Interaction spec, references screens defined in `ui_context.md` (UI projects only)

Confirm "this is exactly what I want" — then proceed to implementation.

**Stage 4 — Implement**

```
You:  /archi.code FEAT-001

AI:   [Reading spec.md, plan.json, tech_stack.md...]
      [Status Gate: FEAT-001 is active ✔]
      [Running Silent Audit Loop: deps / tech rules / arch boundaries...]

      Implementing Phase A: Core Auth Logic
      ✔ ADDED:    src/features/auth/auth.service.ts
      ✔ ADDED:    src/features/auth/auth.controller.ts
      ✔ MODIFIED: src/app.module.ts
      ✔ MODIFIED: .architext/tasks/FEAT-001_auth-login/plan.json  (Phase A → done)
```

**Stage 5 — Audit (optional, strongly recommended)**

```
You:  /archi.audit FEAT-001       ← with ID: audits that task; without ID: project-level health check

AI:   [Reading code + spec + plan + vision + tech_stack...]

      ✔ ADDED: .architext/tasks/FEAT-001_auth-login/audit.md

      Findings: 2 issues
      [MEDIUM] Missing rate-limit on /auth/login → suggest /archi.fix
      [LOW]    Token expiry not configurable via env var → suggest /archi.edit
```

> **Daily development between commands** is driven by natural language Chat Mode — ask questions, tweak code, debug — no slash commands needed. Four of the seven rule files act as always-on base rules: `00_system`, `02_tech_stack`, `90_custom_rules`, `99_context_glue`.

---

## Commands

### AI Chat Commands

| Command | Description |
|:---|:---|
| `/archi.start [brief]` | Read a project brief and generate foundation docs (vision / roadmap / tech_stack etc.) |
| `/archi.inherit [brief]` | Reverse-engineer existing codebase; optionally pass project-brief.md to supplement vision/roadmap (skeleton repos) |
| `/archi.scope [file_path]` | Decompose extra requirements into roadmap tasks; omit file to trigger an interview |
| `/archi.plan <ID> [context]` | Deep architecture interview → spec / plan ([?UI] also ui.md + ui_concept.html); supply context to reduce questions |
| `/archi.code <ID>` | Implement from plan phase by phase; only `active` tasks are allowed |
| `/archi.edit <ID> [context]` | Update feature spec → append new dev phase; history is preserved |
| `/archi.revise [context]` | Global arch/stack change → impact assessment → cascade update on confirm |
| `/archi.audit [ID]` | Deep code audit; with ID audits a task, without ID does a project-wide health check |
| `/archi.fix [ID] <context>` | Root-cause diagnosis and bug fix; ID optional, context describes the symptom |
| `/archi.map` | Diff map.json against actual file tree and sync |
| `/archi.remove <ID>` | Decommission a feature: remove code + docs, clean roadmap/map refs |
| `/archi.help [question]` | No question: recommend next action; with question: locate relevant files and answer |

### CLI Commands

| Command | Purpose |
|:---|:---|
| `npx archi init` | Deploy framework files (rules, prompts, skills) |
| `npx archi update` | Update deployed files to latest version |
| `npx archi doctor` | Check project health |
| `npx archi render` | Generate Markdown views from JSON data |
| `npx archi task [--check]` | View / validate roadmap task status |
| `npx archi plan <id>` | Check plan completion status for a feature |
| `npx archi template <name>` | Fetch a template file to project root |
| `npx archi uninstall` | Remove Architext files from project |

---

## Core Philosophy

**① Document-Driven AI Development (DDAD)**

Code is a downstream artifact of documents. Every change starts with a document update — spec first, code second. This makes every decision traceable and every AI output predictable.

**② User Agency**

AI's job is to surface and clarify your intent — not replace your judgment. You see the complete feature logic, data flow, and interaction model *before* development begins. All critical decisions stay in your hands.

**③ Meta-Framework**

Architext doesn't impose an architecture. It enforces *whichever* architecture you choose — MFA, FSD, DDD, Clean Architecture — through rules and boundaries that the AI cannot ignore.

---

## A Note on Vision

The AI development landscape is evolving at a pace none of us fully anticipated. New models, new tools, new paradigms — every few months, the ground shifts again.

Architext is my attempt to bring some structure to how we work *with* AI in software development. It's not a claim to have found the definitive answer. It's one direction that made sense to me — grounded in the idea that clear thinking before coding leads to better outcomes, regardless of how powerful the AI becomes.

If it's useful to you, great. If you see a better way, I genuinely want to hear it.

---

## FAQ

**Q: How is this different from Cursor's Agent mode or built-in planning?**

Agent mode is great for single sessions. Architext provides persistent context that survives across sessions, team members, and even AI tool switches. Your specs live in the repo — they don't disappear when you close the chat.

---

**Q: Can I use this on an existing codebase?**

Yes. Run `/archi.inherit` — Architext analyzes your existing code and generates a document skeleton. Existing features are registered as `LEG-xx` tasks with stub specs, so you can gradually adopt the workflow without a big-bang rewrite.

> **Note**: `/archi.inherit` is still early-stage. Analysis results for large or complex repos may be incomplete and require manual cleanup. Feel free to open an Issue if you hit problems.

---

**Q: Which IDEs are supported?**

Four IDEs are currently supported. During `archi init` you manually select which ones to deploy (multiselect, any combination):

| IDE | Rules directory | Extension | Status |
|:---|:---|:---|:---|
| Cursor | `.cursor/rules/` | `.mdc` | Recommended — most thoroughly tested |
| Windsurf | `.windsurf/rules/` | `.md` | Supported |
| Trae | `.trae/rules/` | `.md` | Supported |
| VS Code | `.github/instructions/` | `.instructions.md` | Supported |
| Claude Code | `.claude/rules/` | `.md` | Supported |
| OpenCode | `.opencode/rules/` | `.md` | Supported |

Support for additional editors is planned.

---

**Q: Does this work for non-web projects?**

Yes. Architext is architecture-agnostic and project-type-agnostic. It works for CLI tools, Web apps, mini-programs, APIs, backend services, and embedded systems. The templates adapt to your project type during initialization.

---

**Q: Do I have to use every command?**

No. You can start with just `/archi.plan` + `/archi.code` and gradually adopt the rest as your team gets comfortable. The system is designed to be incrementally adoptable.

---

**Q: Is token consumption high?**

Yes. Each command loads multiple context files and performs deep analysis — **token usage is noticeably higher than casual prompting**. This is an inherent cost of document-driven development; the tradeoff is more predictable outputs and far fewer "wait, that's not what I meant" cycles.

---

<div align="center">

**[Contributing](https://github.com/JiuNian3219/architext/blob/main/CONTRIBUTING.md) · [Changelog](https://github.com/JiuNian3219/architext/blob/main/CHANGELOG.md) · [Issues](https://github.com/JiuNian3219/architext/issues)**

> This is Architext: a meta-framework protocol that makes AI work like a senior architect.

</div>

---
name: archi-ui-wireframe
type: subagent
description: UI concept design expert. Generates hi-fi ui_concept.html — when tokens are sufficient, outputs colored hi-fi design directly; when tokens are incomplete, guides user to fill them first. Supports adopt mode to reverse-capture UI state from existing code. The output is the single visual source of truth for the entire project UI; all Task-level ui.md files reference this file for their screen scope.
---

# UI Concept Design

## System Flow

```
/archi.start → roadmap.json + design_tokens.json
                      ↓
           [This Skill] archi-ui-wireframe
           reads: vision.md + roadmap.json + design_tokens.json + 02_tech_stack.md
           writes: [[__DOCS_DIR__]]/global/ui_concept.html
                      ↓
/archi.inherit → code analysis + design_tokens.json
                      ↓
           [This Skill] archi-ui-wireframe (adopt mode)
           reads: code routes/components/layouts + design_tokens.json
           writes: [[__DOCS_DIR__]]/global/ui_concept.html
                      ↓
           /archi.plan <ID>
           reads: ui_concept.html (locates screens/components this task covers)
           writes: ui.md (scope declaration only — no global layout duplication)
                      ↓
           /archi.code → reads spec.md + ui.md + ui_concept.html → writes code
```

> **Skill boundary**:
> - Responsible for: visual concept of all user-visible screens (information architecture, layout, states, transitions)
> - Not responsible for: Task-level interface contracts (spec.md), task steps (plan.json), business code

---

## Invocation Modes

| Mode | Trigger source | Scope |
|:---|:---|:---|
| Initial generation | After `/archi.start` completes | Full generation — all screens |
| Reverse adoption | After `/archi.inherit` completes | Reverse-generate all screens from code routes/components |
| Regeneration | Manual user invocation | Full rewrite (global UI redesign) |
| Append screens | After `/archi.scope` adds new tasks | Add new pages only; existing pages untouched |
| Plan refinement | `/archi.plan` discovers UI divergence | Update only the affected screen (new states / sub-screens / layout corrections) |
| Modify screens | After `/archi.edit` changes a task | Update only affected screens; leave others intact |
| Remove screens | After `/archi.remove` retires a task | Remove corresponding screens and control bar entries |

---

## Generation Protocol

### Step 1 — Load Context

**Action**:
- `vision.md` → extract: target platform, user roles, north-star metric
- `roadmap.json` → extract: all UI tasks, map to screen/state list
- `design_tokens.json` → extract: `mode.default`, `illustration.iconLibrary`, aesthetic direction
- Rule file `02_tech_stack` → extract: target platform (Web/Mobile/Desktop), navigation framework

### Step 2 — Plan Screen Inventory

(Internal step, do not output to user):

| Screen ID | Screen name | Roadmap task | State list |
|:---|:---|:---|:---|
| S-01 | [name] | [task ID] | default, loading, empty, error |
| ... | | | |

> **Screen ID Stability Rule** (CRITICAL): Screen IDs are permanent once assigned. Deleted screen IDs are retired — new screens must use new IDs (e.g., after S-07 is deleted, the next screen is S-08, not S-07). Never reuse or renumber existing IDs. All `ui.md` files reference screens by ID; any ID change will break those references.

### Step 3 — Select HTML Skeleton Spec

(Auto-adapt by target platform):

| Platform | Viewport | Top bar | Navigation |
|:---|:---|:---|:---|
| Web / Desktop SaaS | 1280×800px | Fixed header | Left sidebar |
| Web / Marketing | 1440×900px | Transparent→fixed header | Top horizontal nav |
| Mobile Web / Mini-app | 390×844px | Status bar + nav bar | Bottom TabBar |
| Tablet / Dashboard | 1024×768px | Fixed header | Collapsible sidebar |

> Platform inferred from `02_tech_stack` or vision.md target device; default to Web / Desktop SaaS if unclear.

### Step 4 — Tokens Prerequisite Check + Guidance

Read `design_tokens.json` and check key field completeness:

| Field path | Pass condition | When insufficient |
|:---|:---|:---|
| `aestheticDirection.preset` | Non-empty | Include in guidance Q1 |
| `primitivePalette.brand` | At least 1 non-empty color value | Include in guidance Q2 |
| `semanticTokens.colors` | At least `bg`/`surface`/`text` semantic mappings | Include in guidance Q2 |
| `semanticTokens.typography` | At least 1 font family declaration | AI picks from aesthetic direction (non-blocking) |
| `motion.preference` | Non-empty | Defaults to `subtle` (non-blocking) |
| `illustration.iconLibrary` | Non-empty | Fall back to self-drawn inline SVG (non-blocking); emoji substitution forbidden |

**Tokens sufficient** → proceed directly to Step 5 hi-fi generation.

**Tokens insufficient** → output structured guidance questions (max 3), then AI auto-fills tokens after user answers:

```
### Visual Style Confirmation

**[Q1] Aesthetic direction**
| ID | Option | Reference products |
|:---|:---|:---|
| A | saas-dark | Linear, Vercel |
| B | saas-light [Recommended] | Notion, Stripe |
| C | dashboard | Grafana, Datadog |
| D | Other | (Please describe) |

**[Q2] Brand primary color**
> Enter Hex value (e.g. #4F46E5), or reply "no preference" for AI to generate based on aesthetic direction

**[Q3] Information density**
| ID | Option |
|:---|:---|
| A | Generous whitespace / immersive |
| B | Moderate [Recommended] |
| C | Information-dense / dashboard style |

**INPUT**: `Q1 answer | Q2 answer | Q3 answer`
```

AI fills `design_tokens.json` (writes to file) based on answers, then continues generation. Fields already extracted from code CSS variables/theme are preserved, not overwritten.

### Step 5 — Generate Hi-fi HTML

Write to `[[__DOCS_DIR__]]/global/ui_concept.html`:

**HTML structure spec**:
```
<html>
  <head>
    <!-- Inline CSS: hi-fi visual style based on design_tokens.json -->
  </head>
  <body style="margin:0; display:flex; flex-direction:column; height:100vh; overflow:hidden;">
    <!-- Top bar: project name + current screen path (fixed, not scrollable) -->
    <header class="wf-topbar">...</header>

    <!-- Content area: scrollable, renders currently active screen -->
    <main class="wf-content" style="flex:1; overflow:auto;">
      <!-- Each screen: <section class="wf-screen" id="S-XX" data-states="default,loading,empty,error"> -->
      <!-- Each state: <div class="wf-state" data-state="default"> -->
    </main>

    <!-- Control bar: left=state switch, center=file label, right=page switch (fixed bottom, wireframe style) -->
    <footer class="wf-ctrl-bar">
      <div class="ctrl-group">
        <span class="ctrl-lbl">STATE</span>
        <!-- State pills for current screen, rendered by JS -->
      </div>
      <div class="wf-file-label">UI Concept · [Project Name]</div>
      <div class="ctrl-group">
        <span class="ctrl-lbl">PAGE</span>
        <!-- All screen page pills, rendered by JS -->
      </div>
    </footer>
  </body>
</html>
```

**Element labeling spec** (`data-el` attribute):
- Every interactive element or semantic block must have `data-el="[user-language label]"`
- Label language = Brief's primary language (Chinese project → Chinese labels, English project → English)
- Labels shown on hover via CSS `::before`, hidden by default
- When a parent is hovered, child labels auto-hide via `:has([data-el]:hover)::before { opacity:0 }`

**Interaction spec** (CSS + minimal JS, no external dependencies):
- Page switch: click PAGE pill → toggle `.wf-screen` display; JS syncs STATE pills
- State switch: click STATE pill → toggle `.wf-state` display within current screen
- Active style: `.pill.on-page` / `.pill.on-state` → `background:#444; color:#fff`
- Control bar must stay wireframe-style (grayscale, uppercase label, dashed border-top); no color

**UI Quality Standards** (CRITICAL):

| Dimension | Requirement |
|:---|:---|
| Positioning | Hi-fi interface, polished enough for developer handoff — not a wireframe |
| Card hierarchy | Use soft shadows for depth; do not substitute hard borders for shadows |
| Primary color usage | Only for CTAs and key status feedback; no more than 10% of total area |
| Global consistency | Border radius, icon sizes, spacing must be globally uniform |
| Typography | Ample whitespace, clear font size hierarchy (at least 3 levels of contrast) |
| Interaction states | All interactive elements must have hover / focus / disabled styles |
| Content fill | Use realistic content; no Lorem ipsum / "Title" / placeholder text |

**Content rules**:

| Element type | Rule |
|:---|:---|
| Headings / nav labels | Use real business names from roadmap task titles, e.g. "Dashboard", "Project List", "Settings" |
| Buttons | Write specific action text, e.g. "Create Project", "Sign In", "Save Changes" — never write "[Button]" |
| Inputs | Write placeholder text, e.g. "Search project name…", "Enter email address" |
| Lists / tables | Generate at least 3–4 rows of example data (realistic fake data in the project's domain: names, dates, statuses) |
| Chart / image areas | Use labeled rectangles, but label with the actual content type, e.g. "Line chart: visits last 7 days" not "[Chart]" |
| Empty state | Write specific empty state copy, e.g. "No projects yet — click 'Create Project' to get started" |
| Error state | Write specific error copy, e.g. "Connection failed. Please check your network and try again" |

**Aesthetic direction → design parameter mapping**:

Use `aestheticDirection.preset` to determine baseline values for design parameters (explicit Token values take priority; baselines fill empty Tokens):

| Preset | Background tone | Radius | Shadow | Font strategy | Layout traits | Reference products |
|:---|:---|:---|:---|:---|:---|:---|
| `saas-dark` | Dark (#0a-#15 range) | sm:4px md:8px | Near-zero, use borders for layering | Sans-serif, compact | High contrast, sharp edges, tight spacing | Linear, Vercel, Raycast |
| `saas-light` | White (#fafafa-#fff) | sm:6px md:12px | Soft (0 1px 3px rgba(0,0,0,0.08)) | System font or sans-serif | Breathing room, thin borders, whitespace | Notion, Stripe, GitHub |
| `dashboard` | Dark gray / dark blue | sm:8px md:12px | Card elevation (0 2px 8px) | Tabular nums + sans-serif | Card grids, info-dense, compact tables | Grafana, Datadog |
| `marketing` | Gradient / bold color blocks | lg:16px+ | Dramatic (0 8px 32px) | Large display font + refined body font | Big headings, full-width sections, visual narrative | Loom, Framer |
| `mobile-app` | Soft background | lg:16px xl:24px | Soft diffused (0 4px 16px) | System font -apple-system | Large touch targets, wide spacing, card-based | Telegram, Bear |
| `editorial` | Warm white / cream | Near-zero 0-4px | None or very faint | Serif display + sans-serif body | Narrow column, tall line-height, typography-driven | Medium, Substack |
| `brutalist` | Pure white or pure black | 0px | None | Monospace or system font | No decoration, dense, function-first | Craigslist, HN |

> `custom`: read `aestheticDirection.customDescription`, extract keywords, map to nearest preset, then layer custom adjustments on top.

**Anti-AI aesthetic blacklist** (CRITICAL — never violate during generation):

| Category | Forbidden | Use instead |
|:---|:---|:---|
| Typography | Inter, Roboto, Arial as heading font | Characterful fonts for headings (e.g. Cal Sans, General Sans, Satoshi, Outfit); body text may use system fonts |
| Colors | Purple gradient on white (signature AI default aesthetic) | Derive from `aestheticDirection`; palette must have hierarchy — one dominant color + sharp accent > evenly-distributed timid palette |
| Layout | Every screen uses the same centered card layout | Different screen types need layout variation: list vs detail vs form each have distinct character |
| Radius | Uniform rounded-lg on everything | Radius must have hierarchy: containers large, buttons medium, badges small (or uniformly 0/sm per aesthetic direction) |
| Shadow | Identical shadow-md everywhere | Shadow must match aesthetic direction: dark themes barely use shadow; light themes use layered shadow |
| Motion | Scattered transition-all everywhere | Focus on high-impact moments: orchestrated page load (staggered reveals via animation-delay) > scattered micro-interactions |
| Emoji | Using emoji as icons (🔔📁⚙️✅ etc.) → inconsistent cross-platform rendering, clashes with the overall design language | Use the icon library declared in `illustration.iconLibrary`, or plain text/symbols with `data-el` annotation |
| Overall | Every generation converges to the same look | Each project's design MUST differ by aesthetic direction — two different projects' ui_concept.html must be instantly distinguishable |

**Styling rules** (execute within aesthetic direction baseline + blacklist constraints):

| Styling dimension | Rule |
|:---|:---|
| Colors | Map with `semanticTokens.colors`; brand from `primitivePalette.brand`; empty tokens filled from aesthetic direction baseline |
| Typography | Use declared fonts from `semanticTokens.typography`; if empty, pick from aesthetic direction strategy (Google Fonts CDN), blacklisted fonts forbidden |
| Radius/Shadow | Per `layout.radius` / `layout.shadow`; empty values filled from aesthetic direction baseline |
| Motion | Apply CSS transition/animation per `motion.patterns`; prioritize orchestrated page-load staggered reveal (animation-delay) |
| Icons | `illustration.iconLibrary` set → import CDN; not set or style=none → self-drawn inline SVG (see spec below); **emoji as icons is forbidden** |
| Mode | If `mode.support` includes dark, add CSS `@media (prefers-color-scheme: dark)` + toggle button |
| Forbidden | Follow "Forbidden styles" from vision.md Visual Reference |
| Space | Create breathing room or controlled density (per aesthetic direction), avoid mechanical uniform spacing |
| Background | No flat solid-color fills — add subtle texture/gradient mesh/noise/geometric pattern per aesthetic direction |

**Self-drawn SVG spec** (use only when no `illustration.iconLibrary` is set):

```html
<!-- Stroke style (saas-dark / saas-light / dashboard) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
     style="width:1em;height:1em;vertical-align:-0.125em">…</svg>

<!-- Fill style (mobile-app / marketing) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
     fill="currentColor" style="width:1em;height:1em;vertical-align:-0.125em">…</svg>
```

Rules: ① Color 100% via `currentColor`, controlled by parent CSS `color`; ② Size follows font size (`1em`), no hardcoded px; ③ stroke-width: saas-dark/brutalist → `2`, all others → `1.5`; ④ When a complex icon is too hard to draw, use the simplest geometric substitute — emoji as fallback is forbidden.

### Step 6 — Generate AI Index

Write `[[__DOCS_DIR__]]/global/ui_context.md`:

```markdown
# UI Context
> Platform: [platform] | Generated by archi-ui-wireframe Skill
> Updated: YYYY-MM-DD | Do not edit manually

## Screen Inventory
| ID | Name | Route | States |
|:---|:---|:---|:---|
| S-01 | [name] | [route] | default, loading, ... |

## Navigation Graph
S-XX →（[trigger]）→ S-YY

## Global Shared Components
| Component | Appears On |
|:---|:---|
| [component] | S-XX, S-YY |

## Screen Structure Summary
> Extracted from ui_concept.html data-el. When writing ui.md Section 2, align with this section — do not invent layout that diverges from confirmed structure.

### S-XX · [Screen name]
**Layout**: [e.g. "centered single-column max-w-400px" or "240px left sidebar + right content area"]
**States**: default ([core entry points]) | loading (skeleton) | empty / error (if applicable)
**Key regions**: [semantic blocks + interactive elements from data-el, e.g.: top nav bar, main form area, submit button, error message area]
```

> `ui_context.md` is the sole entry point for all AI commands reading UI structure; `ui_concept.html` is for human browser preview only.

### Step 7 — Verification Checklist

- [ ] All screen colors from semanticTokens or aesthetic direction baseline — no arbitrary hardcoded Hex
- [ ] All motion durations from `motion.duration.*` — no magic numbers
- [ ] Page/state control bar remains wireframe-style grayscale (no coloring — debug tool identity)
- [ ] `data-el` labels fully preserved
- [ ] Every state (default/loading/empty/error) of every screen visually implemented
- [ ] **Icon check**: icon library set → CDN used; no icon library → self-drawn SVG used; **zero emoji**
- [ ] **Anti-AI aesthetic check**: no blacklisted fonts, no purple-gradient-on-white, layout variety, radius hierarchy
- [ ] **Identity check**: opening the HTML, one can instantly tell which aesthetic direction this follows — not a generic template
- [ ] **UI quality check**: no pure black text, layered backgrounds, soft card shadows, primary color ≤10%, interaction states complete, realistic content fill

### Step 8 — Output Gate

Output coverage summary:

```
### ui_concept.html generated
### ui_context.md generated (AI screen index)

**Aesthetic direction**: [preset value] — [reference products]
**Screen coverage** (N screens total):
| Screen | Name | States |
|:---|:---|:---|
| S-01 | [name] | N |
| ... | | |

**Applied visual spec**:
- Primary color: [Primary token value]
- Font: [display font + body font]
- Radius: [sm/md/lg values]
- Motion: [preference value]
- Theme: [default + support list]

**Navigation structure**: [e.g. "Left sidebar + top breadcrumb"]
**Platform**: [Web Desktop 1280px / Mobile 390px / ...]

> Open `[[__DOCS_DIR__]]/global/ui_concept.html` in a browser to review layout and visual output.
> Reply **OK** to confirm; or describe screen/layout/visual adjustments needed.
```

**Gate**: Complete after user replies **OK**; otherwise enter Refinement.

---

### Refinement — Iterative Polish (optional)

**Trigger**: User reply is not OK — contains layout adjustments, screen additions/removals, navigation changes, visual modifications.
**Action**: Incorporate feedback, update only the affected parts of `ui_concept.html` (no full rewrite), sync `ui_context.md` (keep screen index consistent with `ui_concept.html`), re-display summary, await confirmation.

---

### Incremental Update

**Trigger**: A screen is updated by Plan Refinement / Edit / Revise and new content needs to match the current visual spec.

**Action**:

1. Receive the list of screen IDs to update from the caller (e.g., `S-03`, `S-07`).
2. Process only the specified screens:
   - Preserve existing content within `.wf-screen#S-XX`
   - Generate new additions per current visual spec (`semanticTokens` / `motion` / `illustration`)
   - Leave all other screen content untouched
3. If new states added → sync `ui_context.md` to update the states column for the affected screen(s).
4. Output change summary:
   - `MODIFIED: ui_concept.html S-XX (incremental update, [N] new states/regions)`
   - `MODIFIED: ui_context.md S-XX (updated states list)` (only if new states were added)

> **Forbidden**: Never do a full rewrite for incremental updates. Never touch screens not in the specified list.

---

### Adopt — Reverse Adoption (Legacy UI Capture)

**Trigger**: After `/archi.inherit` completes, invoked for UI projects.
**Input**: Existing code (route definitions, page components, layout files) + design_tokens.json (may be incomplete)

**Action**:

1. **Scan UI structure**:
   - Extract page list from route definitions (React Router / Vue Router / Next.js pages / SvelteKit routes etc.)
   - Identify navigation structure from layout components (sidebar / navbar / tabbar)
   - Identify core regions and states from page components

2. **Plan screen inventory**: Same as standard flow Step 2 (assign S-XX IDs, map to LEG-xx tasks)

3. **Tokens check + guidance**: Same as standard flow Step 4
   - Prioritize extracting CSS variables / Tailwind config / theme files from existing code
   - Run guidance question flow for insufficient fields

4. **Generate HTML**: Same as standard flow Step 5 (hi-fi quality standards)
   - Use existing code UI structure as layout reference (restore, not invent from scratch)
   - Details and states may be supplemented (e.g. original code lacks empty/error states)

5. **Generate ui_context.md**: Same as standard flow Step 6

6. **Output**: Same as standard flow Step 8

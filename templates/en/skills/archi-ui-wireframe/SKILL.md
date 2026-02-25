---
name: archi-ui-wireframe
description: UI concept design expert. Generates ui_concept.html in two phases — Phase 1 outputs a grayscale wireframe (validates information architecture and screen coverage); Phase 2 applies visual styling from design_tokens.json (colors / typography / motion / illustration). The output is the single visual source of truth for the entire project UI; all Task-level ui.md files reference this file for their screen scope.
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
| Regeneration | Manual user invocation | Full rewrite (global UI redesign) |
| Append screens | After `/archi.scope` adds new tasks | Add new pages only; existing pages untouched |
| Plan refinement | `/archi.plan` discovers UI divergence | Update only the affected screen (new states / sub-screens / layout corrections) |
| Modify screens | After `/archi.edit` changes a task | Update only affected screens; leave others intact |
| Remove screens | After `/archi.remove` retires a task | Remove corresponding screens and control bar entries |

> **Phase 2 (visual styling) timing**: Phase 2 does not need to immediately follow Phase 1. Recommended to run after core tasks (≥ 50% of Roadmap tasks) have completed planning, ensuring the styled prototype is based on a stable screen structure. If a screen is updated by Plan Refinement after Phase 2, only that screen needs re-styling — a full Phase 2 rerun is not required.

---

## Two-Phase Protocol

### Phase 1 — Wireframe (Low-fi)

**Role**: Information Architect

**Goal**: Validate screen coverage completeness and navigation structure; visual details deferred to Phase 2.

**Action**:

1. **Load context**:
   - `[[__DOCS_DIR__]]/global/vision.md` → extract: target platform, user roles, north-star metric
   - `[[__DOCS_DIR__]]/global/roadmap.json` → extract: all [?UI] tasks, map to screen/state list
   - `[[__DOCS_DIR__]]/global/design_tokens.json` → extract: `mode.default`, `illustration.iconLibrary`
   - Rule file `02_tech_stack` → extract: target platform (Web/Mobile/Desktop), navigation framework

2. **Plan screen inventory** (internal step, do not output to user):

   | Screen ID | Screen name | Roadmap task | State list |
   |:---|:---|:---|:---|
   | S-01 | [name] | [task ID] | default, loading, empty, error |
   | ... | | | |

   > **Screen ID Stability Rule** (CRITICAL): Screen IDs are permanent once assigned. Deleted screen IDs are retired — new screens must use new IDs (e.g., after S-07 is deleted, the next screen is S-08, not S-07). Never reuse or renumber existing IDs. All `ui.md` files reference screens by ID; any ID change will break those references.

3. **Select HTML skeleton spec** (auto-adapt by target platform):

   | Platform | Viewport | Top bar | Navigation |
   |:---|:---|:---|:---|
   | Web / Desktop SaaS | 1280×800px | Fixed header | Left sidebar |
   | Web / Marketing | 1440×900px | Transparent→fixed header | Top horizontal nav |
   | Mobile Web / Mini-app | 390×844px | Status bar + nav bar | Bottom TabBar |
   | Tablet / Dashboard | 1024×768px | Fixed header | Collapsible sidebar |

   > Platform inferred from `02_tech_stack` or vision.md target device; default to Web / Desktop SaaS if unclear.

4. **Generate wireframe HTML** — write to `[[__DOCS_DIR__]]/global/ui_concept.html`:

   **HTML structure spec**:
   ```
   <html>
     <head>
       <!-- Inline CSS: wireframe style (grayscale, no brand colors) -->
       <!-- Wireframe palette: bg=#f5f5f5, surface=#fff, border=#d0d0d0,
            text=#333, muted=#888, accent=#555 -->
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
         <div class="wf-file-label">Low-fi Wireframe · [Project Name]</div>
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

   **Wireframe content rules**:
   - Full grayscale; brand colors deferred to Phase 2
   - Use gray rectangles + text labels for image/chart placeholder areas
   - Nav items, buttons, inputs use placeholder forms (no real content needed)
   - Each screen must include all core interaction entry points from its Roadmap task

5. **Generate AI Index** — write `[[__DOCS_DIR__]]/global/ui_context.md`:

   Extract a structured navigation index from the screen plan in step 2 (the sole AI entry point for UI structure):

   ```markdown
   # UI Context
   > Platform: [platform] | Phase: Phase 1 Wireframe (updated after Phase 2 coloring)
   > Updated: YYYY-MM-DD | Generated by archi-ui-wireframe Skill — do not edit manually

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
   > Extracted from wireframe data-el in Phase 1; refreshed to final layout after Phase 2 coloring.
   > When writing ui.md Section 2, align with this section — do not invent layout that diverges from confirmed structure.

   ### S-XX · [Screen name]
   **Layout**: [e.g. "centered single-column max-w-400px" or "240px left sidebar + right content area"]
   **States**: default ([core entry points]) | loading (skeleton) | empty / error (if applicable)
   **Key regions**: [semantic blocks + interactive elements from data-el, e.g.: top nav bar, main form area, submit button, error message area]
   ```

   > `ui_context.md` is the sole entry point for all AI commands reading UI structure; `ui_concept.html` is for human browser preview only.

6. **Output Gate**:

   After generating the wireframe, output screen coverage summary:
   ```
   ### ui_concept.html generated (Phase 1 Wireframe)
   ### ui_context.md generated (AI screen index)

   **Screen coverage** (N screens total):
   | Screen | Name | States |
   |:---|:---|:---|
   | S-01 | [name] | N |
   | ... | | |

   **Navigation structure**: [e.g. "Left sidebar + top breadcrumb"]
   **Platform**: [Web Desktop 1280px / Mobile 390px / ...]

   > Open `[[__DOCS_DIR__]]/global/ui_concept.html` in a browser to verify information architecture.
   > Reply **OK** to proceed to Phase 2 visual styling; or describe layout/screen adjustments needed.
   ```

   **Gate**: Phase 2 starts only after user replies **OK**; no styling until confirmed.

---

### Phase 1.5 — Wireframe Refinement (optional)

**Role**: Consulting Advisor
**Trigger**: User reply is not OK — contains layout adjustments, screen additions/removals, navigation changes.
**Action**: Incorporate feedback, update only the affected parts of `ui_concept.html` (no full rewrite), sync `ui_context.md` (keep screen index consistent with `ui_concept.html`), re-display summary, await confirmation.

---

### Phase 2 — Visual Styling (Hi-fi Coloring)

**Role**: Visual Designer

**Goal**: Apply the confirmed wireframe's full visual language from `design_tokens.json` to produce a hi-fi prototype.

**Prerequisite check** (must validate before styling):

| Field path | Pass condition | Blocking action |
|:---|:---|:---|
| `primitivePalette.brand` | At least 1 non-empty color value | Blocking — prompt user to fill brand color |
| `semanticTokens.colors` | At least `bg`/`surface`/`text` semantic mappings | Blocking — prompt user to define base semantic colors |
| `semanticTokens.typography` | At least 1 font family declaration | Warning (non-blocking) — AI falls back to system font |
| `motion.preference` | Non-empty | Warning (non-blocking) — defaults to `subtle` |
| `illustration.iconLibrary` | Non-empty | Warning (non-blocking) — no icon library imported |

> On any blocking item: stop immediately, output the list of missing fields, and wait for the user to fill them before re-running.

**Action**:

1. **Load visual spec**:
   - `design_tokens.json` → read in full: primitivePalette / semanticTokens / mode / motion / illustration / componentPresets
   - `vision.md` → extract Visual Reference section (brand colors, competitor screenshot descriptions, forbidden styles)

2. **Styling rules**:

   | Styling dimension | Rule |
   |:---|:---|
   | Colors | Replace grayscale with `semanticTokens.colors` semantic tokens; brand color from `primitivePalette.brand` |
   | Typography | Import fonts declared in `semanticTokens.typography` (Google Fonts CDN or system font) |
   | Motion | Apply CSS transition/animation per `motion.patterns` for page switch / Modal / Toast |
   | Icons | Import CDN per `illustration.iconLibrary`; if style=none, no illustrations |
   | Components | Replace wireframe placeholders with `componentPresets` class strings |
   | Mode | If `mode.support` includes dark, add CSS `@media (prefers-color-scheme: dark)` + toggle button |
   | Forbidden | Strictly follow "Forbidden styles" from vision.md Visual Reference |

3. **Post-styling checklist**:
   - [ ] All screen colors sourced from semanticTokens — no hardcoded Hex (except brand color variables)
   - [ ] All motion durations sourced from `motion.duration.*` — no magic numbers
   - [ ] Page/state control bar remains wireframe-style grayscale (no coloring — debug tool identity)
   - [ ] `data-el` labels fully preserved
   - [ ] Every state (default/loading/empty/error) of every screen visually implemented

4. **Output**:
   - Update `[[__DOCS_DIR__]]/global/ui_concept.html` (colored version overwrites wireframe)
   - **Sync `ui_context.md` Screen Structure Summary**:
     - Update phase label from `Phase 1 Wireframe` to `Phase 2 Visual Styling`
     - Re-extract Layout and Key regions for each screen based on final HTML structure, ensuring summary matches the colored `ui_concept.html`
     - Screen Inventory / Navigation Graph / Global Shared Components: leave unchanged unless structure changed
   - Output summary:
     ```
     ### ui_concept.html updated (Phase 2 Visual Styling)
     ### ui_context.md synced (Screen Structure Summary refreshed to Phase 2)

     **Applied visual spec**:
     - Primary color: [Primary token value]
     - Font: [font name]
     - Motion: [preference value, e.g. subtle]
     - Icons: [iconLibrary] / style: [style]
     - Theme: [default + support list]

     > Open `[[__DOCS_DIR__]]/global/ui_concept.html` in a browser to review visual output.
     > `/archi.plan <ID>` will read `ui_context.md` to determine each task's UI scope.
     ```

---

### Phase 2.5 — Incremental Re-coloring

**Trigger**: After Phase 2 is complete, a screen is updated by Plan Refinement / Edit / Revise and its new content needs to be styled to match the hi-fi standard.

**Role**: Visual Designer

**Action**:

1. Receive the list of screen IDs to re-color from the caller (e.g., `S-03`, `S-07`).
2. Process only the specified screens:
   - Locate new wireframe-style additions within `.wf-screen#S-XX`
   - Apply Phase 2 styling rules (`semanticTokens` / `motion` / `illustration`) to the new additions only
   - Leave all other screen content untouched
3. [?new states] If new states are added in this re-color → sync `ui_context.md` to update the states column for the affected screen(s).
4. Output change summary:
   - `MODIFIED: ui_concept.html S-XX (incremental re-color, [N] new states/regions)`
   - `MODIFIED: ui_context.md S-XX (updated states list)` (only if new states were added)

> **Forbidden**: Never re-run the full Phase 2 for incremental re-coloring. Never touch screens not in the specified list.

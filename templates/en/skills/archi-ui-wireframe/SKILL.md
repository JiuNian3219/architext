---
name: archi-ui-wireframe
description: Generate UI concept designs and wireframes.when creating or updating UI screens for web, mobile, or desktop applications. Do not auto-trigger.
---

# UI Concept Design

## System Flow Position

```
/archi.start → [This Skill] → ui_concept.html (all screens) → /archi.plan → ui.md (task scope)
/archi.inherit → [This Skill adopt mode] → ui_concept.html (reverse from code)
```

> **Outputs**: `ui_concept.html` (hi-fi preview with state switching) + `ui_context.md` (AI index)

---

## Invocation Modes

| Mode | Trigger | Scope |
|:---|:---|:---|
| Initial | `/archi.start` | Full — all screens |
| Adopt | `/archi.inherit` | Reverse from code routes/components |
| Regenerate | Manual | Full rewrite |
| Append/Modify | `/archi.scope/edit` | Specified screens only |
| Update | `/archi.plan` divergence | Affected screens only |

---

## Generation Protocol

### Step 1 — Load Context

**Load**: vision.md (platform/users/north-star), roadmap.json (UI tasks → screen mapping),
design_tokens.json (aesthetic/brand), 02_tech_stack.md (platform/nav framework).

### Step 2 — Plan Screen Inventory

Assign screen IDs (S-01, S-02...), map to Roadmap tasks. IDs are permanent.

| Screen ID | Name | Task | States |
|:---|:---|:---|:---|
| S-01 | [name] | [task ID] | default, loading, empty, error |

### Step 3 — Tokens Check + Guidance

check `design_tokens.json`:
- `aestheticDirection.preset` empty → guide selection (saas-dark/saas-light/dashboard/marketing/mobile-app/editorial/brutalist)
- `primitivePalette.brand` empty → guide for Hex
- Other empty → AI infers, non-blocking

### Step 4 — Generate Hi-fi HTML

**Output**: `[[__DOCS_DIR__]]/global/ui_concept.html`

**Structure** (top to bottom):
1. **Top bar** — Fixed, shows project name + current screen name
2. **Content area** — Scrollable, renders the currently active screen
3. **Control bar** — Fixed bottom, two sections:
   - **Left States**: Current screen state switching (default/loading/empty/error)
   - **Right Screens**: List of all project screens (S-01/S-02...), click to switch

**HTML Structure**:
```html
<section id="S-01" class="wf-screen active">
  <div class="wf-state active" data-state="default">...</div>
  <div class="wf-state" data-state="loading">...</div>
</section>

<footer class="wf-ctrl-bar">
  <div><!-- States --></div>
  <div><!-- Screens --></div>
</footer>
```

**Interactive Display Principles** (visual feedback, NOT real business logic):
- Buttons/links/inputs drawn with click events
- Click triggers **visual feedback** (modal show/hide, panel expand, state switch), NOT **real business logic**
- **In-page navigation**: Sidebar, tabs, breadcrumbs → `showScreen()`
- **Detail navigation**: Cards, list items → `showScreen()`, showing "click → navigate" flow
- **Modal forms**: Focusable, clickable, but submission doesn't process data
- **Goal**: complete display of interaction flow and interface in various states

**Built-in Validation & Self-Repair Loop** (AI self-checks and fixes until all pass):

| Check | Pass Criteria | Repair Action |
|:---|:---|:---|
| **Clickability** | All elements with `onclick` must have `cursor: pointer` | Add CSS `cursor: pointer` |
| **data-el completeness** | All interactive elements must have `data-el` | Add `data-el` description |
| **State coverage** | Each screen must include default/loading/empty (as applicable) | Add missing state divs |
| **Navigation connectivity** | Sidebar, cards, etc. must switch to target screen on click | Add/fix `onclick="showScreen()"` |
| **Anti-pattern red lines** | No purple gradient, no emoji, not pure black/white | Replace with aesthetic-compliant colors |
| **Spacing consistency** | Use CSS variables, no hardcoded magic numbers | Replace with `var(--space-*)` |

**Repair Loop** (internal execution):
```
Generate HTML → Run checks → Any failures?
  ├── Yes → Repair → Regenerate → Check again
  └── No → Passed
```

**Check Method**: Scan HTML elements, output to comment (`<!-- Check: 6/6 passed -->`), repair if failed.

[[INCLUDE: shared/ui-redlines.md]]

**Content Fill**:
- Real business names from roadmap, never "Title" placeholders
- Buttons with specific actions, never "[Button]"
- Lists/tables with 3-4 rows realistic fake data
- Empty states with specific copy, never "No data"

**Self-drawn SVG** (no icon library): stroke="currentColor", stroke-width 1.5-2, fill="currentColor", width="1em" height="1em"

### Step 5 — Generate AI Index

**Output**: `[[__DOCS_DIR__]]/global/ui_context.md`

```markdown
# UI Context
> Platform: [type] | Generated: YYYY-MM-DD

## Screen Inventory
| ID | Name | Route | States |
|:---|:---|:---|:---|
| S-01 | [name] | [route] | default, loading, empty, error |

## Navigation Graph
S-XX →（trigger）→ S-YY

## Screen Structure Summary
### S-XX · [Screen name]
**Layout**: [e.g. "240px left sidebar + right content"]
**States**: default (core actions) | loading (skeleton) | empty | error
**Key regions**: [from data-el: top nav, main form, submit button, error area]
```

### Step 6 — Output Gate

Output summary: aesthetic direction + reference products, screen coverage list (N screens), visual spec, navigation structure.

**User confirmation**: Reply **OK** to complete; otherwise enter Refinement.

---

## Refinement (User Feedback)

User reply contains layout/visual adjustments → partial update `ui_concept.html` + sync `ui_context.md` → re-display summary, await confirmation.

---

## Incremental Update

Input screen ID list → process specified screens only: preserve existing content, generate new parts per current visual spec; if new states → sync update `ui_context.md`.

Output: `MODIFIED: ui_concept.html S-XX (incremental)`

---

## Adopt (Reverse from Code)

Input existing code + design_tokens.json → extract: routes → screen inventory, layout components → navigation structure, page components → core regions and states → generate HTML + ui_context.md per standard flow.

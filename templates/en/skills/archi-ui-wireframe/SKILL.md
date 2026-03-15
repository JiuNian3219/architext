---
name: archi-ui-wireframe
description: Generate UI concept designs and wireframes as multi-file screens/ directory. Do not auto-trigger.
---

# UI Concept Design

## System Flow Position

```
/archi.ui → [This Skill] → screens/ (multi-file directory) → /archi.plan → ui.md (task scope)
/archi.ui (adopt mode) → [This Skill] → screens/ (reverse from code)
```

> **Outputs**: `screens/` directory (`index.html` navigation hub + `S-XX.html` independent screens + `_shared.css` shared styles) + `ui_context.md` (AI index)

---

## Invocation Modes

| Mode | Trigger | Scope |
|:---|:---|:---|
| Initial | `/archi.ui` | Full — all screens |
| Adopt | `/archi.ui` (auto-detected when code exists) | Reverse from code routes/components |
| Regenerate | Manual | Full rewrite (global redesign) |
| Append/Modify | `/archi.scope/edit` or `/archi.ui` (incremental mode) | Specified screens only |
| Update | `/archi.plan` divergence | Affected screens only |

---

## Generation Protocol

### Step 1 — Load Context

**Load**: vision.md (platform/users/north-star), roadmap.json (UI tasks → screen mapping),
design_tokens.json (aesthetic/brand), tech_stack.md (platform/nav framework).

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

### Step 4 — Generate Multi-file HTML

**Output directory**: `[[__DOCS_DIR__]]/global/screens/`

#### 4.1 `_shared.css` — Shared Styles

Extract CSS variables from `design_tokens.json` + base layout + control bar styles. All `S-XX.html` reference via `<link href="_shared.css">`.

#### 4.2 `S-XX.html` — Independent Screen Files

One self-contained HTML file per screen, structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>S-XX · [Screen Name]</title>
  <link rel="stylesheet" href="_shared.css">
</head>
<body>
  <header class="wf-topbar">
    <a href="index.html" class="wf-back">← Back to Index</a>
    <span>[Project Name] — S-XX · [Screen Name]</span>
  </header>

  <main class="wf-content">
    <div class="wf-state active" data-state="default">...</div>
    <div class="wf-state" data-state="loading">...</div>
    <div class="wf-state" data-state="empty">...</div>
    <div class="wf-state" data-state="error">...</div>
  </main>

  <footer class="wf-ctrl-bar">
    <div class="wf-states"><!-- State switching buttons --></div>
  </footer>

  <script>
    function showState(state) {
      document.querySelectorAll('.wf-state').forEach(el => el.classList.remove('active'));
      document.querySelector(`[data-state="${state}"]`).classList.add('active');
      document.querySelectorAll('.wf-states button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.state === state);
      });
    }
  </script>
</body>
</html>
```

#### 4.3 `index.html` — Navigation Hub

List all screens, each linking to corresponding `S-XX.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Project Name] — UI Concept Design</title>
  <link rel="stylesheet" href="_shared.css">
</head>
<body>
  <header class="wf-topbar">
    <span>[Project Name] — UI Concept Design Index</span>
  </header>
  <main class="wf-index">
    <div class="wf-screen-card">
      <a href="S-01.html">S-01 · [Screen Name]</a>
      <p>[One-line description]</p>
    </div>
    <!-- More screen cards -->
  </main>
</body>
</html>
```

**Interactive Display Principles** (visual feedback, NOT real business logic):
- Buttons/links/inputs drawn with click events
- Click triggers **visual feedback** (modal show/hide, panel expand, state switch), NOT **real business logic**
- **Cross-screen navigation**: Sidebar, tabs, breadcrumbs, card clicks → link to corresponding `S-XX.html`
- **Modal forms**: Focusable, clickable, but submission doesn't process data
- **Goal**: complete display of interaction flow and interface in various states

**Built-in Validation & Self-Repair Loop** (AI self-checks and fixes until all pass):

| Check | Pass Criteria | Repair Action |
|:---|:---|:---|
| **Clickability** | All elements with `onclick` must have `cursor: pointer` | Add CSS `cursor: pointer` |
| **data-el completeness** | All interactive elements must have `data-el` | Add `data-el` description |
| **State coverage** | Each screen must include default/loading/empty (as applicable) | Add missing state divs |
| **Cross-file link validity** | `index.html` links point to existing `S-XX.html`; each `S-XX.html` contains back-to-index link | Fix link paths |
| **Anti-pattern red lines** | No purple gradient, no emoji, not pure black/white | Replace with aesthetic-compliant colors |
| **Spacing consistency** | Use CSS variables, no hardcoded magic numbers | Replace with `var(--space-*)` |

**Repair Loop** (internal execution):
```
Generate HTML → Run checks → Any failures?
  ├── Yes → Repair → Regenerate → Check again
  └── No → Passed
```

**Check Method**: Scan HTML file elements, verify against checklist, output to comment (`<!-- Check: 6/6 passed -->`), repair if failed.

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
| ID | Name | Route | File | States |
|:---|:---|:---|:---|:---|
| S-01 | [name] | [route] | screens/S-01.html | default, loading, empty, error |

## Navigation Graph
S-XX →（trigger）→ S-YY

## Screen Structure Summary
### S-XX · [Screen name]
**Layout**: [e.g. "240px left sidebar + right content"]
**File**: screens/S-XX.html
**States**: default (core actions) | loading (skeleton) | empty | error
**Key regions**: [from data-el: top nav, main form, submit button, error area]
```

### Step 6 — Output Gate

Output summary: aesthetic direction + reference products, screen coverage list (N screens), visual spec, navigation structure.

**User confirmation**: Reply **OK** to complete; otherwise enter Refinement.

## Output Verification

□ `global/screens/index.html` generated with all screen links listed
□ `global/screens/_shared.css` generated with design_tokens CSS variables
□ `global/screens/S-XX.html` independent file generated for each screen
□ `global/ui_context.md` generated with screen inventory containing `screens/S-XX.html` paths

---

## Refinement (User Feedback)

User reply contains layout/visual adjustments → partial update corresponding `screens/S-XX.html` + sync `ui_context.md` → re-display summary, await confirmation.

---

## Incremental Update

Input screen ID list → process specified screens only: preserve existing files, generate new/updated `S-XX.html` per current visual spec; if new states → sync update `ui_context.md`. Update `index.html` navigation list.

Output: `MODIFIED: screens/S-XX.html` (annotated per file)

---

## Adopt (Reverse from Code)

Input existing code + design_tokens.json → extract: routes → screen inventory, layout components → navigation structure, page components → core regions and states → generate `screens/` directory + ui_context.md per standard flow.

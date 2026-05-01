---
name: archi-ui-wireframe
description: Generate UI concept designs as screens/ reference artifacts. Protocol-invoked only; do not auto-trigger.
disable-model-invocation: true
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called by `/archi.ui` or plan/change's UI local update step.
- **Execution context**: Can execute via Skill tool or current context; must follow calling protocol's Gate before writing `screens/`.
- **Boundary**: Only generate UI concept drafts and reference files, does not generate production source code.


# UI Concept Design

## Core Principles

- Interactive display: Draw buttons / forms / modals and bind clicks, clicks only trigger visual feedback (state switch / panel expand / modal show/hide), not real business logic
- Content fill: Use real business names from roadmap; No "Title", "[Button]" placeholders; Lists / tables ≥ 3-4 rows of realistic dummy data; Empty states write specific copy not "No data"
- Palette discipline: Only use CSS variables derived from `design_tokens.json`, no hardcoded magic numbers
- Output boundary: `screens/` is concept design and acceptance reference, not production code; Must not instruct subsequent implementation to directly copy HTML/CSS/JS, must require rewrite using project's own language, framework and style system
- No anti-patterns: Purple gradient / emoji / non-pure black-white
[[INCLUDE: shared/ui-redlines.md]]

## Step 1 — Read Context

Extract from `context_files`:
- vision.md → Platform / Users / North star
- roadmap.json → UI tasks → Screen mapping
- design_tokens.json → Aesthetic / Brand color / Decor variables
- tech_stack.md → Platform / Navigation framework
- Current `ui_context.md` → Existing screen IDs and names (`adopt` / `incremental` reuse)

`adopt` mode additionally: Extract from `adopt_codebase` "Route → Screen list", "Layout components → Navigation structure", "Page components → Core regions and states".

## Step 2 — Plan Screen List

Assign screen IDs (S-01, S-02 ..., permanent) mapping to Roadmap tasks. `incremental` only processes `scope_screens`.

| Screen ID | Screen Name | Corresponding Task | Status List |
|:---|:---|:---|:---|
| S-01 | <Name> | <Task ID> | default, loading, empty, error |

## Step 3 — Tokens Check and Guidance

Check `design_tokens.json`:
- `aestheticDirection.preset` empty → Guide user to select (saas-dark / saas-light / dashboard / marketing / mobile-app / editorial / brutalist)
- `primitivePalette.brand` empty → Guide user to fill Hex
- Other empty values → AI inference, non-blocking

`incremental` skips this step (reuse existing tokens).

## Step 4 — Generate Multi-File HTML

**Output Directory**: `[[__DOCS_DIR__]]/global/screens/`

> Note: Files in this directory only for browser preview and design alignment. In subsequent `/archi.code` UI implementation, prohibit directly reusing `_shared.css` or `S-XX.html` code.

**File List**:

| File | Responsibility |
|:---|:---|
| `_shared.css` | CSS variables folded from `design_tokens.json` + Base layout + Bottom control panel styles |
| `S-XX.html` | Each screen independent self-contained page, via `<link href="_shared.css">` includes shared styles |
| `index.html` | Navigation hub, lists all screen cards and links to corresponding `S-XX.html` |

**Bottom Control Panel Spec** (All `S-XX.html` must contain): Fixed positioning at bottom; Floating bar button 60×16px at panel top center, ▲/▼ toggle; Three-column layout: ← Index jump ｜ Page description ｜ State buttons; When collapsed content area `display:none`, button remains visible.

**Example Spec — `S-XX.html`** (Indicates which nodes and scripts must be included, not physical file template):

```html
<body>
  <header class="wf-topbar">...</header>
  <main class="wf-content">...State switch div...</main>
  <aside class="wf-panel" id="wfPanel">
    <button class="wf-panel-toggle" id="toggleBtn" onclick="togglePanel()">▼</button>
    <div class="wf-panel-content">
      <span>Jump</span> <a href="index.html">← Index</a>
      <span>Page</span> <span>[Description]</span>
      <span>State</span> <div class="wf-states">...</div>
    </div>
  </aside>
  <script>
    function togglePanel() {
      var panel = document.getElementById('wfPanel');
      var btn = document.getElementById('toggleBtn');
      panel.classList.toggle('collapsed');
      btn.textContent = panel.classList.contains('collapsed') ? '▲' : '▼';
    }
  </script>
</body>
```

**Example Spec — `index.html`**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Project Name] — UI Concept Design</title>
  <link rel="stylesheet" href="_shared.css">
</head>
<body>
  <header class="wf-topbar"><span>[Project Name] — UI Concept Design Index</span></header>
  <main class="wf-index">
    <div class="wf-screen-card">
      <a href="S-01.html">S-01 · [Screen Name]</a>
      <p>[One-sentence description]</p>
    </div>
  </main>
</body>
</html>
```

**Self-drawn SVG** (When no icon library): `stroke="currentColor"` · `stroke-width` 1.5-2 · `fill="currentColor"` · `width="1em"` `height="1em"`.

### Built-in Verification and Self-Fix Loop

Generate → Check → If fail fix and retry, until 6/6 pass; Final output mark `<!-- Check: 6/6 passed -->` in HTML comment.

| Check Item | Pass Standard | Fail Fix |
|:---|:---|:---|
| Clickability | Elements with `onclick` all have `cursor: pointer` | Add CSS |
| `data-el` completeness | Interactive elements all have `data-el` | Add description |
| State coverage | Each screen has default / loading / empty (if applicable)| Add state div |
| Cross-file link validity | `index.html` links point to existing `S-XX.html`; Each `S-XX.html` has return-to-index link | Fix path |
| Anti-pattern red lines | No purple gradient / emoji / non-pure black-white | Replace with aesthetic-compliant colors |
| Spacing consistency | Uses CSS variables no magic numbers | Replace with `var(--space-*)` |

## Step 5 — Update AI Index

`ui_context.md` already initialized by `/archi.start` with screen IDs and names. This step updates screen structure summary and file paths.

[[INCLUDE: shared/ui-context-format.md]]

## Step 6 — Output Gate

Output summary: Aesthetic direction and reference products · Screen coverage list (N screens) · Visual spec · Navigation structure description.

User confirmation:
- Reply **OK** → Complete
- Non-OK (contains layout / visual adjustment feedback) → Local regenerate corresponding `S-XX.html` + sync `ui_context.md` + `index.html` → Re-display summary wait for next round

## Output Verification

- [ ] `global/screens/index.html` generated and lists all screen links
- [ ] `global/screens/_shared.css` generated and contains design_tokens CSS variables
- [ ] Each `global/screens/S-XX.html` independent file generated (`incremental` only for `scope_screens`)
- [ ] `global/ui_context.md` screen structure summary updated, with file paths and key regions
- [ ] All `S-XX.html` contain `<!-- Check: 6/6 passed -->` comment
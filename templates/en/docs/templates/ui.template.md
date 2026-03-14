---
description: Task-level UI scope declaration — describes the screens/component scope this task owns. Screen IDs from ui_context.md; visual prototype in screens/ (for humans).
glue: Screen IDs referenced from [[__DOCS_DIR__]]/global/ui_context.md. Do not redefine global layout or navigation.
---

# UI Scope: {FEATURE_NAME}

> **Screen Index**: `[[__DOCS_DIR__]]/global/ui_context.md` (AI reads screen IDs and navigation graph)
> **Visual Prototype**: `[[__DOCS_DIR__]]/global/screens/index.html` (human browser preview, individual screens at `screens/S-XX.html`)
> **Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`
> **Protocol**: ITP v3.0 (scope limited to components within this task's boundary)

## 1. Screen Scope

<!-- [AI]: Select the screen IDs and states from ui_context.md screen inventory that this task covers -->

| Screen ID | Screen name | States this task owns |
|:---|:---|:---|
| S-XX | [name] | default, loading, empty, error (all or subset) |

> If this task has no standalone screen (only modifies a section of an existing screen), describe the target area here.

## 2. Component Scope

<!-- [AI]: Describe only the components this task adds or modifies. Reference global components (TopBar/Sidebar/Footer); do not redefine them. -->

```text
[ScreenName > modified area]
  NewComponent [Col, Gap:4]       ← added by this task
    ExistingComponent             ← ref: screens/S-XX.html (no modification)
    #NewSubComponents
```

> **Reference rule**: Components already defined in `screens/S-XX.html` → `ref: screens/S-XX.html#ComponentName`; do not copy-paste their structure.

## 3. Interactions (new interactions introduced by this task)

<!-- [AI]: List only interactions introduced by this task; do not repeat interactions already in screens/S-XX.html -->

| Trigger | Target | Action |
|:---|:---|:---|
| #NewButton click | API | POST → success: Toast / error: inline |

## 4. States (state rendering owned by this task)

<!-- [AI]: If screens/S-XX.html already fully describes the states, this section may be omitted or only note deltas -->

| State | Delta from screens/S-XX.html |
|:---|:---|
| `loading` | Same as screens/S-XX.html loading (no delta) |
| `empty` | Different copy for this task's empty state: "{specific copy}" |

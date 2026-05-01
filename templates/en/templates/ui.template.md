---
description: Task-level UI Scope Declaration — Describes screens/components this task is responsible for, screen IDs from ui_context.md, visual prototype in screens/ (human view).
glue: Screen IDs referenced from [[__DOCS_DIR__]]/global/ui_context.md; Do not redefine global layout or navigation.
---

# UI Scope: {FEATURE_NAME}

> **Screen Index**: `[[__DOCS_DIR__]]/global/ui_context.md` (AI reads screen IDs and navigation relationships)
> **Visual Prototype**: `[[__DOCS_DIR__]]/global/screens/index.html` (Human browser preview, each screen `screens/S-XX.html`)
> **Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`
> **Protocol**: ITP v3.0 (Only describe component tree within this task boundary)

## 1. Screen Scope

<!-- [AI]: Select screen IDs and states this task involves from ui_context.md screen index -->

| Screen ID | Screen Name | States This Task Responsible For |
|:---|:---|:---|
| S-XX | [Name] | default, loading, empty, error (All or specified subset) |

> If this task has no independent screens (only modifying local areas of existing screens), describe modified regions here.

## 2. Component Scope

<!-- [AI]: Only describe components this task adds or modifies; Reference global components (TopBar/Sidebar/Footer), do not redefine -->

```text
[ScreenName > Modified Region Name]
  NewComponent [Col, Gap:4]      ← Added by this task
    ExistingComponent            ← ref: screens/S-XX.html (not modified)
    #NewSubComponents
```

> **Reference Rules**: Components already defined in `screens/S-XX.html` → `ref: screens/S-XX.html#ComponentName`; Do not copy paste their structure.

## 3. Interactions (New interactions this task adds)

<!-- [AI]: Only list new interactions introduced by this task; Do not repeat interactions already in screens/S-XX.html -->

| Trigger | Target | Action |
|:---|:---|:---|
| #NewButton click | API | POST → success: Toast / error: inline |

## 4. States (State rendering this task is responsible for)

<!-- [AI]: If screens/S-XX.html states are sufficiently described, can omit or only supplement differences here -->

| State | Delta from screens/S-XX.html |
|:---|:---|
| `loading` | Same as screens/S-XX.html loading (no difference)|
| `empty` | This task's empty state copy different: "{Specific copy}" |
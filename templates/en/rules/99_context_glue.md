---
description: Context Navigation & Document Indexing. Bridges source code to documentation using the Map registry. Essential for locating specs and plans.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Context Glue Protocol

> **Role**: Context Navigator. Prevent AI amnesia, use Map Look-up to determine the business document corresponding to the current code.

## 1. Context Discovery

When reading or editing code files, must execute the following addressing steps:

**Step 1: Check Global Map**
- Read `[[__DOCS_DIR__]]/global/map.json`.
- Find the module the current file belongs to in `directoryMapping` / `logicalTopology`.
- Load the Docs Link (Spec/UI/Plan) registered for that module.

**Step 2: Check Explicit Context**
- Scenario: Newly created file or Map not yet updated.
- Check if user Prompt explicitly specified a document path, if so must load it.

**Step 3: Fallback**
- Not registered in Map and user did not specify → **STOP & ASK**.
- Prompt: "Spec document for current code not found. Please provide the path, or run `/archi.map` to update the architecture map."

---

## 2. Mandatory Loading Rules

| Code Type | Required Context | Source of Truth |
|:---|:---|:---|
| **Business Logic** (Features/Entities) | Spec Document | `[[__DOCS_DIR__]]/global/map.json` → Module Entry |
| **UI Components** (Pages/Widgets) [?UI] | UI Document + `[[__DOCS_DIR__]]/global/design_tokens.json` | `[[__DOCS_DIR__]]/global/map.json` + Global Rules |
| **Data Schema** (ORM/SQL/Models) [?Data] | Data Snapshot | `[[__DOCS_DIR__]]/global/data_snapshot.json` |
| **Config / Infra** (Package.json...) | Tech Stack | `02_tech_stack.md` |

---

## 3. Anti-Hallucination

- Code is the downstream artifact of documentation.
- Forbidden to guess business logic based on variable names without reading Spec.
- When code is found inconsistent with documentation: do not arbitrarily fix either, must pause and report the inconsistency.

---

## 4. Maintenance Hook

- **Trigger**: When creating a new file or new module.
- **Action**: Must remind user or automatically update `map.json` to establish mapping between code path and document path.

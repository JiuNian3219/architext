---
description: Context Navigation & Document Indexing. Bridges source code to documentation using the Map registry. Essential for locating specs and plans.
globs: **/*
applyTo: **/*
alwaysApply: true
---

# Context Glue Protocol

> **Role:** Your "Context Navigator".
> **Goal:** Prevent AI Amnesia. Instead of relying on hardcoded paths, use **Map Look-up** to determine the business document corresponding to the current code.

## 1. Context Discovery Mechanism

When reading or editing any code file, you **MUST** execute the following addressing steps to load context:

### Step 1: Check Global Map

- **Action**: Read `[[__DOCS_DIR__]]/global/01_map.md`.
- **Look-up**: Find the module the current file path belongs to in `3. Directory Mapping` or `4. Logical Topology` sections.
- **Load**: Read the `Docs Link` (Spec/UI/Plan) registered for that module in the Map.

### Step 2: Check Explicit Context

- **Scenario**: If it is a newly created file, or Map is not yet updated.
- **Action**: Check if User Prompt explicitly specified document path (e.g. "Implementing feature based on [[__DOCS_DIR__]]/login/spec.md").
- **Response**: Must load the document explicitly specified by the user.

### Step 3: Fallback

- **Scenario**: If not registered in Map, and user did not specify.
- **Action**: **STOP & ASK**.
- **Script**: "⚠️ Spec document for current code not found. Please provide document path, or run `/archi.map` to update architecture map."

---

## 2. Mandatory Loading Rules

Regardless of how directory structure changes, code modifications of the following types must be accompanied by reading of corresponding documents:

| Code Type                                        | Required Context                              | Source of Truth                               |
| :----------------------------------------------- | :-------------------------------------------- | :-------------------------------------------- |
| **Business Logic**<br>(Features, Entities)       | **1. Spec Document**                          | `[[__DOCS_DIR__]]/global/01_map.md` -> Module Entry                   |
| **UI Components**<br>(Pages, Widgets, Shared UI) | **2. UI Document**<br>+ `[[__DOCS_DIR__]]/global/03_design_tokens.md` | `[[__DOCS_DIR__]]/global/01_map.md` -> Module Entry<br>+ Global Rules |
| **Data Schema**<br>(Prisma, SQL, Models)         | **Data Snapshot**                             | `[[__DOCS_DIR__]]/global/04_data_snapshot.md` |
| **Config / Infra**<br>(Package.json, Vite...)    | **Tech Stack**                                | `02_tech_stack.md` (Located in current IDE rules directory)    |

---

## 3. Anti-Hallucination

- **Principle**: Code is the downstream artifact of documentation.
- **Forbidden**: Strictly forbidden to guess business logic solely based on variable names without reading Spec documents.
- **Conflict**: If code logic is found inconsistent with document description:
  1.  Do NOT arbitrarily "fix" the document to fit the code.
  2.  Do NOT arbitrarily modify code to fit the document (unless it is a clear BugFix).
  3.  **MUST** pause and report inconsistency to the user.

---

## 4. Maintenance Hook

- **Trigger**: When you create a new file or new module.
- **Action**: You must remind the user or automatically update `01_map.md` to establish mapping between new code path and new document path.

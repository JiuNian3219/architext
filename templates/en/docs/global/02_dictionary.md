---
description: Project Glossary & Component Registry.
---
# Project Dictionary

> **Status:** [Active]
> **Role:** Ubiquitous Language & Asset Registry.

## 1. Domain Entities
<!-- [AI Instruction]: Business Term Definitions. AI is forbidden from inventing new terms arbitrarily. -->

| Term | Definition | Code/DB Name | Forbidden Synonyms | Reference (Source) |
| :--- | :--- | :--- | :--- | :--- |
| *(Empty)* | | | | |

## 2. Business Verbs
<!-- [AI Instruction]: Key Business Verbs. e.g. Distinguish between "Archive" and "Delete". -->

| Verb | Definition | Context | Reference (Source) |
| :--- | :--- | :--- | :--- |
| *(Empty)* | | | |

## 3. Component Registry [?UI]
<!-- [AI Instruction]: Applies only to projects with UI. Scan project, record existing reusable components to prevent duplicate development. Path per `01_map.md`. -->

| Component Name | File Path | Usage Description |
| :--- | :--- | :--- |
| *(Empty)* | | |
| *(e.g. PrimaryButton)* | *(per 01_map module path)* | *(Main CTA)* |

---

## 🤖 AI Maintenance Guide

**Trigger**: When introducing new business concepts, data models, wrapping new shared components, or encountering naming conflicts.

**Action**:
1.  **Naming Authority**: This file is the supreme law of naming.
    *   AI must consult Section 1 (Code/DB Name) first when generating variable names.
    *   **Strictly Forbidden**: Using words from "Forbidden Synonyms" column.
    *   **Reference**: Must fill the source file path in `Reference` column (e.g. `src/domain/user.entity.ts` or `docs/specs/auth.md`), avoid stacking long explanations here.
2.  **Component Reuse**:
    *   Must search Section 3 before creating new components.
    *   If similar component found, prioritize refactoring for reuse over creating new one.
3.  **Update**: Proactively add to this table when discovering new common terms.

---
description: Data Model Snapshot
---

# Data Model Snapshot

> **Scope:** `[?Data]` Applies only to projects with a data layer. CLI/pure-compute projects may ignore.
> **Status:** [Sync Required]
> **Role:** Design Contract & Schema Snapshot.
> **Source File:** *(AI: Fill per tech_stack, e.g. prisma/schema.prisma, models/*.py, schema.sql)*

## 1. Relationships

*(AI: During 'Plan' phase, design the ERD here. During 'Code' phase, sync from implementation.)*
Posts

- Post (N) --(N)--> Tags
  -->

## 2. Model Definitions

### Table: `(Waiting for Name)`

| Column    | Type | Modifiers (PK/FK/Unique) | Description |
|:--------- |:---- |:------------------------ |:----------- |
| *(Empty)* |      |                          |             |

---

## 🤖 AI Maintenance Guide

**Trigger**:
1.  **Plan Phase**: When running `/archi.plan`, as a **Draft** for data design.
2.  **Code Phase**: After running `/archi.code` or database changes, as a **Snapshot** of the code.

**Action**:
1.  **Design First**:
    *   During Plan phase, AI **must** define table structure, fields, and relationships here. At this point, it is the "Requirements Doc" for the code.
    *   Strictly forbidden to write "TBD", must be precise to field types (e.g. `String`, `Int`, `Boolean`).
2.  **Sync Back**:
    *   After Code phase completion, if implementation details (like field length, index names) are adjusted, must update this file to reflect final state.
3.  **Purpose**: Ensure data design is audited and confirmed before writing code.
4.  **Format**: Must keep Markdown tables clean, ensure Relationships diagram is clear.

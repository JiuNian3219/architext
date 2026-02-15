---
description: The Master Index of Project Documentation, Directory Structure & Logical Topology.
---

# Architecture Map

> **Status:** [Active]
> **Role:** The GPS & Index page of the project. Tracks not just code, but the documentation system itself.

## 1. Governance & Documentation Index

### Core Rules (Legislative Layer - Located in current IDE rules directory)

| File                 | Role               | When to read                                   |
| :------------------- | :----------------- | :--------------------------------------------- |
| `00_system.md`       | **System Role**    | At the start of every session (Identity, Core Principles). |
| `01_workflow.md`     | **SOP**            | Decides current task flow (Feature vs Fix) & Acceptance Criteria. |
| `02_tech_stack.md`   | **Tech Stack**     | Tech choices, coding standards, engineering governance. |
| `99_context_glue.md` | **Context Bridge** | Automatically links context docs when touching code. |

### Global Reference (Data Layer `[[__DOCS_DIR__]]/global/`)

| File                  | Role                | Content                        |
| :-------------------- | :------------------ | :----------------------------- |
| `00_roadmap.md`       | **Roadmap**         | Progress tracking, milestones, technical debt management. |
| `00_vision.md`        | **Vision**          | Vision, North Star Metric, Design Philosophy. |
| `01_map.md`           | **Map (This file)** | Directory structure, file index, logical topology. |
| `02_dictionary.md`    | **Dictionary**      | Business glossary, shared component registry. |
| `03_design_tokens.md` | **Visuals** [?UI]   | Colors, typography, spacing variables. |
| `04_data_snapshot.md` | **Data** [?Data]    | Database Schema snapshot. |
| `05_error_codes.md`   | **Errors**          | Error codes & protocol contracts. |

### Project Management (`[[__DOCS_DIR__]]/`)

| File            | Role         | Content                        |
| :-------------- | :----------- | :----------------------------- |
| _(Empty)_       |              |                                |

---

## 2. File Extension Legend

| Ext        | Category          | Purpose                                 |
| :--------- | :---------------- | :-------------------------------------- |
| `.spec.md` | **Specification** | Business Logic, Algorithms, Acceptance Criteria (Logic). |
| `.ui.md`   | **UI/UX**         | Visual Structure, Interaction States, Style Definitions (Visual). |
| `.plan.md` | **Plan**          | Detailed Step Breakdown & Test Cases (Execution). |

---

## 3. Directory Mapping

| Path      | Category | Description |
| :-------- | :------- | :---------- |
| _(Empty)_ |          |             |

---

## 4. Logical Topology

| Module    | Location | Responsibility | Dependencies |
| :-------- | :------- | :------------- | :----------- |
| _(Empty)_ |          |                |              |

---

## 5. Critical User Journeys (CUJ)

1. _(Empty)_

---

## 🤖 AI Maintenance Guide

**Trigger**: When adding new docs, modules, or changing directory structure.

**Action**:
1.  **Strict Sync**:
    *   `Section 3 (Directory Mapping)`: Must reflect the real physical file tree.
    *   `Section 4 (Logical Topology)`: Must register the responsibility of each Feature Module.
2.  **Format**:
    *   `Location` column must use paths relative to root (per project structure, e.g. Web: `src/features/auth`, CLI: `src/commands/init`, API: `src/routes/`).
    *   `Dependencies` column must list explicit import relationships.
3.  **Self-Correction**:
    *   If code references violate the hierarchy defined in Section 4, must report error and stop generation.

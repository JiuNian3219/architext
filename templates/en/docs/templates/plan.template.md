---
description: Implementation Plan & Test Cases for {FEATURE_NAME}.
---

# Implementation Plan: {FEATURE_NAME}

> **Status:** [Pending]
> **Strictness:** Must read Spec (Gherkin) and UI docs before execution.
> **Standards:** Follow engineering standards in `02_tech_stack.md`.

## 1. Technical Decisions

<!-- [AI Instruction]: Libraries and algorithms choices must align with the tech stack in `02_tech_stack.md` -->

- **Libraries**: [e.g. zod (validation), dayjs (date handling)]

- **Architecture**: [e.g. Optimistic Update, Server Actions]

- **State Management**: [e.g. React Query, Zustand, or Server State only]

## 2. Implementation Steps

<!-- [AI Instruction]: Granular task breakdown, each check represents an atomic commit -->

* [ ] **Phase 1: Domain & API**
  - [ ] DB Migration: [Table Changes] (e.g. Create `comments` table)
  - [ ] Server Action: [Name] (e.g. `createComment`, Implement Gherkin Scenarios)
  - [ ] Validation: [Schema] (e.g. Zod schema for input validation)

* [ ] **Phase 2: UI Construction**
  - [ ] Static Components (ITP implementation, reference `2.ui.md`)
  - [ ] Interactive Logic (Hooks, e.g. `useForm`, `useMutation`)
  - [ ] State Management (if needed)

* [ ] **Phase 3: Integration**
  - [ ] Connect UI -> API (Wire up Server Actions)
  - [ ] Error Handling (Display error messages from `05_error_codes.md`)
  - [ ] Loading States (Implement skeleton/loading UI)

## 3. Test Plan (Acceptance Testing)

<!-- [AI Instruction]: Must correspond directly to Gherkin Scenarios in the Spec -->

### Automated Tests (Unit/Integration)

* [ ] **Verify Scenario 1**: [Happy Path Name]

* [ ] **Verify Scenario 2**: [Edge Case Name]

### Manual Verification

* [ ] **Check**: UI visually matches `2.ui.md`

* [ ] **Check**: Specific interaction (e.g. Double click prevention)

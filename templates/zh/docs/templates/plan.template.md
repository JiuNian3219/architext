---
description: Implementation Plan & Test Cases for {FEATURE_NAME}.
---

# Implementation Plan: {FEATURE_NAME}

> **Status:** [Pending]
> **Strictness:** 执行前必须阅读 Spec (Gherkin) 和 UI 文档。
> **Standards:** 遵循 `02_tech_stack.md` 中的工程标准。

## 1. Technical Decisions

<!-- [AI Instruction]: 涉及的库、算法选择，必须符合 `02_tech_stack.md` 中的技术栈要求 -->

- **Libraries**: [e.g. zod (validation), dayjs (date handling)]

- **Architecture**: [e.g. Optimistic Update, Server Actions]

- **State Management**: [e.g. React Query, Zustand, or Server State only]

## 2. Implementation Steps

<!-- [AI Instruction]: 细粒度任务拆解，每个 check 代表一次原子提交 -->

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

## 3. Test Plan (验收测试)

<!-- [AI Instruction]: 必须直接对应 Spec 中的 Gherkin Scenario -->

### Automated Tests (Unit/Integration)

* [ ] **Verify Scenario 1**: [Happy Path Name]

* [ ] **Verify Scenario 2**: [Edge Case Name]

### Manual Verification

* [ ] **Check**: UI visually matches `2.ui.md`

* [ ] **Check**: Specific interaction (e.g. Double click prevention)

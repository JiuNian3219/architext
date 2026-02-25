---
description: Behavioral Specification (Gherkin) for {FEATURE_NAME}.
---

# Task Spec: {FEATURE_NAME}

> **Status:** [Draft]
> **Context:** [AI: Insert a 1-sentence summary of the task's value]

## 1. User Stories

<!-- [AI Instruction]: 簡述使用者價值，從使用者視角描述功能需求 -->

- **As a** [Role] (e.g. 註冊使用者), **I want to** [Action] (e.g. 發表評論), **So that** [Benefit] (e.g. 與其他使用者互動).

## 2. Behavioral Specifications (Gherkin)

<!-- [AI Instruction]: 核心邏輯契約。這是開發和測試的唯一依據。 -->

### Scenario: [Happy Path Name, e.g. 使用者成功提交]

- **Given** 使用者處於 [前置狀態] (e.g. 已登入且表單填寫合法)

- **When** 使用者執行 [操作] (e.g. 點擊提交按鈕)

- **Then** 系統應返回 [預期結果] (e.g. 顯示成功 Toast)

- **And** 資料庫記錄應 [狀態變更] (Ref: `data_snapshot.json`)

### Scenario: [Edge Case Name, e.g. 網路逾時]

- **Given** 使用者網路不穩定

- **When** 使用者點擊提交按鈕

- **Then** 系統應顯示 [Error Message] (Ref: `error_codes.json`)

- **And** 不應產生髒資料

## 3. Data Requirements

<!-- [AI Instruction]: 明確資料變更，必須引用 `data_snapshot.json` 中的資料表結構 -->

* **Schema**: [Table Name] -> [Field] (Add/Modify)
  - Example: `Comment` -> `content` (Add), `parent_id` (Add, nullable)

* **API**: [Method] [Path]
  - Example: `POST /api/comments`, `GET /api/comments/:id`

* **Permissions**: [Required Role]
  - Example: `authenticated` (for POST), `public` (for GET)

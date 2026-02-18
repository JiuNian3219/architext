---
description: Behavioral Specification (Gherkin) for {FEATURE_NAME}.
---

# Feature Spec: {FEATURE_NAME}

> **Status:** [Draft]
> **Context:** [AI: Insert a 1-sentence summary of the feature's value]

## 1. User Stories

<!-- [AI Instruction]: Brief user value, describe feature requirements from user perspective -->

- **As a** [Role] (e.g. Registered User), **I want to** [Action] (e.g. Post a comment), **So that** [Benefit] (e.g. Interact with other users).

## 2. Behavioral Specifications (Gherkin)

<!-- [AI Instruction]: Core logic contract. The sole basis for development and testing. -->

### Scenario: [Happy Path Name, e.g. User submits successfully]

- **Given** User is in [Pre-state] (e.g. Logged in and form is valid)

- **When** User performs [Action] (e.g. Clicks submit button)

- **Then** System should return [Expected Result] (e.g. Show success Toast)

- **And** Database record should [State Change] (Ref: `data_snapshot.json`)

### Scenario: [Edge Case Name, e.g. Network timeout]

- **Given** User network is unstable

- **When** User clicks submit button

- **Then** System should show [Error Message] (Ref: `error_codes.json`)

- **And** Should not produce dirty data

## 3. Data Requirements

<!-- [AI Instruction]: Explicit data changes, must reference table structure in `data_snapshot.json` -->

* **Schema**: [Table Name] -> [Field] (Add/Modify)
  - Example: `Comment` -> `content` (Add), `parent_id` (Add, nullable)

* **API**: [Method] [Path]
  - Example: `POST /api/comments`, `GET /api/comments/:id`

* **Permissions**: [Required Role]
  - Example: `authenticated` (for POST), `public` (for GET)

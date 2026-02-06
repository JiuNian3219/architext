---
description: Central Registry for Error Codes.
---

# Global Error Codes

> **Status:** [Active]
> **Role:** Error Contract Registry.

## 1. Protocol Mapping

> **Core Transport Layer**: Defines baseline mapping between HTTP Status Codes and Frontend Behavior.

| Status | Code (Enum) | Meaning | Action/Frontend Behavior |
|:------ |:----------- |:------- |:------------------------ |
| *(Empty)* |          |         |                          | 

## 2. Business Error Registry

> **Domain Specific**: Specific business exceptions, must map to appropriate HTTP status codes.

| Module | Code (Enum) | HTTP | Message Template | Recovery Suggestion |
|:------ |:----------- |:---- |:---------------- |:------------------- |
| *(Empty)* |          |      |                  |                     |

---

## 🤖 AI Maintenance Guide

**Trigger**: System Design / API Design Phase (Before Coding).

**Action**:
1.  **Design Contract**: When designing API responses or business flows, **must first** define all possible error scenarios in this file.
    *   **Format**: `ERR_[MODULE]_[REASON]` (e.g. `ERR_AUTH_INVALID_TOKEN`).
    *   **Schema**: Must fill Module, Code, HTTP Mapping, Message, Recovery Suggestion.
2.  **Code Implementation**: When writing code, can only reference error codes defined in this table.
3.  **Sync Back**: If uncovered exceptions are found during development, update this document first, then write code.

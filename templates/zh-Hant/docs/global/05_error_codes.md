---
description: Central Registry for Error Codes.
---

# Global Error Codes

> **Status:** [Active]
> **Role:** 錯誤契約註冊表。

## 1. Protocol Mapping (協議映射)

> **Core Transport Layer**: 定義 HTTP 狀態碼與前端行為的基準映射。

| Status | Code (Enum) | Meaning | Action/Frontend Behavior |
|:------ |:----------- |:------- |:------------------------ |
| *(Empty)* |          |         |                          | 

## 2. Business Error Registry (業務錯誤註冊表)

> **Domain Specific**: 具體的業務異常，必須映射到合適的 HTTP 狀態碼。

| Module | Code (Enum) | HTTP | Message Template | Recovery Suggestion |
|:------ |:----------- |:---- |:---------------- |:------------------- |
| *(Empty)* |          |      |                  |                     |

---

## 🤖 AI Maintenance Guide

**Trigger**: System Design / API Design Phase (Before Coding).

**Action**:
1.  **Design Contract**: 在設計 API 響應或業務流程時，**必須先**在此文件中定義所有可能的錯誤場景。
    *   **Format**: `ERR_[MODULE]_[REASON]` (e.g. `ERR_AUTH_INVALID_TOKEN`).
    *   **Schema**: 必須填寫 Module, Code, HTTP Mapping, Message, Recovery Suggestion.
2.  **Code Implementation**: 編寫代碼時，僅能引用此表中已定義的錯誤碼。
3.  **Sync Back**: 如果在開發中發現未覆蓋的異常，先更新此文檔，再寫代碼。

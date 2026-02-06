---
description: Central Registry for Error Codes.
---

# Global Error Codes

> **Status:** [Active]
> **Role:** 错误契约注册表。

## 1. Protocol Mapping (协议映射)

> **Core Transport Layer**: 定义 HTTP 状态码与前端行为的基准映射。

| Status | Code (Enum) | Meaning | Action/Frontend Behavior |
|:------ |:----------- |:------- |:------------------------ |
| *(Empty)* |          |         |                          | 

## 2. Business Error Registry (业务错误注册表)

> **Domain Specific**: 具体的业务异常，必须映射到合适的 HTTP 状态码。

| Module | Code (Enum) | HTTP | Message Template | Recovery Suggestion |
|:------ |:----------- |:---- |:---------------- |:------------------- |
| *(Empty)* |          |      |                  |                     |

---

## 🤖 AI Maintenance Guide

**Trigger**: System Design / API Design Phase (Before Coding).

**Action**:
1.  **Design Contract**: 在设计 API 响应或业务流程时，**必须先**在此文件中定义所有可能的错误场景。
    *   **Format**: `ERR_[MODULE]_[REASON]` (e.g. `ERR_AUTH_INVALID_TOKEN`).
    *   **Schema**: 必须填写 Module, Code, HTTP Mapping, Message, Recovery Suggestion.
2.  **Code Implementation**: 编写代码时，仅能引用此表中已定义的错误码。
3.  **Sync Back**: 如果在开发中发现未覆盖的异常，先更新此文档，再写代码。

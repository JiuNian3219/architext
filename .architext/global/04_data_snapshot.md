---
description: Data Model Snapshot
---

# Data Model Snapshot

> **Status:** [Sync Required]
> **Role:** 数据契约与结构镜像 (Design Contract & Schema Snapshot)。
> **Source File:** *(AI: Fill path, e.g., prisma/schema.prisma)*

## 1. Relationships (关系图)

*(AI: During 'Plan' phase, design the ERD here. During 'Code' phase, sync from implementation.)*
Posts

- Post (N) --(N)--> Tags
  -->

## 2. Model Definitions (模型定义)

### Table: `(Waiting for Name)`

| Column    | Type | Modifiers (PK/FK/Unique) | Description |
|:--------- |:---- |:------------------------ |:----------- |
| *(Empty)* |      |                          |             |

---

## 🤖 AI Maintenance Guide

**Trigger**:
1.  **Plan Phase**: 运行 `/archi.plan` 时，作为数据设计的**草稿本 (Draft)**。
2.  **Code Phase**: 运行 `/archi.code` 或数据库变更后，作为代码的**镜像 (Snapshot)**。

**Action**:
1.  **Design First (设计优先)**:
    *   在 Plan 阶段，AI **必须**在此处定义表结构、字段和关系。此时它是代码的“需求文档”。
    *   严禁只写“待定”，必须精确到字段类型 (e.g. `String`, `Int`, `Boolean`)。
2.  **Sync Back (反向同步)**:
    *   在 Code 阶段完成后，如果实现细节（如字段长度、索引名）有调整，必须更新此文件以反映最终状态。
3.  **Purpose**: 确保数据设计在写代码前就已经被审计和确认。
4.  **Format**: 必须保持 Markdown 表格的整洁，确保 Relationships 图示清晰。

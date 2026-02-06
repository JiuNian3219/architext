---
description: Data Model Snapshot
---

# Data Model Snapshot

> **Status:** [Sync Required]
> **Role:** 數據契約與結構鏡像 (Design Contract & Schema Snapshot)。
> **Source File:** *(AI: Fill path, e.g., prisma/schema.prisma)*

## 1. Relationships (關係圖)

*(AI: During 'Plan' phase, design the ERD here. During 'Code' phase, sync from implementation.)*
Posts

- Post (N) --(N)--> Tags
  -->

## 2. Model Definitions (模型定義)

### Table: `(Waiting for Name)`

| Column    | Type | Modifiers (PK/FK/Unique) | Description |
|:--------- |:---- |:------------------------ |:----------- |
| *(Empty)* |      |                          |             |

---

## 🤖 AI Maintenance Guide

**Trigger**:
1.  **Plan Phase**: 運行 `/archi.plan` 時，作為數據設計的**草稿本 (Draft)**。
2.  **Code Phase**: 運行 `/archi.code` 或資料庫變更後，作為代碼的**鏡像 (Snapshot)**。

**Action**:
1.  **Design First (設計優先)**:
    *   在 Plan 階段，AI **必須**在此處定義表結構、字段和關係。此時它是代碼的“需求文檔”。
    *   嚴禁只寫“待定”，必須精確到字段類型 (e.g. `String`, `Int`, `Boolean`)。
2.  **Sync Back (反向同步)**:
    *   在 Code 階段完成後，如果實現細節（如字段長度、索引名）有調整，必須更新此文件以反映最終狀態。
3.  **Purpose**: 確保數據設計在寫代碼前就已經被審計和確認。
4.  **Format**: 必須保持 Markdown 表格的整潔，確保 Relationships 圖示清晰。

---
description: Project Glossary & Component Registry.
---
# Project Dictionary

> **Status:** [Active]
> **Role:** 統一語言 (Ubiquitous Language) 與資產註冊表。

## 1. Domain Entities (核心實體)
<!-- [AI Instruction]: 業務名詞定義。禁止 AI 隨意發明新詞。 -->

| Term | Definition | Code/DB Name | Forbidden Synonyms | Reference (Source) |
| :--- | :--- | :--- | :--- | :--- |
| *(Empty)* | | | | |

## 2. Business Verbs (業務動作)
<!-- [AI Instruction]: 關鍵業務動詞。例如區分 "Archive"(歸檔) 與 "Delete"(刪除)。 -->

| Verb | Definition | Context | Reference (Source) |
| :--- | :--- | :--- | :--- |
| *(Empty)* | | | |

## 3. Component Registry (公共組件註冊表)
<!-- [AI Instruction]: 掃描項目，記錄已有的複用組件，防止重複開發。 -->

| Component Name | File Path | Usage Description |
| :--- | :--- | :--- |
| *(Empty)* | | |
| *(e.g. PrimaryButton)* | *(src/components/Btn.tsx)* | *(Main CTA)* |

---

## 🤖 AI Maintenance Guide

**Trigger**: 當引入新業務概念、新數據模型或封裝新公共組件時，或遇到命名分歧時。

**Action**:
1.  **Naming Authority**: 此文件是命名的最高法律。
    *   AI 在生成代碼變量名時，必須優先查閱 Section 1 (Code/DB Name)。
    *   **Strictly Forbidden**: 嚴禁使用 "Forbidden Synonyms" 列中的詞彙。
    *   **Reference**: 必須在 `Reference` 列填入定義的來源文件路徑 (e.g. `src/domain/user.entity.ts` 或 `docs/specs/auth.md`)，避免在此文件中堆砌過長解釋。
2.  **Component Reuse**:
    *   在創建新組件前，必須檢索 Section 3。
    *   如果發現相似組件，優先重構複用，而不是新建。
3.  **Update**: 發現新的通用術語時，主動補充到此表。

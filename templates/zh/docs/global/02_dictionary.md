---
description: Project Glossary & Component Registry.
---
# Project Dictionary

> **Status:** [Active]
> **Role:** 统一语言 (Ubiquitous Language) 与资产注册表。

## 1. Domain Entities (核心实体)
<!-- [AI Instruction]: 业务名词定义。禁止 AI 随意发明新词。 -->

| Term | Definition | Code/DB Name | Forbidden Synonyms | Reference (Source) |
| :--- | :--- | :--- | :--- | :--- |
| *(Empty)* | | | | |

## 2. Business Verbs (业务动作)
<!-- [AI Instruction]: 关键业务动词。例如区分 "Archive"(归档) 与 "Delete"(删除)。 -->

| Verb | Definition | Context | Reference (Source) |
| :--- | :--- | :--- | :--- |
| *(Empty)* | | | |

## 3. Component Registry (公共组件注册表)
<!-- [AI Instruction]: 扫描项目，记录已有的复用组件，防止重复开发。 -->

| Component Name | File Path | Usage Description |
| :--- | :--- | :--- |
| *(Empty)* | | |
| *(e.g. PrimaryButton)* | *(src/components/Btn.tsx)* | *(Main CTA)* |

---

## 🤖 AI Maintenance Guide

**Trigger**: 当引入新业务概念、新数据模型或封装新公共组件时，或遇到命名分歧时。

**Action**:
1.  **Naming Authority**: 此文件是命名的最高法律。
    *   AI 在生成代码变量名时，必须优先查阅 Section 1 (Code/DB Name)。
    *   **Strictly Forbidden**: 严禁使用 "Forbidden Synonyms" 列中的词汇。
    *   **Reference**: 必须在 `Reference` 列填入定义的来源文件路径 (e.g. `src/domain/user.entity.ts` 或 `docs/specs/auth.md`)，避免在此文件中堆砌过长解释。
2.  **Component Reuse**:
    *   在创建新组件前，必须检索 Section 3。
    *   如果发现相似组件，优先重构复用，而不是新建。
3.  **Update**: 发现新的通用术语时，主动补充到此表。

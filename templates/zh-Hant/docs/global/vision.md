---
description: Project Constitution: Vision, Personas, Principles & Boundaries.
---

# Product Vision: [項目名稱]

> **Version:** 1.0.0
> **Status:** Active
> **Role:** The "Constitution" of the project. All Features and Specs must align with this.

## 1. Core Vision (核心願景)

**Elevator Pitch:**
[產品名稱] 是一個 [目標市場/類別] 平台，旨在幫助 [目標用戶] 解決 [核心痛點]，通過 [核心解決方案/獨特點] 實現 [最終價值]。

**North Star Metric (北極星指標):**

* [指標名稱]: [描述 - 例如：用戶每日專注時長]

---

## 2. Target Audience (目標用戶與畫像)

### Primary Persona (核心用戶)

* **Role:** [例如：備考的學生]
* **Key Traits:** [關鍵詞]
* **Pain Points:**
  * [痛點 1]
  * [痛點 2]
* **Goals:**
  * [希望達成的結果]

---

## 3. Product Principles (產品原則)

* **[原則 1]:** [例如：極簡優先 - 任何增加點擊的操作都需要額外理由]
* **[原則 2]:** [例如：鼓勵而非懲罰 - 完不成任務時給鼓勵，而不是紅色的警告]

---

## 4. Design & Experience (設計與體驗語言) [?UI]

> **Note:** 本節僅適用於有 UI 的專案。具體色值和圓角定義請嚴格參閱 `[[__DOCS_DIR__]]/global/design_tokens.json`。

### Visual Style (視覺風格)

* **Keywords:** [例如：溫暖、專注、無干擾]
* **Density:** [例如：大留白，沉浸式]
* **Animation:** [例如：輕微的微交互，不要花哨的轉場]

### Tone of Voice (文案語調)

* **Personality:** [例如：像一個陪讀的夥伴，而不是嚴厲的老師]
* **Do's:** [例如：用"我們一起"代替"你應該"]
* **Don'ts:** [例如：不要使用機械的錯誤碼報錯]

---

## 5. Boundaries (邊界與反目標)

### In Scope (核心範圍)

* [核心功能 A]
* [核心功能 B]

### Out of Scope (明確不做)

* **[反目標 1]:** [例如：不做社交排行榜]
* **[反目標 2]:** [例如：不提供深色模式切換（默認即深色）]

---

## 🤖 AI Maintenance Guide

**Trigger**: 僅在項目初始化 (`/archi.start`) 或重大戰略轉型 (`/archi.revise`) 時修改。

**Action**:
1.  **Alignment**: 確保 Section 3 (Principles) 與 `02_tech_stack.md` 中的技術選型不衝突。
2.  **Completeness**: 必須填滿所有 `[ ]` 佔位符，嚴禁保留 "Example" 字樣。
3.  **Consistency**: 所有的 Feature Request (`.spec.md`) 都必須引用此文件的 Vision 以確保不跑題。

---
description: Task Specification for {FEATURE_NAME}.
---

# Task Spec: {FEATURE_NAME}

> **Status:** [Draft]
> **Task Type:** [Feature / Infra / Polish]
> **Context:** [AI: 一句話描述本任務的目標和價值]

## 1. Overview

<!-- [AI]: 簡述任務背景、目標和使用者價值（2-3 句）。
  - FEAT 任務: 從使用者視角描述 "As a [Role], I want to [Action], So that [Benefit]"
  - INF 任務: 描述本基礎設施支撐的下游範圍
  - POLISH 任務: 描述當前狀態和優化目標
-->

## 2. Acceptance Criteria

<!-- [AI]: 核心驗收契約 — 開發和測試的唯一依據。
  按 Task Type（從 ID 前綴推斷）選擇適用的維度格式，可組合多個維度。

  === 維度積木（按需組合，至少選一個主維度）===

  ▸ Behavioral（行為維度）[FEAT 主維度]
    用 Gherkin Given/When/Then 定義系統行為路徑（正常 + 異常）。

  ▸ Structural（結構維度）[INF 主維度]
    用 Configuration Contract 定義檔案/配置的目標狀態：
    - Path: 檔案路徑
    - Key Settings: 關鍵配置項及具體值（禁泛化描述如「配置 X」）
    - Constraints: 技術紅線
    - Verify: 可執行命令 + 期望輸出

  ▸ Quantitative（量化維度）[POLISH 主維度]
    用 Quality Target 定義可度量目標：
    - Metric: 指標名
    - Baseline: 當前值
    - Target: 目標值
    - Verify: 測量方式

  ▸ Contractual（契約維度）[整合/共享引擎常用]
    定義對外暴露或對接的介面契約：
    - 外部 API 的 Input/Output/Error 映射
    - 共享模組的匯出型別簽名

  ▸ Invariant（不變量維度）[重構常用]
    聲明必須保持不變的行為/介面：
    - Preserve: [必須不變的行為或介面]
    - Verify: [回歸驗證方式]

  === 混合型任務範例 ===
  INF 任務可能含 Behavioral 子維度（如熱鍵註冊有行為路徑）
  FEAT 任務可能含 Structural 子維度（如需建立配置檔案）
  用子標題區分不同維度即可。
-->

## 3. Data Requirements

<!-- [AI]: [?Data] 聲明資料變更，引用 data_snapshot.json 中的資料表結構。
  無資料變更時寫 "N/A"。

  * Schema: [Table Name] -> [Field] (Add/Modify)
  * API: [Method] [Path]
  * Permissions: [Required Role]
-->

## 4. Interface Exports

<!-- [AI]: [?Upstream] 本任務暴露給下游任務的公共介面、約定、匯入路徑。
  下游任務依賴此處聲明而非猜測。無下游消費者時省略本節。

  格式:
  | Export | Value | Consumer |
  |:---|:---|:---|
  | [約定/API/path alias/腳本] | [具體值] | [下游任務 ID] |
-->

## 5. Constraints

<!-- [AI]: 從 vision.md + 02_tech_stack.md 提取與本任務相關的紅線約束。

  格式:
  - [約束內容] (ref: [來源])
-->

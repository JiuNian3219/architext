---
description: "[?Complex] 技術方案設計 — 定義核心機制的實作策略、狀態流轉、參數與不變量。僅當任務含非平凡技術決策時生成。"
glue: 銜接 spec.md(WHAT) 與 plan.json(DO)，定義 HOW。plan.json tasks 須覆蓋本文檔所有機制；spec.md § 2 AC 須可在本設計中追蹤出完整路徑。
---

# Technical Design: {FEATURE_NAME}

> **Spec**: `spec.md`（驗收標準 — 本設計的約束來源）
> **Plan**: `plan.json`（執行任務 — 本設計的下游消費者）
> **Trigger**: [AI: 一句話說明為什麼本任務需要技術方案設計]

## 1. Solution Overview

<!-- [AI]: 2-3 句概述技術方案及核心取捨。
  - 引用 plan.json decisions 中的選型結果（如 "Data Flow=Realtime WebSocket"）
  - 說明為何選此方案而非替代方案（如已在 step_2 討論則簡引）
  - 禁重複 spec.md 驗收標準內容；本節回答「用什麼方式實作」而非「實作什麼」
-->

## 2. Core Mechanisms

<!-- [AI]: 本文檔主體。按技術需求選用 ≥1 個結構化模式描述核心機制。
  每個機制獨立一個子章節（2.1, 2.2, ...），標註模式類型。
  同一任務可組合多個模式（如：連線管理用狀態機 + 訊息處理用流水線）。

  [[SKILL: archi-design-patterns|按 skill 的模式選擇指南選取適用模式，生成標準格式表格並執行自檢。自檢未通過須修補後重檢，全部通過再進入下一個機制。]]
-->

### 2.1 [機制名稱] — 模式: [State Machine / Pipeline / Decision Matrix / Protocol]

<!-- 按 archi-design-patterns skill 中對應模式的標準格式填寫 -->

## 3. Parameters

<!-- [AI]: 所有機制中的具體數值，集中聲明。
  禁模糊描述（如「適當的超時」、「合理的間隔」），須寫出具體值 + 單位 + 依據。

  | 參數 | 值 | 單位 | 依據 |
  |:---|:---|:---|:---|
  | [參數名] | [具體值] | [單位] | [為什麼是這個值] |
-->

## 4. Invariants

<!-- [AI]: 系統在任何時刻都須滿足的斷言。每條須可被程式碼 assert 或測試驗證。
  格式: [INV-N] 斷言描述

  約束:
  - 每條不變量須對應 plan.json 中至少一個 test 條目或 task notes 中的驗證項
  - 不變量是實作的「護欄」：AI 寫程式碼時須確保不違反任何一條
-->

## 5. Failure Modes

<!-- [AI]: 顯式列舉核心機制可能的故障場景。每個故障須有檢測方式和應對策略。

  | 故障 | 檢測方式 | 應對策略 | 降級行為 |
  |:---|:---|:---|:---|
  | [故障描述] | [如何發現: 事件/超時/異常類型] | [首選恢復: 重試/重連/回滾] | [恢復失敗後: 切換模式/提示使用者/靜默記錄] |

  約束:
  - 檢測方式須具體（禁「檢測到錯誤時」，須寫「收到 4xx / 心跳 3 次超時 / catch TypeError」）
  - 降級行為須可觀測（禁「報錯」，須寫具體 UI 回饋或 exit code）
-->

## 6. Trace Verification

<!-- [AI]: 從 spec.md § 2 每條 AC 出發，在本設計中追蹤執行路徑。

  | AC (來自 spec § 2) | 追蹤路徑 (在本設計中的執行鏈) | 結果 |
  |:---|:---|:---|
  | [Given X When Y Then Z] | [State A →(event)→ State B →(action)→ State C] 或 [Pipeline Step 1→2→3] | ✓ 可達 |
  | [Given X When Error Then W] | [State A →(error)→ State D; Failure Mode #2 → 降級行為] | ✓ 可達 |

  **Gap Check**: 某條 AC 無法追蹤 → 回到 § 2 補充機制或 § 5 補充故障處理。
  所有 AC 均 ✓ 後本設計可交付。
-->

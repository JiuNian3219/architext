---
name: archi-decompose-roadmap
description: Architext 任務分解專家。五步分解法：先標定專案類型校準基建清單，再雙視角提取 Feature 和 Infra 任務，NFR 橫切關注點歸併入 goal（不獨立成任務），建立真實依賴鏈並輸出並行批次。產出符合 Tier 1 Schema 的 roadmap.json 任務，作為 `/archi.plan` 的輸入契約。用於任何需要生成或追加 Roadmap 任務的場景。
---

# Roadmap 任務分解

## 系統流程定位

```
Brief → [本 Skill] → roadmap.json 任務
                            ↓
                   /archi.plan <task-id>
                   讀: vision.md + map.json + tech_stack.md
                   寫: spec.md（行為規格/驗收標準）
                       ui.md（元件結構，AI 編碼真相源）[?UI]
                   視覺參考: [[__DOCS_DIR__]]/global/ui_concept.html [?UI]
                       plan.json（可執行步驟 + 測試用例 checkbox）
                   也更新: map.json / dictionary.json / data_snapshot.json
                            ↓
                   /archi.code → 讀 spec.md + ui.md + plan.json → 寫程式碼
```

> **Skill 職責邊界**：
> - 負責：任務的 what（描述）、done 標準（goal）、依賴鏈、設計決策注入、Core 介面契約
> - 不負責：檔案路徑（map.json 管）、變數命名（dictionary.json 管）、測試用例（plan.json 管）、UI 元件結構（ui.md 管）
>
> **Schema 約束（Tier 1 嚴格）**：roadmap.json 由 CLI 的 Zod Schema 校驗，**禁增刪欄位**。

## 呼叫模式

| 模式 | 觸發來源 | 輸入 | 限制 |
|:---|:---|:---|:---|
| 從零建立 | `/archi.start` | Brief 功能清單 | 禁生成 EDIT 任務 |
| 增量追加 | `/archi.scope` | Brief + 已有 Roadmap 上下文 | 禁改已有任務，ID 沿用水位 |

---

## 分解框架（五步）

### Step 0 · 專案類型標定

從 Brief 的技術棧 / 專案描述中識別專案類型，確定標準基建清單，防止 Step 2 反推遺漏框架性 Infra。

| 專案類型 | 腳手架須包含（除通用建置工具鏈外） |
|:---|:---|
| Web SPA / PWA | 路由骨架（如 React Router）、全域 App Shell（版面配置 / Provider / 主題注入） |
| CLI 工具 | logger 模組、AppError 處理層、命令註冊入口 |
| API 服務 | 路由層、中介層、DB 連線層、全域錯誤處理 |
| 小程式 | 頁面路由設定、全域 app.js/ts、請求封裝層 |

**操作**：將標定結果注入 Step 2 的 INF-01 描述，確保腳手架任務覆蓋對應清單。

---

### Step 1 · PM 視角 → Feature 任務

從 Brief 功能描述提取使用者場景，聚合為 Feature 任務。

1. 逐條功能轉化為場景句式：`使用者可 [動作] → [可感知結果]`
2. 共享同一核心流程的場景 → 合併為一個 Feature 任務
3. 粒度校準（核心原則：**一任務 = 一次 `/archi.plan` 會話 = 一個 `features/<slug>/` 子目錄**）：

| 訊號 | 動作 |
|:---|:---|
| 描述含「和」（兩個獨立關注點） | 拆分 |
| DoD 超過 4 條驗收標準 | 拆分 |
| 任務橫跨 3 個以上獨立 UI 區域或實作域 | 拆分 |
| 一次 `/archi.plan` 難以在單一 spec.md 中完整描述行為 | 拆分 |
| 兩任務檔案集合 >50% 重疊 | 合併 |
| 一個任務完成後另一個才有意義 | 合併 |

**DoD 格式**：`完成後，使用者可 <可驗證的使用者行為>；邊界：<明確不做的事>`

> DoD 是 `/archi.plan` 生成 spec.md 驗收標準和 plan.json 測試用例的基準。須精準描述使用者可感知結果，禁寫實作細節（檔案路徑、函式名稱、測試命令由 plan 階段決定）。

以下情況歸屬父任務，禁獨立成條：**輕量**結果頁 / 完成頁、空狀態頁、確認彈窗。

> **豁免**：結果頁含獨立資料視覺化元件（圖表庫）、複雜動效邏輯或獨立業務計算時，**不適用**父任務歸屬規則，須獨立成 Feature 任務。

---

### Step 2 · 架構師視角 → Infra 任務

從 Feature 任務反推共享基礎，禁預設基建。

對所有 Feature 任務問：多個 Feature 同時依賴 X 且 X 須在 Feature 前存在 → X 是 Infra 任務。

| Infra 類型 | 判斷標準 |
|:---|:---|
| 專案腳手架 / 全域 Schema / 型別定義 | 所有 Feature 均依賴；須覆蓋 Step 0 標定的專案類型清單 |
| 共享核心引擎（打字引擎、規則引擎等） | 滿足以下**任一**條件：① 2 個以上 Feature 直接呼叫；② 純邏輯層、可獨立單元測試、與 UI 完全解耦。`tag: Core` |
| 第三方整合層 | 多個 Feature 複用同一外部服務 |

**Core 任務規劃契約**：`tag: Core` 任務的 `description` 末尾須聲明主要導出介面（函式簽名或關鍵 interface 名稱）。
下游 Feature 的 `/archi.plan` 會話可直接對接該介面，無需讀上游實作，保障跨任務規劃的一致性與可預測性。

---

### Step 3 · NFR 過濾

以下類型**禁獨立成任務**：注入首個實現該能力的任務 `goal` 末尾（`[NFR] <說明>`）；其餘受影響任務僅在 NFR 清單中標注。`/archi.plan` 執行時會將 NFR 注入對應的 spec.md 約束章節。

| 類型 | 常見形式 | 注意 |
|:---|:---|:---|
| 國際化 | i18n、多語言、翻譯文案 | — |
| 視覺主題（配置型） | 品牌色 Token、Tailwind 主題色、CSS 變數定義 | NFR，注入腳手架任務 |
| 視覺主題（功能型） | 深色/淺色切換按鈕、OS 偏好偵測、主題持久化 | **非 NFR**，須建立獨立 Feature 任務（有使用者可見行為） |
| 動效風格規範 | 頁面切換方式、過渡時長約定 | NFR，注入首個含動效的 Feature goal |
| 效能優化 | 懶載入、虛擬列表、快取策略 | — |
| 無障礙 | A11y、鍵盤導航、螢幕閱讀器 | — |

---

### Step 4 · 依賴與並行優化

- **真實依賴鏈**：禁所有 Feature 統一只掛 `INF-01`，須反映真實業務關係。
- **最小依賴原則**：能並行的任務不加多餘依賴，最大化 Batch 並行度。

---

## 任務規則

1. **ID 生成**：沿用已有 Roadmap 編號水位，從各前綴最大值 +1 起；全新專案從 `INF-01` / `FEAT-01` 起。

2. **Phase 歸屬**：

   | 任務類型 | Phase |
   |:---|:---|
   | 專案腳手架、Schema、全域型別 | Phase 1 (Infrastructure) |
   | 共享核心引擎（Step 2 識別） | Phase 1 (Infrastructure) |
   | 業務功能 Feature | Phase 2 (Core Features) |
   | EDIT-xxx（修改已有功能） | 與被修改任務同 Phase |

3. **設計決策注入**：Brief 中已有設計決策 → 注入對應任務 `goal` 末尾：`[使用者預設] <內容>`；同一條決策禁在多任務重複。`/archi.plan` 將其視為不可更改的硬約束，直接寫入 spec.md，不再提問。

4. **EDIT 任務**：需修改已有功能 → 建立 `EDIT-xxx`（`tag: Edit`），goal 注明修改範圍；僅增量追加模式下使用。

5. **Slug 命名**：`slug` 即 `features/<slug>/` 資料夾名，須清晰表達任務內容，格式為 `Pascal_Snake_Case`（如 `Typing_Engine_Core`）。每個任務對應唯一一個 feature 子目錄，禁重名。

---

## Task JSON Schema（Tier 1 嚴格，禁增刪欄位）

```json
{
  "id": "FEAT-01",
  "title": "Task Title In English",
  "status": "pending | blocked",
  "description": "<1-2 句說明這個任務要建置什麼、涵蓋哪些範圍。Core 任務須在末尾聲明主要導出介面>",
  "goal": "完成後，使用者可 <可驗證的使用者行為>；邊界：<明確不做的事>",
  "deps": ["INF-01"],
  "tag": "Infra | Core | Feature | Edit",
  "slug": "Task_Title_Snake_Case"
}
```

`deps` 為空或全部 `done` → `pending`；有未完成 deps → `blocked`

---

## 中間產物

> 此 Skill 為子程序：產出結構化資料後，控制權交還呼叫方。
> - `/archi.scope` → 呼叫方展示給使用者確認，OK 後寫入 `roadmap.json`
> - `/archi.start` → 呼叫方直接寫入 `roadmap.json`

產出兩部分資料：

**① 任務資料**（直接對應 `roadmap.json` 的 phases/tasks 結構）：

```json
{
  "phases": [
    {
      "id": "phase-1",
      "name": "Infrastructure",
      "tasks": [
        { "id": "INF-01", "title": "...", "status": "pending", "description": "...", "goal": "...", "deps": [], "tag": "Infra", "slug": "..." }
      ]
    },
    {
      "id": "phase-2",
      "name": "Core Features",
      "tasks": [
        { "id": "FEAT-01", "title": "...", "status": "blocked", "description": "...", "goal": "...", "deps": ["INF-01"], "tag": "Feature", "slug": "..." }
      ]
    }
  ]
}
```

**② NFR 歸併清單**（元資料，供呼叫方展示）：

- [NFR 名稱] → 注入 [任務 ID] goal | 影響範圍：[其他相關任務 ID]

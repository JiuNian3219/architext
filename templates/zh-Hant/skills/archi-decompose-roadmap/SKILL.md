---
name: archi-decompose-roadmap
description: Architext 任務分解專家。五步分解法：先標定專案類型校準基建清單，再雙視角提取業務 Task 和 Infra 任務，NFR 橫切關注點歸併入 goal（不獨立成任務），建立真實依賴鏈並輸出並行批次。產出符合 Tier 1 Schema 的 roadmap.json 任務，作為 `/archi.plan` 的輸入契約。用於任何需要生成或追加 Roadmap 任務的場景。
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
                   視覺參考: [[__DOCS_DIR__]]/global/ui_context.md [?UI]
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
| Web SPA / PWA | 路由骨架（如 React Router）+ 全域 App Shell（版面配置 / Provider / 主題注入） |
| 全端 Web（SSR/SSG）| 路由約定（loader/action/頁面）+ API Routes 層 + 全域版面配置 + Auth Session 管理（Cookie/JWT）；[?UI] 主題注入 |
| CLI 工具 | logger 模組 + AppError 處理層 + 命令註冊入口 |
| API 服務（REST / GraphQL）| 路由層 + 中介層 + DB 連線層 + 全域錯誤處理；[?GraphQL] Schema 定義層 + DataLoader |
| 行動端 App（原生/跨平台）| 導航骨架（React Navigation / Go Router）+ 平台適配層（iOS/Android 權限、原生模組）+ 環境配置（dev/staging/prod）|
| 小程式 | 頁面路由設定 + 全域 app.js/ts + 請求封裝層 |
| 瀏覽器擴充功能 | manifest.json（V2/V3）+ Background Service Worker + Content Script 注入層 + 訊息匯流排（background ↔ content ↔ popup）+ Popup/Options 頁入口 |
| 桌面端 App（單機）| 主程序入口（Electron main / Tauri main.rs）+ IPC 通訊橋接 + 系統級能力（系統匣、快速鍵）+ 原生檔案系統封裝 |
| Web + 桌面端（Hybrid）| Web 腳手架基礎 + 桌面執行時整合（Tauri/Electron）+ 系統級能力（系統匣、全域快速鍵、系統通知）；**桌面整合須獨立拆分為 INF 子任務**（OS 差異大、與 Web 技術棧完全不同，不適用 Step 2 的「同期執行合併」規則） |
| 函式庫 / SDK / NPM 套件 | 雙產物配置（CJS + ESM）+ 公共 API 入口（barrel index.ts）+ 型別宣告生成（.d.ts）+ Changelog / 版本工具鏈；**禁建業務 Task，僅 INF 層** |
| 即時 / 協作型 App | WebSocket 服務層 + 事件 Schema 定義（共享型別）+ 房間/會話管理基礎；[?CRDT] 衝突解決層 |
| AI Agent / MCP 工具 | LLM 客戶端抽象層（provider 無關）+ Prompt 範本管理 + Tool/Function Calling Schema + 對話狀態 / Memory 管理；[?MCP] MCP 協定適配器 |

**操作（兩個輸出）**：
1. **注入 Step 2 INF-01**：將對應類型的腳手架清單寫入 INF-01 描述。
2. **注入 Step 1 場景約束**：按專案類型限定場景句式，Step 1 提取業務場景時須遵守以下約束：

| 專案類型 | 場景句式範本 | 禁止出現的詞彙 |
|:---|:---|:---|
| CLI 工具 | `使用者可 [執行命令/傳參] → [終端輸出結果]` | 頁面、路由、元件、UI |
| 函式庫 / SDK | `呼叫方可 [呼叫 API X] → [回傳 Y]` | 使用者、介面、互動 |
| API 服務 | `客戶端可 [HTTP METHOD /path] → [回應結構]` | 前端、頁面、元件 |
| 小程式 | `使用者可在 [頁面名] [操作] → [微信端可見結果]` | 後端路由、REST |
| Web SPA / 全端 / 行動端 / 桌面端 | `使用者可 [動作] → [可感知結果]` | （無特殊限制）|

---

### Step 1 · PM 視角 → 業務 Task

從 Brief 功能描述提取使用者場景，聚合為業務 Task。

1. 逐條功能轉化為場景句式：`使用者可 [動作] → [可感知結果]`
2. 共享同一核心流程的場景 → 合併為一個業務 Task
   > **注意**：「共享功能域/主題」≠「共享核心流程」。屬於同一功能域（如「社群互動」）但各自有獨立 UI 區域和實作域的場景，須按下方拆分訊號獨立成 Task，禁因主題相同而強行合併。「共享核心流程」僅指：場景在同一 UI 視圖內完成、操作同一資料實體、共享同一狀態流轉。
3. 粒度校準（核心原則：**一任務 = 一次 `/archi.plan` 會話 = 一個 `tasks/<slug>/` 子目錄**）：

    **行為視角（PM）**：

    | 訊號 | 動作 |
    |:---|:---|
    | 描述含「和」（兩個獨立關注點） | 拆分 |
    | DoD 超過 4 條驗收標準 | 拆分 |
    | 任務橫跨 3 個以上獨立 UI 區域或實作域 | 拆分 |
    | 一次 `/archi.plan` 難以在單一 spec.md 中完整描述行為 | 拆分 |
    | 兩任務檔案集合 >50% 重疊 | 合併 |

    > **注意**：若「A 完成後 B 才有意義」，這是順序依賴關係，**禁合併**；在 Step 4 為 B 聲明 `deps: [A]` 即可。

    **實作視角（工程，與行為視角獨立判斷，任一觸發即拆分）**：

    | 訊號 | 動作 | 範例 |
    |:---|:---|:---|
    | 任務內含 ≥2 個**實作域**，且各域可獨立單元測試 | 拆分 | 純計算層 + UI 渲染層 → 各自獨立 |
    | 實作時需同時掌握 ≥3 個相互獨立的技術關注點 | 拆分 | 字元渲染 + 狀態機 + 動效 API → 三件事 |
    | 某一關注點有獨立的邊界複雜度（如 IME、Canvas、第三方圖表 API） | 獨立出該關注點 | 輸入捕獲 + IME 單獨成任務 |

    > **為何加入實作視角**：行為視角描述「使用者看到什麼」，實作視角描述「AI 實作時需同時掌握什麼」。一個任務行為上內聚（同一頁面），但工程上橫跨多個不同域時，AI 在 `/archi.code` 階段會因上下文過寬而顧此失彼。

    **粒度上限**：

    > 一個 Roadmap Task = **AI 可不再分解、直接產出一個內聚 spec.md** 的最小功能單元（HTN Primitive 可執行性原則）。

    *分解階段代理指標（以 Brief 描述為依據直接判斷）*：

    | 代理指標 | 上限 | 超出時的動作 |
    |:---|:---|:---|
    | 任務描述中獨立使用者操作流程數 | ≤ 3 條 | 拆分 |
    | 任務涉及的獨立資料實體數（各有獨立狀態流轉）| ≤ 2 個 | 拆分 |
    | 描述中「和/並/以及」連接的獨立關注點數 | ≤ 1 處 | 拆分 |
    | 任務驗收無法在不執行另一個業務 Task 的情況下獨立完成 | — | 檢查耦合，重劃介面邊界（INVEST-I）|

    > `/archi.plan` 執行中若預估 spec.md Scenario > 6 或 plan.json Phase > 4，須暫停並提示使用者返回 `/archi.scope` 重新拆分，禁強行塞進單一任務。

**DoD 格式**：`完成後，使用者可 <可驗證的使用者行為>；邊界：<明確不做的事>`

> DoD 是 `/archi.plan` 生成 spec.md 驗收標準和 plan.json 測試用例的基準。須精準描述使用者可感知結果，禁寫實作細節（檔案路徑、函式名稱、測試命令由 plan 階段決定）。

以下情況歸屬父任務，禁獨立成條：**輕量**結果頁 / 完成頁、空狀態頁、確認彈窗。

> **豁免**：結果頁含獨立資料視覺化元件（圖表庫）、複雜動效邏輯或獨立業務計算時，**不適用**父任務歸屬規則，須獨立成業務 Task。

---

### Step 2 · 架構師視角 → Infra 任務

從業務 Task 反推共享基礎，禁預設基建。

對所有業務 Task 問：多個 Task 同時依賴 X 且 X 須在 Task 前存在 → X 是 Infra 任務。

| Infra 類型 | 判斷標準 |
|:---|:---|
| 專案腳手架 / 全域 Schema / 型別定義 | 所有業務 Task 均依賴；須覆蓋 Step 0 標定的專案類型清單 |
| 共享核心引擎（打字引擎、規則引擎等） | 滿足以下**任一**條件：① 2 個以上業務 Task 直接呼叫；② 純邏輯層、可獨立單元測試、與 UI 完全解耦。`tag: Core` |
| 第三方整合層 | 多個業務 Task 複用同一外部服務 |

**Core 任務規劃契約**：`tag: Core` 任務的 `description` 末尾須聲明主要導出介面（函式簽名或關鍵 interface 名稱）。
下游 Task 的 `/archi.plan` 會話可直接對接該介面，無需讀上游實作，保障跨任務規劃的一致性與可預測性。

**Infra 任務粒度原則：避免微粒化，但禁止跨層堆積**：

- **禁微粒化**：無實質技術差異的同層配置項（如 ESLint + Prettier + TypeScript strict + commitlint）→ 合併，減少任務數、降低依賴鏈雜訊。
- **禁跨層堆積**：每個獨立的架構層各有獨立技術細節，合併後 AI 上下文同樣會失焦；且將多層堆入同一 INF 任務會把關鍵路徑拉至最長，推遲所有業務 Task 的啟動時機。

> **架構層參考**（每層有獨立實作邊界，原則上各自成任務）：
> 專案腳手架（建置 / 程式碼品質工具鏈）| 資料層（DB 連線 / ORM / 遷移）| 認證層（Auth 中介層 / Session / JWT）| API 路由層（路由註冊 / 中介層鏈 / 全域錯誤處理）| 前端基礎設施（主題 / Design Token / 全域版面配置）| 第三方服務整合（各服務獨立成 INF 任務）

| 訊號 | 動作 |
|:---|:---|
| 同一架構層內的關聯配置項（如程式碼品質工具鏈各項、或路由骨架與全域錯誤中介層同屬 API 路由層）| 合併 |
| 跨越獨立架構層（如 DB 連線層 + Auth 中介層、或 API 路由 + 前端主題系統）| 拆分 |
| 技術棧完全不同（如本機儲存層 vs 主題配置）| 拆分 |
| 含 OS 級系統 API（系統匣、全域快速鍵、檔案關聯等）| **強制拆分**（Step 0 強制規則，不受「同層合併」條件約束） |
| 某 Infra 產出物被 ≥2 個業務 Task 直接呼叫（介面型） | 獨立成任務（須聲明導出介面契約） |

**隱式標準功能掃描**：以下功能通常不在 Brief 中出現，須按歸屬分類主動補充（禁遺漏）：

*須補充為獨立業務 Task（Phase 2，有使用者可見行為）*：

| 檢查項 | 觸發條件 |
|:---|:---|
| 使用者 Profile / 帳號設定頁 | 專案含 Auth（INF 層有認證中介層）|
| 帳號安全 / 密碼設定頁 | 含 Auth 且使用者可修改密碼或綁定第三方帳號 |
| 通知中心 / 訊息列表頁 | 含通知基礎設施且通知有「已讀/未讀」狀態 |

*須補充為 INF 任務（Phase 1，基礎設施）*：

| 檢查項 | 觸發條件 |
|:---|:---|
| 通知基礎設施（伺服器推播/訊息佇列層）| ≥1 個 Task 口頭提及「通知/提醒」但未建 INF Task |
| 搜尋基礎設施（PG FTS 索引 / 外部引擎部署）| ≥2 個業務 Task 各自描述「搜尋」功能；須在此決策方案後以 INF Task 承載，下游 Task 依賴它 |
| 權限 / 角色管理層（RBAC）| 含 Auth 且有 ≥2 種使用者角色（如 admin / user）|
| 檔案儲存整合層（S3 / OSS 封裝）| ≥1 個 Task 涉及檔案上傳 / 下載 / 預覽 |
| 電子郵件 / 簡訊發送整合 | Task 提及「發送郵件 / 驗證碼 / 簡訊通知」|
| 支付整合層 | Task 提及「支付 / 下單 / 結帳 / 退款」|

---

### Step 3 · NFR 過濾

以下類型**禁獨立成任務**：注入首個實現該能力的任務 `goal` 末尾（`[NFR] <說明>`）；其餘受影響任務僅在 NFR 清單中標注。`/archi.plan` 執行時會將 NFR 注入對應的 spec.md 約束章節。

> **「首個任務」定義**：在依賴鏈中，`deps` 僅含 INF 層（無業務前置依賴）且最早涉及該 NFR 能力的任務。同層（同 Batch）有多個候選時，取 ID 最小的那個。

| 類型 | 常見形式 | 注意 |
|:---|:---|:---|
| 國際化 | i18n、多語言、翻譯文案 | — |
| 視覺主題（配置型） | 品牌色 Token、Tailwind 主題色、CSS 變數定義 | NFR，注入腳手架任務 |
| 視覺主題（功能型） | 深色/淺色切換按鈕、OS 偏好偵測、主題持久化 | **非 NFR**，須建立獨立業務 Task（有使用者可見行為） |
| 動效風格規範 | 頁面切換方式、過渡時長約定 | NFR，注入首個含動效的 Task goal |
| 效能優化 | 懶載入、虛擬列表、快取策略 | — |
| 無障礙 | A11y、鍵盤導航、螢幕閱讀器 | — |

---

### Step 4 · 依賴與並行優化

- **真實依賴鏈**：禁所有業務 Task 統一只掛 `INF-01`，須反映真實業務關係。
- **業務實體依賴（優先於最小依賴）**：若功能 B 的核心操作主體由功能 A 產生（即 A 完成前 B 的資料實體不存在），則 B 須聲明對 A 的依賴。此規則優先於最小依賴原則。示例：Usage Log 記錄的主體是 Prompt，Prompt 由 FEAT-Prompt_Create 建立 → Usage Log Task 須依賴 Prompt Task，而不僅依賴 INF 層。
- **最小依賴原則**：能並行的任務不加多餘依賴，最大化 Batch 並行度。

---

## 任務規則

1. **ID 生成**：沿用已有 Roadmap 編號水位，從各前綴最大值 +1 起；全新專案從 `INF-01` / `FEAT-01` 起。

2. **Phase 歸屬**：

   | 任務類型 | Phase |
   |:---|:---|
   | 專案腳手架、Schema、全域型別 | Phase 1 (Infrastructure) |
   | 共享核心引擎（Step 2 識別） | Phase 1 (Infrastructure) |
   | 業務 Task | Phase 2 (Core Features) |
   | EDIT-xxx（修改已有功能） | 與被修改任務同 Phase |

3. **設計決策注入**：Brief 中已有設計決策 → 注入對應任務 `goal` 末尾：`[使用者預設] <內容>`；同一條決策禁在多任務重複。`/archi.plan` 將其視為不可更改的硬約束，直接寫入 spec.md，不再提問。

4. **EDIT 任務**：需修改已有功能 → 建立 `EDIT-xxx`（`tag: Edit`），goal 注明修改範圍；僅增量追加模式下使用。

5. **Slug 命名**：`slug` 即 `tasks/<slug>/` 資料夾名，須清晰表達任務內容，格式為 `Pascal_Snake_Case`（如 `Typing_Engine_Core`）。每個任務對應唯一一個 task 子目錄，禁重名。

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

產出三部分資料：

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

**② NFR 歸併清單**（須隨任務資料一併返回給呼叫方；呼叫方寫入 roadmap 時追加為 `nfr` 頂層欄位；`/archi.plan` 的 `step_1_load` 須讀取此清單）：

| NFR 名稱 | 注入任務 ID | 約束內容摘要 | 影響範圍（其他相關任務 ID）|
|:---|:---|:---|:---|
| （範例）i18n | FEAT-01 | 所有文案須透過 i18n key 引用，禁硬編碼字串 | FEAT-02, FEAT-03 |

**③ 並行執行批次**（DAG 拓撲層次圖，同一 Layer 內任務可交給不同 AI 會話並行處理）：

```
Layer 0 ║ INF-01
Layer 1 ║ INF-02 · INF-03              ← 均依賴 INF-01
Layer 2 ║ FEAT-01 · FEAT-02            ← 各自依賴 INF-02 / INF-03
Layer 3 ║ FEAT-03                      ← 依賴 FEAT-01
```

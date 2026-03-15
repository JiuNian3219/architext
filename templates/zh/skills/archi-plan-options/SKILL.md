---
name: archi-plan-options
description: Generate architecture decision options by project type. Use when planning and need guidance on technical choices.
---

# 架构决策选项库

## 系统流程定位

```
/archi.plan step_2 Part 2
    ↓
[本 Skill] 按项目标签提取核心问题清单
    ↓
逐问题判断：直接推荐 或 展开 Q-table
    ↓
写入 Task Proposal 架构建议表
```

> **职责边界**：负责各项目类型的核心问题清单、候选方案、推荐 vs 展开决策；不负责 Q-table 格式（见 `archi-interview-protocol`）。

---

## 选用逻辑（三步）

**Step 1 · 约定继承检查**
读 `tech_stack.md` §9。有项目约定 → 直接继承，禁展开（除非功能明确需偏离）。

**Step 2 · 提取核心问题**
根据项目标签，从下表提取该类型必须回答的核心问题清单。

**Step 3 · 逐问题裁决**
| 条件 | 处理 |
|:---|:---|
| 答案明确（上下文足够）| 直接推荐，1-2 句理由 |
| 2+ 合理选项且选择显著影响实现 | 展开 Q-table（格式见 `archi-interview-protocol` Skill 的标准输出格式） |

---

## 按项目类型的核心问题清单

### `data` 项目：数据层设计

**实体关系** — Flat | 1:N | M:N | Recursive | JSON/EAV | Virtual
**一致性** — ACID | 最终一致性 | 乐观锁 | 无需
**访问模式** — 读多写少 | 读写均衡 | 写密集 | 实时查询
**安全与备份** — 静态加密 | 传输加密 | 定期备份 | 敏感数据脱敏

---

### `cli` 项目：命令行交互设计

**输入接收** — Pure Args | Interactive Prompts | Hybrid | Config File | Stdin/Pipe
**输出呈现** — Silent | Progress/Spinner | Structured | Human-readable
**执行模式** — One-shot | REPL | Watch/Daemon | Batch
**错误处理** — Exit Code Only | Stderr Message | Retry Logic | Interactive Recovery

---

### `lib` 项目：库 API 设计

**暴露形态** — Functions | Class/Instance | Builder/Fluent | Config Object | Plugin System
**消费者接入** — Import & Call | Register & Use | Decorator | Global Registration
**公开边界** — Full Public | Facade | Internal Heavy
**错误处理** — Throw on Error | Return Result Type | Error Callback | Event Emitter
**文档策略** — JSDoc/TSDoc | README Quick Start | API Reference | Examples & Recipes

---

### `api` 项目：接口契约设计

**协议风格** — RESTful | RPC-Style | GraphQL | gRPC | WebSocket
**客户端接入** — Direct HTTP | SDK | CodeGen | Webhook
**版本演进** — URL Versioning | Header Versioning | No Versioning | Deprecation Window
**安全认证** — API Key | JWT Token | OAuth 2.0 | mTLS
**限流防护** — Rate Limiting | Quota System | IP Whitelist | Request Signing

---

### `mobile` 项目：移动端导航与交互

**导航结构** — Stack | Tab | Drawer | Hybrid
**交互模式** — List/Card | Form/Wizard | Gesture-Driven | Bottom Sheet
**状态管理** — Local State | Global Store | React Query/SWR | Offline-First
**离线支持** — Online Only | Cache for Offline | Full Offline Support | Background Sync
**性能优化** — Lazy Loading | Image Optimization | Code Splitting | Native Modules

---

### `miniapp` 项目：小程序架构

**页面组织** — Single Page | Multi-Page | Tabbar | WebView Hybrid
**平台授权** — Anonymous | Silent Auth | Phone Binding | Full Profile
**数据通信** — Request | WebSocket | EventBus | Storage Sync
**性能优化** — Lazy Load | Skeleton Screen | Preload Data | Reduce SetData

---

### `extension` 项目：浏览器扩展架构

**逻辑部署** — Background | Content Script | Popup | Full Architecture
**交互入口** — Browser Action | Context Menu | Content Injection | Side Panel | Keyboard Shortcut
**跨层通信** — Message Passing | Shared Storage | Native Messaging
**发布更新** — Manual Update | Auto Update | Chrome Web Store | Enterprise Policy

---

### `desktop` 项目：桌面应用架构

**进程分工** — Main-Centric | Renderer-Centric | Worker Thread | Multi-Process
**窗口管理** — Single Window | Multi Window | Tray/Menu Bar | Global Hotkey
**系统集成** — Native Dialogs | File System Access | Hardware Integration | Auto Updater
**打包分发** — Electron Builder | Tauri CLI | Code Signing | Auto-Update Server

---

### `ai` 项目：LLM 集成与 Agent 设计

**Provider 供应** — Direct API | Provider Abstraction | Local Model | Hybrid Cloud-Edge
**交互模式** — Chat | Command-Driven | Streaming | Autonomous Agent
**工具扩展** — No Tools | Function Calling | Code Execution | Multi-Agent | RAG
**上下文管理** — Full History | Sliding Window | Summarization | Session-Based
**成本监控** — Token Budgeting | Usage Quota | Request Logging | Performance Metrics

---

### `ui` 项目：界面交互设计（通用附加）

**数据流** — Standard Request | Optimistic UI | Realtime | Offline-First
**错误处理** — Fail Fast | Retry/Recovery | Fallback UI | Undo/Redo
**权限控制** — Public | Authenticated | Role-Based | Owner-Only
**国际化** — i18n Support | RTL Layout | Accessibility | Screen Reader

---

## 输出格式

**推荐行**：`项目类型 @ 核心问题：决策（来源: 约定/推荐）— 理由：...`

> **中间产物**：产出推荐行或 Q-table 后控制权交还 `/archi.plan`，由调用方组装进 Task Proposal。

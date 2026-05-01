---
name: archi-plan-options
description: Inline helper for architecture decision options by project type. Protocol-invoked only; may run in current context.
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议在对应步骤显式调用。
- **执行上下文**: 可在当前上下文内联执行；涉及用户提问时必须回到主对话。
- **边界**: 只辅助生成选项、访谈问题或结构化片段，不自行推进协议步骤。


# 架构决策选项库

## 核心原则

- **约定优先**：`tech_stack.md §9` 有项目约定时直接继承，禁展开（除非功能明确需偏离，在理由中说明）
- **明确即推荐**：上下文足够判断的直接产出推荐行
- **多选则问**：2+ 合理选项且显著影响实现，才展开 Q-table

## 执行协议

1. **约定检查**：读 `tech_stack_s9`，该 feature 有项目约定 → 直接继承，标来源 `约定`，跳过后续
2. **提取核心问题**：只处理当前项目实际启用的 feature 类型章节；未出现的类型视为不适用
3. **逐问题裁决**：
    - `spec_context` 给出答案明确 → 推荐行 `<feature> @ <核心问题>：<决策>（来源: 推荐）— 理由：<1-2 句>`
    - 2+ 合理选项且显著影响实现 → Q-table，列：`选项 / 优势 / 风险 / 适用场景 / 默认推荐 ✓`
4. 汇总推荐行 + Q-table 交还调用方

## 核心问题清单

[[WHEN: data |
### `data` · 数据层设计

- **实体关系** — Flat | 1:N | M:N | Recursive | JSON/EAV | Virtual
- **一致性** — ACID | 最终一致性 | 乐观锁 | 无需
- **访问模式** — 读多写少 | 读写均衡 | 写密集 | 实时查询
- **安全与备份** — 静态加密 | 传输加密 | 定期备份 | 敏感数据脱敏
]]

[[WHEN: cli |
### `cli` · 命令行交互设计

- **输入接收** — Pure Args | Interactive Prompts | Hybrid | Config File | Stdin/Pipe
- **输出呈现** — Silent | Progress/Spinner | Structured | Human-readable
- **执行模式** — One-shot | REPL | Watch/Daemon | Batch
- **错误处理** — Exit Code Only | Stderr Message | Retry Logic | Interactive Recovery
]]

[[WHEN: lib |
### `lib` · 库 API 设计

- **暴露形态** — Functions | Class/Instance | Builder/Fluent | Config Object | Plugin System
- **消费者接入** — Import & Call | Register & Use | Decorator | Global Registration
- **公开边界** — Full Public | Facade | Internal Heavy
- **错误处理** — Throw on Error | Return Result Type | Error Callback | Event Emitter
- **文档策略** — JSDoc/TSDoc | README Quick Start | API Reference | Examples & Recipes
]]

[[WHEN: api |
### `api` · 接口契约设计

- **协议风格** — RESTful | RPC-Style | GraphQL | gRPC | WebSocket
- **客户端接入** — Direct HTTP | SDK | CodeGen | Webhook
- **版本演进** — URL Versioning | Header Versioning | No Versioning | Deprecation Window
- **安全认证** — API Key | JWT Token | OAuth 2.0 | mTLS
- **限流防护** — Rate Limiting | Quota System | IP Whitelist | Request Signing
]]

[[WHEN: mobile |
### `mobile` · 移动端导航与交互

- **导航结构** — Stack | Tab | Drawer | Hybrid
- **交互模式** — List/Card | Form/Wizard | Gesture-Driven | Bottom Sheet
- **状态管理** — Local State | Global Store | React Query/SWR | Offline-First
- **离线支持** — Online Only | Cache for Offline | Full Offline Support | Background Sync
- **性能优化** — Lazy Loading | Image Optimization | Code Splitting | Native Modules
]]

[[WHEN: miniapp |
### `miniapp` · 小程序架构

- **页面组织** — Single Page | Multi-Page | Tabbar | WebView Hybrid
- **平台授权** — Anonymous | Silent Auth | Phone Binding | Full Profile
- **数据通信** — Request | WebSocket | EventBus | Storage Sync
- **性能优化** — Lazy Load | Skeleton Screen | Preload Data | Reduce SetData
]]

[[WHEN: extension |
### `extension` · 浏览器扩展架构

- **逻辑部署** — Background | Content Script | Popup | Full Architecture
- **交互入口** — Browser Action | Context Menu | Content Injection | Side Panel | Keyboard Shortcut
- **跨层通信** — Message Passing | Shared Storage | Native Messaging
- **发布更新** — Manual Update | Auto Update | Chrome Web Store | Enterprise Policy
]]

[[WHEN: desktop |
### `desktop` · 桌面应用架构

- **进程分工** — Main-Centric | Renderer-Centric | Worker Thread | Multi-Process
- **窗口管理** — Single Window | Multi Window | Tray/Menu Bar | Global Hotkey
- **系统集成** — Native Dialogs | File System Access | Hardware Integration | Auto Updater
- **打包分发** — Electron Builder | Tauri CLI | Code Signing | Auto-Update Server
]]

[[WHEN: ai |
### `ai` · LLM 集成与 Agent 设计

- **Provider 供应** — Direct API | Provider Abstraction | Local Model | Hybrid Cloud-Edge
- **交互模式** — Chat | Command-Driven | Streaming | Autonomous Agent
- **工具扩展** — No Tools | Function Calling | Code Execution | Multi-Agent | RAG
- **上下文管理** — Full History | Sliding Window | Summarization | Session-Based
- **成本监控** — Token Budgeting | Usage Quota | Request Logging | Performance Metrics
]]

[[WHEN: ui |
### `ui` · 界面交互设计

- **数据流** — Standard Request | Optimistic UI | Realtime | Offline-First
- **错误处理** — Fail Fast | Retry/Recovery | Fallback UI | Undo/Redo
- **权限控制** — Public | Authenticated | Role-Based | Owner-Only
- **无障碍** — Screen Reader | Keyboard Navigation | ARIA Attributes | Color Contrast
]]

## 输出格式

```
### Architecture Options

**推荐行**：
- data @ 实体关系：1:N（来源: 约定）— 理由：tech_stack §9 统一用 Prisma relations
- api @ 协议风格：RESTful（来源: 推荐）— 理由：spec 中的资源建模天然匹配 REST

**Q-table** (api @ 安全认证):

| 选项 | 优势 | 风险 | 适用场景 | 默认推荐 |
|:---|:---|:---|:---|:---|
| JWT Token | 无状态、易集成 | 撤销难 | SPA / 移动端 | ✓ |
| OAuth 2.0 | 标准化、支持三方 | 集成复杂 | 多方登录 | |
| API Key | 极简 | 密钥泄露风险 | 内部服务 | |
```

## 输出验证

- [ ] 每条推荐行含 `<feature> @` 前缀 + 来源标记 + 理由
- [ ] 约定来源的条目无 Q-table（除非写明偏离理由）
- [ ] Q-table 的「默认推荐」列有且仅有一个 ✓
- [ ] 所有推荐行 · Q-table 所用 `feature` 值来自本 skill body 实际出现的章节（未被 WHEN 剩掉的）

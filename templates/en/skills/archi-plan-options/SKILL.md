---
name: archi-plan-options
description: Inline helper for architecture decision options by project type. Protocol-invoked only; may run in current context.
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called at corresponding step in `/archi.*` protocols.
- **Execution context**: Can execute inline in current context; when involving user questions must return to main dialogue.
- **Boundary**: Only assist generating options, interview questions or structured fragments, does not advance protocol steps independently.


# Architecture Decision Option Library

## Core Principles

- **Convention First**: When `tech_stack.md §9` has project convention, directly inherit, do not expand (unless function explicitly needs deviation, explain reason)
- **Clear then Recommend**: When context sufficient to judge, directly output recommendation line
- **Multiple Options then Ask**: When 2+ reasonable options and significantly affect implementation, then expand Q-table

## Execution Protocol

1. **Convention Check**: Read `tech_stack_s9`, if that feature has project convention → Directly inherit, mark source `Convention`, skip subsequent
2. **Extract Core Questions**: Only process feature type sections actually enabled in current project; types not appearing视为inapplicable
3. **Per-Question Decide**:
    - `spec_context` gives clear answer → Recommendation line `<feature> @ <core question>: <decision> (Source: Recommended) — Reason: <1-2 sentences>`
    - 2+ reasonable options and significantly affect implementation → Q-table, columns: `Option / Advantage / Risk / Applicable Scenario / Default Recommend ✓`
4. Return recommendation lines + Q-table to caller

## Core Question List

[[WHEN: data |
### `data` · Data Layer Design

- **Entity Relationships** — Flat | 1:N | M:N | Recursive | JSON/EAV | Virtual
- **Consistency** — ACID | Eventual consistency | Optimistic lock | Not needed
- **Access Pattern** — Read-heavy | Read-write balanced | Write-heavy | Real-time query
- **Security & Backup** — Static encryption | Transport encryption | Periodic backup | Sensitive data masking
]]

[[WHEN: cli |
### `cli` · Command Line Interaction Design

- **Input Reception** — Pure Args | Interactive Prompts | Hybrid | Config File | Stdin/Pipe
- **Output Presentation** — Silent | Progress/Spinner | Structured | Human-readable
- **Execution Mode** — One-shot | REPL | Watch/Daemon | Batch
- **Error Handling** — Exit Code Only | Stderr Message | Retry Logic | Interactive Recovery
]]

[[WHEN: lib |
### `lib` · Library API Design

- **Exposure Form** — Functions | Class/Instance | Builder/Fluent | Config Object | Plugin System
- **Consumer Integration** — Import & Call | Register & Use | Decorator | Global Registration
- **Public Boundary** — Full Public | Facade | Internal Heavy
- **Error Handling** — Throw on Error | Return Result Type | Error Callback | Event Emitter
- **Documentation Strategy** — JSDoc/TSDoc | README Quick Start | API Reference | Examples & Recipes
]]

[[WHEN: api |
### `api` · Interface Contract Design

- **Protocol Style** — RESTful | RPC-Style | GraphQL | gRPC | WebSocket
- **Client Integration** — Direct HTTP | SDK | CodeGen | Webhook
- **Version Evolution** — URL Versioning | Header Versioning | No Versioning | Deprecation Window
- **Security Auth** — API Key | JWT Token | OAuth 2.0 | mTLS
- **Rate Limiting** — Rate Limiting | Quota System | IP Whitelist | Request Signing
]]

[[WHEN: mobile |
### `mobile` · Mobile Navigation and Interaction

- **Navigation Structure** — Stack | Tab | Drawer | Hybrid
- **Interaction Mode** — List/Card | Form/Wizard | Gesture-Driven | Bottom Sheet
- **State Management** — Local State | Global Store | React Query/SWR | Offline-First
- **Offline Support** — Online Only | Cache for Offline | Full Offline Support | Background Sync
- **Performance Optimization** — Lazy Loading | Image Optimization | Code Splitting | Native Modules
]]

[[WHEN: miniapp |
### `miniapp` · Mini Program Architecture

- **Page Organization** — Single Page | Multi-Page | Tabbar | WebView Hybrid
- **Platform Auth** — Anonymous | Silent Auth | Phone Binding | Full Profile
- **Data Communication** — Request | WebSocket | EventBus | Storage Sync
- **Performance Optimization** — Lazy Load | Skeleton Screen | Preload Data | Reduce SetData
]]

[[WHEN: extension |
### `extension` · Browser Extension Architecture

- **Logic Deployment** — Background | Content Script | Popup | Full Architecture
- **Interaction Entry** — Browser Action | Context Menu | Content Injection | Side Panel | Keyboard Shortcut
- **Cross-Layer Communication** — Message Passing | Shared Storage | Native Messaging
- **Publishing Updates** — Manual Update | Auto Update | Chrome Web Store | Enterprise Policy
]]

[[WHEN: desktop |
### `desktop` · Desktop Application Architecture

- **Process Division** — Main-Centric | Renderer-Centric | Worker Thread | Multi-Process
- **Window Management** — Single Window | Multi Window | Tray/Menu Bar | Global Hotkey
- **System Integration** — Native Dialogs | File System Access | Hardware Integration | Auto Updater
- **Packaging Distribution** — Electron Builder | Tauri CLI | Code Signing | Auto-Update Server
]]

[[WHEN: ai |
### `ai` · LLM Integration and Agent Design

- **Provider Supply** — Direct API | Provider Abstraction | Local Model | Hybrid Cloud-Edge
- **Interaction Mode** — Chat | Command-Driven | Streaming | Autonomous Agent
- **Tool Extension** — No Tools | Function Calling | Code Execution | Multi-Agent | RAG
- **Context Management** — Full History | Sliding Window | Summarization | Session-Based
- **Cost Monitoring** — Token Budgeting | Usage Quota | Request Logging | Performance Metrics
]]

[[WHEN: ui |
### `ui` · Interface Interaction Design

- **Data Flow** — Standard Request | Optimistic UI | Realtime | Offline-First
- **Error Handling** — Fail Fast | Retry/Recovery | Fallback UI | Undo/Redo
- **Permission Control** — Public | Authenticated | Role-Based | Owner-Only
- **Accessibility** — Screen Reader | Keyboard Navigation | ARIA Attributes | Color Contrast
]]

## Output Format

```
### Architecture Options

**Recommendation Lines**:
- data @ Entity Relationships: 1:N (Source: Convention) — Reason: tech_stack §9 uses Prisma relations uniformly
- api @ Protocol Style: RESTful (Source: Recommended) — Reason: Resource modeling in spec naturally matches REST

**Q-table** (api @ Security Auth):

| Option | Advantage | Risk | Applicable Scenario | Default Recommend |
|:---|:---|:---|:---|:---|
| JWT Token | Stateless, easy integration | Hard to revoke | SPA / Mobile | ✓ |
| OAuth 2.0 | Standardized, supports third-party | Complex integration | Multi-party login | |
| API Key | Extremely simple | Key leak risk | Internal services | |
```

## Output Verification

- [ ] Each recommendation line has `<feature> @` prefix + Source mark + Reason
- [ ] Convention-sourced items have no Q-table (unless deviation reason written)
- [ ] Q-table's "Default Recommend" column has exactly one ✓
- [ ] All recommendation lines · Q-table `feature` values come from sections actually appearing in this skill body (not filtered out by WHEN)
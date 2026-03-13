---
name: archi-plan-options
description: Generate architecture decision options by project type. Use when planning and need guidance on technical choices.
---

# Architecture Decision Option Library

## System Flow Position

```
/archi.plan step_2 Part 2
    ↓
[This Skill] Extract core question list by project tag
    ↓
Per-question judgment: Direct recommendation or Expand Q-table
    ↓
Write into Task Proposal architecture recommendation table
```

> **Responsibility boundary**: Handles core question list per project type, candidate options, recommend vs. expand decisions; Not responsible for Q-table format (see `archi-interview-protocol`).

---

## Selection Logic (3 Steps)

**Step 1 · Convention Inheritance Check**
Read `02_tech_stack.md` §9. If project convention exists → inherit directly, do not expand (unless feature explicitly needs to deviate).

**Step 2 · Extract Core Questions**
Based on project tags, extract the list of core questions that must be answered for that type from the table below.

**Step 3 · Per-Question Judgment**
| Condition | Action |
|:---|:---|
| Answer is clear (sufficient context) | Recommend directly with 1-2 sentence rationale |
| 2+ viable options with significant implementation impact | Expand Q-table (format: see `archi-interview-protocol` Skill standard output format) |

---

## Core Questions by Project Type

### `data` Projects: Data Layer Design

**Entity Relationships** — Flat | 1:N | M:N | Recursive | JSON/EAV | Virtual
**Consistency** — ACID | Eventual Consistency | Optimistic Locking | None
**Access Patterns** — Read-Heavy | Balanced Read/Write | Write-Heavy | Real-time Query
**Security & Backup** — Encryption at Rest | Encryption in Transit | Backup & Recovery | PII Handling

---

### `cli` Projects: Command Line Interaction Design

**Input Reception** — Pure Args | Interactive Prompts | Hybrid | Config File | Stdin/Pipe
**Output Presentation** — Silent | Progress/Spinner | Structured | Human-readable
**Execution Mode** — One-shot | REPL | Watch/Daemon | Batch
**Error Handling** — Exit Code Only | Stderr Message | Retry Logic | Interactive Recovery

---

### `lib` Projects: Library API Design

**Exposure Pattern** — Functions | Class/Instance | Builder/Fluent | Config Object | Plugin System
**Consumer Access** — Import & Call | Register & Use | Decorator | Global Registration
**Public Boundary** — Full Public | Facade | Internal Heavy
**Error Handling** — Throw on Error | Return Result Type | Error Callback | Event Emitter
**Documentation Strategy** — JSDoc/TSDoc | README Quick Start | API Reference | Examples & Recipes

---

### `api` Projects: Interface Contract Design

**Protocol Style** — RESTful | RPC-Style | GraphQL | gRPC | WebSocket
**Client Access** — Direct HTTP | SDK | CodeGen | Webhook
**Version Evolution** — URL Versioning | Header Versioning | No Versioning | Deprecation Window
**Security & Auth** — API Key | JWT Token | OAuth 2.0 | mTLS
**Rate Limiting & Protection** — Rate Limiting | Quota System | IP Whitelist | Request Signing

---

### `mobile` Projects: Mobile Navigation & Interaction

**Navigation Structure** — Stack | Tab | Drawer | Hybrid
**Interaction Pattern** — List/Card | Form/Wizard | Gesture-Driven | Bottom Sheet
**State Management** — Local State | Global Store | React Query/SWR | Offline-First
**Offline Support** — Online Only | Cache for Offline | Full Offline Support | Background Sync
**Performance Optimization** — Lazy Loading | Image Optimization | Code Splitting | Native Modules

---

### `miniapp` Projects: Mini-Program Architecture

**Page Organization** — Single Page | Multi-Page | Tabbar | WebView Hybrid
**Platform Authorization** — Anonymous | Silent Auth | Phone Binding | Full Profile
**Data Communication** — Request | WebSocket | EventBus | Storage Sync
**Performance Optimization** — Lazy Load | Skeleton Screen | Preload Data | Reduce SetData

---

### `extension` Projects: Browser Extension Architecture

**Logic Deployment** — Background | Content Script | Popup | Full Architecture
**Interaction Entry** — Browser Action | Context Menu | Content Injection | Side Panel | Keyboard Shortcut
**Cross-Layer Communication** — Message Passing | Shared Storage | Native Messaging
**Distribution & Updates** — Manual Update | Auto Update | Chrome Web Store | Enterprise Policy

---

### `desktop` Projects: Desktop Application Architecture

**Process Division** — Main-Centric | Renderer-Centric | Worker Thread | Multi-Process
**Window Management** — Single Window | Multi Window | Tray/Menu Bar | Global Hotkey
**System Integration** — Native Dialogs | File System Access | Hardware Integration | Auto Updater
**Packaging & Distribution** — Electron Builder | Tauri CLI | Code Signing | Auto-Update Server

---

### `ai` Projects: LLM Integration & Agent Design

**Provider Supply** — Direct API | Provider Abstraction | Local Model | Hybrid Cloud-Edge
**Interaction Pattern** — Chat | Command-Driven | Streaming | Autonomous Agent
**Tools & Extensions** — No Tools | Function Calling | Code Execution | Multi-Agent | RAG
**Context Management** — Full History | Sliding Window | Summarization | Session-Based
**Cost Monitoring** — Token Budgeting | Usage Quota | Request Logging | Performance Metrics

---

### `ui` Projects: Interface Interaction Design (General Addition)

**Data Flow** — Standard Request | Optimistic UI | Realtime | Offline-First
**Error Handling** — Fail Fast | Retry/Recovery | Fallback UI | Undo/Redo
**Access Control** — Public | Authenticated | Role-Based | Owner-Only
**Internationalization** — i18n Support | RTL Layout | Accessibility | Screen Reader

---

## Output Format

**Recommendation Row**: `Project Type @ Core Question: Decision (Source: Convention/Recommendation) — Rationale: ...`

> **Intermediate artifact**: After producing recommendation row or Q-table, control returns to `/archi.plan` where the caller assembles output into the Task Proposal.

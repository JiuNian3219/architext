---
description: Project Execution Queue & Dependency Graph (DAG). Tracks status (Pending/WIP/Done) of all features and infrastructure tasks.
---

# Product Roadmap

> **Status:** [Planning]
> **Last Updated:** YYYY-MM-DD

---

## 🗺️ Master Plan (全局规划与依赖)

### 📊 Dependency Graph (Parallelism Analysis)
> **Legend (图例)**:
> * ✅ **Done**: 已上线。
> * 🚧 **WIP**: 正在开发中 (Current Focus)。
> * ⏳ **Pending**: 待办，依赖项已就绪，随时可做。
> * 🔒 **Blocked**: 阻塞中，需等待前置依赖完成。

<!-- 
[AI Instruction]: 
Generate a Mermaid DAG to visualize dependencies and parallel tracks.
Nodes: [ID] Name
Shape: Box for Pending, Rounded for Done.
-->
\`\`\`mermaid
graph TD
    %% Legend
    %% ✅ Done, 🚧 WIP, ⏳ Pending, 🔒 Blocked
    
    %% Examples
    INF-101[🏗️ INF-101: Init Repo] --> DAT-101[🗄️ DAT-101: User Schema]
    DAT-101 --> API-101[⚙️ API-101: Auth Service]
    INF-101 --> UI-101[🎨 UI-101: Shadcn Setup]
    UI-101 --> UI-102[🧩 UI-102: Login Form]
    API-101 --> INT-101[🔌 INT-101: Login Page Integration]
    UI-102 --> INT-101
\`\`\`

### Phase 1 [INF]: Infrastructure (基建)
*(AI: Plan Tech Stack, CI/CD, Test Setup here)*

### Phase 2 [CORE]: Core Features (核心功能)
*(AI: Plan Step 1 Features here)*

### Phase 3 [EXT]: Extensions (扩展与优化)
*(AI: Plan Scale & UX enhancements here)*

<!-- 示例格式:
- [ ] ⏳ **[INF-101] 数据库基建**
    - **Goal**: 搭建 Postgres + Prisma 环境，确保能连接并迁移。
    - **Dep**: None
- [ ] 🔒 **[FEAT-201] 订单流程**
    - **Goal**: 实现下单、支付、状态流转 (Full Stack)。
    - **Dep**: [INF-101]
-->

---

## 🤖 AI Maintenance Guide

**Trigger**: 每次执行 `/archi.plan` 或 `/archi.code` 后。

1.  **Dependency Visualization (Mermaid)**:
    *   **Sync**: 每次任务状态变更时，必须更新 `graph TD` 代码块。
    *   **Style**: Pending=`[ ]`, WIP=`style [ID] fill:#f9f,stroke:#333`, Done=`style [ID] fill:#9f9,stroke:#333`.
2.  **ID Prefix Enforcement**:
    *   `[INF]`: Infrastructure
    *   `[DAT]`: Data
    *   `[API]`: API
    *   `[UI]`: UI
    *   `[INT]`: Integration
    *   `[FEAT]`: Business Feature
3.  **Queue Logic**:
    *   **Unblock**: 当某任务依赖的所有 `Dep` 都标记为 ✅ 时，立即将其状态更新为 ⏳ **Pending**。

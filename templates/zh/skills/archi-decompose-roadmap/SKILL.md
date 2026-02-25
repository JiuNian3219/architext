---
name: archi-decompose-roadmap
description: Architext 任务分解专家。五步分解法：先标定项目类型校准基建清单，再双视角提取业务 Task 和 Infra 任务，NFR 横切关注点归并入 goal（不独立成任务），建立真实依赖链并输出并行批次。产出符合 Tier 1 Schema 的 roadmap.json 任务，作为 `/archi.plan` 的输入契约。用于任何需要生成或追加 Roadmap 任务的场景。
---

# Roadmap 任务分解

## 系统流程定位

```
Brief → [本 Skill] → roadmap.json 任务
                            ↓
                   /archi.plan <task-id>
                   读: vision.md + map.json + tech_stack.md
                   写: spec.md（行为规格/验收标准）
                       ui.md（任务 UI 范围声明）[?UI]
                       plan.json（可执行步骤 + 测试用例 checkbox）
                   也更新: map.json / dictionary.json / data_snapshot.json
                   视觉参考: [[__DOCS_DIR__]]/global/ui_context.md [?UI]
                            ↓
                   /archi.code → 读 spec.md + ui.md + plan.json → 写代码
```

> **Skill 的职责边界**：
> - 负责：任务的 what（描述）、done 标准（goal）、依赖链、设计决策注入、Core 接口契约
> - 不负责：文件路径（map.json 管）、变量命名（dictionary.json 管）、测试用例（plan.json 管）、UI 组件结构（ui.md 管）
>
> **Schema 约束（Tier 1 严格）**：roadmap.json 由 CLI 的 Zod Schema 校验，**禁增删字段**。

## 调用模式

| 模式 | 触发来源 | 输入 | 限制 |
|:---|:---|:---|:---|
| 从零建立 | `/archi.start` | Brief 功能列表 | 禁生成 EDIT 任务 |
| 增量追加 | `/archi.scope` | Brief + 已有 Roadmap 上下文 | 禁改已有任务，ID 沿用水位 |

---

## 分解框架（五步）

### Step 0 · 项目类型标定

从 Brief 的技术栈 / 项目描述中识别项目类型，确定标准基建清单，防止 Step 2 反推遗漏框架性 Infra。

| 项目类型 | 脚手架须包含（除通用构建工具链外） |
|:---|:---|
| Web SPA / PWA | 路由骨架（如 React Router）、全局 App Shell（布局 / Provider / 主题注入） |
| CLI 工具 | logger 模块、AppError 处理层、命令注册入口 |
| API 服务 | 路由层、中间件层、DB 连接层、全局错误处理 |
| 小程序 | 页面路由配置、全局 app.js/ts、请求封装层 |

**操作**：将标定结果注入 Step 2 的 INF-01 描述，确保脚手架任务覆盖对应清单。

---

### Step 1 · PM 视角 → 业务 Task

从 Brief 功能描述提取用户场景，聚合为业务 Task。

1. 逐条功能转化为场景句式：`用户可 [动作] → [可感知结果]`
2. 共享同一核心流程的场景 → 合并为一个业务 Task
3. 粒度校准（核心原则：**一任务 = 一次 `/archi.plan` 会话 = 一个 `tasks/<slug>/` 子目录**）：

    **行为视角（PM）**：

    | 信号 | 动作 |
    |:---|:---|
    | 描述含"和"（两个独立关注点） | 拆分 |
    | DoD 超过 4 条验收标准 | 拆分 |
    | 任务横跨 3 个以上独立 UI 区域或实现域 | 拆分 |
    | 一次 `/archi.plan` 难以在单一 spec.md 中完整描述行为 | 拆分 |
    | 两任务文件集合 >50% 重叠 | 合并 |
    | 一个任务完成后另一个才有意义 | 合并 |

    **实现视角（工程，与行为视角独立判断，任一触发即拆分）**：

    | 信号 | 动作 | 示例 |
    |:---|:---|:---|
    | 任务内含 ≥2 个**实现域**，且各域可独立单元测试 | 拆分 | 纯计算层 + UI 渲染层 → 各自独立 |
    | 实现时需同时掌握 ≥3 个相互独立的技术关注点 | 拆分 | 字符渲染 + 状态机 + 动效 API → 三件事 |
    | 某一关注点有独立的边界复杂度（如 IME、Canvas、第三方图表 API） | 独立出该关注点 | 输入捕获 + IME 单独成任务 |

    > **为什么要加工程视角**：行为视角描述"用户看到什么"，工程视角描述"AI 实现时需同时掌握什么"。一个任务行为上内聚（同一页面），但工程上横跨多个不同域时，AI 在 `/archi.code` 阶段会因上下文过宽而顾此失彼。

    **粒度上限（定量红线）**：

    > 一个 Roadmap Task = 能产出**一个内聚 spec.md + 一个可执行 plan.json** 的最小功能单元。

    | 指标 | 上限 | 超出时的动作 |
    |:---|:---|:---|
    | spec.md Scenario 数 | ≤ 6 个 | 回到 `/archi.scope` 拆分，当前任务过大 |
    | plan.json Phase 数 | ≤ 4 个 | 同上 |

    > 此红线在分解阶段作为预判依据；在 `/archi.plan` 执行中若预估超出，须暂停并提示用户返回 `/archi.scope` 重新拆分，禁强行塞进单一任务。

**DoD 格式**：`完成后，用户可 <可验证的用户行为>；边界：<明确不做的事>`

> DoD 是 `/archi.plan` 生成 spec.md 验收标准和 plan.json 测试用例的基准。须精准描述用户可感知结果，禁写实现细节（文件路径、函数名、测试命令由 plan 阶段决定）。

以下情况归属父任务，禁独立成条：**轻量**结果页 / 完成页、空状态页、确认弹窗。

> **豁免**：结果页含独立数据可视化组件（图表库）、复杂动效逻辑或独立业务计算时，**不适用**父任务归属规则，须独立成业务 Task。

---

### Step 2 · 架构师视角 → Infra 任务

从业务 Task 反推共享基础，禁预设基建。

对所有业务 Task 问：多个 Task 同时依赖 X 且 X 须在 Task 前存在 → X 是 Infra 任务。

| Infra 类型 | 判断标准 |
|:---|:---|
| 项目脚手架 / 全局 Schema / 类型定义 | 所有业务 Task 均依赖；须覆盖 Step 0 标定的项目类型清单 |
| 共享核心引擎（打字引擎、规则引擎等） | 满足以下**任一**条件：① 2 个以上业务 Task 直接调用；② 纯逻辑层、可独立单元测试、与 UI 完全解耦。`tag: Core` |
| 第三方集成层 | 多个业务 Task 复用同一外部服务 |

**Core 任务规划契约**：`tag: Core` 任务的 `description` 末尾须声明主要导出接口（函数签名或关键 interface 名称）。
下游 Task 的 `/archi.plan` 会话可直接对接该接口，无需读上游实现，保障跨任务规划的一致性与可预测性。

**Infra 任务粒度原则（与业务 Task 相反，倾向合并）**：

Infra 任务不直接承载业务逻辑，AI 在执行时上下文单一，不存在"实现域过宽"问题。过度拆分 Infra 只会增加依赖链复杂度，无益。

| 信号 | 动作 |
|:---|:---|
| 同属工程配置、同期执行、技术栈相关 | 合并（如脚手架 + CI + 路由骨架 → 一个 INF 任务） |
| 技术栈完全不同 且 执行时机明显不同 | 拆分（如 Dexie.js 存储层 vs Shadcn 主题配置） |
| 某 Infra 产出物被 ≥2 个业务 Task 直接调用（接口型） | 独立成任务（须声明导出接口契约） |

---

### Step 3 · NFR 过滤

以下类型**禁独立成任务**：注入首个实现该能力的任务 `goal` 末尾（`[NFR] <说明>`）；其余受影响任务仅在 NFR 清单中标注。`/archi.plan` 执行时会将 NFR 注入对应的 spec.md 约束章节。

| 类型 | 常见形式 | 注意 |
|:---|:---|:---|
| 国际化 | i18n、多语言、翻译文案 | — |
| 视觉主题（配置型） | 品牌色 Token、Tailwind 主题色、CSS 变量定义 | NFR，注入脚手架任务 |
| 视觉主题（功能型） | 深色/浅色切换按钮、OS 偏好检测、主题持久化 | **非 NFR**，须建立独立业务 Task（有用户可见行为） |
| 动效风格规范 | 页面切换方式、过渡时长约定 | NFR，注入首个含动效的 Task goal |
| 性能优化 | 懒加载、虚拟列表、缓存策略 | — |
| 可访问性 | A11y、键盘导航、屏幕阅读器 | — |

---

### Step 4 · 依赖与并行优化

- **真实依赖链**：禁所有业务 Task 统一只挂 `INF-01`，须反映真实业务关系。
- **最小依赖原则**：能并行的任务不加多余依赖，最大化 Batch 并行度。

---

## 任务规则

1. **ID 生成**：沿用已有 Roadmap 编号水位，从各前缀最大值 +1 起；全新项目从 `INF-01` / `FEAT-01` 起。

2. **Phase 归属**：

   | 任务类型 | Phase |
   |:---|:---|
   | 项目脚手架、Schema、全局类型 | Phase 1 (Infrastructure) |
   | 共享核心引擎（Step 2 识别） | Phase 1 (Infrastructure) |
   | 业务 Task | Phase 2 (Core Features) |
   | EDIT-xxx（修改已有功能） | 与被修改任务同 Phase |

3. **设计决策注入**：Brief 中已有设计决策 → 注入对应任务 `goal` 末尾：`[用户预设] <内容>`；同一条决策禁在多任务重复。`/archi.plan` 将其视为不可更改的硬约束，直接写入 spec.md，不再提问。

4. **EDIT 任务**：需修改已有功能 → 创建 `EDIT-xxx`（`tag: Edit`），goal 注明修改范围；仅增量追加模式下使用。

5. **Slug 命名**：`slug` 即 `tasks/<slug>/` 文件夹名，须清晰表达任务内容，格式为 `Pascal_Snake_Case`（如 `Typing_Engine_Core`）。每个任务对应唯一一个 task 子目录，禁重名。

---

## Task JSON Schema（Tier 1 严格，禁增删字段）

```json
{
  "id": "FEAT-01",
  "title": "Task Title In English",
  "status": "pending | blocked",
  "description": "<1-2 句说明这个任务要构建什么、覆盖哪些范围。Core 任务须在末尾声明主要导出接口>",
  "goal": "完成后，用户可 <可验证的用户行为>；边界：<明确不做的事>",
  "deps": ["INF-01"],
  "tag": "Infra | Core | Feature | Edit",
  "slug": "Task_Title_Snake_Case"
}
```

`deps` 为空或全部 `done` → `pending`；有未完成 deps → `blocked`

---

## 中间产物

> 此 Skill 为子程序：产出结构化数据后，控制权交还调用方。
> - `/archi.scope` → 调用方展示给用户确认，OK 后写入 `roadmap.json`
> - `/archi.start` → 调用方直接写入 `roadmap.json`

产出两部分数据：

**① 任务数据**（直接对应 `roadmap.json` 的 phases/tasks 结构）：

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

**② NFR 归并清单**（元数据，供调用方展示）：

- [NFR 名称] → 注入 [任务 ID] goal | 影响范围：[其他相关任务 ID]

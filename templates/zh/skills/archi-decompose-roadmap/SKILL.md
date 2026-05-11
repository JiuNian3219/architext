---
name: archi-decompose-roadmap
description: Decompose requirements into roadmap tasks. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只返回协议要求的结构化产物，后续写入、确认和签收由调用协议负责。


# Roadmap 任务分解

## 调用模式

- **从零建立**（`/archi.init` start）：Brief 功能列表 + ui_context → 生成完整 Roadmap。禁生成 EDIT 任务。
- **增量追加**（`/archi.plan` decompose）：Brief + 已有 Roadmap → 追加新任务。禁改已有任务，ID 沿用水位。

**Schema 约束（Tier 1）**：roadmap.json 由 CLI Zod 校验，只使用 schema 已允许字段（含可选 `sourceRef`）。

---

## 核心理念：最小可交付垂直切片

**一个 Task 完成后，启动项目能验证一条完整的功能路径。**

垂直切片 = 从数据层到用户触达层的端到端交付单元。每个 Task 包含该切片所需的全部代码（Schema / API / 状态管理 / 页面 / 路由），做完后不依赖后续 Task 就能独立验证。

**四条底线**：
1. **可运行**：Task 做完，启动项目能走通至少一条功能路径
2. **内聚**：共享组件/状态/模块的代码必须在同一 Task 内
3. **可控**：单个 Task 涉及 3-6 个新文件/模块，AI 能在一次会话内完成
4. **可验证**：Task 做完，有对应的自动化测试证明功能正确

---

## 工作量判断

在输出任何任务前，先判断需求是 `single-task` 还是 `multi-task`，并给出依据：
- 独立验收流程数：2 条以上用户/命令/API 流程 → `multi-task`
- 关注点数量：同时覆盖数据/API/UI/权限/同步/导入导出等 >2 类 → `multi-task`
- 预计文件/模块数：候选 Task 超过 6 个新文件/模块 → 继续拆分
- 实现可控性：无法在一次实现会话内完成 → 继续拆分

输出必须包含 `effortJudgment`：`conclusion`、`rationale`、`splitSignals`。不得为了让结果简短而把大需求压成一个 Task。

---

## 重构类任务粒度

适用信号：拆分已有文件、重组目录、模块边界调整、代码太集中、CSS 模块化、server 拆分。

这类需求仍进入 `/archi.plan` decompose，但它不是从零功能规划。decompose 只在 roadmap 上追加少量任务；具体怎么拆文件、建目录、迁移组件、改 import，属于后续 detail 的 `plan.json`。

拆分依据：
- 每个 roadmap task 必须有独立交付价值、独立验收方式或需要单独隔离的风险
- 小型结构整理倾向合并；不要因为涉及多个文件、目录或组件就机械拆分
- 前端、后端、样式、数据迁移等只有在验证风险、依赖顺序或发布边界明显不同的时候才拆开

禁止作为 roadmap task 输出：建立目录结构、提取常量、提取工具函数、拆分某个单独组件、迁移某个 CSS 文件。这些是实现步骤，属于后续 `/archi.plan <ID>` detail 的 plan.json。

输出前必须说明为什么这些是 roadmap 任务，而不是 detail plan.json 里的实现步骤。若只是“几个文件太集中，需要拆一下”，通常应给出很少的任务；若确实是大型重构，可以拆更多，但每一项都要通过独立交付/独立验收/风险隔离解释。

---

## 分解框架

### Step 0 · 项目类型 + 切片策略

根据项目最高层 feature 选择切片维度。多 feature 项目按优先级取最高层：**ui > cli > api > lib**。

| 项目 feature | 切片维度 | 原子单位 | 验收模板 |
|:---|:---|:---|:---|
| ui（Web/Mobile/Desktop/小程序） | 用户旅程子流程 | 一组耦合页面 + 对应 API + 共享状态 | 启动项目，在界面上走通一条完整路径 |
| cli | 命令组 | 一个命令的完整实现（解析+处理+输出+错误） | 终端执行命令得到正确输出 |
| api | 资源域 | 一个实体的完整端点集 + 中间件 + 校验 | 请求该资源所有端点均返回正确响应 |
| lib | 公共 API 面 | 一组相关的导出函数/类 + 类型 + 实现 | 导入并调用，类型和行为正确 |

**脚手架（INF-01）白名单——只允许包含以下内容**：

- **ui**：框架初始化 + 路由空壳 + App Shell + 全局布局
- **cli**：入口 + 命令注册框架 + logger + AppError
- **api**：路由层空壳 + 全局错误处理 + 中间件挂载点
- **lib**：双产物配置 + barrel index + 类型声明
- **通用（按需）**：包管理器 + monorepo 结构 / DB 连接池 + ORM 配置（不含 schema 和 migration 文件）/ Docker 开发环境 / Linter + Formatter

**INF-01 额外包含（按需）**：测试基础设施——测试框架配置（Vitest / Jest / Playwright config）+ 测试辅助工具（test utils、DB test container setup），确保后续 FEAT 可直接写测试。

**INF-01 禁止包含**：业务 Schema 和 migration / 认证鉴权 / 第三方 SDK / 渲染管线 / 业务中间件。这些一律归入首个使用它的 FEAT（详见 Step 3 INF 黑名单）。

---

### Step 1 · 识别功能域

从 Brief 按 Step 0 切片维度提取功能域（ui = 用户旅程分组；api = 实体端点集；cli = 命令组；lib = 导出集）。跨实体共享机制（认证、权限）= 独立功能域。

---

### Step 2 · 功能域 → Task（合并与拆分）

每个功能域先作为一个候选 Task，然后执行拆分和合并检查。

#### 拆分检查（Task 太大？）

当出现以下信号时拆分：涉及 >6 个新文件 | 包含多个独立可验证的子流程 | 需同时处理 >2 个不同关注点。

拆分方法：按**独立可交付的子流程**拆分，每个子 Task 做完后能独立验证且内部代码高度耦合。

拆分后的子任务通过 ID 前缀隐含分组关系（如 `FEAT-01-01`、`FEAT-01-02` 共享 `FEAT-01` 前缀），无需显式父任务记录。每条任务都是可执行的。

```
功能域：认证体系
├── FEAT-02-01: 登录流程（登录页 + auth store + 路由守卫 + navbar 状态 + 登录 API）
├── FEAT-02-02: 注册流程（注册页 + 注册 API + 注册后自动登录）
└── FEAT-02-03: 密码重置（重置页 + 发送/重置 API）
```

#### 合并检查（Task 太碎？）

当出现以下信号时合并：两个 Task 共享同一组件/状态 | 做完后产出物残缺 | 只涉及 1-2 个文件 | 拆开后一方会大幅重构另一方代码。

```
❌ FEAT-03-01: 新建文章（编辑器+新建API）
   FEAT-03-02: 编辑文章（改编辑器+编辑API）← 要改 03-01 的表单

✅ FEAT-03-01: 文章创建与编辑（编辑器 + 新建/编辑/保存 API + 表单 + 草稿状态）
```

#### 共享数据模型归属

多个 Task 涉及同一 Schema 时，由**首个写入者**创建基础字段（含其他 Task 读取所需的字段），后续 Task 只扩展字段，并在 goal 中注明「扩展 <Model> Schema：新增 <字段列表>」。首个写入者 = 依赖链中最早对该 Schema 执行写入操作的 Task。

#### 粒度验证清单

四条底线之外，每个 Task 额外检查：

- [ ] **不残缺**：不存在「做完后明显缺一块」？
- [ ] **不越界**：不会大幅改其他 Task 已产出的代码？
- [ ] **验证自洽**：验证方式引用的每个能力，在本 Task 或 deps 链中已实现？
- [ ] **边界无死角**：边界写「不做 X（B 的事）」，已确认 B 显式包含 X？

---

### Step 3 · INF / POLISH / PLATFORM

#### INF 任务

INF 四条件（全满足）：纯底层 + 无 UI + 物理阻塞 + 被 2+ FEAT 共用。只被 1 个 FEAT 用的融入该 FEAT。白名单见 Step 0 脚手架部分。

**INF 黑名单（归 FEAT，无论几个 Task 用）**：认证鉴权 / 第三方 SDK / 渲染管线 / 业务中间件 / Schema + migration。理由：脱离业务场景无法验收。禁止「全量 Schema」INF——业务表由 FEAT 按需创建（见 Step 2 共享数据模型归属）。

**INF 粒度判定（独立于 FEAT 规则）**：INF 不适用 Step 2 的拆分/合并检查。INF 按**可独立验证的基础设施层级**拆分。判定方法：将 INF 白名单内容按「是否有独立验证命令」分组——能用不同命令各自验证的内容属于不同层级，必须拆开后各自验证的内容属于同一层级。拆分条件：单个 INF 涉及 ≥2 个可独立验证的层级时必须拆分。同层级内容合并为一个 INF。拆分后 INF 之间通过 deps 保证叠加顺序。项目仅涉及单一层级时保持单个 INF-01。每个 INF 的 goal 必须包含该层级的具体验证命令。

#### POLISH / PLATFORM

POLISH：可独立度量的质量优化（Lighthouse、翻译、a11y、打包），放 phase-polish。

PLATFORM：CI/CD、日志、监控等运维能力，放 phase-platform，不参与 FEAT 依赖链。

#### NFR 注入

轻量 NFR → 双轨：① 首个相关 FEAT 的 goal 加 `[NFR] <说明>`；② 顶层 `nfr[]` 数组记录（taskId + constraint + impact）。首个任务 = deps 仅含 INF 且最早涉及该 NFR，同层取 ID 最小。

#### 测试注入

测试与功能同步交付，不允许「先写完再补测」。

- 每个 FEAT 的 goal 末尾追加 `[TEST]` 块，列出**具体测试场景**（不是「写测试」三个字）
- 涉及用户可感知路径的 FEAT 必须有至少一条 E2E
- INF-01 包含测试基础设施配置（框架 config + test utils）
- 测试场景必须写明输入 / 动作 / 期望结果，并覆盖正常路径 + 至少一种边界或错误路径
- 禁止只写“调用成功”“文件存在”“跑测试通过”“覆盖逻辑”等无法证明行为的描述

`[TEST]` 块格式：`[TEST] 单元：<场景> | 组件：<场景>（ui 类） | E2E：<验证路径>`

#### Seed Data 策略

- 数据密集型项目（博客、CMS、电商）：首个创建 Schema 的 FEAT 同时包含 seed 脚本
- 数据简单项目：各 FEAT 在测试 setup 中自建数据
- goal 中须注明验证的数据前提（如「验证前提：需要 N 篇不同状态的文章」）

#### 设计规格注入（ui 项目）

- **INF-01** 包含设计 Token 体系（CSS 变量 / Tailwind config），goal 中列出 Token 值
- **首个 ui FEAT** 注入 `[DESIGN]` 全局视觉约束（动效、圆角、阴影、断点）
- 后续 FEAT 仅在涉及特殊视觉处理时追加 `[DESIGN]`

---

### Step 4 · 依赖链

**顺序开发原则**：假设单人顺序开发，不主动并行。

依赖判定规则：

- B 的代码调用 A 的模块 → B deps A
- B 的数据实体由 A 创建 → B deps A
- B 和 A 操作不同数据实体、代码不交叉 → 无依赖（默认仍顺序排列）
- 同功能域的子 Task → 通常有依赖，按子流程顺序排列

**内容型项目的浏览-创作依赖**：浏览类 Task 的验证需要内容数据存在。两种处理：① 浏览 Task deps 创作 Task（推荐，反映真实业务流）；② 验证方式改用 seed data（手动插 DB），但须在 goal 中注明「验证前提：需手动插入测试数据」。禁止验证方式引用本 Task 及 deps 链中不存在的能力。

**禁止**所有业务 Task 只挂 INF-01，必须反映真实业务关系。

**依赖链示意**（抽象形态，实际 ID 按项目命名）：

```
INF-01 → INF-02（若 INF 按层级拆分） → FEAT-A → FEAT-B
INF-01 → INF-03
INF-02 + INF-03 → FEAT-C → FEAT-D
FEAT-B + FEAT-C → FEAT-E
```

---

### Step 5 · 输出组装

#### 顶层结构

扁平 `tasks` 数组 + `nfr` 数组，执行顺序由 deps 拓扑排序推导。

#### Task 字段

必填：`id`（`INF-xx`/`FEAT-xx`/`FEAT-xx-01`/`POLISH-xx`/`PLATFORM-xx`/`EDIT-xx`）、`phase`（`infra`/`core`/`polish`/`platform`）、`title`、`status`（生成时 `pending`）、`description`（≤50字，不重复 goal）、`goal`（格式见下）、`deps`（ID 数组）、`tag`（业务标签）、`slug`（`Pascal_Snake_Case` → `tasks/<slug>/`）。

可选：`sourceRef`（需求快照锚点，例 `global/requirements/REQ-20260512-001.md#FEAT-01`）、`screens`（ui 专用，屏幕 ID 数组）。

#### Requirement Snapshot

同时输出一份快照草稿：`User Intent` / `Confirmed Decisions` / `Boundaries` / `Task Mapping`。调用方在用户 OK 后写入 `global/requirements/REQ-YYYYMMDD-NNN.md`，并把每个新增 task 的 `sourceRef` 指向对应 `### <ID>`。

#### goal 格式

```
完成后，<验收句式（按项目类型）>。
涉及：<逻辑单元名称，禁写文件路径。示例：登录页 + auth store + 路由守卫 + POST /auth/login>
实现提示：<关键技术选型和实现要点，帮助执行 AI 少走弯路。示例：OAuth flow 用成熟库；session 存 DB；邮箱唯一约束需处理 OAuth 先注册的冲突>
验证方式：<具体步骤式验证，不是结果描述。示例：访问 /dashboard → 被重定向到 /login → OAuth 登录 → 跳回 /dashboard → navbar 显示用户名>
边界：<明确不做的事，且标注由哪个 Task 负责。示例：不含注册流程（FEAT-02-02）、不含密码重置（FEAT-02-03）>

[TEST]
- 单元：<具体测试场景>
- E2E：<具体验证路径>
```

验收句式按项目类型：ui = `用户可 [动作] → [可感知结果]`；cli = `用户可 [运行命令] → [终端输出]`；api = `客户端可 [HTTP METHOD /path] → [响应结构]`；lib = `调用方可 [调用 API] → [返回结果]`。INF/POLISH/PLATFORM 的 goal 同样需要「验证方式」和「边界」。

Brief 已有设计决策 → 注入 goal：`[用户预设] <内容>`，同一决策禁多 Task 重复。

#### Task JSON 示例

```
{
  "id": "FEAT-02-01",
  "phase": "core",
  "title": "登录流程",
  "status": "pending",
  "description": "OAuth 登录 + session + 路由守卫 + navbar 状态",
  "goal": "完成后，用户可在登录页通过 OAuth 登录 → navbar 显示登录态，未登录访问受保护页面被重定向。涉及：登录页 + auth store + 路由守卫 + navbar 用户状态区 + 登录 API + User/Session Schema（首个写入者）。实现提示：OAuth flow 用成熟库处理；session 存 DB；admin 角色通过环境变量白名单判断。验证方式：访问受保护页被重定向至登录 → OAuth 登录成功跳回 → navbar 显示用户名 → 注销后再访问又被重定向。边界：不含注册（FEAT-02-02）、不含密码重置（FEAT-02-03）。[TEST] 单元：session 校验（有效/无效/过期）+ admin 白名单判断。E2E：未登录 → 重定向 → 登录 → 跳回 → 注销 → session 失效。",
  "deps": ["INF-01"],
  "screens": ["S-03"],
  "tag": "Auth",
  "slug": "Auth_Login_Flow"
}
```

---

## 输出验证

- [ ] 已输出 `effortJudgment`，说明 single-task / multi-task 判断和拆分依据
- [ ] 重构类需求未按文件/组件/目录/步骤机械拆分；已说明每个 roadmap task 的独立交付、独立验收或风险隔离依据
- [ ] `roadmap.json` 含有效 `tasks[]` 扁平数组 + `nfr[]`
- [ ] 每个 Task 通过四条底线 + 粒度验证清单
- [ ] 每个 FEAT 的 goal 含：验证方式 + 边界（标注 Task ID）+ 实现提示 + `[TEST]`（具体场景）
- [ ] INF 仅含白名单内容；无「全量 Schema」INF
- [ ] 依赖链反映真实业务关系（非全挂 INF-01）
- [ ] 子任务 ID 前缀一致（FEAT-01-01、FEAT-01-02）
- [ ] ui 项目：INF-01 含 Token + 测试基础设施；首个 ui FEAT 含 `[DESIGN]`
- [ ] 数据密集型：首个 Schema FEAT 含 seed

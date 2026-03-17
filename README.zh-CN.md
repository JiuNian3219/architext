<div align="center">

**简体中文** · [English](https://github.com/JiuNian3219/architext/blob/main/README.md)

# <img src="templates/icon.svg" width="40" height="40" align="top" /> Architext

**AI 原生架构协议 · 先想清楚，再让 AI 实现**

[![npm version](https://img.shields.io/npm/v/architext?color=blue&label=npm)](https://www.npmjs.com/package/architext)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

**支持的 IDE：** Cursor *(推荐)* · Windsurf · Trae · VS Code · Claude Code · OpenCode

</div>

> **🚧 项目早期公告**
>
> Architext 目前处于早期阶段。核心工作流（init → start → plan → code）已基本跑通，但仍有不少细节有待打磨。如果你在使用中遇到任何问题，欢迎[提交 Issue](../../issues) —— 我会尽快跟进修复。你的每一条反馈都会直接推动项目成长，感谢你愿意在早期就参与进来。

---

## 这是什么？

Architext 是一套**文档驱动 AI 开发 (DDAD)** 协议，将你的 AI 编程助手从"随意的代码生成器"升级为"严谨的世界级架构师"。

在写下任何一行代码之前，Architext 强制你和 AI 就以下问题达成一致：**要构建什么**、**为什么要做**、**具体怎么实现** —— 通过跨会话持久存储的结构化文档来确保这一点。

> **无文档，不代码。** 代码只是文档的下游产物。

Architext 面向**中小型应用**，为 **1 人团队** 或 **1 人 + AI 助手** 的协作模式设计。无论你用的是对话式 AI 还是未来的「贾维斯式」持续助手，文档驱动的工作流都能让 AI 有稳定的上下文、清晰的执行边界，而你始终掌握决策权。

Architext 以两个层次协同运作：

| 层次 | 触发方式 | 职责 |
|:---|:---|:---|
| **CLI 工具层** | `npx archi <命令>` | 将规则文件、Prompt、Skills 部署到项目中 |
| **AI 命令层** | 在 AI 编辑器中输入 `/archi.<命令>` | 生成文档、规划功能、编写代码、审查修复 |

CLI 层负责一次性部署框架，AI 命令层在这些文件的基础上驱动所有开发工作。

---

## 为什么选择 Architext？

|  | AI 全权代理模式<br>*(Trae Solo / Bolt / v0)* | **Architext** |
|:---|:---|:---|
| **核心假设** | AI 知道用户要什么 | 用户知道自己要什么，但还没想清楚 |
| **AI 的角色** | 全权代理人 | 产品顾问 + 严格执行者 |
| **你的角色** | 验收者（做完了才知道是什么） | 决策者（动手前就看清全貌） |
| **信息流向** | AI → 用户（"你看这行不行"） | 用户 → AI（"我要的是这个"） |
| **决策权** | AI 隐式决定功能逻辑 | 用户显式定义，AI 严格执行 |

> 其他工具让 AI 替你做决定，Architext 帮你自己做决定。

---

## 快速开始

**第一步 · CLI：部署框架**

```bash
npm install -g architext
npx archi init
```

```
✔ 选择语言      › 简体中文
✔ 选择 IDE      › Cursor   (多选 — Cursor / Windsurf / Trae / VS Code / Claude Code / OpenCode)
✔ 选择项目类型  › Web SPA / PWA
✔ 是否生成 project-brief.md？ › 是（生成后填写项目需求，供 /archi.start 或 /archi.inherit 使用）

● 正在部署 Architext...
✔ 文档已部署       → .architext/
      prompts/  global/  templates/  tasks/
✔ 规则文件已部署   → .cursor/rules/           (Cursor: .mdc)
      00_system · 90_custom_rules
✔ 命令文件已部署   → .cursor/commands/         (仅 Cursor)
      archi.start · archi.scope · archi.plan · archi.code · archi.audit · ...
✔ Skills 已部署    → .cursor/skills/           (Cursor)
      archi-decompose-roadmap · archi-interview-protocol · archi-plan-options · archi-ui-wireframe
✔ project-brief.md 已生成 → 项目根目录

◆ 完成！填写 project-brief.md，然后在 AI 编辑器中运行 /archi.start。
```

**第二步 · AI 对话：初始化项目**

选择生成时，`archi init` 会在项目根目录生成 `project-brief.md`。填写完毕后，在 AI 编辑器中运行：

```
/archi.start project-brief.md
```

AI 读取 Brief，就关键决策向你提问，生成项目的基础文档（`vision.md`、`roadmap.json`、`tech_stack` 等）。

> **已有代码？** 跳过 `/archi.start`，改用 `/archi.inherit` —— 逆向分析项目，将已有功能注册为 `LEG-xx` 任务，同时生成 `map.json`。可选：代码库尚空时传 `project-brief.md` 补充愿景与路线图。

---

## 工作流示例

项目全生命周期的主干路径，全部在 AI 对话框中完成。

```
project-brief.md → /archi.start → [?UI] /archi.ui → /archi.plan → /archi.code → /archi.audit
                                                              ↑
              /archi.scope  anytime you have NEW feature requirements
              （不限「start 之后」——项目进行中、发布后均可）
```

**第一阶段 · 初始化**

```
你:   /archi.start project-brief.md

AI:   [正在分析项目 Brief...]
      [就技术栈、架构风格、项目类型向你提问...]

      ✔ 新增:    .architext/global/vision.md
      ✔ 新增:    .architext/global/roadmap.json
      ✔ 新增:    .architext/global/dictionary.json
      ✔ 新增:    .architext/global/error_codes.json
      ✔ 新增:    .architext/global/env_registry.json
      ✔ 新增:    .architext/global/tech_stack.md
      ✔ 新增:    .architext/global/ui_context.md       (仅 UI 类项目)
      ✔ 填充:    .cursor/rules/90_custom_rules.mdc  (写入团队编码规范)

      下一步：运行 /archi.ui 生成 UI 概念设计 → 然后 /archi.plan <首个任务ID>
             Brief 之外还有需求 → /archi.scope 先追加任务
```

> **已有代码？** 改用 `/archi.inherit` —— 逆向分析项目，将已有功能注册为 `LEG-xx` 任务，并额外生成 `map.json`。

**第二阶段 · 需求分解（可选，随时可跑）**

> `/archi.scope` **不是**「start 的下一步」。只要你有**除初始 Brief 之外的新功能需求**，随时可运行——start 后、项目进行中、所有任务完成后均可。

```
你:   /archi.scope scope-brief.md          ← 提供文件；或直接 /archi.scope 触发访谈

AI:   [正在读取 vision.md, roadmap.json, map.json, tech_stack...]
      [扫描现有任务，评估影响范围...]

      已分解为 3 个任务：
      ✔ 更新: .architext/global/roadmap.json
        新增任务 FEAT-001 · auth-login        (状态: pending)
        新增任务 FEAT-002 · auth-session      (状态: pending, 依赖: FEAT-001)
        新增任务 FEAT-003 · user-profile      (状态: pending, 依赖: FEAT-001)
```

**第三阶段 · 深度规划**

```
你:   /archi.plan FEAT-001

AI:   [正在读取 vision.md, tech_stack.md, map.json, 依赖任务 spec...]
      [就功能逻辑、数据流、边界条件向你提问...]

      Q1. 认证方式？[A] JWT  [B] Session Cookie  [C] OAuth  [推荐: A]
      Q2. 会话是否需要跨设备同步？[Y/N]
      Q3. ...

你:   A | N | ...

AI:         ✔ 新增:    .architext/tasks/FEAT-001_auth-login/spec.md
      ✔ 新增:    .architext/tasks/FEAT-001_auth-login/plan.json
      ✔ 新增:    .architext/tasks/FEAT-001_auth-login/ui.md          (仅 UI 类项目)
      ✔ 更新:    .architext/global/roadmap.json    (FEAT-001: pending → active)
      ✔ 更新:    .architext/global/map.json
      ✔ 更新:    .architext/global/dictionary.json
```

代码动工前，审阅生成的规格文档：
- `spec.md` — 功能逻辑、Gherkin 验收标准、接口契约
- `plan.json` — 实施阶段、文件级任务拆解、决策记录
- `ui.md` — 交互说明，对照 `ui_context.md` 中的屏幕定义（仅 UI 类项目）

确认"这就是我要的"之后，再进入实现阶段。

**第四阶段 · 实现**

```
你:   /archi.code FEAT-001

AI:   [正在读取 spec.md, plan.json, tech_stack.md...]
      [状态门控：FEAT-001 状态为 active ✔]
      [运行静默审计循环：依赖 / 技术红线 / 架构边界...]

      正在实现 阶段 A：核心认证逻辑
      ✔ 新增:    src/features/auth/auth.service.ts
      ✔ 新增:    src/features/auth/auth.controller.ts
      ✔ 更新:    src/app.module.ts
      ✔ 更新:    .architext/tasks/FEAT-001_auth-login/plan.json  (阶段 A → 完成)
```

**第五阶段 · 代码审查（可选，强烈建议）**

```
你:   /archi.audit FEAT-001       ← 带 ID: 审查该任务实现；不带 ID: 做项目级全面体检

AI:   [正在读取 代码 + spec + plan + vision + tech_stack...]

      ✔ 新增: .architext/tasks/FEAT-001_auth-login/audit.md

      发现 2 个问题：
      [中] /auth/login 缺少速率限制 → 建议运行 /archi.fix
      [低] Token 过期时间未通过环境变量配置 → 建议运行 /archi.edit
```

> **命令之间的日常开发**由自然语言 **Chat Mode** 驱动。用自然语言描述需求（如「加个登录功能」「修一下认证的 bug」），AI 会自动识别意图并加载对应协议（scope/plan/code/edit/fix）执行，**无需手动输入 `/archi.*` 斜杠命令**。提问、琐碎修改、调试则直接回答。2 个规则文件作为始终在线的基底规则：`00_system`、`90_custom_rules`，AI 不会因会话切换而"失忆"。

---

## 教程

不同场景，同一套协议。按你的情况选择对应路径。

### 教程 A：新项目，Brief 已覆盖全部需求

`project-brief.md` 已列出所有功能，无需 scope。

```
/archi.start project-brief.md  →  [?UI] /archi.ui  →  /archi.plan FEAT-001  →  /archi.code FEAT-001  →  ...
```

Start 产出 roadmap 后，UI 项目运行 `/archi.ui` 生成屏幕原型，再 plan 首个任务，然后 code。

---

### 教程 B：新项目，Brief 不完整

start 跑完后发现漏了功能，或想追加更多。

```
/archi.start project-brief.md  →  [?UI] /archi.ui  →  /archi.scope scope-brief.md  →  /archi.plan FEAT-001  →  ...
```

Scope 向 `roadmap.json` 追加任务，UI 项目运行 `/archi.ui`，再按 plan → code 继续。

---

### 教程 C：项目进行中追加功能

FEAT-001 已做完，想加 FEAT-002、FEAT-003 等。

```
...  →  /archi.scope scope-brief.md  →  /archi.plan FEAT-002  →  /archi.code FEAT-002  →  ...
```

**Scope 随时可跑**——不限「start 之后」。只要有超出当前 roadmap 的新需求，就运行 scope。

---

### 教程 D：已有代码库

已有仓库，想纳入 Architext 管理。

```
npx archi init  →  /archi.inherit [project-brief.md]  →  /archi.edit LEG-xx 补全 Stub  →  /archi.code LEG-xx
```

Inherit 逆向分析项目，将已有功能注册为 `LEG-xx` 任务。用 edit 补全 Stub spec，再按需 code。

---

### 教程 E：Bug 修复

```
/archi.fix FEAT-001 "密码含特殊字符时登录失败"
```

Fix 诊断根因，向 plan 追加 Bugfix Phase，并修复代码。

---

### 何时用 /archi.scope（速查）

| 时机 | 操作 |
|:---|:---|
| start 后，Brief 未覆盖全部 | scope |
| 项目进行中，想到新功能 | scope |
| 所有任务 done，要加新模块 | scope |
| Brief 已覆盖全部 | 跳过 scope，直接 plan |

---

## 命令速查

### AI 对话命令

可通过输入 `/archi.<命令>` 或直接用自然语言描述意图触发——Chat Mode 会自动加载并执行对应协议。

| 命令 | 说明 |
|:---|:---|
| `/archi.start [brief]` | 读取需求 Brief，生成项目基础文档（vision / roadmap / tech_stack 等） |
| `/archi.inherit [brief]` | 逆向分析已有代码库；可选传 project-brief.md 补充愿景/路线图（骨架仓库） |
| `/archi.scope [file_path]` | 将额外需求拆解为 Roadmap 任务；无文件则自动发起访谈 |
| `/archi.plan <ID> [context]` | 深度架构访谈 → 生成 spec / plan（[?UI] 附 ui.md）；可附加已知上下文减少提问 |
| `/archi.code <ID>` | 按 plan 分阶段实现代码；仅 `active` 任务可进入 |
| `/archi.edit <ID> [context]` | 修改功能规格 → 追加新开发 Phase；不覆盖历史记录 |
| `/archi.revise [context]` | 全局架构/技术栈变更 → 输出影响评估 → 用户确认后级联更新 |
| `/archi.ui` | 生成或增量更新多文件 UI 概念设计（`screens/` 目录）；仅 UI 类项目 |
| `/archi.audit [ID]` | 深度代码审查，输出审计报告；带 ID 审查单任务，不带 ID 做项目级体检 |
| `/archi.fix [ID] <context>` | 诊断根因并修复 Bug；ID 可选，context 描述问题现象 |
| `/archi.map` | 对比 map.json 与实际目录树，同步架构地图 |
| `/archi.remove <ID>` | 全链路下线功能：删除代码 + 文档，清理 roadmap / map 引用 |
| `/archi.help [question]` | 无参数：推荐下一步行动；有问题：定位相关文件回答 |

### 终端命令

| 命令 | 用途 |
|:---|:---|
| `npx archi init` | 部署框架文件（规则、Prompt、Skills） |
| `npx archi update` | 将已部署文件更新至最新版本 |
| `npx archi doctor` | 检查项目健康状态 |
| `npx archi render` | 将 JSON 数据生成可读 Markdown 视图 |
| `npx archi task [--check]` | 查看/校验 Roadmap 任务状态 |
| `npx archi plan <id>` | 检查指定功能的 plan 完成度 |
| `npx archi pack [-o file]` | 打包用户数据为 XML 备份文件 |
| `npx archi template <name>` | 获取模板文件到项目根目录 |
| `npx archi uninstall` | 从项目中移除 Architext 文件 |

---

## 核心哲学

**① 文档驱动 (DDAD)**

代码是文档的下游产物。每次变更都从修改文档开始——先有规格，再有代码。每一个决策都可追溯，每一个 AI 输出都可预期。

**② 用户主权**

AI 的职责是挖掘和澄清你的真实意图，而非替代你做判断。在开发开始之前，你就能看到完整的功能逻辑、数据流和交互模型。所有关键决策的最终决定权在你手中。

**③ 元框架**

Architext 不强制规定架构。它通过 AI 无法绕过的规则和边界，严格执行**你所选择的**任意架构（MFA、FSD、DDD、整洁架构等）。

---

## 关于愿景

AI 开发的演进速度，比我们任何人预想的都要快。新模型、新工具、新范式——几乎每隔几个月，整个行业就会重新洗牌一次。

Architext 是我在这个方向上的一次探索：尝试为"如何与 AI 协作开发软件"这件事提供一些结构。它并不是一个宣称找到了终极答案的框架，只是我认为行得通的一个方向——核心信念是：动手之前想清楚，无论 AI 变得多强大，都会带来更好的结果。

如果它对你有用，那很好。如果你有更好的想法，我真的很想听。

---

## 常见问题

**这和 Cursor Agent 模式有什么区别？**

Agent 模式适合单次会话。Architext 提供跨会话、跨成员、跨 AI 工具的持久上下文。你的规格文档存在仓库里，关闭对话窗口也不会消失。

---

**我的已有项目能用吗？**

可以。先运行 `npx archi init` 部署框架，再运行 `/archi.inherit`，Architext 会分析你的现有代码并填充文档骨架（非覆盖既有内容）。已有功能以 `LEG-xx` 形式注册为存根规格，渐进式接入，无需推倒重来。

> **注意**：`/archi.inherit` 目前处于早期阶段，对大型或复杂仓库的分析结果可能不够完整，需要手动补充。欢迎提交 Issue 反馈遇到的问题。

---

**支持哪些 IDE？**

目前支持 4 个 IDE，在 `archi init` 交互式选择中手动勾选，支持多选，可同时为多个 IDE 部署：

| IDE | 规则目录 | 扩展名 | 状态 |
|:---|:---|:---|:---|
| Cursor | `.cursor/rules/` | `.mdc` | 推荐 — 测试最完善 |
| Windsurf | `.windsurf/rules/` | `.md` | 支持 |
| Trae | `.trae/rules/` | `.md` | 支持 |
| VS Code | `.github/instructions/` | `.instructions.md` | 支持 |
| Claude Code | `.claude/rules/` | `.md` | 支持 |
| OpenCode | `.opencode/rules/` | `.md` | 支持 |

后续计划扩展更多编辑器支持。

---

**支持哪些项目类型？**

不绑定特定项目类型。CLI 工具、Web 应用、小程序、API、后端服务均适用。模板在初始化时会根据项目类型自动适配。

---

**必须用全部命令吗？**

不必。可以只从 `/archi.plan` + `/archi.code` 开始，随着熟悉程度逐步引入其他命令。整个系统按照渐进式接入的方式设计。

---

**Token 消耗大吗？**

是的，相比普通对话，Architext 的每条命令都会加载多个上下文文件并执行深度分析，**Token 消耗明显高于直接提问**。这是文档驱动开发的固有成本——换来的是更可预期的输出和更少的反复。

---

<div align="center">

**[贡献指南](https://github.com/JiuNian3219/architext/blob/main/CONTRIBUTING.md) · [更新日志](https://github.com/JiuNian3219/architext/blob/main/CHANGELOG.md) · [Issues](https://github.com/JiuNian3219/architext/issues)**

> 这就是 Architext：一套让 AI 真正像资深架构师一样工作的元框架协议。

</div>

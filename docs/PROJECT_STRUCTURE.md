# Architext 项目目录结构

> 生成日期: 2026-04-17
> 语言版本: 中文说明（templates 中 en/zh 双语对称）

---

## 一、项目根目录

| 文件/目录 | 作用 |
|:---|:---|
| `README.md` | 英文版项目说明文档 |
| `README.zh-CN.md` | 中文版项目说明文档 |
| `CHANGELOG.md` | 版本变更日志 |
| `CONTRIBUTING.md` | 贡献指南 |
| `LICENSE` | MIT 开源许可证 |
| `package.json` | NPM 包配置文件 |
| `package-lock.json` | NPM 锁文件 |
| `pnpm-lock.yaml` | PNPM 锁文件 |
| `tsconfig.json` | TypeScript 编译配置 |
| `tsup.config.ts` | tsup 构建配置 |
| `vitest.config.ts` | Vitest 测试配置 |
| `eslint.config.js` | ESLint 配置 |
| `.prettierrc` | Prettier 格式化配置 |
| `.prettierignore` | Prettier 忽略文件 |
| `.gitignore` | Git 忽略文件 |
| `.gitattributes` | Git 属性配置 |
| `commitlint.config.js` | Git 提交信息规范配置 |
| `architext.json` | 项目元数据（项目类型、功能标签等） |
| `docs/` | 项目文档目录 |
| `src/` | CLI 工具源代码 |
| `templates/` | 架构协议模板（核心资产） |
| `website/` | 项目官网（独立子项目） |

---

## 二、src 目录（CLI 工具源代码）

> 简要说明，不深入展开

| 目录/文件 | 作用 |
|:---|:---|
| `src/index.ts` | CLI 主入口，注册所有命令（init/update/doctor/task/plan/render 等） |
| `src/commands/` | 各命令实现 |
| `src/commands/meta/init/` | `archi init` 初始化命令 |
| `src/commands/meta/update/` | `archi update` 同步规则命令 |
| `src/commands/meta/doctor/` | `archi doctor` 环境自检命令 |
| `src/commands/meta/task/` | `archi task` 任务管理命令 |
| `src/commands/meta/plan/` | `archi plan` 计划检查命令 |
| `src/commands/meta/render/` | `archi render` JSON→Markdown 渲染命令 |
| `src/commands/meta/template/` | `archi template` 获取模板命令 |
| `src/commands/meta/pack/` | `archi pack` 打包备份命令 |
| `src/commands/meta/uninstall/` | `archi uninstall` 移除框架命令 |
| `src/commands/meta/help/` | `archi help` 参考手册命令 |
| `src/commands/meta/notify/` | `archi notify` 桌面通知命令 |
| `src/core/` | 核心逻辑（配置、错误处理、模板、脚手架、Schema 等） |
| `src/types/` | TypeScript 类型定义 |
| `src/utils/` | 工具函数（日志、国际化等） |
| `src/locales/` | 多语言文件（zh.json / en.json） |
| `src/__tests__/` | 测试文件 |

---

## 三、templates 目录（架构协议模板）

> **核心资产**：用户运行 `npx archi init` 时，这些文件会被部署到用户项目的 `.architext/` 和 IDE 配置目录中。

### 3.1 目录总览

```
templates/
├── icon.svg                    # Architext 图标
├── en/                         # 英文版模板
│   ├── briefs/                 # 项目简报模板
│   ├── docs/                   # 核心文档模板
│   │   ├── global/             # 全局数据资产
│   │   ├── prompts/            # /archi.* 协议文件
│   │   ├── shared/             # 共享片段
│   │   └── templates/          # 文档模板
│   ├── rules/                  # AI 规则文件
│   └── skills/                 # AI 技能文件
└── zh/                         # 中文版模板（结构与 en 对称）
```

---

### 3.2 briefs/（项目简报模板）

| 文件 | 作用 |
|:---|:---|
| `_base.md` | 项目简报主模板，用户填写后运行 `/archi.start` 初始化项目。包含：项目概述、功能需求、业务流程、技术栈、工程标准、设计资产、范围约束等 |
| `_modules.md` | 模块补充模板，用于分解大型简报 |

---

### 3.3 docs/global/（全局数据资产）

> 这些 JSON 文件是项目的"单一真理源"，`.md` 视图由 `npx archi render` 生成，禁止直接编辑。

| 文件 | 作用 |
|:---|:---|
| `roadmap.json` | **任务进度 DAG**：定义所有任务（ID/标题/状态/依赖/阶段/目标）。状态包括 pending/active/done/blocked |
| `vision.md` | **项目宪法**：愿景、北极星指标、目标用户、设计哲学、产品原则、边界约束 |
| `tech_stack.md` | **技术栈法律**：技术选型、编码规范、命名规则、目录结构、测试套件、部署流程、Anti-Patterns |
| `map.json` | **架构地图**：目录↔模块映射、逻辑拓扑、用户旅程、影响关联关系 |
| `dictionary.json` | **术语表**：统一实体命名、禁用同义词、动词规范、工具注册、组件注册 |
| `error_codes.json` | **错误码契约**：ERR_MODULE_REASON 格式的错误定义，含 message 和 recovery |
| `error_memory.json` | **错误记忆库**：关键词签名→历史解决方案，用于防循环错误 |
| `env_registry.json` | **环境变量注册表**：每个环境变量的 required/example/描述 |
| `design_tokens.json` | **[仅UI项目]** 设计令牌：色板、语义色、字体、圆角、间距、动效、图标风格 |
| `data_snapshot.json` | **[仅Data项目]** 数据模型快照：models（名称/字段/类型/约束）+ relationships |
| `api_snapshot.json` | **[仅API项目]** API端点快照：endpoints（路由/方法/参数/owner） |
| `command_api.json` | **[仅CLI项目]** CLI命令注册表：命令/参数/描述/owner |
| `public_api.json` | **[仅Lib项目]** 库导出注册表：exports 的完整 TS 签名/稳定性标记 |

#### docs/global/references/

| 文件 | 作用 |
|:---|:---|
| `cli_reference.md` | `npx archi` 命令语法参考（task/plan/render）、Working Directory Gate |

---

### 3.4 docs/prompts/（协议文件）

> 每个 `/archi.*` 命令对应的协议文件，定义执行步骤和质量标准。

| 文件 | 触发命令 | 作用 |
|:---|:---|:---|
| `start.md` | `/archi.start` | **战略初始化**：从项目简报建立项目宪法（Vision/Tech/Roadmap） |
| `inherit.md` | `/archi.inherit` | **遗产纳管**：将现有代码库纳入管理，逆向生成文档 |
| `scope.md` | `/archi.scope` | **范围追加**：将新需求分解并追加到 Roadmap |
| `plan.md` | `/archi.plan` | **任务规划**：通过架构访谈定义任务 Spec/UI/Plan |
| `code.md` | `/archi.code` | **代码实现**：按 plan.json 任务列表完成开发 |
| `edit.md` | `/archi.edit` | **需求变更**：修改已完成任务的需求/行为/逻辑 |
| `fix.md` | `/archi.fix` | **故障修复**：诊断→修复流程 |
| `audit.md` | `/archi.audit` | **质量审计**：独立审查产出 |
| `remove.md` | `/archi.remove` | **功能下线**：移除已完成的功能 |
| `revise.md` | `/archi.revise` | **全局修订**：修改影响多个任务或全局设定的内容 |
| `map.md` | `/archi.map` | **架构地图同步**：更新 map.json |
| `ref.md` | `/archi.ref` | **参考资料管理**：管理外部参考资料 |
| `recover.md` | `/archi.recover` | **数据恢复**：从备份恢复数据 |
| `ui.md` | `/archi.ui` | **UI概念设计**：生成多文件 UI 概念设计（screens/ 目录） |
| `script.md` | `/archi.script` | **脚本生成**：生成自动化脚本（validate/dev-up/dev-reset） |
| `help.md` | `/archi.help` | **帮助指引**：下一步做什么 |

---

### 3.5 docs/shared/（共享片段）

| 文件 | 作用 |
|:---|:---|
| `verify-result-handling.md` | 审查结果处理流程（CRITICAL/WARNING/INFO 分级处理） |
| `ui-redlines.md` | UI设计红线（Anti-patterns）：禁止紫色渐变、禁止 emoji 作图标、禁止硬编码等 |
| `ui-context-format.md` | UI上下文格式规范（屏幕索引结构） |

---

### 3.6 docs/templates/（文档模板）

| 文件 | 作用 |
|:---|:---|
| `spec.template.md` | 任务规格模板：Overview/Acceptance Criteria/Data Requirements/Interface Exports/Constraints |
| `ui.template.md` | UI范围模板：屏幕范围、组件树、状态定义 |
| `design.template.md` | 设计文档模板：核心机制、参数表、不变量、失败模式 |
| `plan.template.json` | 实施计划模板：Phase/Task 拆解、decisions、tests |
| `scope-brief.template.md` | 范围简报模板：追加需求时使用 |

---

### 3.7 rules/（AI 规则文件）

> 部署到用户项目的 `.cursor/rules/` 或 `.claude/rules/` 目录。

| 文件 | 作用 |
|:---|:---|
| `00_system.md` | **系统导航器**：Architext 唯一的 always-on 规则。包含：身份定义、优先级链、核心约束、语义理解流程、文件索引、错误记忆机制 |
| `90_custom_rules.md` | **自定义规则**：用户可覆盖的规则，如团队约定、业务约束、Anti-Patterns |

---

### 3.8 skills/（AI 技能文件）

> 部署到用户项目的 `.cursor/skills/` 或 `.claude/skills/` 目录。

| 目录 | Skill 名称 | 作用 |
|:---|:---|:---|
| `archi-decompose-roadmap/` | 需求分解 | 将项目需求分解为 Roadmap 任务链 |
| `archi-interview-protocol/` | 访谈协议 | 通过结构化访谈填补信息缺口（选择题优先） |
| `archi-plan-options/` | 规划选项 | 按项目类型生成架构决策选项 |
| `archi-design-patterns/` | 设计模式 | 应用结构化设计模式生成技术方案 |
| `archi-silent-audit/` | 静默审查 | 轻量级代码和文档审查（嵌入协议 Verify 阶段） |
| `archi-data-sync/` | 数据同步 | 同步数据治理文件（dictionary/error_codes/env_registry 等） |
| `archi-feature-relations/` | 功能关联 | 管理 map.json 中的 featureRelations 关联 |
| `archi-ui-wireframe/` | UI线框图 | 生成 UI 概念设计和线框图（screens/ 目录） |

每个 Skill 目录下包含 `SKILL.md` 文件，定义技能的触发条件、执行协议和输出格式。

---

## 四、website 目录

> 独立子项目，不递归展开。包含 Architext 官网代码。

---

## 五、排除目录

以下目录不纳入本文档：
- `.architext/` — 用户项目数据（本 CLI 工具生成）
- `.github/` — GitHub 配置（CI/Actions）
- `.cursor/` — Cursor IDE 配置
- `.claude/` — Claude Code 配置
- `.husky/` — Git Hooks
- `coverage/` — 测试覆盖率报告
- `dist/` — 构建产物
- `node_modules/` — 依赖包
- `scripts/` — 脚本文件

---

## 六、模板双语对照

`templates/en/` 和 `templates/zh/` 结构完全对称，文件一一对应：

| en 路径 | zh 路径 |
|:---|:---|
| `en/briefs/_base.md` | `zh/briefs/_base.md` |
| `en/docs/global/roadmap.json` | `zh/docs/global/roadmap.json` |
| `en/docs/prompts/start.md` | `zh/docs/prompts/start.md` |
| `en/rules/00_system.md` | `zh/rules/00_system.md` |
| `en/skills/archi-silent-audit/SKILL.md` | `zh/skills/archi-silent-audit/SKILL.md` |
| ... | ... |

---

## 七、核心工作流

```
用户填写 project-brief.md
        ↓
/archi.start → 生成 vision.md, roadmap.json, tech_stack.md, map.json 等
        ↓
/archi.plan INF-01 → 生成 tasks/INF-01_xxx/spec.md, plan.json, ui.md
        ↓
/archi.code INF-01 → 按 plan.json 实现代码
        ↓
/archi.audit INF-01 → 独立审查
        ↓
/archi.task INF-01 --status done → 标记完成
```

---

*文档结束*

# Project Brief: [项目名称]

> 尽量填写，不确定的留空即可。完成后运行 `/archi.start project-brief.md`，AI 会通过选择题补全缺失信息。

---

## 项目概述

**项目名称**: 
**一句话描述**: [项目是什么、为谁服务、解决什么问题]
**问题陈述**: [目标用户遇到的核心痛点？现有方案哪里不足？]

**目标用户**:
- **核心用户**: [角色/群体]
- **关键特征**: [技术水平、使用场景、行为习惯]

**成功指标**: [怎样算做成了？例：DAU 1000 / 被 100+ 项目采用 / P99 < 200ms]

---

## 核心任务

> MVP 必须实现的任务（建议 3-7 个），每项一句话描述预期行为。
> 详细 Spec 在 `/archi.plan` 阶段定义，此处只需明确"做什么"。

1. 
2. 
3. 

---

## 已有设计决策

> 如果你对某些任务/页面/流程已有明确想法，在此描述。AI 在后续 plan 阶段会以此为准，不会推翻。
> 没有的话留空即可。
>
> 写法参考：
> - **[任务/页面名]**: 描述具体行为、流程、约束
> - 可附截图/草图链接

---

## 技术栈

> 已确定的直接填写。不确定的留空或写"推荐"，AI 会基于项目特征推荐。

**项目特征**: [[__PROJECT_TYPE__]]
<!-- archi init 自动填入（逗号分隔的特征标签）；手动填写时从 ui/data/api/cli/lib/mobile/desktop/miniapp/extension/realtime/ai 中选择 -->
**语言/运行时**: [例：TypeScript + Node.js 22]
**核心框架**: [例：Next.js 15 / Fastify / Tauri]
**包管理器**: [例：pnpm / npm / yarn / cargo]
**构建工具**: [例：Vite / tsup / Webpack / esbuild / cargo / go build]
**Linter / Formatter**: [例：ESLint + Prettier / Biome / ruff / clippy + rustfmt]
<!-- @slot:tech -->
**部署目标**: [例：Vercel / Docker / npm publish / 二进制分发]
**关键第三方库**: [例：Zod, TanStack Query, Lucia Auth]

**技术红线** (禁用的技术/方案):
- [例：不用 jQuery；不用 CSS-in-JS]

---

## 工程规范

> 团队已有的工程约定。不确定的留空，AI 会基于技术栈推荐合理默认值。

**仓库形态**: [Monorepo (Turborepo/Nx/pnpm workspaces) / 单体仓库]
**架构模式**: [例：MFA / FSD / Clean Architecture / 分层架构 / 无偏好（AI 推荐）]
**目录结构**: [已有明确结构 → 简述关键目录 / 无（AI 基于架构模式生成）]
**分支策略**: [例：Trunk-based / Git Flow / GitHub Flow]
**Commit 规范**: [例：Conventional Commits (feat/fix/chore) / 自定义 → 简述]
**测试偏好**: [例：Vitest / Jest / pytest / 无特殊要求]

---

## 已有资源与上下文

> AI 需要知道哪些东西已经存在——避免重复造轮子或做出冲突决策。

**项目起点**: [全新项目 / 基于已有代码库（简述现状和技术债）]
**设计资产**: [Figma 链接 / 设计稿截图 / 无（AI 自行设计）]
**品牌规范**: [已有 Logo/配色/字体 → 描述或附链接 / 无]
**已有 API/后端**: [接口文档链接 / 简述可用端点 / 无（需从零搭建）]
**第三方服务**: [已确定使用的服务，例：Auth0, Stripe, AWS S3, Resend...]
**现有数据**: [已有数据库/数据源？格式？需要迁移？/ 无]

---

<!-- @slot:style -->

## 边界与约束

**明确不做的事** (反目标):
- [例：本期不做国际化 / 不做移动端适配 / 不做付费功能]

**硬性约束**:
- **时间**: [例：4 周 MVP / 无硬性 deadline]
- **兼容性**: [例：Chrome 90+ / Node 18+ / iOS 15+]
- **性能**: [例：首屏 < 2s / API P99 < 500ms / 无特殊要求]
- **合规/无障碍**: [例：WCAG 2.1 AA / GDPR / 无]

---

## 参考与灵感

| 参考项目 | 参考维度 |
|:---|:---|
| [例：Linear] | [交互体验、任务管理逻辑] |
| | |

---

## 补充说明

> 任何上述未涵盖的信息：背景故事、特殊需求、已有决策的原因、团队技术偏好等。


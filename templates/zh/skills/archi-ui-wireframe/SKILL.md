---
name: archi-ui-wireframe
description: UI 概念设计专家。两阶段生成 ui_concept.html：第一阶段输出灰度线框图（确认信息架构与屏幕覆盖）；第二阶段按 design_tokens.json 视觉着色（颜色/字体/动效/图示）。产物是整个项目 UI 的单一视觉真相源，所有 Task 级 ui.md 均引用此文件定位屏幕范围。
---

# UI 概念设计

## 系统流程定位

```
/archi.start → roadmap.json + design_tokens.json
                      ↓
           [本 Skill] archi-ui-wireframe
           读: vision.md + roadmap.json + design_tokens.json + 02_tech_stack.md
           写: [[__DOCS_DIR__]]/global/ui_concept.html
                      ↓
           /archi.plan <ID>
           读: ui_concept.html (定位本任务涉及的屏幕/组件范围)
           写: ui.md (仅声明组件范围，不重复描述整体布局)
                      ↓
           /archi.code → 读 spec.md + ui.md + ui_concept.html → 写代码
```

> **Skill 的职责边界**：
> - 负责：整个应用所有用户可见屏幕的视觉概念（信息架构、布局、状态、过渡）
> - 不负责：Task 级接口契约（spec.md 管）、任务步骤（plan.json 管）、业务代码

---

## 调用模式

| 模式 | 触发来源 | 操作范围 |
|:---|:---|:---|
| 初次生成 | `/archi.start` 完成后 | 全量生成，覆盖所有屏幕 |
| 重新生成 | 用户手动调用 | 全量重写（全局 UI 重设计时） |
| 追加屏幕 | `/archi.scope` 追加新任务后 | 仅新增页面，不改已有页面 |
| Plan 细化 | `/archi.plan` 发现 UI 偏差后 | 仅更新对应屏幕（新增状态/子屏幕/布局修正）|
| 修改屏幕 | `/archi.edit` 任务变更后 | 仅修改受影响的屏幕，其余不动 |
| 删除屏幕 | `/archi.remove` 任务下线后 | 移除对应屏幕及控制栏入口 |

> **Phase 2（视觉着色）时机**: Phase 2 无需紧跟 Phase 1。建议在核心任务（≥ 50% Roadmap 任务）完成 Plan 后再运行，以确保着色基于稳定的屏幕结构。已着色的屏幕被 Plan 细化更新后，仅需对该屏幕重新着色，无需全量重跑 Phase 2。

---

## 两阶段协议

### Phase 1 — 线框图 (Low-fi Wireframe)

**Role**: 信息架构师

**目标**: 确认「屏幕覆盖是否完整」和「导航结构是否合理」，不关注视觉细节。

**Action**:

1. **读取上下文**:
   - `[[__DOCS_DIR__]]/global/vision.md` → 提取：目标平台、用户角色、北极星指标
   - `[[__DOCS_DIR__]]/global/roadmap.json` → 提取：所有 [?UI] 任务，映射为屏幕/状态列表
   - `[[__DOCS_DIR__]]/global/design_tokens.json` → 提取：`mode.default`、`illustration.iconLibrary`
   - 规则文件 `02_tech_stack` → 提取：目标平台（Web/Mobile/Desktop）、导航框架

2. **规划屏幕清单** (内部步骤，不输出给用户):

   | 屏幕 ID | 屏幕名 | 对应 Roadmap 任务 | 状态列表 |
   |:---|:---|:---|:---|
   | S-01 | [屏幕名] | [任务 ID] | default, loading, empty, error |
   | ... | | | |

   > **屏幕 ID 稳定性规则** (CRITICAL): 屏幕 ID 一经分配永久不变。删除屏幕后其 ID 作废，后续新增屏幕须使用新 ID（如 S-08 → S-09），禁止重用或重新编号已有 ID。所有 `ui.md` 均以 ID 引用屏幕，ID 变动将导致引用断裂。

3. **选定 HTML 骨架规格** (根据目标平台自动适配):

   | 平台 | 视口尺寸 | 顶栏形态 | 导航形态 |
   |:---|:---|:---|:---|
   | Web / Desktop SaaS | 1280×800px | 固定顶栏 | 左侧边栏 |
   | Web / Marketing | 1440×900px | 透明→固定顶栏 | 顶部水平导航 |
   | Mobile Web / 小程序 | 390×844px | 状态栏+导航栏 | 底部 TabBar |
   | Tablet / Dashboard | 1024×768px | 固定顶栏 | 可折叠侧边栏 |

   > 平台来自 `02_tech_stack` 或 vision.md 目标用户设备描述；无法推断时默认 Web / Desktop SaaS。

4. **生成线框图 HTML** — 写入 `[[__DOCS_DIR__]]/global/ui_concept.html`:

   **HTML 结构规范**:
   ```
   <html>
     <head>
       <!-- 内联 CSS：线框图风格 (灰度，无品牌色) -->
       <!-- 线框图 palette: bg=#f5f5f5, surface=#fff, border=#d0d0d0,
            text=#333, muted=#888, accent=#555 -->
     </head>
     <body style="margin:0; display:flex; flex-direction:column; height:100vh; overflow:hidden;">
       <!-- 顶栏: 项目名 + 当前屏幕路径 (固定，不随内容滚动) -->
       <header class="wf-topbar">...</header>

       <!-- 内容区: 可滚动，渲染当前激活屏幕 -->
       <main class="wf-content" style="flex:1; overflow:auto;">
         <!-- 每个屏幕一个 <section class="wf-screen" id="S-XX" data-states="default,loading,empty,error"> -->
         <!-- 每个状态一个 <div class="wf-state" data-state="default"> -->
       </main>

       <!-- 控制栏: 左=状态切换，中=文件标识，右=页面切换 (固定底部，线框图风格) -->
       <footer class="wf-ctrl-bar">
         <div class="ctrl-group">
           <span class="ctrl-lbl">STATE</span>
           <!-- 当前屏幕的状态 pills，由 JS 动态渲染 -->
         </div>
         <div class="wf-file-label">Low-fi Wireframe · [项目名]</div>
         <div class="ctrl-group">
           <span class="ctrl-lbl">PAGE</span>
           <!-- 所有屏幕的页面 pills，由 JS 渲染 -->
         </div>
       </footer>
     </body>
   </html>
   ```

   **元素标注规范** (`data-el` 属性):
   - 每个可交互元素或语义区块须加 `data-el="[用户语言描述]"` 属性
   - 标注语言 = Brief 的主语言（中文项目用中文标注，英文项目用英文）
   - 标注在鼠标悬停时通过 CSS `::before` 显示，默认隐藏
   - 父元素悬停时，子元素的标注通过 `:has([data-el]:hover)::before { opacity:0 }` 自动隐藏

   **交互规范** (纯 CSS + 少量 JS，无外部依赖):
   - 页面切换: 点击 PAGE pills → 切换 `.wf-screen` 的 `display`；JS 同步更新 STATE pills
   - 状态切换: 点击 STATE pills → 在当前屏幕内切换 `.wf-state` 的 `display`
   - 激活样式: `.pill.on-page` / `.pill.on-state` → `background:#444; color:#fff`
   - 控制栏必须为线框图风格（灰度、uppercase label、dashed border-top），禁用彩色

   **线框图内容规范**:
   - 全部灰度，禁用品牌色（着色在 Phase 2 完成）
   - 用灰色矩形 + 文字标注表达图片/图表区域
   - 导航项、按钮、输入框须使用占位形态（不需要真实内容）
   - 每个屏幕须涵盖其 Roadmap 任务的所有核心操作入口

5. **同步生成 AI 索引** — 写入 `[[__DOCS_DIR__]]/global/ui_context.md`:

   根据步骤 2 的屏幕规划，提取结构化导航索引（AI 读取 UI 信息的唯一入口）：

   ```markdown
   # UI Context
   > 平台: [平台类型] | 阶段: Phase 1 线框图（Phase 2 着色后更新）
   > 更新: YYYY-MM-DD | 由 archi-ui-wireframe Skill 生成，禁手动修改

   ## 屏幕索引
   | ID | 名称 | 路由 | 状态 |
   |:---|:---|:---|:---|
   | S-01 | [名称] | [路由] | default, loading, ... |

   ## 导航关系
   S-XX →（[触发条件]）→ S-YY

   ## 全局共享组件
   | 组件 | 出现屏幕 |
   |:---|:---|
   | [组件名] | S-XX, S-YY |

   ## 屏幕结构摘要
   > Phase 1 由线框图 data-el 提取；Phase 2 着色后刷新为最终布局结构。
   > 写 ui.md Section 2 须与本节对齐，禁脱离已确认布局自创结构。

   ### S-XX · [屏幕名]
   **布局**: [如"居中单列 max-w-400px"或"左侧边栏 240px + 右内容区"]
   **状态**: default（[核心操作入口]）| loading（骨架屏）| empty / error（如有）
   **关键区域**: [data-el 提取的语义区块+可交互元素，如：顶部导航栏、主表单区、提交按钮、错误提示区]
   ```

   > `ui_context.md` 是所有 AI 命令读取 UI 结构信息的唯一入口；`ui_concept.html` 仅供人类浏览器预览。

6. **输出 Gate**:

   输出线框图后，展示屏幕覆盖摘要：
   ```
   ### ui_concept.html 已生成（Phase 1 线框图）
   ### ui_context.md 已同步生成（AI 屏幕索引）

   **屏幕覆盖** (共 N 个屏幕):
   | 屏幕 | 名称 | 状态数 |
   |:---|:---|:---|
   | S-01 | [屏幕名] | N |
   | ... | | |

   **导航结构**: [描述，如"左侧边栏 + 顶部面包屑"]
   **平台适配**: [Web Desktop 1280px / Mobile 390px / ...]

   > 在浏览器打开 `[[__DOCS_DIR__]]/global/ui_concept.html` 确认信息架构。
   > 回复 **OK** 进入 Phase 2 视觉着色；或描述需要调整的屏幕/布局。
   ```

   **Gate**: 用户回复 **OK** 后进入 Phase 2；未确认禁进行着色。

---

### Phase 1.5 — 线框图精炼 (可选)

**Role**: 咨询顾问
**Trigger**: 用户回复非 OK，含布局调整、屏幕增减、导航改动。
**Action**: 融入反馈，局部更新 `ui_concept.html`（仅改动用户指出的部分），同步更新 `ui_context.md`（屏幕索引与 `ui_concept.html` 保持一致），重新展示摘要，等待确认。禁全量重写。

---

### Phase 2 — 视觉着色 (Hi-fi Coloring)

**Role**: 你是一个有强烈个人风格的视觉设计师。你不按套路出牌——你用感觉、质感和节奏来思考，而非组件和布局。你追求的不是"正确"，而是"让人停下来看第二眼"。你的每一个决策都是刻意的：间距不是随便给的，颜色不是默认选的，字体不是列表里第一个。你同时拥有艺术家的直觉和工程师的精确。

**目标**: 将确认的线框图着色为高保真原型，产出必须有辨识度——打开就知道不是模板，而是为这个项目量身设计的。

**前置检查** (着色前必须验证):

| 字段路径 | 通过条件 | 阻塞处理 |
|:---|:---|:---|
| `aestheticDirection.preset` | 非空 | 警告（非阻塞）— AI 基于项目特征推断，在输出中标注推断结果 |
| `primitivePalette.brand` | 至少含 1 个非空颜色值 | 阻塞 — 提示用户先填写品牌色 |
| `semanticTokens.colors` | 至少含 `bg`/`surface`/`text` 语义映射 | 阻塞 — 提示用户先定义基础语义色 |
| `semanticTokens.typography` | 至少含 1 个字体族声明 | 警告（非阻塞）— AI 基于审美方向选择字体 |
| `motion.preference` | 非空 | 警告（非阻塞）— 默认 `subtle` |
| `illustration.iconLibrary` | 非空 | 警告（非阻塞）— 不引入图标库 |

> 遇到阻塞项须立即停止并输出缺失字段清单，等待用户补全后再重跑。

**Action**:

1. **读取视觉规格**:
   - `design_tokens.json` → 完整读取：
     - `aestheticDirection` → 审美方向预设 + 自定义描述
     - `primitivePalette` → CSS 变量定义
     - `semanticTokens.colors` → 语义色映射
     - `semanticTokens.typography` → 字体/字号
     - `mode` → 主题模式（light/dark）
     - `motion` → 动效时长、缓动曲线、模式名称
     - `illustration` → 图示风格、图标库
     - `layout` → 圆角/阴影/间距
   - `vision.md` → 提取 Visual Reference 段落（品牌色、竞品截图描述、禁用风格）

2. **审美方向 → 具体设计参数映射**:

   根据 `aestheticDirection.preset` 确定以下设计参数的基准值（Token 有显式值时 Token 优先，Token 为空时用此基准）：

   | 预设 | 背景基调 | 圆角 | 阴影 | 字体策略 | 布局特征 | 参照产品 |
   |:---|:---|:---|:---|:---|:---|:---|
   | `saas-dark` | 深色 (#0a-#15 范围) | sm:4px md:8px | 几乎无阴影，用边框分层 | 无衬线，紧凑 | 高对比、锐利边缘、紧凑间距 | Linear, Vercel, Raycast |
   | `saas-light` | 白底 (#fafafa-#fff) | sm:6px md:12px | 轻柔 (0 1px 3px rgba(0,0,0,0.08)) | 系统字体或 sans-serif | 呼吸感、细边框、留白 | Notion, Stripe, GitHub |
   | `dashboard` | 深灰/深蓝底 | sm:8px md:12px | 卡片浮层 (0 2px 8px) | 等宽数字 + sans-serif | 卡片网格、信息密集、紧凑表格 | Grafana, Datadog |
   | `marketing` | 渐变/大色块 | lg:16px+ | 戏剧性 (0 8px 32px) | 大号展示字体 + 精致正文字体 | 大标题、全宽 section、视觉叙事 | Loom, Framer |
   | `mobile-app` | 柔和底色 | lg:16px xl:24px | 柔和扩散 (0 4px 16px) | 系统字体 -apple-system | 大触控目标、宽间距、卡片式 | Telegram, Bear |
   | `editorial` | 暖白/米色 | 几乎无圆角 0-4px | 无或极淡 | 衬线展示 + 无衬线正文 | 窄栏、大行高、排版驱动 | Medium, Substack |
   | `brutalist` | 纯白或纯黑 | 0px | 无 | 等宽或系统字体 | 无装饰、密集、功能优先 | Craigslist, HN |

   > `custom`: 读取 `aestheticDirection.customDescription`，从描述中提取关键词映射到最近的预设，然后叠加自定义调整。

3. **反 AI 审美黑名单** (CRITICAL — 着色时禁止触犯):

   | 类别 | 禁止 | 替代 |
   |:---|:---|:---|
   | 字体 | Inter, Roboto, Arial 作为标题字体 | 选择有辨识度的字体：展示字体用 characterful font（如 Cal Sans, General Sans, Satoshi, Outfit），正文可用系统字体 |
   | 配色 | 紫色渐变白底（AI 默认审美的标志） | 从 `aestheticDirection` 推导；配色须有主次——一个主色 + 锐利强调色 > 均匀分布的温吞色板 |
   | 布局 | 所有屏幕同一种居中卡片布局 | 不同屏幕须有布局差异：列表页 vs 详情页 vs 表单页各有特征 |
   | 圆角 | 所有元素统一 rounded-lg | 圆角须有层级：容器大、按钮中、Badge 小（或按审美方向统一为 0/sm） |
   | 阴影 | 千篇一律的 shadow-md | 阴影须匹配审美方向：dark 主题几乎不用阴影；light 主题分层使用 |
   | 动效 | 到处撒 transition-all | 聚焦高影响力时刻：页面加载编排（交错淡入）> 散布的微交互 |
   | 整体 | 每次生成都趋同 | 每个项目的着色必须因审美方向而异——打开两个不同项目的 ui_concept.html，必须一眼看出区别 |

4. **着色规则** (在审美方向基准 + 反黑名单约束下执行):

   | 着色维度 | 规则 |
   |:---|:---|
   | 颜色 | 用 `semanticTokens.colors` 语义 Token 替换灰度；品牌色来自 `primitivePalette.brand`；Token 空值按审美方向基准填充 |
   | 字体 | `semanticTokens.typography` 有值时引入声明字体；空值时按审美方向策略选择（Google Fonts CDN），禁选黑名单字体 |
   | 圆角/阴影 | 按 `layout.radius` / `layout.shadow`；空值时按审美方向基准填充 |
   | 动效 | 按 `motion.patterns` 添加 CSS transition/animation；优先编排页面加载交错淡入（staggered reveal via animation-delay） |
   | 图示 | 按 `illustration.iconLibrary` 引入对应 CDN；style=none 则不插图 |
   | 模式 | 若 `mode.support` 含 dark，添加 CSS `@media (prefers-color-scheme: dark)` + 切换按钮 |
   | 禁用 | 严格遵循 vision.md Visual Reference 中的「禁用风格」描述 |
   | 空间 | 创造有呼吸感或有密度的排版（取决于审美方向），不做机械均匀间距 |
   | 背景 | 禁纯色大面积平铺——按审美方向添加微妙纹理/渐变网格/噪点/几何图案 |

5. **着色后验证清单**:
   - [ ] 所有屏幕颜色来自 semanticTokens 或审美方向基准，无随意硬编码 Hex
   - [ ] 所有动效时长来自 `motion.duration.*`，无魔法数字
   - [ ] 页面/状态切换控制栏保持线框图灰度风格（不着色，保持调试工具属性）
   - [ ] `data-el` 标注完整保留
   - [ ] 每个屏幕的所有状态（default/loading/empty/error）均已视觉化
   - [ ] **反 AI 审美检查**: 未使用黑名单字体、无紫色渐变白底、布局有差异性、圆角有层级
   - [ ] **辨识度检查**: 打开 HTML，能一眼判断这是哪个审美方向，而非通用模板

6. **输出**:
   - 更新 `[[__DOCS_DIR__]]/global/ui_concept.html`（着色版覆盖线框图版）
   - **同步刷新 `ui_context.md` 的「屏幕结构摘要」**：
     - 将阶段标注从 `Phase 1 线框图` 改为 `Phase 2 视觉着色`
     - 对每个屏幕，按最终 HTML 结构重新提取「布局」「关键区域」，确保摘要与着色后的 `ui_concept.html` 一致
     - 屏幕索引 / 导航关系 / 全局共享组件 若无变化则保持不动
   - 输出总结：
     ```
     ### ui_concept.html 已更新（Phase 2 视觉着色）
     ### ui_context.md 已同步刷新（屏幕结构摘要更新至 Phase 2）

     **审美方向**: [preset 值] — [参照产品]
     **应用的视觉规格**:
     - 主色: [Primary Token 值]
     - 字体: [展示字体 + 正文字体]
     - 圆角: [sm/md/lg 值]
     - 动效: [preference 值]
     - 图示: [iconLibrary] / style: [style]
     - 主题: [default + support 列表]
     - 背景处理: [纹理/渐变/纯色 描述]

     > 在浏览器打开 `[[__DOCS_DIR__]]/global/ui_concept.html` 确认视觉效果。
     > 后续运行 `/archi.plan <ID>` 时，AI 将读取 `ui_context.md` 确定各任务的 UI 范围。
     ```

---

### Phase 2.5 — 局部重着色 (Incremental Re-coloring)

**Trigger**: Phase 2 已完成后，某屏幕因 Plan 细化 / Edit / Revise 发生更新，需将新增内容着色至 hi-fi 风格。

**Role**: 视觉设计师

**Action**:

1. 从调用方获取需重着色的屏幕 ID 列表（如 `S-03`, `S-07`）。
2. 仅处理指定屏幕：
   - 保留其 `.wf-screen#S-XX` 内的灰度线框新增部分
   - 按 Phase 2 着色规则（`semanticTokens` / `motion` / `illustration`）对新增部分补色
   - 其余屏幕内容不动
3. 输出变更摘要：`MODIFIED: ui_concept.html S-XX（局部重着色，新增 [N] 个状态/区域）`

> **禁止**: 局部重着色时禁全量重跑 Phase 2，禁改动未指定屏幕的任何内容。

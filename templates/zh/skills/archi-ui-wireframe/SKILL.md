---
name: archi-ui-wireframe
type: subagent
description: UI 概念设计专家。生成高保真 ui_concept.html：tokens 充足时直接输出彩色高保真设计，tokens 不足时引导用户完善后生成。支持 adopt 模式从已有代码逆向捕获 UI 状态。产物是整个项目 UI 的单一视觉真相源，所有 Task 级 ui.md 均引用此文件定位屏幕范围。
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
/archi.inherit → 代码分析 + design_tokens.json
                      ↓
           [本 Skill] archi-ui-wireframe (adopt 模式)
           读: 代码路由/组件/布局 + design_tokens.json
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
| 逆向采用 | `/archi.inherit` 完成后 | 从代码路由/组件逆向生成全部屏幕 |
| 重新生成 | 用户手动调用 | 全量重写（全局 UI 重设计时） |
| 追加屏幕 | `/archi.scope` 追加新任务后 | 仅新增页面，不改已有页面 |
| Plan 细化 | `/archi.plan` 发现 UI 偏差后 | 仅更新对应屏幕（新增状态/子屏幕/布局修正）|
| 修改屏幕 | `/archi.edit` 任务变更后 | 仅修改受影响的屏幕，其余不动 |
| 删除屏幕 | `/archi.remove` 任务下线后 | 移除对应屏幕及控制栏入口 |

---

## 生成协议

### Step 1 — 读取上下文

**Action**:
- `vision.md` → 提取：目标平台、用户角色、北极星指标
- `roadmap.json` → 提取：所有含 UI 的任务，映射为屏幕/状态列表
- `design_tokens.json` → 提取：`mode.default`、`illustration.iconLibrary`、审美方向
- 规则文件 `02_tech_stack` → 提取：目标平台（Web/Mobile/Desktop）、导航框架

### Step 2 — 规划屏幕清单

(内部步骤，不输出给用户):

| 屏幕 ID | 屏幕名 | 对应 Roadmap 任务 | 状态列表 |
|:---|:---|:---|:---|
| S-01 | [屏幕名] | [任务 ID] | default, loading, empty, error |
| ... | | | |

> **屏幕 ID 稳定性规则** (CRITICAL): 屏幕 ID 一经分配永久不变。删除屏幕后其 ID 作废，后续新增屏幕须使用新 ID（如 S-08 → S-09），禁重用或重新编号已有 ID。所有 `ui.md` 均以 ID 引用屏幕，ID 变动将导致引用断裂。

### Step 3 — 选定 HTML 骨架规格

(根据目标平台自动适配):

| 平台 | 视口尺寸 | 顶栏形态 | 导航形态 |
|:---|:---|:---|:---|
| Web / Desktop SaaS | 1280×800px | 固定顶栏 | 左侧边栏 |
| Web / Marketing | 1440×900px | 透明→固定顶栏 | 顶部水平导航 |
| Mobile Web / 小程序 | 390×844px | 状态栏+导航栏 | 底部 TabBar |
| Tablet / Dashboard | 1024×768px | 固定顶栏 | 可折叠侧边栏 |

> 平台来自 `02_tech_stack` 或 vision.md 目标用户设备描述；无法推断时默认 Web / Desktop SaaS。

### Step 4 — Tokens 前置检查 + 引导

读取 `design_tokens.json`，检查关键字段完整性：

| 字段路径 | 通过条件 | 不足时处理 |
|:---|:---|:---|
| `aestheticDirection.preset` | 非空 | 纳入引导 Q1 |
| `primitivePalette.brand` | 至少含 1 个非空颜色值 | 纳入引导 Q2 |
| `semanticTokens.colors` | 至少含 `bg`/`surface`/`text` 语义映射 | 纳入引导 Q2 |
| `semanticTokens.typography` | 至少含 1 个字体族声明 | AI 基于审美方向选择（非阻塞） |
| `motion.preference` | 非空 | 默认 `subtle`（非阻塞） |
| `illustration.iconLibrary` | 非空 | 不引入图标库（非阻塞） |

**tokens 充足** → 直接进入 Step 5 高保真生成。

**tokens 不足** → 输出结构化引导问题（最多 3 题），用户回答后 AI 自动填充 tokens 再继续：

```
### 视觉风格确认

**[Q1] 审美方向**
| ID | 选项 | 参考产品 |
|:---|:---|:---|
| A | saas-dark | Linear, Vercel |
| B | saas-light [推荐] | Notion, Stripe |
| C | dashboard | Grafana, Datadog |
| D | 其他 | (请描述) |

**[Q2] 品牌主色**
> 填入 Hex 值（如 #4F46E5），或回复"无偏好"由 AI 基于审美方向生成

**[Q3] 信息密度**
| ID | 选项 |
|:---|:---|
| A | 大留白/沉浸式 |
| B | 适中 [推荐] |
| C | 信息密集/仪表盘风格 |

**INPUT**: `Q1答案 | Q2答案 | Q3答案`
```

AI 根据回答填充 `design_tokens.json`（写入文件），然后继续生成。已从代码提取到 CSS 变量/theme 的字段保留不覆盖。

### Step 5 — 生成高保真 HTML

写入 `[[__DOCS_DIR__]]/global/ui_concept.html`：

**HTML 结构规范**:
```
<html>
  <head>
    <!-- 内联 CSS：高保真视觉风格，基于 design_tokens.json -->
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
      <div class="wf-file-label">UI Concept · [项目名]</div>
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
- 控制栏须为线框图风格（灰度、uppercase label、dashed border-top），禁用彩色

**UI 质量标准** (CRITICAL):

| 维度 | 要求 |
|:---|:---|
| 定位 | 高保真界面，精致到可直接交付开发，不是线框图 |
| 卡片层级 | 用柔和投影区分层级，不用硬边框代替阴影 |
| 主色使用 | 仅用于 CTA 和关键状态反馈，面积不超整体 10% |
| 全局一致性 | 圆角、图标尺寸、间距全局统一 |
| 排版 | 充足留白、清晰字号层级（至少 3 级对比） |
| 交互状态 | 所有可交互元素须有 hover / focus / disabled 样式 |
| 内容填充 | 用真实感内容，禁 Lorem ipsum / "标题" 等占位文字 |

**内容规范**:

| 元素类型 | 规范 |
|:---|:---|
| 标题/导航文字 | 用真实业务名称（来自 roadmap task title），如"工作台""项目列表""设置" |
| 按钮 | 写具体操作文字，如"创建项目""立即登录""保存更改"，禁写"[按钮]" |
| 输入框 | 写 placeholder 文字，如"搜索项目名称…""输入邮箱地址" |
| 列表/表格 | 至少生成 3-4 行示例数据（用项目领域的真实感假数据，如用户名、项目名、日期） |
| 图表/图片区域 | 用带标注的矩形，但标注写实际图表类型，如"折线图：过去 7 天访问量"而非"[图表]" |
| 空状态 | 写具体的空状态文案，如"还没有项目，点击「创建项目」开始" |
| 错误状态 | 写具体错误文案，如"网络连接失败，请检查后重试" |

**审美方向 → 设计参数映射**:

根据 `aestheticDirection.preset` 确定设计参数基准值（Token 有显式值时 Token 优先，Token 为空时用此基准）：

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

**反 AI 审美黑名单** (CRITICAL — 生成时禁触犯):

| 类别 | 禁止 | 替代 |
|:---|:---|:---|
| 字体 | Inter, Roboto, Arial 作为标题字体 | 选择有辨识度的字体：展示字体用 characterful font（如 Cal Sans, General Sans, Satoshi, Outfit），正文可用系统字体 |
| 配色 | 紫色渐变白底（AI 默认审美的标志） | 从 `aestheticDirection` 推导；配色须有主次——一个主色 + 锐利强调色 > 均匀分布的温吞色板 |
| 布局 | 所有屏幕同一种居中卡片布局 | 不同屏幕须有布局差异：列表页 vs 详情页 vs 表单页各有特征 |
| 圆角 | 所有元素统一 rounded-lg | 圆角须有层级：容器大、按钮中、Badge 小（或按审美方向统一为 0/sm） |
| 阴影 | 千篇一律的 shadow-md | 阴影须匹配审美方向：dark 主题几乎不用阴影；light 主题分层使用 |
| 动效 | 到处撒 transition-all | 聚焦高影响力时刻：页面加载编排（交错淡入）> 散布的微交互 |
| 整体 | 每次生成都趋同 | 每个项目的设计必须因审美方向而异——打开两个不同项目的 ui_concept.html，必须一眼看出区别 |

**着色规则** (在审美方向基准 + 黑名单约束下执行):

| 着色维度 | 规则 |
|:---|:---|
| 颜色 | 用 `semanticTokens.colors` 语义 Token 映射；品牌色来自 `primitivePalette.brand`；Token 空值按审美方向基准填充 |
| 字体 | `semanticTokens.typography` 有值时引入声明字体；空值时按审美方向策略选择（Google Fonts CDN），禁选黑名单字体 |
| 圆角/阴影 | 按 `layout.radius` / `layout.shadow`；空值时按审美方向基准填充 |
| 动效 | 按 `motion.patterns` 添加 CSS transition/animation；优先编排页面加载交错淡入（staggered reveal via animation-delay） |
| 图示 | 按 `illustration.iconLibrary` 引入对应 CDN；style=none 则不插图 |
| 模式 | 若 `mode.support` 含 dark，添加 CSS `@media (prefers-color-scheme: dark)` + 切换按钮 |
| 禁用 | 遵循 vision.md Visual Reference 中的「禁用风格」描述 |
| 空间 | 创造有呼吸感或有密度的排版（取决于审美方向），不做机械均匀间距 |
| 背景 | 禁纯色大面积平铺——按审美方向添加微妙纹理/渐变网格/噪点/几何图案 |

### Step 6 — 生成 AI 索引

写入 `[[__DOCS_DIR__]]/global/ui_context.md`：

```markdown
# UI Context
> 平台: [平台类型] | 由 archi-ui-wireframe Skill 生成
> 更新: YYYY-MM-DD | 禁手动修改

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
> 由 ui_concept.html data-el 提取。写 ui.md Section 2 须与本节对齐，禁脱离已确认布局自创结构。

### S-XX · [屏幕名]
**布局**: [如"居中单列 max-w-400px"或"左侧边栏 240px + 右内容区"]
**状态**: default（[核心操作入口]）| loading（骨架屏）| empty / error（如有）
**关键区域**: [data-el 提取的语义区块+可交互元素，如：顶部导航栏、主表单区、提交按钮、错误提示区]
```

> `ui_context.md` 是所有 AI 命令读取 UI 结构信息的唯一入口；`ui_concept.html` 仅供人类浏览器预览。

### Step 7 — 验证清单

- [ ] 所有屏幕颜色来自 semanticTokens 或审美方向基准，无随意硬编码 Hex
- [ ] 所有动效时长来自 `motion.duration.*`，无魔法数字
- [ ] 页面/状态切换控制栏保持线框图灰度风格（不着色，保持调试工具属性）
- [ ] `data-el` 标注完整保留
- [ ] 每个屏幕的所有状态（default/loading/empty/error）均已视觉化
- [ ] **反 AI 审美检查**: 未使用黑名单字体、无紫色渐变白底、布局有差异性、圆角有层级
- [ ] **辨识度检查**: 打开 HTML，能一眼判断这是哪个审美方向，而非通用模板
- [ ] **UI 质量标准检查**: 文字非纯黑、背景有层次、卡片有柔和投影、主色面积≤10%、交互状态完整、内容为真实感填充

### Step 8 — Output Gate

输出覆盖摘要：

```
### ui_concept.html 已生成
### ui_context.md 已同步生成（AI 屏幕索引）

**审美方向**: [preset 值] — [参照产品]
**屏幕覆盖** (共 N 个屏幕):
| 屏幕 | 名称 | 状态数 |
|:---|:---|:---|
| S-01 | [屏幕名] | N |
| ... | | |

**应用的视觉规格**:
- 主色: [Primary Token 值]
- 字体: [展示字体 + 正文字体]
- 圆角: [sm/md/lg 值]
- 动效: [preference 值]
- 主题: [default + support 列表]

**导航结构**: [描述，如"左侧边栏 + 顶部面包屑"]
**平台适配**: [Web Desktop 1280px / Mobile 390px / ...]

> 在浏览器打开 `[[__DOCS_DIR__]]/global/ui_concept.html` 确认布局和视觉效果。
> 回复 **OK** 确认；或描述需要调整的屏幕/布局/视觉。
```

**Gate**: 用户回复 **OK** 后完成；未确认可进入 Refinement。

---

### Refinement — 精炼循环 (可选)

**Trigger**: 用户回复非 OK，含布局调整、屏幕增减、导航改动、视觉修改。
**Action**: 融入反馈，局部更新 `ui_concept.html`（仅改动用户指出的部分），同步更新 `ui_context.md`（屏幕索引与 `ui_concept.html` 保持一致），重新展示摘要，等待确认。禁全量重写。

---

### Incremental Update — 局部更新

**Trigger**: 某屏幕因 Plan 细化 / Edit / Revise 发生更新，需将新增内容按当前视觉规格更新。

**Action**:

1. 从调用方获取需更新的屏幕 ID 列表（如 `S-03`, `S-07`）。
2. 仅处理指定屏幕：
   - 保留其 `.wf-screen#S-XX` 内的已有内容
   - 按当前视觉规格（`semanticTokens` / `motion` / `illustration`）对新增部分生成
   - 其余屏幕内容不动
3. 如新增了状态 → 同步更新 `ui_context.md` 对应屏幕的状态列。
4. 输出变更摘要：
   - `MODIFIED: ui_concept.html S-XX（局部更新，新增 [N] 个状态/区域）`
   - `MODIFIED: ui_context.md S-XX（更新状态列表）`（仅当有新状态时）

> **禁止**: 局部更新时禁全量重写，禁改动未指定屏幕的任何内容。

---

### Adopt — 逆向采用（Legacy UI 逆向捕获）

**Trigger**: `/archi.inherit` 完成后，对 UI 项目调用。
**Input**: 已有代码（路由定义、页面组件、布局文件）+ design_tokens.json（可能不完整）

**Action**:

1. **扫描 UI 结构**:
   - 从路由定义提取页面清单（React Router / Vue Router / Next.js pages / SvelteKit routes 等）
   - 从布局组件识别导航结构（sidebar / navbar / tabbar）
   - 从页面组件识别核心区域和状态

2. **规划屏幕清单**: 同标准流程 Step 2（分配 S-XX ID，映射到 LEG-xx 任务）

3. **Tokens 检查 + 引导**: 同标准流程 Step 4
   - 已有代码中的 CSS 变量/Tailwind config/theme 文件优先提取
   - 不足部分走引导问题流程

4. **生成 HTML**: 同标准流程 Step 5（高保真质量标准）
   - 已有代码的 UI 结构作为布局参考（不是凭空设计，而是还原已有）
   - 细节和状态可以补全（如原代码缺少 empty/error 状态）

5. **生成 ui_context.md**: 同标准流程 Step 6

6. **Output**: 同标准流程 Step 8

---
description: 任务级 UI 范围声明 — 描述本任务负责的屏幕/组件范围，视觉细节以 ui_concept.html 为准。
glue: 与 [[__DOCS_DIR__]]/global/ui_concept.html 强关联，禁重定义整体布局或全局导航。
---

# UI Scope: {FEATURE_NAME}

> **Concept Reference**: `[[__DOCS_DIR__]]/global/ui_concept.html`
> **Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`
> **Protocol**: ITP v3.0（仅描述本任务边界内的组件树）

## 1. Screen Scope (屏幕范围)

<!-- [AI]: 从 ui_concept.html 中指出本任务涉及哪些屏幕/状态 -->

| 屏幕 ID | 屏幕名 | 本任务负责的状态 |
|:---|:---|:---|
| S-XX | [名称] | default, loading, empty, error（全部 or 指定子集） |

> 若本任务无独立屏幕（仅修改已有屏幕的局部区域），在此说明修改区域。

## 2. Component Scope (组件范围)

<!-- [AI]: 仅描述本任务新增或修改的组件；全局组件(TopBar/Sidebar/Footer)引用，禁重定义 -->

```text
[ScreenName > 修改区域名]
  NewComponent [Col, Gap:4]      ← 本任务新增
    ExistingComponent            ← ref: ui_concept.html S-XX (不修改)
    #NewSubComponents
```

> **引用规则**: 已在 `ui_concept.html` 中定义的组件 → `ref: ui_concept.html#S-XX-组件名`；禁复制粘贴其结构。

## 3. Interactions (本任务新增的交互)

<!-- [AI]: 仅列出本任务引入的新交互；ui_concept.html 已有的交互不重复 -->

| Trigger | Target | Action |
|:---|:---|:---|
| #NewButton click | API | POST → success: Toast / error: inline |

## 4. States (本任务负责的状态渲染)

<!-- [AI]: 若 ui_concept.html 的状态已充分描述，此处可省略或仅补充差异 -->

| State | Delta from ui_concept.html |
|:---|:---|
| `loading` | 同 ui_concept.html S-XX loading（无差异）|
| `empty` | 本任务空态文案不同："{具体文案}" |

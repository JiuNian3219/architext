---
description: 任務級 UI 範圍聲明 — 畫面 ID 來自 ui_context.md，視覺原型見 ui_concept.html（人看）；禁重定義整體布局或全域導航。
glue: 畫面 ID 引用自 [[__DOCS_DIR__]]/global/ui_context.md；禁重定義整體布局或全域導航。
---

# UI Scope: {FEATURE_NAME}

> **Screen Index**: `[[__DOCS_DIR__]]/global/ui_context.md`（AI 讀取畫面 ID 和導覽關係）
> **Visual Prototype**: `[[__DOCS_DIR__]]/global/ui_concept.html`（人類瀏覽器預覽）
> **Tokens**: `[[__DOCS_DIR__]]/global/design_tokens.json`
> **Protocol**: ITP v3.0（僅描述本任務邊界內的元件樹）

## 1. Screen Scope (畫面範圍)

<!-- [AI]: 從 ui_context.md 的畫面索引中選取本任務涉及的畫面 ID 和狀態 -->

| 畫面 ID | 畫面名 | 本任務負責的狀態 |
|:---|:---|:---|
| S-XX | [名稱] | default, loading, empty, error（全部 or 指定子集） |

> 若本任務無獨立畫面（僅修改已有畫面的局部區域），在此說明修改區域。

## 2. Component Scope (元件範圍)

<!-- [AI]: 僅描述本任務新增或修改的元件；全域元件(TopBar/Sidebar/Footer)引用，禁重定義 -->

```text
[ScreenName > 修改區域名]
  NewComponent [Col, Gap:4]      ← 本任務新增
    ExistingComponent            ← ref: ui_concept.html S-XX (不修改)
    #NewSubComponents
```

> **引用規則**: 已在 `ui_concept.html` 中定義的元件 → `ref: ui_concept.html#S-XX-元件名`；禁複製貼上其結構。

## 3. Interactions (本任務新增的互動)

<!-- [AI]: 僅列出本任務引入的新互動；ui_concept.html 已有的互動不重複 -->

| Trigger | Target | Action |
|:---|:---|:---|
| #NewButton click | API | POST → success: Toast / error: inline |

## 4. States (本任務負責的狀態渲染)

<!-- [AI]: 若 ui_concept.html 的狀態已充分描述，此處可省略或僅補充差異 -->

| State | Delta from ui_concept.html |
|:---|:---|
| `loading` | 同 ui_concept.html S-XX loading（無差異）|
| `empty` | 本任務空態文案不同："{具體文案}" |

---
description: UI Design & Structure (ITP v3.0) for {FEATURE_NAME}.
---

# UI Design: {FEATURE_NAME}

> **Protocol:** ITP v3.0 (See `02_tech_stack.md`)
> **Reference:** `[[__DOCS_DIR__]]/global/03_design_tokens.md`

## 1. Interaction Flow

<!-- [AI Instruction]: 简述用户交互步骤，描述从触发到完成的完整流程 -->

1. User clicks [Entry Point]. (e.g. "Add Comment" button)

2. UI shows [Loading State]. (e.g. Skeleton loader)

3. User completes action. (e.g. Submit form)

4. System provides feedback. (e.g. Success toast)

## 2. Component Structure (ITP Description)

<!-- [AI Instruction]: 使用 ITP 语法描述组件树。
  Naming: PrefixFunction (Btn, Box, Txt, Inp, List)
  Syntax: Name [Layout] (Props) -> #Interaction
-->

```text
// AI: Replace with actual structure based on requirements
Page{Name} [Col, Fill, Bg:Base]
BoxHeader [Row, Between, P:4]
TxtTitle [H2] (Text: {FEATURE_NAME})

BoxContent [Col, Gap:4]
#Children_Components
// e.g. InpSearch [Fill]
// e.g. ListResults [Col]
```

## 3. Visual States

<!-- [AI Instruction]: 定义所有可能的 UI 状态，确保覆盖边界情况 -->

* **Loading**: [e.g. Skeleton row x 3, 使用 `bg-muted` token]

* **Empty**: [e.g. Illustration "No Data", 使用 `text-muted-foreground` token]

* **Error**: [e.g. Toast with Retry button, 使用 `bg-destructive` token]

* **Success**: [e.g. Success message, 使用 `bg-primary` token]

## 4. Responsive Strategy

* **Mobile**: [e.g. Sidebar hidden]

* **Desktop**: [e.g. Sidebar visible]
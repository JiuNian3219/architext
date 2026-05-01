**ui_context.md 内容结构**：

```
# UI Context
> 平台: [类型] | 生成: YYYY-MM-DD

## 屏幕索引
| ID | 名称 | 路由 | 文件 | 状态 |
|:---|:---|:---|:---|:---|
| S-01 | [名] | [路由] | screens/S-01.html | default, loading, empty, error |

## 导航关系
S-XX →（触发条件）→ S-YY

## 屏幕结构摘要
### S-XX · [屏幕名]
**布局**: [描述]
**文件**: screens/S-XX.html
**用途**: 仅作视觉/交互参照；编码阶段不得直接复制该 HTML/CSS/JS，必须用项目自身技术栈重新实现。
**状态**: default | loading | empty | error
**关键区域**: [data-el 提取]
```

- **初始化时**（`/archi.start`）：仅填充「屏幕索引」和「导航关系」
- **生成后**（`/archi.ui`）：填充「屏幕结构摘要」

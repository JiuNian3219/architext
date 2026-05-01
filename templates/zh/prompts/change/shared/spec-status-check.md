# Spec-Status 检测

读取 tasks/<ID>_<Slug>/spec.md 的 frontmatter Spec-Status 字段。

| Spec-Status | 处理 |
|---|---|
| Full | 直接进入子协议主流程 |
| Stub | 进入 Stub Enrich 流程（见下） |
| 缺失 | 视同 Full（向后兼容老 spec），但子协议 Verify 阶段 silent-audit 须输出 INFO 提示补 frontmatter |

# Stub Enrich 流程（仅 Stub 触发）

1. 告知用户：「该 Task 当前为轻量快照（Stub），须先补全完整 spec 才能继续。」
2. 从 spec.md 的「关联文件」段提取源码路径（入口 + 核心逻辑）。
3. 逐一读取源码，提取：
   - 接口签名 / 类型定义 / 导出
   - 主流程行为（推断 Gherkin Scenarios）
   - 错误处理路径
4. 基于源码分析补全 spec.md：保留原有「概述」「关联文件」段，追加 Gherkin Scenarios + 接口/类型定义。
5. 更新 frontmatter: Spec-Status: Stub → Full。
[[WHEN: ui | 6. 模块有 UI 时同步补全 ui.md；如须新增屏幕：
   [[SKILL: archi-ui-wireframe | 调用 skill 生成屏幕]]
   [[NO-SKILL: （请阅读 [[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md，并在当前上下文按其协议执行）]]
]]
7. 如 plan.json 不存在，生成一份占位 plan.json（全部 task 标记 done，对应已实现行为）。
8. 向用户输出补全后的 spec 摘要。

# Gate

用户确认补全结果后，回到子协议主流程的下一 step。

# 异常处理

- 「关联文件」缺失或路径不存在 / 已移动 → 提示用户更新关联路径，终止 Enrich。
- 源码体量过大无法一次读取 → 调用 archi-code-survey SUBAGENT 做摘要后再补全。
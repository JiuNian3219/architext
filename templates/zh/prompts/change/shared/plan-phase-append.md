# Phase 命名规范

| 调用子协议 | Phase 命名 |
|---|---|
| fix    | Bugfix: <Bug Title> (<Date>) |
| edit   | Edit: <Change Topic> (<Date>) |
| revise | Global Revision: <Revision Topic> (<Date>) |

# Phase 内 Task 格式

```json
{
  "id": "<phase-id>.<n>",
  "title": "<可验证的具体动作>",
  "done": false,
  "tests": ["<对应测试用例或验证点>"]
}
```

`tests` 必须写成可执行、可断言的场景，说明输入、动作、期望结果；禁止写成“补测试”“跑测试”“覆盖逻辑”这类无法验收的占位句。

每个 Task 须可验证（有明确的 done 判据），禁写“优化 X”这种主观无 done 信号的项。

# 特殊 Phase 模板

## fix Bugfix Phase 三件套（强制）

Bugfix Phase 必须在 phase 本身添加轻量根因元数据：

```json
"problemCause": {
  "summary": "<为什么发生；不要写修复方案>",
  "evidence": ["<只写短引用：文件、日志标识、测试名、用户反馈>"],
  "confidence": 0.7
}
```

不要在 `problemCause` 里复制 spec、日志、复现步骤、修复策略、lesson 或受影响文件列表。

1. Reproduction Test — 创建复现测试用例（Red 状态）
2. Fix Implementation — 修复代码（Green）
3. Regression Test — 回归测试套件通过

# Status 转换规则

追加 Phase 后，按当前 roadmap.json 中 <ID>.status 决定是否重置：

| 当前 status | 追加 Phase 后的处理 |
|---|---|
| pending | 拒绝（pending 应先走 plan，不应触发 change） |
| active  | 保持 active，无须 reset |
| done    | 重置为 active — 执行 npx archi task <ID> --status active，输出 MODIFIED: roadmap.json <ID>.status done→active |
| blocked | 提示用户「该 task 当前 blocked，需先解除依赖阻塞」；强制覆盖时同 active 流程 |

# Terminal Gate

追加完成后须运行 npx archi task --check + npx archi render，无 ERROR 才进入下一 step。

# 输出契约

- 输出 MODIFIED: plan.json — appended <Phase Name> with N tasks。
- 如执行了 status 重置，额外输出 MODIFIED: roadmap.json <ID>.status done→active。

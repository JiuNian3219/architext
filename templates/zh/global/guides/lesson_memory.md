# lesson_memory.json

- `lessons[]`: 可复用教训，来源可以是运行/构建/测试失败、用户纠错、错误假设或流程失误。
- `lessons[].id`: 稳定教训 ID。
- `lessons[].matchWhen`: 触发该教训的关键词、症状或用户纠错。
- `lessons[].cause`: 根因或重复犯错模式。
- `lessons[].solution`: 可复用修正方式或行为调整。
- `lessons[].lesson`: 后续避免重复犯错的短规则。
- `checkpoints[]`: 从过往教训提炼出的执行前提醒。
- `checkpoints[].before`: 需要警惕的执行前场景。
- `checkpoints[].check`: 执行前要检查的动作。

不变量：
- 只记录可复用教训，不收纳一次性噪音，也不要把每个技术报错都倒进来。
- 路径保持项目相对路径，不写敏感信息。

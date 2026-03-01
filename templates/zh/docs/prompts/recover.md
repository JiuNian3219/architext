<protocol_recover>
**Trigger**: `/archi.recover <pack-file>`
**Goal**: 读取 pack 文件，将其中所有用户数据（文档、任务、自定义规则）写入当前项目对应路径，完成框架升级后的数据还原。

<meta>
  <style>Precise, Efficient, Non-interactive</style>
  <language>简体中文</language>
  <principles>
    1. **User Data Only**: pack 文件仅含用户数据（`global/`、`tasks/`、`scripts/`、自定义规则），无框架文件，全部写入，无需过滤。
    2. **Overwrite Always**: 目标路径已存在文件时直接覆盖，无需询问（框架升级场景下旧数据即为空模板，可安全替换）。
    3. **Delta Notation**: 输出须以 `ADDED` / `MODIFIED` 标注每个写入文件。
    4. **No Partial Write**: 若任一文件写入失败，立即停止并报告；已写入文件不回滚（幂等，重跑安全）。
  </principles>
</meta>

<step_1_ingest>
  **Role**: 情报分析官
  **Action**:
  1. 读取 `<pack-file>` 路径的文件内容。
  2. 解析 XML，提取 `<files>` 下每个 `<file>` 元素的 `path` 属性与 CDATA 内容。

  | 情况 | 处理 |
  |:---|:---|
  | 文件不存在或无法读取 | 停止 — 告知用户检查路径，提示先运行 `archi pack` 生成 |
  | XML 格式错误 | 停止 — 提示文件可能损坏，重新运行 `archi pack` |
  | `<files>` 为空 | 停止 — 告知 pack 为空 |

  **Output**: 内部文件列表（路径 + 内容），不直接输出给用户。
</step_1_ingest>

<step_2_apply>
  **Role**: 资深工程师
  **Action**:
  1. 对每个 `<file>` 条目：
     - 以 `path` 属性（相对项目根目录）为写入目标。
     - 若目标文件已存在 → 覆盖（标记 `MODIFIED`）。
     - 若目标文件不存在 → 新建（标记 `ADDED`）。
     - 写入 CDATA 中的完整内容，保留原始换行与编码。
  2. 注意：pack 中的路径可能含嵌套子目录（如 `tasks/FEAT-001_auth/spec.md`），须确保父目录存在。

  **Output**:
  ```
  ADDED     .architext/global/vision.md
  ADDED     .architext/global/roadmap.json
  ADDED     .architext/tasks/FEAT-001_auth/spec.md
  MODIFIED  .cursor/rules/90_custom_rules.mdc
  ...
  ```
</step_2_apply>

<step_3_signoff>
  **Action**:
  1. 输出还原摘要：
     - 总计写入文件数（ADDED + MODIFIED 分别统计）
  2. Next Steps：

  | 步骤 | 说明 |
  |:---|:---|
  | 确认框架状态 | 运行 `/archi.help` 查看项目当前状态与建议下一步 |
  | 清理 pack 文件 | 可删除 `<pack-file>`，已不再需要 |
</step_3_signoff>

</protocol_recover>

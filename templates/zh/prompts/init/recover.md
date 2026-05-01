<protocol_recover>
**Trigger**: 由 `prompts/init.md` 路由器分发，参数为 `<pack-file>`
**Goal**: 读取 pack 文件，将用户数据（文档、任务、自定义规则）写入当前项目对应路径，完成框架升级后的数据还原。

<meta>
	<style>Precise, Safety-First</style>
	<language>简体中文</language>
	<principles>
		User Data Only: pack 仅含用户数据（`global/` / `tasks/` / `refs/` / 自定义规则），全部写入，无需过滤。
		Version Aware: pack 版本与当前框架兼容才直接写入；不兼容拒绝或提示迁移。
		Two-Phase Write: 先全量解析 + 校验，再统一写入；解析失败不写任何文件。
	</principles>
</meta>

<step_0_safety_check>
1. 运行 `git status --porcelain` 检查 Git 工作区：
   - 无未提交改动 → 通过，进 step_1
   - 有未提交改动 且 未传 `--force` → 输出警告并停止：

检测到 Git 工作区有未提交的修改（当前改动文件数 <N>）。恢复操作会覆盖 `global/` / `tasks/` / `refs/` 下的文件。请选择：
- [A] 先提交/暂存当前修改，然后重跑 `/archi.init <pack-file>`（init 路由器会自动进入 recover）
- [B] 强制恢复（丢弃修改）：`/archi.init <pack-file> --force`
- [C] 中止

2. 通过后进入 step_1。
</step_0_safety_check>

<step_1_ingest>
1. 读取 `<pack-file>` 路径的文件内容
2. 解析 XML，提取：
   - `<metadata>` 下的当时 architext 版本号（如存在）
   - `<files>` 下每个 `<file>` 元素的 `path` 属性与 CDATA 内容
3. 错误处理：

| 情况 | 处理 |
|:---|:---|
| 文件不存在或无法读取 | 停止，告知用户检查路径，提示先运行 `archi pack` 生成 |
| XML 格式错误 | 停止，提示文件可能损坏，重运行 `archi pack` |
| `<files>` 为空 | 停止，告知 pack 为空 |

4. 版本兼容性检查：

| 情况 | 处理 |
|:---|:---|
| 版本一致 | 直接进 step_2 |
| pack 版本更旧（同 major） | 提示 schema 差异，建议先 `archi update`；用户确认后继续 |
| pack 版本更新 或 跨大版本回退 | 拒绝，要求用户使用相同或更新版本的 architext |
| pack 无版本元数据（旧 pack） | 警告 "pack 版本未知，恢复后必须运行 archi doctor 验证"，用户确认后继续 |

5. 第一阶段验证（不写入）：
   - 每个 `<file>` 的 `path` 非空且不含 `..` 跳出项目根的路径
   - CDATA 内容可解析（无截断）
   - 验证失败 → 输出失败文件列表并停止，不写入任何文件

输出：内部文件列表（路径 + 内容，不给用户）；版本差异提示（如有）给用户。
</step_1_ingest>

<step_2_apply>
1. 对每个 `<file>` 条目：以 `path`（相对项目根）为写入目标
   - 已存在 → 覆盖（记 `MODIFIED`）
   - 不存在 → 新建（记 `ADDED`）
   - 写入 CDATA 完整内容，保留原始换行与编码
2. pack 中路径可能含嵌套子目录，确保父目录存在
3. 原子性建议：底层支持时先写到临时目录再原子 rename；不支持时依序写入，失败立即停止并报告已写入文件列表（幂等，重跑安全）

输出：每个文件的 `ADDED` / `MODIFIED` 状态列表。
</step_2_apply>

<step_3_post_restore_doctor>
1. 运行 `npx archi doctor`
2. 收集输出分类为 PASS / WARNING / CRITICAL
3. 有 CRITICAL 项 → 在总结中显性标出，提示用户添加到下一步优先处理列表
4. 仅 WARNING → 摘要列出，不阻断
</step_3_post_restore_doctor>

<step_4_signoff>
向用户输出还原摘要：
- 标题一行：项目恢复完成
- 四段正文：写入统计（ADDED / MODIFIED / 总计）/ 版本信息（pack 版本 + 当前框架 + 兼容性）/ Doctor 结果（CRITICAL / WARNING / PASS 计数）/ Next Steps
- Next Steps：运行 `/archi.help` 查看项目状态；按 doctor 输出处理 CRITICAL（如有）；可删除 pack 文件
</step_4_signoff>
</protocol_recover>

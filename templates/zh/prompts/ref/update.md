<protocol_ref_update>
**Trigger**: `/archi.ref update <id>`
**Goal**: 按 sourceType 重新获取源内容 → 重新摘要 → 覆盖文件并刷新 updatedAt。原 id / tags / format / created 不变。

<step_0_locate>
读取 `[[__DOCS_DIR__]]/refs/index.json`，按 `<id>` 查找条目：

| 情况 | 处理 |
|:---|:---|
| id 不存在 | **停止** — 提示检查 id，可运行 `/archi.ref list` 查看 |
| 命中 | 加载 file 路径与 sourceType 后进入 step_1 |
</step_0_locate>

<step_1_refetch>
按 sourceType 重新获取源内容：

| sourceType | 处理 |
|:---|:---|
| `url` | 重新抓取原 URL |
| `local-file` | 重新读取原文件路径 |
| `manual` | 提示用户粘贴新内容并等待输入 |

获取失败 → **停止** — 提示原因（URL 不可达 / 文件不存在 / 用户取消），不修改任何文件。
</step_1_refetch>

<step_2_re_summarize>
重新执行内容分析（与 add step_1_analyze 一致）：
1. **内容类型校验**：参照 [[INCLUDE: prompts/ref/shared/format-selection.md]]。**禁变更原 format** — 若源内容类型已漂移（例如 yaml 改成 md 文档），仅 WARNING 提示用户考虑 remove 重新 add，仍按原 format 续写。
2. **关键信息提取**：核心接口 / 约束 / 示例 ≤ 3 个。
3. **保留原 id / tags / format**；不重新提问。
</step_2_re_summarize>

<step_3_preview>
输出更新预览卡：
- 引用 ID / title / tags / sourceType / source
- 将覆盖的文件：`[[__DOCS_DIR__]]/refs/{id}.{ext}`
- 新摘要预览：核心变化点、保留的接口/约束/示例
- 差异提示：与旧摘要相比新增/删除/明显变化的主题
- WARNING：若检测到源内容类型漂移，提示用户考虑 `/archi.ref remove <id>` 后重新 `/archi.ref add`

**Gate**：等待用户明确回复 **OK** 后进入 step_4_overwrite；取消或未确认则停止，不修改任何文件。
</step_3_preview>

<step_4_overwrite>
1. 覆盖写入 `[[__DOCS_DIR__]]/refs/{id}.{ext}`：
   - `.md`：保留原 frontmatter 中 created，刷新 updated
   - `.yaml` / `.json`：纯内容覆盖，updatedAt 由 index 维护
2. 更新 `refs/index.json` 中该条目的 `updatedAt`。

输出：
```
UPDATED    [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED   [[__DOCS_DIR__]]/refs/index.json
```
</step_4_overwrite>

<step_5_signoff>
**Pre-signoff Checklist**：
1. 更新预览卡已获用户明确 OK
2. id / tags / format 与刷新前完全一致（未发生意外变更）
3. `updatedAt` 已变更，`created` 未变更
4. 新摘要压缩比 ≥ 50%
5. 若检测到源内容类型漂移，已在输出中以 WARNING 形式提示用户
</step_5_signoff>
</protocol_ref_update>

<protocol_ref_remove>
**Trigger**: `/archi.ref remove <id>`
**Goal**: 删除引用文件并从 index.json 移除对应条目。

<step_1_locate>
读取 `[[__DOCS_DIR__]]/refs/index.json`，按 `<id>` 查找条目：

| 情况 | 处理 |
|:---|:---|
| id 不存在 | **停止** — 提示检查 id，可运行 `/archi.ref list` 查看 |
| 命中 | 加载 file 路径后进入 step_2 |
</step_1_locate>

<step_2_confirm>
输出删除确认卡：
- 将删除的引用文件：`[[__DOCS_DIR__]]/refs/{id}.{ext}`
- 将移除的索引条目：`refs/index.json` 中 id = `{id}`
- 命中的引用信息：title / tags / sourceType / source
- 风险提示：删除后需要重新 add 才能恢复；仅按 id 精确匹配，不模糊删除。

**Gate**：等待用户明确回复 **OK** 后进入 step_3_delete；取消或未确认则停止，不修改任何文件。
</step_2_confirm>

<step_3_delete>
1. 删除 `[[__DOCS_DIR__]]/refs/{id}.{ext}`（文件已不存在时仅记录 WARNING，不阻断）。
2. 从 `refs/index.json` 的 `refs` 数组移除该条目。

输出：
```
REMOVED    [[__DOCS_DIR__]]/refs/{id}.{ext}
MODIFIED   [[__DOCS_DIR__]]/refs/index.json
```
</step_3_delete>

<step_4_signoff>
**Pre-signoff Checklist**：
1. 删除确认卡已获用户明确 OK
2. `refs/{id}.{ext}` 已不存在
3. `refs/index.json` 中已无该 id 条目
4. 未误删其它引用（按 id 精确匹配，不模糊匹配）
</step_4_signoff>
</protocol_ref_remove>

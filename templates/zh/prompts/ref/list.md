<protocol_ref_list>
**Trigger**: `/archi.ref list`
**Goal**: 读取索引并按 tags 分组展示已存引用，支持快速定位。

<step_1_read_and_render>
读取 `[[__DOCS_DIR__]]/refs/index.json`：

| 情况 | 处理 |
|:---|:---|
| 索引不存在 / refs 为空 | 提示「当前无引用，运行 `/archi.ref add` 添加第一个」 |
| 正常 | 按 tags 分组展示（每组：ID / 标题 / 格式 / 更新时间） |

**多 tag 归组规则**：引用归入其首个 tag 组（主 tag），并在末尾标注其它 tag。

输出格式示例：

```
## tag: api
- stripe-payment   Stripe Payment Intents API   (.md)   · 更新于 2026-04-12   · also: [payment, sdk]
- twilio-sms       Twilio SMS API               (.yaml) · 更新于 2026-03-28

## tag: sdk
- internal-bff-sdk  Internal BFF SDK 0.3        (.md)   · 更新于 2026-04-20
```

末尾汇总：「共 N 个引用，跨 M 个 tag」。
</step_1_read_and_render>
</protocol_ref_list>
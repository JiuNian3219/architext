<protocol_ref_list>
**Trigger**: `/archi.ref list`
**Goal**: Read index and display stored references grouped by tags, support quick locate.

<step_1_read_and_render>
Read `[[__DOCS_DIR__]]/refs/index.json`:

| Situation | Handling |
|:---|:---|
| Index does not exist / refs empty | Prompt "No references currently, run `/archi.ref add` to add first" |
| Normal | Display grouped by tags (Each group: ID / Title / Format / Updated time) |

**Multi-tag grouping rule**: Reference goes into its first tag group (primary tag), mark other tags at end.

Output format example:

```
## tag: api
- stripe-payment   Stripe Payment Intents API   (.md)   · Updated 2026-04-12   · also: [payment, sdk]
- twilio-sms       Twilio SMS API               (.yaml) · Updated 2026-03-28

## tag: sdk
- internal-bff-sdk  Internal BFF SDK 0.3        (.md)   · Updated 2026-04-20
```

End summary: "Total N references, across M tags".
</step_1_read_and_render>
</protocol_ref_list>
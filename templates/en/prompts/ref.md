<protocol_ref_router>
**Trigger**: `/archi.ref <sub> [args]` | Loaded when Intent Card points to `/archi.ref`
**Goal**: Manage external knowledge references (third-party APIs, company internal SDKs, business rules etc), store structurally in `refs/` directory, inject context on-demand for `plan` / `code`.

<meta>
  <style>Analytical, Precise, Context-Aware</style>
  <language>English</language>
  <principles>
    1. **Summarize, Not Copy**: Do not copy entire original; distill into structured summaries AI can efficiently consume (key interfaces / constraints / examples), compression ratio ≥ 50%.
    2. **Format-Aware**: Automatically select most appropriate carrier format (.md / .json / .yaml) based on content type, preserving original format's semantic advantages. See [[INCLUDE: prompts/ref/shared/format-selection.md]].
    3. **Tag-Driven**: Each ref must carry tags for plan / code on-demand matching injection; no tag-less references.
    4. **Index-First**: All operations sync update `refs/index.json`; AI loads on-demand via index, do not full-scan refs/ directory.
  </principles>
</meta>

<step_1_route>
Two routing paths.

**Fast path**: User explicitly provides `/archi.ref <sub> [args]` → Strictly route per table below.

| `<sub>` | Subprotocol | Purpose |
|:---|:---|:---|
| `add` | `ref/add.md` | Summarize and store external knowledge (core) |
| `list` | `ref/list.md` | List all stored references |
| `update <id>` | `ref/update.md` | Re-summarize specified reference |
| `remove <id>` | `ref/remove.md` | Delete specified reference |

**Intent Card path**: If triggered by natural language and Intent Card points to `/archi.ref`:
- First read Context Pack; if missing return to `00_system.md` Front Pipeline to fill.
- Use refs/index hits and risk_flags from Context Pack, do not full-scan `refs/`.
- `subprotocol` is `add` / `list` / `update` / `remove` and `confidence >= 0.75` and no `ambiguities` → Use that route.
- `update` / `remove` must preserve `requires_user_confirmation=true`, Gate executed by subprotocol for overwrite/delete confirmation.
- Low confidence or ambiguity → Enter intent path for re-judgment, still uncertain then ask.

**Intent path**: User expresses in natural language (or `/archi.ref` without subcommand) → Identify intent per table below.

| Subcommand | Verb / Context Signal | Input Accompanying Signal (High Weight)|
|:---|:---|:---|
| `add` | Add / Store / Record / Save / Keep | Input contains URL / file path / large pasted text |
| `list` | List / Show what's there / Existing / Query / Overview | — |
| `update <id>` | Refresh / Update / Re-summarize | Followed by existing id |
| `remove <id>` | Delete / Remove / Clean up / Get rid of | Followed by existing id |

**Typical Examples**:

| User Expression | Inferred Subcommand | Key Signal |
|:---|:---|:---|
| Help me add this | `add` | "Add" + current context has content |
| Save https://stripe.com/docs/api | `add` | URL signal very strong |
| This is our internal SDK doc, note it | `add` | "Note it" + context has doc |
| What refs are there now | `list` | Query list |
| Refresh stripe-payment | `update stripe-payment` | "Refresh" + existing id |
| Delete twilio-sms | `remove twilio-sms` | "Delete" + existing id |

**Judgment Priority** (High → Low):
1. Explicit `/archi.ref <sub>` fast path
2. Input accompanied by URL / file path / large paste → Strong merge to `add`
3. Verb signal matches single subcommand → Route
4. Context inference (e.g. just discussed some API, then "help me note it") → Route
5. None of above hit → **Ask Gate**

**Ask Gate**:
- Multiple subcommands match simultaneously → Ask user intent (e.g. "update" but no id and could be add → Ask "New add or update an existing ref?")
- update / remove match but id not provided → Prompt to run `list` first to see available ids

**Completely Unrecognizable** → **Honest Refusal**:
> /archi.ref intent not recognized. You can say:
> - "Help me add X" / Paste content directly → add
> - "Show what refs there are" → list
> - "Refresh / Delete <id>" → update / remove
</step_1_route>

<step_2_handoff>
Execute corresponding subprotocol to completion per `<sub>`; do not return to router during subprotocol execution (**No Re-routing**).
</step_2_handoff>
</protocol_ref_router>
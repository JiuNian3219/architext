# Action Routing

Each finding must have recommended fix command. Generate per problem type per table below:

| Problem Type | Recommended Command | Router Dispatch |
|---|---|---|
| Bug / Behavior anomaly / Error / Crash | `/archi.change <ID> <bug description>` | change/fix |
| Spec gap / Spec-Code drift / Edge case uncovered / Stub spec | `/archi.change <ID> <supplement description>` | change/edit |
| Architecture-level issue / Cross-task consistency / Global tech stack violation / Vision drift | `/archi.change <global description>` | change/revise |
| Feature incomplete / Plan authenticity issue (done but code not landed) | `/archi.code <ID>` | — |
| Architecture map drift / Directory inconsistent with map | `/archi.review map` | review/map |
| Missing spec.md (Missing) | `/archi.change <ID> <complete spec description>` | change/edit |
| Minor issues (naming, comments, simplifiable) | (No separate command) Handle in next /archi.code | — |

# Output Contract

- Recommended command must be directly copy-paste executable (with <ID> actual value, with specific description, no `<...>` placeholders).
- Single finding can recommend multiple commands (e.g. same file has bug + spec gap), sort by main fix path, first is recommended path.
- Command string uses `/archi.change`, do not recommend old fix / edit / revise entry points; three intent types have merged to change router, router dispatches by intent.
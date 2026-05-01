# command_api.json

- `commands[]`: CLI command registry.
- `commands[].name`: command name or subcommand path.
- `commands[].args[]`: positional args.
- `commands[].options[]`: flags/options.
- `commands[].description`: user-visible purpose.
- `commands[].owner`: task id that owns the command.

Invariants:
- Update when adding, renaming, or changing command behavior.
- Keep stdout/exit behavior aligned with spec.
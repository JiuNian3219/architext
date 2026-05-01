---
name: archi-code-survey
description: Survey an existing codebase for /archi.init inherit. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
---

## Invocation

- **Auto-invoke**: No, not triggered by model based on description.
- **Trigger location**: Only explicitly called via `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` in `/archi.*` protocols.
- **Execution context**: When subagent supported must execute in independent subagent/independent context; only downgrade to inline Skill when no subagent.
- **Boundary**: Only return protocol-required structured artifacts, subsequent write, confirm and signoff handled by calling protocol.


## Design Principles

1. **Thorough Discovery**: Full read of all non-third-party business code (exclude node_modules/vendor/dist etc generated artifacts)
2. **Layered Recording**: Core modules record flows in detail; shared logic record signatures and dependencies; pure utilities record signatures and purposes
3. **Large Module Throttling**: When single module > 20 files, sort by import count for detailed read of top 10, rest only record export signatures
4. **Evidence-Based**: Any conclusion must be based on code facts, do not fabricate without evidence

## Execution Phases

### 1a Coarse Read

1. Read project root config files (auto-detect type):
   - Node.js: package.json, tsconfig.json
   - Rust: Cargo.toml
   - Go: go.mod
   - Python: pyproject.toml, requirements.txt
   - Java: pom.xml, build.gradle
   - Other: Use root directory config files as reference
2. Read README.md (if exists)
3. Scan directory structure (complete depth)
4. Infer project feature tags (ui / data / cli / lib / api)
5. Identify entry files and core modules; build module dependency sketch following entry file's import chain

### 1b Fine Read

1. For each feature module:
   - Start from entry file, read layer by layer following import/call chain, cover main business logic
   - Extract main flows (user operation → system processing → result)
   - Record associated file paths and importedBy reverse relationships
   - Large modules (> 20 files): Sort by importedBy count for detailed read of top 10, rest only record export signatures
2. For shared/infrastructure code (utils, middleware, config) full read, record by tier:
   - **Medium tier** (auth/validation/error-handling/permission): Responsibility + export function signatures + who depends on it
   - **Simple tier** (format/slugify/logger/helpers): Function name + parameter signature + one-sentence purpose
   - Both write to publicAPI field

### 1c Term Extraction

Extract domain terms and naming conventions from code naming, comments, documentation, record in terminology.

## Output Contract

```
{
  features:      ["ui" | "data" | "cli" | "lib" | "api" | ...],
  techStack:     { language, runtime, framework, deps, buildTool, testTool, deployment, ... },
  modules:       [{ name, entryFile, responsibility, flows, files, importedBy }],
  sharedCode:    [{ path, tier: "medium" | "simple", responsibility, publicAPI, dependedBy }],
  terminology:   [{ term, context }],
  uncertainties: [{ question, location, options? }]
}
```
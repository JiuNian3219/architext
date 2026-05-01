<protocol_plan_decompose>
**Trigger**: Dispatched by `prompts/plan.md` router, parameter form: no param / `[file_path]` / `[natural language requirement]`
**Phase**: Requirement Decomposition
**Goal**: Read Scope Brief (or generate through interview), decompose large requirement into multiple Roadmap tasks and establish dependency relationships.

<meta>
		<style>Strategic, Analytical, Structured</style>
		<language>English</language>
		<principles>
			Brief-Driven: Core input is user-provided Scope Brief, do not fabricate tasks without evidence.
			Incremental: Append to existing Roadmap, do not rewrite existing tasks.
			Minimal Questions: Only ask about information gaps; when Brief is sufficient can skip questions and decompose directly.
		</principles>
</meta>

<step_0_ingest>
1. Parse parameters passed from router:
   - If `.md` file path → Read that file
   - If empty → Search `scope-brief.md` sequentially (project root), `[[__DOCS_DIR__]]/scope-brief.md`
   - If natural language requirement (router judged as case 6) and above files don't exist → Jump to `<fallback_interview>`, pass natural language as context input
   - If file exists but empty → Jump to `<fallback_interview>`
2. Parse Brief sections, extract: requirement name and description, task list, existing design decisions, boundaries and constraints, affected existing tasks, reference materials.

> Brief is one-time input file, user can delete after processing.

Output: Internal summary (not to user), enter `<step_1_load>`.
</step_0_ingest>

<step_1_load>
1. **Load**: Read project context (vision, roadmap, tech_stack, map), see 00_system.md data governance rules.
2. **Scan Tasks**: Scan tasks/ directory — Understand existing Task summaries (title + key flows, no need full text).

Output: Internal context summary, enter `<step_2_analysis>`.
</step_1_load>

<step_2_analysis>
**Input**: Step 0 Brief parse result + Step 1 project context.

1. **Vision alignment check**: Does Brief requirement align with vision.md north star? Deviation → Mark `[Vision Deviation Warning]`
2. **Task list completeness**: Is it sufficient to support requirement goal?
3. **Impact assessment**: "Affected existing tasks" in Brief → Verify against roadmap/tasks
4. **Gap identification**: Does Brief have key missing information?
5. **Linkage check**:
   [[SUBAGENT: archi-feature-relations | mode: check, context: Semantically compare new task description with featureRelations sources, output linkage prompt when hit]]
   [[NO-SUBAGENT: archi-feature-relations | mode: check, context: Semantically compare new task description with featureRelations sources, output linkage prompt when hit]]
   [[NO-SKILL: Read skills/archi-feature-relations/SKILL.md and execute per mode: check logic]]

**Gap classification**: Required → Cannot decompose | Can supplement → AI can infer for confirmation | Recommended → AI decides

**Decision**: No "Required"+"Can supplement" gaps → Skip Step 3; Has gaps → Enter Step 3

Output SCOPE BRIEF analysis report to user: Requirement name / Estimated scale / Vision alignment status / Confirmed info / Affected existing tasks table (task / status / estimated impact) / (If hit) Linkage prompt table / Information gaps / AI auto-decided items. Enter step_3_supplementary (has gaps) or step_4_decompose (no gaps).
</step_2_analysis>

<step_3_supplementary>
Only executed when Step 2 finds "Required" or "Can supplement" level gaps. Question limit 3.

[[SKILL: archi-interview-protocol | Ask questions per skill's core rules and standard output format]]
[[NO-SKILL: Read skills/archi-interview-protocol/SKILL.md and execute per its rules]]
</step_3_supplementary>

<step_4_decompose>
**Input**: Brief full text + project context + supplementary answers (if any).

[[SUBAGENT: archi-decompose-roadmap | brief_data + existing_roadmap[[WHEN: ui | + ui_context]] ]]
[[NO-SUBAGENT: archi-decompose-roadmap | brief_data + existing_roadmap[[WHEN: ui | + ui_context]]]]
[[NO-SKILL: Read skills/archi-decompose-roadmap/SKILL.md and execute per its protocol, input brief_data + existing_roadmap[[WHEN: ui | + ui_context]], produce appended tasks]]

**Display format** (Convert Skill output to following format, present to user and wait for confirmation):

```
#### Phase 1: Infrastructure
| ID | Title | Description Summary | Tags |
|:---|:---|:---|:---|

#### Phase 2: Core Features
| ID | Title | Description Summary | Dependencies | Tags |
|:---|:---|:---|:---|:---|

#### Execution Batches (Parallel execution batches)
Batch 1 (Can start immediately): ...
Batch 2 (Wait for Batch 1 all complete): ...

#### NFR Cross-cutting Concerns (Merged, not in Roadmap)
- [NFR name] → Inject into [Task ID] | Impact: [Other Task IDs]
```

**Gate**: User replies **OK** then enter step_5_roadmap_update; without confirmation do not write Roadmap.
</step_4_decompose>

<step_4_5_refinement>
**Trigger**: User reply is not OK, contains merge/split/add/delete/dependency adjustment corrections.

Incorporate user feedback, refresh decomposition plan and re-output, wait for re-confirmation. User replies OK → Enter step_5_roadmap_update.
</step_4_5_refinement>

<step_5_roadmap_update>
**Input**: User-confirmed decomposition plan.

1. Append new tasks to corresponding Phase's `tasks` array in roadmap.json
2. If new Phase needed → Append to `phases` array
3. Update `lastUpdated`
4. (New modules) Update map.json `directoryMapping`: Pre-register inferred module paths for new tasks

**Terminal Gate** (Do not skip): Standard check (task --check + render).

Output: Write confirmation. Enter step_6_signoff.
</step_5_roadmap_update>

<step_6_signoff>
**Pre-signoff Checklist** (Verify item by item before output):
□ Decomposition plan has explicit user confirmation (replied OK before writing to roadmap — step_4 Gate)
□ roadmap.json — Tasks appended (not overwritten), lastUpdated updated
□ (Has new modules) map.json directoryMapping + logicalTopology — New task module paths pre-registered
□ featureRelations — If new task involves related impact of existing files, synced update
□ step_5 Terminal Gate — task --check + render passed

Gate must complete in step_5. After checklist all pass:
1. Run `npx archi task` to output task progress overview
2. Output summary

**Output**: Requirement decomposition summary, containing:
- **Brief source confirmation**: Requirement name and core goal
- **New tasks**: Count and Phase distribution
- **Impact on existing tasks**: Impact list (if any)
- **Next Steps**:

| Priority | Action | Description |
|:---|:---|:---|
[[WHEN: ui | | Recommended | `/archi.ui` | Incrementally update UI concept design for new tasks (`screens/` directory) | ]]
| 1 | `/archi.plan <first pending task ID>` | Deep planning for first executable task (router will dispatch to detail subprotocol) |
| 2 | Review roadmap | Confirm dependencies and priorities |
</step_6_signoff>

<fallback_interview>
**Trigger**: Brief file doesn't exist or is empty, or user entered via natural language description.

1. Tell user will clarify requirements through dialogue. Suggest:
   - Run `npx archi template scope-brief` to get template to project root
   - Fill and re-run `/archi.plan scope-brief.md`
   - Or continue dialogue, provide info through interview
2. If user chooses to continue dialogue, guide by following dimensions (skip known info, 1-2 questions per dimension):
   a. **Motivation & Goal**: Why do this? What problem to solve? What effect to achieve?
   b. **Scope**: What features/modules included? What not included?
   c. **Task split**: Do you have a rough task breakdown in mind? (If not, AI will do it in step_3)
   d. **Constraints**: Technical limits, time constraints, dependencies?
   e. **Impact**: Which existing features will be affected?
3. After collection, organize info into `brief_data` and write to `scope-brief.md` (project root), format follows scope-brief template structure
4. Tell user brief generated, then return to `<step_0_ingest>` to parse and validate that file; after validation pass, enter `<step_1_load>`
</fallback_interview>
</protocol_plan_decompose>
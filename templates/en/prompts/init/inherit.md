<protocol_inherit>
**Trigger**: `/archi.init` routed to this file (detected existing source code)
**Phase**: Legacy Adoption
**Goal**: Reverse analyze existing code repository, fill framework document skeleton with analysis results, bring project under management. Optionally provide Brief to supplement vision/roadmap.

<meta>
		<style>Analytical, Evidence-Based</style>
		<language>English</language>
		<principles>
			Code-Driven: Code is the only source of truth, do not fabricate functionality without evidence.
			Subagent Offloading: All code analysis executes in archi-code-survey independent context, main agent does not read source code.
		</principles>
</meta>

<step_0_optional_brief>
Executed when caller passes `brief_path` or default brief file is detected; otherwise set `has_brief=false` and go directly to step_1.

[[SUBAGENT: archi-brief-scan | Parse brief_path, scan resources, output brief_data + asset_inventory + unreachable]]
[[NO-SUBAGENT: archi-brief-scan | Parse brief_path, scan resources, output brief_data + asset_inventory + unreachable]]
[[NO-SKILL: Read skills/archi-brief-scan/SKILL.md and execute самостоятельно]]

Takeover:
- `unreachable` non-empty → Output reachability report, wait for user choice
- Set `has_brief = (status == "ok")`; brief_data / asset_inventory injected into context
- Enter step_1
</step_0_optional_brief>

<step_1_code_survey>
[[SUBAGENT: archi-code-survey | Execute coarse-read/fine-read/term-extraction three-phase analysis on project root, output code_analysis structured report]]
[[NO-SUBAGENT: archi-code-survey | Execute coarse-read/fine-read/term-extraction three-phase analysis on project root, output code_analysis structured report]]
[[NO-SKILL: Read skills/archi-code-survey/SKILL.md and execute per 1a/1b/1c three phases; large repos may exceed context window]]

Takeover:
1. Output code_analysis summary as structured analysis report (project overview / tech stack / architecture patterns / feature module list / shared infrastructure / domain terms / AI uncertain items)
2. **Gate**: User confirms or corrects; without confirmation do not enter step_2
</step_1_code_survey>

<step_2_supplementary>
Executed only when step_1 has items AI cannot determine. Skip if no ambiguity.

[[SKILL: archi-interview-protocol | Ask questions about ambiguous items, each question 3-5 options + `[Z] Custom`, total questions ≤ 3]]
[[NO-SKILL: Read skills/archi-interview-protocol/SKILL.md and execute самостоятельно]]
</step_2_supplementary>

<step_3_constitution>
[[SUBAGENT: archi-constitution-draft | Context passes brief_data (step_0, null when has_brief=false) + code_analysis (step_1) + feature_tags (architext.json). AI adapts data source matrix corresponding column based on whether brief_data is null. Output writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SUBAGENT: archi-constitution-draft | Context passes brief_data (step_0, null when has_brief=false) + code_analysis (step_1) + feature_tags (architext.json). AI adapts data source matrix corresponding column based on whether brief_data is null. Output writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SKILL: Read skills/archi-constitution-draft/SKILL.md and execute самостоятельно]]
</step_3_constitution>

<step_4_verify>
[[SUBAGENT: archi-silent-audit | mode: init, review global files generated in step_3 (vision, tech_stack, roadmap, map, dictionary, stub specs etc)]]
[[NO-SUBAGENT: archi-silent-audit | mode: init, review global files generated in step_3 (vision, tech_stack, roadmap, map, dictionary, stub specs etc)]]
[[NO-SKILL: Read skills/archi-silent-audit/SKILL.md and execute per mode: init review dimension table]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_signoff>
[[INCLUDE: prompts/init/shared/signoff-common.md]]

## inherit mode signoff

Additional checklist:
□ Each LEG-xx has `tasks/LEG-xx_<Slug>/spec.md` (Stub format, with associated file list)
□ Stub coverage report — Output "N/M LEG tasks in Stub status"; read modules + importedBy from context code_analysis, recommend Top 3 core modules by dependency count

After completion, output signoff summary to user:
- Title line: Legacy adoption complete
- Six body paragraphs: Project overview (features / file count / line count / core module count) / Legacy function table (LEG-xx ID + name + source location + Spec status) / Stub coverage (N/M + Top 3 recommendations) / AI completion items (layered by confidence) / Next Steps
- Next Steps list: First recommend `/archi.change LEG-xx <fill core module spec>`; optional `/archi.plan <file>` plan new feature / `/archi.plan <ID>` single task planning
[[WHEN: ui | First recommendation changed to `/archi.ui` (UI project Adopt mode prioritizes generating screens/ directory) ]]
</step_5_signoff>
</protocol_inherit>
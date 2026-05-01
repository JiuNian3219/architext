<protocol_kickoff>
**Trigger**: `/archi.init` routed to this file (has brief no source code)
**Phase**: Strategic Initialization
**Goal**: Establish project constitution based on Brief (vision / tech_stack / roadmap / map etc)

<meta>
		<style>Strict, CLI-like</style>
		<language>English</language>
		<principles>
			Brief-Driven: Brief is the only source of truth, do not fabricate tasks without evidence.
			Minimal Questions: Only ask about information gaps; when Brief is sufficient, generate directly.
			Respect User Input: User-filled choices in Brief are adopted directly, do not question or replace.
		</principles>
</meta>

<step_0_brief_scan>
[[SUBAGENT: archi-brief-scan | Parse brief_path, scan brief-assets/ and external reference reachability, return brief_data / asset_inventory / unreachable]]
[[NO-SUBAGENT: archi-brief-scan | Parse brief_path, scan brief-assets/ and external reference reachability, return brief_data / asset_inventory / unreachable]]
[[NO-SKILL: Read skills/archi-brief-scan/SKILL.md and execute самостоятельно]]

Takeover:
- `unreachable` non-empty → Output reachability report, ask user [A] Skip / [B] Alternative resource / [C] Abort
- `status == no_brief` → Stop, prompt to run `npx archi init` first to generate template
- Other → Enter step_1
</step_0_brief_scan>

<step_1_gap_analysis>
Input: `brief_data` returned from step_0.
Check Brief completeness per following table, identify gaps:

| Check Item | Judgment Standard | Level |
|:---|:---|:---|
| identity | projectName + oneLiner + problemStatement all present | Required |
| targetUsers | At least one core user role description | Required |
| coreTasks | ≥ 2 tasks and each has description | Required |
| techStack core | language/runtime + core framework all present | Required |
| techStack optional | Database / ORM / CSS / deployment etc | Can supplement |
| existingResources | Design specs / brand / existing APIs / third-party services | Can supplement |
| styleTone | ui project style / cli output style / api doc approach | Can supplement |
| boundaries | ≥ 1 anti-goal or hard constraint | Recommended |
| successMetrics | Specific quantifiable metrics | Recommended |
| references | ≥ 1 reference project | Recommended |

Level actions: Required → Must ask; Can supplement → AI recommends for user confirmation; Recommended → AI infers.

No "Required + Can supplement" gaps → Skip step_2; otherwise enter step_2.

Output: Brief analysis report, containing project name / featureTags / confirmed info / gap list / AI completion items.
</step_1_gap_analysis>

<step_2_supplementary>
Only executed when step_1 has "Required" or "Can supplement" gaps.
Question count = min(Required × 1.5 + Can supplement × 0.5, 6).

[[SKILL: archi-interview-protocol | Ask questions per protocol]]
[[NO-SKILL: Read skills/archi-interview-protocol/SKILL.md and execute самостоятельно]]
</step_2_supplementary>

<step_3_constitution>
[[SUBAGENT: archi-constitution-draft | Context passes brief_data (step_0) + feature_tags (architext.json); no source code so code_analysis=null. Output writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SUBAGENT: archi-constitution-draft | Context passes brief_data (step_0) + feature_tags (architext.json); no source code so code_analysis=null. Output writtenFiles / aiAugmentedFields / ambiguities]]
[[NO-SKILL: Read skills/archi-constitution-draft/SKILL.md and execute самостоятельно]]
</step_3_constitution>

<step_4_verify>
[[SUBAGENT: archi-silent-audit | mode: init, review global files generated in step_3 (vision, tech_stack, roadmap, dictionary etc)]]
[[NO-SUBAGENT: archi-silent-audit | mode: init, review global files generated in step_3 (vision, tech_stack, roadmap, dictionary etc)]]
[[NO-SKILL: Read skills/archi-silent-audit/SKILL.md, and execute in current context per mode: init review dimension table]]

[[INCLUDE: shared/verify-result-handling.md]]
</step_4_verify>

<step_5_signoff>
[[INCLUDE: prompts/init/shared/signoff-common.md]]

After executing signoff-common, output signoff summary to user:
- Title line: Project initialization complete
- Four body paragraphs: Key decisions adopted from Brief / AI completion items (with reasons) / Roadmap (total tasks + phase distribution) / Next Steps
- Next Steps list: First recommend `/archi.plan INF-01`; optional `/archi.plan <scope-brief.md>`
[[WHEN: ui | First recommendation changed to `/archi.ui` (UI project prioritizes generating screens/ directory) ]]
</step_5_signoff>
</protocol_kickoff>
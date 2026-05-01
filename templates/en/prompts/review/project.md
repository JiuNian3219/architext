<protocol_review_project>
**Trigger**: Dispatched by prompts/review.md router (/archi.review [context], no <ID>)
**Goal**: Project-level health check. Read-Only, only write reviews/YYYY-MM-DD.md report file.

<meta>
  <style>Investigative, Holistic, Evidence-Based</style>
  <language>English</language>
  <principles>
    Read-Only: Do not modify any code and documents (only write reviews/YYYY-MM-DD.md).
    Evidence-Based: Each finding must have path and specific evidence.
    No Re-routing: When map drift detected only report drift count, suggest user run /archi.review map; this protocol does not auto cross into map sync flow.
    Vision Anchored: Always use vision.md as direction baseline.
    IDE-Native First: Leverage IDE native capabilities to drive execution rhythm.
  </principles>
</meta>

<step_1_load>
Load:
- vision.md / roadmap.json / map.json / tech_stack.md
- dictionary.json / error_codes.json (governance consistency reference)
- Scan tasks/ directory structure (don't deep-read all task code, only sample)
- Project code entry files and key modules (sample-style read)

Output health check scope and context list, enter step_2.
</step_1_load>

<step_2_review>
Check item by item, output finding list.

| # | Check Item | Description | Evidence Source |
|---|---|---|---|
| 1 | Vision drift | Is roadmap.json task direction consistent with vision.md | roadmap × vision comparison |
| 2 | Architecture map drift | Is map.json consistent with actual directory structure; only output drift count (detailed classification via /archi.review map) | Directory scan vs map.json |
| 3 | Roadmap health | Consistency + Progress stats + Long-blocked + Dependency cycle detection | roadmap.json analysis |
| 4 | Document completeness | Does each active / done Task have spec.md + plan.json; spec.md status determination (see below); Any orphan directories | tasks/ scan |
| 5 | Tech Stack global compliance | Spot-check key entries and modules, compare against tech_stack.md | Code sampling |
| 6 | Cross-Task consistency | Duplicate logic, naming conflicts, interface inconsistency | Dictionary reverse lookup + code sampling |
| 7 | Orphan .gitkeep | Directory has other files but .gitkeep still exists | Directory scan |

### Check Item #4 Embedded — Spec Status Batch Determination

(Project-level batch perspective, distinct from change/shared/spec-status-check single task perspective, directly embed per decision, not INCLUDE.)

For each active / done Task, determine spec.md status:

| Status | Determination Rule | Handling |
|---|---|---|
| **Real** | File exists and contains at least 2 of "Scenarios" / "Edge Cases" / "Errors" key paragraphs | Pass |
| **Stub** | File exists but < 200 chars / Only frontmatter / Only TODO placeholder | List in WARNING |
| **Missing** | File doesn't exist | List in CRITICAL |

Output Stub / Missing list (sorted by Task priority), do not fix, as findings into step_3 classification.

### Deep Review Recommendations

After scan complete, list Tasks recommended for deeper review:
- done but plan not fully complete
- Large code volume but no tests
- Long active (> 30 days no progress)

Output format: "Recommend running /archi.review <ID> for deep review — Reason: xxx".
</step_2_review>

<step_3_classify>
[[INCLUDE: prompts/review/shared/issue-classification.md]]

[[INCLUDE: prompts/review/shared/action-routing.md]]
</step_3_classify>

<step_4_report>
**Pre-signoff Checklist** (Verify item by item before writing file):
□ All 7 check items evaluated, inapplicable items marked N/A
□ Each CRITICAL / WARNING finding has path and evidence
□ Stub / Missing spec list generated (if any)
□ Deep review recommendation list generated
□ map drift count recorded (detailed classification via /archi.review map)
□ Report structure: Health overview → Finding list → Stub/Missing list → Deep review recommendations → Next Steps

[[INCLUDE: prompts/review/shared/report-persistence.md]]

Write path: `[[__DOCS_DIR__]]/reviews/YYYY-MM-DD.md` (Archive by date)

Output health report (both to dialogue and write file) + Next Steps:

| Trigger Condition | Recommended Action | Description |
|---|---|---|
| map drift ≥ 1 | /archi.review map | Sync architecture map (crossing read-write boundary requires user explicit initiation) |
| Stub / Missing spec exists | /archi.change <ID> [Fill spec description] | Route to edit subprotocol to complete docs |
| Deep review candidate ≥ 1 | /archi.review <ID> | Task-level deep review |
| Vision drift | /archi.change [Global adjustment description] | Route to revise subprotocol |
</step_4_report>

</protocol_review_project>
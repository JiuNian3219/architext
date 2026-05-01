# Applicable Scenarios

- edit sub-protocol main flow: Single task spec / ui / plan sync update.
- revise sub-protocol Phase 2: Apply this flow to each affected Task.

# Cascade Update Actions

## Update spec.md

- Modify Gherkin Scenarios / interface definitions / constraint conditions per context (edit scenario) or global change impact (revise scenario).
- Preserve frontmatter, do not destroy Spec-Status / creation date and other metadata.
- Changes must leave trace: Append a line in spec.md end "Change Log" section: <Date> | <sub-protocol> | <change summary>.

[[WHEN: ui |
## Sync ui.md + screens/

`screens/` remains UI concept draft and acceptance reference; this flow can update reference files but cannot require subsequent coding to directly copy its HTML/CSS/JS.

Dispatch by change type:

| Change Type | Determination Criteria | Handling |
|---|---|---|
| No screen impact | Only logic/data/contract changes | Only modify spec.md |
| Minor UI adjustment | New/modified states, modals, local areas | [[SKILL: archi-ui-wireframe | Local update mode]] [[NO-SKILL: (Please read [[__DOCS_DIR__]]/skills/archi-ui-wireframe/SKILL.md, and execute in current context per its protocol)]]; Output MODIFIED: screens/S-XX.html |
| Screen structure change | Layout refactor, new screens, navigation changes | Same as above, structural change |
| Feature reduction | Entire screen/area removed | Same as above; Output REMOVED: screens/S-XX.html |
]]

## Append plan.json Phase

[[INCLUDE: prompts/change/shared/plan-phase-append.md]]

# Output Contract

- Output MODIFIED: <file> — <summary> for each modified file.
- After one complete cascade, output that Task's update summary table (spec / ui / plan / status).
/** @fileoverview featureRelations 变更联动索引静态测试。 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function readTemplate(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("featureRelations prompt hooks", () => {
  it("中英文 map guide 均描述 source/targets 变更联动语义", () => {
    for (const lang of ["zh", "en"]) {
      const guide = readTemplate(`templates/${lang}/global/guides/map.md`);
      expect(guide).toContain("featureRelations[]");
      expect(guide).toContain("source");
      expect(guide).toContain("targets");
      expect(guide).toContain("checkRule");
      expect(guide).toContain("evidence");
    }
  });

  it("archi-feature-relations 不再使用旧 aggregator/sources 契约", () => {
    for (const lang of ["zh", "en"]) {
      const skill = readTemplate(
        `templates/${lang}/skills/archi-feature-relations/SKILL.md`,
      );
      expect(skill).toContain("id/source/targets/checkRule/evidence");
      expect(skill).toContain("change-coupling");
      expect(skill).not.toContain("aggregator/sources/evidence/checkNote");
      expect(skill).not.toContain("AGGREGATOR REGISTERED");
    }
  });

  it("code/change/init/detail/review map 均包含 source/targets 联动钩子", () => {
    const files = [
      "prompts/code.md",
      "prompts/change/shared/data-sync-trigger.md",
      "prompts/init/shared/constitution-files.md",
      "prompts/plan/detail.md",
      "prompts/review/map.md",
    ];

    for (const lang of ["zh", "en"]) {
      for (const file of files) {
        const content = readTemplate(`templates/${lang}/${file}`);
        expect(content, `${lang}/${file}`).toContain("featureRelations");
        expect(content, `${lang}/${file}`).toContain("source");
        expect(content, `${lang}/${file}`).toContain("targets");
      }
    }
  });
});

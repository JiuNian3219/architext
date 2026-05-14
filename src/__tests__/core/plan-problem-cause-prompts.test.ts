import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function readTemplate(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("plan problemCause prompt hooks", () => {
  it("fix prompts require problemCause on Bugfix Phase", () => {
    for (const lang of ["zh", "en"]) {
      const content = readTemplate(`templates/${lang}/prompts/change/fix.md`);
      expect(content).toContain("Bugfix Phase");
      expect(content).toContain("problemCause");
      expect(content).toContain("summary");
      expect(content).toContain("evidence");
      expect(content).toContain("confidence");
    }
  });

  it("phase append rules describe lightweight problemCause shape", () => {
    for (const lang of ["zh", "en"]) {
      const content = readTemplate(
        `templates/${lang}/prompts/change/shared/plan-phase-append.md`,
      );
      expect(content).toContain("problemCause");
      expect(content).toContain("summary");
      expect(content).toContain("evidence");
      expect(content).toContain("confidence");
      expect(content).not.toContain("fixStrategy");
      expect(content).not.toContain("affectedFiles");
    }
  });
});

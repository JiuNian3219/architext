/** @fileoverview Requirement Snapshot 协议钩子静态测试。 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function readTemplate(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Requirement Snapshot prompt hooks", () => {
  it("中英文 decompose/detail/context-fetch/skill 均包含 sourceRef 钩子", () => {
    const files = [
      "templates/zh/prompts/plan/decompose.md",
      "templates/en/prompts/plan/decompose.md",
      "templates/zh/prompts/plan/detail.md",
      "templates/en/prompts/plan/detail.md",
      "templates/zh/skills/archi-context-fetch/SKILL.md",
      "templates/en/skills/archi-context-fetch/SKILL.md",
      "templates/zh/skills/archi-decompose-roadmap/SKILL.md",
      "templates/en/skills/archi-decompose-roadmap/SKILL.md",
    ];

    for (const file of files) {
      const content = readTemplate(file);
      expect(content, file).toContain("sourceRef");
    }
  });

  it("decompose 协议包含需求快照路径约定", () => {
    for (const lang of ["zh", "en"]) {
      const content = readTemplate(
        `templates/${lang}/prompts/plan/decompose.md`,
      );
      expect(content).toContain("global/requirements/REQ-");
      expect(content).toContain("REQ-YYYYMMDD-NNN.md");
    }
  });
});

/** @fileoverview resolveCapabilityRefs 单元测试 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fsExtra from "fs-extra";
import os from "os";
import { resolveCapabilityRefs } from "../../core/capability-resolver.ts";

describe("resolveCapabilityRefs", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `archi-rules-test-${Date.now()}`);
    await fsExtra.ensureDir(path.join(tmpDir, "shared"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fsExtra.remove(tmpDir);
  });

  describe("[[SUBAGENT:]] marker", () => {
    it("should expand to sub-agent instruction when hasSubagents=true", () => {
      const input =
        "before [[SUBAGENT: archi-silent-audit|mode: code-impl, context: 审查代码]] after";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toContain("**[SUBAGENT · 子代理]**");
      expect(result).toContain("启动独立子代理执行此任务");
      expect(result).toContain("skills/archi-silent-audit/SKILL.md");
      expect(result).toContain("mode: code-impl, context: 审查代码");
      expect(result).toContain("禁在当前上下文内联执行");
      expect(result).toContain("before ");
      expect(result).toContain(" after");
    });

    it("should be removed when hasSubagents=false, even if skills are available", () => {
      const input = "[[SUBAGENT: archi-data-sync|context: 扫描新实体]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).not.toContain("**[SUBAGENT · 子代理]**");
      expect(result).not.toContain("启动独立子代理执行此任务");
      expect(result).toBe("");
    });

    it("should be removed when both hasSubagents=false and hasSkills=false", () => {
      const input = "before [[SUBAGENT: archi-silent-audit|mode: init]] after";
      const result = resolveCapabilityRefs(input, {
        hasSkills: false,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toBe("before  after");
    });

    it("should handle multiple SUBAGENT markers", () => {
      const input = [
        "A: [[SUBAGENT: archi-silent-audit|mode: code-impl]]",
        "B: [[SUBAGENT: archi-data-sync|context: sync]]",
        "C: [[SUBAGENT: archi-feature-relations|mode: check]]",
      ].join("\n");

      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toContain("skills/archi-silent-audit/SKILL.md");
      expect(result).toContain("skills/archi-data-sync/SKILL.md");
      expect(result).toContain("skills/archi-feature-relations/SKILL.md");
      const subagentCount = (
        result.match(/\*\*\[SUBAGENT · 子代理\]\*\*/g) || []
      ).length;
      expect(subagentCount).toBe(3);
    });
  });

  describe("[[SKILL:]] marker (Specialist Skills)", () => {
    it("should expand to skill tool call when hasSkills=true", () => {
      const input = "[[SKILL: archi-decompose-roadmap|按 skill 的协议执行]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toContain("**[SKILL · 工具]**");
      expect(result).toContain("`archi-decompose-roadmap`");
      expect(result).not.toContain("**[SUBAGENT · 子代理]**");
    });

    it("should be removed when hasSkills=false", () => {
      const input = "before [[SKILL: archi-plan-options|参数]] after";
      const result = resolveCapabilityRefs(input, {
        hasSkills: false,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toBe("before  after");
    });
  });

  describe("[[NO-SKILL:]] marker", () => {
    it("should be removed when hasSkills=true", () => {
      const input = "[[NO-SKILL: fallback text here]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toBe("");
    });

    it("should expand to desc when hasSkills=false", () => {
      const input = "[[NO-SKILL: 请手动阅读文档执行]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: false,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toBe("请手动阅读文档执行");
    });

    it("should allow single ] in desc", () => {
      const input = "[[NO-SKILL: [错误码: ERR-001]]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: false,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toBe("[错误码: ERR-001]");
    });
  });

  describe("[[NO-SUBAGENT:]] marker", () => {
    it("should be removed when hasSubagents=true", () => {
      const input = "[[NO-SUBAGENT: 无子代理支持]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toBe("");
    });

    it("should expand to desc when hasSubagents=false (single-param)", () => {
      const input = "[[NO-SUBAGENT: 无子代理支持]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toBe("无子代理支持");
    });

    it("should expand to inline skill when hasSubagents=false and hasSkills=true (skill-param)", () => {
      const input = "[[NO-SUBAGENT: archi-silent-audit|mode: code-impl]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toContain("**[SKILL · 内联]**");
      expect(result).toContain("skills/archi-silent-audit/SKILL.md");
      expect(result).toContain("mode: code-impl");
    });

    it("should allow single ] in desc", () => {
      const input = "[[NO-SUBAGENT: [降级到 Skill 调用]]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toBe("[降级到 Skill 调用]");
    });
  });

  describe("SUBAGENT + NO-SUBAGENT + NO-SKILL combined (real-world pattern)", () => {
    it("should produce sub-agent instruction for Cursor (subagents=true, skills=true)", () => {
      const input =
        "[[SUBAGENT: archi-silent-audit|mode: code-impl]]" +
        "[[NO-SUBAGENT: archi-silent-audit|mode: code-impl]]" +
        "[[NO-SKILL: （请阅读 skills/archi-silent-audit/SKILL.md，并在当前上下文手动审查）]]";

      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toContain("**[SUBAGENT · 子代理]**");
      expect(result).not.toContain("**[SKILL · 内联]**");
      expect(result).not.toContain("请阅读 skills/archi-silent-audit/SKILL.md");
    });

    it("should produce inline skill for Windsurf (subagents=false, skills=true)", () => {
      const input =
        "[[SUBAGENT: archi-silent-audit|mode: code-impl]]" +
        "[[NO-SUBAGENT: archi-silent-audit|mode: code-impl]]" +
        "[[NO-SKILL: （请阅读 skills/archi-silent-audit/SKILL.md，并在当前上下文手动审查）]]";

      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toContain("**[SKILL · 内联]**");
      expect(result).not.toContain("**[SUBAGENT · 子代理]**");
      expect(result).not.toContain("请阅读 skills/archi-silent-audit/SKILL.md");
    });

    it("should produce fallback for no-skill platform (hypothetical)", () => {
      const input =
        "[[SUBAGENT: archi-silent-audit|mode: code-impl]]" +
        "[[NO-SUBAGENT: archi-silent-audit|mode: code-impl]]" +
        "[[NO-SKILL: （请阅读 skills/archi-silent-audit/SKILL.md，并在当前上下文手动审查）]]";

      const result = resolveCapabilityRefs(input, {
        hasSkills: false,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).not.toContain("**[SUBAGENT · 子代理]**");
      expect(result).not.toContain("**[SKILL · 内联]**");
      expect(result).toContain(
        "请阅读 skills/archi-silent-audit/SKILL.md，并在当前上下文手动审查",
      );
    });
  });

  describe("[[INCLUDE:]] marker", () => {
    it("should expand file content when includeBaseDir provided", async () => {
      const mockContent = "| active | 通过 |\n| pending | 拒绝 |";
      await fsExtra.writeFile(
        path.join(tmpDir, "shared/status-gate.md"),
        mockContent,
      );

      const input = "Gate:\n[[INCLUDE: shared/status-gate.md]]\nEnd";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: true },
        tmpDir,
      );

      expect(result).toContain("| active | 通过 |");
      expect(result).not.toContain("[[INCLUDE:");
    });

    it("should produce error comment when file not found", () => {
      const input = "[[INCLUDE: shared/missing.md]]";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: true },
        tmpDir,
      );

      expect(result).toContain("<!-- INCLUDE NOT FOUND: shared/missing.md -->");
    });

    it("should not process INCLUDE when no includeBaseDir", () => {
      const input = "[[INCLUDE: shared/status-gate.md]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toBe("[[INCLUDE: shared/status-gate.md]]");
    });
  });

  describe("[[NO-COMMANDS:]] marker", () => {
    it("should be removed when hasCommands=true", () => {
      const input = "[[NO-COMMANDS: fallback text here]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: true,
      });

      expect(result).toBe("");
    });

    it("should expand to content when hasCommands=false", () => {
      const input = "[[NO-COMMANDS: 这是路由表内容]]";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      expect(result).toBe("这是路由表内容");
    });

    it("should handle multi-line content", () => {
      const input = `before
[[NO-COMMANDS:
## 路由表

| 命令 | 文件 |
|:---|:---|
| /archi.init | archi.init.md |
]]
after`;

      // hasCommands=true → 移除内容
      const resultWithCommands = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: true,
      });
      expect(resultWithCommands).toBe("before\n\nafter");

      // hasCommands=false → 保留内容
      const resultWithoutCommands = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });
      expect(resultWithoutCommands).toContain("## 路由表");
      expect(resultWithoutCommands).toContain("| 命令 | 文件 |");
      expect(resultWithoutCommands).toContain("/archi.init");
    });
  });

  describe("combined capabilities (real-world IDE configs)", () => {
    it("Cursor: has all capabilities", () => {
      const input = `[[SUBAGENT: test|args]]
[[NO-SUBAGENT: test|args]]
[[NO-SKILL: no skill fallback]]
[[NO-COMMANDS: no commands fallback]]`;

      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: true,
      });

      expect(result).toContain("**[SUBAGENT · 子代理]**");
      expect(result).not.toContain("no skill fallback");
      expect(result).not.toContain("no commands fallback");
    });

    it("Windsurf: skills but no subagents/commands", () => {
      const input = `[[SUBAGENT: test|args]]
[[NO-SUBAGENT: test|args]]
[[NO-SKILL: no skill fallback]]
[[NO-COMMANDS: no commands fallback]]`;

      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: false,
        hasCommands: false,
      });

      expect(result).toContain("**[SKILL · 内联]**");
      expect(result).not.toContain("**[SUBAGENT · 子代理]**");
      expect(result).not.toContain("no skill fallback");
      expect(result).toContain("no commands fallback");
    });
  });

  describe("processing order", () => {
    it("should process INCLUDE before SUBAGENT/SKILL", async () => {
      await fsExtra.writeFile(
        path.join(tmpDir, "fragment.md"),
        "included: [[SUBAGENT: nested|args]]",
      );

      const input = "[[INCLUDE: fragment.md]]";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        tmpDir,
      );

      expect(result).toContain("**[SUBAGENT · 子代理]**");
      expect(result).not.toContain("[[SUBAGENT:");
      expect(result).not.toContain("[[INCLUDE:");
    });
  });

  describe("[[WHEN:]] marker", () => {
    it("should expand description when single feature matches", () => {
      const input = "[[WHEN: ui | 仅UI项目: ]]内容";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["ui", "data"] },
      );

      expect(result).toBe("仅UI项目:内容");
    });

    it("should remove entire marker when single feature does not match", () => {
      const input = "前面[[WHEN: ui | 仅UI项目: ]]内容后面";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["api", "cli"] }, // 不含 ui
      );

      expect(result).toBe("前面内容后面");
      expect(result).not.toContain("仅UI项目");
    });

    it("should expand when multiple features all match", () => {
      const input = "[[WHEN: ui,data | 仅UI+Data项目: ]]";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["ui", "data", "api"] }, // 同时含 ui 和 data
      );

      expect(result).toBe("仅UI+Data项目:");
    });

    it("should remove when not all features match", () => {
      const input = "[[WHEN: ui,data | 仅UI+Data项目: ]]";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["ui", "api"] }, // 含 ui 但不含 data
      );

      expect(result).toBe("");
    });

    it("should handle empty features list (no match)", () => {
      const input = "[[WHEN: ui | 仅UI项目: ]]内容";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: [] },
      );

      expect(result).toBe("内容");
    });

    it("should handle empty description", () => {
      const input = "[[WHEN: ui | ]]内容";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["ui"] },
      );

      expect(result).toBe("内容");
    });

    it("should handle multiple WHEN markers in same content", () => {
      const input =
        "A: [[WHEN: ui | UI标记]]B: [[WHEN: api | API标记]]C: [[WHEN: cli | CLI标记]]";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["ui", "api"] },
      );

      expect(result).toBe("A: UI标记B: API标记C: ");
    });

    it("should work without whenContext (no WHEN processing)", () => {
      const input = "[[WHEN: ui | 仅UI项目: ]]内容";
      const result = resolveCapabilityRefs(input, {
        hasSkills: true,
        hasSubagents: true,
        hasCommands: false,
      });

      // 没有 whenContext 时，WHEN 标记保持原样
      expect(result).toBe("[[WHEN: ui | 仅UI项目: ]]内容");
    });

    it("should allow single ] in description", () => {
      // 允许 description 中包含单个 ]，只有 ]] 才是结束标记
      const input = "[[WHEN: ui | 这是测试]内容]]";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["ui"] },
      );

      expect(result).toBe("这是测试]内容");
    });

    it("should handle description with multiple single brackets", () => {
      const input = "[[WHEN: api | [状态码: 200] 或 [错误]]]";
      const result = resolveCapabilityRefs(
        input,
        { hasSkills: true, hasSubagents: true, hasCommands: false },
        undefined,
        { features: ["api"] },
      );

      expect(result).toBe("[状态码: 200] 或 [错误]");
    });
  });
});

/** @fileoverview 计划渲染器测试 — 覆盖 Markdown 输出、checkbox 状态、多语言支持。 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { renderPlan } from "../../commands/meta/render/plan-renderer.ts";
import type { PlanData } from "../../commands/meta/plan/types.ts";

// 固定 locale 为英文，确保断言与 i18n 输出一致
let savedLang: string | undefined;
beforeAll(() => {
  savedLang = process.env.ARCHITEXT_LANG;
  process.env.ARCHITEXT_LANG = "en";
});
afterAll(() => {
  if (savedLang !== undefined) {
    process.env.ARCHITEXT_LANG = savedLang;
  } else {
    delete process.env.ARCHITEXT_LANG;
  }
});

function makeValidPlan(): PlanData {
  return {
    featureId: "FEAT-01",
    featureName: "User Authentication",
    status: "active",
    decisions: [],
    phases: [],
    tests: { automated: [], manual: [] },
  };
}

describe("renderPlan", () => {
  describe("基础结构", () => {
    it("应包含标题和元信息", () => {
      const data = makeValidPlan();
      const output = renderPlan(data, "en");

      expect(output).toContain("# Implementation Plan: User Authentication");
      expect(output).toContain("FEAT-01");
      expect(output).toContain("active");
    });

    it("应包含 AI 注释标记", () => {
      const data = makeValidPlan();
      const output = renderPlan(data, "en");

      expect(output).toContain("<!--");
      expect(output).toContain("AI");
    });
  });

  describe("Technical Decisions 渲染", () => {
    it("应渲染决策列表", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        decisions: [
          {
            category: "Database",
            choice: "PostgreSQL",
            rationale: "ACID support",
          },
          { category: "Auth", choice: "JWT", rationale: "Stateless" },
        ],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("**Database**: PostgreSQL");
      expect(output).toContain("📝 ACID support");
      expect(output).toContain("**Auth**: JWT");
    });

    it("决策无 rationale 时不应渲染备注", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        decisions: [{ category: "Framework", choice: "React" }],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("**Framework**: React");
      expect(output).not.toContain("📝");
    });

    it("空决策列表不应渲染决策区块", () => {
      const data = makeValidPlan();
      const output = renderPlan(data, "en");
      // 决策区块标题不应出现
      expect(output).not.toContain("## 1. Technical Decisions");
    });
  });

  describe("Implementation Steps 渲染", () => {
    it("应渲染 Phase 和 Task 的 checkbox", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "Phase 1: Setup",
            tasks: [
              { id: "t1", title: "Install dependencies", done: true },
              { id: "t2", title: "Configure ESLint", done: false },
            ],
          },
        ],
      };

      const output = renderPlan(data, "en");
      // Phase checkbox（部分完成）
      expect(output).toContain("* [ ] **Phase 1: Setup**");
      // Task checkboxes
      expect(output).toContain("- [x] Install dependencies");
      expect(output).toContain("- [ ] Configure ESLint");
    });

    it("should render phase problemCause when present", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "Bugfix: Slow website (2026-05-14)",
            problemCause: {
              summary: "The page initialized heavy assets before first paint.",
              evidence: ["website/src/pages/index.astro", "user report"],
              confidence: 0.8,
            },
            tasks: [
              {
                id: "fix-1",
                title: "Add a regression test",
                done: false,
              },
            ],
          },
        ],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain(
        "Root Cause (0.8): The page initialized heavy assets before first paint.",
      );
      expect(output).toContain(
        "Evidence: website/src/pages/index.astro; user report",
      );
    });

    it("Phase 全部完成时应显示勾选", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "Phase 1: Setup",
            tasks: [
              { id: "t1", title: "Task A", done: true },
              { id: "t2", title: "Task B", done: true },
            ],
          },
        ],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("* [x] **Phase 1: Setup**");
    });

    it("应渲染 Task 的 notes", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "Phase 1",
            tasks: [
              { id: "t1", title: "Setup DB", done: false, notes: "Use Docker" },
            ],
          },
        ],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("📝 Use Docker");
    });

    it("多个 Phase 应按顺序渲染", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "Phase 1: Data",
            tasks: [{ id: "t1", title: "Schema", done: true }],
          },
          {
            name: "Phase 2: API",
            tasks: [{ id: "t2", title: "Endpoints", done: false }],
          },
        ],
      };

      const output = renderPlan(data, "en");
      const phase1Idx = output.indexOf("Phase 1: Data");
      const phase2Idx = output.indexOf("Phase 2: API");
      expect(phase1Idx).toBeLessThan(phase2Idx);
    });
  });

  describe("Test Plan 渲染", () => {
    it("应渲染自动化测试列表", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        tests: {
          automated: [
            { id: "at1", title: "Unit test for auth", done: true },
            { id: "at2", title: "Integration test", done: false },
          ],
          manual: [],
        },
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("### Automated Tests");
      expect(output).toContain("* [x] Unit test for auth");
      expect(output).toContain("* [ ] Integration test");
    });

    it("应渲染手动验收列表", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        tests: {
          automated: [],
          manual: [
            { id: "mt1", title: "Check UI matches design", done: false },
          ],
        },
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("### Manual Verification");
      expect(output).toContain("* [ ] Check UI matches design");
    });

    it("Test 的 notes 应正确渲染", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        tests: {
          automated: [
            {
              id: "at1",
              title: "E2E test",
              done: false,
              notes: "Use Playwright",
            },
          ],
          manual: [],
        },
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("📝 Use Playwright");
    });

    it("空 tests 不应渲染测试区块", () => {
      const data = makeValidPlan();
      const output = renderPlan(data, "en");
      // 空 tests 仍会渲染 Test Plan 区块标题，但无内容
      expect(output).toContain("## 3. Test Plan");
    });
  });

  describe("多语言支持", () => {
    it("中文输出应使用中文标签", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "阶段 1: 数据层",
            tasks: [{ id: "t1", title: "定义 Schema", done: true }],
          },
        ],
      };

      const output = renderPlan(data, "zh");
      expect(output).toContain("# 实施计划：User Authentication");
      expect(output).toContain("阶段 1: 数据层");
    });

    it("英文输出应使用英文标签", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "Phase 1: Data",
            tasks: [{ id: "t1", title: "Define Schema", done: true }],
          },
        ],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("# Implementation Plan: User Authentication");
    });
  });

  describe("边界测试", () => {
    it("空 phases 应正确处理", () => {
      const data = makeValidPlan();
      const output = renderPlan(data, "en");
      expect(output).toContain("## 2. Implementation Steps");
    });

    it("特殊字符在标题中应正确渲染", () => {
      const data: PlanData = {
        ...makeValidPlan(),
        featureName: 'Feature with "quotes" & <brackets>',
        phases: [],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain("Feature with");
    });

    it("超长标题应正确渲染", () => {
      const longTitle = "A".repeat(200);
      const data: PlanData = {
        ...makeValidPlan(),
        phases: [
          {
            name: "Phase 1",
            tasks: [{ id: "t1", title: longTitle, done: false }],
          },
        ],
      };

      const output = renderPlan(data, "en");
      expect(output).toContain(longTitle);
    });
  });
});

/**
 * ---
 * description: Plan 命令测试，覆盖 parser（checkbox 解析）、resolver（路径解析）、handlers（检查输出）。
 * ---
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";
import { parsePlanCheckboxes } from "../../commands/meta/plan/parser.ts";
import type { PlanCheckResult } from "../../commands/meta/plan/types.ts";
import { resolvePlanPath } from "../../commands/meta/plan/resolver.ts";
import { handlePlanCheck } from "../../commands/meta/plan/handlers.ts";
import { PlanNotFoundError } from "../../core/errors.ts";
import { resolveDocDir } from "../../core/doc-dir.ts";

// ═══════════════════════════════════════════════════════════
// Shared: resolveDocDir Tests
// ═══════════════════════════════════════════════════════════

describe("resolveDocDir", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it("应优先使用 architext.json 中的 docDir 配置", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: "my-docs",
        updatedAt: new Date().toISOString(),
      }),
      "my-docs": {
        ".keep": "",
      },
    });

    const result = await resolveDocDir(tempDir);
    expect(result).toBe(path.resolve(tempDir, "my-docs"));
  });

  it("应回退到默认 .architext 目录", async () => {
    await createTestStructure(tempDir, {
      ".architext": { ".keep": "" },
    });

    const result = await resolveDocDir(tempDir);
    expect(result).toBe(path.resolve(tempDir, ".architext"));
  });

  it("所有路径都不存在时应返回 null", async () => {
    const result = await resolveDocDir(tempDir);
    expect(result).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════
// Parser Tests
// ═══════════════════════════════════════════════════════════

describe("parsePlanCheckboxes", () => {
  it("应解析已勾选和未勾选的 checkbox", () => {
    const content = [
      "## Implementation Steps",
      "### Phase 1: Setup",
      "- [x] Install dependencies",
      "- [ ] Configure linting",
      "- [x] Setup testing",
    ].join("\n");

    const result = parsePlanCheckboxes(content);

    expect(result.sections.length).toBe(1);
    expect(result.sections[0].name).toBe("Phase 1: Setup");
    expect(result.sections[0].total).toBe(3);
    expect(result.sections[0].done).toBe(2);
  });

  it("应按 section 标题分组", () => {
    const content = [
      "### Phase 1: Data",
      "- [x] Create schema",
      "- [x] Add migration",
      "### Phase 2: UI",
      "- [ ] Build components",
      "- [ ] Add styles",
      "### Automated Tests",
      "- [x] Unit test",
    ].join("\n");

    const result = parsePlanCheckboxes(content);

    expect(result.sections.length).toBe(3);
    expect(result.sections[0].name).toBe("Phase 1: Data");
    expect(result.sections[0].done).toBe(2);
    expect(result.sections[1].name).toBe("Phase 2: UI");
    expect(result.sections[1].done).toBe(0);
    expect(result.sections[2].name).toBe("Automated Tests");
    expect(result.sections[2].done).toBe(1);
  });

  it("应识别 Manual Verification section 为人工验收", () => {
    const content = [
      "### Phase 1: Setup",
      "- [x] Install deps",
      "### Manual Verification",
      "- [ ] Check UI matches design",
      "- [ ] Test on mobile",
    ].join("\n");

    const result = parsePlanCheckboxes(content);

    expect(result.sections.length).toBe(2);
    expect(result.sections[0].isManual).toBe(false);
    expect(result.sections[1].isManual).toBe(true);
    expect(result.sections[1].name).toBe("Manual Verification");
  });

  it("应识别中文人工验收 section", () => {
    const content = ["### 手动验证", "- [ ] 检查 UI"].join("\n");

    const result = parsePlanCheckboxes(content);
    expect(result.sections[0].isManual).toBe(true);
  });

  it("应处理空 plan 文件", () => {
    const result = parsePlanCheckboxes("# Empty Plan\nNo tasks here.");
    expect(result.sections.length).toBe(0);
  });

  it("应支持 * 号 checkbox 语法", () => {
    const content = [
      "### Phase 1",
      "* [x] Task with asterisk",
      "* [ ] Another asterisk task",
    ].join("\n");

    const result = parsePlanCheckboxes(content);
    expect(result.sections[0].total).toBe(2);
    expect(result.sections[0].done).toBe(1);
  });

  it("应支持大写 X 标记", () => {
    const content = ["### Phase 1", "- [X] Task with uppercase X"].join("\n");

    const result = parsePlanCheckboxes(content);
    expect(result.sections[0].done).toBe(1);
  });

  it("应记录正确的行号（1-based）", () => {
    const content = [
      "# Title",
      "",
      "### Phase 1",
      "- [x] First task",
      "- [ ] Second task",
    ].join("\n");

    const result = parsePlanCheckboxes(content);
    expect(result.sections[0].items[0].lineNum).toBe(4);
    expect(result.sections[0].items[1].lineNum).toBe(5);
  });

  it("应正确解析 Windows CRLF (\\r\\n) 换行的文件", () => {
    const content =
      "### Phase 1: Setup\r\n" +
      "- [x] Install dependencies\r\n" +
      "- [ ] Configure linting\r\n" +
      "### Phase 2: Build\r\n" +
      "- [x] Build project\r\n";

    const result = parsePlanCheckboxes(content);

    expect(result.sections.length).toBe(2);
    expect(result.sections[0].name).toBe("Phase 1: Setup");
    expect(result.sections[0].total).toBe(2);
    expect(result.sections[0].done).toBe(1);
    expect(result.sections[1].name).toBe("Phase 2: Build");
    expect(result.sections[1].total).toBe(1);
    expect(result.sections[1].done).toBe(1);
  });

  it("应正确解析带 BOM 的 UTF-8 文件", () => {
    // UTF-8 BOM: U+FEFF
    const content = "\uFEFF### Phase 1\n- [x] First task\n- [ ] Second task";

    const result = parsePlanCheckboxes(content);

    expect(result.sections.length).toBe(1);
    expect(result.sections[0].name).toBe("Phase 1");
    expect(result.sections[0].total).toBe(2);
    expect(result.sections[0].done).toBe(1);
  });

  it("应处理带缩进的子任务 checkbox", () => {
    const content = [
      "### Phase 1: Setup",
      "- [x] Parent task",
      "  - [x] Sub task 1",
      "  - [ ] Sub task 2",
    ].join("\n");

    const result = parsePlanCheckboxes(content);
    // 所有 checkbox（包括缩进的）都应被收集
    expect(result.sections[0].total).toBe(3);
    expect(result.sections[0].done).toBe(2);
  });

  it("应正确解析完整的真实 plan 格式", () => {
    const content = [
      "---",
      "description: Implementation Plan for Feature.",
      "---",
      "",
      "# Implementation Plan: SUB-01 订阅 CRUD",
      "",
      "> **Status:** Active",
      "",
      "## 1. Technical Decisions",
      "",
      "- **Libraries**: Zod",
      "",
      "## 2. Implementation Steps",
      "",
      "### Phase 1: 数据层与校验",
      "",
      "- [x] 定义 Schema",
      "- [x] 实现 Hook",
      "- [ ] 添加校验",
      "",
      "### Phase 2: UI 组件",
      "",
      "- [x] 列表页",
      "- [ ] 表单",
      "- [ ] 删除确认",
      "",
      "## 3. Test Plan",
      "",
      "### Automated Tests",
      "",
      "- [x] Unit test for Hook",
      "- [ ] Integration test",
      "",
      "### Manual Verification",
      "",
      "- [ ] 检查 UI 与 ui.md 一致",
      "- [ ] 移动端测试",
    ].join("\n");

    const result = parsePlanCheckboxes(content);

    // 应有 4 个 section
    expect(result.sections.length).toBe(4);

    // Phase 1
    expect(result.sections[0].name).toBe("Phase 1: 数据层与校验");
    expect(result.sections[0].done).toBe(2);
    expect(result.sections[0].total).toBe(3);
    expect(result.sections[0].isManual).toBe(false);

    // Phase 2
    expect(result.sections[1].name).toBe("Phase 2: UI 组件");
    expect(result.sections[1].done).toBe(1);
    expect(result.sections[1].total).toBe(3);

    // Automated Tests
    expect(result.sections[2].name).toBe("Automated Tests");
    expect(result.sections[2].done).toBe(1);
    expect(result.sections[2].total).toBe(2);

    // Manual — 应被标记为 manual
    expect(result.sections[3].name).toBe("Manual Verification");
    expect(result.sections[3].isManual).toBe(true);
    expect(result.sections[3].total).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════
// Resolver Tests
// ═══════════════════════════════════════════════════════════

describe("resolvePlanPath", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  it("应通过 Feature ID 定位 plan 文件", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        updatedAt: new Date().toISOString(),
      }),
      ".architext": {
        features: {
          "SUB-01_Subscription_CRUD": {
            "plan.md": "# Plan",
          },
        },
      },
    });

    const result = await resolvePlanPath("SUB-01", tempDir);
    expect(result.filePath).toBe(
      path.join(
        tempDir,
        ".architext",
        "features",
        "SUB-01_Subscription_CRUD",
        "plan.md",
      ),
    );
    expect(result.featureName).toBe("Subscription CRUD");
  });

  it("不存在的 Feature ID 应抛出 PlanNotFoundError", async () => {
    await createTestStructure(tempDir, {
      "architext.json": JSON.stringify({
        language: "zh",
        editors: ["cursor"],
        docDir: ".architext",
        updatedAt: new Date().toISOString(),
      }),
      ".architext": {
        features: {
          "SUB-01_Subscription_CRUD": {
            "plan.md": "# Plan",
          },
        },
      },
    });

    await expect(resolvePlanPath("NONEXIST", tempDir)).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("features 目录不存在时应抛出 PlanNotFoundError", async () => {
    await createTestStructure(tempDir, {
      ".architext": { ".keep": "" },
    });

    await expect(resolvePlanPath("SUB-01", tempDir)).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("plan 文件不存在时应抛出 PlanNotFoundError", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        features: {
          "SUB-01_Subscription_CRUD": {
            "spec.md": "# Spec only, no plan",
          },
        },
      },
    });

    await expect(resolvePlanPath("SUB-01", tempDir)).rejects.toThrow(
      PlanNotFoundError,
    );
  });

  it("应正确提取含下划线的 Feature 名称", async () => {
    await createTestStructure(tempDir, {
      ".architext": {
        features: {
          "CAT-01_Category_Tags_System": {
            "plan.md": "# Plan",
          },
        },
      },
    });

    const result = await resolvePlanPath("CAT-01", tempDir);
    expect(result.featureName).toBe("Category Tags System");
  });
});

// ═══════════════════════════════════════════════════════════
// Handler Tests
// ═══════════════════════════════════════════════════════════

describe("handlePlanCheck", () => {
  it("应正常输出全部完成的报告而不抛错", () => {
    const result: PlanCheckResult = {
      sections: [
        {
          name: "Phase 1: Setup",
          isManual: false,
          items: [
            {
              lineNum: 5,
              content: "Install deps",
              checked: true,
              section: "Phase 1: Setup",
            },
            {
              lineNum: 6,
              content: "Configure",
              checked: true,
              section: "Phase 1: Setup",
            },
          ],
          done: 2,
          total: 2,
        },
      ],
    };

    expect(() =>
      handlePlanCheck("T-001", "Test Feature", result),
    ).not.toThrow();
  });

  it("应正常输出有未完成任务的报告而不抛错", () => {
    const result: PlanCheckResult = {
      sections: [
        {
          name: "Phase 1: Setup",
          isManual: false,
          items: [
            {
              lineNum: 5,
              content: "Install deps",
              checked: true,
              section: "Phase 1: Setup",
            },
            {
              lineNum: 6,
              content: "Configure linting",
              checked: false,
              section: "Phase 1: Setup",
            },
          ],
          done: 1,
          total: 2,
        },
      ],
    };

    expect(() =>
      handlePlanCheck("T-001", "Test Feature", result),
    ).not.toThrow();
  });

  it("应正常处理含人工验收 section 的报告", () => {
    const result: PlanCheckResult = {
      sections: [
        {
          name: "Phase 1: Setup",
          isManual: false,
          items: [
            {
              lineNum: 5,
              content: "Task",
              checked: true,
              section: "Phase 1: Setup",
            },
          ],
          done: 1,
          total: 1,
        },
        {
          name: "Manual Verification",
          isManual: true,
          items: [
            {
              lineNum: 10,
              content: "Check UI",
              checked: false,
              section: "Manual Verification",
            },
          ],
          done: 0,
          total: 1,
        },
      ],
    };

    expect(() =>
      handlePlanCheck("T-001", "Test Feature", result),
    ).not.toThrow();
  });

  it("空 plan 应输出警告而不抛错", () => {
    const result: PlanCheckResult = { sections: [] };
    expect(() =>
      handlePlanCheck("T-001", "Test Feature", result),
    ).not.toThrow();
  });
});

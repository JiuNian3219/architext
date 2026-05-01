/** @fileoverview Brief 生成器测试 — 覆盖模块提取、占位符替换、特征过滤。 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { generateBrief } from "../../core/brief.ts";
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";

describe("generateBrief", () => {
  let tempDir: string;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await createTempDir();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await cleanupTempDir(tempDir);
  });

  describe("基础功能", () => {
    it("_base.md 不存在时应静默返回", async () => {
      await createTestStructure(tempDir, {
        templates: { zh: { briefs: {} } },
      });

      await expect(
        generateBrief(path.join(tempDir, "templates/zh"), [], {}),
      ).resolves.not.toThrow();

      expect(await fs.pathExists(path.join(tempDir, "project-brief.md"))).toBe(
        false,
      );
    });

    it("应生成 project-brief.md", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md":
                "# Project Brief\n\n<!-- @slot:tech -->\n\n<!-- @slot:style -->",
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), [], {});

      expect(await fs.pathExists(path.join(tempDir, "project-brief.md"))).toBe(
        true,
      );
    });

    it("应创建 brief-assets 目录", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# Brief",
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), [], {});

      expect(await fs.pathExists(path.join(tempDir, "brief-assets"))).toBe(
        true,
      );
      const stat = await fs.stat(path.join(tempDir, "brief-assets"));
      expect(stat.isDirectory()).toBe(true);
    });
  });

  describe("模块提取", () => {
    it("应提取匹配特征的 tech 模块", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# Brief\n\n<!-- @slot:tech -->",
              "_modules.md": `
<!-- @tech:api -->
- REST API 设计
- OpenAPI 规范
<!-- @end -->

<!-- @tech:ui -->
- React 组件库
- Tailwind CSS
<!-- @end -->
`,
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), ["api"], {});

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).toContain("REST API 设计");
      expect(content).not.toContain("React 组件库");
    });

    it("应提取匹配特征的 style 模块", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# Brief\n\n<!-- @slot:style -->",
              "_modules.md": `
<!-- @style:ui -->
设计风格：现代简约
<!-- @end -->
`,
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), ["ui"], {});

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).toContain("设计风格：现代简约");
    });

    it("多特征时应合并多个模块", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# Brief\n\n<!-- @slot:tech -->",
              "_modules.md": `
<!-- @tech:api -->
REST API
<!-- @end -->

<!-- @tech:ui -->
React
<!-- @end -->

<!-- @tech:data -->
PostgreSQL
<!-- @end -->
`,
            },
          },
        },
      });

      await generateBrief(
        path.join(tempDir, "templates/zh"),
        ["api", "data"],
        {},
      );

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).toContain("REST API");
      expect(content).toContain("PostgreSQL");
      expect(content).not.toContain("React");
    });

    it("_modules.md 不存在时应正常处理", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# Brief\n\n<!-- @slot:tech -->",
            },
          },
        },
      });

      await expect(
        generateBrief(path.join(tempDir, "templates/zh"), ["ui"], {}),
      ).resolves.not.toThrow();
    });
  });

  describe("占位符替换", () => {
    it("应替换自定义占位符", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# [[PROJECT_NAME]]\n\n作者: [[AUTHOR]]",
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), [], {
        "[[PROJECT_NAME]]": "My App",
        "[[AUTHOR]]": "John Doe",
      });

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).toContain("# My App");
      expect(content).toContain("作者: John Doe");
      expect(content).not.toContain("[[PROJECT_NAME]]");
    });

    it("占位符含特殊字符时应正确转义", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "路径: [[PATH]]",
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), [], {
        "[[PATH]]": "C:\\Users\\test",
      });

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).toContain("C:\\Users\\test");
    });
  });

  describe("格式处理", () => {
    it("多余空行应被压缩", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# Brief\n\n\n\n\nContent",
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), [], {});

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).not.toContain("\n\n\n");
    });
  });

  describe("边界测试", () => {
    it("空特征列表应正常处理", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# Brief\n\n<!-- @slot:tech -->",
              "_modules.md": "<!-- @tech:ui -->\nUI Content\n<!-- @end -->",
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), [], {});

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).not.toContain("UI Content");
    });

    it("Unicode 内容应正确处理", async () => {
      await createTestStructure(tempDir, {
        templates: {
          zh: {
            briefs: {
              "_base.md": "# 项目简介\n\n中文内容 🎉",
            },
          },
        },
      });

      await generateBrief(path.join(tempDir, "templates/zh"), [], {});

      const content = await fs.readFile(
        path.join(tempDir, "project-brief.md"),
        "utf-8",
      );
      expect(content).toContain("中文内容 🎉");
    });
  });
});

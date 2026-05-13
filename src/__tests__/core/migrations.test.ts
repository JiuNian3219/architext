import fs from "fs-extra";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  getMigrationChain,
  getMigrator,
  hasMigrator,
  runMigrationChain,
} from "../../../src/core/migrations.ts";
import type { ArchitextConfig } from "../../../src/types/index.ts";

const mockConfig = (version: number): ArchitextConfig => ({
  version: "0.0.0",
  structureVersion: version,
  docDir: ".architext",
  editors: ["cursor"],
  language: "zh",
  updatedAt: "",
});

describe("migrations", () => {
  describe("getMigrator", () => {
    it("应返回已注册的迁移函数", () => {
      const migrator = getMigrator(1, 2);
      expect(migrator).toBeDefined();
      expect(typeof migrator).toBe("function");
    });

    it("应返回 v2 到 v3 的迁移函数", () => {
      const migrator = getMigrator(2, 3);
      expect(migrator).toBeDefined();
      expect(typeof migrator).toBe("function");
    });

    it("反向迁移应返回 undefined", () => {
      const migrator = getMigrator(2, 1);
      expect(migrator).toBeUndefined();
    });
  });

  describe("hasMigrator", () => {
    it("已注册应返回 true", () => {
      expect(hasMigrator(1, 2)).toBe(true);
      expect(hasMigrator(2, 3)).toBe(true);
    });

    it("未注册应返回 false", () => {
      expect(hasMigrator(3, 4)).toBe(false);
    });
  });

  describe("getMigrationChain", () => {
    it("相同版本应返回空数组", () => {
      const chain = getMigrationChain(2, 2);
      expect(chain).toHaveLength(0);
    });

    it("v1 到 v2 应返回单步链", () => {
      const chain = getMigrationChain(1, 2);
      expect(chain).toHaveLength(1);
      expect(chain[0].from).toBe(1);
      expect(chain[0].to).toBe(2);
    });

    it("v1 到 v3 应返回连续迁移链", () => {
      const chain = getMigrationChain(1, 3);
      expect(chain).toHaveLength(2);
      expect(chain.map((step) => `${step.from}->${step.to}`)).toEqual([
        "1->2",
        "2->3",
      ]);
    });

    it("当前版本高于目标应返回空数组", () => {
      const chain = getMigrationChain(3, 2);
      expect(chain).toHaveLength(0);
    });
  });

  describe("runMigrationChain", () => {
    it("当前版本 >= 目标版本应直接返回成功", async () => {
      const config = mockConfig(2);
      const result = await runMigrationChain(config, process.cwd(), 2);

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(2);
      expect(result.toVersion).toBe(2);
      expect(result.steps).toHaveLength(0);
    });

    it("structureVersion 为 undefined 时应默认从 1 开始", async () => {
      const config = {
        ...mockConfig(1),
        structureVersion: undefined as unknown as number,
      };
      const result = await runMigrationChain(config, process.cwd(), 1);

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(1);
    });

    it("成功执行迁移链", async () => {
      const config = mockConfig(1);
      const result = await runMigrationChain(config, process.cwd(), 2);

      expect(result.fromVersion).toBe(1);
      expect(result.steps.length).toBeGreaterThanOrEqual(0);
    });

    it("应正确计算 toVersion（成功时）", async () => {
      const config = mockConfig(1);
      const result = await runMigrationChain(config, process.cwd(), 1);

      expect(result.toVersion).toBe(1);
    });

    it("v2 到 v3 应将 error_memory.json 重命名为 lesson_memory.json", async () => {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "architext-"));
      try {
        const config = mockConfig(2);
        const globalDir = path.join(tempDir, ".architext", "global");
        const oldPath = path.join(globalDir, "error_memory.json");
        const newPath = path.join(globalDir, "lesson_memory.json");
        const oldGuidePath = path.join(globalDir, "guides", "error_memory.md");

        await fs.ensureDir(path.dirname(oldGuidePath));
        await fs.writeFile(oldGuidePath, "# old guide\n", "utf-8");
        await fs.writeJSON(oldPath, {
          architextTemplate: "global/error_memory.json",
          status: "seed",
          _fieldGuide: { "errorPatterns[]": {} },
          errorPatterns: [{ id: "L001", lesson: "先回看用户原话" }],
          checkpoints: [{ before: "规划前", check: ["L001"] }],
        });

        const result = await runMigrationChain(config, tempDir, 3);
        const renamedMemory = (await fs.readJSON(newPath)) as {
          errorPatterns: unknown[];
          checkpoints: unknown[];
        };

        expect(result.success).toBe(true);
        expect(result.steps[0].migrated).toContain(
          "lesson_memory.json (renamed from error_memory.json)",
        );
        expect(await fs.pathExists(oldPath)).toBe(false);
        expect(await fs.pathExists(oldGuidePath)).toBe(false);
        expect(Array.isArray(renamedMemory.errorPatterns)).toBe(true);
        expect(renamedMemory.checkpoints).toEqual([
          { before: "规划前", check: ["L001"] },
        ]);
      } finally {
        await fs.remove(tempDir);
      }
    });

    it("v2 到 v3 如果 lesson_memory.json 已存在则不覆盖", async () => {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "architext-"));
      try {
        const config = mockConfig(2);
        const globalDir = path.join(tempDir, ".architext", "global");
        const oldPath = path.join(globalDir, "error_memory.json");
        const newPath = path.join(globalDir, "lesson_memory.json");

        await fs.ensureDir(globalDir);
        await fs.writeJSON(oldPath, {
          errorPatterns: [{ id: "L001", lesson: "旧教训" }],
        });
        await fs.writeJSON(newPath, {
          lessons: [{ id: "L001", lesson: "新教训优先" }],
        });

        const result = await runMigrationChain(config, tempDir, 3);
        const lessonMemory = (await fs.readJSON(newPath)) as {
          lessons: Array<{ id: string; lesson: string }>;
        };

        expect(result.success).toBe(true);
        expect(result.steps[0].migrated).toContain(
          "error_memory.json (skipped; lesson_memory.json exists)",
        );
        expect(await fs.pathExists(oldPath)).toBe(true);
        expect(lessonMemory.lessons).toEqual([
          { id: "L001", lesson: "新教训优先" },
        ]);
      } finally {
        await fs.remove(tempDir);
      }
    });
  });

  describe("边界情况", () => {
    it("负数版本应抛出错误", () => {
      expect(() => getMigrationChain(-1, 2)).toThrow("Invalid currentVersion");
    });

    it("非整数版本应抛出错误", () => {
      expect(() => getMigrationChain(1.5, 2)).toThrow("Invalid currentVersion");
    });

    it("缺少中间步骤时应抛出错误", () => {
      expect(() => getMigrationChain(1, 4)).toThrow("Migration chain broken");
    });
  });
});

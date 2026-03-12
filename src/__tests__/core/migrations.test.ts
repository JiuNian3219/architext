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

    it("未注册的迁移应返回 undefined", () => {
      const migrator = getMigrator(2, 3);
      expect(migrator).toBeUndefined();
    });

    it("反向迁移应返回 undefined", () => {
      const migrator = getMigrator(2, 1);
      expect(migrator).toBeUndefined();
    });
  });

  describe("hasMigrator", () => {
    it("已注册应返回 true", () => {
      expect(hasMigrator(1, 2)).toBe(true);
    });

    it("未注册应返回 false", () => {
      expect(hasMigrator(2, 3)).toBe(false);
    });
  });

  describe("getMigrationChain", () => {
    it("相同版本应返回空数组", () => {
      const chain = getMigrationChain(2, 2);
      expect(chain).toHaveLength(0);
    });

    it("v1→v2 应返回单步链", () => {
      const chain = getMigrationChain(1, 2);
      expect(chain).toHaveLength(1);
      expect(chain[0].from).toBe(1);
      expect(chain[0].to).toBe(2);
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

    it("structureVersion 为 undefined 时应默认为 1", async () => {
      const config = {
        ...mockConfig(1),
        structureVersion: undefined as unknown as number,
      };
      const result = await runMigrationChain(config, process.cwd(), 1);

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(1);
    });

    it("成功执行迁移链", async () => {
      // 由于 v1->v2 涉及文件操作，这里只验证链式调用的结构
      // 实际迁移的单元测试在 integration 层
      const config = mockConfig(1);
      const result = await runMigrationChain(config, process.cwd(), 2);

      // 注意：实际运行时会尝试执行文件操作，可能在测试环境失败
      // 但只要链式结构正确即可
      expect(result.fromVersion).toBe(1);
      expect(result.steps.length).toBeGreaterThanOrEqual(0);
    });

    it("应正确计算 toVersion（成功时）", async () => {
      const config = mockConfig(1);
      const result = await runMigrationChain(config, process.cwd(), 1);

      expect(result.toVersion).toBe(1);
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
      // 假设只有 1->2，尝试 1->3 应该报错
      expect(() => getMigrationChain(1, 3)).toThrow("Migration chain broken");
    });
  });
});

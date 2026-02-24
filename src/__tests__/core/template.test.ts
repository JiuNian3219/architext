/** @fileoverview 测试模板管理器 (TemplateManager) */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TemplateManager } from "../../core/template.ts";
import { FileOpType } from "../../types/index.ts";
import * as fs from "fs-extra";
import path from "path";
import {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
} from "../helpers/temp-dir.ts";

describe("TemplateManager", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
    vi.clearAllMocks();
    // Mock getRoot to return a valid path inside tempDir
    // Note: Since we are not mocking fs-extra anymore, we need to spy on getRoot
    vi.spyOn(TemplateManager, "getRoot").mockResolvedValue(
      path.join(tempDir, "templates"),
    );
    await fs.ensureDir(path.join(tempDir, "templates"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
  });

  describe("getRoot", () => {
    it("应该返回模板根目录路径", async () => {
      const root = await TemplateManager.getRoot();
      expect(typeof root).toBe("string");
      expect(root.length).toBeGreaterThan(0);
    });

    it("模板目录应该存在", async () => {
      const root = await TemplateManager.getRoot();
      const exists = await fs.pathExists(root);
      expect(exists).toBe(true);
    });
  });

  describe("plan", () => {
    it("应该为不存在的目录返回空数组", async () => {
      const result = await TemplateManager.plan(
        path.join(tempDir, "nonexistent"),
        path.join(tempDir, "target"),
      );
      expect(result).toEqual([]);
    });

    it("应该生成文件操作计划", async () => {
      // 创建测试文件结构
      const srcDir = path.join(tempDir, "src");
      await createTestStructure(srcDir, {
        "file1.md": "content1",
        "file2.json": '{"key": "value"}',
        subdir: {
          "file3.txt": "content3",
        },
      });

      const destDir = path.join(tempDir, "dest");
      const result = await TemplateManager.plan(srcDir, destDir);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((op) => op.src && op.dest)).toBe(true);
    });

    it("应该正确识别模板文件（.md, .json）", async () => {
      const srcDir = path.join(tempDir, "src");
      await createTestStructure(srcDir, {
        "template.md": "content [[__PLACEHOLDER__]]",
        "config.json": '{"key": "value"}',
        "binary.bin": "binary content",
      });

      const destDir = path.join(tempDir, "dest");
      const result = await TemplateManager.plan(srcDir, destDir);

      const mdOp = result.find((op) => op.dest.endsWith(".md"));
      const jsonOp = result.find((op) => op.dest.endsWith(".json"));
      const binOp = result.find((op) => op.dest.endsWith(".bin"));

      expect(mdOp?.type).toBe(FileOpType.Template);
      expect(jsonOp?.type).toBe(FileOpType.Template);
      expect(binOp?.type).toBe(FileOpType.Copy);
    });

    it("应该支持替换映射", async () => {
      const srcDir = path.join(tempDir, "src");
      await createTestStructure(srcDir, {
        "file.md": "[[__DOCS_DIR__]] content",
      });

      const destDir = path.join(tempDir, "dest");
      const replacements = {
        "[[__DOCS_DIR__]]": ".architext",
      };

      const result = await TemplateManager.plan(srcDir, destDir, replacements);
      const templateOp = result.find((op) => op.type === FileOpType.Template);

      expect(templateOp).toBeDefined();
      if (templateOp && templateOp.type === FileOpType.Template) {
        expect(templateOp.replacements).toEqual(replacements);
      }
    });
  });

  describe("processFile", () => {
    it("应该替换文件中的占位符", async () => {
      const srcFile = path.join(tempDir, "source.md");
      const destFile = path.join(tempDir, "dest.md");

      await fs.writeFile(srcFile, "Docs dir: [[__DOCS_DIR__]]", "utf-8");

      const replacements = {
        "[[__DOCS_DIR__]]": ".architext",
      };

      await TemplateManager.processFile(srcFile, destFile, replacements);

      const content = await fs.readFile(destFile, "utf-8");
      expect(content).toContain(".architext");
      expect(content).not.toContain("[[__DOCS_DIR__]]");
    });

    it("应该转义特殊字符", async () => {
      const srcFile = path.join(tempDir, "source.md");
      const destFile = path.join(tempDir, "dest.md");

      await fs.writeFile(srcFile, "Content with [brackets]", "utf-8");

      const replacements = {
        "[brackets]": "replaced",
      };

      await TemplateManager.processFile(srcFile, destFile, replacements);

      const content = await fs.readFile(destFile, "utf-8");
      expect(content).toContain("replaced");
    });
  });

  describe("execute", () => {
    it("应该执行文件操作计划", async () => {
      const srcDir = path.join(tempDir, "src");
      await createTestStructure(srcDir, {
        "file1.md": "content1",
        "file2.txt": "content2",
      });

      const destDir = path.join(tempDir, "dest");
      const operations = await TemplateManager.plan(srcDir, destDir);

      await TemplateManager.execute(operations);

      const destFile1 = path.join(destDir, "file1.md");
      const destFile2 = path.join(destDir, "file2.txt");

      expect(await fs.pathExists(destFile1)).toBe(true);
      expect(await fs.pathExists(destFile2)).toBe(true);
    });

    it("应该处理覆盖选项", async () => {
      const srcDir = path.join(tempDir, "src");
      await createTestStructure(srcDir, {
        "file.md": "new content",
      });

      const destDir = path.join(tempDir, "dest");
      await createTestStructure(destDir, {
        "file.md": "old content",
      });

      const operations = await TemplateManager.plan(srcDir, destDir);

      // 默认应该覆盖
      await TemplateManager.execute(operations, { overwrite: true });

      const content = await fs.readFile(path.join(destDir, "file.md"), "utf-8");
      expect(content).toBe("new content");
    });

    it("应该跳过已存在的文件（overwrite: false）", async () => {
      const srcDir = path.join(tempDir, "src");
      await createTestStructure(srcDir, {
        "file.md": "new content",
      });

      const destDir = path.join(tempDir, "dest");
      await createTestStructure(destDir, {
        "file.md": "old content",
      });

      const operations = await TemplateManager.plan(srcDir, destDir);

      await TemplateManager.execute(operations, { overwrite: false });

      const content = await fs.readFile(path.join(destDir, "file.md"), "utf-8");
      expect(content).toBe("old content");
    });
  });
});

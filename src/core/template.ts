/** @fileoverview 模板管理器，负责处理文件操作（复制、替换），支持模板文件的批量处理。 */

import { FileOpType, FileOperation } from "@/types/index.ts";
import { createT, getSystemLocale } from "@/utils/t.ts";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { AppError } from "./errors.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const t = createT(getSystemLocale(), "templates");

export class TemplateManager {
  /**
   * 解析模板根目录，使用多重回退策略以适配开发环境和生产环境（TSUP 构建后路径结构会变化）
   * @returns 模板根目录路径
   */
  static async getRoot(): Promise<string> {
    const candidates = [
      path.join(__dirname, "../templates"), // 生产环境：代码已编译到 dist/，templates 被复制到 dist/templates
      path.resolve(__dirname, "../../templates"), // 开发环境：直接引用 src 同级的 templates
    ];

    for (const candidate of candidates) {
      if (await fs.pathExists(candidate)) {
        return candidate;
      }
    }

    throw new AppError(
      t("error.root_not_found", { paths: candidates.join(", ") }),
      "TEMPLATE_ROOT_NOT_FOUND",
    );
  }

  /**
   * 生成文件操作计划，不进行文件的实际复制或替换操作
   * @param srcDir 源目录
   * @param destDir 目标目录
   * @param replacements 替换映射
   * @returns 文件操作列表
   */
  static async plan(
    srcDir: string,
    destDir: string,
    replacements: Record<string, string> = {},
  ): Promise<FileOperation[]> {
    const operations: FileOperation[] = [];
    if (!(await fs.pathExists(srcDir))) return operations;

    const entries = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        const subOps = await this.plan(srcPath, destPath, replacements);
        operations.push(...subOps);
        continue;
      }

      if (!entry.isFile()) continue;

      const opType = this.shouldReplace(entry.name)
        ? FileOpType.Template
        : FileOpType.Copy;

      if (opType === FileOpType.Template) {
        operations.push({
          src: srcPath,
          dest: destPath,
          type: FileOpType.Template,
          replacements,
        });
      } else {
        operations.push({
          src: srcPath,
          dest: destPath,
          type: FileOpType.Copy,
        });
      }
    }
    return operations;
  }

  /**
   * 执行文件操作计划，根据操作类型进行文件复制或内容替换
   * @param operations 操作列表
   * @param options 执行选项，overwrite: 是否覆盖现有文件 (默认 true)
   */
  static async execute(
    operations: FileOperation[],
    options: { overwrite?: boolean } = {},
  ) {
    for (const op of operations) {
      if (options.overwrite === false && (await fs.pathExists(op.dest))) {
        continue;
      }

      await fs.ensureDir(path.dirname(op.dest));

      if (op.type === FileOpType.Template) {
        await this.processFile(op.src, op.dest, op.replacements);
      } else {
        await fs.copy(op.src, op.dest);
      }
    }
  }

  /**
   * 判断文件是否需要进行内容替换（Markdown、JSON、TS/JS 文件）
   * @param filename 文件名
   * @returns 是否需要替换
   */
  private static shouldReplace(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return [".md", ".json", ".ts", ".js", ".yaml", ".yml"].includes(ext);
  }

  /**
   * 处理单个文件，进行内容替换并写入目标路径
   * @param src 源文件路径
   * @param dest 目标文件路径
   * @param replacements 替换内容映射
   */
  public static async processFile(
    src: string,
    dest: string,
    replacements: Record<string, string>,
  ) {
    let content = await fs.readFile(src, "utf-8");

    for (const [key, value] of Object.entries(replacements)) {
      // 这里的 key 已经是完整的占位符（例如 [[__DOCS_DIR__]]），需要转义后生成正则
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedKey, "g");
      content = content.replace(regex, value);
    }

    await fs.writeFile(dest, content, "utf-8");
  }
}

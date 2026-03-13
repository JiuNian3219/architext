/**
 * @fileoverview pack 命令的文件收集器。
 *
 * 负责扫描用户数据目录（global / tasks / scripts / refs）
 * 以及各编辑器的用户专属规则文件，汇总为 PackEntry 列表供序列化使用。
 */

import fs from "fs-extra";
import path from "path";
import { getCurrentFileModel } from "../../../core/file-model.ts";
import { EDITOR_CONFIGS } from "../../../core/rules.ts";
import type { ArchitextConfig } from "../../../types/index.ts";

export interface PackEntry {
  /** 相对项目根目录的文件路径（POSIX 斜杠） */
  path: string;
  content: string;
}

/**
 * 将路径统一为 POSIX 斜杠格式（Windows 兼容）
 *
 * @param p - 路径
 * @returns 统一后的路径
 */
export function posix(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * 从 FileModel 的 rulePolicy 动态提取需要备份的用户规则文件名。
 * templateOnly + neverTouch 的规则都包含用户定制内容，需要打包保护。
 *
 * @returns 用户规则文件名列表
 */
function getUserRuleBasenames(): string[] {
  const model = getCurrentFileModel();
  return Object.entries(model.rulePolicy)
    .filter(
      ([, policy]) => policy === "neverTouch" || policy === "templateOnly",
    )
    .map(([name]) => name);
}

/**
 * 递归列举目录下所有文件，支持排除特定子目录。
 *
 * @param dir - 目录路径
 * @param baseDir - 基础目录路径
 * @param excludeDirs - 要排除的子目录名列表
 * @returns 文件列表
 */
async function listFilesRecursive(
  dir: string,
  baseDir?: string,
  excludeDirs: string[] = [],
): Promise<{ fullPath: string; relPath: string }[]> {
  const base = baseDir ?? dir;
  const result: { fullPath: string; relPath: string }[] = [];
  if (!(await fs.pathExists(dir))) return result;

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name)) continue;
      result.push(...(await listFilesRecursive(fullPath, base, excludeDirs)));
    } else if (entry.isFile()) {
      result.push({
        fullPath,
        relPath: posix(path.relative(base, fullPath)),
      });
    }
  }
  return result;
}

/**
 * 收集所有用户数据文件（global/、tasks/、scripts/、refs/、自定义规则）。
 * 框架管理的文件（prompts/、templates/、系统规则、skills）不在此范围。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 用户数据文件列表
 */
export async function collectUserData(
  config: ArchitextConfig,
  cwd: string,
): Promise<PackEntry[]> {
  const docDir = path.resolve(cwd, config.docDir);
  const entries: PackEntry[] = [];

  const docSubDirs = ["global", "tasks", "scripts", "refs"];
  for (const sub of docSubDirs) {
    const dir = path.join(docDir, sub);
    if (!(await fs.pathExists(dir))) continue;
    // global 目录排除 references/（框架管理的参考文档）
    const excludeDirs = sub === "global" ? ["references"] : [];
    for (const { fullPath, relPath } of await listFilesRecursive(
      dir,
      undefined,
      excludeDirs,
    )) {
      const content = await fs.readFile(fullPath, "utf-8");
      entries.push({
        path: posix(path.join(config.docDir, sub, relPath)),
        content,
      });
    }
  }

  // 用户专属规则文件（90_custom_rules 必须打包；02_tech_stack 如存在也打包用于兼容 v1）
  const userRuleFiles = [...getUserRuleBasenames(), "02_tech_stack"];
  for (const editor of config.editors) {
    const ec = EDITOR_CONFIGS[editor];
    if (!ec) continue;
    for (const baseName of userRuleFiles) {
      const filePath = path.resolve(
        cwd,
        ec.targetDir,
        `${baseName}${ec.targetExt}`,
      );
      if (!(await fs.pathExists(filePath))) continue;
      const content = await fs.readFile(filePath, "utf-8");
      entries.push({
        path: posix(path.join(ec.targetDir, `${baseName}${ec.targetExt}`)),
        content,
      });
    }
  }

  return entries;
}

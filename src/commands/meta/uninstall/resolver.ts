/**
 * @fileoverview 卸载文件解析器。
 *
 * 声明式：扫描所有 editor 路径，找到所有 Architext 管理的文件并列入删除计划。
 * 以当前 FileModel + 全量 editor 扫描为准。
 */

import fs from "fs-extra";
import path from "path";
import { CONFIG_NAME } from "../../../core/config.ts";
import {
  getCurrentFileModel,
  resolveAllPossibleFiles,
} from "../../../core/file-model.ts";
import type { ArchitextConfig } from "../../../types/index.ts";

export interface UninstallPlan {
  /** 需要删除的文件绝对路径 */
  files: string[];
  /** 需要删除的目录绝对路径（如 skill 目录） */
  dirs: string[];
  /** 删除后需要检查是否为空的目录（按深度降序） */
  dirsToCheck: string[];
}

/**
 * 根据 file-model 计算卸载计划。
 *
 * 删除范围：
 * - 所有 Framework 文件和目录
 * - 所有 Seed 文件
 * - 整个 docDir 目录
 * - project-brief.md
 * - opencode.json 处理
 * - architext.json
 * - 空目录清理（按深度降序）
 *
 * @param config 配置对象
 * @param cwd 当前工作目录
 * @returns 卸载计划
 */
export function resolveUninstallPlan(
  config: ArchitextConfig,
  cwd: string,
): UninstallPlan {
  const model = getCurrentFileModel();
  const resolved = resolveAllPossibleFiles(model, config.docDir);

  const files: string[] = [];
  const dirs: string[] = [];
  const dirsToCheckSet = new Set<string>();

  // Framework 文件
  for (const f of resolved.frameworkFiles) {
    files.push(path.resolve(cwd, f));
    dirsToCheckSet.add(path.dirname(path.resolve(cwd, f)));
  }

  // Framework 目录（skills 等）
  for (const d of resolved.frameworkDirs) {
    dirs.push(path.resolve(cwd, d));
    const parentDir = path.dirname(path.resolve(cwd, d));
    dirsToCheckSet.add(parentDir);
    dirsToCheckSet.add(path.dirname(parentDir));
  }

  // docDir 整体删除
  dirs.push(path.resolve(cwd, config.docDir));

  // project-brief.md + architext.json
  files.push(path.resolve(cwd, "project-brief.md"));
  files.push(path.resolve(cwd, CONFIG_NAME));

  // 收集 framework 文件的父目录用于空目录清理
  for (const f of resolved.frameworkFiles) {
    const parentDir = path.dirname(path.resolve(cwd, f));
    dirsToCheckSet.add(parentDir);
    dirsToCheckSet.add(path.dirname(parentDir));
  }

  // 按深度降序排列
  const dirsToCheck = Array.from(dirsToCheckSet)
    .filter((d) => d !== cwd)
    .sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

  return { files, dirs, dirsToCheck };
}

/**
 * 处理 opencode.json：移除 Architext 添加的 instructions 路径。
 *
 * @param config 配置对象
 * @param cwd 当前工作目录
 */
export async function cleanupOpencodeConfig(
  config: ArchitextConfig,
  cwd: string,
): Promise<void> {
  if (
    !config.editors?.includes("opencode") ||
    !config.opencodeInstructionsAdded
  ) {
    return;
  }

  const openCodeConfigPath = path.resolve(cwd, "opencode.json");
  const archiPath = ".opencode/rules/*.md";

  if (!(await fs.pathExists(openCodeConfigPath))) return;

  try {
    const content = JSON.parse(await fs.readFile(openCodeConfigPath, "utf-8"));
    if (!Array.isArray(content.instructions)) return;

    const filtered = content.instructions.filter(
      (p: string) => p !== archiPath,
    );
    if (filtered.length === content.instructions.length) return;

    if (filtered.length === 0) {
      delete content.instructions;
      if (Object.keys(content).length === 0) {
        await fs.remove(openCodeConfigPath);
      } else {
        await fs.writeFile(
          openCodeConfigPath,
          JSON.stringify(content, null, 2),
          "utf-8",
        );
      }
    } else {
      content.instructions = filtered;
      await fs.writeFile(
        openCodeConfigPath,
        JSON.stringify(content, null, 2),
        "utf-8",
      );
    }
  } catch {
    // JSON 损坏时跳过
  }
}

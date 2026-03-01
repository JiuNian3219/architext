/** @fileoverview pack 命令：将用户数据（global 文档、tasks、自定义规则）打包为 XML，供 recover 还原。 */

import { intro, outro, spinner } from "@clack/prompts";
import color from "picocolors";
import fs from "fs-extra";
import path from "path";
import pkg from "../../../../package.json" with { type: "json" };
import { loadConfig } from "../../../core/config.ts";
import { EDITOR_CONFIGS } from "../../../core/rules.ts";
import type { ArchitextConfig } from "../../../types/index.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";

const t = createT(getSystemLocale(), "command.pack");

/**
 * 需要打包的用户专属规则文件（不含扩展名）。
 * 这些文件由用户在 init 后手动填写，框架升级时须保留。
 */
const USER_RULE_BASENAMES = ["90_custom_rules", "02_tech_stack"];

export interface PackOptions {
  output?: string;
}

interface PackEntry {
  /** 相对项目根目录的文件路径（POSIX 斜杠） */
  path: string;
  content: string;
}

/**
 * pack 命令主入口。
 * 读取项目配置 → 收集用户数据文件 → 序列化为 XML → 写入输出文件。
 *
 * @param options 命令行选项
 * @returns 打包结果
 */
export async function packCommand(options: PackOptions = {}): Promise<void> {
  intro(color.bgCyan(color.black(` ${t("title")} `)));

  const cwd = process.cwd();
  const config = await loadConfig(cwd);
  if (!config) {
    outro(color.yellow(t("no_config")));
    return;
  }

  const outputFile = options.output ?? "architext-pack.xml";
  const outputPath = path.resolve(cwd, outputFile);

  const s = spinner();
  s.start(t("packing"));

  const entries = await collectUserData(config, cwd);

  if (entries.length === 0) {
    s.stop(color.yellow(t("empty")));
    outro(color.yellow(t("empty_hint")));
    return;
  }

  const xml = buildXml(entries, config, pkg.version);
  await fs.writeFile(outputPath, xml, "utf-8");

  s.stop(
    color.green(t("done", { count: String(entries.length), file: outputFile })),
  );
  logger.info(t("hint_recover", { file: outputFile }));
  outro(color.green(t("success")));
}

/**
 * 收集所有用户数据文件（global/、tasks/、scripts/、自定义规则）。
 * 框架管理的文件（prompts/、templates/、系统规则、skills）不在此范围。
 *
 * @param config 项目配置
 * @param cwd 工作目录
 * @returns 用户数据条目列表
 */
async function collectUserData(
  config: ArchitextConfig,
  cwd: string,
): Promise<PackEntry[]> {
  const docDir = path.resolve(cwd, config.docDir);
  const entries: PackEntry[] = [];

  // global/ 目录（用户产出的项目文档）
  const globalDir = path.join(docDir, "global");
  if (await fs.pathExists(globalDir)) {
    for (const { fullPath, relPath } of await listFilesRecursive(globalDir)) {
      const content = await fs.readFile(fullPath, "utf-8");
      entries.push({
        path: posix(path.join(config.docDir, "global", relPath)),
        content,
      });
    }
  }

  // tasks/ 目录（所有任务文档：spec / plan / ui / audit）
  const tasksDir = path.join(docDir, "tasks");
  if (await fs.pathExists(tasksDir)) {
    for (const { fullPath, relPath } of await listFilesRecursive(tasksDir)) {
      const content = await fs.readFile(fullPath, "utf-8");
      entries.push({
        path: posix(path.join(config.docDir, "tasks", relPath)),
        content,
      });
    }
  }

  // scripts/ 目录（用户自定义脚本）
  const scriptsDir = path.join(docDir, "scripts");
  if (await fs.pathExists(scriptsDir)) {
    for (const { fullPath, relPath } of await listFilesRecursive(scriptsDir)) {
      const content = await fs.readFile(fullPath, "utf-8");
      entries.push({
        path: posix(path.join(config.docDir, "scripts", relPath)),
        content,
      });
    }
  }

  // refs/ 目录（用户存储的外部知识引用：API 文档摘要、公司内部 SDK 等）
  const refsDir = path.join(docDir, "refs");
  if (await fs.pathExists(refsDir)) {
    for (const { fullPath, relPath } of await listFilesRecursive(refsDir)) {
      const content = await fs.readFile(fullPath, "utf-8");
      entries.push({
        path: posix(path.join(config.docDir, "refs", relPath)),
        content,
      });
    }
  }

  // 用户专属规则文件（各编辑器的 90_custom_rules + 02_tech_stack）
  for (const editor of config.editors) {
    const ec = EDITOR_CONFIGS[editor];
    if (!ec) continue;

    for (const baseName of USER_RULE_BASENAMES) {
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

/**
 * 递归列举目录下所有文件。
 *
 * @param dir 目录路径
 * @param baseDir 基础目录路径
 * @returns 文件列表
 */
async function listFilesRecursive(
  dir: string,
  baseDir?: string,
): Promise<{ fullPath: string; relPath: string }[]> {
  const base = baseDir ?? dir;
  const result: { fullPath: string; relPath: string }[] = [];
  if (!(await fs.pathExists(dir))) return result;

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await listFilesRecursive(fullPath, base)));
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
 * 将路径统一为 POSIX 斜杠格式（Windows 兼容）。
 *
 * @param p 路径
 * @returns POSIX 斜杠格式路径
 */
function posix(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * 将用户数据条目序列化为 Repomix 风格的 XML 字符串。
 *
 * @param entries 用户数据条目
 * @param config 项目配置
 * @param version 版本号
 * @returns XML 字符串
 */
function buildXml(
  entries: PackEntry[],
  config: ArchitextConfig,
  version: string,
): string {
  const date = new Date().toISOString().split("T")[0];

  const fileBlocks = entries
    .map(({ path: filePath, content }) => {
      // 转义 CDATA 结束符，防止解析器提前截断
      const safeContent = content.replace(/]]>/g, "]]]]><![CDATA[>");
      return [
        `  <file path="${filePath}">`,
        `<![CDATA[`,
        safeContent,
        `]]>`,
        `  </file>`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!--`,
    `  Architext User Data Pack`,
    `  CLI Version : ${version}`,
    `  DocDir      : ${config.docDir}`,
    `  Editors     : ${config.editors.join(", ")}`,
    `  Created     : ${date}`,
    `  Files       : ${entries.length}`,
    ``,
    `  Restore with:`,
    `    archi recover architext-pack.xml`,
    `-->`,
    `<architext-pack version="${version}" doc-dir="${config.docDir}" created="${date}">`,
    ``,
    `  <files>`,
    ``,
    fileBlocks,
    ``,
    `  </files>`,
    ``,
    `</architext-pack>`,
  ].join("\n");
}

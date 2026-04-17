/**
 * @fileoverview update 命令的文件操作层。
 *
 * - removeStaleFiles: 声明式清理——扫描所有 editor 路径，删除不再需要的 Architext 文件
 * - deployNewFiles:   framework 重写 + add-only seeds + 骨架目录保证
 * - deployTemplateOnlyRules: 将 templateOnly 规则写到 docDir/templates/ 供用户参考
 */

import fs from "fs-extra";
import path from "path";
import {
  getCurrentFileModel,
  resolveAllPossibleFiles,
  resolveFiles,
} from "../../../core/file-model.ts";
import {
  EDITOR_CONFIGS,
  GLOBAL_RULES,
  resolveCapabilityRefs,
} from "../../../core/rules.ts";
import { buildScaffoldOps } from "../../../core/scaffold.ts";
import { TemplateManager } from "../../../core/template.ts";
import type { ArchitextConfig, FileOperation } from "../../../types/index.ts";

/**
 * 计算需要跳过（不删除/不覆盖）的规则文件路径集合。
 * neverTouch + templateOnly 均受保护。
 *
 * @param editors - 编辑器列表
 * @param rulePolicy - 规则策略
 * @returns 跳过路径集合
 */
export function computeSkipPaths(
  editors: readonly string[],
  rulePolicy: Record<string, "templateOnly" | "neverTouch">,
): Set<string> {
  const skip = new Set<string>();
  for (const editor of editors) {
    const ec = EDITOR_CONFIGS[editor as keyof typeof EDITOR_CONFIGS];
    if (!ec) continue;
    for (const name of Object.keys(rulePolicy)) {
      skip.add(`${ec.targetDir}/${name}${ec.targetExt}`.replace(/\\/g, "/"));
    }
  }
  return skip;
}

/**
 * 清理阶段：声明式删除。
 * 扫描所有 editor 路径，找到不应存在的 Architext 文件并删除。
 * 同时清理变空的父目录。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 删除的文件数量
 */
export async function removeStaleFiles(
  config: ArchitextConfig,
  cwd: string,
): Promise<number> {
  const model = getCurrentFileModel();
  const allPossible = resolveAllPossibleFiles(model, config.docDir);
  const expected = resolveFiles(model, config);
  const expectedSet = new Set([
    ...expected.frameworkFiles,
    ...expected.frameworkDirs,
  ]);
  const skipPaths = computeSkipPaths(
    Object.keys(EDITOR_CONFIGS),
    model.rulePolicy,
  );

  let count = 0;

  for (const f of allPossible.frameworkFiles) {
    if (expectedSet.has(f) || skipPaths.has(f)) continue;
    const absPath = path.resolve(cwd, f);
    if (await fs.pathExists(absPath)) {
      await fs.remove(absPath);
      count++;
    }
  }

  for (const d of allPossible.frameworkDirs) {
    if (expectedSet.has(d)) continue;
    const absPath = path.resolve(cwd, d);
    if (await fs.pathExists(absPath)) {
      await fs.remove(absPath);
      count++;
    }
  }

  // 清理变空的父目录
  const dirsToCheck = new Set<string>();
  for (const f of allPossible.frameworkFiles) {
    dirsToCheck.add(path.dirname(path.resolve(cwd, f)));
  }
  for (const d of allPossible.frameworkDirs) {
    const parent = path.dirname(path.resolve(cwd, d));
    dirsToCheck.add(parent);
    dirsToCheck.add(path.dirname(parent));
  }
  const sortedDirs = Array.from(dirsToCheck)
    .filter((d) => d !== cwd)
    .sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
  for (const dir of sortedDirs) {
    if (!(await fs.pathExists(dir))) continue;
    const entries = await fs.readdir(dir);
    if (entries.length === 0) await fs.remove(dir);
  }

  return count;
}

/**
 * 部署阶段：framework 文件重写 + add-only seeds + 骨架目录保证。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 部署结果
 */
export async function deployNewFiles(
  config: ArchitextConfig,
  cwd: string,
): Promise<{ frameworkCount: number; seedCount: number }> {
  const model = getCurrentFileModel();
  const skipPaths = computeSkipPaths(config.editors, model.rulePolicy);

  const plan = await buildScaffoldOps({
    language: config.language,
    editors: config.editors,
    docDir: config.docDir,
    features: config.features ?? [],
    generateBrief: false,
  });

  const filteredFramework = plan.frameworkOps.filter((op) => {
    const relDest = path.relative(cwd, op.dest).replace(/\\/g, "/");
    return !skipPaths.has(relDest);
  });

  for (const group of ["docs", "ide"]) {
    const groupOps = filteredFramework.filter((op) => op.group === group);
    if (groupOps.length > 0) await TemplateManager.execute(groupOps);
  }
  const otherOps = filteredFramework.filter((op) => !op.group);
  if (otherOps.length > 0) await TemplateManager.execute(otherOps);

  let seedCount = 0;
  const seedsToExecute: FileOperation[] = [];
  for (const op of plan.seedOps) {
    if (!(await fs.pathExists(op.dest))) {
      seedsToExecute.push(op);
      seedCount++;
    }
  }
  if (seedsToExecute.length > 0) await TemplateManager.execute(seedsToExecute);

  const targetDir = path.resolve(cwd, config.docDir);
  await fs.ensureDir(path.join(targetDir, "scripts"));
  await fs.ensureDir(path.join(targetDir, "tasks"));
  await fs.ensureDir(path.join(targetDir, "refs"));

  return { frameworkCount: filteredFramework.length, seedCount };
}

/**
 * templateOnly 规则处理：将新版模板写到 docDir/templates/ 供用户参考，
 * 不覆盖用户在 IDE 规则目录中的自定义版本。
 *
 * @param config - 配置
 * @returns 已部署的模板名称列表
 */
export async function deployTemplateOnlyRules(
  config: ArchitextConfig,
): Promise<string[]> {
  const model = getCurrentFileModel();
  const templateOnlyNames = Object.entries(model.rulePolicy)
    .filter(([, policy]) => policy === "templateOnly")
    .map(([name]) => name);

  if (templateOnlyNames.length === 0) return [];

  const templateRoot = await TemplateManager.getRoot();
  const lang = (await fs.pathExists(path.join(templateRoot, config.language)))
    ? config.language
    : "zh";
  const sourceDir = path.join(templateRoot, lang);
  const rulesSource = path.join(sourceDir, GLOBAL_RULES.PATHS.RULES_SOURCE);
  const docsSource = path.join(sourceDir, GLOBAL_RULES.PATHS.DOCS_SOURCE);

  const featuresLabel =
    config.features && config.features.length > 0
      ? config.features.join(", ")
      : "未指定";
  const replacements: Record<string, string> = {
    [GLOBAL_RULES.PLACEHOLDERS.DOCS_DIR]: config.docDir,
    [GLOBAL_RULES.PLACEHOLDERS.PROJECT_TYPE]: featuresLabel,
  };

  const hasSkills = config.editors.some((e) => !!EDITOR_CONFIGS[e]?.skills);
  const hasSubagents = config.editors.some(
    (e) => !!EDITOR_CONFIGS[e]?.subagents,
  );
  const hasCommands = config.editors.some((e) => !!EDITOR_CONFIGS[e]?.commands);
  const whenContext = { features: config.features ?? [] };
  const resolver = (content: string) =>
    resolveCapabilityRefs(
      content,
      { hasSkills, hasSubagents, hasCommands },
      docsSource,
      whenContext,
    );

  const deployed: string[] = [];
  for (const name of templateOnlyNames) {
    const srcPath = path.join(rulesSource, `${name}.md`);
    if (!(await fs.pathExists(srcPath))) continue;
    const destPath = path.join(
      process.cwd(),
      config.docDir,
      "templates",
      `${name}.template.md`,
    );
    await fs.ensureDir(path.dirname(destPath));
    await TemplateManager.processFile(
      srcPath,
      destPath,
      replacements,
      resolver,
    );
    deployed.push(name);
  }

  return deployed;
}

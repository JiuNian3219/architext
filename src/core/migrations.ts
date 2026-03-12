/**
 * @fileoverview Architext 版本迁移系统。
 *
 * 设计原则：
 * 1. 链式迁移：支持 v1→v2→v3 的连续升级，而非直接 v1→v3
 * 2. 幂等性：每个迁移单元可重复执行，不会破坏已有数据
 * 3. 声明式：迁移函数在 MIGRATIONS 注册表中声明，易于扩展
 * 4. 回滚友好：每个迁移返回具体操作记录，便于追踪和回滚
 *
 * 添加新迁移步骤：
 * 1. 在 MIGRATIONS 中添加 "N->N+1": migrateVnToVnPlus1
 * 2. 实现 migrateVnToVnPlus1 函数，返回 { migrated: string[] }
 * 3. 更新 FILE_MODELS 中的最新版本号
 */

import fs from "fs-extra";
import path from "path";
import { getFileModel, CURRENT_FILE_MODEL_VERSION } from "./file-model.ts";
import { EDITOR_CONFIGS } from "./rules.ts";
import type { ArchitextConfig } from "../types/index.ts";

/** 单个迁移函数签名 */
export type MigrationFn = (
  config: ArchitextConfig,
  cwd: string,
) => Promise<{ migrated: string[] }>;

/** 迁移注册表 */
const MIGRATIONS: Record<string, MigrationFn> = {
  "1->2": migrateV1ToV2,
  // 未来添加:
  // "2->3": migrateV2ToV3,
};

/**
 * 获取指定版本范围的迁移函数
 * @param from - 源版本
 * @param to - 目标版本
 * @returns 迁移函数，未找到返回 undefined
 */
export function getMigrator(from: number, to: number): MigrationFn | undefined {
  return MIGRATIONS[`${from}->${to}`];
}

/**
 * 检查是否存在指定版本范围的迁移
 * @param from - 源版本
 * @param to - 目标版本
 */
export function hasMigrator(from: number, to: number): boolean {
  return `${from}->${to}` in MIGRATIONS;
}

/**
 * 获取从当前版本到目标版本的所有迁移步骤
 * @param currentVersion - 当前版本（必须 >= 1）
 * @param targetVersion - 目标版本（必须 >= 1）
 * @returns 迁移步骤数组 [{ from, to, migrator }]
 * @throws 如果版本号无效或链断裂
 */
export function getMigrationChain(
  currentVersion: number,
  targetVersion: number,
): Array<{ from: number; to: number; migrator: MigrationFn }> {
  // 验证版本号
  if (!Number.isInteger(currentVersion) || currentVersion < 1) {
    throw new Error(
      `Invalid currentVersion: ${currentVersion}, must be positive integer`,
    );
  }
  if (!Number.isInteger(targetVersion) || targetVersion < 1) {
    throw new Error(
      `Invalid targetVersion: ${targetVersion}, must be positive integer`,
    );
  }

  if (currentVersion >= targetVersion) {
    return [];
  }

  const chain: Array<{ from: number; to: number; migrator: MigrationFn }> = [];

  for (let v = currentVersion; v < targetVersion; v++) {
    const nextVersion = v + 1;
    const migrator = getMigrator(v, nextVersion);
    if (migrator) {
      chain.push({ from: v, to: nextVersion, migrator });
    } else {
      // 链断裂：缺少必要的中间迁移
      throw new Error(
        `Migration chain broken: no migrator found for v${v} → v${nextVersion}. ` +
          `Please upgrade CLI to a newer version that supports this migration.`,
      );
    }
  }

  return chain;
}

/**
 * 执行链式迁移
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @param targetVersion - 目标版本（默认 CURRENT_FILE_MODEL_VERSION）
 * @returns 所有迁移操作的汇总
 */
export async function runMigrationChain(
  config: ArchitextConfig,
  cwd: string,
  targetVersion: number = CURRENT_FILE_MODEL_VERSION,
): Promise<{
  success: boolean;
  fromVersion: number;
  toVersion: number;
  steps: Array<{
    from: number;
    to: number;
    migrated: string[];
    error?: string;
  }>;
}> {
  const currentVersion = config.structureVersion ?? 1;

  if (currentVersion >= targetVersion) {
    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: currentVersion,
      steps: [],
    };
  }

  const chain = getMigrationChain(currentVersion, targetVersion);
  const steps: Array<{
    from: number;
    to: number;
    migrated: string[];
    error?: string;
  }> = [];

  for (const step of chain) {
    try {
      const result = await step.migrator(config, cwd);
      steps.push({
        from: step.from,
        to: step.to,
        migrated: result.migrated,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      steps.push({
        from: step.from,
        to: step.to,
        migrated: [],
        error: errorMsg,
      });
      // 链中断，返回已完成的步骤
      return {
        success: false,
        fromVersion: currentVersion,
        toVersion: step.from, // 停在上一个成功版本
        steps,
      };
    }
  }

  return {
    success: true,
    fromVersion: currentVersion,
    toVersion: targetVersion,
    steps,
  };
}

/**
 * v1 → v2 迁移：处理文件布局变化。
 *
 * 迁移内容：
 * 1. 迁移 tech_stack：将用户定制的 02_tech_stack.md 内容（去除 frontmatter）
 *    复制到 global/tech_stack.md（若目标已存在则跳过，保护用户数据）
 * 2. 清理 v1 专有规则：删除 01_workflow.md、03_data_governance.md、
 *    04_cli_tools.md、99_context_glue.md（这些已被吸收进 00_system.md）
 * 3. 清理旧版 map.json 中的静态 governance/featureDocs 字段
 *    （仅当文件包含这些字段时才执行，保证幂等）
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 执行的迁移操作摘要
 */
async function migrateV1ToV2(
  config: ArchitextConfig,
  cwd: string,
): Promise<{ migrated: string[] }> {
  const v1 = getFileModel(1);
  if (!v1) return { migrated: [] };

  const migrated: string[] = [];
  const docDir = path.resolve(cwd, config.docDir);

  // ── 1. 迁移 tech_stack ─────────────────────────────────────────────────────
  const techStackDest = path.join(docDir, "global", "tech_stack.md");
  if (!(await fs.pathExists(techStackDest))) {
    // 寻找 v1 02_tech_stack 在各 editor 中的实际路径
    for (const editor of config.editors) {
      const ec = EDITOR_CONFIGS[editor as keyof typeof EDITOR_CONFIGS];
      if (!ec) continue;
      const src = path.resolve(
        cwd,
        `${ec.targetDir}/02_tech_stack${ec.targetExt}`,
      );
      if (await fs.pathExists(src)) {
        const raw = await fs.readFile(src, "utf-8");
        // 去除 YAML frontmatter（--- ... ---）
        const content = raw.replace(/^---[\s\S]*?---\n?/, "");
        await fs.ensureDir(path.dirname(techStackDest));
        await fs.writeFile(techStackDest, content, "utf-8");
        migrated.push("tech_stack.md (migrated from 02_tech_stack)");
        break;
      }
    }
  }

  // ── 2. 清理 v1 专有规则 ────────────────────────────────────────────────────
  const v1OnlyRules = [
    "01_workflow",
    "03_data_governance",
    "04_cli_tools",
    "99_context_glue",
  ];
  for (const editor of config.editors) {
    const ec = EDITOR_CONFIGS[editor as keyof typeof EDITOR_CONFIGS];
    if (!ec) continue;
    for (const rule of v1OnlyRules) {
      const absPath = path.resolve(
        cwd,
        `${ec.targetDir}/${rule}${ec.targetExt}`,
      );
      if (await fs.pathExists(absPath)) {
        await fs.remove(absPath);
        migrated.push(`${rule}${ec.targetExt} (v1 rule removed)`);
      }
    }
  }

  // ── 3. 清理 map.json 旧静态字段 ───────────────────────────────────────────
  const mapPath = path.join(docDir, "global", "map.json");
  if (await fs.pathExists(mapPath)) {
    const raw = await fs.readFile(mapPath, "utf-8");
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      json = {};
    }
    if ("governance" in json || "featureDocs" in json) {
      const {
        governance: _g,
        featureDocs: _f,
        ...rest
      } = json as {
        governance?: unknown;
        featureDocs?: unknown;
        [k: string]: unknown;
      };
      const slimmed = {
        directoryMapping: rest.directoryMapping ?? [],
        logicalTopology: rest.logicalTopology ?? [],
        criticalUserJourneys: rest.criticalUserJourneys ?? [],
        featureRelations: rest.featureRelations ?? [],
        ...Object.fromEntries(
          Object.entries(rest).filter(
            ([k]) =>
              ![
                "directoryMapping",
                "logicalTopology",
                "criticalUserJourneys",
                "featureRelations",
              ].includes(k),
          ),
        ),
      };
      await fs.writeFile(
        mapPath,
        JSON.stringify(slimmed, null, 2) + "\n",
        "utf-8",
      );
      migrated.push("map.json (removed governance/featureDocs)");
    }
  }

  return { migrated };
}

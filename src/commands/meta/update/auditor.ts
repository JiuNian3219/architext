/** @fileoverview Schema 审计器：校验 roadmap.json 和 task plan.json 的结构兼容性，并执行轻量版本迁移。 */

import fs from "fs-extra";
import path from "path";
import { PlanDataSchema } from "../../../core/schemas/plan.schema.ts";
import { RoadmapDataSchema } from "../../../core/schemas/roadmap.schema.ts";
import type { ArchitextConfig } from "../../../types/index.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { EXPECTED_ROADMAP_VERSION, ROADMAP_MIGRATIONS } from "./constants.ts";

const t = createT(getSystemLocale(), "command.update");

export interface RoadmapAuditResult {
  file: string;
  compatible: boolean;
  migrated: boolean;
  fromVersion?: number;
  toVersion?: number;
  errors?: string[];
}

export interface PlanAuditResult {
  file: string;
  compatible: boolean;
  errors?: string[];
}

/**
 * 审计并自动迁移 roadmap.json（基于 version 字段执行顺序迁移链）。
 * 迁移为增量式：只追加缺失字段的默认值，不删除现有数据。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 审计结果
 */
export async function auditRoadmap(
  config: ArchitextConfig,
  cwd: string,
): Promise<RoadmapAuditResult> {
  const roadmapPath = path.join(cwd, config.docDir, "global", "roadmap.json");
  const relPath = path.relative(cwd, roadmapPath);

  if (!(await fs.pathExists(roadmapPath))) {
    return { file: relPath, compatible: true, migrated: false };
  }

  let data: Record<string, unknown>;
  try {
    data = await fs.readJSON(roadmapPath);
  } catch {
    return {
      file: relPath,
      compatible: false,
      migrated: false,
      errors: [t("schema.parse_error")],
    };
  }

  const currentVersion = typeof data.version === "number" ? data.version : 0;

  // 用户侧文件版本高于 CLI 期望版本：CLI 可能过旧，警告用户升级 CLI
  if (currentVersion > EXPECTED_ROADMAP_VERSION) {
    return {
      file: relPath,
      compatible: false,
      migrated: false,
      fromVersion: currentVersion,
      errors: [
        t("schema.version_too_new", {
          current: currentVersion,
          expected: EXPECTED_ROADMAP_VERSION,
        }),
      ],
    };
  }

  // 版本已是最新：直接用 Zod 做结构校验
  if (currentVersion === EXPECTED_ROADMAP_VERSION) {
    const result = RoadmapDataSchema.safeParse(data);
    if (result.success) {
      return { file: relPath, compatible: true, migrated: false };
    }
    return {
      file: relPath,
      compatible: false,
      migrated: false,
      errors: result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    };
  }

  // 需要迁移：按版本顺序执行迁移链
  const steps = ROADMAP_MIGRATIONS.filter(
    (m) =>
      m.fromVersion >= currentVersion &&
      m.fromVersion < EXPECTED_ROADMAP_VERSION,
  ).sort((a, b) => a.fromVersion - b.fromVersion);

  let migrated: Record<string, unknown> = data;
  for (const step of steps) {
    migrated = step.migrate(migrated);
  }
  migrated.version = EXPECTED_ROADMAP_VERSION;

  await fs.writeJSON(roadmapPath, migrated, { spaces: 2 });

  return {
    file: relPath,
    compatible: true,
    migrated: true,
    fromVersion: currentVersion,
    toVersion: EXPECTED_ROADMAP_VERSION,
  };
}

/**
 * 对所有 tasks/{id}/plan.json 执行 Zod Schema 校验（只读，不自动修改）。
 * plan.json 为每个 task 的业务数据，格式问题需用户手动修复。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 审计结果
 */
export async function auditPlans(
  config: ArchitextConfig,
  cwd: string,
): Promise<PlanAuditResult[]> {
  const tasksDir = path.join(cwd, config.docDir, "tasks");
  const results: PlanAuditResult[] = [];

  if (!(await fs.pathExists(tasksDir))) return results;

  let taskDirs: string[];
  try {
    taskDirs = await fs.readdir(tasksDir);
  } catch {
    return results;
  }

  for (const taskDir of taskDirs) {
    const planPath = path.join(tasksDir, taskDir, "plan.json");
    const relPath = path.relative(cwd, planPath);

    if (!(await fs.pathExists(planPath))) continue;

    let data: unknown;
    try {
      data = await fs.readJSON(planPath);
    } catch {
      results.push({
        file: relPath,
        compatible: false,
        errors: [t("schema.parse_error")],
      });
      continue;
    }

    const result = PlanDataSchema.safeParse(data);
    if (result.success) {
      results.push({ file: relPath, compatible: true });
    } else {
      results.push({
        file: relPath,
        compatible: false,
        errors: result.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      });
    }
  }

  return results;
}

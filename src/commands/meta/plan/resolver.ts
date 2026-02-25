/** @fileoverview 负责解析 Plan 文件路径，通过 Task ID 定位 tasks/<ID>_<Slug>/plan.json */
import fs from "fs-extra";
import path from "path";
import { resolveDocDir } from "../../../core/doc-dir.ts";
import { PlanNotFoundError } from "../../../core/errors.ts";

/** Plan 文件的固定文件名 */
const PLAN_FILENAME = "plan.json";

export interface PlanFileInfo {
  /** Plan 文件的绝对路径 */
  filePath: string;
  /** 从目录名提取的 Task 名称 (e.g. "Subscription CRUD") */
  featureName: string;
}

/**
 * 解析 Plan 文件的绝对路径。
 * 在 {docDir}/tasks/ 下查找匹配 {id}_ 前缀的目录，读取其中的 plan.json。
 *
 * @param featureId Task ID (e.g. "SUB-01")
 * @param cwd 工作目录，默认 process.cwd()
 * @throws {PlanNotFoundError} 找不到匹配的 Plan 文件时
 */
export async function resolvePlanPath(
  featureId: string,
  cwd: string = process.cwd(),
): Promise<PlanFileInfo> {
  const docDir = await resolveDocDir(cwd);
  if (!docDir) throw new PlanNotFoundError(featureId);

  const tasksDir = path.join(docDir, "tasks");
  if (!(await fs.pathExists(tasksDir))) {
    throw new PlanNotFoundError(featureId);
  }

  // 在 tasks/ 下查找以 {id}_ 开头的目录
  const entries = await fs.readdir(tasksDir);
  const match = entries.find((e) => e.startsWith(`${featureId}_`));
  if (!match) throw new PlanNotFoundError(featureId);

  const planPath = path.join(tasksDir, match, PLAN_FILENAME);
  if (!(await fs.pathExists(planPath))) {
    throw new PlanNotFoundError(featureId);
  }

  // 从目录名提取 Task 名称: "SUB-01_Subscription_CRUD" → "Subscription CRUD"
  const featureName = match.replace(`${featureId}_`, "").replace(/_/g, " ");

  return { filePath: planPath, featureName };
}

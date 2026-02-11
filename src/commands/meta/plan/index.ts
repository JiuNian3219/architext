/**
 * ---
 * description: Plan 命令入口，协调 Resolver（路径解析）、Parser（checkbox 解析）和 Handler（检查输出）。
 * ---
 */
import fs from "fs-extra";
import { AppError } from "../../../core/errors.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { handlePlanCheck } from "./handlers.ts";
import { parsePlanCheckboxes } from "./parser.ts";
import { resolvePlanPath } from "./resolver.ts";

/**
 * Plan 命令的主入口函数。
 * 默认行为：检查指定 Feature 的 Plan 完成度。
 *
 * @param id Feature ID (e.g. "SUB-01")
 */
export async function planCommand(id: string): Promise<void> {
  if (!id) {
    const t = createT(getSystemLocale(), "plan");
    throw new AppError(t("id_required"), "PLAN_ID_REQUIRED", true);
  }

  const { filePath, featureName } = await resolvePlanPath(id);
  const content = await fs.readFile(filePath, "utf-8");
  const result = parsePlanCheckboxes(content);
  handlePlanCheck(id, featureName, result);
}

import { logger } from "@/utils/logger.ts";
import { intro, outro, spinner } from "@clack/prompts";
import fs from "fs-extra";
import color from "picocolors";
import { loadConfig } from "../../../core/config.ts";
import { AppError } from "../../../core/errors.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { cleanupOpencodeConfig, resolveUninstallPlan } from "./resolver.ts";

const t = createT(getSystemLocale(), "command.uninstall");

export const uninstallCommand = async () => {
  logger.clear();
  intro(color.bgRed(color.black(` ${t("title")} `)));

  const cwd = process.cwd();

  // 检查配置是否存在
  const config = await loadConfig(cwd);
  if (!config) {
    outro(color.yellow(t("not_found")));
    return;
  }

  const plan = resolveUninstallPlan(config, cwd);
  const totalItems = plan.files.length + plan.dirs.length;

  if (totalItems === 0) {
    outro(color.green(t("success")));
    return;
  }

  const s = spinner();
  s.start(t("cleaning"));

  try {
    // 处理 opencode.json（在删除配置文件之前）
    await cleanupOpencodeConfig(config, cwd);

    // 删除文件
    for (const file of plan.files) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }

    // 删除目录
    for (const dir of plan.dirs) {
      if (await fs.pathExists(dir)) {
        await fs.remove(dir);
      }
    }

    // 清理空目录
    for (const dir of plan.dirsToCheck) {
      if (dir === cwd) continue;
      if (!(await fs.pathExists(dir))) continue;
      const entries = await fs.readdir(dir);
      if (entries.length === 0) {
        await fs.remove(dir);
      }
    }

    s.stop(t("done"));
    outro(color.green(t("success")));
  } catch (error: unknown) {
    s.stop(color.red(t("error")));
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(message);
  }
};

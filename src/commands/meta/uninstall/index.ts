import { logger } from "@/utils/logger.ts";
import { confirm, intro, isCancel, outro, spinner } from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import color from "picocolors";
import { loadConfig } from "../../../core/config.ts";
import { AppError } from "../../../core/errors.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { resolveFilesToDelete } from "./resolver.ts";

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

  // 待删除的文件列表及空目录检查列表
  const { files: uniqueFiles, dirsToCheck } = await resolveFilesToDelete(cwd);

  if (uniqueFiles.length === 0) {
    outro(color.green(t("success")));
    return;
  }

  logger.warn(t("confirm_title"));
  logger.dim(t("files_to_delete"));
  uniqueFiles.forEach((f) => {
    logger.error(`  - ${path.relative(cwd, f)}`);
  });

  const shouldContinue = await confirm({
    message: t("confirm_msg"),
  });

  if (isCancel(shouldContinue) || !shouldContinue) {
    outro(color.yellow(t("cancel")));
    return;
  }

  const s = spinner();
  s.start(t("cleaning"));

  try {
    for (const file of uniqueFiles) {
      await fs.remove(file);
    }

    // 按深度降序检查目录：若已为空则一并删除
    for (const dir of dirsToCheck) {
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

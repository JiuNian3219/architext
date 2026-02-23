/** @fileoverview init 命令入口，协调 Prompter（交互）和 Scaffolder（执行）以完成项目初始化。 */
import { intro, outro } from "@clack/prompts";
import color from "picocolors";
import { saveConfig } from "../../../core/config.ts";
import { logger } from "../../../utils/logger.ts";
import { UserCancelError } from "../../../core/errors.ts";
import { Scaffolder } from "../../../core/scaffold.ts";
import type { InitOptions } from "../../../types/index.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { ConflictResolver } from "./conflict.ts";
import { collectInitConfig } from "./prompts.ts";

const t = createT(getSystemLocale(), "command.init");

/**
 * Init 命令的主入口函数。
 * 收集用户配置 → 保存配置 → 执行脚手架生成。
 *
 * @param options 命令行传入的初始化选项
 */
export async function initCommand(options: InitOptions): Promise<void> {
  logger.clear();
  intro(color.bgCyan(color.black(` ${t("title")} `)));

  const config = await collectInitConfig(options);
  if (!config) {
    outro(color.yellow(t("cancel")));
    return;
  }

  await saveConfig({
    language: config.language,
    editors: config.editors,
    docDir: config.docDir,
    features: config.features,
  });

  try {
    await Scaffolder.run(config, {
      resolveConflicts: ConflictResolver.resolve.bind(ConflictResolver),
    });
  } catch (error) {
    // ConflictResolver 在文件冲突时可能抛出 UserCancelError
    if (error instanceof UserCancelError) {
      outro(color.yellow(t("cancel")));
      return;
    }
    throw error;
  }

  outro(t("success"));
}

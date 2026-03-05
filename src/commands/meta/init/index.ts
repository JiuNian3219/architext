/** @fileoverview init 命令入口，协调 Prompter（交互）和 Scaffolder（执行）以完成项目初始化。 */
import { intro, outro } from "@clack/prompts";
import color from "picocolors";
import { loadConfig, saveConfig } from "../../../core/config.ts";
import { CURRENT_FILE_MODEL_VERSION } from "../../../core/file-model.ts";
import { UserCancelError } from "../../../core/errors.ts";
import { scaffold } from "../../../core/scaffold.ts";
import type { InitOptions } from "../../../types/index.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { ConflictResolver } from "./conflict.ts";
import { collectInitConfig } from "./prompts.ts";
import { logger } from "../../../utils/logger.ts";

const t = createT(getSystemLocale(), "command.init");

export async function initCommand(options: InitOptions): Promise<void> {
  logger.clear();
  intro(color.bgCyan(color.black(` ${t("title")} `)));

  const config = await collectInitConfig(options);
  if (!config) {
    outro(color.yellow(t("cancel")));
    return;
  }

  const existing = await loadConfig();
  await saveConfig({ ...(existing ?? {}), ...config });

  try {
    const result = await scaffold(config, {
      resolveConflicts: ConflictResolver.resolve.bind(ConflictResolver),
    });

    const persisted = await loadConfig();
    await saveConfig({
      ...config,
      ...(persisted ?? {}),
      structureVersion: CURRENT_FILE_MODEL_VERSION,
      ...(result?.opencodeInstructionsAdded && {
        opencodeInstructionsAdded: true,
      }),
    });
  } catch (error) {
    if (error instanceof UserCancelError) {
      outro(color.yellow(t("cancel")));
      return;
    }
    throw error;
  }

  outro(t("success"));
}

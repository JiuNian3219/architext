/**
 * ---
 * description: 更新 Architext 项目配置，包括文件结构、内容、提示词等。
 * ---
 */
import { intro, outro } from "@clack/prompts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";

// 暂时没有实现
export async function updateCommand(options: {
  dryRun: boolean;
  editor?: string;
}) {
  console.clear();
  const t = createT(getSystemLocale());

  intro("Architext Update");

  if (options.dryRun) {
    logger.warn(t("update.dry_run_msg"));
  }

  logger.dim(t("common.coming_soon"));

  outro("Done");
}

/** @fileoverview 检查 Architext 项目配置是否符合正确的配置，包括目录结构、内容、提示词等。 */
import { intro, outro } from "@clack/prompts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";

// 暂时没有实现
export async function doctorCommand(_options: { fix: boolean }) {
  console.clear();
  const t = createT(getSystemLocale());

  intro("Architext Doctor");

  logger.dim(t("common.coming_soon"));

  outro("Done");
}

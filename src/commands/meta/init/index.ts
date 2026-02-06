/**
 * ---
 * description: init 命令的入口文件，协调 Prompter（交互）和 Scaffolder（执行）以完成 Architext 框架的初始化。
 * ---
 */
import { cancel, outro } from "@clack/prompts";
import { saveConfig } from "../../../core/config.ts";
import { UserCancelError } from "../../../core/errors.ts";
import { Scaffolder } from "../../../core/scaffold.ts";
import type { InitOptions } from "../../../types/index.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { InitPrompter } from "./prompts.ts";

/**
 * 初始化 Architext 项目配置，包含目录结构、文档、提示词等。
 * @param options 初始化选项，包含语言、编辑器、文档目录
 * @returns
 */
export async function initCommand(options: InitOptions) {
  try {
    const t = createT(getSystemLocale(), "command.init");
    const prompter = new InitPrompter();
    const config = await prompter.run(options);

    await saveConfig({
      language: config.language,
      editors: config.editors,
      docDir: config.docDir,
    });

    await Scaffolder.run(config);

    outro(t("success"));
  } catch (error) {
    if (error instanceof UserCancelError) {
      cancel(error.message);
      return;
    }
    throw error;
  }
}

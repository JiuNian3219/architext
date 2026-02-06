/**
 * ---
 * description: 处理 init 命令的用户交互流程，收集语言、编辑器和文档目录等配置信息。
 * ---
 */

import { confirm, intro, isCancel, multiselect, select } from "@clack/prompts";
import color from "picocolors";
import { loadConfig } from "../../../core/config.ts";
import { UserCancelError } from "../../../core/errors.ts";
import {
  EDITOR_CONFIGS,
  LANGUAGE_CONFIGS,
  SUPPORTED_EDITORS,
} from "../../../core/rules.ts";
import type {
  ArchitextConfig,
  InitConfig,
  LocaleLang,
  SupportedEditor,
} from "../../../types/index.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";

const t = createT(getSystemLocale(), "command.init");

export class InitPrompter {
  private existingConfig: ArchitextConfig | null;

  constructor() {
    this.existingConfig = null;
  }

  /**
   * 运行 init 命令的用户交互流程，收集语言、编辑器和文档目录等配置信息。
   * @param options
   * @returns 初始化配置
   */
  async run(options: {
    editor?: string;
    language?: LocaleLang;
    doc?: string;
  }): Promise<InitConfig> {
    console.clear();
    intro(color.bgCyan(color.black(` ${t("title")} `)));

    this.existingConfig = await loadConfig();

    await this.checkOverwrite();

    const language = await this.askLanguage(options.language);
    const editors = await this.askEditors(options.editor);
    const docDir =
      options.doc || (this.existingConfig?.docDir as string) || ".architext";

    return {
      language,
      editors,
      docDir,
    };
  }

  /**
   * 检查是否存在配置文件，如果存在则询问用户是否覆盖
   */
  private async checkOverwrite() {
    if (this.existingConfig) {
      const shouldOverwrite = await confirm({
        message: t("config_exists"),
      });

      if (isCancel(shouldOverwrite) || !shouldOverwrite) {
        throw new UserCancelError(t("cancel"));
      }
    }
  }

  /**
   * 询问用户选择的语言
   * @param preselected 预选择的语言
   * @returns 选择的语言
   */
  private async askLanguage(preselected?: LocaleLang): Promise<LocaleLang> {
    const validLangs: LocaleLang[] = Object.keys(
      LANGUAGE_CONFIGS,
    ) as LocaleLang[];

    if (preselected && validLangs.includes(preselected)) {
      return preselected;
    }

    const response = await select({
      message: t("select_lang"),
      options: Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => ({
        value: key,
        label: config.label,
      })),
      initialValue: (this.existingConfig?.language as LocaleLang) || "zh",
    });

    if (isCancel(response)) {
      throw new UserCancelError(t("cancel"));
    }

    return response as LocaleLang;
  }

  /**
   * 询问用户选择的目标编辑器
   * @param preselected 预选择的编辑器
   * @returns 选择的编辑器列表
   */
  private async askEditors(preselected?: string): Promise<SupportedEditor[]> {
    const validEditors = SUPPORTED_EDITORS;
    if (preselected) {
      const selected = preselected
        .split(",")
        .map((e) => e.trim()) as SupportedEditor[];
      const valid = selected.filter((e) => validEditors.includes(e));
      if (valid.length > 0) return valid;
    }

    const response = await multiselect({
      message: t("select_editor"),
      options: SUPPORTED_EDITORS.map((key) => ({
        value: key,
        label: EDITOR_CONFIGS[key].label,
      })),
      required: true,
    });

    if (isCancel(response)) {
      throw new UserCancelError(t("cancel"));
    }

    return response as SupportedEditor[];
  }
}

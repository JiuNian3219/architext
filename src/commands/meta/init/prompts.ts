/** @fileoverview 处理 init 命令的用户交互流程，收集语言、编辑器和文档目录等配置信息。 */

import { confirm, isCancel, multiselect, select } from "@clack/prompts";
import { loadConfig } from "../../../core/config.ts";
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

/**
 * 检查是否存在配置文件，如果存在则询问用户是否覆盖。
 * @returns true 表示可以继续，false 表示用户取消
 */
async function checkOverwrite(
  existingConfig: ArchitextConfig | null,
): Promise<boolean> {
  if (!existingConfig) return true;

  const shouldOverwrite = await confirm({
    message: t("config_exists"),
  });

  if (isCancel(shouldOverwrite) || !shouldOverwrite) {
    return false;
  }
  return true;
}

/**
 * 询问用户选择的语言。
 * @param preselected 命令行预设的语言
 * @param existingConfig 已有的配置（用于设置默认值）
 * @returns 语言代码，或 null（用户取消时）
 */
async function askLanguage(
  preselected?: LocaleLang,
  existingConfig?: ArchitextConfig | null,
): Promise<LocaleLang | null> {
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
    initialValue: (existingConfig?.language as LocaleLang) || "zh",
  });

  if (isCancel(response)) {
    return null;
  }

  return response as LocaleLang;
}

/**
 * 询问用户选择的目标编辑器。
 * @param preselected 命令行预设的编辑器（逗号分隔）
 * @returns 编辑器列表，或 null（用户取消时）
 */
async function askEditors(
  preselected?: string,
): Promise<SupportedEditor[] | null> {
  if (preselected) {
    const selected = preselected
      .split(",")
      .map((e) => e.trim()) as SupportedEditor[];
    const valid = selected.filter((e) => SUPPORTED_EDITORS.includes(e));
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
    return null;
  }

  return response as SupportedEditor[];
}

/**
 * 收集 init 命令所需的全部配置信息。
 * @param options 命令行传入的预设选项
 * @returns 初始化配置，或 null（用户取消时）
 */
export async function collectInitConfig(options: {
  editor?: string;
  language?: LocaleLang;
  doc?: string;
}): Promise<InitConfig | null> {
  const existingConfig = await loadConfig();

  const canContinue = await checkOverwrite(existingConfig);
  if (!canContinue) return null;

  const language = await askLanguage(options.language, existingConfig);
  if (!language) return null;

  const editors = await askEditors(options.editor);
  if (!editors) return null;

  const docDir =
    options.doc || (existingConfig?.docDir as string) || ".architext";

  return { language, editors, docDir };
}

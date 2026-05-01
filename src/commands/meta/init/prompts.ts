/** @fileoverview 处理 init 命令的用户交互流程，收集语言、编辑器、项目类型和文档目录等配置信息。 */

import { confirm, isCancel, multiselect, select } from "@clack/prompts";
import { loadConfig } from "../../../core/config.ts";
import {
  EDITOR_CONFIGS,
  FEATURE_OPTIONS,
  LANGUAGE_CONFIGS,
  SUPPORTED_EDITORS,
} from "../../../core/rules.ts";
import type {
  ArchitextConfig,
  InitConfig,
  LocaleLang,
  ProjectFeature,
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
    initialValue: existingConfig?.language ?? "zh",
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
 * 询问是否生成 project-brief.md。
 * 生成后填写项目需求，供 /archi.init 使用。
 * @returns true/false，或 null（用户取消时）
 */
async function askGenerateBrief(): Promise<boolean | null> {
  const response = await confirm({
    message: t("select_generate_brief"),
    initialValue: true,
  });

  if (isCancel(response)) {
    return null;
  }

  return response;
}

/**
 * 询问项目特征（多选），用户直接勾选适用的特征标签。
 * @param preselected 命令行预设的特征标签（逗号分隔）
 * @returns 特征标签列表，或 null（用户取消时）
 */
async function askFeatures(
  preselected?: string,
): Promise<ProjectFeature[] | null> {
  if (preselected) {
    const selected = preselected
      .split(",")
      .map((f) => f.trim()) as ProjectFeature[];
    const validValues = FEATURE_OPTIONS.map((o) => o.value);
    const valid = selected.filter((f) => validValues.includes(f));
    if (valid.length > 0) return valid;
  }

  const response = await multiselect({
    message: t("select_features"),
    options: FEATURE_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
      hint: opt.hint,
    })),
    required: true,
  });

  if (isCancel(response)) {
    return null;
  }

  return response as ProjectFeature[];
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
  type?: string;
  yes?: boolean;
  brief?: boolean;
  notify?: boolean;
}): Promise<InitConfig | null> {
  const existingConfig = await loadConfig();

  if (options.yes) {
    // --yes: skip overwrite confirmation
  } else {
    const canContinue = await checkOverwrite(existingConfig);
    if (!canContinue) return null;
  }

  const language = await askLanguage(options.language, existingConfig);
  if (!language) return null;

  const editors = await askEditors(options.editor);
  if (!editors) return null;

  const features = await askFeatures(options.type);
  if (!features) return null;

  let generateBrief: boolean;
  if (options.brief !== undefined) {
    generateBrief = options.brief;
  } else {
    const response = await askGenerateBrief();
    if (response === null) return null;
    generateBrief = response;
  }

  // notify: 默认开启，无交互式询问；--no-notify 可禁用
  const notify = options.notify !== false;

  const docDir =
    options.doc || (existingConfig?.docDir as string) || ".architext";

  return { language, editors, docDir, features, generateBrief, notify };
}

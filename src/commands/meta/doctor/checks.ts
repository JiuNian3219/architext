/** @fileoverview doctor 命令的各组检查函数，全部只读，不修改任何文件。 */

import fs from "fs-extra";
import path from "path";
import {
  EDITOR_CONFIGS,
  FALLBACK_RULE_FILES,
  SUPPORTED_EDITORS,
} from "../../../core/rules.ts";
import {
  GLOBAL_SCHEMAS,
  RoadmapDataSchema,
} from "../../../core/schemas/index.ts";
import type { ArchitextConfig } from "../../../types/index.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import type { CheckResult } from "./types.ts";

const t = createT(getSystemLocale(), "command.doctor");

// ─── Group 1: 项目配置 ──────────────────────────────────────────────────────

/**
 * 检查 architext.json 是否存在、格式合法、关键字段有效。
 *
 * @param cwd - 当前工作目录
 * @returns config（成功时）或 null（配置缺失/损坏时）
 */
export async function runConfigChecks(
  cwd: string,
): Promise<{ config: ArchitextConfig | null; results: CheckResult[] }> {
  const results: CheckResult[] = [];
  const configPath = path.join(cwd, "architext.json");

  if (!(await fs.pathExists(configPath))) {
    results.push({
      label: "architext.json",
      status: "fail",
      detail: t("check.config.not_found"),
      hint: t("check.config.hint_init"),
    });
    return { config: null, results };
  }
  results.push({ label: "architext.json", status: "pass" });

  let config: ArchitextConfig;
  try {
    config = await fs.readJSON(configPath);
  } catch {
    results.push({
      label: t("check.config.format_label"),
      status: "fail",
      detail: t("check.config.format_fail"),
    });
    return { config: null, results };
  }
  results.push({ label: t("check.config.format_label"), status: "pass" });

  const editors = config.editors ?? [];
  const invalidEditors = editors.filter((e) => !SUPPORTED_EDITORS.includes(e));
  if (editors.length === 0) {
    results.push({
      label: t("check.config.editors_label"),
      status: "warn",
      detail: t("check.config.editors_empty"),
    });
  } else if (invalidEditors.length > 0) {
    results.push({
      label: t("check.config.editors_label"),
      status: "warn",
      detail: t("check.config.editors_invalid", {
        list: invalidEditors.join(", "),
      }),
    });
  } else {
    results.push({
      label: t("check.config.editors_ok", { list: editors.join(", ") }),
      status: "pass",
    });
  }

  const validLangs = ["zh", "zh-Hant", "en"];
  if (!validLangs.includes(config.language)) {
    results.push({
      label: t("check.config.lang_label"),
      status: "warn",
      detail: t("check.config.lang_invalid", { lang: config.language }),
    });
  } else {
    results.push({
      label: t("check.config.lang_ok", { lang: config.language }),
      status: "pass",
    });
  }

  const docDirDisplay = config.docDir || t("check.config.doc_dir_unset");
  results.push({
    label: t("check.config.doc_dir", { dir: docDirDisplay }),
    status: config.docDir ? "pass" : "warn",
    detail: config.docDir ? undefined : t("check.config.doc_dir_empty"),
  });

  return { config, results };
}

// ─── Group 2: 文档目录结构 ───────────────────────────────────────────────────

interface DirSpec {
  rel: string;
  label: string;
  /** true = fail；false = warn */
  required: boolean;
  hint: string;
}

/** 检查 docDir 及其子目录是否存在。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 检查结果
 */
export async function runDocStructureChecks(
  config: ArchitextConfig,
  cwd: string,
): Promise<CheckResult[]> {
  const dirs: DirSpec[] = [
    {
      rel: config.docDir,
      label: `${config.docDir}/`,
      required: true,
      hint: t("check.dir.hint_init"),
    },
    {
      rel: path.join(config.docDir, "global"),
      label: "global/",
      required: true,
      hint: t("check.dir.hint_init"),
    },
    {
      rel: path.join(config.docDir, "prompts"),
      label: "prompts/",
      required: false,
      hint: t("check.dir.hint_update"),
    },
    {
      rel: path.join(config.docDir, "templates"),
      label: "templates/",
      required: false,
      hint: t("check.dir.hint_update"),
    },
    {
      rel: path.join(config.docDir, "features"),
      label: "features/",
      required: false,
      hint: t("check.dir.hint_features", { docDir: config.docDir }),
    },
  ];

  const results: CheckResult[] = [];
  for (const dir of dirs) {
    const exists = await fs.pathExists(path.join(cwd, dir.rel));
    results.push(
      exists
        ? { label: dir.label, status: "pass" }
        : {
            label: dir.label,
            status: dir.required ? "fail" : "warn",
            detail: t("check.dir.missing"),
            hint: dir.hint,
          },
    );
  }
  return results;
}

// ─── Group 3: 全局文档 ───────────────────────────────────────────────────────

interface GlobalFileSpec {
  name: string;
  /** true = 缺失时 fail；false = warn */
  required: boolean;
  schemaKey?: string;
}

const GLOBAL_FILES: GlobalFileSpec[] = [
  { name: "vision.md", required: false },
  { name: "roadmap.json", required: true },
  { name: "map.json", required: false, schemaKey: "map.json" },
  { name: "dictionary.json", required: false, schemaKey: "dictionary.json" },
];

/** 检查全局文档是否存在，JSON 文件同时执行 Schema 校验。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 检查结果
 */
export async function runGlobalFileChecks(
  config: ArchitextConfig,
  cwd: string,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const globalDir = path.join(cwd, config.docDir, "global");

  for (const spec of GLOBAL_FILES) {
    const filePath = path.join(globalDir, spec.name);

    if (!(await fs.pathExists(filePath))) {
      results.push({
        label: spec.name,
        status: spec.required ? "fail" : "warn",
        detail: spec.required
          ? t("check.global.required_missing")
          : t("check.global.optional_missing"),
      });
      continue;
    }

    if (!spec.name.endsWith(".json")) {
      results.push({ label: spec.name, status: "pass" });
      continue;
    }

    let data: unknown;
    try {
      data = await fs.readJSON(filePath);
    } catch {
      results.push({
        label: spec.name,
        status: "fail",
        detail: t("check.global.parse_fail"),
      });
      continue;
    }

    if (spec.name === "roadmap.json") {
      const parsed = RoadmapDataSchema.safeParse(data);
      const version =
        data && typeof data === "object" && "version" in data
          ? String((data as Record<string, unknown>).version)
          : "?";
      results.push({
        label: parsed.success
          ? t("check.global.roadmap_ok", { version })
          : "roadmap.json",
        status: parsed.success ? "pass" : "warn",
        detail: parsed.success
          ? undefined
          : parsed.error.issues.map((i) => i.message).join("; "),
        hint: parsed.success ? undefined : t("check.global.roadmap_hint"),
      });
      continue;
    }

    if (spec.schemaKey) {
      const schema = GLOBAL_SCHEMAS[spec.schemaKey];
      const parsed = schema.safeParse(data);
      results.push({
        label: spec.name,
        status: parsed.success ? "pass" : "warn",
        detail: parsed.success
          ? undefined
          : parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
      });
      continue;
    }

    results.push({ label: spec.name, status: "pass" });
  }

  return results;
}

// ─── Group 4: IDE 规则 ───────────────────────────────────────────────────────

/** 对每个已配置的编辑器，检查规则目录和六个核心规则文件是否存在。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 检查结果
 */
export async function runIdeRulesChecks(
  config: ArchitextConfig,
  cwd: string,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const editor of config.editors) {
    const editorCfg = EDITOR_CONFIGS[editor];
    if (!editorCfg) continue;

    const rulesDir = path.join(cwd, editorCfg.targetDir);
    const dirExists = await fs.pathExists(rulesDir);

    results.push({
      label: `[${editorCfg.label}] ${editorCfg.targetDir}/`,
      status: dirExists ? "pass" : "fail",
      detail: dirExists ? undefined : t("check.rules.dir_missing"),
      hint: dirExists ? undefined : t("check.rules.dir_hint"),
    });

    if (!dirExists) continue;

    for (const ruleFile of FALLBACK_RULE_FILES) {
      const fileName = ruleFile.replace(".md", editorCfg.targetExt);
      const exists = await fs.pathExists(path.join(rulesDir, fileName));
      results.push({
        label: `  ${fileName}`,
        status: exists ? "pass" : "warn",
        detail: exists ? undefined : t("check.rules.file_missing"),
        hint: exists ? undefined : t("check.rules.file_hint"),
      });
    }
  }

  return results;
}

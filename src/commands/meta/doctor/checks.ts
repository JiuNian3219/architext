/** @fileoverview doctor 命令的各组检查函数，全部只读，不修改任何文件。 */

import fs from "fs-extra";
import path from "path";
import { EDITOR_CONFIGS, SUPPORTED_EDITORS } from "../../../core/rules.ts";
import { getCurrentFileModel, resolveFiles } from "../../../core/file-model.ts";
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

  const validLangs = ["zh", "en"];
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

/**
 * 检查 docDir 及其骨架子目录是否存在。
 * 骨架目录列表来自 resolveFiles().scaffoldDirs，确保与实际部署保持一致。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 检查结果
 */
export async function runDocStructureChecks(
  config: ArchitextConfig,
  cwd: string,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // docDir 本身
  const docDirExists = await fs.pathExists(path.join(cwd, config.docDir));
  results.push(
    docDirExists
      ? { label: `${config.docDir}/`, status: "pass" }
      : {
          label: `${config.docDir}/`,
          status: "fail",
          detail: t("check.dir.missing"),
          hint: t("check.dir.hint_init"),
        },
  );

  // docDir/global — 全局资产必须存在
  const globalDir = path.join(config.docDir, "global");
  const globalExists = await fs.pathExists(path.join(cwd, globalDir));
  results.push(
    globalExists
      ? { label: "global/", status: "pass" }
      : {
          label: "global/",
          status: "fail",
          detail: t("check.dir.missing"),
          hint: t("check.dir.hint_init"),
        },
  );

  // 骨架目录（tasks/refs/scripts）— 来自 FileModel，可选
  const model = getCurrentFileModel();
  const resolved = resolveFiles(model, config);
  for (const dir of resolved.scaffoldDirs) {
    const label = `${dir.split("/").pop()}/`;
    const exists = await fs.pathExists(path.join(cwd, dir));
    results.push(
      exists
        ? { label, status: "pass" }
        : {
            label,
            status: "warn",
            detail: t("check.dir.missing"),
            hint: t("check.dir.hint_tasks", { docDir: config.docDir }),
          },
    );
  }

  return results;
}

// ─── Group 3: 全局文档 ───────────────────────────────────────────────────────

interface GlobalFileSpec {
  name: string;
  required: boolean;
  schemaKey?: string;
}

/**
 * 从 FileModel 动态生成全局文件检查清单（含 features 条件过滤）。
 * roadmap.json 标为 required，其余标为 optional。
 *
 * @param config - 配置
 * @returns 全局文件检查清单
 */
function buildGlobalFileSpecs(config: ArchitextConfig): GlobalFileSpec[] {
  const model = getCurrentFileModel();
  const featureSet = new Set(config.features ?? []);
  const specs: GlobalFileSpec[] = [];

  for (const seed of model.globalSeeds) {
    const fileName = typeof seed === "string" ? seed : seed.file;
    if (typeof seed !== "string" && !featureSet.has(seed.feature)) continue;

    const isRequired = fileName === "roadmap.json";
    const schemaKey = GLOBAL_SCHEMAS[fileName] ? fileName : undefined;
    specs.push({ name: fileName, required: isRequired, schemaKey });
  }

  return specs;
}

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
  const globalFiles = buildGlobalFileSpecs(config);

  for (const spec of globalFiles) {
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

// ─── Group 4: IDE 框架文件 ────────────────────────────────────────────────────

/**
 * 检查各编辑器的框架文件（rules / prompts / skills）是否完整。
 * 文件清单来自 resolveFiles().frameworkFiles + frameworkDirs，确保与实际部署一致。
 *
 * @param config - 配置
 * @param cwd - 当前工作目录
 * @returns 检查结果
 */
export async function runIdeRulesChecks(
  config: ArchitextConfig,
  cwd: string,
): Promise<CheckResult[]> {
  if (config.editors.length === 0) return [];

  const results: CheckResult[] = [];
  const model = getCurrentFileModel();
  const resolved = resolveFiles(model, config);

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

    // rules
    for (const rule of model.rules) {
      const fileName = `${rule}${editorCfg.targetExt}`;
      const exists = await fs.pathExists(path.join(rulesDir, fileName));
      results.push({
        label: `  ${fileName}`,
        status: exists ? "pass" : "warn",
        detail: exists ? undefined : t("check.rules.file_missing"),
        hint: exists ? undefined : t("check.rules.file_hint"),
      });
    }
  }

  // prompts — 路径因编辑器而异，直接从 frameworkFiles 里筛
  const promptFiles = resolved.frameworkFiles.filter((f) =>
    f.includes("archi."),
  );
  for (const relPath of promptFiles) {
    const exists = await fs.pathExists(path.join(cwd, relPath));
    const label = `  ${relPath.split("/").pop()}`;
    results.push({
      label,
      status: exists ? "pass" : "warn",
      detail: exists ? undefined : t("check.rules.file_missing"),
      hint: exists ? undefined : t("check.rules.file_hint"),
    });
  }

  // skills dirs
  for (const relDir of resolved.frameworkDirs) {
    const exists = await fs.pathExists(path.join(cwd, relDir));
    const label = `  ${relDir.split("/").slice(-2).join("/")}`;
    results.push({
      label,
      status: exists ? "pass" : "warn",
      detail: exists ? undefined : t("check.rules.file_missing"),
      hint: exists ? undefined : t("check.rules.file_hint"),
    });
  }

  return results;
}

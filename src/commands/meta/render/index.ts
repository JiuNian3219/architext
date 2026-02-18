/** @fileoverview Render 命令入口，将 JSON 数据文件渲染为人类可读的 Markdown 视图。 */
import fs from "fs-extra";
import path from "path";
import { loadConfig } from "../../../core/config.ts";
import { resolveDocDir } from "../../../core/doc-dir.ts";
import { AppError } from "../../../core/errors.ts";
import {
  PlanDataSchema,
  RoadmapDataSchema,
  validateJson,
} from "../../../core/schemas/index.ts";
import type { RoadmapData } from "../../../core/roadmap/types.ts";
import type { PlanData } from "../plan/types.ts";
import type { LocaleLang } from "../../../types/index.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { renderRoadmap } from "./roadmap-renderer.ts";
import { renderPlan } from "./plan-renderer.ts";

const t = createT(getSystemLocale(), "command.render");

/**
 * 解析渲染输出语言：优先使用项目配置，否则使用系统 locale
 * @returns 渲染输出语言
 */
async function resolveRenderLang(): Promise<LocaleLang> {
  const config = await loadConfig();
  const lang = config?.language;
  if (lang === "zh" || lang === "zh-Hant" || lang === "en") return lang;
  return getSystemLocale();
}

/**
 * Render 命令的主入口函数。
 * 扫描全局 JSON 文件和 Feature plan.json，校验 Schema 后生成对应的 .md 视图。
 */
export async function renderCommand(): Promise<void> {
  const docDir = await resolveDocDir();
  if (!docDir) {
    throw new AppError(
      "Documentation directory not found. Run 'archi init' first.",
      "DOC_DIR_NOT_FOUND",
      true,
    );
  }

  let rendered = 0;
  const lang = await resolveRenderLang();

  // 渲染全局 roadmap.json → roadmap.md（先校验再渲染）
  const roadmapJson = path.join(docDir, "global", "roadmap.json");
  if (await fs.pathExists(roadmapJson)) {
    const raw = await fs.readJSON(roadmapJson);
    const data = validateJson<RoadmapData>(
      RoadmapDataSchema,
      raw,
      "roadmap.json",
    );
    const md = renderRoadmap(data, lang);
    const mdPath = path.join(docDir, "global", "roadmap.md");
    await fs.writeFile(mdPath, md, "utf-8");
    logger.step(`roadmap.json → roadmap.md`);
    rendered++;
  }

  // 渲染 features/*/plan.json → plan.md（先校验再渲染）
  const featuresDir = path.join(docDir, "features");
  if (await fs.pathExists(featuresDir)) {
    const entries = await fs.readdir(featuresDir);
    for (const entry of entries) {
      const planJson = path.join(featuresDir, entry, "plan.json");
      if (await fs.pathExists(planJson)) {
        const raw = await fs.readJSON(planJson);
        const data = validateJson<PlanData>(
          PlanDataSchema,
          raw,
          `${entry}/plan.json`,
        );
        const md = renderPlan(data, lang);
        const mdPath = path.join(featuresDir, entry, "plan.md");
        await fs.writeFile(mdPath, md, "utf-8");
        logger.step(`${entry}/plan.json → plan.md`);
        rendered++;
      }
    }
  }

  if (rendered === 0) {
    logger.warn(t("empty"));
  } else {
    logger.success(t("done", { count: rendered }));
  }
}

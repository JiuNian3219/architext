/**
 * @fileoverview project-brief.md 生成器。
 *
 * 读取 _base.md + _modules.md，根据选中的特征标签提取模块片段，
 * 拼入骨架占位符后写到项目根目录。
 */

import fs from "fs-extra";
import path from "path";
import {
  BRIEF_ASSETS_DIR,
  BRIEF_BASE_NAME,
  BRIEF_MODULES_NAME,
  BRIEF_OUTPUT_NAME,
  GLOBAL_RULES,
} from "./rules.ts";
import type { ProjectFeature } from "../types/index.ts";

export async function generateBrief(
  sourceDir: string,
  features: ProjectFeature[],
  replacements: Record<string, string>,
): Promise<void> {
  const briefsDir = path.join(sourceDir, GLOBAL_RULES.PATHS.BRIEFS_SOURCE);
  const basePath = path.join(briefsDir, BRIEF_BASE_NAME);

  if (!(await fs.pathExists(basePath))) return;

  let base = await fs.readFile(basePath, "utf-8");

  const modulesPath = path.join(briefsDir, BRIEF_MODULES_NAME);
  const modules = (await fs.pathExists(modulesPath))
    ? await fs.readFile(modulesPath, "utf-8")
    : "";

  const featureTags = new Set<string>(features);
  const techSnippets: string[] = [];
  const styleSnippets: string[] = [];

  const blockRe = /<!-- @(tech|style):(\w+) -->\n([\s\S]*?)<!-- @end -->/g;
  let match;
  while ((match = blockRe.exec(modules)) !== null) {
    const [, slot, tag, content] = match;
    if (!featureTags.has(tag)) continue;
    const trimmed = content.trimEnd();
    if (slot === "tech") techSnippets.push(trimmed);
    else if (slot === "style") styleSnippets.push(trimmed);
  }

  base = base.replace("<!-- @slot:tech -->", techSnippets.join("\n"));
  base = base.replace(
    "<!-- @slot:style -->",
    styleSnippets.length > 0 ? styleSnippets.join("\n\n") + "\n\n" : "",
  );

  for (const [key, value] of Object.entries(replacements)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    base = base.replace(new RegExp(escapedKey, "g"), value);
  }

  base = base.replace(/\n{3,}/g, "\n\n");

  const destPath = path.join(process.cwd(), BRIEF_OUTPUT_NAME);
  await fs.writeFile(destPath, base, "utf-8");

  const assetsDir = path.join(process.cwd(), BRIEF_ASSETS_DIR);
  await fs.ensureDir(assetsDir);
}

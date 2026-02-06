import fs from "fs-extra";
import path from "path";
import { CONFIG_NAME, loadConfig } from "../../../core/config.ts";
import {
  EDITOR_CONFIGS,
  FALLBACK_RULE_FILES,
  GLOBAL_RULES,
} from "../../../core/rules.ts";
import { TemplateManager } from "../../../core/template.ts";

/**
 * 计算需要卸载的文件列表
 * @param cwd 当前工作目录
 * @returns 唯一的文件绝对路径列表
 */
export async function resolveFilesToDelete(cwd: string): Promise<string[]> {
  const config = await loadConfig(cwd);
  const filesToDelete: string[] = [];

  // 配置文件 (architext.json)
  const configPath = path.resolve(cwd, CONFIG_NAME);
  if (await fs.pathExists(configPath)) {
    filesToDelete.push(configPath);
  }

  if (!config) {
    return filesToDelete;
  }

  // 文档目录 (.architext)
  if (config.docDir) {
    const docPath = path.resolve(cwd, config.docDir);
    if (await fs.pathExists(docPath)) {
      filesToDelete.push(docPath);
    }
  }

  // 编辑器规则 (.cursor/rules, etc.)
  if (config.editors && config.editors.length > 0) {
    // 尝试动态获取规则列表，失败则使用回退列表
    let ruleBaseNames: string[] = [];
    try {
      const templateRoot = await TemplateManager.getRoot();
      // 使用 'zh' 作为文件名来源的基准
      const rulesSource = path.join(
        templateRoot,
        "zh",
        GLOBAL_RULES.PATHS.RULES_SOURCE,
      );
      if (await fs.pathExists(rulesSource)) {
        const files = await fs.readdir(rulesSource);
        ruleBaseNames = files
          .filter((f) => f.endsWith(".md"))
          .map((f) => path.basename(f, ".md"));
      }
    } catch {}

    if (ruleBaseNames.length === 0) {
      ruleBaseNames = FALLBACK_RULE_FILES.map((f) => path.basename(f, ".md"));
    }

    for (const editor of config.editors) {
      const editorConfig = EDITOR_CONFIGS[editor];
      if (editorConfig) {
        const editorDir = path.resolve(cwd, editorConfig.targetDir);
        if (await fs.pathExists(editorDir)) {
          // 检查每个规则文件
          for (const baseName of ruleBaseNames) {
            const fileName = baseName + editorConfig.targetExt;
            const filePath = path.join(editorDir, fileName);
            if (await fs.pathExists(filePath)) {
              filesToDelete.push(filePath);
            }
          }
        }
      }
    }
  }

  return Array.from(new Set(filesToDelete));
}

import fs from "fs-extra";
import path from "path";
import { CONFIG_NAME, loadConfig } from "../../../core/config.ts";
import {
  EDITOR_CONFIGS,
  FALLBACK_RULE_FILES,
  GLOBAL_RULES,
} from "../../../core/rules.ts";
import { TemplateManager } from "../../../core/template.ts";

export interface UninstallPlan {
  /** 需要删除的文件/目录绝对路径（已去重） */
  files: string[];
  /** 文件删除后需要检查是否为空、空则删除的目录（已去重，按深度降序排列） */
  dirsToCheck: string[];
}

/**
 * 计算需要卸载的文件列表及删除后需要检查是否为空的目录列表
 * @param cwd 当前工作目录
 */
export async function resolveFilesToDelete(
  cwd: string,
): Promise<UninstallPlan> {
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
    } catch {
      // 如果无法读取模板目录，忽略错误，使用回退列表
    }

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

        // 处理 Commands 文件（如果编辑器配置了 commands）
        if (editorConfig.commands) {
          const commandsDir = path.resolve(
            cwd,
            editorConfig.commands.targetDir,
          );
          if (await fs.pathExists(commandsDir)) {
            // 从 prompts 目录读取文件列表，删除对应的 commands 文件
            try {
              const templateRoot = await TemplateManager.getRoot();
              // 使用 'zh' 作为文件名来源的基准（所有语言的 prompts 文件名相同）
              const promptsSource = path.join(
                templateRoot,
                "zh",
                GLOBAL_RULES.PATHS.PROMPTS_SOURCE,
              );
              if (await fs.pathExists(promptsSource)) {
                const promptFiles = await fs.readdir(promptsSource);
                for (const promptFile of promptFiles) {
                  if (promptFile.endsWith(".md")) {
                    const baseName = path.basename(promptFile, ".md");
                    const commandFileName = `archi.${baseName}.md`;
                    const commandFilePath = path.join(
                      commandsDir,
                      commandFileName,
                    );
                    if (await fs.pathExists(commandFilePath)) {
                      filesToDelete.push(commandFilePath);
                    }
                  }
                }
              }
            } catch {
              // 如果无法读取模板，尝试删除整个 commands 目录
              if (await fs.pathExists(commandsDir)) {
                filesToDelete.push(commandsDir);
              }
            }
          }
        }

        // 处理 Skills 文件（如果编辑器配置了 skills）
        if (editorConfig.skills) {
          const skillsTargetDir = path.resolve(
            cwd,
            editorConfig.skills.targetDir,
          );
          if (await fs.pathExists(skillsTargetDir)) {
            try {
              const templateRoot = await TemplateManager.getRoot();
              const skillsSource = path.join(
                templateRoot,
                "zh",
                GLOBAL_RULES.PATHS.SKILLS_SOURCE,
              );
              if (await fs.pathExists(skillsSource)) {
                const skillDirs = await fs.readdir(skillsSource);
                for (const skillDir of skillDirs) {
                  const skillTargetPath = path.join(skillsTargetDir, skillDir);
                  if (await fs.pathExists(skillTargetPath)) {
                    filesToDelete.push(skillTargetPath);
                  }
                }
              }
            } catch {
              // 如果无法读取模板，忽略错误
            }
          }
        }
      }
    }
  }

  // 收集删除后需要检查是否为空的目录
  // 仅收集 Architext 已知管理的目录，避免误删用户目录
  const dirsToCheckSet = new Set<string>();
  if (config?.editors && config.editors.length > 0) {
    for (const editor of config.editors) {
      const editorConfig = EDITOR_CONFIGS[editor];
      if (!editorConfig) continue;

      const rulesDir = path.resolve(cwd, editorConfig.targetDir);
      dirsToCheckSet.add(rulesDir);
      // 编辑器根目录（如 .cursor、.windsurf）
      dirsToCheckSet.add(path.dirname(rulesDir));

      if (editorConfig.commands) {
        dirsToCheckSet.add(path.resolve(cwd, editorConfig.commands.targetDir));
      }
      if (editorConfig.skills) {
        dirsToCheckSet.add(path.resolve(cwd, editorConfig.skills.targetDir));
      }
    }
  }

  // 按路径深度降序，优先删除更深的目录
  const dirsToCheck = Array.from(dirsToCheckSet).sort(
    (a, b) => b.split(path.sep).length - a.split(path.sep).length,
  );

  return {
    files: Array.from(new Set(filesToDelete)),
    dirsToCheck,
  };
}

/**
 * @fileoverview IDE 集成处理器。
 *
 * 负责在 scaffold/init 阶段写入各 IDE 的专属配置文件，包括：
 * 1. 规则文件路径配置 (instructions/rules)
 * 2. 桌面通知 hooks 配置 (OpenCode 和 Claude Code)
 *
 * 目前支持：OpenCode、Claude（桌面通知）
 */

import fs from "fs-extra";
import path from "path";
import type { SupportedEditor } from "../types/index.ts";

// ─── OpenCode 集成 ───────────────────────────────────────────────────────────

/**
 * OpenCode 配置结构
 */
interface OpenCodeConfig {
  instructions?: string[];
  plugin?: string[];
}

/**
 * OpenCode 插件内容 - 桌面通知
 */
const OPENCODE_NOTIFY_PLUGIN = `/**
 * Architext 桌面通知插件
 * 在会话空闲时触发 npx archi notify
 */
export const architextNotify = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await $\`npx archi notify\`;
      }
    }
  };
};
`;

/**
 * 当 editors 包含 opencode 时，在项目根目录生成或更新 opencode.json，
 * 将 Architext 规则路径注入 instructions 字段。
 * 路径已存在时跳过（幂等），避免重复追加。
 */
export async function applyOpenCodeIntegration(): Promise<boolean> {
  const destPath = path.join(process.cwd(), "opencode.json");
  const archiPath = ".opencode/rules/*.md";

  if (await fs.pathExists(destPath)) {
    try {
      const existing = JSON.parse(await fs.readFile(destPath, "utf-8"));
      const instructions = existing.instructions;
      if (Array.isArray(instructions)) {
        if (instructions.includes(archiPath)) return false;
        instructions.push(archiPath);
      } else {
        existing.instructions = [archiPath];
      }
      await fs.writeFile(destPath, JSON.stringify(existing, null, 2), "utf-8");
      return true;
    } catch {
      return false;
    }
  }

  await fs.writeFile(
    destPath,
    JSON.stringify({ instructions: [archiPath] }, null, 2),
    "utf-8",
  );
  return true;
}

/**
 * 为 OpenCode 配置桌面通知插件
 * 在 .opencode/plugins/architext-notify.js 创建插件文件
 *
 * 注意：OpenCode 会自动加载 .opencode/plugins/ 目录下的插件文件，
 * 不需要在 opencode.json 中显式配置
 */
export async function applyOpenCodeNotifyIntegration(): Promise<boolean> {
  const pluginDir = path.join(process.cwd(), ".opencode/plugins");
  const pluginPath = path.join(pluginDir, "architext-notify.js");

  // 检查是否已存在
  if (await fs.pathExists(pluginPath)) {
    return false;
  }

  // 创建插件目录
  await fs.ensureDir(pluginDir);

  // 写入插件文件
  await fs.writeFile(pluginPath, OPENCODE_NOTIFY_PLUGIN, "utf-8");

  return true;
}

/**
 * 清理 OpenCode 中的 Architext 配置（包括 rules 和插件）
 */
export async function cleanupOpenCodeIntegration(): Promise<void> {
  const configPath = path.join(process.cwd(), "opencode.json");
  const pluginPath = path.join(
    process.cwd(),
    ".opencode/plugins/architext-notify.js",
  );
  const archiPath = ".opencode/rules/*.md";

  // 删除插件文件
  if (await fs.pathExists(pluginPath)) {
    await fs.remove(pluginPath);
  }

  if (!(await fs.pathExists(configPath))) return;

  try {
    const content: OpenCodeConfig = JSON.parse(
      await fs.readFile(configPath, "utf-8"),
    );
    let modified = false;

    // 清理 instructions
    if (Array.isArray(content.instructions)) {
      const filtered = content.instructions.filter(
        (p: string) => p !== archiPath,
      );
      if (filtered.length !== content.instructions.length) {
        if (filtered.length === 0) {
          delete content.instructions;
        } else {
          content.instructions = filtered;
        }
        modified = true;
      }
    }

    if (!modified) return;

    if (Object.keys(content).length === 0) {
      await fs.remove(configPath);
    } else {
      await fs.writeFile(configPath, JSON.stringify(content, null, 2), "utf-8");
    }
  } catch {
    // JSON 损坏时跳过
  }
}

// ─── Claude Code 集成 ───────────────────────────────────────────────────────

/**
 * Claude Code hook 配置结构
 * 符合 https://code.claude.com/docs/zh-CN/hooks 标准
 */
interface ClaudeHookConfig {
  type: "command" | "http" | "prompt" | "agent";
  command?: string;
  url?: string;
  timeout?: number;
  statusMessage?: string;
}

interface ClaudeSettingsConfig {
  hooks?: {
    Stop?: Array<{
      hooks: ClaudeHookConfig[];
    }>;
  };
}

/**
 * 为 Claude Code 配置桌面通知 hooks
 * 在 .claude/settings.json 中添加 Stop 事件 hook（Claude 完成回复时触发）
 */
export async function applyClaudeNotifyIntegration(): Promise<boolean> {
  const destPath = path.join(process.cwd(), ".claude/settings.json");

  await fs.ensureDir(path.dirname(destPath));

  let config: ClaudeSettingsConfig = {};

  if (await fs.pathExists(destPath)) {
    try {
      config = JSON.parse(await fs.readFile(destPath, "utf-8"));
    } catch {
      config = {};
    }
  }

  if (!config.hooks) config.hooks = {};
  if (!config.hooks.Stop) config.hooks.Stop = [];

  // 检查是否已存在相同的 hook
  const exists = config.hooks.Stop.some((group) =>
    group.hooks.some(
      (h) => h.type === "command" && h.command === "npx archi notify",
    ),
  );
  if (exists) return false;

  // 添加标准 Stop hook 格式
  config.hooks.Stop.push({
    hooks: [
      {
        type: "command",
        command: "npx archi notify",
      },
    ],
  });

  await fs.writeFile(destPath, JSON.stringify(config, null, 2), "utf-8");
  return true;
}

/**
 * 清理 Claude Code hooks 配置
 */
export async function cleanupClaudeNotifyIntegration(): Promise<void> {
  const destPath = path.join(process.cwd(), ".claude/settings.json");

  if (!(await fs.pathExists(destPath))) return;

  try {
    const config: ClaudeSettingsConfig = JSON.parse(
      await fs.readFile(destPath, "utf-8"),
    );
    if (!config.hooks?.Stop) return;

    const originalLength = config.hooks.Stop.length;
    config.hooks.Stop = config.hooks.Stop.filter(
      (group) =>
        !group.hooks.some(
          (h) => h.type === "command" && h.command === "npx archi notify",
        ),
    );

    if (config.hooks.Stop.length === originalLength) return;

    if (config.hooks.Stop.length === 0) delete config.hooks.Stop;
    if (Object.keys(config.hooks).length === 0) delete config.hooks;

    if (Object.keys(config).length === 0) {
      await fs.remove(destPath);
    } else {
      await fs.writeFile(destPath, JSON.stringify(config, null, 2), "utf-8");
    }
  } catch {
    // JSON 损坏时跳过
  }
}

// ─── 统一入口 ───────────────────────────────────────────────────────────────

export interface IdeIntegrationResult {
  opencodeInstructionsAdded: boolean;
  opencodeNotifyAdded: boolean;
  claudeNotifyAdded: boolean;
}

/**
 * 根据 editors 列表和 notify 设置，依次执行所有需要的 IDE 集成。
 * 返回各集成的执行摘要，供上层汇总输出。
 *
 * @param editors - 选中的编辑器列表
 * @param enableNotify - 是否启用桌面通知
 * @returns 各集成的执行结果
 */
export async function applyIdeIntegrations(
  editors: SupportedEditor[],
  enableNotify: boolean = true,
): Promise<IdeIntegrationResult> {
  const result: IdeIntegrationResult = {
    opencodeInstructionsAdded: false,
    opencodeNotifyAdded: false,
    claudeNotifyAdded: false,
  };

  // 应用 OpenCode 规则配置和桌面通知
  if (editors.includes("opencode")) {
    result.opencodeInstructionsAdded = await applyOpenCodeIntegration();
    if (enableNotify) {
      result.opencodeNotifyAdded = await applyOpenCodeNotifyIntegration();
    }
  }

  // 应用 Claude Code 桌面通知配置（仅在 enableNotify 为 true 时）
  if (enableNotify && editors.includes("claude")) {
    result.claudeNotifyAdded = await applyClaudeNotifyIntegration();
  }

  return result;
}

/**
 * 根据 editors 列表清理所有 IDE 集成配置。
 * 用于 uninstall 时清理。
 *
 * @param editors - 选中的编辑器列表
 */
export async function cleanupIdeIntegrations(
  editors: SupportedEditor[],
): Promise<void> {
  // 清理 OpenCode
  if (editors.includes("opencode")) {
    await cleanupOpenCodeIntegration();
  }

  // 清理 Claude
  if (editors.includes("claude")) {
    await cleanupClaudeNotifyIntegration();
  }
}

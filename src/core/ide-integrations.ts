/**
 * @fileoverview IDE 集成处理器。
 *
 * 负责在 scaffold/init 阶段写入各 IDE 的专属配置文件。
 * 目前支持 OpenCode（opencode.json），后续可扩展其他 IDE。
 */

import fs from "fs-extra";
import path from "path";

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
 * 根据 editors 列表，依次执行所有需要的 IDE 集成。
 * 返回各集成的执行摘要，供上层汇总输出。
 */
export async function applyIdeIntegrations(
  editors: string[],
): Promise<{ opencodeInstructionsAdded: boolean }> {
  const opencodeInstructionsAdded = editors.includes("opencode")
    ? await applyOpenCodeIntegration()
    : false;

  return { opencodeInstructionsAdded };
}

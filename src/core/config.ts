/**
 * ---
 * description: 负责管理项目级配置文件 (architext.json) 的加载与保存，维护配置数据的持久化。
 * ---
 */
import { ArchitextConfig } from "@/types/index.ts";
import fs from "fs-extra";
import path from "path";
import { ConfigParseError } from "./errors.ts";

export const CONFIG_NAME = "architext.json";

/**
 * 加载项目配置文件 (architext.json)
 * @param cwd 当前工作目录，默认当前执行目录
 * @returns 解析后的配置对象或 null（文件不存在）
 * @throws ConfigParseError 当配置文件存在但 JSON 格式错误时
 */
export async function loadConfig(
  cwd: string = process.cwd(),
): Promise<ArchitextConfig | null> {
  const configPath = path.join(cwd, CONFIG_NAME);

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  try {
    return await fs.readJSON(configPath);
  } catch (error: any) {
    // 明确抛出解析错误，避免被误判为“无配置”
    if (error instanceof SyntaxError) {
      throw new ConfigParseError(
        `Failed to parse ${CONFIG_NAME}: ${error.message}`,
      );
    }
    throw error;
  }
}

/**
 * 保存项目配置文件 (architext.json)
 * @param config 要保存的配置对象，不包含 updatedAt 字段
 * @param cwd 当前工作目录，默认当前执行目录
 */
export async function saveConfig(
  config: Omit<ArchitextConfig, "updatedAt">,
  cwd: string = process.cwd(),
) {
  const configPath = path.join(cwd, CONFIG_NAME);
  const finalConfig: ArchitextConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeJSON(configPath, finalConfig, { spaces: 2 });
}

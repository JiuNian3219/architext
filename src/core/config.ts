/** @fileoverview 负责管理项目级配置文件 (architext.json) 的加载与保存，维护配置数据的持久化。 */
import { ArchitextConfig } from "@/types/index.ts";
import fs from "fs-extra";
import path from "path";
import { ZodError } from "zod";
import { ArchitextConfigSchema } from "./schemas/config.schema.ts";
import { ConfigParseError } from "./errors.ts";

export const CONFIG_NAME = "architext.json";

/**
 * 将 Zod 校验错误格式化为用户可读的提示信息
 *
 * @param err - Zod 校验错误
 * @returns 格式化后的错误信息
 */
function formatZodErrors(err: ZodError): string {
  const details = err.issues
    .map((issue) => {
      const pathStr = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `  - ${pathStr}: ${issue.message}`;
    })
    .join("\n");
  return `${CONFIG_NAME} schema validation failed:\n${details}`;
}

/**
 * 加载项目配置文件 (architext.json)
 * @param cwd 当前工作目录，默认当前执行目录
 * @returns 解析后的配置对象或 null（文件不存在）
 * @throws ConfigParseError 当配置文件存在但 JSON 格式错误或结构不完整时
 */
export async function loadConfig(
  cwd: string = process.cwd(),
): Promise<ArchitextConfig | null> {
  const configPath = path.join(cwd, CONFIG_NAME);

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  let raw: unknown;
  try {
    raw = await fs.readJSON(configPath);
  } catch (error: unknown) {
    // 明确抛出解析错误，避免被误判为“无配置”
    if (error instanceof SyntaxError) {
      throw new ConfigParseError(
        `Failed to parse ${CONFIG_NAME}: ${error.message}`,
      );
    }
    throw error;
  }

  const result = ArchitextConfigSchema.safeParse(raw);
  if (!result.success) {
    throw new ConfigParseError(formatZodErrors(result.error));
  }

  return result.data as ArchitextConfig;
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

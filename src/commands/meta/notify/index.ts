/** @fileoverview 跨平台桌面通知命令 — 供 Claude Code/OpenCode hooks 调用 */

import notifier from "node-notifier";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createT, getSystemLocale } from "../../../utils/t.ts";

const t = createT(getSystemLocale(), "notify");

/**
 * 获取默认图标路径
 */
const getDefaultIcon = async (): Promise<string> => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // 候选路径：生产环境（dist）→ 开发环境（src）→ 全局安装
  const candidates = [
    resolve(__dirname, "templates/icon.svg"),
    resolve(__dirname, "../templates/icon.svg"),
    resolve(process.cwd(), "node_modules/architext/templates/icon.svg"),
  ];

  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      return candidate;
    }
  }

  return "";
};

/**
 * 发送跨平台桌面通知
 *
 * @param message - 通知消息
 * @returns void
 */
export const notifyCommand = async (message?: string): Promise<void> => {
  const msg = message || t("defaultMessage");
  const icon = await getDefaultIcon();

  notifier.notify({
    title: t("title"),
    message: msg,
    icon: icon || undefined,
    wait: false,
    sound: true,
  });
};

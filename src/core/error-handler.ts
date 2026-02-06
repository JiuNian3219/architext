/**
 * ---
 * description: 统一错误处理模块，负责捕获并格式化应用中的各类错误，确保 CLI 输出的友好性与一致性。
 * ---
 */

import { logger } from "../utils/logger.ts";
import { createT, getSystemLocale } from "../utils/t.ts";
import { AppError, UserCancelError } from "./errors.ts";

const t = createT(getSystemLocale(), "common.error");

/**
 * 全局错误处理器
 * 根据错误类型（用户取消、应用错误、系统错误）进行差异化日志输出与进程退出控制
 */
export const handleError = (error: unknown) => {
  // 用户主动取消操作
  if (error instanceof UserCancelError) {
    logger.warn(t("cancel", { msg: error.message }));
    process.exit(0);
  }

  // 应用级已知错误
  if (error instanceof AppError) {
    logger.error(t("internal", { code: error.code, msg: error.message }));

    if (!error.isUserError) {
      logger.error(error.stack || error.message);
    }
    process.exit(1);
  }

  // 非预期系统错误
  if (error instanceof Error) {
    logger.error(t("unexpected", { msg: error.message }));
    logger.error(error.stack || error.message);
    process.exit(1);
  }

  // 4. 未知类型错误 (Unknown)
  logger.error(t("unknown"));
  process.exit(1);
};

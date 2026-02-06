/**
 * ---
 * description: 提供统一的日志输出接口，封装 console.log 等方法，支持颜色区分不同日志级别（info、success、warn、error、dim）。
 * ---
 */

import color from "picocolors";

export const logger = {
  info: (msg: string) => console.log(color.cyan(msg)),
  success: (msg: string) => console.log(color.green(msg)),
  warn: (msg: string) => console.warn(color.yellow(msg)),
  error: (msg: string) => console.error(color.red(msg)),
  dim: (msg: string) => console.log(color.dim(msg)),

  step: (msg: string) => console.log(color.cyan(`➤ ${msg}`)),
  done: (msg: string) => console.log(color.green(`✔ ${msg}`)),
  fail: (msg: string) => console.error(color.red(`✖ ${msg}`)),
};

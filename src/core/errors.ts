/**
 * ---
 * description: 定义应用级错误体系（Error Models），包含基类 AppError 及各类具体业务异常，作为系统错误类型的“字典”。
 * ---
 */

/**
 * 应用级错误基类
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly isUserError: boolean;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    isUserError: boolean = false,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.isUserError = isUserError;
  }
}

export class UserCancelError extends AppError {
  constructor(message: string = "Operation cancelled") {
    super(message, "USER_CANCEL", true);
  }
}

export class TemplateNotFoundError extends AppError {
  constructor(path: string) {
    super(`Template not found at: ${path}`, "TEMPLATE_NOT_FOUND", false);
  }
}

export class ConfigParseError extends AppError {
  constructor(message: string) {
    super(message, "CONFIG_PARSE_ERROR", true);
  }
}

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

export class RoadmapNotFoundError extends AppError {
  constructor() {
    super(
      "Roadmap file not found. Please create '00_roadmap.md' or configure 'roadmap' in architext.json",
      "ROADMAP_NOT_FOUND",
      true,
    );
  }
}

export class TaskNotFoundError extends AppError {
  constructor(taskId: string) {
    super(`Task [${taskId}] not found.`, "TASK_NOT_FOUND", true);
  }
}

export class InvalidTaskStatusError extends AppError {
  constructor(status: string) {
    super(
      `Invalid status: '${status}'. Valid values: pending, active, done, blocked`,
      "INVALID_TASK_STATUS",
      true,
    );
  }
}

export class PlanNotFoundError extends AppError {
  constructor(featureId: string) {
    super(
      `Plan file not found for feature [${featureId}]. Expected at: {docDir}/features/${featureId}_*/plan.md`,
      "PLAN_NOT_FOUND",
      true,
    );
  }
}

export class RoadmapConsistencyError extends AppError {
  public readonly issues: string[];

  constructor(issues: string[]) {
    super(
      `Roadmap has ${issues.length} inconsistencies.`,
      "ROADMAP_INCONSISTENCY",
      true,
    );
    this.issues = issues;
  }
}

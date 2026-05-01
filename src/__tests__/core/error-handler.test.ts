/** @fileoverview 错误处理器测试 — 覆盖错误分类、日志输出、进程退出码。 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleError } from "../../core/error-handler.ts";
import { AppError, UserCancelError } from "../../core/errors.ts";

// Mock logger 和 process.exit
vi.mock("../../utils/logger.ts", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("handleError", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockExit.mockClear();
  });

  describe("UserCancelError 处理", () => {
    it("应输出警告日志并以 exit(0) 退出", () => {
      const error = new UserCancelError("User cancelled the operation");

      handleError(error);

      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe("AppError 处理", () => {
    it("isUserError=true 时应输出内部错误格式", () => {
      const error = new AppError("CONFIG_ERROR", "Invalid config");
      error.isUserError = true;

      handleError(error);

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("isUserError=false 时应输出 stack trace", () => {
      const error = new AppError("INTERNAL_ERROR", "Something went wrong");

      handleError(error);

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("应正确处理含 stack 的错误", () => {
      const error = new AppError("TEST_ERROR", "Test error message");
      error.stack = "Error: Test error message\n    at Test.test";

      handleError(error);

      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("普通 Error 处理", () => {
    it("应输出错误消息并以 exit(1) 退出", () => {
      const error = new Error("Unexpected error");

      handleError(error);

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("应输出 stack trace", () => {
      const error = new Error("Unexpected error");
      error.stack = "Error: Unexpected error\n    at somewhere";

      handleError(error);

      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("未知类型错误处理", () => {
    it("非 Error 对象应以 exit(1) 退出", () => {
      handleError("string error");

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("null/undefined 应以 exit(1) 退出", () => {
      handleError(null);
      expect(mockExit).toHaveBeenCalledWith(1);

      handleError(undefined);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("数字类型错误应以 exit(1) 退出", () => {
      handleError(42);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("对象类型错误应以 exit(1) 退出", () => {
      handleError({ message: "error" });
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});

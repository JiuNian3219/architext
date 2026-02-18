/** @fileoverview 测试日志工具函数 (logger.ts) */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../../utils/logger.ts";

describe("logger", () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    // Mock console 方法
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    // 恢复原始 console
    Object.assign(console, originalConsole);
  });

  it("info 应该调用 console.log", () => {
    logger.info("test message");
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it("success 应该调用 console.log", () => {
    logger.success("test message");
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it("warn 应该调用 console.warn", () => {
    logger.warn("test message");
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("error 应该调用 console.error", () => {
    logger.error("test message");
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("dim 应该调用 console.log", () => {
    logger.dim("test message");
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it("step 应该输出带前缀的消息", () => {
    logger.step("test step");
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("test step"),
    );
  });

  it("done 应该输出带前缀的消息", () => {
    logger.done("test done");
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("test done"),
    );
  });

  it("fail 应该输出带前缀的消息", () => {
    logger.fail("test fail");
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("test fail"),
    );
  });
});

/** @fileoverview 测试日志工具函数 (logger.ts) - 验证输出格式、颜色和边界场景 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../../utils/logger.ts";
import color from "picocolors";

describe("logger", () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  // ─────────────────────────────────────────────────────────────────
  // 基础输出：验证颜色和内容
  // ─────────────────────────────────────────────────────────────────

  describe("基础输出方法", () => {
    it("info 应输出青色内容", () => {
      logger.info("test message");
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(color.cyan("test message"));
    });

    it("success 应输出绿色内容", () => {
      logger.success("success message");
      expect(console.log).toHaveBeenCalledWith(color.green("success message"));
    });

    it("warn 应输出黄色内容到 console.warn", () => {
      logger.warn("warning message");
      expect(console.warn).toHaveBeenCalledWith(
        color.yellow("warning message"),
      );
    });

    it("error 应输出红色内容到 console.error", () => {
      logger.error("error message");
      expect(console.error).toHaveBeenCalledWith(color.red("error message"));
    });

    it("dim 应输出暗淡内容", () => {
      logger.dim("dim message");
      expect(console.log).toHaveBeenCalledWith(color.dim("dim message"));
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 带前缀方法：验证格式
  // ─────────────────────────────────────────────────────────────────

  describe("带前缀方法", () => {
    it("step 应输出青色带 ➤ 前缀", () => {
      logger.step("processing");
      expect(console.log).toHaveBeenCalledWith(color.cyan("➤ processing"));
    });

    it("done 应输出绿色带 ✔ 前缀", () => {
      logger.done("completed");
      expect(console.log).toHaveBeenCalledWith(color.green("✔ completed"));
    });

    it("fail 应输出红色带 ✖ 前缀到 console.error", () => {
      logger.fail("failed task");
      expect(console.error).toHaveBeenCalledWith(color.red("✖ failed task"));
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // raw 方法：验证无颜色处理
  // ─────────────────────────────────────────────────────────────────

  describe("raw 方法", () => {
    it("raw 应原样输出，不添加颜色", () => {
      logger.raw("plain text");
      expect(console.log).toHaveBeenCalledWith("plain text");
    });

    it("raw 应保留已有 ANSI 代码", () => {
      const colored = color.red("already colored");
      logger.raw(colored);
      expect(console.log).toHaveBeenCalledWith(colored);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 边界测试：空值、特殊字符、Unicode
  // ─────────────────────────────────────────────────────────────────

  describe("边界测试", () => {
    it("空字符串应正常输出", () => {
      logger.info("");
      expect(console.log).toHaveBeenCalledWith(color.cyan(""));
    });

    it("纯空格字符串应正常输出", () => {
      logger.info("   ");
      expect(console.log).toHaveBeenCalledWith(color.cyan("   "));
    });

    it("Unicode 字符应正常输出", () => {
      const unicode = "你好世界 🌍 日本語";
      logger.info(unicode);
      expect(console.log).toHaveBeenCalledWith(color.cyan(unicode));
    });

    it("Emoji 应正常输出", () => {
      const emoji = "✅❌⚠️🔧🚀";
      logger.success(emoji);
      expect(console.log).toHaveBeenCalledWith(color.green(emoji));
    });

    it("控制字符应正常输出", () => {
      const control = "line1\nline2\ttabbed";
      logger.info(control);
      expect(console.log).toHaveBeenCalledWith(color.cyan(control));
    });

    it("超长字符串应正常输出", () => {
      const long = "x".repeat(10000);
      logger.info(long);
      expect(console.log).toHaveBeenCalledWith(color.cyan(long));
    });

    it("特殊符号应正常输出", () => {
      const special = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      logger.warn(special);
      expect(console.warn).toHaveBeenCalledWith(color.yellow(special));
    });

    it("JSON 格式字符串应正常输出", () => {
      const json = '{"key": "value", "number": 123}';
      logger.info(json);
      expect(console.log).toHaveBeenCalledWith(color.cyan(json));
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // clear 方法
  // ─────────────────────────────────────────────────────────────────

  describe("clear 方法", () => {
    it("clear 应调用 console.clear", () => {
      const originalClear = console.clear;
      console.clear = vi.fn();

      logger.clear();
      expect(console.clear).toHaveBeenCalledTimes(1);

      console.clear = originalClear;
    });
  });
});

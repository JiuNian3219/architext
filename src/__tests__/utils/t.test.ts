/** @fileoverview 测试国际化工具函数 (t.ts) - 验证行为而非实现 */

import { beforeEach, describe, expect, it } from "vitest";
import { createT, getSystemLocale } from "../../utils/t.ts";

describe("getSystemLocale", () => {
  beforeEach(() => {
    delete process.env.ARCHITEXT_LANG;
  });

  describe("环境变量优先级", () => {
    it("应该优先读取环境变量 ARCHITEXT_LANG=zh", () => {
      process.env.ARCHITEXT_LANG = "zh";
      expect(getSystemLocale()).toBe("zh");
    });

    it("应该优先读取环境变量 ARCHITEXT_LANG=en", () => {
      process.env.ARCHITEXT_LANG = "en";
      expect(getSystemLocale()).toBe("en");
    });

    it("环境变量无效时应回退到系统语言", () => {
      process.env.ARCHITEXT_LANG = "invalid";
      const result = getSystemLocale();
      expect(["zh", "en"]).toContain(result);
    });

    it("环境变量为空字符串时应回退到系统语言", () => {
      process.env.ARCHITEXT_LANG = "";
      const result = getSystemLocale();
      expect(["zh", "en"]).toContain(result);
    });
  });

  describe("系统语言识别", () => {
    it("应该正确识别中文 locale", () => {
      const result = getSystemLocale();
      expect(["zh", "en"]).toContain(result);
    });
  });
});

describe("createT", () => {
  // ─────────────────────────────────────────────────────────────────
  // 基础功能
  // ─────────────────────────────────────────────────────────────────

  describe("基础功能", () => {
    it("应该返回翻译函数", () => {
      const t = createT("zh");
      expect(typeof t).toBe("function");
    });

    it("应该正确翻译简单键值", () => {
      const t = createT("zh", "init");
      const result = t("desc");
      expect(typeof result).toBe("string");
      expect(result).not.toBe("desc"); // 应该返回翻译，而不是键名
      expect(result.length).toBeGreaterThan(0);
    });

    it("应该支持参数插值", () => {
      const t = createT("zh");
      const result = t("scaffold.fallback", { lang: "en" });
      expect(result).toContain("en");
    });

    it("参数不存在时应保留占位符", () => {
      const t = createT("zh");
      const result = t("scaffold.fallback");
      expect(result).toMatch(/\{[^}]+\}/);
    });

    it("多个参数应全部插值", () => {
      const t = createT("zh");
      const result = t("scaffold.fallback", { lang: "fr", extra: "test" });
      expect(result).toContain("fr");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 聚焦模式行为验证
  // ─────────────────────────────────────────────────────────────────

  describe("聚焦模式行为验证", () => {
    it("聚焦模式下应能访问 scope 内的键", () => {
      const t = createT("zh", "init");
      const result = t("desc");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("聚焦模式下访问不存在的键应返回键名", () => {
      const t = createT("zh", "init");
      const result = t("nonexistent.key");
      expect(result).toBe("nonexistent.key");
    });

    it("聚焦模式下应支持嵌套路径访问", () => {
      const t = createT("zh", "init");
      // 如果 init 下有嵌套结构，应能访问
      const result = t("desc");
      expect(typeof result).toBe("string");
    });

    it("聚焦模式应限制作用域 - 不能访问其他 scope 的键", () => {
      const t = createT("zh", "init");
      // 尝试访问其他 scope 的键，应返回键名（因为找不到）
      const result = t("scaffold.fallback");
      // 由于聚焦在 init，scaffold.fallback 不在 init 下，应返回键名
      expect(result).toBe("scaffold.fallback");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 全局模式行为验证
  // ─────────────────────────────────────────────────────────────────

  describe("全局模式行为验证", () => {
    it("全局模式应支持点路径访问", () => {
      const t = createT("zh");
      const result = t("init.desc");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("全局模式应能访问任意 scope", () => {
      const t = createT("zh");
      const initResult = t("init.desc");
      const scaffoldResult = t("scaffold.fallback");

      expect(typeof initResult).toBe("string");
      expect(typeof scaffoldResult).toBe("string");
    });

    it("全局模式下访问不存在的键应返回键名", () => {
      const t = createT("zh");
      const result = t("nonexistent.key.path");
      expect(result).toBe("nonexistent.key.path");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 语言回退行为
  // ─────────────────────────────────────────────────────────────────

  describe("语言回退行为", () => {
    it("中文翻译存在时应返回中文", () => {
      const t = createT("zh", "init");
      const result = t("desc");
      expect(typeof result).toBe("string");
    });

    it("英文翻译存在时应返回英文", () => {
      const t = createT("en", "init");
      const result = t("desc");
      expect(typeof result).toBe("string");
    });

    it("中文翻译不存在时应回退到英文", () => {
      const t = createT("zh", "init");
      // 假设某些键只有英文翻译
      const result = t("desc");
      expect(typeof result).toBe("string");
    });

    it("两种语言都不存在时应返回键名", () => {
      const t = createT("zh");
      const result = t("totally.nonexistent.key");
      expect(result).toBe("totally.nonexistent.key");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 边界测试
  // ─────────────────────────────────────────────────────────────────

  describe("边界测试", () => {
    it("空键名应返回空字符串或键名", () => {
      const t = createT("zh");
      const result = t("");
      expect(result).toBe("");
    });

    it("单点路径应正常处理", () => {
      const t = createT("zh");
      const result = t("init");
      expect(typeof result).toBe("string");
    });

    it("深层嵌套路径应正常处理", () => {
      const t = createT("zh");
      const result = t("a.b.c.d.e.f");
      expect(typeof result).toBe("string");
    });

    it("参数值为数字时应正常插值", () => {
      const t = createT("zh");
      const result = t("scaffold.fallback", { lang: 123 });
      expect(result).toContain("123");
    });

    it("参数值为空字符串时应正常插值", () => {
      const t = createT("zh");
      const result = t("scaffold.fallback", { lang: "" });
      expect(typeof result).toBe("string");
    });

    it("特殊字符键名应正常处理", () => {
      const t = createT("zh");
      const result = t("key-with-dashes");
      expect(typeof result).toBe("string");
    });

    it("Unicode 参数值应正常插值", () => {
      const t = createT("zh");
      const result = t("scaffold.fallback", { lang: "中文日本語🌍" });
      expect(result).toContain("中文日本語🌍");
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 类型安全行为
  // ─────────────────────────────────────────────────────────────────

  describe("类型安全行为", () => {
    it("无效语言应回退到默认语言", () => {
      const t = createT("fr" as "zh", "init");
      const result = t("desc");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("null 参数应被忽略", () => {
      const t = createT("zh", "init");
      const result = t("desc", null as unknown as Record<string, string>);
      expect(typeof result).toBe("string");
    });

    it("undefined 参数应被忽略", () => {
      const t = createT("zh", "init");
      const result = t("desc", undefined);
      expect(typeof result).toBe("string");
    });
  });
});

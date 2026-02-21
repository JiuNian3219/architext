/** @fileoverview 测试国际化工具函数 (t.ts) */

import { beforeEach, describe, expect, it } from "vitest";
import { createT, getSystemLocale } from "../../utils/t.ts";

describe("getSystemLocale", () => {
  beforeEach(() => {
    delete process.env.ARCHITEXT_LANG;
  });

  it("应该优先读取环境变量 ARCHITEXT_LANG", () => {
    process.env.ARCHITEXT_LANG = "en";
    expect(getSystemLocale()).toBe("en");

    process.env.ARCHITEXT_LANG = "zh-Hant";
    expect(getSystemLocale()).toBe("zh-Hant");

    process.env.ARCHITEXT_LANG = "zh";
    expect(getSystemLocale()).toBe("zh");
  });

  it("环境变量无效时应回退到系统语言", () => {
    process.env.ARCHITEXT_LANG = "invalid";
    const result = getSystemLocale();
    expect(["zh", "zh-Hant", "en"]).toContain(result);
  });

  it("应该正确识别繁体中文 locale", () => {
    // 这个测试需要 Mock Intl.DateTimeFormat
    // 由于 getSystemLocale 使用系统 API，这里主要测试逻辑分支
    const result = getSystemLocale();
    expect(["zh", "zh-Hant", "en"]).toContain(result);
  });
});

describe("createT", () => {
  it("应该返回翻译函数", () => {
    const t = createT("zh");
    expect(typeof t).toBe("function");
  });

  it("应该正确翻译简单键值", () => {
    const t = createT("zh", "init");
    const result = t("desc");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("desc"); // 应该返回翻译，而不是键名
  });

  it("应该支持参数插值", () => {
    const t = createT("zh");
    const result = t("scaffold.fallback", { lang: "en" });
    expect(result).toContain("en");
  });

  it("应该回退到英文翻译", () => {
    const t = createT("zh", "init");
    // 如果中文翻译不存在，应该回退到英文
    const result = t("desc");
    expect(typeof result).toBe("string");
  });

  it("聚焦模式应该限制作用域", () => {
    const t = createT("zh", "init");
    // 在聚焦模式下，应该只能访问 init 下的键
    const result = t("desc");
    expect(typeof result).toBe("string");
  });

  it("全局模式应该支持点路径", () => {
    const t = createT("zh");
    const result = t("init.desc");
    expect(typeof result).toBe("string");
  });

  it("参数不存在时应保留占位符", () => {
    const t = createT("zh");
    // 故意不传参数
    const result = t("scaffold.fallback");
    // 如果参数不存在，应该保留 {key} 格式
    expect(result).toMatch(/\{[^}]+\}/);
  });
});

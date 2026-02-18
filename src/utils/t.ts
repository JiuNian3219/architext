/** @fileoverview 提供类型安全的国际化 (i18n) 工具函数，支持嵌套路径访问和参数插值，确保 CLI 输出的多语言一致性。 */

import en from "../locales/en.json" with { type: "json" };
import zhHant from "../locales/zh-Hant.json" with { type: "json" };
import zh from "../locales/zh.json" with { type: "json" };
import type { LocaleLang } from "../types/index.ts";
import type { ObjectPath, Path, PathValue } from "../types/utils.ts";

const locales = { zh, "zh-Hant": zhHant, en };
type Schema = typeof zh; // 以中文文件为结构标准

/**
 * 安全的深度取值函数
 * @param obj 要取值的对象
 * @param path 点分路径，例如 'init.title'
 * @returns 路径对应的值，或 undefined
 */
function get(obj: unknown, path: string): unknown {
  if (!obj) return undefined;
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc !== null && acc !== undefined && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * 获取系统语言
 * 优先读取环境变量 ARCHITEXT_LANG (便于测试)，其次读取系统语言
 * @returns 'zh' | 'zh-Hant' | 'en'
 */
export function getSystemLocale(): LocaleLang {
  // 优先读取环境变量
  const envLang = process.env.ARCHITEXT_LANG;
  if (envLang) {
    if (envLang === "zh-Hant" || envLang === "zh" || envLang === "en") {
      return envLang;
    }
  }

  // 读取系统语言
  const systemLocale = new Intl.DateTimeFormat().resolvedOptions().locale;

  // 显式匹配常见的繁体中文 Locale
  if (
    ["zh-Hant", "zh-TW", "zh-HK", "zh-MO"].some((l) =>
      systemLocale.startsWith(l),
    )
  ) {
    return "zh-Hant";
  }

  return systemLocale.startsWith("zh") ? "zh" : "en";
}

/**
 * 聚焦模式 (传入了 Scope)
 * 例如: createT('zh', 'init') -> t('title')
 * 提示范围: 仅限 init 下的 key
 */
export function createT<Scope extends ObjectPath<Schema>>(
  lang: LocaleLang,
  scope: Scope,
): (
  key: Path<PathValue<Schema, Scope>>,
  params?: Record<string, string | number>,
) => string;

/**
 * 全局模式 (没有传 Scope)
 * 例如: createT('zh') -> t('init.title')
 * 提示范围: 全局所有点路径
 */
export function createT(
  lang: LocaleLang,
): (key: Path<Schema>, params?: Record<string, string | number>) => string;

/**
 * 创建翻译函数的具体实现
 */
export function createT(lang: LocaleLang = "zh", scope?: string) {
  const rootDict = locales[lang] || locales.zh;
  const rootFallback = locales.en;

  // 如果有 scope，先把字典范围缩小
  const currentDict = scope ? get(rootDict, scope) : rootDict;
  const currentFallback = scope ? get(rootFallback, scope) : rootFallback;

  return (key: string, params?: Record<string, string | number>) => {
    let msg: unknown;

    if (scope) {
      // 聚焦模式：支持深度路径访问
      msg = get(currentDict, key) || get(currentFallback, key);
    } else {
      // 全局模式：解析点语法
      msg = get(rootDict, key) || get(rootFallback, key);
    }

    if (!msg) return key;
    if (!params) return String(msg);

    // 正则式替换参数，替换 {key} 为 params[key]
    return String(msg).replace(/\{(\w+)\}/g, (match, k) => {
      return params[k] !== undefined ? String(params[k]) : match;
    });
  };
}

/** @fileoverview 数据解析器：向 npm registry 查询最新版本并与当前安装版本对比。 */

import pkg from "../../../../package.json" with { type: "json" };

export interface VersionCheckResult {
  current: string;
  latest: string;
  isOutdated: boolean;
}

/**
 * 向 npm registry 查询 architext 最新版本并与当前版本对比。
 * 网络异常或超时时静默失败，返回 null。
 */
export async function checkVersion(): Promise<VersionCheckResult | null> {
  try {
    const response = await fetch(
      "https://registry.npmjs.org/architext/latest",
      { signal: AbortSignal.timeout(5000) },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { version: string };
    const latest = data.version;
    const current = pkg.version;

    return {
      current,
      latest,
      isOutdated: compareVersions(latest, current) > 0,
    };
  } catch {
    return null;
  }
}

/**
 * 语义化版本比较：a > b 返回正数，a < b 返回负数，相等返回 0
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

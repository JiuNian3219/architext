/**
 * @fileoverview pack 命令的 XML 序列化器。
 *
 * 将 PackEntry 列表序列化为 Repomix 风格的 XML 字符串。
 */

import type { ArchitextConfig } from "../../../types/index.ts";
import type { PackEntry } from "./collector.ts";

/**
 * 将用户数据条目序列化为 XML 字符串。
 * 文件内容以 CDATA 包裹，特殊字符自动转义。
 *
 * @param entries - 用户数据条目列表
 * @param config - 配置
 * @param version - 版本
 * @returns XML 字符串
 */
export function buildXml(
  entries: PackEntry[],
  config: ArchitextConfig,
  version: string,
): string {
  const date = new Date().toISOString().split("T")[0];

  const fileBlocks = entries
    .map(({ path: filePath, content }) => {
      const safeContent = content.replace(/]]>/g, "]]]]><![CDATA[>");
      return [
        `  <file path="${filePath}">`,
        `<![CDATA[`,
        safeContent,
        `]]>`,
        `  </file>`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!--`,
    `  Architext User Data Pack`,
    `  CLI Version : ${version}`,
    `  DocDir      : ${config.docDir}`,
    `  Editors     : ${config.editors.join(", ")}`,
    `  Created     : ${date}`,
    `  Files       : ${entries.length}`,
    ``,
    `  Restore with:`,
    `    archi recover architext-pack.xml`,
    `-->`,
    `<architext-pack version="${version}" doc-dir="${config.docDir}" created="${date}">`,
    ``,
    `  <files>`,
    ``,
    fileBlocks,
    ``,
    `  </files>`,
    ``,
    `</architext-pack>`,
  ].join("\n");
}

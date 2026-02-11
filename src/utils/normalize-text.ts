/**
 * ---
 * description: 文本归一化工具 — 去除 BOM、统一换行符，适用于解析 AI 生成或跨平台编辑的文本内容。
 * ---
 */

/**
 * 归一化文本内容：去除 BOM 标记、统一行尾为 \n。
 *
 * Why: AI 生成的内容或 Windows 编辑器保存的文件可能包含 BOM (\uFEFF)、
 *      Windows 换行符 (\r\n) 或旧 Mac 换行符 (\r)，在按行解析前需要统一处理。
 *
 * @param content 原始文本内容
 * @returns 归一化后的文本（无 BOM，行尾统一为 \n）
 */
export function normalizeText(content: string): string {
  return content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/**
 * 归一化文本并按行拆分。
 *
 * 等价于 `normalizeText(content).split("\n")`，作为高频组合操作的便捷方法。
 *
 * @param content 原始文本内容
 * @returns 归一化后按 \n 拆分的行数组
 */
export function normalizeLines(content: string): string[] {
  return normalizeText(content).split("\n");
}

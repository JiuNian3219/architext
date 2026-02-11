/**
 * ---
 * description: 解析 Plan 文件 (plan.md) 中的 checkbox 任务，按 section 分组并识别人工验收区域。
 * ---
 */

import { normalizeLines } from "../../../utils/normalize-text.ts";
import type { PlanCheckItem, PlanCheckResult, PlanSection } from "./types.ts";

/**
 * 被视为人工验收的 section 名关键词（小写匹配）。
 * 覆盖中英文及繁体中文的常见命名。
 */
const MANUAL_KEYWORDS = [
  "manual verification",
  "manual check",
  "manual",
  "人工验收",
  "手动验证",
  "手動驗證",
  "人工驗收",
];

/**
 * 解析 Plan 文件内容，提取所有 checkbox 项并按 section 分组。
 *
 * 解析策略：
 *   1. 用 ## / ### 标题跟踪"当前所在 section"
 *   2. 匹配标准 Markdown checkbox 语法（- [ ] / - [x] / * [ ] / * [x]）
 *   3. 根据 section 名是否包含 MANUAL_KEYWORDS 判断是否为人工验收区域
 *
 * @param content Plan 文件的文本内容
 */
export function parsePlanCheckboxes(content: string): PlanCheckResult {
  // 归一化：去除 BOM、统一行尾为 \n（兼容 Windows \r\n 和旧 Mac \r）
  const lines = normalizeLines(content);
  const items: PlanCheckItem[] = [];
  let currentSection = "";

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // 跟踪 ## 和 ### 标题作为 section 划分
    const headingMatch = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      currentSection = headingMatch[2].trim();
      continue;
    }

    // 匹配 checkbox: - [ ] text, - [x] text, * [ ] text, * [x] text
    const checkMatch = lines[i].match(/^\s*[-*]\s*\[([ xX])\]\s*(.*)$/);
    if (checkMatch) {
      items.push({
        lineNum: i + 1, // 1-based
        content: checkMatch[2].trim(),
        checked: checkMatch[1].toLowerCase() === "x",
        section: currentSection,
      });
    }
  }

  // 按 section 分组，保持出现顺序
  const sectionOrder: string[] = [];
  const sectionMap = new Map<string, PlanCheckItem[]>();

  for (const item of items) {
    const key = item.section || "(Ungrouped)";
    if (!sectionMap.has(key)) {
      sectionMap.set(key, []);
      sectionOrder.push(key);
    }
    sectionMap.get(key)!.push(item);
  }

  const sections: PlanSection[] = sectionOrder.map((name) => {
    const sectionItems = sectionMap.get(name)!;
    const isManual = MANUAL_KEYWORDS.some((kw) =>
      name.toLowerCase().includes(kw),
    );
    return {
      name,
      isManual,
      items: sectionItems,
      done: sectionItems.filter((item) => item.checked).length,
      total: sectionItems.length,
    };
  });

  return { sections };
}

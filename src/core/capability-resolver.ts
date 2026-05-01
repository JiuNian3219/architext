/** @fileoverview 模板能力标记解析器：将 [[SKILL:]]、[[SUBAGENT:]]、[[WHEN:]] 等标记按编辑器能力展开。 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ProjectFeature } from "../types/index.ts";

/**
 * 编辑器能力标记集，用于驱动模板中的条件化内容解析。
 *
 * 模板文件中可嵌入以下能力标记（init 时按实际 IDE 能力展开）：
 *
 * - `[[SKILL: name|args]]`：Specialist Skill（协作型），同上下文执行
 * - `[[SUBAGENT: name|args]]`：支持子代理时展开为独立子代理执行；不支持时移除
 * - `[[NO-SKILL: desc]]`：无 Skill 支持 → 展开为 `desc`；有 Skill → 移除
 * - `[[NO-SUBAGENT: desc]]`：无 Subagent 支持 → 展开为 `desc`；有 Subagent → 移除
 * - `[[WHEN: features | desc]]`：条件渲染块，features 匹配时展开为 desc
 */
export interface EditorCapabilities {
  hasSkills: boolean;
  hasSubagents: boolean;
  hasCommands: boolean;
}

/**
 * 条件渲染上下文，用于 `[[WHEN:]]` 指令的条件判断。
 */
export interface WhenContext {
  /** 项目特征标签（来自 architext.json 的 features 字段） */
  features: ProjectFeature[];
}

/**
 * 检查项目特征是否满足 WHEN 条件。
 * @param conditionFeatures 条件特征
 * @param projectFeatures 项目特征
 * @returns 是否满足条件
 */
function checkWhenCondition(
  conditionFeatures: string,
  projectFeatures: ProjectFeature[],
): boolean {
  const requiredFeatures = conditionFeatures
    .split(",")
    .map((f) => f.trim() as ProjectFeature);
  return requiredFeatures.every((f) => projectFeatures.includes(f));
}

/**
 * 使用括号计数法查找与 `[[` 匹配的 `]]`。
 * @param content 源字符串
 * @param start 开始搜索位置（`[[` 之后）
 * @returns 匹配的 `]]` 结束位置，未找到返回 -1
 */
function findMatchingClose(content: string, start: number): number {
  let depth = 1;
  let i = start;
  while (i < content.length - 1) {
    if (content[i] === "[" && content[i + 1] === "[") {
      depth++;
      i += 2;
    } else if (content[i] === "]" && content[i + 1] === "]") {
      depth--;
      if (depth === 0) {
        return i + 2;
      }
      i += 2;
    } else {
      i++;
    }
  }
  return -1;
}

/**
 * 在 depth=0 层级查找第一个 `|` 分隔符位置，用于解析 `name|args` 格式
 * @param content 需要查找的文本内容
 * @returns 第一个 `|` 分隔符位置
 */
function findDepthZeroPipe(content: string): number {
  let depth = 0;
  for (let i = 0; i < content.length - 1; i++) {
    if (content[i] === "[" && content[i + 1] === "[") {
      depth++;
      i++;
    } else if (content[i] === "]" && content[i + 1] === "]") {
      depth--;
      i++;
    } else if (depth === 0 && content[i] === "|") {
      return i;
    }
  }
  return -1;
}

/**
 * 使用括号计数法解析并替换所有 `[[PREFIX: ...]]` 标记，支持嵌套 `[[...]]`。
 * @param content 需要解析的文本内容
 * @param prefix 标记前缀
 * @param handler 处理标记内部内容的函数
 * @returns 解析后的文本内容
 */
function resolveBracketedTag(
  content: string,
  prefix: string,
  handler: (innerContent: string) => string,
): string {
  const openTag = `[[${prefix}:`;
  let result = "";
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const openIndex = content.indexOf(openTag, searchFrom);
    if (openIndex === -1) {
      result += content.slice(searchFrom);
      break;
    }

    result += content.slice(searchFrom, openIndex);

    const innerStart = openIndex + openTag.length;
    const closeEnd = findMatchingClose(content, innerStart);

    if (closeEnd === -1) {
      result += content.slice(openIndex);
      break;
    }

    const innerContent = content.slice(innerStart, closeEnd - 2);
    result += handler(innerContent);
    searchFrom = closeEnd;
  }

  return result;
}

/**
 * 解析 `[[WHEN: features | desc]]` 条件渲染指令（括号计数法，支持嵌套）。
 * @param content 需要解析的文本内容
 * @param whenContext 条件渲染上下文
 * @returns 解析后的文本内容
 */
export function resolveWhenRefs(
  content: string,
  whenContext: WhenContext,
): string {
  return resolveBracketedTag(content, "WHEN", (innerContent) => {
    const pipeIndex = findDepthZeroPipe(innerContent);
    if (pipeIndex === -1) return `[[WHEN: ${innerContent}]]`;
    const features = innerContent.slice(0, pipeIndex).trim();
    // 与旧正则 \s*\|\s* 行为一致：修剪 | 两边的空白
    const desc = innerContent.slice(pipeIndex + 1).trim();
    return checkWhenCondition(features, whenContext.features) ? desc : "";
  });
}

/**
 * 根据编辑器能力集，解析模板中所有能力标记（括号计数法，支持嵌套）。
 * 处理顺序：[[INCLUDE:]] → [[WHEN:]] → [[SUBAGENT:]] → [[NO-SUBAGENT:]] → [[SKILL:]] → [[NO-SKILL:]] → [[NO-COMMANDS:]]
 *
 * 能力标记为互斥条件块：
 *   [[SUBAGENT:    name|args]]   ← hasSubagents=true 命中，否则移除
 *   [[NO-SUBAGENT: name|args]]   ← hasSubagents=false 命中；若 hasSkills=true 则展开为内联 Skill，否则移除
 *   [[NO-SUBAGENT: desc]]        ← hasSubagents=false 命中并展开纯文本
 *   [[NO-SKILL:    desc      ]]  ← hasSkills=false 命中，否则移除
 *
 * @param content 需要解析的文本内容
 * @param capabilities 编辑器能力集
 * @param includeBaseDir 基础目录
 * @param whenContext 条件渲染上下文
 * @returns 解析后的文本内容
 */
export function resolveCapabilityRefs(
  content: string,
  capabilities: EditorCapabilities,
  includeBaseDir?: string,
  whenContext?: WhenContext,
): string {
  // [[INCLUDE: path]]：部署时展开为目标文件的完整内容
  if (includeBaseDir) {
    content = resolveBracketedTag(content, "INCLUDE", (innerContent) => {
      const relPath = innerContent.trim();
      const fragmentPath = path.join(includeBaseDir, relPath);
      try {
        return readFileSync(fragmentPath, "utf-8").trim();
      } catch {
        // 文件不存在时返回错误注释，而非抛出异常
        return `<!-- INCLUDE NOT FOUND: ${relPath} -->`;
      }
    });
  }

  // [[WHEN: features | payload]]：条件渲染
  if (whenContext) {
    content = resolveWhenRefs(content, whenContext);
  }

  // [[SUBAGENT: name|args]]
  //   hasSubagents=true  → 子代理指令
  //   hasSubagents=false → 移除，由显式 [[NO-SUBAGENT:]] fallback 决定是否展开替代内容
  content = resolveBracketedTag(content, "SUBAGENT", (innerContent) => {
    const pipeIndex = findDepthZeroPipe(innerContent);
    if (pipeIndex === -1) return "";
    const name = innerContent.slice(0, pipeIndex).trim();
    const args = innerContent.slice(pipeIndex + 1).trim();
    if (capabilities.hasSubagents) {
      return formatSubagentInvocation(name, args);
    }
    return "";
  });

  // [[NO-SUBAGENT: name|args]] 或 [[NO-SUBAGENT: desc]]（单参数）
  content = resolveBracketedTag(content, "NO-SUBAGENT", (innerContent) => {
    if (capabilities.hasSubagents) return "";
    const pipeIndex = findDepthZeroPipe(innerContent);
    // 单参数模式：纯文本 fallback
    if (pipeIndex === -1) {
      return innerContent.trim();
    }
    // 双参数模式：降级为内联 Skill
    if (!capabilities.hasSkills) return "";
    const name = innerContent.slice(0, pipeIndex).trim();
    const args = innerContent.slice(pipeIndex + 1).trim();
    return formatInlineSkillInvocation(name, args);
  });

  // [[SKILL: name|args]]
  content = resolveBracketedTag(content, "SKILL", (innerContent) => {
    if (!capabilities.hasSkills) return "";
    const pipeIndex = findDepthZeroPipe(innerContent);
    if (pipeIndex === -1) return "";
    const name = innerContent.slice(0, pipeIndex).trim();
    const args = innerContent.slice(pipeIndex + 1).trim();
    return formatSkillToolInvocation(name, args);
  });

  // [[NO-SKILL: desc]]：与旧正则 \s* 行为一致，修剪首尾空白
  content = resolveBracketedTag(content, "NO-SKILL", (innerContent) => {
    return capabilities.hasSkills ? "" : innerContent.trim();
  });

  // [[NO-COMMANDS: desc]]
  content = resolveBracketedTag(content, "NO-COMMANDS", (innerContent) => {
    return capabilities.hasCommands ? "" : innerContent.trim();
  });

  return content;
}

/**
 * 格式化子代理调用
 * @param name 子代理名称
 * @param args 参数
 * @returns 格式化后的字符串
 */
function formatSubagentInvocation(name: string, args: string): string {
  return [
    `**[SUBAGENT · 子代理]** 启动独立子代理执行此任务，禁在当前上下文内联执行。`,
    `- 指令来源：\`skills/${name}/SKILL.md\``,
    `- 执行上下文：全新隔离上下文（不继承当前对话）`,
    `- 参数：${args}`,
    `- 完成后：将结构化结果返回当前流程，由主 agent 接续后续步骤`,
  ].join("\n");
}

/**
 * 格式化内联技能调用
 * @param name 技能名称
 * @param args 参数
 * @returns 格式化后的字符串
 */
function formatInlineSkillInvocation(name: string, args: string): string {
  return [
    `**[SKILL · 内联]** 在当前上下文按 Skill 协议自行执行此任务。`,
    `- 指令来源：\`skills/${name}/SKILL.md\`（先读取再执行）`,
    `- 执行上下文：当前对话上下文`,
    `- 参数：${args}`,
  ].join("\n");
}

/**
 * 格式化技能工具调用
 * @param name 技能名称
 * @param args 参数
 * @returns 格式化后的字符串
 */
function formatSkillToolInvocation(name: string, args: string): string {
  return [
    `**[SKILL · 工具]** 调用 Skill 工具执行此任务。`,
    `- 工具名：\`${name}\``,
    `- 执行上下文：Skill 工具内部（遵循工具自身约定）`,
    `- 参数：${args}`,
  ].join("\n");
}

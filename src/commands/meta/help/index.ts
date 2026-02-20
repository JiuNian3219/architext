/** @fileoverview Help 命令入口，输出 Architext 彩色终端参考手册（命令列表 + 参数 + 示例）。 */
import color from "picocolors";
import pkg from "../../../../package.json" with { type: "json" };
import { createT, getSystemLocale } from "../../../utils/t.ts";

const t = createT(getSystemLocale(), "command.help");

/**
 * 格式化单条命令块：命令 + 描述 + （可选）参数/示例
 * @param name 命令名称
 * @param desc 命令描述
 * @param details 命令参数/示例
 * @returns 格式化后的命令块
 */
function cmd(name: string, desc: string, details?: string[]): string {
  const lines = [`  ${color.cyan(name)}`, `    ${desc}`];
  if (details) {
    for (const d of details) {
      lines.push(`    ${color.dim(d)}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

/**
 * 格式化分组标题
 * @param title 分组标题
 * @returns 格式化后的分组标题
 */
function section(title: string): string {
  return `\n  ${color.bold(color.underline(title))}\n`;
}

/**
 * 格式化 Quick Start 条目
 * @param scenario 场景描述
 * @param command 命令
 * @returns 格式化后的 Quick Start 条目
 */
function tip(scenario: string, command: string): string {
  return `  ${scenario.padEnd(22)} ${color.dim("-->")} ${color.cyan(command)}`;
}

/**
 * Help 命令的主入口函数。
 * 输出格式化的终端参考手册。
 * @returns 格式化后的终端参考手册
 */
export async function helpCommand(): Promise<void> {
  // 格式化头部
  const header = [
    "",
    `  ${color.bold("Architext")} ${color.dim(`v${pkg.version}`)}`,
    `  ${color.dim(t("tagline"))}`,
    `  ${color.dim("─".repeat(50))}`,
  ].join("\n");

  const aiSection = [
    section(t("section.ai")),
    cmd("/archi.start [context]", t("ai.start.desc"), [
      t("ai.start.detail"),
      t("ai.start.example"),
    ]),
    cmd("/archi.inherit", t("ai.inherit.desc"), [t("ai.inherit.detail")]),
    cmd("/archi.plan [id | context]", t("ai.plan.desc"), [
      t("ai.plan.detail"),
      t("ai.plan.example1"),
      t("ai.plan.example2"),
    ]),
    cmd("/archi.code <id>", t("ai.code.desc"), [
      t("ai.code.detail"),
      t("ai.code.example"),
    ]),
    cmd("/archi.audit [id]", t("ai.audit.desc"), [
      t("ai.audit.detail"),
      t("ai.audit.example1"),
      t("ai.audit.example2"),
    ]),
    cmd("/archi.fix [id] <context>", t("ai.fix.desc"), [
      t("ai.fix.detail"),
      t("ai.fix.example"),
    ]),
    cmd("/archi.edit <id> [context]", t("ai.edit.desc"), [
      t("ai.edit.detail"),
      t("ai.edit.example"),
    ]),
    cmd("/archi.revise [context]", t("ai.revise.desc"), [
      t("ai.revise.detail"),
      t("ai.revise.example"),
    ]),
    cmd("/archi.map", t("ai.map.desc"), [t("ai.map.detail")]),
    cmd("/archi.help [question]", t("ai.help.desc"), [
      t("ai.help.detail"),
      t("ai.help.example1"),
      t("ai.help.example2"),
    ]),
  ].join("\n");

  const cliSection = [
    section(t("section.cli")),
    cmd("npx archi init [-e editor] [-l lang] [-d path]", t("cli.init.desc"), [
      `-e, --editor <type>   ${t("cli.init.editor")}`,
      `-l, --language <lang> ${t("cli.init.lang")}`,
      `-d, --doc <path>      ${t("cli.init.doc")}`,
    ]),
    cmd("npx archi update [--dry-run]", t("cli.update.desc"), [
      `--dry-run  ${t("cli.update.dry_run")}`,
    ]),
    cmd("npx archi doctor [--fix]", t("cli.doctor.desc"), [
      `--fix  ${t("cli.doctor.fix")}`,
    ]),
    cmd("npx archi task [id] [--status <s>] [--check]", t("cli.task.desc"), [
      t("cli.task.detail"),
      t("cli.task.example"),
    ]),
    cmd("npx archi plan <id>", t("cli.plan.desc"), [t("cli.plan.example")]),
    cmd("npx archi render", t("cli.render.desc")),
    cmd("npx archi uninstall", t("cli.uninstall.desc")),
  ].join("\n");

  const quickStart = [
    section(t("section.quick")),
    tip(t("quick.new_project"), "/archi.start [desc]"),
    tip(t("quick.legacy"), "/archi.inherit"),
    tip(t("quick.new_feature"), "/archi.plan [desc]"),
    tip(t("quick.write_code"), "/archi.code <id>"),
    tip(t("quick.fix_bug"), "/archi.fix [id] <desc>"),
    tip(t("quick.check_health"), "/archi.audit"),
    "",
  ].join("\n");

  const workflow = [
    section(t("section.workflow")),
    `  ${color.dim(t("workflow.flow"))}`,
    "",
    `  ${color.cyan("/archi.start")} ${color.dim("-->")} ${color.cyan("/archi.plan")} ${color.dim("-->")} ${color.cyan("/archi.code")}`,
    `  ${color.dim(`     ${t("workflow.init")}           ${t("workflow.define")}          ${t("workflow.implement")}`)}`,
    "",
    `  ${color.dim(t("workflow.loop"))}`,
    `  ${color.cyan("/archi.edit")} ${color.dim("/")} ${color.cyan("/archi.fix")} ${color.dim("-->")} ${color.cyan("/archi.code")}`,
    "",
  ].join("\n");

  console.log([header, aiSection, cliSection, quickStart, workflow].join("\n"));
}

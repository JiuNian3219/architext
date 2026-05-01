/** @fileoverview Help 命令入口，输出 Architext 彩色终端参考手册（命令列表 + 参数 + 示例）。 */
import color from "picocolors";
import pkg from "../../../../package.json" with { type: "json" };
import { logger } from "../../../utils/logger.ts";
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
    `  ${color.dim(t("ai.chatModeHint"))}`,
    "",
    cmd("/archi.init [args]", t("ai.init.desc"), [
      t("ai.init.detail"),
      t("ai.init.example1"),
      t("ai.init.example2"),
    ]),
    cmd("/archi.plan <ID> [context]", t("ai.plan.desc"), [
      t("ai.plan.detail"),
      t("ai.plan.example1"),
      t("ai.plan.example2"),
    ]),
    cmd("/archi.code <id>", t("ai.code.desc"), [
      t("ai.code.detail"),
      t("ai.code.example"),
    ]),
    cmd("/archi.change [id] <context>", t("ai.change.desc"), [
      t("ai.change.detail"),
      t("ai.change.example1"),
      t("ai.change.example2"),
    ]),
    cmd("/archi.review [id|map] [context]", t("ai.review.desc"), [
      t("ai.review.detail"),
      t("ai.review.example1"),
      t("ai.review.example2"),
    ]),
    cmd("/archi.ui", t("ai.ui.desc"), [t("ai.ui.detail")]),
    cmd("/archi.ref <add|list|update|remove> [args]", t("ai.ref.desc"), [
      t("ai.ref.detail"),
      t("ai.ref.example"),
    ]),
    cmd("/archi.remove <id>", t("ai.remove.desc"), [
      t("ai.remove.detail"),
      t("ai.remove.example"),
    ]),
    cmd("/archi.help [question]", t("ai.help.desc"), [
      t("ai.help.detail"),
      t("ai.help.example1"),
      t("ai.help.example2"),
    ]),
  ].join("\n");

  const cliSection = [
    section(t("section.cli")),
    cmd(
      "npx archi init [-e editor] [-l lang] [-d path] [--no-notify]",
      t("cli.init.desc"),
      [
        `-e, --editor <type>   ${t("cli.init.editor")}`,
        `-l, --language <lang> ${t("cli.init.lang")}`,
        `-d, --doc <path>      ${t("cli.init.doc")}`,
        `    --no-notify       ${t("cli.init.noNotify")}`,
      ],
    ),
    cmd("npx archi update", t("cli.update.desc")),
    cmd("npx archi doctor", t("cli.doctor.desc")),
    cmd("npx archi task [id] [--status <s>] [--check]", t("cli.task.desc"), [
      t("cli.task.detail"),
      t("cli.task.example"),
    ]),
    cmd("npx archi plan <id>", t("cli.plan.desc"), [t("cli.plan.example")]),
    cmd("npx archi render", t("cli.render.desc")),
    cmd("npx archi pack [-o file]", t("cli.pack.desc"), [
      t("cli.pack.example"),
    ]),
    cmd("npx archi template <name>", t("cli.template.desc"), [
      t("cli.template.example"),
    ]),
    cmd("npx archi uninstall", t("cli.uninstall.desc")),
  ].join("\n");

  const quickStart = [
    section(t("section.quick")),
    tip(t("quick.new_project"), "/archi.init [desc]"),
    tip(t("quick.legacy"), "/archi.init"),
    tip(t("quick.new_feature"), "/archi.plan [file_path]"),
    tip(t("quick.write_code"), "/archi.code <id>"),
    tip(t("quick.fix_bug"), "/archi.change [id] <desc>"),
    tip(t("quick.check_health"), "/archi.review"),
    "",
  ].join("\n");

  const workflow = [
    section(t("section.workflow")),
    `  ${color.dim(t("workflow.init_flow"))}`,
    `  ${color.cyan("/archi.init")} ${color.dim("-->")} ${color.cyan("/archi.ui")} ${color.dim("[?UI] -->")} ${color.cyan("/archi.plan")} ${color.dim("-->")} ${color.cyan("/archi.code")}`,
    "",
    `  ${color.dim(t("workflow.new_feature"))}`,
    `  ${color.cyan("/archi.plan")} ${color.dim("-->")} ${color.cyan("/archi.ui")} ${color.dim("[?UI] -->")} ${color.cyan("/archi.plan <ID>")} ${color.dim("-->")} ${color.cyan("/archi.code")}`,
    "",
    `  ${color.dim(t("workflow.change_spec"))}`,
    `  ${color.cyan("/archi.change")} ${color.dim("-->")} ${color.cyan("/archi.code")}`,
    "",
    `  ${color.dim(t("workflow.standalone"))}`,
    `  ${color.cyan("/archi.change")}  ${color.cyan("/archi.review")}  ${color.cyan("/archi.remove")}`,
    "",
  ].join("\n");

  logger.raw([header, aiSection, cliSection, quickStart, workflow].join("\n"));
}

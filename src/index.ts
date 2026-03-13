#!/usr/bin/env node
/** @fileoverview Architext CLI 主入口，负责解析命令行参数、执行对应命令（init、update、doctor），并处理全局错误。 */
import { cac } from "cac";
import pkg from "../package.json" with { type: "json" };
import { doctorCommand } from "./commands/meta/doctor/index.ts";
import { initCommand } from "./commands/meta/init/index.ts";
import { uninstallCommand } from "./commands/meta/uninstall/index.ts";
import { updateCommand } from "./commands/meta/update/index.ts";
import { planCommand } from "./commands/meta/plan/index.ts";
import { renderCommand } from "./commands/meta/render/index.ts";
import { taskCommand } from "./commands/meta/task/index.ts";
import { helpCommand } from "./commands/meta/help/index.ts";
import { templateCommand } from "./commands/meta/template/index.ts";
import { packCommand } from "./commands/meta/pack/index.ts";
import { notifyCommand } from "./commands/meta/notify/index.ts";
import { handleError } from "./core/error-handler.ts";
import { createT, getSystemLocale } from "./utils/t.ts";

const cli = cac("architext");

// 语言侦测，自动选择系统语言
const defaultLang = getSystemLocale();
const t = createT(defaultLang);

// 统一的异步 Action 包装器
const run = <T extends unknown[]>(action: (...args: T) => Promise<void>) => {
  return async (...args: T) => {
    try {
      await action(...args);
    } catch (error) {
      handleError(error);
    }
  };
};

// Init 初始化Architext框架
cli
  .command("init", t("init.desc"))
  .option("-e, --editor <type>", t("init.editor"))
  .option("-l, --language <lang>", t("init.lang"))
  .option("-d, --doc <path>", t("init.doc"))
  .option("-t, --type <type>", t("init.type"))
  .option("-y, --yes", t("init.yes"))
  .option("-b, --brief", t("init.brief"))
  .action(run(initCommand));

// Update 同步最新规则
cli.command("update", t("update.desc")).action(run(updateCommand));

// Doctor 环境自检
cli.command("doctor", t("doctor.desc")).action(async () => {
  try {
    await doctorCommand();
  } catch (error) {
    handleError(error);
  }
});

// Uninstall 移除框架
cli
  .command("uninstall", t("uninstall.desc"))
  .alias("remove")
  .alias("rm")
  .action(run(uninstallCommand));

// Task 任务管理
cli
  .command("task [id]", t("task.desc"))
  .option("--status <status>", t("task.status"))
  .option("--check", t("task.check"))
  .action(run(taskCommand));

// Plan 实现计划检查
cli.command("plan <id>", t("plan.desc")).action(run(planCommand));

// Render JSON → Markdown 视图
cli.command("render", t("render.desc")).action(run(renderCommand));

// Template 获取模板文件
cli.command("template [name]", t("template.desc")).action(run(templateCommand));

// Pack 打包用户数据（升级前备份）
cli
  .command("pack", t("pack.desc"))
  .option("-o, --output <file>", t("pack.output"))
  .action(run(packCommand));

// Help 参考手册
cli.command("help", t("help.desc")).action(run(helpCommand));

// Notify 桌面通知（供 hooks 调用）
cli.command("notify [message]", t("notify.desc")).action(run(notifyCommand));

// 保留 --help 标志的默认行为
cli.help();
// 显示版本信息
cli.version(pkg.version);

cli.parse();

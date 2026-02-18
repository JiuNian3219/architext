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
import { handleError } from "./core/error-handler.ts";
import { createT, getSystemLocale } from "./utils/t.ts";

const cli = cac("architext");

// 语言侦测，自动选择系统语言
const defaultLang = getSystemLocale();
const t = createT(defaultLang);

// 统一的异步 Action 包装器
const run = (action: (...args: any[]) => Promise<void>) => {
  return async (...args: any[]) => {
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
  .action(run(initCommand));

// Update 同步最新规则
cli
  .command("update", t("update.desc"))
  .option("-d, --dry-run", t("update.dry_run"), { default: false })
  .action(run(updateCommand));

// Doctor 环境自检
cli
  .command("doctor", t("doctor.desc"))
  .option("-x, --fix", t("doctor.fix"), { default: false })
  .action(async (options) => {
    try {
      // doctorCommand 接收的参数结构稍有不同，手动适配一下
      await doctorCommand({ fix: options.fix || false });
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
  .option("--list", t("task.list"))
  .action(run(taskCommand));

// Plan 实现计划检查
cli.command("plan <id>", t("plan.desc")).action(run(planCommand));

// Render JSON → Markdown 视图
cli.command("render", t("render.desc")).action(run(renderCommand));

// 显示帮助信息
cli.help();
// 显示版本信息
cli.version(pkg.version);

cli.parse();

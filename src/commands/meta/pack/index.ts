/** @fileoverview pack 命令主入口——纯流程编排。 */

import { intro, outro, spinner } from "@clack/prompts";
import color from "picocolors";
import fs from "fs-extra";
import path from "path";
import pkg from "../../../../package.json" with { type: "json" };
import { loadConfig } from "../../../core/config.ts";
import { logger } from "../../../utils/logger.ts";
import { createT, getSystemLocale } from "../../../utils/t.ts";
import { collectUserData } from "./collector.ts";
import { buildXml } from "./serializer.ts";

const t = createT(getSystemLocale(), "command.pack");

export interface PackOptions {
  output?: string;
}

export async function packCommand(options: PackOptions = {}): Promise<void> {
  intro(color.bgCyan(color.black(` ${t("title")} `)));

  const cwd = process.cwd();
  const config = await loadConfig(cwd);
  if (!config) {
    outro(color.yellow(t("no_config")));
    return;
  }

  const outputFile = options.output ?? "architext-pack.xml";
  const outputPath = path.resolve(cwd, outputFile);

  const s = spinner();
  s.start(t("packing"));

  const entries = await collectUserData(config, cwd);

  if (entries.length === 0) {
    s.stop(color.yellow(t("empty")));
    outro(color.yellow(t("empty_hint")));
    return;
  }

  const xml = buildXml(entries, config, pkg.version);
  await fs.writeFile(outputPath, xml, "utf-8");

  s.stop(
    color.green(t("done", { count: String(entries.length), file: outputFile })),
  );
  logger.info(t("hint_recover", { file: outputFile }));
  outro(color.green(t("success")));
}

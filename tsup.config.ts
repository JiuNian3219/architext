import fs from "fs-extra";
import { defineConfig } from "tsup";
import { logger } from "./src/utils/logger.ts";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: true,
  minify: true,
  shims: true,
  onSuccess: async () => {
    logger.info("[Asset Copy] Starting to copy templates...");
    try {
      await fs.copy("templates", "dist/templates", {
        overwrite: true,
        filter: (src) => !src.includes(".DS_Store"),
      });
      logger.success("[Asset Copy] Templates copied to dist/templates");
    } catch (err) {
      logger.error(
        `[Asset Copy] Failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }
  },
});

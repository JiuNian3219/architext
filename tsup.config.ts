import fs from "fs-extra";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: true,
  minify: true,
  shims: true,
  onSuccess: async () => {
    console.log("📦 [Asset Copy] Starting to copy templates...");
    try {
      await fs.copy("templates", "dist/templates", {
        overwrite: true,
        filter: (src) => !src.includes(".DS_Store"),
      });
      console.log("✅ [Asset Copy] Templates copied to dist/templates");
    } catch (err) {
      console.error("❌ [Asset Copy] Failed:", err);
      process.exit(1);
    }
  },
});

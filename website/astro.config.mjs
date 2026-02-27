import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://architext.cn",
  integrations: [sitemap()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    server: {
      fs: {
        // 允许 dev server 访问 website/ 上级目录（读取根 package.json 版本号）
        allow: [".."],
      },
    },
  },
});

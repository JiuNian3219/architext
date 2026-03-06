/** @fileoverview 单元测试 - uninstall resolver */

import { describe, it, expect } from "vitest";
import path from "path";
import { resolveUninstallPlan } from "../../commands/meta/uninstall/resolver.ts";
import type { ArchitextConfig } from "../../types/index.ts";
import { BRIEF_ASSETS_DIR } from "../../core/rules.ts";

const CWD = "/fake/project";

function makeConfig(overrides?: Partial<ArchitextConfig>): ArchitextConfig {
  return {
    docDir: ".architext",
    language: "zh",
    editors: ["cursor"],
    features: [],
    structureVersion: 1,
    ...overrides,
  } as ArchitextConfig;
}

describe("resolveUninstallPlan", () => {
  it("卸载计划应包含 project-brief.md", () => {
    const plan = resolveUninstallPlan(makeConfig(), CWD);
    const briefPath = path.resolve(CWD, "project-brief.md");
    expect(plan.files).toContain(briefPath);
  });

  it("卸载计划应包含 brief-assets 目录", () => {
    const plan = resolveUninstallPlan(makeConfig(), CWD);
    const assetsDir = path.resolve(CWD, BRIEF_ASSETS_DIR);
    expect(plan.dirs).toContain(assetsDir);
  });

  it("卸载计划应包含 docDir 目录", () => {
    const plan = resolveUninstallPlan(
      makeConfig({ docDir: ".myproject" }),
      CWD,
    );
    const docDir = path.resolve(CWD, ".myproject");
    expect(plan.dirs).toContain(docDir);
  });

  it("卸载计划应包含 architext.json", () => {
    const plan = resolveUninstallPlan(makeConfig(), CWD);
    const configPath = path.resolve(CWD, "architext.json");
    expect(plan.files).toContain(configPath);
  });
});

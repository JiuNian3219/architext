/** @fileoverview 集成测试 - init 命令 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { scaffold } from "../../core/scaffold.ts";
import * as fs from "fs-extra";
import path from "path";
import { createTempDir, cleanupTempDir } from "../helpers/temp-dir.ts";
import type { InitConfig, LocaleLang } from "../../types/index.ts";
import { TemplateManager } from "../../core/template.ts";

describe("Scaffolder Integration", () => {
  let tempDir: string;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await createTempDir();
    // Mock getRoot to point to real templates directory for integration tests
    vi.spyOn(TemplateManager, "getRoot").mockResolvedValue(
      path.join(originalCwd, "templates"),
    );
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
  });

  it("应该创建文档目录结构", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const docDir = path.join(tempDir, config.docDir);
    expect(await fs.pathExists(docDir)).toBe(true);

    // 检查全局文档目录
    const globalDir = path.join(docDir, "global");
    expect(await fs.pathExists(globalDir)).toBe(true);

    // cursor 有 commands，prompts 部署到 .cursor/commands/；docDir/prompts 仅对无 commands 的 editor 存在
    const commandsDir = path.join(tempDir, ".cursor/commands");
    expect(await fs.pathExists(commandsDir)).toBe(true);

    // 检查 tasks 空目录（用于存放未来计划）
    const tasksDir = path.join(docDir, "tasks");
    expect(await fs.pathExists(tasksDir)).toBe(true);
    expect(await fs.readdir(tasksDir)).toEqual([]);
  });

  it("应该创建 IDE 规则文件", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const rulesDir = path.join(tempDir, ".cursor/rules");
    expect(await fs.pathExists(rulesDir)).toBe(true);

    // 检查规则文件是否存在
    const ruleFiles = await fs.readdir(rulesDir);
    expect(ruleFiles.length).toBeGreaterThan(0);
    expect(ruleFiles.some((f) => f.endsWith(".mdc"))).toBe(true);
  });

  it("应该创建 Cursor commands 文件", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const commandsDir = path.join(tempDir, ".cursor/commands");
    expect(await fs.pathExists(commandsDir)).toBe(true);

    // 检查 commands 文件是否存在
    const commandFiles = await fs.readdir(commandsDir);
    expect(commandFiles.length).toBeGreaterThan(0);
    expect(commandFiles.some((f) => f.startsWith("archi."))).toBe(true);
  });

  it("应该替换占位符", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    // 检查某个文件中的占位符是否被替换
    const rulesDir = path.join(tempDir, ".cursor/rules");
    const ruleFiles = await fs.readdir(rulesDir);
    const firstRuleFile = path.join(rulesDir, ruleFiles[0]);

    if (await fs.pathExists(firstRuleFile)) {
      const content = await fs.readFile(firstRuleFile, "utf-8");
      // 占位符应该被替换
      expect(content).not.toContain("[[__DOCS_DIR__]]");
      expect(content).toContain(config.docDir);
    }
  });

  it("应该支持多个编辑器", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor", "trae"],
      features: [],
    };

    await scaffold(config);

    const cursorRulesDir = path.join(tempDir, ".cursor/rules");
    const traeRulesDir = path.join(tempDir, ".trae/rules");

    expect(await fs.pathExists(cursorRulesDir)).toBe(true);
    expect(await fs.pathExists(traeRulesDir)).toBe(true);
  });

  it("应该回退到默认语言（如果请求的语言不存在）", async () => {
    const config: InitConfig = {
      language: "nonexistent" as LocaleLang,
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    // 应该不抛出错误，而是回退到默认语言
    await expect(scaffold(config)).resolves.not.toThrow();
  });

  it("应该为 Cursor 创建 Agent Skills 文件", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    // archi- 前缀的 Skill 目录应存在
    const skillDir = path.join(
      tempDir,
      ".cursor/skills/archi-decompose-roadmap",
    );
    expect(await fs.pathExists(skillDir)).toBe(true);

    // SKILL.md 应存在且含有合法 frontmatter
    const skillFile = path.join(skillDir, "SKILL.md");
    expect(await fs.pathExists(skillFile)).toBe(true);

    const content = await fs.readFile(skillFile, "utf-8");
    expect(content).toContain("name: archi-decompose-roadmap");
    expect(content).toContain("description:");

    const reconcileSkill = path.join(
      tempDir,
      ".cursor/skills/archi-task-state-reconcile/SKILL.md",
    );
    expect(await fs.pathExists(reconcileSkill)).toBe(true);
    const reconcileContent = await fs.readFile(reconcileSkill, "utf-8");
    expect(reconcileContent).toContain("name: archi-task-state-reconcile");
    expect(reconcileContent).toContain("Must run in isolated context/subagent");
  });

  it("Skills 文件不应包含未替换的占位符", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: "my-docs",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const skillFile = path.join(
      tempDir,
      ".cursor/skills/archi-decompose-roadmap/SKILL.md",
    );

    if (await fs.pathExists(skillFile)) {
      const content = await fs.readFile(skillFile, "utf-8");
      expect(content).not.toContain("[[__DOCS_DIR__]]");
    }
  });

  it("支持 Agent Skills 的编辑器应创建 Skills 目录", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["trae"],
      features: [],
    };

    await scaffold(config);

    // trae 支持 Agent Skills 标准，应生成 skills 目录
    const traeSkillsDir = path.join(tempDir, ".trae/skills");
    expect(await fs.pathExists(traeSkillsDir)).toBe(true);
  });

  it("重新初始化时 Skills 文件应纳入冲突检测范围", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    // 第一次运行：生成 Skills 文件
    await scaffold(config);

    const skillFile = path.join(
      tempDir,
      ".cursor/skills/archi-decompose-roadmap/SKILL.md",
    );
    expect(await fs.pathExists(skillFile)).toBe(true);

    // 第二次运行：使用 mock resolveConflicts，捕获传入的 operations
    const resolveConflicts = vi.fn(async (ops) => ops);
    await scaffold(config, { resolveConflicts });

    // Skills 操作须被传入冲突检测函数（证明 SKILL.md 在冲突检测覆盖范围内）
    expect(resolveConflicts).toHaveBeenCalledOnce();
    const ops = resolveConflicts.mock.calls[0][0] as { dest: string }[];
    const skillOps = ops.filter((op) =>
      op.dest.includes("archi-decompose-roadmap"),
    );
    expect(skillOps.length).toBeGreaterThan(0);
  });

  it("生成 Brief 时应同时创建 brief-assets 目录", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: ["ui", "data"],
      generateBrief: true,
    };

    await scaffold(config);

    // project-brief.md 应存在
    const briefPath = path.join(tempDir, "project-brief.md");
    expect(await fs.pathExists(briefPath)).toBe(true);

    // brief-assets/ 目录应存在
    const assetsDir = path.join(tempDir, "brief-assets");
    expect(await fs.pathExists(assetsDir)).toBe(true);
    const stat = await fs.stat(assetsDir);
    expect(stat.isDirectory()).toBe(true);
  });

  it("全局 seed 不应包含示例任务，避免 /archi.init 误判为真实项目文档", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
      generateBrief: true,
    };

    await scaffold(config);

    const roadmapPath = path.join(tempDir, ".architext/global/roadmap.json");
    const roadmap = await fs.readJSON(roadmapPath);
    expect(roadmap.projectStatus).toBe("template-uninitialized");
    expect(roadmap.lastUpdated).toBe("TEMPLATE");
    expect(roadmap.tasks).toEqual([]);

    const visionPath = path.join(tempDir, ".architext/global/vision.md");
    const vision = await fs.readFile(visionPath, "utf-8");
    expect(vision).toContain("architextTemplate: true");
    expect(vision).toContain("未初始化");
  });

  it("global JSON seed should keep field guides without prefilled example data", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: ["api", "cli", "data", "ui", "lib"],
      generateBrief: true,
    };

    await scaffold(config);

    const globalDir = path.join(tempDir, ".architext/global");
    const seedFiles = [
      "api_snapshot.json",
      "command_api.json",
      "data_snapshot.json",
      "design_tokens.json",
      "dictionary.json",
      "env_registry.json",
      "error_codes.json",
      "error_memory.json",
      "map.json",
      "public_api.json",
      "roadmap.json",
    ];

    for (const file of seedFiles) {
      const data = await fs.readJSON(path.join(globalDir, file));
      expect(data.architextTemplate).toBe(true);
      expect(data._fieldGuide).toBeDefined();
    }

    const roadmap = await fs.readJSON(path.join(globalDir, "roadmap.json"));
    expect(roadmap._fieldGuide["tasks[]"].sourceRef).toContain(
      "global/requirements",
    );
    expect(roadmap.tasks).toEqual([]);
    expect(roadmap.nfr).toEqual([]);

    const map = await fs.readJSON(path.join(globalDir, "map.json"));
    expect(map.directoryMapping).toEqual([]);
    expect(map.logicalTopology).toEqual([]);
    expect(map.criticalUserJourneys).toEqual([]);
    expect(map.featureRelations).toEqual([]);

    const dictionary = await fs.readJSON(
      path.join(globalDir, "dictionary.json"),
    );
    expect(dictionary.entities).toEqual([]);
    expect(dictionary.verbs).toEqual([]);

    const errorMemory = await fs.readJSON(
      path.join(globalDir, "error_memory.json"),
    );
    expect(errorMemory.errorPatterns).toEqual([]);
    expect(errorMemory.checkpoints).toEqual([]);
  });

  it("/archi.init 前置 Context Fetch 应将 scaffold seed 排除为项目事实", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const skillPath = path.join(
      tempDir,
      ".cursor/skills/archi-context-fetch/SKILL.md",
    );
    const content = await fs.readFile(skillPath, "utf-8");
    expect(content).toContain('intent_card.command == "/archi.init"');
    expect(content).toContain("scaffold_seed_not_project_fact");
    expect(content).toContain("禁止输出基于 seed roadmap / seed vision");
  });

  it("plan 协议应禁止无 roadmap ID 直接创建 task 文档", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const systemRule = await fs.readFile(
      path.join(tempDir, ".cursor/rules/00_system.mdc"),
      "utf-8",
    );
    expect(systemRule).toContain("Roadmap Before Task Docs");
    expect(systemRule).toContain("没有已存在的 roadmap task ID");

    const planRouter = await fs.readFile(
      path.join(tempDir, ".cursor/commands/archi.plan.md"),
      "utf-8",
    );
    expect(planRouter).toContain("Task 创建边界");
    expect(planRouter).toContain("只有 case 1 命中已存在 ID");

    const decompose = await fs.readFile(
      path.join(tempDir, ".architext/prompts/plan/decompose.md"),
      "utf-8",
    );
    expect(decompose).toContain("工作量判断");
    expect(decompose).toContain("禁止创建 `tasks/<ID>_<Slug>/`");

    const detail = await fs.readFile(
      path.join(tempDir, ".architext/prompts/plan/detail.md"),
      "utf-8",
    );
    expect(detail).toContain("只细化 roadmap 中已存在的单个任务");
    expect(detail).toContain("不得在 detail 中拆分任务");
  });

  it("Front Pipeline 中间产物不应被当作最终回复", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const systemRule = await fs.readFile(
      path.join(tempDir, ".cursor/rules/00_system.mdc"),
      "utf-8",
    );
    expect(systemRule).toContain("Continuation Guard");
    expect(systemRule).toContain("Intent Card 和 Context Pack 都是中间产物");
    expect(systemRule).toContain(
      "不阻止 Front Pipeline 继续执行 Context Fetch",
    );

    const normalizer = await fs.readFile(
      path.join(tempDir, ".cursor/skills/archi-intent-normalizer/SKILL.md"),
      "utf-8",
    );
    expect(normalizer).toContain("Continuation Contract");
    expect(normalizer).toContain("不得把 Intent Card 当作最终回复");

    const contextFetch = await fs.readFile(
      path.join(tempDir, ".cursor/skills/archi-context-fetch/SKILL.md"),
      "utf-8",
    );
    expect(contextFetch).toContain("Continuation Contract");
    expect(contextFetch).toContain("不得把 Context Pack 当作最终回复");

    const planRouter = await fs.readFile(
      path.join(tempDir, ".cursor/commands/archi.plan.md"),
      "utf-8",
    );
    expect(planRouter).toContain("Dispatch-Continuation");
    expect(planRouter).toContain("禁止在只输出路由决策后结束本轮");

    const initRouter = await fs.readFile(
      path.join(tempDir, ".cursor/commands/archi.init.md"),
      "utf-8",
    );
    expect(initRouter).toContain("Dispatch-Continuation");
    expect(initRouter).toContain("禁止在只输出路由决策后结束本轮");
  });

  it("状态校准 Skill 输出后应回到调用协议继续执行", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const reconcile = await fs.readFile(
      path.join(tempDir, ".cursor/skills/archi-task-state-reconcile/SKILL.md"),
      "utf-8",
    );
    expect(reconcile).toContain("Return-Control Contract");
    expect(reconcile).toContain("不是最终回复");
    expect(reconcile).toContain("不得停在 JSON 报告");
  });

  it("decompose 对重构类需求应基于交付和验证边界拆分 roadmap 任务", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const decompose = await fs.readFile(
      path.join(tempDir, ".architext/prompts/plan/decompose.md"),
      "utf-8",
    );
    expect(decompose).toContain(
      "decompose 只负责在 roadmap 上追加经过评估后的任务",
    );
    expect(decompose).toContain("先评估再决定数量");
    expect(decompose).toContain("不使用固定数字规则");
    expect(decompose).toContain("这些应写进后续 detail 的 plan.json");

    const skill = await fs.readFile(
      path.join(tempDir, ".cursor/skills/archi-decompose-roadmap/SKILL.md"),
      "utf-8",
    );
    expect(skill).toContain("每个 roadmap task 必须有独立交付价值");
    expect(skill).toContain("不要因为涉及多个文件、目录或组件就机械拆分");
  });

  it("code 完成后不应把未规划的 pending task 推荐为 code", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const code = await fs.readFile(
      path.join(tempDir, ".cursor/commands/archi.code.md"),
      "utf-8",
    );
    expect(code).toContain("Next-Step Gate");
    expect(code).toContain("只能推荐 `/archi.plan <NEXT_ID>`");
    expect(code).toContain(
      "禁止把“下一个 pending task”写成 `/archi.code <NEXT_ID>`",
    );
    expect(code).toContain("后续任务已 active 且文档完整时");
  });

  it("code 和 plan detail 应在状态阻塞时先调用状态校准 skill", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const code = await fs.readFile(
      path.join(tempDir, ".cursor/commands/archi.code.md"),
      "utf-8",
    );
    expect(code).toContain("archi-task-state-reconcile");
    expect(code).toContain("状态未同步");
    expect(code).toContain("status_stale_active");

    const detail = await fs.readFile(
      path.join(tempDir, ".architext/prompts/plan/detail.md"),
      "utf-8",
    );
    expect(detail).toContain("archi-task-state-reconcile");
    expect(detail).toContain("mode=`dependency_done`");
    expect(detail).toContain("status_stale_done");
  });

  it("help 不应把缺少 spec 或 plan 的任务推荐为 code", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
    };

    await scaffold(config);

    const help = await fs.readFile(
      path.join(tempDir, ".cursor/commands/archi.help.md"),
      "utf-8",
    );
    expect(help).toContain("Next-Step Readiness Gate");
    expect(help).toContain("不能推荐 `/archi.code <ID>`");
    expect(help).toContain("推荐动作必须是 `/archi.plan <ID>`");
    expect(help).toContain("有 pending 任务且依赖已 done 但缺 spec/plan");
  });

  it("不生成 Brief 时不应创建 brief-assets 目录", async () => {
    const config: InitConfig = {
      language: "zh",
      docDir: ".architext",
      editors: ["cursor"],
      features: [],
      generateBrief: false,
    };

    await scaffold(config);

    const assetsDir = path.join(tempDir, "brief-assets");
    expect(await fs.pathExists(assetsDir)).toBe(false);
  });
});

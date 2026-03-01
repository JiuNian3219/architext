export type Locale = "en" | "zh";

interface QsContent {
  comment1: string;
  comment2: string;
  out1: string;
  out2: string;
  out3: string;
}

interface TableRow {
  cmd: string;
  desc: string;
  out: string;
}

interface CommandGroup {
  label: string;
  rows: TableRow[];
}

interface CompareRow {
  label: string;
  bad: string;
  good: string;
}

interface Card {
  title: string;
  desc: string;
}

interface WorkflowDetail {
  cmd: string;
  desc: string;
}

export interface TranslationData {
  htmlLang: string;
  otherLang: string;
  otherLangHref: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogLocale: string;
    ogLocaleAlt: string;
  };
  nav: {
    workflow: string;
    why: string;
    quickstart: string;
  };
  hero: {
    badge: string;
    titleHtml: string;
    tagline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  ide: {
    label: string;
    cursorNote: string;
  };
  why: {
    eyebrow: string;
    title: string;
    desc: string;
    tableHead1: string;
    tableHead2: string;
    rows: CompareRow[];
    cards: Card[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    desc: string;
    svgOptional: string;
    stageLabels: [string, string, string, string, string];
    details: WorkflowDetail[];
  };
  quickstart: {
    eyebrow: string;
    title: string;
    tab1: string;
    tab2: string;
    new: QsContent;
    existing: QsContent;
    tableHead: [string, string, string];
    tableGroups: CommandGroup[];
  };
  cta: {
    title: string;
    desc: string;
    btn1: string;
    btn2: string;
  };
  footer: {
    changelog: string;
    contributing: string;
  };
  notFound: {
    title: string;
    message: string;
    home: string;
  };
}

export const t: Record<Locale, TranslationData> = {
  en: {
    htmlLang: "en",
    otherLang: "中文",
    otherLangHref: "/zh/",
    meta: {
      title: "Architext — The AI Architecture Protocol",
      description:
        "A document-driven AI development protocol. Define first, build right. Upgrades your AI coding assistant from random code generator to rigorous architect.",
      keywords:
        "AI architecture, document-driven development, AI coding workflow, Cursor IDE, software architecture protocol, spec-first development, AI development framework, DDAD",
      ogLocale: "en_US",
      ogLocaleAlt: "zh_CN",
    },
    nav: {
      workflow: "Workflow",
      why: "Why",
      quickstart: "Quick Start",
    },
    hero: {
      badge: "open source · early access",
      titleHtml: "The <em>AI Architecture</em><br>Protocol",
      tagline:
        "Define first, build right. A document-driven methodology that upgrades your AI from random code generator to rigorous architect.",
      ctaPrimary: "Get started",
      ctaSecondary: "View on GitHub",
    },
    ide: {
      label: "Supported IDEs",
      cursorNote: "recommended",
    },
    why: {
      eyebrow: "The problem",
      title: "AI writes code.<br>But whose code is it?",
      desc: "Every chat session starts fresh. AI has no memory of your architecture decisions, no understanding of your constraints, and no consistent strategy. Architext persists that context in your repo.",
      tableHead1: "AI Full-Agency Mode",
      tableHead2: "Architext",
      rows: [
        {
          label: "Core assumption",
          bad: "AI knows what you want",
          good: "You define it, AI executes it",
        },
        {
          label: "Your role",
          bad: "Reviewer — see it after",
          good: "Decision-maker — before build",
        },
        {
          label: "Context persistence",
          bad: "Resets on every chat",
          good: "Lives in repo, always available",
        },
        {
          label: "Architecture ownership",
          bad: "AI decides implicitly",
          good: "You own every decision explicitly",
        },
      ],
      cards: [
        {
          title: "Document-driven",
          desc: "Code is a downstream artifact of documents. Every feature starts as a spec that persists in your repo.",
        },
        {
          title: "Architecture-agnostic",
          desc: "Doesn't impose a stack. Enforces whichever architecture you choose — MFA, FSD, DDD, Clean.",
        },
        {
          title: "Session-persistent",
          desc: "Context survives across sessions, team members, and AI tool switches. Specs live in your repo forever.",
        },
      ],
    },
    workflow: {
      eyebrow: "Workflow",
      title: "Five stages.<br>No ambiguity.",
      desc: "Every AI command maps to a distinct lifecycle stage. No mixing concerns, no guesswork about what the AI is doing.",
      svgOptional: "optional",
      stageLabels: ["INIT", "DECOMPOSE", "PLAN", "BUILD", "REVIEW"],
      details: [
        {
          cmd: "/archi.start",
          desc: "Read <code>project-brief.md</code>. Interview you on tech stack, architecture style, and project type. Build the project's constitution: <code>vision.md</code>, <code>roadmap.json</code>, <code>tech_stack</code>, rules, and domain indexes.",
        },
        {
          cmd: "/archi.plan <ID>",
          desc: "Architecture interview per feature. Generates <code>spec.md</code> (Gherkin scenarios + interface contracts), <code>plan.json</code> (Phase/Task breakdown), and <code>ui.md</code> for UI projects — before any code is written.",
        },
        {
          cmd: "/archi.code <ID>",
          desc: "Read the doc trio (spec + plan + ui). Validate Status Gate — <code>active</code> only. Implement phase by phase, marking each step <code>done</code> in <code>plan.json</code>.",
        },
      ],
    },
    quickstart: {
      eyebrow: "Quick Start",
      title: "Up and running<br>in two steps.",
      tab1: "New project",
      tab2: "Existing codebase",
      new: {
        comment1: "# 1. Deploy the framework files",
        comment2: "# 2. Fill in project-brief.md, then in Cursor:",
        out1: "✔  vision.md, roadmap.json, tech_stack generated",
        out2: "✔  .cursor/rules/ configured",
        out3: "◆  Run /archi.plan FEAT-001 to start your first feature",
      },
      existing: {
        comment1: "# 1. Deploy the framework files",
        comment2: "# 2. Reverse-engineer existing code in Cursor:",
        out1: "✔  Existing features registered as LEG-xx tasks",
        out2: "✔  map.json, stub spec files generated",
        out3: "◆  Continue with /archi.plan to document next feature",
      },
      tableHead: ["Command", "Purpose", "Outputs"],
      tableGroups: [
        {
          label: "Initialize",
          rows: [
            {
              cmd: "/archi.start",
              desc: "Build project constitution from a brief — vision, roadmap, tech stack, rules, domain indexes",
              out: "vision · roadmap · tech_stack · rules",
            },
            {
              cmd: "/archi.inherit",
              desc: "Reverse-engineer existing codebase; register features as LEG-xx tasks",
              out: "roadmap (LEG-xx) · map.json · stub specs",
            },
          ],
        },
        {
          label: "Define",
          rows: [
            {
              cmd: "/archi.scope",
              desc: "Decompose requirements into roadmap tasks (incremental — never rewrites existing tasks)",
              out: "updated roadmap.json",
            },
            {
              cmd: "/archi.plan",
              desc: "Architecture interview per feature → spec, plan, ui.md before any code",
              out: "spec.md · plan.json · ui.md",
            },
            {
              cmd: "/archi.edit",
              desc: "Update spec/ui; append new Phase to plan.json — history is always preserved",
              out: "updated spec + appended Phase",
            },
            {
              cmd: "/archi.revise",
              desc: "Project-level change: impact analysis → user confirm → cascade update all affected feature docs",
              out: "updated global assets + cascaded specs",
            },
          ],
        },
        {
          label: "Execute",
          rows: [
            {
              cmd: "/archi.code",
              desc: "Implement phase by phase from plan.json; Status Gate blocks non-active tasks",
              out: "source code · plan.json (done marks)",
            },
            {
              cmd: "/archi.audit",
              desc: "Read-only deep review against spec — structured findings + fix tickets, no code changes",
              out: "audit.md",
            },
            {
              cmd: "/archi.fix",
              desc: "Root-cause diagnosis; appends Bugfix Phase to plan.json, then surgical code fix",
              out: "Bugfix Phase + fixed code",
            },
          ],
        },
        {
          label: "Maintain",
          rows: [
            {
              cmd: "/archi.map",
              desc: "Diff map.json vs actual file tree; sync additions, removals, renames",
              out: "updated map.json",
            },
            {
              cmd: "/archi.remove",
              desc: "Full-chain decommission: delete docs + code, clean roadmap/map/dict/error_codes references",
              out: "code deleted · refs cleaned",
            },
            {
              cmd: "/archi.recover",
              desc: "Restore user data from an architext-pack.xml after upgrade or migration (run archi pack first, then archi uninstall + archi init)",
              out: "restored docs + tasks + rules",
            },
            {
              cmd: "/archi.help",
              desc: "No arg: recommend next action based on project state. With arg: locate relevant files and answer",
              out: "guidance only (no write)",
            },
          ],
        },
      ],
    },
    cta: {
      title: "Start building with intention.",
      desc: "Open source · MIT licensed · No vendor lock-in<br>Works with any AI editor",
      btn1: "Get started free",
      btn2: "Read the docs",
    },
    footer: {
      changelog: "Changelog",
      contributing: "Contributing",
    },
    notFound: {
      title: "404 — Page Not Found",
      message: "The page you're looking for doesn't exist.",
      home: "Back to Home",
    },
  },

  zh: {
    htmlLang: "zh-CN",
    otherLang: "English",
    otherLangHref: "/",
    meta: {
      title: "Architext — AI 架构协议",
      description:
        "文档驱动的 AI 开发协议。先定义，再构建。让你的 AI 编程助手从随机代码生成器升级为严格的架构师。",
      keywords:
        "AI 架构协议, 文档驱动开发, AI 编程工作流, Cursor IDE, 软件架构规范, 规格优先开发, AI 开发框架, DDAD",
      ogLocale: "zh_CN",
      ogLocaleAlt: "en_US",
    },
    nav: {
      workflow: "工作流",
      why: "为什么",
      quickstart: "快速开始",
    },
    hero: {
      badge: "开源 · 早期访问",
      titleHtml: "<em>AI 架构</em> 协议",
      tagline:
        "先定义，再构建。一种文档驱动的开发方法论，让你的 AI 从随机代码生成器升级为严格的架构师。",
      ctaPrimary: "开始使用",
      ctaSecondary: "查看 GitHub",
    },
    ide: {
      label: "支持的 IDE",
      cursorNote: "推荐",
    },
    why: {
      eyebrow: "问题所在",
      title: "AI 在写代码。<br>但那是你的代码吗？",
      desc: "每次对话都从零开始。AI 不记得你的架构决策，不理解你的约束条件，也没有一致的策略。Architext 将这些上下文持久化在你的代码仓库中。",
      tableHead1: "AI 全自主模式",
      tableHead2: "Architext",
      rows: [
        {
          label: "核心假设",
          bad: "AI 知道你想要什么",
          good: "你来定义，AI 来执行",
        },
        {
          label: "你的角色",
          bad: "审阅者 — 事后看结果",
          good: "决策者 — 构建前确认",
        },
        {
          label: "上下文持久",
          bad: "每次对话重置",
          good: "持久化在仓库，随时可用",
        },
        {
          label: "架构所有权",
          bad: "AI 隐式决定",
          good: "你显式拥有每一个决策",
        },
      ],
      cards: [
        {
          title: "文档驱动",
          desc: "代码是文档的下游产物。每个功能都从持久化在仓库中的规格说明开始。",
        },
        {
          title: "架构无关",
          desc: "不强制特定技术栈，可强制执行你选择的任何架构 — MFA、FSD、DDD、Clean 架构。",
        },
        {
          title: "会话持久",
          desc: "上下文在会话、团队成员和 AI 工具切换之间保持不变。规格文档永久存储在仓库中。",
        },
      ],
    },
    workflow: {
      eyebrow: "工作流",
      title: "五个阶段。<br>零模糊地带。",
      desc: "每个 AI 命令对应一个明确的生命周期阶段。不混淆关注点，不猜测 AI 在做什么。",
      svgOptional: "可选",
      stageLabels: ["初始化", "需求拆解", "规划", "构建", "审查"],
      details: [
        {
          cmd: "/archi.start",
          desc: "读取 <code>project-brief.md</code>，就技术栈、架构风格、项目类型进行访谈，建立项目宪法：<code>vision.md</code>、<code>roadmap.json</code>、技术规则和领域索引文件。",
        },
        {
          cmd: "/archi.plan <ID>",
          desc: "针对单个功能进行架构访谈，编码前生成 <code>spec.md</code>（Gherkin 场景 + 接口契约）、<code>plan.json</code>（Phase/Task 拆解），以及 UI 项目的 <code>ui.md</code>。",
        },
        {
          cmd: "/archi.code <ID>",
          desc: "读取文档三件套（spec + plan + ui），验证状态门控（仅 <code>active</code> 通过），按阶段逐步实现，并在 <code>plan.json</code> 中标记每步 <code>done</code>。",
        },
      ],
    },
    quickstart: {
      eyebrow: "快速开始",
      title: "两步即可<br>上手运行。",
      tab1: "新项目",
      tab2: "已有代码库",
      new: {
        comment1: "# 1. 部署框架文件",
        comment2: "# 2. 填写 project-brief.md，然后在 Cursor 中运行：",
        out1: "✔  vision.md, roadmap.json, tech_stack 已生成",
        out2: "✔  .cursor/rules/ 已配置",
        out3: "◆  运行 /archi.plan FEAT-001 开始第一个功能",
      },
      existing: {
        comment1: "# 1. 部署框架文件",
        comment2: "# 2. 在 Cursor 中逆向分析已有代码：",
        out1: "✔  已有功能注册为 LEG-xx 任务",
        out2: "✔  map.json、stub 规格文件已生成",
        out3: "◆  继续运行 /archi.plan 为下一个功能建档",
      },
      tableHead: ["命令", "用途", "产物"],
      tableGroups: [
        {
          label: "初始化",
          rows: [
            {
              cmd: "/archi.start",
              desc: "基于 project-brief.md 建立项目宪法 — vision、roadmap、技术规则、领域索引",
              out: "vision · roadmap · tech_stack · rules",
            },
            {
              cmd: "/archi.inherit",
              desc: "逆向分析已有代码库，将现有功能注册为 LEG-xx 任务",
              out: "roadmap (LEG-xx) · map.json · Stub spec",
            },
          ],
        },
        {
          label: "定义阶段",
          rows: [
            {
              cmd: "/archi.scope",
              desc: "将需求增量分解为路线图任务，禁止重写已有任务",
              out: "更新后的 roadmap.json",
            },
            {
              cmd: "/archi.plan",
              desc: "对单个功能进行架构访谈，编码前生成 spec、plan、ui.md",
              out: "spec.md · plan.json · ui.md",
            },
            {
              cmd: "/archi.edit",
              desc: "更新 spec/ui，向 plan.json 追加新 Phase，历史永久保留",
              out: "更新后的 spec + 追加的 Phase",
            },
            {
              cmd: "/archi.revise",
              desc: "项目级变更：影响分析 → 用户确认 → 级联更新受影响的功能文档",
              out: "更新后的全局资产 + 级联规格",
            },
          ],
        },
        {
          label: "执行阶段",
          rows: [
            {
              cmd: "/archi.code",
              desc: "按 plan.json 阶段实现；Status Gate 阻止非 active 任务进入",
              out: "源代码 · plan.json（done 标记）",
            },
            {
              cmd: "/archi.audit",
              desc: "只读深度审查，对照规格生成分级发现列表和修复工单，不改代码",
              out: "audit.md",
            },
            {
              cmd: "/archi.fix",
              desc: "根因诊断，向 plan.json 追加 Bugfix Phase，然后外科手术式修复",
              out: "Bugfix Phase + 修复后的代码",
            },
          ],
        },
        {
          label: "维护",
          rows: [
            {
              cmd: "/archi.map",
              desc: "扫描实际文件树与 map.json 比对，同步新增、删除、重命名",
              out: "更新后的 map.json",
            },
            {
              cmd: "/archi.remove",
              desc: "全链路下线：删除文档和代码，清理 roadmap/map/dict/error_codes 引用",
              out: "代码删除 · 引用清理",
            },
            {
              cmd: "/archi.recover",
              desc: "从 architext-pack.xml 还原用户数据，用于框架升级或迁移（先运行 archi pack 备份，再 archi uninstall + archi init）",
              out: "还原后的文档 · 任务 · 规则",
            },
            {
              cmd: "/archi.help",
              desc: "无参数：根据项目状态推荐下一步命令；有参数：定位相关文件并回答",
              out: "导航建议（不写入文件）",
            },
          ],
        },
      ],
    },
    cta: {
      title: "带着意图开始构建。",
      desc: "开源 · MIT 许可 · 无供应商锁定<br>兼容任何 AI 编辑器",
      btn1: "免费开始",
      btn2: "阅读文档",
    },
    footer: {
      changelog: "更新日志",
      contributing: "参与贡献",
    },
    notFound: {
      title: "404 — 页面未找到",
      message: "您访问的页面不存在。",
      home: "返回首页",
    },
  },
};

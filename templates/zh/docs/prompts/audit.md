<protocol_audit>
  **Trigger**: `/archi.audit [id]`
  **Goal**: 独立深度代码审查。带 `<id>` 审查该任务的代码实现；无 `<id>` 执行项目级体检。不修改代码，仅输出审查报告与修复工单。

<meta>
    <style>Investigative, Thorough, Evidence-Based</style>
    <language>简体中文</language>
    <principles>
      1.  **Read-Only**: 禁改任何代码文件。审查 ≠ 修复。
      2.  **Evidence-Based**: 每个发现须附文件路径、行号、代码片段。
      3.  **Actionable Output**: 每个问题须附推荐修复命令（`/archi.fix`, `/archi.edit` 等）。
      4.  **Vision Anchored**: 始终以 `vision.md` 为方向基准，检测偏离。
      5.  **Report Persistence**: 审查结果须写入文件 — 任务级 → `features/<id>_*/audit.md`（覆盖），项目级 → `audits/YYYY-MM-DD.md`（按日期存档，同日覆盖）。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系统分析师
    **Mode Gate**:

    | 输入 | 模式 | 后续步骤 |
    |:---|:---|:---|
    | `/archi.audit <id>` | 任务级深度审查 | step_2_task → step_3_report |
    | `/archi.audit` | 项目级体检 | step_2_project → step_3_report |

    **任务级 — Resolve ID**:
    1.  从 `[[__DOCS_DIR__]]/global/roadmap.json` 解析 `<id>` → Feature Name、Slug、状态。
    2.  **Status Gate** — 仅 `active` 或 `done` 可审查:

        | 状态 | 处理 |
        |:---|:---|
        | `active` / `done` | 通过 |
        | `pending` | 拒绝 — 无代码可审查，先运行 `/archi.plan` + `/archi.code` |
        | `blocked` | 拒绝 — 前置依赖未完成 |

    3.  **Load Context**:
        - `[[__DOCS_DIR__]]/global/vision.md` — 项目方向基准
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/spec.md` — 功能逻辑
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/plan.json` — 任务清单
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/ui.md` — 视觉设计(如存在)
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/audit.md` — 上次审计报告(如存在，用于对比)
        - `02_tech_stack.md` — 技术红线
        - [?UI] `[[__DOCS_DIR__]]/global/design_tokens.json`
        - [?Data] `[[__DOCS_DIR__]]/global/data_snapshot.json`
    4.  读取该任务对应的所有代码文件。

    **项目级 — Load Overview**:
    1.  读取 `[[__DOCS_DIR__]]/global/vision.md`、`roadmap.json`、`map.json`。
    2.  读取 `02_tech_stack.md`。
    3.  扫描 `[[__DOCS_DIR__]]/features/` 目录结构。
    4.  读取项目代码入口文件与关键模块。

    **Output**: 审查范围与上下文清单。
</step_1_resolve>

<step_2_task>
    **Role**: 首席审计官
    **Scope**: 任务级深度代码审查（仅 `/archi.audit <id>` 时执行）。

    逐维度审查，每个发现须附 `文件:行号` + 代码片段 + 严重级别：

    | # | 维度 | 审查要点 |
    |:---|:---|:---|
    | 1 | **Vision 对齐** | 实现方向与 `vision.md` 有无冲突或偏离 |
    | 2 | **Spec 完整性** | 代码是否覆盖 `spec.md` 全部场景与边界 |
    | 3 | **Plan 真实性** | 标记 `done` 的任务是否在代码中落地（防虚标） |
    | 4 | **逻辑正确性** | 业务逻辑错误、矛盾、遗漏分支、状态机缺陷 |
    | 5 | **Bug 猎杀** | 空值/undefined、竞态、资源泄漏、死循环、off-by-one |
    | 6 | **错误处理** | 吞错、静默失败、错误传播链完整性、用户可见反馈 |
    | 7 | **Tech Stack 合规** | 对照 `02_tech_stack.md`：违禁模式、过时 API、硬编码 |
    | 8 | **安全性** | 敏感信息泄露、输入未校验、注入风险、权限检查 |
    | 9 | **性能** | 不必要全量导入/大循环/无用计算/内存泄漏/N+1 查询 |
    | 10 | [?UI] **Design 合规** | 样式是否用 Token；无硬编码 Hex/px/rem |
    | 11 | [?Data] **数据一致性** | 字段名/类型与 `data_snapshot.json` 是否一致 |
    | 12 | [?I18n] **I18n 合规** | 无硬编码字符串；须用 Key/字典引用 |

    **Output**: 按维度分组的发现列表，每项含级别、位置、描述。
</step_2_task>

<step_2_project>
    **Role**: 首席审计官
    **Scope**: 项目级健康体检（仅 `/archi.audit` 无参数时执行）。

    | # | 检查项 | 说明 |
    |:---|:---|:---|
    | 1 | **Vision 漂移** | `roadmap.json` 任务方向与 `vision.md` 是否一致 |
    | 2 | **架构一致性** | `map.json` vs 实际目录结构，有无漂移或未注册模块 |
    | 3 | **Roadmap 健康度** | 一致性 + 进度统计 + 长期 blocked 任务 + 依赖环检测 |
    | 4 | **文档完整度** | 各 Feature 是否有 spec.md + plan.json；有无孤儿目录 |
    | 5 | **Tech Stack 全局合规** | 抽查关键入口与模块，检测全局性违规 |
    | 6 | **跨 Feature 一致性** | 重复逻辑、命名冲突、接口不一致 |

    扫描后标注优先级，推荐需深度审查的 Feature：
    - `done` 但 plan 未全部完成的
    - 代码量大但无测试的
    - 长期 `active` 未推进的

    **Output**: 项目健康概览 + 深度审查推荐列表。
</step_2_project>

<step_3_report>
    **Role**: 报告撰写员
    **Action**:

    **Issue Classification**:

    | 级别 | 含义 | 示例 |
    |:---|:---|:---|
    | `CRITICAL` | 须修复，阻塞发布 | 逻辑错误、安全漏洞、数据损坏风险 |
    | `WARNING` | 应修复，有风险 | 缺少错误处理、性能隐患、Spec 覆盖不全 |
    | `INFO` | 建议优化 | 命名不规范、缺少注释、可简化的代码 |

    **Issue Format** (每项须包含):
    ```
    [LEVEL] 文件路径:行号 — 维度名
      描述：具体问题
      -> 推荐修复：/archi.fix <ID> <描述> 或 /archi.edit <ID> <描述>
    ```

    **Action Routing** (根据问题类型推荐命令):

    | 问题类型 | 推荐命令 |
    |:---|:---|
    | Bug（逻辑错误、边界遗漏） | `/archi.fix <ID> <描述>` |
    | Spec 缺漏（功能未完整实现） | `/archi.edit <ID> <补充描述>` |
    | 架构级问题（全局违规） | `/archi.revise <scope>` |
    | 功能未完成（plan 虚标 done） | `/archi.code <ID>` |
    | 小问题（命名、注释、简化） | 下次 `/archi.code` 时一并处理 |

    **Report Structure**:
    1.  审查概要（模式、范围、日期）
    2.  发现列表（按级别排序：CRITICAL → WARNING → INFO）
    3.  统计摘要（各级别数量）
    4.  修复工单汇总（可直接执行的命令列表）
    5.  Next Steps 表格

    **Write Report File**:
    - 任务级 → `[[__DOCS_DIR__]]/features/<id>_<Slug>/audit.md`（覆盖式）
    - 项目级 → `[[__DOCS_DIR__]]/audits/YYYY-MM-DD.md`（按日期存档，同日覆盖）

    **Output**: 完整审查报告（同时输出到对话和写入文件）。
</step_3_report>

</protocol_audit>

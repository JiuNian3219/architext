<protocol_audit>
  **Trigger**: `/archi.audit [id]` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Goal**: 独立深度代码审查。带 `<id>` 审查该任务的代码实现；无 `<id>` 执行项目级体检。不修改代码，仅输出审查报告与修复工单。

<meta>
    <style>Investigative, Thorough, Evidence-Based</style>
    <language>简体中文</language>
    <principles>
      1.  **Read-Only**: 禁改任何代码文件。审查 ≠ 修复。
      2.  **Evidence-Based**: 每个发现须附文件路径、行号、代码片段。
      3.  **Actionable Output**: 每个问题须附推荐修复命令（`/archi.fix`, `/archi.edit` 等）。
      4.  **Vision Anchored**: 始终以 `vision.md` 为方向基准，检测偏离。
      5.  **Report Persistence**: 审查结果须写入文件 — 任务级 → `tasks/<id>_*/audit.md`（覆盖），项目级 → `audits/YYYY-MM-DD.md`（按日期存档）。
      6.  **IDE-Native First**: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准和检查点，不对抗 IDE 的规划/执行机制。
    </principles>
</meta>

<step_1_resolve>
    **Mode Gate**:

    | 输入 | 模式 | 后续步骤 |
    |:---|:---|:---|
    | `/archi.audit <id>` | 任务级深度审查 | step_2_task → step_3_report |
    | `/archi.audit` | 项目级体检 | step_2_project → step_3_report |

    **任务级 — Resolve ID**:
    1.  从 roadmap.json 解析 `<id>` → Task Name、Slug、状态。
    2.  **Status Gate** — 仅 `active` 或 `done` 可审查:

        | 状态 | 处理 |
        |:---|:---|
        | `active` / `done` | 通过 |
        | `pending` | 拒绝 — 无代码可审查 |
        | `blocked` | 拒绝 — 前置依赖未完成 |

    3.  **Load**: vision.md（方向基准）+ task docs (spec/plan/ui) + 前次 audit.md（对比用）+ project context (tech_stack/design_tokens/data_snapshot/ui_context/ui_concept)。读取该任务对应的所有代码文件。

    **项目级 — Load Overview**:
    1.  读取 vision.md、roadmap.json、map.json、02_tech_stack.md。
    2.  扫描 tasks/ 目录结构。
    3.  读取项目代码入口文件与关键模块。

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
    | 10 | （本任务涉及ui时） **Design 合规** | Token 使用；无硬编码魔法值；与 `ui_concept.html` 视觉一致 |
    | 11 | （本任务涉及data时） **数据一致性** | 字段名/类型与 `data_snapshot.json` 一致 |
    | 12 | （仅i18n项目） **I18n 合规** | 无硬编码字符串；须用 Key/字典引用 |
    | 13 | **Orphan .gitkeep** | 目录已有其他文件时仍存在 `.gitkeep` — 须删除 |
    | 14 | **Spec-Code 漂移** | 接口/类型/行为与 `spec.md` 一致；手动变更已同步文档 |
    | 15 | （本任务涉及ui时） **UI 引用完整性** | `ui.md` 中 `ref: ui_concept.html#S-XX` 指针是否仍有效 |

    **Output**: 按维度分组的发现列表，每项含级别、位置、描述。
</step_2_task>

<step_2_project>
    **Role**: 首席审计官
    **Scope**: 项目级健康体检（仅 `/archi.audit` 无参数时执行）。

    | # | 检查项 | 说明 |
    |:---|:---|:---|
    | 1 | **Vision 漂移** | `roadmap.json` 任务方向与 `vision.md` 是否一致 |
    | 2 | **架构一致性** | `map.json` vs 实际目录结构，有无漂移或未注册模块 |
    | 3 | **Roadmap 健康度** | 一致性 + 进度统计 + 长期 blocked + 依赖环检测 |
    | 4 | **文档完整度** | 各 Task 是否有 spec.md + plan.json；有无孤儿目录 |
    | 5 | **Tech Stack 全局合规** | 抽查关键入口与模块 |
    | 6 | **跨 Task 一致性** | 重复逻辑、命名冲突、接口不一致 |
    | 7 | **Orphan .gitkeep** | 目录已有其他文件时仍存在 `.gitkeep` |

    扫描后推荐需深度审查的 Task（`done` 但 plan 未全完成 / 代码量大无测试 / 长期 `active`）。

    **Output**: 项目健康概览 + 深度审查推荐列表。
</step_2_project>

<step_3_report>
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

    **Action Routing**:

    | 问题类型 | 推荐命令 |
    |:---|:---|
    | Bug | `/archi.fix <ID> <描述>` |
    | Spec 缺漏 | `/archi.edit <ID> <补充描述>` |
    | 架构级问题 | `/archi.revise <描述>` |
    | 功能未完成 | `/archi.code <ID>` |
    | 小问题 | 下次 `/archi.code` 时一并处理 |

    **Report Structure**: 审查概要 → 发现列表（CRITICAL → WARNING → INFO）→ 统计摘要 → 修复工单汇总 → Next Steps。

    **Write Report File**:
    - 任务级 → `[[__DOCS_DIR__]]/tasks/<id>_<Slug>/audit.md`（覆盖式）
    - 项目级 → `[[__DOCS_DIR__]]/audits/YYYY-MM-DD.md`（按日期存档）

    **Output**: 完整审查报告（同时输出到对话和写入文件）。
</step_3_report>

</protocol_audit>

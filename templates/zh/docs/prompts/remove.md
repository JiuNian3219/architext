<protocol_remove>
  **Trigger**: `/archi.remove <id>`
  **Goal**: 将指定 Task 从项目中彻底下线——删除文档、代码、全局引用，确保零残留。

<meta>
    <style>Surgical, Cautious, Thorough</style>
    <language>简体中文</language>
    <principles>
      1.  **Dependency Safety**: 有其他任务依赖此 Task 时，须先解除依赖才能继续。
      2.  **Confirmation Gate**: 删除操作不可逆，须向用户展示完整影响并获得明确确认。
      3.  **Zero Residue**: 清理须覆盖全部关联层面（文档/代码/全局数据/寻址条目）。
      4.  **No Side Effects**: 仅删除目标 Task 相关内容，禁触碰无关文件。
    </principles>
</meta>

<step_1_resolve>
    **Action**:
    1.  **Resolve ID**: 从 roadmap.json 解析 `<id>` → Task Name、Slug、状态。
    2.  **ID Not Found** → 报错并列出可用任务 ID。
    3.  **Load**: task docs 目录、roadmap.json（依赖关系）、map.json（架构注册）、99_context_glue.md（关联）。

    **Output**: 目标 Task 基本信息（ID、名称、状态、关联文件数）。
</step_1_resolve>

<step_2_impact>
    **Action**: 逐层扫描，生成影响清单。

    ### 2.1 依赖检查（阻塞级）

    扫描 roadmap.json 所有任务 `deps`，找出依赖 `<id>` 的任务。

    | 情况 | 处理 |
    |:---|:---|
    | 无下游依赖 | 通过 |
    | 有下游依赖且 `pending`/`blocked` | 列出，询问：移除依赖后继续 or 中止 |
    | 有下游依赖且 `active`/`done` | **阻塞** — 须先 `/archi.edit` 解耦 |

    ### 2.2 代码文件识别

    通过以下方式定位代码文件：context_glue 关联路径、map.json 注册模块、plan.json 提及的文件、以 Slug 命名或明确归属的文件。

    ### 2.3 全局引用扫描

    | 文件 | 扫描内容 |
    |:---|:---|
    | `roadmap.json` | 任务条目 + deps 引用 |
    | `map.json` | 模块条目 + featureRelations 中以被删 Task 为 aggregator 的条目 |
    | `99_context_glue.md` | 关联条目 |
    | `dictionary.json` | 独占术语（仅标记） |
    | `error_codes.json` | 独占错误码（仅标记） |

    ### 2.4 聚合联动检查

    [[SUBAGENT: archi-feature-relations|mode: cleanup, context: 检查被删 Task 在 featureRelations 中的引用，输出影响报告]][[NO-SKILL: （Skill 未安装：请阅读 `[[__DOCS_DIR__]]/skills/archi-feature-relations/SKILL.md`，按 mode: cleanup 的逻辑执行）]]

    ### 2.5 跨 Task 引用

    扫描其他 Task 的 `spec.md`，检查是否引用了被删 Task 的接口/组件/数据。发现引用则标注 `[Breaking]`。

    **Output**: 向用户输出下线影响报告 — 含 Task 状态、将删除的文档和代码（文件/来源表）、全局引用清理项（roadmap/map/context_glue）、（有）术语/错误码残留（须人工确认）、（有）聚合联动表、（有）跨 Task 引用 [Breaking] 表。末尾：OK 确认执行 / 中止取消。

    **Gate**: 用户回复 OK 后进入 step_3。有 `[Breaking]` 引用时须再次警告。
</step_2_impact>

<step_3_execute>
    **Role**: 外科医生
    **Action**: 按以下顺序执行（顺序不可调整）。

    | # | 操作 | 对象 |
    |:---|:---|:---|
    | 1 | 删除代码文件/目录 | step_2 识别的代码路径 |
    | 2 | 删除 Task 文档目录 | `[[__DOCS_DIR__]]/tasks/<id>_<slug>/` |
    | 3 | 更新 `roadmap.json` | 移除任务条目；清理 deps 引用 |
    | 4 | 更新 `map.json` | 移除模块条目 + featureRelations 条目 |
    | 5 | 更新 `99_context_glue.md` | 移除关联条目 |
    | 6 | [?有独占术语] 更新 `dictionary.json` | 移除或标注废弃 |
    | 7 | [?有独占错误码] 更新 `error_codes.json` | 移除或标注废弃 |
    | 8 | [?有聚合联动] 检查聚合方代码 | 确认引用已清理 |

    每步完成后记录操作日志。
</step_3_execute>

<step_4_verify>
    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 3 | 运行项目构建命令 | 零编译错误；无对已删模块的 import/require |

    构建失败或发现残留引用 → 定位并修复后重检。
</step_4_verify>

<step_5_summary>
    **Pre-signoff Checklist** (输出前须逐项确认):
    □ 代码文件/目录 — 已删除（step_3 操作 #1）
    □ tasks/<id>_<slug>/ 文档目录 — 已删除（step_3 操作 #2）
    □ roadmap.json — 任务条目 + deps 引用 — 已清理（step_3 操作 #3）
    □ map.json — 模块条目 + featureRelations — 已清理（step_3 操作 #4）
    □ 99_context_glue.md — 关联条目 — 已清理（step_3 操作 #5）
    □ （有独占术语/错误码）dictionary.json + error_codes.json — 已处理
    □ 全局文件清理检查:
      - vision.md + tech_stack.md — 必检
      - dictionary.json + error_codes.json — 必检
      - （仅ui项目）design_tokens.json + ui_context.md
      - （仅data项目）data_snapshot.json
      - （仅api项目）api_snapshot.json + env_registry.json
      - （仅cli项目）command_api.json
      - （仅lib项目）public_api.json
    □ Terminal Gate — 项目构建通过，无残留 import 引用（step_4）

    **Output**: 下线完成摘要：
    - **已删除**: 文档 N 个文件、代码 N 个文件
    - **已清理**: roadmap / map / context_glue 中的引用
    - **构建状态**: 通过/失败
    - **[?有]须人工跟进**: 术语/错误码/跨 Task 引用残留
    - **Git Commit Suggestion**: `feat(remove): decommission <ID> <Name>`
</step_5_summary>

</protocol_remove>

<protocol_remove>
  **Trigger**: `/archi.remove <id>`
  **Goal**: 将指定 Feature 从项目中彻底下线——删除文档、代码、全局引用，确保零残留。

<meta>
    <style>Surgical, Cautious, Thorough</style>
    <language>简体中文</language>
    <principles>
      1.  **Dependency Safety**: 有其他任务依赖此 Feature 时，须先解除依赖才能继续。
      2.  **Confirmation Gate**: 删除操作不可逆，须向用户展示完整影响并获得明确确认。
      3.  **Zero Residue**: 清理须覆盖全部关联层面（文档/代码/全局数据/寻址条目）。
      4.  **No Side Effects**: 仅删除目标 Feature 相关内容，禁触碰无关文件。
    </principles>
</meta>

<step_1_resolve>
    **Role**: 系统分析师
    **Action**:
    1.  **Resolve ID**: 从 `[[__DOCS_DIR__]]/global/roadmap.json` 解析 `<id>` → Feature Name、Slug、状态。
    2.  **ID Not Found** → 报错并列出可用任务 ID。
    3.  **Load Context**:
        - `[[__DOCS_DIR__]]/features/<id>_<Slug>/` — 全部文档（spec.md, ui.md, plan.json 等）
        - `[[__DOCS_DIR__]]/global/roadmap.json` — 任务依赖关系
        - `[[__DOCS_DIR__]]/global/map.json` — 架构注册
        - `99_context_glue.md` — 代码↔文档关联

    **Output**: 目标 Feature 基本信息（ID、名称、状态、关联文件数）。
</step_1_resolve>

<step_2_impact>
    **Role**: 影响评估官
    **Action**: 逐层扫描，生成影响清单。

    ### 2.1 依赖检查（阻塞级）

    扫描 `roadmap.json` 中所有任务的 `deps` 字段，找出依赖 `<id>` 的任务。

    | 情况 | 处理 |
    |:---|:---|
    | 无下游依赖 | 通过，继续 |
    | 有下游依赖且状态为 `pending`/`blocked` | 列出受影响任务，询问用户：移除依赖关系后继续，还是中止 |
    | 有下游依赖且状态为 `active`/`done` | **阻塞** — 这些任务可能已使用该 Feature 的接口/组件。须先用 `/archi.edit` 解耦后再移除 |

    ### 2.2 代码文件识别

    通过以下方式定位该 Feature 的代码文件：
    1.  `99_context_glue.md` 中与 `<id>` 关联的代码路径。
    2.  `map.json` 中该 Feature 注册的模块/目录。
    3.  `plan.json` 中任务提及的文件路径。
    4.  扫描代码目录，查找以 Slug 命名或在目录结构中明确归属的文件。

    ### 2.3 全局引用扫描

    | 文件 | 扫描内容 |
    |:---|:---|
    | `roadmap.json` | 任务条目 + 其他任务 `deps` 中的引用 |
    | `map.json` | 模块注册条目 |
    | `99_context_glue.md` | 关联条目 |
    | `dictionary.json` | 该 Feature 独占的术语（仅标记，不自动删） |
    | `error_codes.json` | 该 Feature 独占的错误码（仅标记，不自动删） |

    ### 2.4 跨 Feature 引用

    扫描其他 Feature 的 `spec.md`，检查是否引用了被删 Feature 的接口、组件或数据。发现引用则标注为 `[Breaking]`。

    **Output**: 向用户输出影响报告：
    ```
    ### 下线影响报告: <ID> <Name>

    **Feature 状态**: [status]

    **将删除的文档**:
    - [[__DOCS_DIR__]]/features/<id>_<slug>/  (N 个文件)

    **将删除的代码**:
    | 文件/目录 | 来源 |
    |:---|:---|
    | src/xxx/xxx.ts | context_glue |
    | src/xxx/ | map.json |

    **全局引用清理**:
    - roadmap.json: 移除任务 <id>，清理 N 处 deps 引用
    - map.json: 移除 N 个模块条目
    - context_glue: 移除 N 条关联

    **[?有]术语/错误码残留** (须人工确认):
    - dictionary.json: [term1], [term2]
    - error_codes.json: [ERR_XXX]

    **[?有]跨 Feature 引用 [Breaking]**:
    | 引用方 | 引用内容 | 建议 |
    |:---|:---|:---|
    | FEAT-005 spec.md | 调用了 <id> 的 UserAPI | 先 /archi.edit FEAT-005 解耦 |

    ---
    > 回复 **OK** 确认执行；回复 **中止** 取消操作。
    ```

    **Gate**: 用户回复 OK 后进入 step_3。有 `[Breaking]` 跨 Feature 引用时须再次警告。
</step_2_impact>

<step_3_execute>
    **Role**: 外科医生
    **Action**: 按以下顺序执行（顺序不可调整）。

    | # | 操作 | 对象 |
    |:---|:---|:---|
    | 1 | 删除代码文件/目录 | step_2 识别的代码路径 |
    | 2 | 删除 Feature 文档目录 | `[[__DOCS_DIR__]]/features/<id>_<slug>/` |
    | 3 | 更新 `roadmap.json` | 移除任务条目；清理其他任务 `deps` 中对 `<id>` 的引用 |
    | 4 | 更新 `map.json` | 移除该 Feature 注册的模块条目 |
    | 5 | 更新 `99_context_glue.md` | 移除该 Feature 的关联条目 |
    | 6 | [?有独占术语] 更新 `dictionary.json` | 移除或标注废弃 |
    | 7 | [?有独占错误码] 更新 `error_codes.json` | 移除或标注废弃 |

    每步完成后记录操作日志（文件路径 + 操作类型）。
</step_3_execute>

<step_4_verify>
    **Role**: 验证工程师
    **CLI 必执行**:
    1.  `npx archi task --check` — 验证 Roadmap 一致性（无悬空依赖）。
    2.  `npx archi render` — 重新生成 Markdown 视图。
    3.  运行项目构建命令 — 确认删除代码后无编译错误。

    | 检查项 | 通过标准 |
    |:---|:---|
    | Roadmap 一致性 | `--check` 通过，无悬空依赖 |
    | 构建 | 零编译错误 |
    | 残留引用 | 代码中无对已删模块的 import/require |

    构建失败或发现残留引用 → 定位并修复后重检。
</step_4_verify>

<step_5_summary>
    **Output**: 下线完成摘要：
    - **已删除**: 文档 N 个文件、代码 N 个文件
    - **已清理**: roadmap / map / context_glue 中的引用
    - **构建状态**: 通过/失败
    - **[?有]须人工跟进**: 术语/错误码/跨 Feature 引用残留
    - **Git Commit Suggestion**: `feat(remove): decommission <ID> <Name>`
</step_5_summary>

</protocol_remove>

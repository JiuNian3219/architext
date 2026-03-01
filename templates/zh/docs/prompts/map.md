<protocol_map>
  **Trigger**: `/archi.map`
  **Goal**: 扫描项目实际目录结构，与 `map.json` 比对，识别新增/过期/变动，经用户确认后更新架构地图。

<meta>
    <style>Systematic, Precise, Architecture-Aware</style>
    <language>简体中文</language>
    <principles>
      1.  **Scan vs Map**: 以实际文件系统为 Ground Truth，map.json 为旧快照。
      2.  **Smart Granularity**: 默认目录级；单文件承载多职责时须细化到文件级。
      3.  **Architecture Inference**: 新条目的层级归类须参考现有 map 模式 + `02_tech_stack.md`。
      4.  **Batch Confirm**: 所有变更一次性展示，用户批量确认。
    </principles>
</meta>

<step_1_scan>
    **Role**: 测量员
    **Action**:
    1.  **Read Map**: 读取 `[[__DOCS_DIR__]]/global/map.json` — 当前架构地图。
    2.  **Read Tech Stack**: 读取 `02_tech_stack.md` — 目录结构约定、架构模式。
    3.  **Scan Directory Tree**: 扫描项目目录结构。
        - **排除**: `.git/`, `node_modules/`, `dist/`, `build/`, `[[__DOCS_DIR__]]/`, 及 `.gitignore` 中声明的路径。
        - **深度**: 跟随 map.json 现有条目的粒度模式。如现有条目含文件级 → 扫描时也到文件级。

    **Output**: 内部数据（实际目录树 + 现有 map 结构），不输出给用户。
</step_1_scan>

<step_2_diff>
    **Role**: 比对分析师
    **Action**: 将实际目录树与 map.json 逐条比对，归类为三种差异。

    | 差异类型 | 判定条件 | 处理 |
    |:---|:---|:---|
    | **新增** (New) | 实际存在但 map 中无记录 | 须归类后登记 |
    | **过期** (Stale) | map 中有记录但实际已不存在 | 直接移除 |
    | **疑似重命名** (Renamed) | map 中的路径不存在，但有一个新路径结构/内容高度相似 | 标记为重命名候选 |

    ### 文件级检测

    对新增目录中的文件做快速扫描（读取导出/声明），识别**单文件多职责**的情况：
    - 一个文件导出多个不相关的 class/function/module
    - 一个入口文件聚合注册了多个子模块（如路由注册、Store 注册）
    - 一个文件同时服务多个 Task

    发现此类文件 → 粒度细化到文件级，在 map 中单独登记并描述其包含的职责。

    **Output**: 差异列表（内部），进入 step_3。
</step_2_diff>

<step_3_classify>
    **Role**: 首席架构师
    **Action**: 对新增条目做架构归类。

    ### 归类策略

    1.  **模式匹配**: 参考 map.json 中同层级已有条目的归类。如 `src/services/auth/` 属于 "Service Layer"，则 `src/services/payment/` 大概率也属于 "Service Layer"。
    2.  **Tech Stack 约定**: `02_tech_stack.md` 中定义的目录结构规则（如 "commands/ 下为 Task Layer"）。
    3.  **内容推断**: 读取文件内容（import 关系、导出类型），判断其架构角色。
    4.  **无法确定**: 标记为 `[?]`，交由用户在确认阶段指定。

    对每个新增条目填充：
    - `path`: 目录或文件路径
    - `layer`: 架构层级
    - `description`: 一句话描述职责
    - `[?文件级]` `contains`: 该文件包含的子职责列表

    **Output**: 已归类的新增条目列表（内部），进入 step_4。
</step_3_classify>

<step_4_propose>
    **Role**: 咨询顾问
    **Action**: 向用户展示完整变更清单。

    **Output**:
    ```
    ### 架构地图变更提案

    **扫描范围**: [项目根目录]
    **当前 map 条目数**: N | **变更后**: M

    ---

    #### 过期条目 (将移除)
    | 路径 | 原层级 |
    |:---|:---|
    | src/legacy/old-module/ | Service Layer |

    #### 新增条目 (将登记)
    | 路径 | 层级 | 描述 | 粒度 |
    |:---|:---|:---|:---|
    | src/services/payment/ | Service Layer | 支付服务模块 | 目录 |
    | src/utils/validators.ts | Shared Layer | 表单校验 + 数据校验 + API 参数校验 | 文件 |
    | src/routes/api.ts [?] | [待指定] | 聚合注册多条 API 路由 | 文件 |

    #### 疑似重命名
    | 原路径 | 新路径 | 置信度 |
    |:---|:---|:---|
    | src/helpers/ | src/utils/ | 高 (文件内容匹配) |

    ---
    > 回复 **OK** 确认全部；或指定修改：
    > - "src/routes/api.ts 属于 App Layer"
    > - "src/helpers/ 不是重命名，保留原条目"
    > - "新增 src/config/ 为 Config Layer"
    ```

    **Gate**: 用户确认后进入 step_5。
</step_4_propose>

<step_5_apply>
    **Role**: 系统管理员
    **Action**:
    1.  按用户确认的变更清单更新 `[[__DOCS_DIR__]]/global/map.json`：
        - 移除过期条目
        - 添加新增条目（含层级、描述）
        - 处理重命名（更新路径，保留其他元数据）
    2.  更新 `lastUpdated` 字段。

    **Terminal Gate** (禁止跳过，须在输出总结前全部完成):
    | 步骤 | 命令 | 通过条件 |
    |:---|:---|:---|
    | 1 | `npx archi task --check` | 无 ERROR 级问题 |
    | 2 | `npx archi render` | `.md` 视图生成完成 |

    **Output**: 更新摘要：
    - **移除**: N 条过期条目
    - **新增**: N 条（含 M 条文件级）
    - **重命名**: N 条
    - **当前 map 总条目数**: X
</step_5_apply>

</protocol_map>

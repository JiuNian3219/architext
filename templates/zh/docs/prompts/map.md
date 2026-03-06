<protocol_map>
  **Trigger**: `/archi.map` | 自然语言触发时由 Workflow Dispatch 自动加载
  **Goal**: 扫描项目实际目录结构，与 `map.json` 比对，识别新增/过期/变动，经用户确认后更新架构地图。

<meta>
    <style>Systematic, Precise, Architecture-Aware</style>
    <language>简体中文</language>
    <principles>
      1.  **Scan vs Map**: 以实际文件系统为 Ground Truth，map.json 为旧快照。
      2.  **Smart Granularity**: 默认目录级；单文件承载多职责时须细化到文件级。
      3.  **Architecture Inference**: 新条目的层级归类须参考现有 map 模式 + `02_tech_stack.md`。
      4.  **Batch Confirm**: 所有变更一次性展示，用户批量确认。
      5.  **IDE-Native First**: 利用 IDE 原生能力驱动执行节奏，本协议定义质量标准和检查点，不对抗 IDE 的规划/执行机制。
    </principles>
</meta>

<step_1_scan>
    **Action**:
    1.  **Read Map**: 读取 `[[__DOCS_DIR__]]/global/map.json` — 当前架构地图。
    2.  **Read Tech Stack**: 读取 `02_tech_stack.md` — 目录结构约定、架构模式。
    3.  **Scan Directory Tree**: 扫描项目目录结构。
        - **排除**: `.git/`, `node_modules/`, `dist/`, `build/`, `[[__DOCS_DIR__]]/`, 及 `.gitignore` 中声明的路径。
        - **深度**: 跟随 map.json 现有条目的粒度模式。

    **Output**: 内部数据（实际目录树 + 现有 map 结构），不输出给用户。
</step_1_scan>

<step_2_diff>
    **Action**: 将实际目录树与 map.json 逐条比对，归类为三种差异。

    | 差异类型 | 判定条件 | 处理 |
    |:---|:---|:---|
    | **新增** (New) | 实际存在但 map 中无记录 | 须归类后登记 |
    | **过期** (Stale) | map 中有记录但实际已不存在 | 直接移除 |
    | **疑似重命名** (Renamed) | map 中的路径不存在，但有一个新路径结构/内容高度相似 | 标记为重命名候选 |

    ### 文件级检测

    对新增目录中的文件做快速扫描，识别**单文件多职责**的情况 → 粒度细化到文件级。

    **Output**: 差异列表（内部），进入 step_3。
</step_2_diff>

<step_3_classify>
    **Role**: 首席架构师
    **Action**: 对新增条目做架构归类。

    ### 归类策略

    1.  **模式匹配**: 参考 map.json 同层级已有条目的归类。
    2.  **Tech Stack 约定**: `02_tech_stack.md` 中的目录结构规则。
    3.  **内容推断**: 读取文件内容（import 关系、导出类型）。
    4.  **无法确定**: 标记为 `[?]`，交由用户指定。

    对每个新增条目填充：`path`、`layer`、`description`、`[?文件级] contains`。

    **Output**: 已归类的新增条目列表（内部），进入 step_4。
</step_3_classify>

<step_4_propose>
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

    #### 新增条目 (将登记)
    | 路径 | 层级 | 描述 | 粒度 |
    |:---|:---|:---|:---|

    #### 疑似重命名
    | 原路径 | 新路径 | 置信度 |
    |:---|:---|:---|

    ---
    > 回复 **OK** 确认全部；或指定修改。
    ```

    **Gate**: 用户确认后进入 step_5。
</step_4_propose>

<step_5_apply>
    **Action**:
    1.  按确认清单更新 map.json（移除过期、添加新增、处理重命名）。
    2.  更新 `lastUpdated`。

    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。

    **Pre-signoff Checklist** (Output 前须逐项确认):
    □ 用户已在 step_4 明确确认变更清单（Gate 通过后才执行）
    □ 过期条目已从 directoryMapping 移除
    □ 新增条目已正确归类（path + layer + description 均已填写）
    □ 疑似重命名已明确处理（非静默忽略）
    □ lastUpdated 已更新
    □ Terminal Gate — task --check + render 通过

    **Output**: 更新摘要 — 移除 N 条 / 新增 N 条（含 M 条文件级）/ 重命名 N 条 / 当前总条目数。
</step_5_apply>

</protocol_map>

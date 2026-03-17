<protocol_script>
  **Trigger**: `/archi.script`
  **Goal**: 基于已冻结的 `tech_stack.md` 生成/更新 `.architext/scripts/` 自动化脚本。
  **When**: 基建任务（INF-01 等）完成后，`tech_stack` 命令已从占位符变为实际值且可运行时。

<meta>
    <style>Deterministic, Auto-Detect, Post-Infra</style>
    <language>简体中文</language>
    <principles>
      1. **Post-Infra Only**: 仅基建完成后执行，`tech_stack` 命令必须已确定且可运行。
      2. **Auto-Detect**: 自动识别 OS，生成 `.sh`（Unix）和 `.ps1`（Windows）。
      3. **Tech-Stack Driven**: 严格从 `tech_stack.md` 提取实际命令，禁硬编码。
      4. **Idempotent**: 多次运行结果一致，有变更才写入。
    </principles>
</meta>

<step_1_ingest>
    **Action**:
    1. 读取 `[[__DOCS_DIR__]]/global/tech_stack.md`
    2. 读取项目实际代码，提取实际命令：
       - `package.json` → `scripts` 字段（如有）
       - 配置文件 → `vite.config.*` / `webpack.config.*` / `tsconfig.json` 等
       - CI 配置 → `.github/workflows/` / `.gitlab-ci.yml` 等（如有）
    3. 交叉验证：tech_stack 命令 vs 实际配置
       - 一致 → 使用 tech_stack 命令
       - 不一致 → 以实际代码为准（tech_stack 可能过期）
    4. 提取以下命令（跳过 `[例如：...]` 占位符）：
       - **Lint**: Section 3 Static Analysis
       - **Format**: Section 3 Formatter
       - **Build**: Section 3 Build Command
       - **Test**: Section 5 Test Command
       - **Dev**: Section 3 Dev Command
       - **Install**: Section 3 Package Manager + install
    5. 检测当前 OS（Windows / Unix-like）

    **Output**: 内部命令映射表（tech_stack + 实际代码交叉验证结果），进入 step_2_generate。
</step_1_ingest>

<step_2_generate>
    **Action**: 基于提取的命令生成三个脚本：

    ### validate
    聚合检查：Lint → Format Check → Type Check → Build → Test
    - 每步失败即退出（exit 1）
    - 带颜色输出（绿=通过，红=失败，黄=跳过）

    ### dev-up
    启动环境：Install → Build → Health Check
    - Health Check：尝试运行构建产物（如 CLI 则 `--version`）

    ### dev-reset
    重置环境：Kill Process → Clean Cache → Reinstall → Rebuild → Health Check
    - Kill：终止 node/tsx 进程
    - Clean：删除 node_modules/.cache, dist, coverage

    **Script Structure**:
    - Unix (`.sh`): `#!/bin/bash`, `set -e`, ANSI colors
    - Windows (`.ps1`): PowerShell, `$ErrorActionPreference`, Write-Host colors

    **Output**: 内存中脚本内容，进入 step_3_write。
</step_2_generate>

<step_3_write>
    **Action**:
    1. 确保 `[[__DOCS_DIR__]]/scripts/` 目录存在
    2. 对比现有脚本（如有）：
       - 内容一致 → 跳过
       - 内容变更 → 覆盖，标注 `MODIFIED`
       - 不存在 → 写入，标注 `ADDED`
    3. 写入文件：
       - Unix: `validate`, `dev-up`, `dev-reset`（无扩展名，+x 权限）
       - Windows: `validate.ps1`, `dev-up.ps1`, `dev-reset.ps1`

    **Output**: 文件变更列表。
</step_3_write>

<step_4_signoff>
    **Terminal Gate** (禁止跳过): 标准检查 (task --check + render)。

    **Pre-signoff Checklist**:
    □ tech_stack.md — 成功提取到非占位符命令
    □ scripts/ — validate/dev-up/dev-reset 已生成（Unix + Windows）
    □ 变更标注 — ADDED / MODIFIED / SKIPPED 正确输出

    **Output**:
    ```
    ✅ Scripts Generated

    | 脚本 | OS | 状态 |
    |:---|:---|:---|
    | validate | Unix | ADDED/MODIFIED/SKIPPED |
    | validate | Windows | ADDED/MODIFIED/SKIPPED |
    | dev-up | Unix | ... |
    | dev-up | Windows | ... |
    | dev-reset | Unix | ... |
    | dev-reset | Windows | ... |

    **Next**: AI 执行 `/archi.code` 时将自动使用 `scripts/validate`
    ```
</step_4_signoff>

</protocol_script>

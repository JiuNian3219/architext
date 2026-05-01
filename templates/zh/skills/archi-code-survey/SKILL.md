---
name: archi-code-survey
description: Survey an existing codebase for /archi.init inherit. Must run in isolated context/subagent. Protocol-invoked only; do not auto-trigger from casual user requests.
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
---

## 调用方式

- **自动调用**: 否，不由模型根据 description 自行触发。
- **触发位置**: 仅由 `/archi.*` 协议中的 `[[SUBAGENT]]` / `[[NO-SUBAGENT]]` 显式调用。
- **执行上下文**: 支持 subagent 时必须在独立子代理/独立上下文执行；无 subagent 时才降级为内联 Skill。
- **边界**: 只返回协议要求的结构化产物，后续写入、确认和签收由调用协议负责。


## 设计原则

1. **Thorough Discovery**：全量读取所有非第三方业务代码（排除 node_modules/vendor/dist 等生成物）
2. **Layered Recording**：核心模块详细记录流程；共享逻辑记录签名和依赖；纯工具记录签名和用途
3. **Large Module Throttling**：单模块 > 20 个文件时，按被 import 次数排序详读前 10 个，其余仅记录导出签名
4. **Evidence-Based**：任何结论需基于代码事实，禁凭空推测

## 执行阶段

### 1a 粗读

1. 读取项目根配置文件（自动识别类型）：
   - Node.js: package.json, tsconfig.json
   - Rust: Cargo.toml
   - Go: go.mod
   - Python: pyproject.toml, requirements.txt
   - Java: pom.xml, build.gradle
   - 其他: 以根目录配置文件为准
2. 读取 README.md（如存在）
3. 扫描目录结构（完整深度）
4. 推断项目特征标签（ui / data / cli / lib / api）
5. 识别入口文件和核心模块；沿入口文件的 import 链建立模块依赖草图

### 1b 细读

1. 对每个功能模块：
   - 从入口文件出发，沿 import/调用链逐层读取，覆盖主要业务逻辑
   - 提取主要流程（用户操作 → 系统处理 → 结果）
   - 记录关联文件路径与 importedBy 反向关系
   - 大型模块（> 20 文件）：按 importedBy 次数排序读前 10 个，其余仅记录导出签名
2. 对共享/基建代码（utils, middleware, config）全量读取，按分档记录：
   - **中等档**（auth/validation/error-handling/permission）：职责 + 导出函数签名 + 被谁依赖
   - **简要档**（format/slugify/logger/helpers）：函数名 + 参数签名 + 一句话用途
   - 两者均写入 publicAPI 字段

### 1c 术语提取

从代码命名、注释、文档提取领域术语和命名约定，记录进 terminology。

## 输出契约

```
{
  features:      ["ui" | "data" | "cli" | "lib" | "api" | ...],
  techStack:     { language, runtime, framework, deps, buildTool, testTool, deployment, ... },
  modules:       [{ name, entryFile, responsibility, flows, files, importedBy }],
  sharedCode:    [{ path, tier: "medium" | "simple", responsibility, publicAPI, dependedBy }],
  terminology:   [{ term, context }],
  uncertainties: [{ question, location, options? }]
}
```
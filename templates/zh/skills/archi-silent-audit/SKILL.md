---
name: archi-silent-audit
description: Lightweight code and document review. **Must run in isolated context/subagent.** Use when verifying outputs or checking compliance with specifications.
---

# 嵌入式轻量审查

## 系统流程定位

```
/archi.* step_N → Verify 阶段
    ↓
[本 Skill] 接收模式参数 → 独立审查 → 返回发现列表
    ↓
主 Agent Signoff（须回应发现）
```

> **Skill 的职责边界**：
> - 负责：在独立上下文中审查主 Agent 产出，输出分级发现列表
> - 不负责：修复问题（交还主 Agent）、生成报告文件（那是 audit.md 的职责）、执行 Terminal Gate 命令

> **与 `audit.md` 的关系**：
> - `audit.md` = 独立深度审查协议，生成报告文件，仅用户主动触发 `/archi.audit`
> - 本 Skill = 嵌入式轻量检查，inline 返回发现列表，协议自动触发
> - 两者共享审查维度定义（见 `audit.md` step_2_task），本 Skill 按模式筛选执行

---

## 模式与审查维度

### 模式 `init` (调用方: start, inherit)

审查新建项目/继承项目的全局文件质量。

| # | 维度 | 审查要点 |
|:---|:---|:---|
| 1 | **Vision-Roadmap 对齐** | roadmap 任务方向与 vision.md 北极星指标是否一致 |
| 2 | **Tech Stack 一致性** | `tech_stack.md` 与实际依赖/配置是否一致 |
| 3 | **全局文件完整性** | 须存在的全局文件是否齐全（vision, roadmap, map, dictionary, tech_stack, custom_rules） |
| 4 | **信息零遗漏** | Brief/代码中的所有信息是否已路由到对应文件 |
| 5 | 仅ui项目: **Design Tokens** | `design_tokens.json` 含基础颜色/字体/间距定义 |

### 模式 `plan-docs` (调用方: plan)

审查规划文档（spec/ui/plan）的质量。

| # | 维度 | 审查要点 |
|:---|:---|:---|
| 1 | **Design Fidelity** | spec § 2 是否完整覆盖确认的功能设计 |
| 2 | **Dimension Match** | spec § 2 维度格式是否与 Task Type 匹配 |
| 3 | **Tech Consistency** | 是否用了 `tech_stack.md` 未声明的技术 |
| 4 | **WBS Coverage** | plan.json 是否 100% 覆盖 spec 的每个 AC 条目 |
| 5 | **Notes Quality** | plan.json 每个 task 的 notes 是否含产出物+约束+可执行验证 |
| 6 | **Interface Exports** | INF 任务 § 4 是否填写；有下游 deps 时是否声明接口 |
| 7 | **Constraints** | § 5 是否含 vision.md + tech_stack 相关红线 |
| 8 | 本任务涉及data时: **Data Integrity** | 实体和字段与确认的核心实体是否一致 |
| 9 | 仅Complex任务: **Design Trace** | design.md § 6 是否所有 AC 均可追踪 |
| 10 | 仅Complex任务: **Parameter Specificity** | design.md § 3 参数是否具体化（无模糊词） |
| 11 | 仅Complex任务: **Self-Check Pass** | design.md § 2 机制自检清单是否通过 |

### 模式 `code-impl` (调用方: code)

审查代码实现的质量。

| # | 维度 | 审查要点 |
|:---|:---|:---|
| 1 | **Tech Consistency** | 与 `tech_stack.md` 一致（库/模式/API 风格） |
| 2 | **SOTA** | 拒绝过时模式；采用 tech_stack 最佳实践 |
| 3 | **Security** | 无敏感信息泄露；输入有校验 |
| 4 | **Performance** | 避免不必要大依赖/全量导入/无用计算/内存泄漏 |
| 5 | 本任务涉及ui时: **Design Compliance** | 样式仅用 Token/Preset 视觉模式；无硬编码魔法值 |
| 6 | 本任务涉及ui时: **Accessibility** | 含必要无障碍属性 |
| 7 | 本任务涉及data时: **Data Integrity** | 符合 `data_snapshot.json`；字段名/类型一致 |
| 8 | 仅i18n项目: **I18n** | 无硬编码字符串；须用 Key/字典引用 |
| 9 | 仅Complex任务: **Design Compliance** | 状态转移/流程/协议与 design.md § 2 一致 |
| 10 | 仅Complex任务: **Invariant Enforcement** | design.md § 4 不变量在代码中有 assert/运行时检查 |
| 11 | 仅Complex任务: **Parameter Alignment** | 代码数值与 design.md § 3 参数表一致 |

---

## 执行协议

1. **读取上下文**: 按调用方传入的文件路径加载所需文档和代码
2. **按模式筛选维度**: 仅执行当前模式对应的审查维度表
3. **逐项审查**: 每个维度输出 PASS 或发现（含级别+位置+描述）
4. **输出发现列表**: 按级别排序返回

### 发现级别

| 级别 | 含义 | 主 Agent 须 |
|:---|:---|:---|
| `CRITICAL` | 阻塞性问题 | **须修复**后再签收，禁跳过 |
| `WARNING` | 有风险 | **须在签收报告中说明**处理方式 |
| `INFO` | 建议优化 | 可自行决定是否处理 |

### 输出格式

```
### Silent Audit Results (mode: <mode>)

**CRITICAL** (须修复):
- [维度名] 位置: 描述

**WARNING** (须说明):
- [维度名] 位置: 描述

**INFO** (建议):
- [维度名] 位置: 描述

**Summary**: X CRITICAL / Y WARNING / Z INFO
```

无发现时输出: `### Silent Audit Results (mode: <mode>) — ALL PASS`

---

> **中间产物**：此 Skill 为审查型子程序，产出发现列表后控制权交还调用方，由主 Agent 在 Signoff 中回应发现。

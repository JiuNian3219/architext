# 测试质量问题审查报告

> 审查日期: 2026-04-17
> 审查范围: src/__tests__/ 下所有测试文件

---

## 一、问题分类

### 1. 凑数型测试

**表现**：测试只验证"调用了"，不验证"结果对"。

**典型案例** (`logger.test.ts`)：
```typescript
it("info 应该调用 console.log", () => {
  logger.info("test message");
  expect(console.log).toHaveBeenCalledTimes(1);  // ← 只验证调用次数
});
```

**问题**：
- 没验证输出内容的正确性
- 没验证颜色/格式是否符合预期
- 没有边界测试（空字符串、超长字符串、特殊字符、Unicode）

**受影响文件**：
- `logger.test.ts` - 12个测试全为此类问题
- `t.test.ts` - 部分测试

---

### 2. 弱断言泛滥

**表现**：使用 `toContain`、`some`、`toHaveLength` 等宽松断言，无法精确定位问题。

**典型案例**：

```typescript
// doctor.test.ts
expect(results.some((r) => r.status === "warn")).toBe(true);  // ← 只验证"有 warn"

// rules.test.ts
expect(result).toContain("**[子代理]**");  // ← 只验证包含
expect(result).toContain("启动独立子代理");

// file-model.test.ts
expect(ops.length).toBeGreaterThan(0);  // ← 只验证数量大于0
```

**问题**：
- 不知道具体是哪个检查项失败
- 不知道输出是否包含不该有的内容
- 无法发现"多了内容"的问题

**受影响文件**：
- `doctor.test.ts`
- `rules.test.ts`
- `file-model.test.ts`
- `scaffold.test.ts`

---

### 3. 只测 Happy Path，缺边界/负面测试

**表现**：只测试正常输入的预期输出，缺失异常场景。

**缺失的测试场景**：

| 文件 | 已测试 | 未测试 |
|:---|:---|:---|
| `config.test.ts` | 文件不存在、JSON错误 | 文件权限问题、并发读写、超大文件、非UTF-8编码 |
| `roadmap-parser.test.ts` | 正常结构解析 | 字段类型错误、无效enum值、负数version、超长ID、循环依赖 |
| `rules.test.ts` | 正常格式指令 | 格式错误指令（缺`\|`）、嵌套指令、跨行指令、指令交叉 |
| `scaffold.test.ts` | 正常生成 | 模板文件损坏、磁盘空间不足、路径冲突 |
| `task.test.ts` | 正常状态更新 | 并发状态冲突、无效状态转换、依赖未完成时状态更新 |

---

### 4. 测试数据过于完美

**表现**：输入数据精心构造，没有噪声和干扰。

**当前测试数据特点**：
- 没有多余空格
- 没有换行符
- 没有特殊字符
- 没有混合指令场景
- 字段值刚好满足最小长度

**实际可能遇到的数据**：
```markdown
[[SUBAGENT: archi-silent-audit|mode: code-impl]]
  [[NO-SKILL: （Skill 未安装）]]  ← 有缩进

[[WHEN: ui,data | 仅UI+Data: ]]  ← 空格位置变化

[[SKILL: name|
多行参数内容
]]  ← 跨行
```

---

### 5. 测试重复

**表现**：相同逻辑的测试被重复定义。

**案例**：
- `rules.test.ts`: `[[NO-COMMANDS:]]` 测试在第281-331行和第333-368行完全重复

---

### 6. 验证实现而非行为

**表现**：测试依赖内部实现细节，而非验证公开行为。

**案例** (`t.test.ts`)：
```typescript
it("聚焦模式应该限制作用域", () => {
  const t = createT("zh", "init");
  const result = t("desc");
  expect(typeof result).toBe("string");  // ← 没验证"限制作用域"行为
});
```

**应该测试**：访问 `other.key` 时是否正确报错或返回fallback。

---

### 7. 集成测试只验证"文件存在"

**表现**：只检查文件/目录是否存在，不验证内容正确性。

**案例** (`scaffold.test.ts`)：
```typescript
expect(await fs.pathExists(docDir)).toBe(true);
expect(await fs.pathExists(mapFile)).toBe(true);
expect(() => JSON.parse(content)).not.toThrow();  // ← 只验证能解析
```

**缺失验证**：
- `[[SUBAGENT:]]` / `[[WHEN:]]` 是否正确展开
- 不同 `editors` 的输出差异
- `features` 是否影响输出内容
- 文件内容结构与模板一致性

---

## 二、解决方案

### 1. 强化断言策略

| 当前写法 | 改进写法 |
|:---|:---|
| `expect(result).toContain("xxx")` | `expect(result).toBe("精确输出")` |
| `expect(results.some(r => r.status === "warn"))` | `expect(results[1]).toMatchObject({ status: "warn", label: "xxx" })` |
| `expect(ops.length).toBeGreaterThan(0)` | `expect(ops.map(o => o.dest)).toEqual(["精确路径1", "精确路径2"])` |

**执行方案**：
- 对关键输出使用快照测试 `expect(result).toMatchSnapshot()`
- 复杂对象使用结构匹配 `toMatchObject`
- 简单输出使用精确匹配 `toBe`

---

### 2. 补充边界测试矩阵

每个功能模块需覆盖以下输入类型：

| 类型 | 示例 |
|:---|:---|
| 空值 | `""`, `null`, `undefined`, `[]` |
| 边界值 | 最小长度、最大长度、临界值 |
| 格式错误 | 缺少分隔符、多余空格、跨行 |
| 类型错误 | 字符串传数字、数组传对象 |
| 特殊字符 | Unicode、Emoji、控制字符 |
| 极端值 | 超大文件、超长字符串、深度嵌套 |

---

### 3. 增加负面测试

每个模块添加"不应该发生什么"的测试：

```typescript
// 正面：正确输入 → 正确输出
// 负面：错误输入 → 正确错误/拒绝

describe("错误处理", () => {
  it("格式错误的指令应保持原样", () => { ... });
  it("缺少必要字段应抛出特定错误", () => { ... });
  it("无效状态转换应被拒绝", () => { ... });
});
```

---

### 4. 引入噪声测试

使用属性测试（Property-based Testing）生成有噪声的输入：

```typescript
// 使用 fast-check 或手动构造
const noisyInputs = [
  "[[SUBAGENT: name|args]]",      // 正常
  "[[SUBAGENT: name|args]]\n",     // 尾部换行
  "  [[SUBAGENT: name|args]]",     // 前导空格
  "[[SUBAGENT:  name  |  args  ]]", // 多余空格
  "[[SUBAGENT:name|args]]",        // 无空格
];
```

---

### 5. 合并重复测试

**执行方案**：
- 审查所有 `describe` 块，合并相同逻辑
- 使用 `test.each` 处理参数化场景
- 删除完全重复的测试

---

### 6. 行为驱动测试结构

采用 Given-When-Then 结构：

```typescript
describe("resolveCapabilityRefs", () => {
  describe("WHEN 子代理能力标记", () => {
    it("Given hasSubagents=true, When 解析 SUBAGENT, Then 输出子代理启动指令", () => {
      // Given
      const input = "...";
      const capabilities = { hasSubagents: true, ... };

      // When
      const result = resolveCapabilityRefs(input, capabilities);

      // Then（精确断言）
      expect(result).toBe("**[子代理]** 启动独立子代理执行以下审查...");
    });
  });
});
```

---

### 7. 集成测试验证内容

不满足于"文件存在"，需验证内容正确性：

```typescript
describe("scaffold 输出验证", () => {
  it("SUBAGENT 指令应按编辑器能力正确展开", async () => {
    await scaffold({ editors: ["cursor"], ... });

    const ruleFile = await fs.readFile(".cursor/rules/00_system.mdc");
    expect(ruleFile).toContain("**[子代理]**");  // cursor 有子代理能力
    expect(ruleFile).not.toContain("[[SUBAGENT:");  // 不应保留原始标记
  });

  it("WHEN 指令应按 features 展开或移除", async () => {
    await scaffold({ editors: ["cursor"], features: ["ui"], ... });

    const ruleFile = await fs.readFile(".cursor/rules/00_system.mdc");
    expect(ruleFile).toContain("(仅UI项目)");
    expect(ruleFile).not.toContain("[[WHEN:");
    expect(ruleFile).not.toContain("(仅CLI项目)");  // features 无 cli
  });
});
```

---

## 三、优先级排序

| 优先级 | 问题 | 涉及文件数 | 修复成本 |
|:---|:---|:---|:---|
| P0 | 断言过弱，无法发现回归 | 8 | 中 |
| P1 | 缺少边界/负面测试 | 10 | 高 |
| P2 | 测试数据过于完美 | 6 | 中 |
| P3 | 只验证"文件存在" | 3 | 中 |
| P4 | 重复测试 | 1 | 低 |
| P5 | 凑数型测试 | 2 | 低 |

---

## 四、执行计划

### Phase 1: 核心模块 (预计 2 天)

1. `rules.test.ts` - 重写为精确断言 + 边界测试
2. `config.test.ts` - 补充权限/并发/编码测试
3. `roadmap-parser.test.ts` - 补充 Schema 验证测试

### Phase 2: 集成测试 (预计 1 天)

4. `scaffold.test.ts` - 验证输出内容正确性
5. `init.test.ts` - 验证多编辑器场景

### Phase 3: 工具函数 (预计 0.5 天)

6. `logger.test.ts` - 验证输出格式/颜色
7. `t.test.ts` - 验证行为而非实现

### Phase 4: 清理 (预计 0.5 天)

8. 删除重复测试
9. 合并相似测试用例
10. 统一测试风格

---

## 五、测试规范建议

### 命名规范

```
it("should [expected behavior] when [condition]", () => { ... });

// 示例
it("should throw ConfigParseError when JSON is malformed", () => { ... });
it("should expand SUBAGENT to sub-agent instruction when hasSubagents=true", () => { ... });
```

### 结构规范

```typescript
describe("[模块名]", () => {
  describe("[功能点]", () => {
    it("正常场景", () => { ... });
    it("边界场景", () => { ... });
    it("错误场景", () => { ... });
  });
});
```

### 断言优先级

1. `toBe()` / `toEqual()` - 精确匹配
2. `toMatchObject()` - 结构匹配
3. `toThrow()` - 错误类型匹配
4. `toContain()` - 仅用于文本搜索（不推荐用于结构验证）
5. `toBeTruthy()` / `toBeFalsy()` - 禁止使用

---

## 六、参考资源

- [Testing Library - Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Property Based Testing](https://github.com/dubzzz/fast-check)

---

*报告结束*

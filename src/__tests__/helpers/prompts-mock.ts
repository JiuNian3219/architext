import { vi } from "vitest";

/**
 * 模拟 @clack/prompts 的行为
 */
export const mockPrompts = {
  // 模拟用户的输入值
  _injectedValues: {} as Record<string, unknown>,

  /**
   * 注入用户的回答
   * @param values 键值对，key 是 prompt 的步骤名称（如果代码逻辑无法区分步骤，可以按顺序或 mock 全部返回）
   *
   * 注意：由于 @clack/prompts 的 group API 返回的是一个对象，我们主要模拟 group 的返回值
   */
  inject(values: Record<string, unknown>) {
    this._injectedValues = values;
  },

  /**
   * 重置 mock
   */
  reset() {
    this._injectedValues = {};
  },
};

/**
 * 设置 @clack/prompts 的全局 mock
 * 需要在测试文件的顶部调用：vi.mock("@clack/prompts", () => ...)
 * 但由于 ESM 的限制，通常建议在测试 setup 文件中或具体测试文件中显式 mock
 */
export function setupPromptsMock() {
  vi.mock("@clack/prompts", async () => {
    return {
      intro: vi.fn(),
      outro: vi.fn(),
      text: vi.fn().mockResolvedValue("mock-text"),
      confirm: vi.fn().mockResolvedValue(true),
      select: vi.fn().mockResolvedValue("mock-select"),
      multiselect: vi.fn().mockResolvedValue(["mock-multi"]),
      spinner: () => ({
        start: vi.fn(),
        stop: vi.fn(),
      }),
      group: vi.fn().mockImplementation(async (steps) => {
        // 在 group 中，通常会执行 steps，我们这里简单返回注入的值
        // 真实场景中 steps 是一个回调函数映射，这里简化处理，直接返回注入的配置
        return mockPrompts._injectedValues;
      }),
      cancel: vi.fn(),
      isCancel: vi.fn(() => false),
    };
  });
}

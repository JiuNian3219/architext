/** @fileoverview 文本归一化工具测试 — 覆盖 BOM 移除、换行符统一、边界场景。 */

import { describe, it, expect } from "vitest";
import { normalizeText, normalizeLines } from "../../utils/normalize-text.ts";

describe("normalizeText", () => {
  describe("BOM 移除", () => {
    it("应移除 UTF-8 BOM (\\uFEFF)", () => {
      const input = "﻿Hello World";
      expect(normalizeText(input)).toBe("Hello World");
    });

    it("无 BOM 时应保持原样", () => {
      const input = "Hello World";
      expect(normalizeText(input)).toBe("Hello World");
    });

    it("多个 BOM 应只移除开头的 BOM", () => {
      const input = "﻿﻿Content";
      expect(normalizeText(input)).toBe("﻿Content");
    });

    it("中间的 BOM 不应被移除", () => {
      const input = "Start﻿Middle﻿End";
      expect(normalizeText(input)).toBe("Start﻿Middle﻿End");
    });
  });

  describe("换行符统一", () => {
    it("应将 Windows 换行符 (\\r\\n) 转换为 \\n", () => {
      const input = "Line1\r\nLine2\r\nLine3";
      expect(normalizeText(input)).toBe("Line1\nLine2\nLine3");
    });

    it("应将旧 Mac 换行符 (\\r) 转换为 \\n", () => {
      const input = "Line1\rLine2\rLine3";
      expect(normalizeText(input)).toBe("Line1\nLine2\nLine3");
    });

    it("混合换行符应全部统一为 \\n", () => {
      const input = "Line1\r\nLine2\rLine3\nLine4";
      expect(normalizeText(input)).toBe("Line1\nLine2\nLine3\nLine4");
    });

    it("已经是 \\n 的内容应保持不变", () => {
      const input = "Line1\nLine2\nLine3";
      expect(normalizeText(input)).toBe("Line1\nLine2\nLine3");
    });
  });

  describe("边界测试", () => {
    it("空字符串应返回空字符串", () => {
      expect(normalizeText("")).toBe("");
    });

    it("仅包含 BOM 的字符串应返回空字符串", () => {
      expect(normalizeText("﻿")).toBe("");
    });

    it("仅包含换行符的字符串应正确处理", () => {
      expect(normalizeText("\r\n\r\n")).toBe("\n\n");
      expect(normalizeText("\r\r")).toBe("\n\n");
    });

    it("Unicode 内容应正确处理", () => {
      const input = "﻿中文内容\r\n日本語\r한국어";
      expect(normalizeText(input)).toBe("中文内容\n日本語\n한국어");
    });

    it("Emoji 应正确处理", () => {
      const input = "﻿🎉 Party\r\n🚀 Launch";
      expect(normalizeText(input)).toBe("🎉 Party\n🚀 Launch");
    });

    it("超长字符串应正确处理", () => {
      const input = "﻿" + "A".repeat(10000) + "\r\n" + "B".repeat(10000);
      const result = normalizeText(input);
      expect(result).toBe("A".repeat(10000) + "\n" + "B".repeat(10000));
    });
  });
});

describe("normalizeLines", () => {
  it("应将文本按 \\n 拆分为数组", () => {
    const input = "Line1\nLine2\nLine3";
    expect(normalizeLines(input)).toEqual(["Line1", "Line2", "Line3"]);
  });

  it("应先归一化再拆分", () => {
    const input = "﻿Line1\r\nLine2\rLine3";
    expect(normalizeLines(input)).toEqual(["Line1", "Line2", "Line3"]);
  });

  it("空字符串应返回单元素数组 ['']", () => {
    expect(normalizeLines("")).toEqual([""]);
  });

  it("仅换行符应返回两个空字符串元素", () => {
    expect(normalizeLines("\n")).toEqual(["", ""]);
    expect(normalizeLines("\r\n")).toEqual(["", ""]);
  });

  it("末尾换行符应产生空字符串元素", () => {
    expect(normalizeLines("Line1\nLine2\n")).toEqual(["Line1", "Line2", ""]);
  });

  it("开头换行符应产生空字符串元素", () => {
    expect(normalizeLines("\nLine1\nLine2")).toEqual(["", "Line1", "Line2"]);
  });

  it("连续换行符应产生空字符串元素", () => {
    expect(normalizeLines("Line1\n\nLine2")).toEqual(["Line1", "", "Line2"]);
  });
});

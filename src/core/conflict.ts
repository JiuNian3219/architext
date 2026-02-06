/**
 * ---
 * description: 冲突解决器，负责检测目标路径是否已存在文件，并提供交互式的解决策略（覆盖、跳过、取消）。
 * ---
 */

import { select } from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import { FileOperation } from "../types/index.ts";
import { logger } from "../utils/logger.ts";
import { createT, getSystemLocale } from "../utils/t.ts";
import { UserCancelError } from "./errors.ts";

const t = createT(getSystemLocale(), "command.init");

export class ConflictResolver {
  /**
   * 处理冲突逻辑：检测冲突 -> 询问用户 -> 返回最终要执行的操作列表
   * @param operations 原始操作计划
   * @returns 过滤后的操作列表 (如果用户选择跳过，则移除冲突项；如果选择覆盖，则保留)
   */
  static async resolve(operations: FileOperation[]): Promise<FileOperation[]> {
    const conflicts = await this.detectConflicts(operations);

    if (conflicts.length === 0) {
      return operations;
    }

    const action = await this.promptAction(conflicts);

    if (action === "cancel") {
      throw new UserCancelError(t("cancel"));
    }

    if (action === "overwrite") {
      return operations;
    }

    if (action === "skip") {
      // 过滤掉所有在冲突列表中的操作
      const conflictDestSet = new Set(conflicts);
      return operations.filter(
        (op) => !conflictDestSet.has(path.relative(process.cwd(), op.dest)),
      );
    }

    return operations;
  }

  /**
   * 检测操作计划中所有目标路径是否已存在文件
   * @param operations 原始操作计划
   * @returns 冲突文件的相对路径列表
   */
  private static async detectConflicts(
    operations: FileOperation[],
  ): Promise<string[]> {
    const checks = await Promise.all(
      operations.map((op) => fs.pathExists(op.dest)),
    );

    return operations
      .filter((_, index) => checks[index])
      .map((op) => path.relative(process.cwd(), op.dest));
  }

  /**
   * 交互式询问用户解决策略
   * @param conflicts 冲突文件的相对路径列表
   * @returns 用户选择的操作策略（覆盖、跳过、取消）
   */
  private static async promptAction(
    conflicts: string[],
  ): Promise<"overwrite" | "skip" | "cancel"> {
    logger.warn(t("conflict_title"));

    const limit = 5;
    conflicts.slice(0, limit).forEach((f) => logger.info(`  - ${f}`));
    if (conflicts.length > limit) {
      logger.dim(t("conflict_more", { count: conflicts.length - limit }));
    }

    const action = await select({
      message: t("conflict_msg"),
      options: [
        { value: "overwrite", label: t("conflict_overwrite") },
        { value: "skip", label: t("conflict_skip") },
        { value: "cancel", label: t("conflict_cancel") },
      ],
    });

    if (typeof action === "symbol") {
      return "cancel";
    }

    return action as "overwrite" | "skip" | "cancel";
  }
}

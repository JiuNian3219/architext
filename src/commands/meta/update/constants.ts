/** @fileoverview update 命令常量：Roadmap Schema 迁移版本号与迁移步骤注册表。 */

/** CLI 当前期望的 roadmap.json Schema 版本 */
export const EXPECTED_ROADMAP_VERSION = 1;

/** 迁移函数的入参/出参类型（宽松 Record，避免与具体版本的字段类型耦合） */
export type MigrationFn = (
  data: Record<string, unknown>,
) => Record<string, unknown>;

/** 单次迁移步骤：描述从 fromVersion → fromVersion+1 的变更 */
export interface MigrationStep {
  fromVersion: number;
  description: string;
  migrate: MigrationFn;
}

/**
 * 迁移步骤注册表，按 fromVersion 升序排列。
 * 新增字段时：追加一项，并将 EXPECTED_ROADMAP_VERSION 加 1。
 *
 * 示例（当前无历史迁移，保留结构演示迁移机制）：
 * {
 *   fromVersion: 1,
 *   description: "为 Task 新增 slug 字段（默认空字符串）",
 *   migrate: (data) => {
 *     const phases = (data.phases as Array<Record<string, unknown>>) ?? [];
 *     return {
 *       ...data,
 *       phases: phases.map((phase) => ({
 *         ...phase,
 *         tasks: ((phase.tasks as Array<Record<string, unknown>>) ?? []).map(
 *           (task) => ({ slug: "", ...task }),
 *         ),
 *       })),
 *     };
 *   },
 * }
 */
export const ROADMAP_MIGRATIONS: MigrationStep[] = [];

/**
 * ---
 * description: Task 命令入口，协调 Resolver（路径解析）、Parser（数据解析）和 Handlers（业务逻辑）以完成任务管理。
 * ---
 */
import { RoadmapParser } from "../../../core/roadmap/parser.ts";
import type { TaskCommandOptions } from "../../../types/index.ts";
import { handleCheck, handleList, handleUpdateStatus } from "./handlers.ts";
import { resolveRoadmapPath } from "./resolver.ts";

/**
 * Task 命令的主入口函数。
 * 根据 options 分发到对应的处理器：check / updateStatus / list（默认）。
 *
 * @param id 可选的任务 ID（仅 --status 时必传）
 * @param options 命令行选项
 */
export async function taskCommand(
  id: string | undefined,
  options: TaskCommandOptions,
): Promise<void> {
  const roadmapPath = await resolveRoadmapPath();
  const parser = new RoadmapParser();
  const data = await parser.parse(roadmapPath);

  if (options.check) {
    await handleCheck(data);
    return;
  }

  if (options.status) {
    await handleUpdateStatus(data, roadmapPath, id, options.status);
    return;
  }

  // 默认行为：列出所有任务
  handleList(data);
}

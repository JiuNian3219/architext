# map.json

- `directoryMapping[]`: real source/document directories and their ownership.
- `directoryMapping[].path`: project-relative path.
- `directoryMapping[].layer`: architectural layer.
- `directoryMapping[].responsibility`: what this path owns.
- `directoryMapping[].publicAPI`: exported surface or entry points.
- `logicalTopology[]`: module relationships.
- `logicalTopology[].from/to`: mapped paths or module ids.
- `logicalTopology[].type`: relation type, e.g. imports/calls/extends.
- `criticalUserJourneys[]`: important end-to-end flows.
- `featureRelations[]`: 变更联动索引，用来回答“source 改了，哪些 targets 必须同步检查？”
- `featureRelations[].id`: 稳定关系 ID，例如 `FR-001`。
- `featureRelations[].source`: 触发联动检查的路径、目录、glob、模块名或已有 map 条目。
- `featureRelations[].targets`: source 变更时必须检查的路径、模块、文档或 map 条目。
- `featureRelations[].checkRule`: 简短、可执行的同步检查规则。
- `featureRelations[].evidence`: 建立关系的简短依据，如 `file:line`、文档路径或 task ID。

示例：
- 命令注册表 source -> 命令文档/测试 targets；检查新增命令是否同步登记。
- Schema/template source -> guide/测试 targets；检查字段说明和脚手架期望保持一致。
- Prompt source -> skill/router targets；检查协议措辞和工具调用保持一致。

Invariants:
- Mapping must reflect real project paths.
- Update relations when adding/removing linked modules.
- 每条关系保持短引用，不把长上下文复制进 `map.json`。
- 只记录稳定可复用的联动关系，不记录一次性任务步骤。

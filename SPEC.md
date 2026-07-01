# SPEC: 个人待办事项应用（MyTODO）

> 人类可读摘要。完整规格见 openspec 变更：`openspec/changes/todo-f8c546dc/`
> （`proposal.md` + `specs/<capability>/spec.md`）。

## 概述
为「管理个人日常待办事项」的 TODO 应用建立首个规格。用户可创建、编辑、删除待办，
标记完成状态并按状态筛选，数据跨会话持久化。前端 React + Vite + Tailwind，
后端 Node HTTP API + PostgreSQL，遵循已批准的项目奠基与设计系统。

## 能力（Capabilities）
- **todo-management** — 待办的创建、查看、编辑标题、删除，含空标题/超长校验。
- **todo-completion** — 完成状态切换、按「全部/未完成/已完成」筛选、未完成计数。
- **todo-persistence** — 跨会话持久化、按用户鉴权（fail-closed）、向后兼容可重放迁移。

## 范围
**在范围内**
- 单用户个人待办的完整增删改查与状态管理。
- 数据持久化到 PostgreSQL，按认证用户隔离。

**不在范围内**
- 多用户协作/共享、提醒推送、标签/分组、路由与多页面。
- 改动现有 `index.html` 静态骨架（由后续实现阶段处理）。

## 验收
- `openspec validate todo-f8c546dc --strict` 通过。
- 三个 capability 的 spec 均含 Requirement（SHALL）与至少一个 Scenario（WHEN/THEN）。

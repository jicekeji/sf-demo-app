# PLAN 摘要 · MyTODO（change: todo-f8c546dc）

> 本文件是 `tasks.md` 的高层摘要。完整规格见 `proposal.md` 与 `specs/<capability>/spec.md`，
> 逐步实现清单见 `tasks.md`。本阶段之后进入实现阶段（本变更只产出规格与计划）。

## 目标
构建「管理个人日常待办事项」的 TODO 应用：创建、查看、编辑、删除待办，切换完成状态并按状态筛选，
数据跨会话持久化并按认证用户隔离。遵循已批准的项目奠基、设计系统与视觉主题。

## 技术栈
- 前端：React + Vite + Tailwind CSS（TypeScript），复用设计令牌与组件清单，靛蓝主色 `#4f46e5`。
- 后端：Node HTTP API（TypeScript）+ PostgreSQL。
- 非功能：鉴权 fail-closed、结构化日志、健康探测、可重放且向后兼容的迁移（加列不删列）。

## 能力与验收要点
- **todo-management**：非空且 ≤200 字符标题校验；稳定顺序列表与空状态；编辑复用创建校验；删除含「未找到」反馈。
- **todo-completion**：完成/未完成切换含视觉区分；「全部/未完成/已完成」筛选；未完成计数即时更新。
- **todo-persistence**：跨会话加载保留；保存失败不静默丢弃并可重试；未认证拒绝且仅见本人数据；迁移幂等、旧记录默认值可读。

## 实施策略（TDD）
按 `tasks.md` 的分组顺序推进：脚手架 → 数据层/迁移 → 鉴权 → 后端 API（管理/完成）→ 前端组件与交互 → 持久化/错误处理 → 可观测性 → 验收。
每个涉及代码的步骤先写对应失败测试再实现，测试直接映射 spec 中的 Scenario，确保每步可独立验证。

## 范围边界
不改动现有 `index.html` 静态骨架；不引入路由/多页面、多用户协作共享、提醒推送、标签/分组等超范围特性。

## 完成判定
`openspec validate todo-f8c546dc --strict` 通过，且三个 capability 的全部 Scenario 均有对应测试覆盖。

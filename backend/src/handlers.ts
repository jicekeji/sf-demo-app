/**
 * Request handlers for the todo API. Each handler is transport-agnostic: it
 * receives the resolved user id, parsed params/body and returns a plain
 * `{ status, body }` result. `server.ts` wires these to Node's http module.
 */
import { ApiError, notFound } from './errors.js';
import type { StatusFilter, TodoRepository } from './repository/todoRepository.js';
import { validateTitle } from './validation.js';

export interface HandlerResult {
  status: number;
  body: unknown;
}

function parseStatus(raw: string | null): StatusFilter {
  if (raw === 'active' || raw === 'completed') return raw;
  return 'all';
}

export async function listTodos(
  repo: TodoRepository,
  userId: string,
  statusParam: string | null,
): Promise<HandlerResult> {
  const status = parseStatus(statusParam);
  const result = await repo.list(userId, status);
  return { status: 200, body: result };
}

export async function createTodo(
  repo: TodoRepository,
  userId: string,
  body: unknown,
): Promise<HandlerResult> {
  const title = validateTitle((body as { title?: unknown })?.title);
  const todo = await repo.create(userId, title);
  return { status: 201, body: { todo } };
}

export async function updateTodo(
  repo: TodoRepository,
  userId: string,
  id: string,
  body: unknown,
): Promise<HandlerResult> {
  const payload = (body ?? {}) as { title?: unknown; completed?: unknown };
  const changes: { title?: string; completed?: boolean } = {};

  if (payload.title !== undefined) {
    changes.title = validateTitle(payload.title);
  }
  if (payload.completed !== undefined) {
    if (typeof payload.completed !== 'boolean') {
      throw new ApiError('validation_error', 400, 'completed 必须为布尔值');
    }
    changes.completed = payload.completed;
  }

  const updated = await repo.update(userId, id, changes);
  if (!updated) throw notFound('待办事项未找到');
  return { status: 200, body: { todo: updated } };
}

export async function deleteTodo(
  repo: TodoRepository,
  userId: string,
  id: string,
): Promise<HandlerResult> {
  const removed = await repo.remove(userId, id);
  if (!removed) throw notFound('待办事项未找到');
  return { status: 200, body: { ok: true } };
}

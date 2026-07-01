/**
 * In-memory fake implementing the TodoClient surface used by TodoApp. Lets
 * component tests drive create/list/update/remove and simulate backend failures
 * without a real network.
 */
import { ApiError, TodoClient } from '../src/api/client';
import type { StatusFilter, Todo } from '../src/types';

let seq = 0;

export class FakeClient {
  private todos: Todo[] = [];
  /** When true, every mutating call rejects as if the backend were down. */
  failWrites = false;

  seed(titles: Array<string | { title: string; completed?: boolean }>): void {
    for (const entry of titles) {
      const title = typeof entry === 'string' ? entry : entry.title;
      const completed = typeof entry === 'string' ? false : Boolean(entry.completed);
      this.todos.push(this.make(title, completed));
    }
  }

  private make(title: string, completed = false): Todo {
    const now = new Date(2020, 0, 1, 0, 0, seq).toISOString();
    seq += 1;
    return { id: `t${seq}`, title, completed, createdAt: now, updatedAt: now };
  }

  private activeCount(): number {
    return this.todos.filter((t) => !t.completed).length;
  }

  async list(status: StatusFilter = 'all') {
    const filtered = this.todos.filter((t) =>
      status === 'active' ? !t.completed : status === 'completed' ? t.completed : true,
    );
    return { todos: filtered.map((t) => ({ ...t })), activeCount: this.activeCount() };
  }

  async create(title: string) {
    if (this.failWrites) throw new ApiError('network_error', 0, '无法连接服务器');
    const todo = this.make(title.trim());
    this.todos.push(todo);
    return { todo: { ...todo } };
  }

  async update(id: string, changes: { title?: string; completed?: boolean }) {
    if (this.failWrites) throw new ApiError('network_error', 0, '无法连接服务器');
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) throw new ApiError('not_found', 404, '待办事项未找到');
    if (changes.title !== undefined) todo.title = changes.title.trim();
    if (changes.completed !== undefined) todo.completed = changes.completed;
    return { todo: { ...todo } };
  }

  async remove(id: string) {
    if (this.failWrites) throw new ApiError('network_error', 0, '无法连接服务器');
    const before = this.todos.length;
    this.todos = this.todos.filter((t) => t.id !== id);
    if (this.todos.length === before) throw new ApiError('not_found', 404, '待办事项未找到');
    return { ok: true };
  }
}

/** Cast to TodoClient for injection into TodoApp. */
export function asClient(fake: FakeClient): TodoClient {
  return fake as unknown as TodoClient;
}

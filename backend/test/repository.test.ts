import { describe, it, expect, beforeEach } from 'vitest';
import { TodoRepository } from '../src/repository/todoRepository.js';
import { makeMigratedDb } from './helpers.js';

async function makeRepo() {
  const db = await makeMigratedDb();
  return new TodoRepository(db);
}

describe('TodoRepository · user 隔离的 CRUD (2.7 / 3.4)', () => {
  let repo: TodoRepository;
  beforeEach(async () => {
    repo = await makeRepo();
  });

  it('creates a todo defaulting to not-completed', async () => {
    const todo = await repo.create('user-a', '买牛奶');
    expect(todo.title).toBe('买牛奶');
    expect(todo.completed).toBe(false);
    expect(todo.userId).toBe('user-a');
    expect(todo.id).toBeTruthy();
  });

  it('lists only the requesting user rows', async () => {
    await repo.create('user-a', 'A-1');
    await repo.create('user-a', 'A-2');
    await repo.create('user-b', 'B-1');

    const a = await repo.list('user-a');
    expect(a.todos.map((t) => t.title)).toEqual(['A-1', 'A-2']);
    expect(a.todos.every((t) => t.userId === 'user-a')).toBe(true);
  });

  it('returns a stable creation order and an active count', async () => {
    const first = await repo.create('user-a', 'first');
    await repo.create('user-a', 'second');
    await repo.update('user-a', first.id, { completed: true });

    const { todos, activeCount } = await repo.list('user-a');
    expect(todos.map((t) => t.title)).toEqual(['first', 'second']);
    expect(activeCount).toBe(1);
  });

  it('filters by status', async () => {
    const done = await repo.create('user-a', 'done');
    await repo.create('user-a', 'pending');
    await repo.update('user-a', done.id, { completed: true });

    expect((await repo.list('user-a', 'active')).todos.map((t) => t.title)).toEqual(['pending']);
    expect((await repo.list('user-a', 'completed')).todos.map((t) => t.title)).toEqual(['done']);
    expect((await repo.list('user-a', 'all')).todos.length).toBe(2);
  });

  it('does not update or delete another user rows', async () => {
    const bTodo = await repo.create('user-b', 'B private');
    expect(await repo.update('user-a', bTodo.id, { title: 'hacked' })).toBeNull();
    expect(await repo.remove('user-a', bTodo.id)).toBe(false);
    // still intact for B
    expect((await repo.findById('user-b', bTodo.id))?.title).toBe('B private');
  });

  it('remove returns false for unknown ids', async () => {
    expect(await repo.remove('user-a', 'does-not-exist')).toBe(false);
  });
});

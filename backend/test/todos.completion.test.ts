import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeTestApp, type TestApp } from './helpers.js';

const AUTH = ['Authorization', 'Bearer token-a'] as const;

describe('完成状态与筛选 API (todo-completion, 第 5 组)', () => {
  let app: TestApp;
  const agent = () => request(app.listener);
  const create = (title: string) =>
    agent().post('/todos').set(...AUTH).send({ title }).then((r) => r.body.todo.id as string);

  beforeEach(async () => {
    app = await makeTestApp();
  });

  it('marks a todo as completed (5.1)', async () => {
    const id = await create('买牛奶');
    const res = await agent().patch(`/todos/${id}`).set(...AUTH).send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.todo.completed).toBe(true);
  });

  it('reverts a completed todo back to active (5.2)', async () => {
    const id = await create('买牛奶');
    await agent().patch(`/todos/${id}`).set(...AUTH).send({ completed: true });
    const res = await agent().patch(`/todos/${id}`).set(...AUTH).send({ completed: false });
    expect(res.body.todo.completed).toBe(false);
  });

  it('filters status=active / completed / all (5.4–5.6)', async () => {
    const done = await create('已完成项');
    await create('未完成项');
    await agent().patch(`/todos/${done}`).set(...AUTH).send({ completed: true });

    const active = await agent().get('/todos?status=active').set(...AUTH);
    expect(active.body.todos.map((t: { title: string }) => t.title)).toEqual(['未完成项']);

    const completed = await agent().get('/todos?status=completed').set(...AUTH);
    expect(completed.body.todos.map((t: { title: string }) => t.title)).toEqual(['已完成项']);

    const all = await agent().get('/todos?status=all').set(...AUTH);
    expect(all.body.todos).toHaveLength(2);

    const noParam = await agent().get('/todos').set(...AUTH);
    expect(noParam.body.todos).toHaveLength(2); // default = all
  });

  it('returns an active count that decreases when a todo is completed (5.8)', async () => {
    const id = await create('a');
    await create('b');

    const before = await agent().get('/todos').set(...AUTH);
    expect(before.body.activeCount).toBe(2);

    await agent().patch(`/todos/${id}`).set(...AUTH).send({ completed: true });

    const after = await agent().get('/todos').set(...AUTH);
    expect(after.body.activeCount).toBe(1);
  });
});

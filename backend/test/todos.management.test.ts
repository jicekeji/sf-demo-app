import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeTestApp, type TestApp } from './helpers.js';

const AUTH = ['Authorization', 'Bearer token-a'] as const;

describe('待办管理 API (todo-management, 第 4 组)', () => {
  let app: TestApp;
  const agent = () => request(app.listener);
  beforeEach(async () => {
    app = await makeTestApp();
  });

  it('creates a todo with a non-empty title, defaulting to not-completed (4.1)', async () => {
    const res = await agent().post('/todos').set(...AUTH).send({ title: '买牛奶' });
    expect(res.status).toBe(201);
    expect(res.body.todo.title).toBe('买牛奶');
    expect(res.body.todo.completed).toBe(false);

    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos.map((t: { title: string }) => t.title)).toContain('买牛奶');
  });

  it('rejects an empty / whitespace-only title and adds nothing (4.3)', async () => {
    for (const title of ['', '   ']) {
      const res = await agent().post('/todos').set(...AUTH).send({ title });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('validation_error');
      expect(res.body.error.message).toBe('标题不能为空');
    }
    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos).toHaveLength(0);
  });

  it('rejects a title longer than 200 chars and adds nothing (4.4)', async () => {
    const res = await agent().post('/todos').set(...AUTH).send({ title: 'x'.repeat(201) });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('标题过长');

    // exactly 200 is allowed
    const ok = await agent().post('/todos').set(...AUTH).send({ title: 'y'.repeat(200) });
    expect(ok.status).toBe(201);

    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos).toHaveLength(1);
  });

  it('lists existing todos in a stable order with title and status (4.6)', async () => {
    await agent().post('/todos').set(...AUTH).send({ title: '第一' });
    await agent().post('/todos').set(...AUTH).send({ title: '第二' });
    await agent().post('/todos').set(...AUTH).send({ title: '第三' });

    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos.map((t: { title: string }) => t.title)).toEqual(['第一', '第二', '第三']);
    expect(list.body.todos[0]).toHaveProperty('completed');
  });

  it('returns an empty collection when there are no todos (4.7)', async () => {
    const list = await agent().get('/todos').set(...AUTH);
    expect(list.status).toBe(200);
    expect(list.body.todos).toEqual([]);
    expect(list.body.activeCount).toBe(0);
  });

  it('edits a title and persists the new value (4.9)', async () => {
    const created = await agent().post('/todos').set(...AUTH).send({ title: '买牛奶' });
    const id = created.body.todo.id;

    const patched = await agent().patch(`/todos/${id}`).set(...AUTH).send({ title: '买牛奶和面包' });
    expect(patched.status).toBe(200);
    expect(patched.body.todo.title).toBe('买牛奶和面包');

    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos[0].title).toBe('买牛奶和面包');
  });

  it('rejects clearing a title on edit, keeping the original (4.10)', async () => {
    const created = await agent().post('/todos').set(...AUTH).send({ title: '买牛奶' });
    const id = created.body.todo.id;

    const patched = await agent().patch(`/todos/${id}`).set(...AUTH).send({ title: '   ' });
    expect(patched.status).toBe(400);
    expect(patched.body.error.message).toBe('标题不能为空');

    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos[0].title).toBe('买牛奶'); // unchanged
  });

  it('deletes an existing todo, keeping the order of the rest (4.12)', async () => {
    const a = await agent().post('/todos').set(...AUTH).send({ title: 'A' });
    await agent().post('/todos').set(...AUTH).send({ title: 'B' });
    await agent().post('/todos').set(...AUTH).send({ title: 'C' });

    const del = await agent().delete(`/todos/${a.body.todo.id}`).set(...AUTH);
    expect(del.status).toBe(200);

    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos.map((t: { title: string }) => t.title)).toEqual(['B', 'C']);
  });

  it('returns not-found when deleting a missing id and changes nothing (4.13)', async () => {
    await agent().post('/todos').set(...AUTH).send({ title: 'keep me' });

    const del = await agent().delete('/todos/does-not-exist').set(...AUTH);
    expect(del.status).toBe(404);
    expect(del.body.error.code).toBe('not_found');

    const list = await agent().get('/todos').set(...AUTH);
    expect(list.body.todos.map((t: { title: string }) => t.title)).toEqual(['keep me']);
  });
});

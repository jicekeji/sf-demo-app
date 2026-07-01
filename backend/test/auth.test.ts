import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeTestApp } from './helpers.js';

describe('鉴权 fail-closed (3.1 / 3.3)', () => {
  it('rejects unauthenticated reads without leaking any todo content', async () => {
    const { listener } = await makeTestApp();
    const res = await request(listener).get('/todos');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthenticated');
    // no todo payload leaked
    expect(res.body.todos).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('title');
  });

  it('rejects unauthenticated writes', async () => {
    const { listener } = await makeTestApp();
    const res = await request(listener).post('/todos').send({ title: '偷偷写入' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthenticated');
  });

  it('rejects an unknown/blank token (default deny)', async () => {
    const { listener } = await makeTestApp();
    expect((await request(listener).get('/todos').set('Authorization', 'Bearer nope')).status).toBe(
      401,
    );
    expect((await request(listener).get('/todos').set('Authorization', 'Bearer ')).status).toBe(401);
  });

  it('only returns the requesting user own data (3.3)', async () => {
    const { listener } = await makeTestApp();
    await request(listener).post('/todos').set('Authorization', 'Bearer token-a').send({ title: 'A 的事项' });
    await request(listener).post('/todos').set('Authorization', 'Bearer token-b').send({ title: 'B 的事项' });

    const aList = await request(listener).get('/todos').set('Authorization', 'Bearer token-a');
    expect(aList.status).toBe(200);
    const titles = aList.body.todos.map((t: { title: string }) => t.title);
    expect(titles).toEqual(['A 的事项']);
    expect(titles).not.toContain('B 的事项');
  });
});

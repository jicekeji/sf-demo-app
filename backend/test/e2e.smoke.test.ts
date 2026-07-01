import { describe, it, expect, afterAll } from 'vitest';
import { createServer } from '../src/server.js';
import { MapSessionStore } from '../src/auth/auth.js';
import { createMemoryLogger } from '../src/logger.js';
import { makeMigratedDb } from './helpers.js';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

/**
 * End-to-end smoke over a real listening HTTP server (not supertest): drives the
 * full lifecycle create → edit → complete → filter → count → delete → reload.
 * Mirrors the manual acceptance walkthrough (task 11.2).
 */
describe('E2E smoke over a live HTTP server (11.2)', () => {
  let server: Server;
  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  it('runs the full todo lifecycle', async () => {
    const db = await makeMigratedDb();
    server = createServer({ db, sessionStore: new MapSessionStore({ tok: 'user-a' }), logger: createMemoryLogger() });
    await new Promise<void>((r) => server.listen(0, r));
    const { port } = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${port}`;
    const auth = { authorization: 'Bearer tok', 'content-type': 'application/json' };
    const json = (r: Response): Promise<any> => r.json();

    // health
    expect((await fetch(`${base}/health`)).status).toBe(200);

    // create
    const created = await fetch(`${base}/todos`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ title: '买牛奶' }),
    }).then(json);
    const id = created.todo.id as string;
    expect(created.todo.completed).toBe(false);

    // edit title
    await fetch(`${base}/todos/${id}`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify({ title: '买牛奶和面包' }),
    });

    // complete + count
    await fetch(`${base}/todos/${id}`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify({ completed: true }),
    });
    const afterComplete = await fetch(`${base}/todos`, { headers: auth }).then(json);
    expect(afterComplete.activeCount).toBe(0);
    expect(afterComplete.todos[0].title).toBe('买牛奶和面包');

    // filter
    const active = await fetch(`${base}/todos?status=active`, { headers: auth }).then(json);
    expect(active.todos).toHaveLength(0);
    const completed = await fetch(`${base}/todos?status=completed`, { headers: auth }).then(json);
    expect(completed.todos).toHaveLength(1);

    // delete + reload
    expect((await fetch(`${base}/todos/${id}`, { method: 'DELETE', headers: auth })).status).toBe(200);
    const reload = await fetch(`${base}/todos`, { headers: auth }).then(json);
    expect(reload.todos).toHaveLength(0);

    // unauthenticated is denied
    expect((await fetch(`${base}/todos`)).status).toBe(401);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeTestApp } from './helpers.js';
import { createMemoryLogger } from '../src/logger.js';

const AUTH = ['Authorization', 'Bearer token-a'] as const;

describe('可观测性与错误格式 (第 10 组)', () => {
  it('exposes an unauthenticated health probe (10.1)', async () => {
    const { listener } = await makeTestApp();
    const res = await request(listener).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('emits one structured JSON log line per request (10.3)', async () => {
    const { listener, logger } = await makeTestApp();
    await request(listener).get('/health');
    const req = logger.records.find((r) => r.path === '/health');
    expect(req).toBeDefined();
    expect(req).toMatchObject({ level: 'info', method: 'GET', status: 200 });
    expect(req).toHaveProperty('requestId');
    expect(req).toHaveProperty('durationMs');
  });

  it('never logs the Authorization header value (no sensitive data)', () => {
    const logger = createMemoryLogger();
    logger.info({ msg: 'test', authorization: 'Bearer super-secret' });
    expect(JSON.stringify(logger.records)).not.toContain('super-secret');
    expect(logger.records[0]!.authorization).toBe('[redacted]');
  });

  it('uses a uniform error envelope across 401 / 400 / 404 (10.4)', async () => {
    const { listener } = await makeTestApp();

    const unauth = await request(listener).get('/todos');
    const validation = await request(listener).post('/todos').set(...AUTH).send({ title: '' });
    const missing = await request(listener).delete('/todos/nope').set(...AUTH);

    for (const [res, status, code] of [
      [unauth, 401, 'unauthenticated'],
      [validation, 400, 'validation_error'],
      [missing, 404, 'not_found'],
    ] as const) {
      expect(res.status).toBe(status);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', code);
      expect(typeof res.body.error.message).toBe('string');
    }
  });
});

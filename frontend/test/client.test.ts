import { describe, it, expect, vi } from 'vitest';
import { ApiError, TodoClient } from '../src/api/client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('TodoClient (6.3)', () => {
  it('sends credentials, bearer token and accept header on list', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ todos: [], activeCount: 0 }));
    const client = new TodoClient({ baseUrl: '/api', token: 'tok', fetchImpl });

    await client.list('active');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('/api/todos?status=active');
    expect(init.credentials).toBe('include');
    expect((init.headers as Headers).get('authorization')).toBe('Bearer tok');
    expect((init.headers as Headers).get('accept')).toBe('application/json');
  });

  it('posts a JSON body on create', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ todo: { id: '1', title: 'x', completed: false } }, 201));
    const client = new TodoClient({ fetchImpl });

    await client.create('买牛奶');
    const [, init] = fetchImpl.mock.calls[0]!;
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ title: '买牛奶' });
    expect((init.headers as Headers).get('content-type')).toBe('application/json');
  });

  it('normalises API error envelopes into ApiError', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { code: 'validation_error', message: '标题不能为空' } }, 400));
    const client = new TodoClient({ fetchImpl });

    await expect(client.create('')).rejects.toMatchObject({
      code: 'validation_error',
      status: 400,
      message: '标题不能为空',
    });
  });

  it('normalises network failures into a network ApiError', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('failed to fetch'));
    const client = new TodoClient({ fetchImpl });

    const err = await client.list().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('network_error');
  });
});

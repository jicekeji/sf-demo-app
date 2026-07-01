/**
 * API client — wraps fetch with session credentials and normalises errors so
 * the UI can rely on a single ApiError shape. Every request sends credentials
 * (cookies) and, when configured, a bearer token.
 */
import type { StatusFilter, Todo, TodoListResponse } from '../types.js';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export interface ClientOptions {
  baseUrl?: string;
  /** Optional bearer token; also useful for tests. */
  token?: string;
  fetchImpl?: typeof fetch;
}

export class TodoClient {
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly doFetch: typeof fetch;

  constructor(opts: ClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? '/api';
    this.token = opts.token;
    this.doFetch = opts.fetchImpl ?? fetch.bind(globalThis);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    if (init.body) headers.set('content-type', 'application/json');
    if (this.token) headers.set('authorization', `Bearer ${this.token}`);

    let res: Response;
    try {
      res = await this.doFetch(`${this.baseUrl}${path}`, {
        credentials: 'include',
        ...init,
        headers,
      });
    } catch {
      // Network / backend-unavailable failures surface as a normalised error.
      throw new ApiError('network_error', 0, '无法连接服务器');
    }

    const text = await res.text();
    const payload = text ? (JSON.parse(text) as unknown) : undefined;

    if (!res.ok) {
      const err = (payload as { error?: { code?: string; message?: string } } | undefined)?.error;
      throw new ApiError(err?.code ?? 'error', res.status, err?.message ?? '请求失败');
    }
    return payload as T;
  }

  list(status: StatusFilter = 'all'): Promise<TodoListResponse> {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return this.request<TodoListResponse>(`/todos${query}`);
  }

  create(title: string): Promise<{ todo: Todo }> {
    return this.request<{ todo: Todo }>('/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  update(id: string, changes: { title?: string; completed?: boolean }): Promise<{ todo: Todo }> {
    return this.request<{ todo: Todo }>(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  }

  remove(id: string): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>(`/todos/${id}`, { method: 'DELETE' });
  }
}

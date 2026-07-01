/**
 * HTTP API wiring. Uses Node's built-in http module (no framework) to route
 * requests to handlers, enforce fail-closed auth, emit structured request logs
 * and serialise the unified error envelope.
 */
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { authenticate, type SessionStore } from './auth/auth.js';
import { ApiError, internalError, unauthenticated } from './errors.js';
import { createTodo, deleteTodo, listTodos, updateTodo, type HandlerResult } from './handlers.js';
import type { Logger } from './logger.js';
import { createLogger } from './logger.js';
import { TodoRepository } from './repository/todoRepository.js';
import type { Db } from './db/pool.js';

export interface AppDeps {
  db: Db;
  sessionStore: SessionStore;
  logger?: Logger;
}

const MAX_BODY_BYTES = 1_000_000;

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new ApiError('validation_error', 413, '请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (raw.length === 0) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new ApiError('validation_error', 400, '请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendError(res: ServerResponse, err: unknown): { status: number; code: string } {
  const apiErr = err instanceof ApiError ? err : internalError();
  sendJson(res, apiErr.status, { error: { code: apiErr.code, message: apiErr.message } });
  return { status: apiErr.status, code: apiErr.code };
}

/** Build the request listener with its dependencies injected. */
export function createRequestListener(deps: AppDeps) {
  const logger = deps.logger ?? createLogger();
  const repo = new TodoRepository(deps.db);

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const method = req.method ?? 'GET';
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname;
    res.setHeader('x-request-id', requestId);

    let outcome = { status: 200, code: 'ok' };
    try {
      const result = await route(req, res, { deps, repo, method, url, path });
      outcome = { status: result.status, code: 'ok' };
      sendJson(res, result.status, result.body);
    } catch (err) {
      const info = sendError(res, err);
      outcome = info;
      if (info.status >= 500) {
        logger.error({
          requestId,
          method,
          path,
          status: info.status,
          code: info.code,
          msg: err instanceof Error ? err.message : 'unknown error',
        });
      }
    } finally {
      logger.info({
        requestId,
        method,
        path,
        status: outcome.status,
        durationMs: Date.now() - startedAt,
      });
    }
  };
}

interface RouteCtx {
  deps: AppDeps;
  repo: TodoRepository;
  method: string;
  url: URL;
  path: string;
}

async function route(
  req: IncomingMessage,
  _res: ServerResponse,
  ctx: RouteCtx,
): Promise<HandlerResult> {
  const { method, path, url, repo, deps } = ctx;

  // Health probe — unauthenticated by design.
  if (method === 'GET' && path === '/health') {
    return { status: 200, body: { status: 'ok', uptime: process.uptime() } };
  }

  // Everything under /todos requires a valid session (fail-closed).
  const todoMatch = /^\/todos(?:\/([^/]+))?$/.exec(path);
  if (!todoMatch) {
    throw new ApiError('not_found', 404, '资源未找到');
  }

  const userId = authenticate(req, deps.sessionStore);
  if (!userId) {
    throw unauthenticated('请先登录');
  }

  const id = todoMatch[1];

  if (!id) {
    if (method === 'GET') return listTodos(repo, userId, url.searchParams.get('status'));
    if (method === 'POST') return createTodo(repo, userId, await readJsonBody(req));
    throw new ApiError('not_found', 405, '不支持的方法');
  }

  if (method === 'PATCH') return updateTodo(repo, userId, id, await readJsonBody(req));
  if (method === 'DELETE') return deleteTodo(repo, userId, id);
  throw new ApiError('not_found', 405, '不支持的方法');
}

/** Convenience factory returning a ready-to-listen http.Server. */
export function createServer(deps: AppDeps) {
  return createHttpServer(createRequestListener(deps));
}

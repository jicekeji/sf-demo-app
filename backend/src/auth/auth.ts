/**
 * Fail-closed authentication (todo-persistence · 数据归属与鉴权).
 *
 * The default posture is DENY: a request is only authenticated when it carries
 * a session token that maps to a known user. Any missing/blank/unknown token
 * yields `null`, which callers turn into a 401 without leaking data.
 */
import type { IncomingMessage } from 'node:http';

/** Maps opaque session tokens to user ids. */
export interface SessionStore {
  resolve(token: string): string | undefined;
}

/** Simple in-memory store; production can swap in a DB/redis-backed one. */
export class MapSessionStore implements SessionStore {
  private readonly sessions: Map<string, string>;
  constructor(sessions: Record<string, string> = {}) {
    this.sessions = new Map(Object.entries(sessions));
  }
  resolve(token: string): string | undefined {
    return this.sessions.get(token);
  }
}

/** Build the default session store from the SESSIONS_JSON env var (if any). */
export function defaultSessionStore(): SessionStore {
  const raw = process.env.SESSIONS_JSON;
  if (!raw) return new MapSessionStore({});
  try {
    return new MapSessionStore(JSON.parse(raw));
  } catch {
    return new MapSessionStore({});
  }
}

function extractToken(req: Pick<IncomingMessage, 'headers'>): string | null {
  const header = req.headers['authorization'];
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  if (!match) return null;
  const token = match[1]!.trim();
  return token.length > 0 ? token : null;
}

/**
 * Resolve the authenticated user id for a request, or null if unauthenticated.
 * Never throws — the absence of a valid session simply returns null (deny).
 */
export function authenticate(
  req: Pick<IncomingMessage, 'headers'>,
  store: SessionStore,
): string | null {
  const token = extractToken(req);
  if (!token) return null;
  return store.resolve(token) ?? null;
}

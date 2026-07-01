/**
 * Minimal structured (JSON) logger. Emits one JSON object per line so logs
 * are machine-parseable. Never logs request bodies or session tokens to avoid
 * leaking sensitive data — callers pass only whitelisted fields.
 */
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogFields {
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  code?: string;
  msg?: string;
  [key: string]: unknown;
}

export interface Logger {
  info(fields: LogFields): void;
  warn(fields: LogFields): void;
  error(fields: LogFields): void;
}

type Sink = (line: string) => void;

const SENSITIVE_KEYS = new Set(['authorization', 'token', 'password', 'cookie']);

function redact(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[redacted]' : value;
  }
  return out;
}

export function createLogger(sink: Sink = (line) => process.stdout.write(line + '\n')): Logger {
  const emit = (level: LogLevel, fields: LogFields) => {
    const record = { level, ...redact(fields) };
    sink(JSON.stringify(record));
  };
  return {
    info: (fields) => emit('info', fields),
    warn: (fields) => emit('warn', fields),
    error: (fields) => emit('error', fields),
  };
}

/** A logger that captures records in memory — used by tests. */
export function createMemoryLogger(): Logger & { records: Array<Record<string, unknown>> } {
  const records: Array<Record<string, unknown>> = [];
  const base = createLogger((line) => records.push(JSON.parse(line)));
  return { ...base, records };
}

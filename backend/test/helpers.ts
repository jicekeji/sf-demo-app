/**
 * Test helpers: build an in-memory Postgres (pg-mem) backed Db, run migrations,
 * and assemble a request listener with injectable sessions.
 */
import { newDb } from 'pg-mem';
import { runMigrations, type Migration } from '../src/db/migrations.js';
import type { Db } from '../src/db/pool.js';
import { MapSessionStore } from '../src/auth/auth.js';
import { createMemoryLogger } from '../src/logger.js';
import { createRequestListener } from '../src/server.js';

/** Create a fresh pg-mem Db. Registers `now()`/`gen_random_uuid` niceties. */
export function makeMemDb(): Db {
  // noAstCoverageCheck: pg-mem's coverage checker is over-strict about
  // inline column constraints (PRIMARY KEY / DEFAULT now()); disable it.
  const mem = newDb({ noAstCoverageCheck: true });
  const pg = mem.adapters.createPg();
  const pool = new pg.Pool();
  return pool as unknown as Db;
}

export async function makeMigratedDb(migrations?: Migration[]): Promise<Db> {
  const db = makeMemDb();
  await runMigrations(db, migrations);
  return db;
}

export interface TestApp {
  db: Db;
  listener: ReturnType<typeof createRequestListener>;
  logger: ReturnType<typeof createMemoryLogger>;
}

/** Build a request listener over a migrated in-memory DB with given sessions. */
export async function makeTestApp(
  sessions: Record<string, string> = { 'token-a': 'user-a', 'token-b': 'user-b' },
): Promise<TestApp> {
  const db = await makeMigratedDb();
  const logger = createMemoryLogger();
  const listener = createRequestListener({
    db,
    sessionStore: new MapSessionStore(sessions),
    logger,
  });
  return { db, listener, logger };
}

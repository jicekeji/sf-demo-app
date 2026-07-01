/**
 * Production entrypoint: run migrations, then start the HTTP server.
 */
import { defaultSessionStore } from './auth/auth.js';
import { runMigrations } from './db/migrations.js';
import { getPool } from './db/pool.js';
import { createLogger } from './logger.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
  const logger = createLogger();
  const db = await getPool();
  await runMigrations(db);

  const port = Number(process.env.PORT ?? 8080);
  const server = createServer({ db, sessionStore: defaultSessionStore(), logger });
  server.listen(port, () => {
    logger.info({ msg: 'server listening', path: `:${port}` });
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ level: 'error', msg: 'startup failed', error: String(err) }));
  process.exit(1);
});

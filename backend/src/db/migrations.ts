/**
 * Migration definitions and a replayable, backward-compatible runner
 * (todo-persistence · 向后兼容的数据迁移).
 *
 * Principles enforced here:
 *  - Add columns, never drop them ("加列不删列").
 *  - Every migration is idempotent on its own (IF NOT EXISTS) AND is recorded
 *    in `schema_migrations`, so re-running the runner is a no-op.
 *  - New columns carry defaults so records written before the column existed
 *    remain readable.
 */
import type { Db } from './pool.js';

export interface Migration {
  id: string;
  statements: string[];
}

/** Ordered list of migrations. Append new entries; never edit applied ones. */
export const MIGRATIONS: Migration[] = [
  {
    id: '001_create_todos',
    statements: [
      `CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos (user_id)`,
    ],
  },
  {
    id: '002_add_notes',
    statements: [
      // Backward-compatible add-column: nullable add + default, then an explicit
      // backfill so rows created before the column existed read back the default
      // (the add-nullable → backfill pattern is portable and safe on large tables).
      `ALTER TABLE todos ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`,
      // Backfill runs exactly once (guarded by schema_migrations): the column is
      // brand-new here, so every existing row is set to the default.
      `UPDATE todos SET notes = ''`,
    ],
  },
];

const ENSURE_MIGRATIONS_TABLE = `CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

async function isApplied(db: Db, id: string): Promise<boolean> {
  const res = await db.query('SELECT 1 FROM schema_migrations WHERE id = $1', [id]);
  return (res.rowCount ?? res.rows.length) > 0;
}

/** Apply a single migration if it has not been applied yet. */
export async function applyMigration(db: Db, migration: Migration): Promise<boolean> {
  await db.query(ENSURE_MIGRATIONS_TABLE);
  if (await isApplied(db, migration.id)) {
    return false;
  }
  for (const statement of migration.statements) {
    await db.query(statement);
  }
  await db.query('INSERT INTO schema_migrations (id) VALUES ($1)', [migration.id]);
  return true;
}

/**
 * Run all pending migrations in order. Safe to call repeatedly: already-applied
 * migrations are skipped, so the schema is unchanged on re-run (idempotent).
 */
export async function runMigrations(
  db: Db,
  migrations: Migration[] = MIGRATIONS,
): Promise<string[]> {
  const applied: string[] = [];
  for (const migration of migrations) {
    if (await applyMigration(db, migration)) {
      applied.push(migration.id);
    }
  }
  return applied;
}

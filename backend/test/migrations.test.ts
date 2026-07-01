import { describe, it, expect } from 'vitest';
import { MIGRATIONS, applyMigration, runMigrations } from '../src/db/migrations.js';
import { makeMemDb } from './helpers.js';

async function columnNames(db: ReturnType<typeof makeMemDb>): Promise<string[]> {
  const res = await db.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'todos' ORDER BY column_name`,
  );
  return res.rows.map((r) => r.column_name);
}

describe('migrations · 创建 todos 表 (2.1)', () => {
  it('creates a todos table with the expected columns', async () => {
    const db = makeMemDb();
    await runMigrations(db);
    const cols = await columnNames(db);
    for (const expected of ['id', 'user_id', 'title', 'completed', 'created_at', 'updated_at']) {
      expect(cols).toContain(expected);
    }
  });
});

describe('migrations · 迁移可重复执行 / 幂等 (2.3)', () => {
  it('running the runner twice is a no-op and leaves the schema unchanged', async () => {
    const db = makeMemDb();
    const first = await runMigrations(db);
    const colsAfterFirst = await columnNames(db);

    const second = await runMigrations(db);
    const colsAfterSecond = await columnNames(db);

    expect(first.length).toBeGreaterThan(0);
    expect(second).toEqual([]); // nothing re-applied
    expect(colsAfterSecond).toEqual(colsAfterFirst);

    // schema_migrations records each migration exactly once
    const applied = await db.query<{ id: string }>('SELECT id FROM schema_migrations ORDER BY id');
    expect(applied.rows.map((r) => r.id)).toEqual(MIGRATIONS.map((m) => m.id));
  });
});

describe('migrations · 旧记录保持可读 / 加列带默认值 (2.5)', () => {
  it('rows written before a new column read back the column default', async () => {
    const db = makeMemDb();
    const base = MIGRATIONS.find((m) => m.id === '001_create_todos')!;
    const addNotes = MIGRATIONS.find((m) => m.id === '002_add_notes')!;

    // Only the base migration exists yet.
    await applyMigration(db, base);
    await db.query(
      `INSERT INTO todos (id, user_id, title, completed) VALUES ($1, $2, $3, FALSE)`,
      ['old-1', 'user-a', '历史待办'],
    );

    // Introduce the new column with a default.
    await applyMigration(db, addNotes);

    const res = await db.query<{ title: string; notes: string }>(
      `SELECT title, notes FROM todos WHERE id = 'old-1'`,
    );
    expect(res.rows[0]?.title).toBe('历史待办');
    expect(res.rows[0]?.notes).toBe(''); // default backfilled — old record still readable
  });
});

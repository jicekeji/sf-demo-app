/**
 * Data access layer for todos. Every query is scoped by `userId` so a user can
 * only ever see or mutate their own rows (todo-persistence · 数据归属).
 */
import { randomUUID } from 'node:crypto';
import type { Db } from '../db/pool.js';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilter = 'all' | 'active' | 'completed';

export interface ListResult {
  todos: Todo[];
  activeCount: number;
}

interface TodoRow {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    completed: row.completed,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

const SELECT_COLUMNS = 'id, user_id, title, completed, created_at, updated_at';

export class TodoRepository {
  constructor(private readonly db: Db) {}

  async create(userId: string, title: string): Promise<Todo> {
    const id = randomUUID();
    const res = await this.db.query<TodoRow>(
      `INSERT INTO todos (id, user_id, title, completed)
       VALUES ($1, $2, $3, FALSE)
       RETURNING ${SELECT_COLUMNS}`,
      [id, userId, title],
    );
    return toTodo(res.rows[0]!);
  }

  /** List a user's todos in a stable order (oldest first), with active count. */
  async list(userId: string, status: StatusFilter = 'all'): Promise<ListResult> {
    let where = 'user_id = $1';
    if (status === 'active') where += ' AND completed = FALSE';
    else if (status === 'completed') where += ' AND completed = TRUE';

    const res = await this.db.query<TodoRow>(
      `SELECT ${SELECT_COLUMNS} FROM todos
       WHERE ${where}
       ORDER BY created_at ASC, id ASC`,
      [userId],
    );

    const countRes = await this.db.query<{ count: string | number }>(
      `SELECT COUNT(*)::int AS count FROM todos WHERE user_id = $1 AND completed = FALSE`,
      [userId],
    );
    const activeCount = Number(countRes.rows[0]?.count ?? 0);

    return { todos: res.rows.map(toTodo), activeCount };
  }

  async findById(userId: string, id: string): Promise<Todo | null> {
    const res = await this.db.query<TodoRow>(
      `SELECT ${SELECT_COLUMNS} FROM todos WHERE user_id = $1 AND id = $2`,
      [userId, id],
    );
    const row = res.rows[0];
    return row ? toTodo(row) : null;
  }

  /**
   * Partially update a todo's title and/or completed flag. Returns the updated
   * row, or null if no matching row exists for this user.
   */
  async update(
    userId: string,
    id: string,
    changes: { title?: string; completed?: boolean },
  ): Promise<Todo | null> {
    const sets: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (changes.title !== undefined) {
      sets.push(`title = $${i++}`);
      params.push(changes.title);
    }
    if (changes.completed !== undefined) {
      sets.push(`completed = $${i++}`);
      params.push(changes.completed);
    }

    if (sets.length === 0) {
      // Nothing to change — behave as a read.
      return this.findById(userId, id);
    }

    sets.push(`updated_at = now()`);
    params.push(userId, id);

    const res = await this.db.query<TodoRow>(
      `UPDATE todos SET ${sets.join(', ')}
       WHERE user_id = $${i++} AND id = $${i}
       RETURNING ${SELECT_COLUMNS}`,
      params,
    );
    const row = res.rows[0];
    return row ? toTodo(row) : null;
  }

  /** Delete a todo. Returns true if a row was removed, false otherwise. */
  async remove(userId: string, id: string): Promise<boolean> {
    const res = await this.db.query(`DELETE FROM todos WHERE user_id = $1 AND id = $2`, [
      userId,
      id,
    ]);
    return (res.rowCount ?? 0) > 0;
  }
}

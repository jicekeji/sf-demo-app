/**
 * TodoApp — single-page todo experience (no routing). Composes the design-system
 * primitives and the API client into: an add form, a filterable list with an
 * active count, inline edit, completion toggle and delete — with load and
 * save-failure handling that never silently drops user input.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, TodoClient } from './api/client.js';
import { Button } from './components/Button.js';
import { Card } from './components/Card.js';
import { Input } from './components/Input.js';
import { List, ListItem } from './components/List.js';
import { validateTitle } from './lib/validateTitle.js';
import type { StatusFilter, Todo } from './types.js';

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '未完成' },
  { key: 'completed', label: '已完成' },
];

const SAVE_FAILED_MESSAGE = '保存失败，请重试';

export interface TodoAppProps {
  client: TodoClient;
}

export function TodoApp({ client }: TodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(
    async (status: StatusFilter) => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await client.list(status);
        setTodos(res.todos);
        setActiveCount(res.activeCount);
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  useEffect(() => {
    void load(filter);
  }, [load, filter]);

  const handleCreate = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const validationError = validateTitle(newTitle);
      if (validationError) {
        setFormError(validationError);
        return; // do not submit
      }
      setFormError(null);
      try {
        await client.create(newTitle.trim());
        setNewTitle(''); // clear only on success
        await load(filter);
      } catch (err) {
        // Save failed — keep the user's input for retry, never drop it silently.
        setFormError(err instanceof ApiError && err.status >= 400 && err.status < 500
          ? err.message
          : SAVE_FAILED_MESSAGE);
      }
    },
    [client, newTitle, filter, load],
  );

  const handleToggle = useCallback(
    async (todo: Todo) => {
      try {
        await client.update(todo.id, { completed: !todo.completed });
        await load(filter);
      } catch {
        setLoadError(SAVE_FAILED_MESSAGE);
      }
    },
    [client, filter, load],
  );

  const handleDelete = useCallback(
    async (todo: Todo) => {
      try {
        await client.remove(todo.id);
        await load(filter);
      } catch {
        setLoadError(SAVE_FAILED_MESSAGE);
      }
    },
    [client, filter, load],
  );

  const handleEditSave = useCallback(
    async (todo: Todo, nextTitle: string): Promise<boolean> => {
      const validationError = validateTitle(nextTitle);
      if (validationError) return false; // keep original, caller shows error
      try {
        await client.update(todo.id, { title: nextTitle.trim() });
        await load(filter);
        return true;
      } catch {
        return false;
      }
    },
    [client, filter, load],
  );

  const countLabel = useMemo(() => `${activeCount} 项未完成`, [activeCount]);

  return (
    <main className="mx-auto max-w-2xl p-token6">
      <header className="mb-token6">
        <h1 className="text-xl font-extrabold text-slate-900">我的待办</h1>
        <p className="text-sm text-slate-500" data-testid="active-count">
          {countLabel}
        </p>
      </header>

      <Card>
        <form onSubmit={handleCreate} className="flex gap-token3" noValidate>
          <Input
            aria-label="新待办标题"
            placeholder="需要做点什么？"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button type="submit">添加</Button>
        </form>
        {formError && (
          <p role="alert" className="mt-token2 text-sm text-danger">
            {formError}
          </p>
        )}

        <nav className="mt-token4 flex gap-token1" aria-label="按状态筛选">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={f.key === filter ? 'primary' : 'ghost'}
              aria-pressed={f.key === filter}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </nav>

        <div className="mt-token4">
          {loadError && (
            <p role="alert" className="mb-token2 text-sm text-danger">
              {loadError}
            </p>
          )}
          {loading ? (
            <p className="py-token6 text-center text-sm text-slate-400">加载中…</p>
          ) : todos.length === 0 ? (
            <EmptyState />
          ) : (
            <List>
              {todos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEditSave={handleEditSave}
                />
              ))}
            </List>
          )}
        </div>
      </Card>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="py-token8 text-center" data-testid="empty-state">
      <p className="text-base font-semibold text-slate-700">还没有待办事项</p>
      <p className="mt-token1 text-sm text-slate-400">在上方输入框创建你的第一个待办吧。</p>
    </div>
  );
}

interface TodoRowProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onEditSave: (todo: Todo, nextTitle: string) => Promise<boolean>;
}

function TodoRow({ todo, onToggle, onDelete, onEditSave }: TodoRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(todo.title);
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    const validationError = validateTitle(draft);
    if (validationError) {
      setError(validationError); // keep original title, show message
      return;
    }
    const ok = await onEditSave(todo, draft);
    if (ok) {
      setEditing(false);
      setError(null);
    } else {
      setError('保存失败，请重试');
    }
  };

  return (
    <ListItem>
      <input
        type="checkbox"
        aria-label={`标记「${todo.title}」为${todo.completed ? '未完成' : '已完成'}`}
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        className="h-token4 w-token4 accent-brand"
      />

      {editing ? (
        <span className="flex flex-1 flex-col gap-token1">
          <Input
            aria-label="编辑标题"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void save();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          {error && (
            <span role="alert" className="text-sm text-danger">
              {error}
            </span>
          )}
        </span>
      ) : (
        <span
          className={cnTitle(todo.completed)}
          data-testid="todo-title"
          data-completed={todo.completed}
        >
          {todo.title}
        </span>
      )}

      {editing ? (
        <Button onClick={() => void save()}>保存</Button>
      ) : (
        <Button variant="ghost" onClick={startEdit}>
          编辑
        </Button>
      )}
      <Button variant="danger" onClick={() => onDelete(todo)}>
        删除
      </Button>
    </ListItem>
  );
}

function cnTitle(completed: boolean): string {
  return completed
    ? 'flex-1 text-base text-slate-400 line-through'
    : 'flex-1 text-base text-slate-900';
}

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from '../src/TodoApp';
import { FakeClient, asClient } from './fakeClient';

function renderApp(fake = new FakeClient()) {
  render(<TodoApp client={asClient(fake)} />);
  return fake;
}

describe('待办管理交互 (todo-management, 第 7 组)', () => {
  it('adds a new active todo when a non-empty title is submitted (7.1)', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('empty-state');

    await user.type(screen.getByLabelText('新待办标题'), '买牛奶');
    await user.click(screen.getByRole('button', { name: '添加' }));

    expect(await screen.findByText('买牛奶')).toBeInTheDocument();
    // input cleared after success
    expect(screen.getByLabelText('新待办标题')).toHaveValue('');
  });

  it('rejects empty/whitespace title and shows an error, adding nothing (7.2)', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByTestId('empty-state');

    await user.type(screen.getByLabelText('新待办标题'), '   ');
    await user.click(screen.getByRole('button', { name: '添加' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('标题不能为空');
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('rejects a title longer than 200 chars without submitting (7.3)', async () => {
    const user = userEvent.setup();
    const fake = renderApp();
    await screen.findByTestId('empty-state');

    await user.type(screen.getByLabelText('新待办标题'), 'x'.repeat(201));
    await user.click(screen.getByRole('button', { name: '添加' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('标题过长');
    expect((await fake.list()).todos).toHaveLength(0);
  });

  it('shows an empty state when there are no todos (7.5)', async () => {
    renderApp();
    expect(await screen.findByTestId('empty-state')).toBeInTheDocument();
  });

  it('edits a title inline and shows the new title (7.7)', async () => {
    const user = userEvent.setup();
    const fake = new FakeClient();
    fake.seed(['买牛奶']);
    renderApp(fake);
    await screen.findByText('买牛奶');

    await user.click(screen.getByRole('button', { name: '编辑' }));
    const editor = screen.getByLabelText('编辑标题');
    await user.clear(editor);
    await user.type(editor, '买牛奶和面包');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(await screen.findByText('买牛奶和面包')).toBeInTheDocument();
    expect(screen.queryByText('买牛奶')).not.toBeInTheDocument();
  });

  it('keeps the original title when an edit clears it (7.7)', async () => {
    const user = userEvent.setup();
    const fake = new FakeClient();
    fake.seed(['买牛奶']);
    renderApp(fake);
    await screen.findByText('买牛奶');

    await user.click(screen.getByRole('button', { name: '编辑' }));
    const editor = screen.getByLabelText('编辑标题');
    await user.clear(editor);
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('标题不能为空');
    // still editing; original preserved in store
    expect((await fake.list()).todos[0]!.title).toBe('买牛奶');
  });

  it('removes a todo and keeps the order of the rest (7.9)', async () => {
    const user = userEvent.setup();
    const fake = new FakeClient();
    fake.seed(['A', 'B', 'C']);
    renderApp(fake);
    await screen.findByText('A');

    const rowB = screen.getByText('B').closest('li') as HTMLElement;
    await user.click(within(rowB).getByRole('button', { name: '删除' }));

    await waitFor(() => expect(screen.queryByText('B')).not.toBeInTheDocument());
    const titles = screen.getAllByTestId('todo-title').map((n) => n.textContent);
    expect(titles).toEqual(['A', 'C']);
  });
});

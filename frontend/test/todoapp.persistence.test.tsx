import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from '../src/TodoApp';
import { FakeClient, asClient } from './fakeClient';

describe('持久化与错误处理 (todo-persistence, 第 9 组)', () => {
  it('loads and shows previously saved todos with their status on mount (9.1)', async () => {
    const fake = new FakeClient();
    fake.seed(['历史一', { title: '历史二', completed: true }]);
    render(<TodoApp client={asClient(fake)} />);

    expect(await screen.findByText('历史一')).toBeInTheDocument();
    expect(screen.getByText('历史二')).toBeInTheDocument();
    const completedTitle = screen.getByText('历史二');
    expect(completedTitle).toHaveAttribute('data-completed', 'true');
  });

  it('on save failure shows an error and preserves the typed input for retry (9.3)', async () => {
    const user = userEvent.setup();
    const fake = new FakeClient();
    fake.failWrites = true;
    render(<TodoApp client={asClient(fake)} />);
    await screen.findByTestId('empty-state');

    await user.type(screen.getByLabelText('新待办标题'), '买牛奶');
    await user.click(screen.getByRole('button', { name: '添加' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('保存失败');
    // input preserved so the user can retry — not silently dropped
    expect(screen.getByLabelText('新待办标题')).toHaveValue('买牛奶');

    // retry succeeds once the backend recovers
    fake.failWrites = false;
    await user.click(screen.getByRole('button', { name: '添加' }));
    expect(await screen.findByText('买牛奶')).toBeInTheDocument();
    expect(screen.getByLabelText('新待办标题')).toHaveValue('');
  });
});

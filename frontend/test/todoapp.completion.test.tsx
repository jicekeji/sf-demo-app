import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from '../src/TodoApp';
import { FakeClient, asClient } from './fakeClient';

function renderApp(fake: FakeClient) {
  render(<TodoApp client={asClient(fake)} />);
  return fake;
}

describe('完成状态与筛选交互 (todo-completion, 第 8 组)', () => {
  it('toggles completion visuals on and off (8.1)', async () => {
    const user = userEvent.setup();
    const fake = new FakeClient();
    fake.seed(['买牛奶']);
    renderApp(fake);
    await screen.findByText('买牛奶');

    const checkbox = () => screen.getByRole('checkbox');
    expect(screen.getByTestId('todo-title')).toHaveAttribute('data-completed', 'false');

    await user.click(checkbox());
    await waitFor(() =>
      expect(screen.getByTestId('todo-title')).toHaveAttribute('data-completed', 'true'),
    );
    expect(screen.getByTestId('todo-title')).toHaveClass('line-through');

    await user.click(checkbox());
    await waitFor(() =>
      expect(screen.getByTestId('todo-title')).toHaveAttribute('data-completed', 'false'),
    );
  });

  it('filters by 未完成 / 已完成 / 全部 (8.3)', async () => {
    const user = userEvent.setup();
    const fake = new FakeClient();
    fake.seed([{ title: '已完成项', completed: true }, { title: '未完成项' }]);
    renderApp(fake);
    await screen.findByText('未完成项');

    await user.click(screen.getByRole('button', { name: '未完成' }));
    await waitFor(() => expect(screen.queryByText('已完成项')).not.toBeInTheDocument());
    expect(screen.getByText('未完成项')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '已完成' }));
    await waitFor(() => expect(screen.queryByText('未完成项')).not.toBeInTheDocument());
    expect(screen.getByText('已完成项')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '全部' }));
    await waitFor(() => expect(screen.getByText('未完成项')).toBeInTheDocument());
    expect(screen.getByText('已完成项')).toBeInTheDocument();
  });

  it('decrements the active count when a todo is completed (8.5)', async () => {
    const user = userEvent.setup();
    const fake = new FakeClient();
    fake.seed(['a', 'b']);
    renderApp(fake);
    await screen.findByText('a');

    expect(screen.getByTestId('active-count')).toHaveTextContent('2 项未完成');

    await user.click(screen.getAllByRole('checkbox')[0]!);
    await waitFor(() =>
      expect(screen.getByTestId('active-count')).toHaveTextContent('1 项未完成'),
    );
  });
});

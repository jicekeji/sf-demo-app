import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Card } from '../src/components/Card';
import { List, ListItem } from '../src/components/List';

describe('设计系统基础组件 (6.1)', () => {
  it('Button variants reference design tokens', () => {
    const { rerender } = render(<Button variant="primary">主要</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand', 'rounded-md');

    rerender(<Button variant="ghost">次要</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-brand');

    rerender(<Button variant="danger">删除</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-danger');
  });

  it('Button is keyboard focusable and clickable via keyboard', async () => {
    const user = userEvent.setup();
    let clicks = 0;
    render(<Button onClick={() => (clicks += 1)}>确认</Button>);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(clicks).toBe(1);
  });

  it('Input uses token classes and accepts focus', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="标题" />);
    const input = screen.getByLabelText('标题');
    expect(input).toHaveClass('rounded-md');
    await user.click(input);
    expect(input).toHaveFocus();
  });

  it('Card and List render token-based containers', () => {
    render(
      <Card>
        <List>
          <ListItem>一</ListItem>
          <ListItem>二</ListItem>
        </List>
      </Card>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('list')).toHaveClass('divide-y');
  });
});

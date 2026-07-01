/**
 * Card — surface container using token radius/spacing and a soft shadow,
 * matching the "浅色为主、组件弱阴影" visual theme.
 */
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn('rounded-lg bg-white p-token6 shadow-card', className)}
      {...rest}
    />
  );
}

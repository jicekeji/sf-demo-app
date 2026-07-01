/**
 * List / ListItem — semantic list primitives using token spacing and dividers.
 */
import type { HTMLAttributes, LiHTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

export function List({ className, ...rest }: HTMLAttributes<HTMLUListElement>) {
  return <ul role="list" className={cn('divide-y divide-slate-100', className)} {...rest} />;
}

export function ListItem({ className, ...rest }: LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn('flex items-center gap-token3 py-token3', className)}
      {...rest}
    />
  );
}

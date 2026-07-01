/**
 * Button — design-system primitive with primary / ghost / danger variants.
 * All styling derives from the approved design tokens (brand color, radii,
 * spacing, type scale). Renders a native <button>, so it is keyboard focusable
 * and operable by default; a visible focus ring satisfies accessibility.
 */
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-fg hover:bg-brand-hover',
  ghost: 'bg-transparent text-brand hover:bg-brand-soft',
  danger: 'bg-transparent text-danger hover:bg-danger/10',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-token4 py-token2 text-sm font-semibold',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    />
  );
}

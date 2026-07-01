/**
 * Input — design-system text field. Uses token spacing/radii/type scale and a
 * brand focus ring for accessibility. Forwards all native input props.
 */
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type ?? 'text'}
      className={cn(
        'w-full rounded-md border border-slate-300 bg-white px-token4 py-token2 text-base text-slate-900',
        'placeholder:text-slate-400',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus:border-brand',
        className,
      )}
      {...rest}
    />
  );
});

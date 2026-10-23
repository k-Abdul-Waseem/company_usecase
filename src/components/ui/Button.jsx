import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 border border-transparent',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-transparent dark:bg-brand-600/15 dark:text-brand-300 dark:hover:bg-brand-600/25',
  outline:
    'border border-line-strong bg-card text-ink hover:bg-elevated hover:border-ink-subtle',
  ghost: 'border border-transparent text-ink-muted hover:bg-elevated hover:text-ink',
  danger:
    'bg-danger-600 text-white shadow-sm hover:bg-danger-700 active:bg-danger-700 border border-transparent',
  success:
    'bg-success-600 text-white shadow-sm hover:bg-success-700 border border-transparent',
  subtle: 'border border-transparent bg-elevated text-ink hover:bg-line',
  link: 'border border-transparent text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 p-0 h-auto',
};

const SIZES = {
  xs: 'h-8 gap-1.5 rounded-lg px-2.5 text-xs',
  sm: 'h-9 gap-2 rounded-lg px-3.5 text-sm',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-11 gap-2.5 rounded-xl px-5 text-[0.9375rem]',
  icon: 'h-9 w-9 rounded-lg p-0',
  'icon-sm': 'h-8 w-8 rounded-lg p-0',
  'icon-lg': 'h-10 w-10 rounded-xl p-0',
};

/** Generates the button class names so links can share the visual language. */
export function buttonStyles({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition duration-150 ease-swift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  );
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    isLoading = false,
    iconLeft,
    iconRight,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        iconLeft
      )}
      {children}
      {!isLoading && iconRight}
    </button>
  );
});

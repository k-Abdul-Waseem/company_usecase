import { cn } from '@/utils/cn';

const TONES = {
  neutral: 'bg-elevated text-ink-muted border-line',
  brand: 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-600/15 dark:text-brand-300 dark:border-brand-600/25',
  info: 'bg-info-50 text-info-700 border-info-100 dark:bg-info-500/15 dark:text-info-200 dark:border-info-500/25',
  success:
    'bg-success-50 text-success-700 border-success-100 dark:bg-success-500/15 dark:text-success-200 dark:border-success-500/25',
  warning:
    'bg-warning-50 text-warning-700 border-warning-100 dark:bg-warning-500/15 dark:text-warning-200 dark:border-warning-500/25',
  danger:
    'bg-danger-50 text-danger-700 border-danger-100 dark:bg-danger-500/15 dark:text-danger-200 dark:border-danger-500/25',
  accent:
    'bg-accent-50 text-accent-700 border-accent-100 dark:bg-accent-500/15 dark:text-accent-200 dark:border-accent-500/25',
  outline: 'bg-transparent text-ink-muted border-line-strong',
};

const SIZES = {
  sm: 'h-5 gap-1 px-1.5 text-2xs',
  md: 'h-6 gap-1.5 px-2 text-xs',
  lg: 'h-7 gap-1.5 px-2.5 text-xs',
};

const DOTS = {
  neutral: 'bg-ink-subtle',
  brand: 'bg-brand-500',
  info: 'bg-info-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  accent: 'bg-accent-500',
  outline: 'bg-ink-subtle',
};

/** Compact status or metadata pill. */
export function Badge({
  tone = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border font-semibold leading-none',
        TONES[tone] ?? TONES.neutral,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOTS[tone] ?? DOTS.neutral)}
          aria-hidden="true"
        />
      ) : null}
      {icon}
      {children}
    </span>
  );
}

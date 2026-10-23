import { cn } from '@/utils/cn';

/** Friendly zero-state with an optional call to action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
  tone = 'brand',
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300',
    neutral: 'bg-elevated text-ink-muted',
    success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-300',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl text-center',
        compact ? 'px-4 py-10' : 'px-6 py-14',
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl',
            tones[tone] ?? tones.brand,
          )}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

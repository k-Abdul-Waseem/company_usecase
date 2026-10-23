import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

/** Consistent failure surface with an optional retry action. */
export function ErrorState({
  title = 'Something went wrong',
  error,
  description,
  onRetry,
  retryLabel = 'Try again',
  compact = false,
  className,
}) {
  const message =
    description ??
    error?.message ??
    'We could not load this content. Please check your connection and try again.';

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-danger-100 bg-danger-50/60 text-center dark:border-danger-500/20 dark:bg-danger-500/5',
        compact ? 'px-4 py-8' : 'px-6 py-14',
        className,
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-100 text-danger-600 dark:bg-danger-500/15 dark:text-danger-300">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-ink-muted">{message}</p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          iconLeft={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

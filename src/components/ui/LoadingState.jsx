import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };
  return (
    <Loader2
      className={cn('animate-spin text-brand-600', sizes[size] ?? sizes.md, className)}
      aria-hidden="true"
    />
  );
}

/** Full-surface loading placeholder used while a page-level request resolves. */
export function LoadingState({ label = 'Loading…', description, compact = false, className }) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl text-center',
        compact ? 'py-10' : 'min-h-[18rem] py-16',
        className,
      )}
    >
      <span className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/30" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-600/15">
          <Spinner size="md" />
        </span>
      </span>
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description ? <p className="mt-1 text-xs text-ink-muted">{description}</p> : null}
      </div>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-elevated', className)} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn('h-3 animate-pulse rounded bg-elevated', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-card p-5', className)} aria-hidden="true">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="mt-4 h-6 w-1/3" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card" aria-hidden="true">
      <div className="flex gap-4 border-b border-line bg-elevated/60 px-4 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 border-b border-line px-4 py-4 last:border-b-0">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton key={columnIndex} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

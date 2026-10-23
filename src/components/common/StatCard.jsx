import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/Card';

const TONES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300',
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300',
  success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-300',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-300',
  info: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-300',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/15 dark:text-danger-300',
};

/** KPI tile used across manager and learner dashboards. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  hint,
  trend,
  className,
  footer,
}) {
  const trendDirection = trend?.direction ?? (trend?.value >= 0 ? 'up' : 'down');
  const TrendIcon =
    trendDirection === 'up' ? ArrowUpRight : trendDirection === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={cn('flex flex-col p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        {Icon ? (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              TONES[tone] ?? TONES.brand,
            )}
            aria-hidden="true"
          >
            <Icon className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-ink">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-2xs font-semibold',
              trendDirection === 'up' && 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300',
              trendDirection === 'down' && 'bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-300',
              trendDirection === 'flat' && 'bg-elevated text-ink-muted',
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {trend.value}
          </span>
        ) : null}
        {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
      </div>
      {footer ? <div className="mt-4 border-t border-line pt-3">{footer}</div> : null}
    </Card>
  );
}

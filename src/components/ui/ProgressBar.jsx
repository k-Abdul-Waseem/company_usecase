import { cn } from '@/utils/cn';
import { clamp } from '@/utils/format';

const TONES = {
  brand: 'from-brand-600 to-brand-400',
  success: 'from-success-600 to-success-500',
  warning: 'from-warning-600 to-warning-500',
  danger: 'from-danger-600 to-danger-500',
  accent: 'from-accent-600 to-accent-500',
  info: 'from-info-600 to-info-500',
  neutral: 'from-ink-subtle to-line-strong',
};

const HEIGHTS = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
};

/** Horizontal progress indicator with optional inline label + value. */
export function ProgressBar({
  value = 0,
  max = 100,
  tone = 'brand',
  size = 'sm',
  label,
  showValue = false,
  valueLabel,
  className,
  trackClassName,
  ariaLabel,
}) {
  const percentage = clamp(max > 0 ? (value / max) * 100 : 0, 0, 100);
  return (
    <div className={cn('w-full', className)}>
      {label || showValue ? (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          {label ? <span className="font-medium text-ink-muted">{label}</span> : <span />}
          {showValue ? (
            <span className="font-semibold tabular-nums text-ink">
              {valueLabel ?? `${Math.round(percentage)}%`}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
        aria-label={ariaLabel ?? label ?? 'Progress'}
        className={cn(
          'w-full overflow-hidden rounded-full bg-elevated',
          HEIGHTS[size] ?? HEIGHTS.sm,
          trackClassName,
        )}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-swift',
            TONES[tone] ?? TONES.brand,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

import { cn } from '@/utils/cn';
import { clamp } from '@/utils/format';

const STROKES = {
  brand: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  accent: '#6366f1',
  info: '#0284c7',
  neutral: '#94a3b8',
};

/**
 * Circular score indicator. Used for readiness, completion and quiz results.
 */
export function ProgressRing({
  value = 0,
  size = 120,
  strokeWidth = 10,
  tone = 'brand',
  label,
  valueLabel,
  sublabel,
  className,
  children,
  ariaLabel,
}) {
  const percentage = clamp(value, 0, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel ?? `${label ? `${label}: ` : ''}${Math.round(percentage)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-line"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={STROKES[tone] ?? STROKES.brand}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-ink">
              {valueLabel ?? `${Math.round(percentage)}%`}
            </span>
            {label ? <span className="mt-0.5 text-xs font-medium text-ink-muted">{label}</span> : null}
            {sublabel ? <span className="text-2xs text-ink-subtle">{sublabel}</span> : null}
          </>
        )}
      </div>
    </div>
  );
}

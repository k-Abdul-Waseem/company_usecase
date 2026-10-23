import { cn } from '@/utils/cn';

const DEFAULT_COLORS = ['#2563eb', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

/** SVG donut chart with an optional legend and centred summary. */
export function DonutChart({
  segments = [],
  size = 168,
  thickness = 18,
  centerLabel,
  centerValue,
  showLegend = true,
  className,
  ariaLabel = 'Distribution chart',
}) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;

  const summary =
    centerValue !== undefined
      ? `${centerValue}${centerLabel ? ` ${centerLabel}` : ''}`
      : `${total}`;

  return (
    <div className={cn('flex flex-col items-center gap-4 sm:flex-row sm:items-center', className)}>
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label={ariaLabel}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-elevated"
          />
          {total > 0
            ? segments.map((segment, index) => {
                const value = Math.max(0, segment.value);
                const fraction = value / total;
                const length = Math.max(0, fraction * circumference - 2);
                const offset = cursor;
                cursor += fraction * circumference;
                return (
                  <circle
                    key={segment.label ?? index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-offset}
                  >
                    <title>{`${segment.label}: ${value}`}</title>
                  </circle>
                );
              })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-semibold tabular-nums tracking-tight text-ink">
            {summary}
          </span>
          {centerLabel && centerValue !== undefined ? (
            <span className="mt-0.5 max-w-[70%] text-2xs text-ink-subtle">{centerLabel}</span>
          ) : null}
        </div>
      </div>

      {showLegend ? (
        <ul className="w-full space-y-2">
          {segments.map((segment, index) => (
            <li key={segment.label ?? index} className="flex items-center justify-between gap-3 text-xs">
              <span className="inline-flex min-w-0 items-center gap-2 text-ink-muted">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="truncate">{segment.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-ink">{segment.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

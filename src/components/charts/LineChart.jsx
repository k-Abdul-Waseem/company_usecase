import { useId } from 'react';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

/**
 * Responsive multi-series line chart rendered with inline SVG. No charting
 * dependency is used so the bundle stays within the project constraints.
 */
export function LineChart({
  data = [],
  series = [{ key: 'value', label: 'Value', color: '#2563eb', area: true }],
  height = 240,
  className,
  formatValue = (value) => formatPercent(value),
  ariaLabel = 'Trend chart',
}) {
  const gradientId = useId().replace(/:/g, '');
  const width = 680;
  const padding = { top: 16, right: 14, bottom: 30, left: 44 };

  if (!data.length) {
    return (
      <div className={cn('flex h-48 items-center justify-center text-sm text-ink-subtle', className)}>
        No data available
      </div>
    );
  }

  const allValues = data.flatMap((point) =>
    series.map((item) => Number(point[item.key] ?? 0)).filter((value) => Number.isFinite(value)),
  );
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  let yMin = Math.max(0, Math.floor((minValue - 8) / 10) * 10);
  let yMax = Math.min(100, Math.ceil((maxValue + 6) / 10) * 10);
  if (yMax - yMin < 20) {
    yMax = Math.min(100, yMin + 20);
    if (yMax - yMin < 20) yMin = Math.max(0, yMax - 20);
  }

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const xFor = (index) => padding.left + stepX * index;
  const yFor = (value) => {
    const ratio = (Number(value) - yMin) / (yMax - yMin || 1);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const ticks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) / 4) * index);
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <figure className={cn('w-full', className)}>
      {series.length > 1 ? (
        <figcaption className="mb-3 flex flex-wrap items-center gap-4">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.label}
            </span>
          ))}
        </figcaption>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          {series.map((item, index) => (
            <linearGradient key={item.key} id={`${gradientId}-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.01" />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="currentColor"
              className="text-line"
              strokeDasharray="3 5"
            />
            <text
              x={padding.left - 8}
              y={yFor(tick) + 3}
              textAnchor="end"
              className="fill-ink-subtle"
              fontSize="9"
            >
              {Math.round(tick)}%
            </text>
          </g>
        ))}

        {data.map((point, index) =>
          index % labelEvery === 0 || index === data.length - 1 ? (
            <text
              key={point.label ?? index}
              x={xFor(index)}
              y={height - 8}
              textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
              className="fill-ink-subtle"
              fontSize="9"
            >
              {point.label}
            </text>
          ) : null,
        )}

        {series.map((item, seriesIndex) => {
          const points = data.map((point, index) => `${xFor(index)},${yFor(point[item.key] ?? 0)}`);
          const linePath = `M ${points.join(' L ')}`;
          const areaPath = `${linePath} L ${xFor(data.length - 1)},${padding.top + plotHeight} L ${xFor(0)},${padding.top + plotHeight} Z`;
          return (
            <g key={item.key}>
              {item.area ? (
                <path d={areaPath} fill={`url(#${gradientId}-${seriesIndex})`} />
              ) : null}
              <path
                d={linePath}
                fill="none"
                stroke={item.color}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {data.map((point, index) => (
                <circle
                  key={`${item.key}-${point.label}-${index}`}
                  cx={xFor(index)}
                  cy={yFor(point[item.key] ?? 0)}
                  r="3"
                  fill="white"
                  stroke={item.color}
                  strokeWidth="2"
                >
                  <title>{`${point.label} · ${item.label}: ${formatValue(point[item.key] ?? 0)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

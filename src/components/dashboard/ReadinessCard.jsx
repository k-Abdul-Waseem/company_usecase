import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { READINESS_TONES } from '@/constants/status';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

/** Composite readiness score with its contributing factors. */
export function ReadinessCard({ summary, className }) {
  if (!summary) return null;
  const readiness = summary.readiness ?? {
    score: summary.readinessScore ?? 0,
    band: summary.readinessBand ?? 'not_ready',
    bandLabel: summary.readinessLabel ?? 'Not ready',
    factors: [],
    recommendation: '',
  };

  return (
    <Card className={cn('flex h-full flex-col p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Readiness score</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Weighted across four evidence sources</p>
        </div>
        <Badge tone={READINESS_TONES[readiness.band] ?? 'neutral'} size="sm" dot>
          {readiness.bandLabel}
        </Badge>
      </div>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <ProgressRing
          value={readiness.score}
          size={126}
          strokeWidth={11}
          tone={readiness.band === 'ready' ? 'success' : readiness.band === 'building' ? 'warning' : 'brand'}
          label="readiness"
          ariaLabel={`Readiness score ${readiness.score} percent, ${readiness.bandLabel}`}
        />
        <div className="w-full min-w-0 flex-1 space-y-3">
          {readiness.factors.map((factor) => (
            <ProgressBar
              key={factor.id}
              value={factor.achieved}
              label={factor.label}
              showValue
              valueLabel={formatPercent(factor.achieved)}
              size="xs"
              tone={
                factor.achieved >= 75 ? 'success' : factor.achieved >= 45 ? 'brand' : 'warning'
              }
              ariaLabel={`${factor.label} ${factor.achieved} percent`}
            />
          ))}
        </div>
      </div>

      {readiness.recommendation ? (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5 dark:border-brand-500/20 dark:bg-brand-600/10">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300"
            aria-hidden="true"
          />
          <p className="text-xs leading-5 text-ink-muted">{readiness.recommendation}</p>
        </div>
      ) : null}

      <Link
        to={ROUTES.progressTracker}
        className="mt-4 inline-flex items-center gap-1 self-start rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
      >
        Open progress tracker
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </Card>
  );
}

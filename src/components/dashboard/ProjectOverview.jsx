import { Link } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';

const RISK_TONES = { low: 'success', medium: 'warning', high: 'danger' };

/** Project roll-up cards surfaced on the manager dashboard. */
export function ProjectOverview({ projects = [], className }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {projects.map((project) => (
        <Card key={project.id} interactive className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400">
                {project.code}
              </p>
              <h3 className="mt-1 truncate text-sm font-semibold text-ink">{project.name}</h3>
              <p className="mt-0.5 truncate text-xs text-ink-muted">{project.client}</p>
            </div>
            <Badge tone={RISK_TONES[project.riskLevel] ?? 'neutral'} size="sm" dot>
              {project.riskLevel === 'low'
                ? 'Low risk'
                : project.riskLevel === 'medium'
                  ? 'Watch'
                  : 'At risk'}
            </Badge>
          </div>

          <div className="mt-5">
            <ProgressBar
              value={project.completionRate}
              label="Completion"
              showValue
              valueLabel={formatPercent(project.completionRate)}
              tone={project.riskLevel === 'high' ? 'warning' : 'brand'}
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {project.learners} learners
            </span>
            <Link
              to={ROUTES.reports}
              className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              View report
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

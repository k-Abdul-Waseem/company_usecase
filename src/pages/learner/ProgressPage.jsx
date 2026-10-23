import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
  Clock,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ReadinessCard } from '@/components/dashboard/ReadinessCard';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ROUTES } from '@/constants/routes';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/status';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { progressService } from '@/services/progress/progressService';
import { formatRelativeTime } from '@/utils/date';
import { formatDuration, formatPercent } from '@/utils/format';

const CATEGORY_LABELS = {
  common: 'Common foundation',
  developer: 'Developer path',
  tester: 'Tester path',
};

const CATEGORY_ORDER = ['common', 'developer', 'tester'];

/** Learner progress tracker: readiness evidence, module completion and quiz results. */
export function ProgressPage() {
  useDocumentTitle('Progress Tracker');

  const { data, status, error, reload } = useAsync(async () => {
    const [summary, modules, timeline] = await Promise.all([
      progressService.getSummary(),
      progressService.getModuleProgress(),
      progressService.getTimeline(),
    ]);
    return { summary, modules, timeline };
  }, []);

  if (status === 'loading') {
    return <LoadingState label="Loading your progress" description="Reading your readiness evidence." />;
  }

  if (error) {
    return (
      <ErrorState
        title="We could not load your progress"
        error={error}
        onRetry={reload}
      />
    );
  }

  if (!data) return null;

  const { summary, modules, timeline } = data;
  const quizStats = summary.quizStats ?? {};

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: modules.filter((module) => module.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Your evidence"
        title="Progress Tracker"
        description="Every module you complete and every assessment you pass contributes to your readiness score."
        actions={
          <Link
            to={ROUTES.quizCenter}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Go to assessments
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Path completion"
          value={formatPercent(summary.completionPercentage)}
          icon={CheckCircle2}
          tone="success"
          hint={`${summary.completedModules} of ${summary.totalModules} modules complete`}
        />
        <StatCard
          label="Readiness score"
          value={formatPercent(summary.readinessScore)}
          icon={ShieldCheck}
          tone={summary.readinessBand === 'ready' ? 'success' : 'brand'}
          hint={summary.readinessLabel}
        />
        <StatCard
          label="Quiz average"
          value={formatPercent(summary.quizAverage)}
          icon={GraduationCap}
          tone="info"
          hint={`${quizStats.passed ?? 0} of ${quizStats.completed ?? 0} assessments passed`}
        />
        <StatCard
          label="Learning time"
          value={formatDuration(summary.totalLearningMinutes)}
          icon={Clock}
          tone="accent"
          hint={`${summary.bookmarks} bookmarked modules`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {groups.map((group) => (
            <Card key={group.category} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">
                  {CATEGORY_LABELS[group.category] ?? group.category}
                </h2>
                <Badge tone="neutral" size="sm">
                  {group.items.length} modules
                </Badge>
              </div>

              <ul className="mt-4 divide-y divide-line">
                {group.items.map((module) => (
                  <li key={module.moduleId} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={ROUTES.learningModuleDetail(module.moduleId)}
                          className="text-sm font-semibold text-ink transition hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {module.title}
                        </Link>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-subtle">
                          <span>Level {module.level}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDuration(module.durationMinutes)}</span>
                          {module.bookmarked ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-warning-600 dark:text-warning-400">
                                <Bookmark className="h-3 w-3" aria-hidden="true" />
                                Bookmarked
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {module.score ? (
                          <span className="text-xs font-semibold tabular-nums text-ink-muted">
                            {module.score}%
                          </span>
                        ) : null}
                        <Badge tone={STATUS_TONES[module.status] ?? 'neutral'} size="sm" dot>
                          {STATUS_LABELS[module.status] ?? module.status}
                        </Badge>
                      </div>
                    </div>

                    <ProgressBar
                      value={module.percent}
                      size="xs"
                      tone={module.status === 'completed' ? 'success' : 'brand'}
                      className="mt-2.5"
                      ariaLabel={`${module.title} progress`}
                    />

                    {module.lastActivityAt ? (
                      <p className="mt-1.5 text-2xs text-ink-subtle">
                        Last activity{' '}
                        <time dateTime={module.lastActivityAt}>
                          {formatRelativeTime(module.lastActivityAt)}
                        </time>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          {!modules.length ? (
            <Card className="p-5">
              <EmptyState
                icon={Award}
                title="No modules assigned yet"
                description="Your learning path has not been published. Contact your learning program manager."
              />
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <ReadinessCard summary={summary} />

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Assessment summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                { label: 'Available quizzes', value: quizStats.available ?? 0 },
                { label: 'Attempted', value: quizStats.completed ?? 0 },
                { label: 'Passed', value: quizStats.passed ?? 0 },
                { label: 'Total attempts', value: quizStats.totalAttempts ?? 0 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="font-semibold tabular-nums text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              to={ROUTES.quizCenter}
              className="mt-4 inline-flex items-center gap-1 border-t border-line pt-3 text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              Open quiz center
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Latest evidence</h2>
            {timeline.length ? (
              <ol className="mt-3 space-y-2.5">
                {timeline.slice(0, 5).map((event) => (
                  <li key={event.id} className="text-xs leading-5">
                    <p className="font-medium text-ink">{event.title}</p>
                    <p className="text-ink-subtle">
                      <time dateTime={event.occurredAt}>
                        {formatRelativeTime(event.occurredAt)}
                      </time>
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-xs leading-5 text-ink-muted">
                Complete a module to start building your evidence.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

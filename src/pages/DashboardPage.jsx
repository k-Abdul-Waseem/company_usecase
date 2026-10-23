import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ProjectOverview } from '@/components/dashboard/ProjectOverview';
import { ReadinessCard } from '@/components/dashboard/ReadinessCard';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BRAND } from '@/constants/navigation';
import { LEARNING_ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { useDocumentTitle } from '@/hooks/useUi';
import { moduleService } from '@/services/modules/moduleService';
import { progressService } from '@/services/progress/progressService';
import { reportService } from '@/services/reports/reportService';
import { formatRelativeTime } from '@/utils/date';
import { formatDuration, formatNumber, formatPercent } from '@/utils/format';

const STATUS_META = {
  completed: { label: 'Completed', tone: 'success' },
  in_progress: { label: 'In progress', tone: 'brand' },
  not_started: { label: 'Not started', tone: 'neutral' },
};

/** Shared call-to-action button rendered on the gradient banner. */
function BannerLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

/** Role-aware landing page for managers and learners. */
export function DashboardPage() {
  const { role } = useAuth();
  const { effectiveUser } = usePreferences();
  const user = effectiveUser;
  const isManager = role === 'manager';

  useDocumentTitle('Dashboard');

  const { data, status, error, reload } = useAsync(async () => {
    if (isManager) {
      const analytics = await reportService.getAnalytics();
      return { kind: 'manager', analytics };
    }
    const [summary, continueModule, timeline] = await Promise.all([
      progressService.getSummary(),
      moduleService.getContinueLearning(),
      progressService.getTimeline(),
    ]);
    return { kind: 'learner', summary, continueModule, timeline };
  }, [isManager]);

  if (status === 'loading') {
    return <LoadingState label="Loading your dashboard" description="Gathering the latest programme data." />;
  }

  if (error) {
    return (
      <ErrorState
        title="We could not load your dashboard"
        error={error}
        onRetry={reload}
      />
    );
  }

  if (!data) return null;

  if (data.kind === 'manager') {
    const { overview, projects, activity } = data.analytics;

    return (
      <div className="space-y-6 animate-fade-in">
        <WelcomeBanner
          user={user}
          eyebrow={`${BRAND.organization} · Programme overview`}
          description="Track onboarding readiness across your projects, manage approved content and keep every learner on their role-aware path."
          actions={<BannerLink to={ROUTES.reports}>View reports</BannerLink>}
          stats={[
            { label: 'Learners', value: formatNumber(overview.totalLearners) },
            { label: 'Completion', value: formatPercent(overview.completionRate) },
            { label: 'Readiness', value: formatPercent(overview.readinessRate) },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Enrolled learners"
            value={formatNumber(overview.totalLearners)}
            icon={Users}
            tone="brand"
            hint={`${formatNumber(overview.activeLearners)} active this week`}
          />
          <StatCard
            label="Completion rate"
            value={formatPercent(overview.completionRate)}
            icon={CheckCircle2}
            tone="success"
            hint="Across all assigned learning paths"
          />
          <StatCard
            label="Average quiz score"
            value={formatPercent(overview.averageQuizScore)}
            icon={GraduationCap}
            tone="info"
            hint="All assessment attempts"
          />
          <StatCard
            label="Ready to start"
            value={formatPercent(overview.readinessRate)}
            icon={ShieldCheck}
            tone="accent"
            hint={`${overview.averageTimeToReadinessDays} days average time to readiness`}
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Projects</h2>
            <Link
              to={ROUTES.reports}
              className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              Full report
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ProjectOverview projects={projects} />
        </section>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
            <Badge tone="neutral" size="sm">
              {activity.length} events
            </Badge>
          </div>
          <ActivityFeed events={activity} className="mt-3" />
        </Card>
      </div>
    );
  }

  const { summary, continueModule, timeline } = data;
  const moduleStatus = STATUS_META[continueModule?.progress?.status] ?? STATUS_META.not_started;

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeBanner
        user={user}
        eyebrow={`${LEARNING_ROLE_LABELS[user?.learningRole] ?? 'Learner'} learning path · ${user?.projectName ?? BRAND.organization}`}
        description="Your induction workspace brings approved content, grounded answers and readiness evidence into one place."
        actions={<BannerLink to={ROUTES.learningModules}>Browse modules</BannerLink>}
        stats={[
          { label: 'Completed', value: `${summary.completedModules}/${summary.totalModules}` },
          { label: 'Quiz avg', value: formatPercent(summary.quizAverage) },
          { label: 'Readiness', value: formatPercent(summary.readinessScore) },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Path completion"
          value={formatPercent(summary.completionPercentage)}
          icon={CheckCircle2}
          tone="success"
          hint={`${summary.inProgressModules} in progress · ${summary.notStartedModules} not started`}
        />
        <StatCard
          label="Quiz average"
          value={formatPercent(summary.quizAverage)}
          icon={GraduationCap}
          tone="info"
          hint={`${summary.quizAttempts} attempts recorded`}
        />
        <StatCard
          label="Learning time"
          value={formatDuration(summary.totalLearningMinutes)}
          icon={Clock}
          tone="brand"
          hint="Time invested across modules"
        />
        <StatCard
          label="Bookmarks"
          value={formatNumber(summary.bookmarks)}
          icon={Award}
          tone="accent"
          hint="Modules saved for later"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ReadinessCard summary={summary} />

        <Card className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink">Continue learning</h3>
              <p className="mt-0.5 text-xs text-ink-muted">Pick up where you left off</p>
            </div>
            <Badge tone={moduleStatus.tone} size="sm" dot>
              {moduleStatus.label}
            </Badge>
          </div>

          {continueModule ? (
            <>
              <p className="mt-4 text-sm font-semibold text-ink">{continueModule.title}</p>
              <p className="mt-1 text-xs leading-5 text-ink-muted">{continueModule.summary}</p>
              <div className="mt-4">
                <ProgressBar
                  value={continueModule.progress?.percent ?? 0}
                  label="Module progress"
                  showValue
                  tone="brand"
                />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDuration(continueModule.durationMinutes)} module
                </span>
                <Link
                  to={ROUTES.learningModuleDetail(continueModule.id)}
                  className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
                >
                  Open module
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No modules assigned"
              description="Your learning path is empty. Contact your learning program manager."
              compact
              className="mt-4"
            />
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Your recent activity</h2>
          <Link
            to={ROUTES.progressTracker}
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
          >
            Progress tracker
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {timeline.length ? (
          <ol className="mt-3 space-y-1">
            {timeline.slice(0, 6).map((event) => (
              <li key={event.id} className="flex gap-3 rounded-xl px-1 py-2.5">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300"
                  aria-hidden="true"
                >
                  <BookOpen className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-ink">{event.title}</p>
                  <p className="mt-0.5 text-2xs text-ink-subtle">
                    {event.description}
                    <span aria-hidden="true"> · </span>
                    <time dateTime={event.occurredAt}>{formatRelativeTime(event.occurredAt)}</time>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No activity yet"
            description="Start a module to build your readiness evidence."
            compact
            className="mt-3"
          />
        )}
      </Card>
    </div>
  );
}

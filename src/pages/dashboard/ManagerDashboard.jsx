import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  GraduationCap,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ProjectOverview } from '@/components/dashboard/ProjectOverview';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { buttonStyles } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { LEARNING_ROLE_LABELS } from '@/constants/roles';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/status';
import { useAsync } from '@/hooks/useAsync';
import { enrollmentService } from '@/services/users/enrollmentService';
import { reportService } from '@/services/reports/reportService';
import { formatDate } from '@/utils/date';
import { formatNumber, formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Manager landing view: programme KPIs, activity, risk and recent enrolments. */
export function ManagerDashboard({ user }) {
  const { data, status, error, reload } = useAsync(async () => {
    const [stats, recentEnrollments, analytics] = await Promise.all([
      enrollmentService.getStats(),
      enrollmentService.getRecent(5),
      reportService.getAnalytics(),
    ]);
    return { stats, recentEnrollments, analytics };
  }, []);

  if (status === 'loading') {
    return <LoadingState label="Loading programme overview" description="Fetching learners, activity and analytics." />;
  }

  if (error) {
    return <ErrorState title="Could not load the programme overview" error={error} onRetry={reload} />;
  }

  const { recentEnrollments, analytics } = data;
  const overview = analytics.overview;
  const pendingEnrollments = recentEnrollments.filter((item) => item.status === 'pending');
  const activeShare = overview.totalLearners
    ? Math.round((overview.activeLearners / overview.totalLearners) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeBanner
        user={user}
        eyebrow="Programme overview · Live workspace"
        description="Track induction completion, surface learners who need attention and keep approved content current across every project."
        actions={
          <>
            <Link
              to={ROUTES.enrollment}
              className={buttonStyles({
                size: 'sm',
                className: 'border border-transparent bg-white text-brand-700 hover:bg-brand-50',
              })}
            >
              Manage enrollment
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={ROUTES.reports}
              className={buttonStyles({
                size: 'sm',
                variant: 'outline',
                className: 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white',
              })}
            >
              View reports
            </Link>
          </>
        }
        stats={[
          { label: 'Active', value: overview.activeLearners },
          { label: 'Completion', value: formatPercent(overview.completionRate, 1) },
          { label: 'Ready', value: formatPercent(overview.readinessRate, 1) },
        ]}
      />

      <div className="grid-dashboard">
        <StatCard
          label="Total learners"
          value={formatNumber(overview.totalLearners)}
          icon={Users}
          tone="brand"
          hint={`Across ${analytics.projects.length} active projects`}
        />
        <StatCard
          label="Active learners"
          value={formatNumber(overview.activeLearners)}
          icon={UserCheck}
          tone="success"
          hint={`${activeShare}% of the enrolled cohort`}
        />
        <StatCard
          label="Completion rate"
          value={formatPercent(overview.completionRate, 1)}
          icon={Target}
          tone="accent"
          hint={`${overview.readinessRate}% readiness rate`}
        />
        <StatCard
          label="Average quiz score"
          value={formatPercent(overview.averageQuizScore, 1)}
          icon={GraduationCap}
          tone="warning"
          hint={`${overview.averageTimeToReadinessDays} days average to readiness`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Programme activity</h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Enrolments, completions and assessment results across the workspace
              </p>
            </div>
            <Link
              to={ROUTES.reports}
              className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              Open reports
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ActivityFeed events={analytics.activity} limit={7} className="mt-3" />
        </Card>

        <Card className="flex flex-col p-5">
          <h2 className="text-sm font-semibold text-ink">Needs attention</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Items that could delay readiness</p>

          <div className="mt-4 rounded-xl border border-warning-100 bg-warning-50/60 p-3.5 dark:border-warning-500/20 dark:bg-warning-500/10">
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-warning-600 dark:text-warning-300"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-ink">
                  {overview.totalLearners - overview.activeLearners} learners not active
                </p>
                <p className="mt-0.5 text-2xs leading-5 text-ink-muted">
                  No module activity recorded in the current window.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar
              value={overview.readinessRate}
              label="Cohort readiness"
              showValue
              valueLabel={formatPercent(overview.readinessRate, 1)}
              tone={overview.readinessRate >= 70 ? 'success' : 'warning'}
            />
            <p className="mt-2 text-2xs leading-5 text-ink-subtle">
              {overview.readinessRate < 70
                ? 'Readiness is below the 70% programme target.'
                : 'Readiness is on or above the programme target.'}
            </p>
          </div>

          <div className="mt-5 flex-1 border-t border-line pt-4">
            <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Pending activation
            </p>
            {pendingEnrollments.length ? (
              <ul className="mt-2 space-y-2.5">
                {pendingEnrollments.slice(0, 3).map((enrollment) => (
                  <li key={enrollment.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-ink">{enrollment.employeeName}</p>
                      <p className="truncate text-2xs text-ink-subtle">
                        {enrollment.projectName} · {LEARNING_ROLE_LABELS[enrollment.role]}
                      </p>
                    </div>
                    <Badge tone="warning" size="sm" dot>
                      Pending
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-ink-muted">No pending activations.</p>
            )}
            <Link
              to={ROUTES.enrollment}
              className="mt-3 inline-flex items-center gap-1 rounded text-2xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              Review all enrolments
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Project roll-up</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Completion and assessment performance by project
            </p>
          </div>
          <Link
            to={ROUTES.reports}
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
          >
            Full analytics
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <ProjectOverview projects={analytics.projects} />
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Recent enrolments</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Latest learners added to the programme</p>
          </div>
          <Link
            to={ROUTES.enrollment}
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
          >
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            Manage enrollment
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table containerClassName="rounded-none border-x-0 border-b-0" caption="Recent enrolments">
            <THead>
              <TR>
                <TH>Learner</TH>
                <TH>Project</TH>
                <TH>Role</TH>
                <TH>Module progress</TH>
                <TH>Avg. score</TH>
                <TH>Enrolled</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {recentEnrollments.map((enrollment) => {
                const progress = enrollment.assignedModules
                  ? Math.round((enrollment.completedModules / enrollment.assignedModules) * 100)
                  : 0;
                return (
                  <TR key={enrollment.id}>
                    <TD>
                      <p className="font-medium text-ink">{enrollment.employeeName}</p>
                      <p className="text-2xs text-ink-subtle">{enrollment.employeeId}</p>
                    </TD>
                    <TD className="text-ink-muted">{enrollment.projectName}</TD>
                    <TD>
                      <Badge tone={enrollment.role === 'developer' ? 'accent' : 'info'} size="sm">
                        {LEARNING_ROLE_LABELS[enrollment.role]}
                      </Badge>
                    </TD>
                    <TD className="min-w-[9rem]">
                      <ProgressBar
                        value={progress}
                        showValue
                        size="xs"
                        tone={progress >= 80 ? 'success' : 'brand'}
                        ariaLabel={`${enrollment.employeeName} module progress`}
                      />
                    </TD>
                    <TD className="tabular-nums text-ink-muted">
                      {enrollment.averageScore ? `${enrollment.averageScore}%` : '—'}
                    </TD>
                    <TD className="whitespace-nowrap text-ink-muted">
                      {formatDate(enrollment.enrolledAt)}
                    </TD>
                    <TD>
                      <Badge
                        tone={STATUS_TONES[enrollment.status] ?? 'neutral'}
                        size="sm"
                        dot
                        className={cn(enrollment.status === 'pending' && 'capitalize')}
                      >
                        {STATUS_LABELS[enrollment.status] ?? enrollment.status}
                      </Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

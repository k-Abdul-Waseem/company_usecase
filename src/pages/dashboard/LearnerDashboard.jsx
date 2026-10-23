import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  ListChecks,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  Trophy,
  UserPlus,
} from 'lucide-react';
import { ReadinessCard } from '@/components/dashboard/ReadinessCard';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatCard } from '@/components/common/StatCard';
import { ModuleIcon } from '@/components/modules/ModuleIcon';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { buttonStyles } from '@/components/ui/Button';
import { MODULE_CATEGORY_LABELS, MODULE_LEVEL_LABELS } from '@/constants/modules';
import { LEARNING_ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/status';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { moduleService } from '@/services/modules/moduleService';
import { progressService } from '@/services/progress/progressService';
import { quizService } from '@/services/quiz/quizService';
import { formatRelativeTime } from '@/utils/date';
import { formatDuration, formatPercent } from '@/utils/format';

const TIMELINE_ICONS = {
  enrollment: UserPlus,
  module_started: PlayCircle,
  module_completed: CheckCircle2,
  quiz_passed: Trophy,
  quiz_attempt: RotateCcw,
  badge: Sparkles,
};

/** Learner landing view: continue learning, readiness, path and next assessment. */
export function LearnerDashboard({ user }) {
  useDocumentTitle('Dashboard');

  const { data, status, error, reload } = useAsync(async () => {
    const [summary, modules, quizData, timeline] = await Promise.all([
      progressService.getSummary(),
      moduleService.list({}),
      quizService.list(),
      progressService.getTimeline(),
    ]);
    const continueModule = await moduleService.getContinueLearning();
    return { summary, modules: modules.items ?? modules, quizData, timeline, continueModule };
  }, []);

  if (status === 'loading') {
    return <LoadingState label="Loading your learning path" description="Fetching progress and readiness evidence." />;
  }

  if (error) {
    return <ErrorState title="Could not load your dashboard" error={error} onRetry={reload} />;
  }

  const { summary, modules, quizData, timeline, continueModule } = data;
  const quizzes = quizData.quizzes ?? [];
  const nextQuiz = quizzes
    .filter((quiz) => !quiz.passed && quiz.attemptsRemaining > 0)
    .sort((a, b) => a.attemptCount - b.attemptCount)[0];
  const passedQuizzes = quizzes.filter((quiz) => quiz.passed).length;
  const recentEvents = timeline.slice(0, 4);
  const roleLabel = LEARNING_ROLE_LABELS[user?.learningRole] ?? 'Learner';

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeBanner
        user={user}
        eyebrow={`${roleLabel} learning path · ${user?.projectName ?? 'Project workspace'}`}
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Pick up where you left off, complete your mandatory assessments and build the readiness evidence your project needs."
        actions={
          <>
            <Link
              to={continueModule ? ROUTES.learningModuleDetail(continueModule.id) : ROUTES.learningModules}
              className={buttonStyles({
                size: 'sm',
                className: 'border border-transparent bg-white text-brand-700 hover:bg-brand-50',
              })}
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              {continueModule?.progress?.status === 'in_progress' ? 'Continue learning' : 'Start learning'}
            </Link>
            <Link
              to={ROUTES.aiAssistant}
              className={buttonStyles({
                size: 'sm',
                variant: 'outline',
                className: 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white',
              })}
            >
              <Bot className="h-4 w-4" aria-hidden="true" />
              Ask the assistant
            </Link>
          </>
        }
        stats={[
          { label: 'Complete', value: formatPercent(summary.completionPercentage) },
          { label: 'Readiness', value: formatPercent(summary.readinessScore) },
          { label: 'Quiz avg.', value: formatPercent(summary.quizAverage, 0) },
        ]}
      />

      <div className="grid-dashboard">
        <StatCard
          label="Path completion"
          value={formatPercent(summary.completionPercentage)}
          icon={Target}
          tone="brand"
          hint={`${summary.completedModules} of ${summary.totalModules} modules complete`}
        />
        <StatCard
          label="Modules completed"
          value={`${summary.completedModules}/${summary.totalModules}`}
          icon={BookOpen}
          tone="success"
          hint={`${summary.inProgressModules} in progress · ${summary.notStartedModules} not started`}
        />
        <StatCard
          label="Quiz average"
          value={formatPercent(summary.quizAverage, 1)}
          icon={GraduationCap}
          tone="accent"
          hint={`${passedQuizzes} of ${quizzes.length} assessments passed`}
        />
        <StatCard
          label="Time invested"
          value={formatDuration(summary.totalLearningMinutes)}
          icon={Timer}
          tone="warning"
          hint={`${summary.quizAttempts} quiz attempts recorded`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {continueModule ? (
          <Card className="relative overflow-hidden p-6 xl:col-span-2">
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-50 dark:bg-brand-600/10"
              aria-hidden="true"
            />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                  Continue learning
                </p>
                <div className="mt-3 flex items-start gap-3.5">
                  <ModuleIcon
                    icon={continueModule.icon}
                    category={continueModule.category}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={continueModule.category === 'common' ? 'brand' : continueModule.category === 'developer' ? 'accent' : 'info'} size="sm">
                        {MODULE_CATEGORY_LABELS[continueModule.category]}
                      </Badge>
                      <Badge tone="outline" size="sm">
                        Level {continueModule.level} · {MODULE_LEVEL_LABELS[continueModule.level]}
                      </Badge>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">
                      <Link
                        to={ROUTES.learningModuleDetail(continueModule.id)}
                        className="transition hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {continueModule.title}
                      </Link>
                    </h2>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-ink-muted">
                      {continueModule.summary}
                    </p>
                  </div>
                </div>
              </div>
              <ProgressRing
                value={continueModule.progress?.percent ?? 0}
                size={82}
                strokeWidth={8}
                label="complete"
                ariaLabel={`${continueModule.title} is ${continueModule.progress?.percent ?? 0} percent complete`}
                className="shrink-0"
              />
            </div>

            <div className="relative mt-5">
              <ProgressBar
                value={continueModule.progress?.percent ?? 0}
                label="Module progress"
                showValue
                valueLabel={formatPercent(continueModule.progress?.percent ?? 0)}
                tone={continueModule.progress?.percent >= 70 ? 'success' : 'brand'}
              />
            </div>

            <ul className="relative mt-5 grid gap-2 sm:grid-cols-2">
              {(continueModule.objectives ?? []).slice(0, 4).map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-xs leading-5 text-ink-muted">
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500"
                    aria-hidden="true"
                  />
                  {objective}
                </li>
              ))}
            </ul>

            <div className="relative mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={ROUTES.learningModuleDetail(continueModule.id)}
                className={buttonStyles({ size: 'sm' })}
              >
                {continueModule.progress?.status === 'in_progress' ? 'Resume module' : 'Open module'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-subtle">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDuration(continueModule.durationMinutes)}
                {continueModule.progress?.lastActivityAt
                  ? ` · last active ${formatRelativeTime(continueModule.progress.lastActivityAt)}`
                  : ''}
              </span>
            </div>
          </Card>
        ) : (
          <Card className="xl:col-span-2">
            <EmptyState
              icon={Trophy}
              title="Your assigned path is complete"
              description="Every module assigned to your role has been finished. Review your evidence or revisit any module."
              action={
                <Link to={ROUTES.learningModules} className={buttonStyles({ size: 'sm' })}>
                  Open learning modules
                </Link>
              }
            />
          </Card>
        )}

        <ReadinessCard summary={summary} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Your learning path</h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                {roleLabel} specialisation · {summary.totalModules} assigned modules
              </p>
            </div>
            <Link
              to={ROUTES.learningModules}
              className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-3 divide-y divide-line">
            {modules.map((module) => {
              const percent = module.progress?.percent ?? 0;
              const moduleStatus = module.progress?.status ?? 'not_started';
              return (
                <li key={module.id}>
                  <Link
                    to={ROUTES.learningModuleDetail(module.id)}
                    className="group flex items-center gap-3 rounded-xl px-1 py-3 transition hover:bg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    <ModuleIcon icon={module.icon} category={module.category} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-xs font-semibold text-ink transition group-hover:text-brand-600 dark:group-hover:text-brand-400">
                          {module.title}
                        </p>
                        <Badge tone={STATUS_TONES[moduleStatus] ?? 'neutral'} size="sm">
                          {STATUS_LABELS[moduleStatus] ?? moduleStatus}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-2xs text-ink-subtle">
                        {MODULE_CATEGORY_LABELS[module.category]} · {formatDuration(module.durationMinutes)} ·{' '}
                        {MODULE_LEVEL_LABELS[module.level]}
                      </p>
                      <div className="mt-1.5 max-w-[16rem] md:hidden">
                        <ProgressBar
                          value={percent}
                          size="xs"
                          tone={percent >= 80 ? 'success' : 'brand'}
                          ariaLabel={`${module.title} progress`}
                        />
                      </div>
                    </div>
                    <div className="hidden w-28 shrink-0 md:block">
                      <ProgressBar
                        value={percent}
                        size="xs"
                        tone={percent >= 80 ? 'success' : 'brand'}
                        ariaLabel={`${module.title} progress`}
                      />
                      <p className="mt-1 text-right text-2xs tabular-nums text-ink-subtle">
                        {formatPercent(percent)}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-ink-subtle transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                <GraduationCap className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Next assessment</h2>
                <p className="text-2xs text-ink-subtle">Knowledge check</p>
              </div>
            </div>

            {nextQuiz ? (
              <>
                <h3 className="mt-4 text-sm font-semibold text-ink">{nextQuiz.title}</h3>
                <p className="mt-1 text-xs leading-5 text-ink-muted">{nextQuiz.description}</p>
                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                      Questions
                    </dt>
                    <dd className="font-medium text-ink">{nextQuiz.questionCount}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                      <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                      Time limit
                    </dt>
                    <dd className="font-medium text-ink">{nextQuiz.durationMinutes} min</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                      <Target className="h-3.5 w-3.5" aria-hidden="true" />
                      Pass mark
                    </dt>
                    <dd className="font-medium text-ink">{nextQuiz.passingScore}%</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Attempts left
                    </dt>
                    <dd className="font-medium text-ink">{nextQuiz.attemptsRemaining}</dd>
                  </div>
                </dl>
                <Link
                  to={ROUTES.quizAttempt(nextQuiz.id)}
                  className={buttonStyles({ size: 'sm', className: 'mt-4 w-full justify-center' })}
                >
                  Start assessment
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <div className="mt-4">
                <p className="text-xs leading-5 text-ink-muted">
                  {quizzes.length
                    ? 'You have passed every available assessment. Review your evidence in the quiz center.'
                    : 'No assessments are assigned to your learning path yet.'}
                </p>
                <Link
                  to={ROUTES.quizCenter}
                  className={buttonStyles({ size: 'sm', variant: 'outline', className: 'mt-3 w-full justify-center' })}
                >
                  Open quiz center
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Your latest induction events</p>
            {recentEvents.length ? (
              <ul className="mt-3 space-y-3.5">
                {recentEvents.map((event) => {
                  const Icon = TIMELINE_ICONS[event.type] ?? BookOpen;
                  return (
                    <li key={event.id} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-muted">
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-5 text-ink">{event.title}</p>
                        <p className="truncate text-2xs text-ink-subtle">
                          {formatRelativeTime(event.occurredAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-ink-muted">Activity appears as you progress.</p>
            )}
            <Link
              to={ROUTES.progressTracker}
              className="mt-4 inline-flex items-center gap-1 rounded text-2xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
            >
              Full timeline
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </Card>
        </div>
      </div>

      <Card className="relative overflow-hidden border-brand-100 bg-gradient-to-r from-brand-50 via-card to-accent-50 p-5 dark:border-brand-500/20 dark:from-brand-600/10 dark:via-card dark:to-accent-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Questions while you learn?</h2>
              <p className="mt-0.5 max-w-xl text-xs leading-5 text-ink-muted">
                The assistant answers only from approved project content and cites every source it uses.
              </p>
            </div>
          </div>
          <Link to={ROUTES.aiAssistant} className={buttonStyles({ size: 'sm' })}>
            Open assistant
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

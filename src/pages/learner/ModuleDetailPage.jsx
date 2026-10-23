import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  ListChecks,
  LockKeyhole,
  PlayCircle,
  Target,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Callout } from '@/components/common/Callout';
import { ModuleBlocks } from '@/components/modules/ModuleBlockRenderer';
import { ModuleIcon } from '@/components/modules/ModuleIcon';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MODULE_CATEGORY_LABELS, MODULE_LEVEL_LABELS, RESOURCE_TYPE_LABELS } from '@/constants/modules';
import { ROUTES } from '@/constants/routes';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/status';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { useToast } from '@/hooks/useToast';
import { moduleService } from '@/services/modules/moduleService';
import { formatRelativeTime } from '@/utils/date';
import { formatDuration, formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Full reading view for one assigned module with progress and linked evidence. */
export function ModuleDetailPage() {
  const { moduleId } = useParams();
  const { toast } = useToast();
  const [progress, setProgress] = useState(null);
  const [readSections, setReadSections] = useState([]);
  const [busy, setBusy] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  const { data, status, error, reload } = useAsync(
    () => moduleService.getById(moduleId),
    [moduleId],
  );

  useDocumentTitle(data?.module?.title ?? 'Learning module');

  const module = data?.module;
  const sections = module?.sections ?? [];

  // Seed the local read tracker from the module that was just loaded.
  const [seededData, setSeededData] = useState(null);
  if (data && data !== seededData) {
    setSeededData(data);
    setProgress(data.progress);
    const approximateRead = Math.round(
      ((data.progress?.percent ?? 0) / 100) * (data.module?.sections?.length ?? 0),
    );
    setReadSections(
      (data.module?.sections ?? []).slice(0, approximateRead).map((section) => section.id),
    );
  }

  const percent = progress?.percent ?? 0;

  if (status === 'loading') {
    return <LoadingState label="Opening module" description="Loading approved content and your progress." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.learningModules}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to learning modules
        </Link>
        <ErrorState title="This module could not be opened" error={error} onRetry={reload} />
      </div>
    );
  }

  const persistProgress = async (nextPercent, { quiet = true } = {}) => {
    setBusy(true);
    try {
      const updated = await moduleService.updateProgress(module.id, { percent: nextPercent });
      setProgress(updated);
      if (updated.status === 'completed') {
        toast.success('Module complete', `${module.title} now counts toward your readiness evidence.`);
      } else if (!quiet) {
        toast.success('Progress saved', `${module.title} · ${formatPercent(updated.percent)}`);
      }
    } catch (caught) {
      toast.error('Could not save progress', caught?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const markSectionRead = async (sectionId) => {
    if (readSections.includes(sectionId)) return;
    const nextIds = [...readSections, sectionId];
    setReadSections(nextIds);
    const nextPercent = Math.round((nextIds.length / Math.max(1, sections.length)) * 100);
    await persistProgress(nextPercent);
  };

  const markComplete = async () => {
    setReadSections(sections.map((section) => section.id));
    await persistProgress(100, { quiet: false });
  };

  const toggleBookmark = async () => {
    setBookmarkBusy(true);
    try {
      const updated = await moduleService.toggleBookmark(module.id);
      setProgress(updated);
      toast.success(updated.bookmarked ? 'Module bookmarked' : 'Bookmark removed', module.title);
    } catch (caught) {
      toast.error('Could not update bookmark', caught?.message ?? 'Please try again.');
    } finally {
      setBookmarkBusy(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.dashboard },
          { label: 'Learning modules', to: ROUTES.learningModules },
          { label: module.title },
        ]}
        eyebrow={`${MODULE_CATEGORY_LABELS[module.category]} · Level ${module.level}`}
        title={module.title}
        description={module.summary}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBookmark}
              isLoading={bookmarkBusy}
              aria-pressed={Boolean(progress?.bookmarked)}
              iconLeft={
                progress?.bookmarked ? (
                  <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                )
              }
            >
              {progress?.bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            {progress?.status !== 'completed' ? (
              <Button
                size="sm"
                onClick={markComplete}
                isLoading={busy}
                iconLeft={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              >
                Mark complete
              </Button>
            ) : (
              <Badge tone="success" size="lg" dot>
                Completed
              </Badge>
            )}
          </>
        }
      />

      <div className="rounded-xl border border-line bg-card p-3 shadow-sm">
        <ProgressBar
          value={percent}
          label="Reading progress"
          showValue
          valueLabel={formatPercent(percent)}
          tone={percent === 100 ? 'success' : 'brand'}
          ariaLabel="Module reading progress"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Card className="relative overflow-hidden p-6">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand-50 dark:bg-brand-600/10"
              aria-hidden="true"
            />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <ModuleIcon icon={module.icon} category={module.category} size="xl" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      tone={module.category === 'common' ? 'brand' : module.category === 'developer' ? 'accent' : 'info'}
                      size="sm"
                    >
                      {MODULE_CATEGORY_LABELS[module.category]}
                    </Badge>
                    <Badge tone="outline" size="sm">
                      {MODULE_LEVEL_LABELS[module.level]}
                    </Badge>
                    <Badge tone={STATUS_TONES[progress?.status ?? 'not_started'] ?? 'neutral'} size="sm" dot>
                      {STATUS_LABELS[progress?.status ?? 'not_started']}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink-muted">{module.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-subtle">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDuration(module.durationMinutes)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                      {sections.length} sections
                    </span>
                    {progress?.lastActivityAt ? (
                      <span>Last active {formatRelativeTime(progress.lastActivityAt)}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="hidden shrink-0 sm:block">
                <ProgressRing
                  value={percent}
                  size={92}
                  strokeWidth={9}
                  tone={percent === 100 ? 'success' : 'brand'}
                  label="complete"
                  ariaLabel={`Module ${percent} percent complete`}
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Learning objectives</h2>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {module.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2.5 text-sm leading-6 text-ink-muted">
                  <Target className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
                  {objective}
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-5">
            {sections.map((section, index) => {
              const isRead = readSections.includes(section.id);
              return (
                <Card key={section.id} id={`section-${section.id}`} className="scroll-mt-24 overflow-hidden">
                  <div className="border-b border-line bg-elevated/40 px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
                            isRead
                              ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300'
                              : 'bg-card text-ink-muted',
                          )}
                        >
                          {isRead ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                        </span>
                        <div>
                          <h2 className="text-base font-semibold tracking-tight text-ink">{section.heading}</h2>
                          <p className="mt-0.5 text-2xs text-ink-subtle">
                            Section {index + 1} of {sections.length}
                            {section.durationMinutes ? ` · ${formatDuration(section.durationMinutes)}` : ''}
                          </p>
                        </div>
                      </div>
                      {isRead ? (
                        <Badge tone="success" size="sm" dot>
                          Read
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-5">
                    <ModuleBlocks blocks={section.blocks} />
                    <div className="mt-6 flex justify-end border-t border-line pt-4">
                      <Button
                        variant={isRead ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => markSectionRead(section.id)}
                        disabled={isRead || busy}
                        iconLeft={
                          isRead ? (
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          )
                        }
                      >
                        {isRead ? 'Section read' : 'Mark section read'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {module.keyTakeaways?.length ? (
            <Callout variant="brand" title="Key takeaways">
              <ul className="mt-1 space-y-1.5">
                {module.keyTakeaways.map((takeaway) => (
                  <li key={takeaway} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
                    {takeaway}
                  </li>
                ))}
              </ul>
            </Callout>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            {data.previous ? (
              <Link
                to={ROUTES.learningModuleDetail(data.previous.id)}
                className="group inline-flex items-center gap-2 rounded-lg text-left text-xs text-ink-muted transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-2xs uppercase tracking-wide text-ink-subtle">Previous</span>
                  <span className="font-semibold">{data.previous.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {data.next ? (
              <Link
                to={ROUTES.learningModuleDetail(data.next.id)}
                className="group inline-flex items-center gap-2 self-end rounded-lg text-right text-xs text-ink-muted transition hover:text-brand-600 sm:self-auto dark:hover:text-brand-400"
              >
                <span>
                  <span className="block text-2xs uppercase tracking-wide text-ink-subtle">Next module</span>
                  <span className="font-semibold">{data.next.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink">Your progress</h2>
              <Badge tone={STATUS_TONES[progress?.status ?? 'not_started'] ?? 'neutral'} size="sm" dot>
                {STATUS_LABELS[progress?.status ?? 'not_started']}
              </Badge>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing
                value={percent}
                size={82}
                strokeWidth={8}
                tone={percent === 100 ? 'success' : 'brand'}
                label="complete"
                ariaLabel={`Module ${percent} percent complete`}
              />
              <div className="min-w-0 text-xs text-ink-muted">
                <p>
                  <span className="font-semibold text-ink">{readSections.length}</span> of{' '}
                  {sections.length} sections marked read
                </p>
                {progress?.score ? (
                  <p className="mt-1">
                    Best assessment score{' '}
                    <span className="font-semibold text-ink">{progress.score}%</span>
                  </p>
                ) : (
                  <p className="mt-1">No assessment attempt yet</p>
                )}
              </div>
            </div>
            {percent < 100 ? (
              <Button
                size="sm"
                className="mt-4 w-full justify-center"
                onClick={markComplete}
                isLoading={busy}
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                Mark module complete
              </Button>
            ) : (
              <p className="mt-4 rounded-lg border border-success-100 bg-success-50/60 p-3 text-xs leading-5 text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-300">
                This module is complete and included in your readiness score.
              </p>
            )}
          </Card>

          {data.quiz ? (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold text-ink">Knowledge check</h2>
              </div>
              <p className="mt-3 text-xs font-semibold text-ink">{data.quiz.title}</p>
              <p className="mt-1 text-2xs leading-5 text-ink-muted">{data.quiz.description}</p>
              <dl className="mt-3 space-y-1.5 text-2xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-subtle">Questions</dt>
                  <dd className="font-medium text-ink">{data.quiz.questionCount}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-subtle">Duration</dt>
                  <dd className="font-medium text-ink">{data.quiz.durationMinutes} min</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-subtle">Pass mark</dt>
                  <dd className="font-medium text-ink">{data.quiz.passingScore}%</dd>
                </div>
              </dl>
              <Link
                to={ROUTES.quizAttempt(data.quiz.id)}
                className={buttonStyles({ size: 'sm', variant: 'outline', className: 'mt-4 w-full justify-center' })}
              >
                {percent >= 100 ? 'Start assessment' : 'Preview assessment'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              {percent < 100 ? (
                <p className="mt-2 inline-flex items-center gap-1 text-2xs text-ink-subtle">
                  <LockKeyhole className="h-3 w-3" aria-hidden="true" />
                  Score improves after module completion
                </p>
              ) : null}
            </Card>
          ) : null}

          {module.resources?.length ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">Resources</h2>
              <ul className="mt-3 space-y-2">
                {module.resources.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.href}
                      className="group flex items-start gap-2.5 rounded-lg border border-line bg-card p-2.5 transition hover:border-brand-200 hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:border-brand-500/30 dark:hover:bg-brand-600/10"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-muted">
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-ink">{resource.label}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-subtle">
                          {RESOURCE_TYPE_LABELS[resource.type] ?? resource.type}
                          {resource.size ? ` · ${resource.size}` : ''}
                        </span>
                      </span>
                      {resource.type === 'link' ? (
                        <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                      ) : (
                        <Download className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">On this page</h2>
            <ol className="mt-3 space-y-1.5">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#section-${section.id}`}
                    className="flex items-start gap-2 rounded-md px-1 py-1 text-xs text-ink-muted transition hover:bg-elevated hover:text-ink"
                  >
                    <span className="mt-0.5 text-2xs font-semibold tabular-nums text-ink-subtle">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">{section.heading}</span>
                    {section.durationMinutes ? (
                      <span className="shrink-0 text-2xs text-ink-subtle">
                        {section.durationMinutes}m
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}

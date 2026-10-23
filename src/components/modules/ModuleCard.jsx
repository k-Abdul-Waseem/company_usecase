import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  ListChecks,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ModuleIcon } from './ModuleIcon';
import { MODULE_CATEGORY_LABELS, MODULE_LEVEL_LABELS } from '@/constants/modules';
import { ROUTES } from '@/constants/routes';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/status';
import { cn } from '@/utils/cn';
import { formatDuration } from '@/utils/format';

/** Bookmark control with a clear pressed state for assistive technology. */
export function BookmarkButton({ bookmarked, onToggle, disabled = false, className }) {
  const Icon = bookmarked ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle?.();
      }}
      disabled={disabled}
      aria-pressed={Boolean(bookmarked)}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this module'}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this module'}
      className={cn(
        'rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:opacity-50',
        bookmarked
          ? 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300'
          : 'text-ink-subtle hover:bg-elevated hover:text-ink',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/** Catalogue tile used on the learning modules page and learner dashboard. */
export function ModuleCard({ module, onBookmark, bookmarkBusy = false, className }) {
  const progress = module.progress ?? { status: 'not_started', percent: 0, bookmarked: false };
  const status = progress.status ?? 'not_started';
  const actionLabel =
    status === 'completed' ? 'Review module' : status === 'in_progress' ? 'Continue module' : 'Start module';
  const sectionCount = module.sections?.length ?? 0;

  return (
    <Card interactive className={cn('group flex h-full flex-col p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <ModuleIcon icon={module.icon} category={module.category} size="lg" />
        <div className="flex items-center gap-1.5">
          <Badge tone={STATUS_TONES[status] ?? 'neutral'} size="sm" dot>
            {STATUS_LABELS[status] ?? status}
          </Badge>
          <BookmarkButton
            bookmarked={progress.bookmarked}
            onToggle={() => onBookmark?.(module)}
            disabled={bookmarkBusy}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Badge tone="outline" size="sm">
          {MODULE_CATEGORY_LABELS[module.category] ?? module.category}
        </Badge>
        <Badge tone="outline" size="sm">
          {MODULE_LEVEL_LABELS[module.level] ?? `Level ${module.level}`}
        </Badge>
      </div>

      <h3 className="mt-2.5 text-base font-semibold tracking-tight text-ink">
        <Link
          to={ROUTES.learningModuleDetail(module.id)}
          className="rounded transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:text-brand-400"
        >
          {module.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-ink-muted">{module.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-subtle">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDuration(module.durationMinutes)}
        </span>
        {sectionCount ? (
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {sectionCount} sections
          </span>
        ) : null}
        {module.quizId ? (
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
            Has assessment
          </span>
        ) : null}
      </div>

      <div className="mt-auto pt-5">
        <ProgressBar
          value={progress.percent}
          label={
            status === 'completed'
              ? 'Completed'
              : status === 'in_progress'
                ? 'In progress'
                : 'Not started'
          }
          showValue
          tone={status === 'completed' ? 'success' : 'brand'}
          ariaLabel={`${module.title} progress`}
        />
        {progress.score ? (
          <p className="mt-2 inline-flex items-center gap-1 text-2xs font-medium text-success-700 dark:text-success-300">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Assessment score {progress.score}%
          </p>
        ) : null}
      </div>

      <Link
        to={ROUTES.learningModuleDetail(module.id)}
        className="mt-4 inline-flex items-center gap-1 self-start rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-brand-400"
      >
        {actionLabel}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </Card>
  );
}

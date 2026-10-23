import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';

const KIND_ICONS = {
  enrollment: UserPlus,
  module: BookOpen,
  quiz: GraduationCap,
  content: FileText,
  report: BarChart3,
};

const KIND_TONES = {
  enrollment: 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300',
  module: 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300',
  quiz: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-300',
  content: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-300',
  report: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-300',
};

/** Programme activity stream used on the manager dashboard. */
export function ActivityFeed({ events = [], limit = 6, className, showActorAvatar = true }) {
  if (!events.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No activity yet"
        description="Enrollments, module completions and quiz attempts will appear here."
        compact
      />
    );
  }

  return (
    <ol className={cn('space-y-1', className)}>
      {events.slice(0, limit).map((event) => {
        const Icon = KIND_ICONS[event.kind] ?? BookOpen;
        return (
          <li key={event.id} className="flex gap-3 rounded-xl px-1 py-2.5">
            {showActorAvatar ? (
              <Avatar name={event.actor} size="sm" className="mt-0.5" />
            ) : (
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  KIND_TONES[event.kind] ?? KIND_TONES.module,
                )}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-5 text-ink-muted">
                <span className="font-medium text-ink">{event.actor}</span> {event.action}{' '}
                <span className="font-medium text-ink">{event.target}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-subtle">
                <span>{event.actorRole}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={event.occurredAt}>{formatRelativeTime(event.occurredAt)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

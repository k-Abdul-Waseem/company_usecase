import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  ListChecks,
  Target,
  Timer,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { formatDuration } from '@/utils/format';

const DIFFICULTY_TONES = { easy: 'success', moderate: 'warning', advanced: 'danger' };

/** Assessment tile used in the quiz centre. */
export function QuizCard({ quiz, className }) {
  const attemptsLeft = quiz.attemptsRemaining ?? quiz.attemptsAllowed ?? 0;
  const passed = Boolean(quiz.passed);
  const exhausted = attemptsLeft <= 0;

  return (
    <Card interactive className={cn('flex h-full flex-col p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {passed ? (
            <Badge tone="success" size="sm" dot>
              Passed
            </Badge>
          ) : null}
          <Badge tone={DIFFICULTY_TONES[quiz.difficulty] ?? 'neutral'} size="sm">
            {quiz.difficulty}
          </Badge>
        </div>
      </div>

      <p className="mt-4 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
        {quiz.moduleTitle}
      </p>
      <h3 className="mt-0.5 text-base font-semibold tracking-tight text-ink">
        <Link
          to={ROUTES.quizAttempt(quiz.id)}
          className="rounded transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:text-brand-400"
        >
          {quiz.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-ink-muted">{quiz.description}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: Timer, label: 'Duration', value: formatDuration(quiz.durationMinutes) },
          { icon: ListChecks, label: 'Questions', value: quiz.questionCount },
          { icon: Target, label: 'Pass mark', value: `${quiz.passingScore}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-elevated/60 px-2.5 py-2">
            <span className="flex items-center gap-1 text-2xs text-ink-subtle">
              <item.icon className="h-3 w-3" aria-hidden="true" />
              {item.label}
            </span>
            <p className="mt-0.5 text-xs font-semibold text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        {quiz.bestScore !== null && quiz.bestScore !== undefined ? (
          <ProgressBar
            value={quiz.bestScore}
            label="Best score"
            showValue
            valueLabel={`${quiz.bestScore}%`}
            size="xs"
            tone={passed ? 'success' : 'warning'}
            ariaLabel="Best score"
          />
        ) : (
          <p className="text-xs text-ink-subtle">Not attempted yet</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-2xs font-medium',
              exhausted
                ? 'text-danger-600 dark:text-danger-300'
                : attemptsLeft === 1
                  ? 'text-warning-600 dark:text-warning-300'
                  : 'text-ink-subtle',
            )}
          >
            {passed ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <Clock className="h-3 w-3" aria-hidden="true" />}
            {exhausted
              ? 'No attempts remaining'
              : `${attemptsLeft} of ${quiz.attemptsAllowed} attempts left`}
          </span>
          <Link
            to={ROUTES.quizAttempt(quiz.id)}
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-brand-400"
          >
            {exhausted ? 'View attempts' : passed ? 'Retake' : quiz.attemptCount ? 'Continue' : 'Start quiz'}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

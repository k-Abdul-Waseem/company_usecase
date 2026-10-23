import { useMemo } from 'react';
import { cn } from '@/utils/cn';

/** Grid of question shortcuts showing answered, current and flagged state. */
export function QuestionNavigator({
  questions = [],
  answers = {},
  flagged = [],
  currentIndex = 0,
  onSelect,
  className,
}) {
  const flaggedIds = useMemo(() => new Set(flagged), [flagged]);

  return (
    <div className={cn('grid grid-cols-5 gap-1.5', className)} aria-label="Question navigator">
      {questions.map((question, index) => {
        const answered = Boolean(answers[question.id]);
        const current = index === currentIndex;
        const isFlagged = flaggedIds.has(question.id);
        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={current ? 'step' : undefined}
            aria-label={`Question ${index + 1}${answered ? ', answered' : ', unanswered'}${
              isFlagged ? ', flagged for review' : ''
            }`}
            className={cn(
              'relative flex h-9 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
              current
                ? 'border-brand-600 bg-brand-600 text-white'
                : answered
                  ? 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/15 dark:text-success-300'
                  : 'border-line bg-card text-ink-muted hover:bg-elevated hover:text-ink',
            )}
          >
            {index + 1}
            {isFlagged ? (
              <span
                className={cn(
                  'absolute right-1 top-1 h-1.5 w-1.5 rounded-full',
                  current ? 'bg-white' : 'bg-warning-500',
                )}
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

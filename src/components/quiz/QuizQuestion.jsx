import { Flag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Single-choice assessment question with a fieldset / radio group pattern. */
export function QuizQuestion({
  question,
  index,
  total,
  selectedOptionId,
  onSelect,
  flagged = false,
  onToggleFlag,
}) {
  if (!question) return null;

  return (
    <fieldset>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <legend className="sr-only">
          Question {index + 1} of {total}: {question.prompt}
        </legend>
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400">
            Question {index + 1} of {total}
          </span>
          {question.topic ? (
            <Badge tone="neutral" size="sm">
              {question.topic}
            </Badge>
          ) : null}
        </div>
        {onToggleFlag ? (
          <button
            type="button"
            onClick={() => onToggleFlag(question.id)}
            aria-pressed={flagged}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-2xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
              flagged
                ? 'border-warning-300 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-300'
                : 'border-line bg-card text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
            {flagged ? 'Flagged' : 'Flag'}
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-lg font-semibold leading-7 tracking-tight text-ink">
        {question.prompt}
      </p>

      <div className="mt-5 space-y-2.5" role="radiogroup" aria-label={`Options for question ${index + 1}`}>
        {question.options.map((option, optionIndex) => {
          const selected = selectedOptionId === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition duration-150',
                selected
                  ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500 dark:border-brand-500/60 dark:bg-brand-600/15'
                  : 'border-line bg-card hover:border-line-strong hover:bg-elevated/50',
              )}
            >
              <input
                type="radio"
                name="quiz-option"
                value={option.id}
                checked={selected}
                onChange={() => onSelect(option.id)}
                className="sr-only"
              />
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition',
                  selected
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line-strong bg-card text-ink-muted',
                )}
                aria-hidden="true"
              >
                {LETTERS[optionIndex] ?? optionIndex + 1}
              </span>
              <span className={cn('text-sm leading-6', selected ? 'font-medium text-ink' : 'text-ink-muted')}>
                {option.text}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

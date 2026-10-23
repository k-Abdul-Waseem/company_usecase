import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Suggested follow-up prompts shown before and after a conversation turn. */
export function SuggestedQuestions({ suggestions = [], onSelect, disabled = false, className }) {
  if (!suggestions.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {suggestions.map((suggestion, index) => {
        const isObject = typeof suggestion === 'object' && suggestion !== null;
        const text = isObject ? suggestion.text : suggestion;
        const category = isObject ? suggestion.category : null;
        return (
          <button
            key={isObject ? suggestion.id : `${text}-${index}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(text)}
            className="group inline-flex max-w-full items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-left text-xs font-medium text-ink-muted shadow-sm transition hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:pointer-events-none disabled:opacity-50 dark:hover:border-brand-500/30 dark:hover:bg-brand-600/10 dark:hover:text-brand-200"
          >
            {category ? (
              <span className="rounded bg-elevated px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-ink-subtle group-hover:text-brand-600">
                {category}
              </span>
            ) : null}
            <span className="line-clamp-2">{text}</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 opacity-40 transition group-hover:opacity-100"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

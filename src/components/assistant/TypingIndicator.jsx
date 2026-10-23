import { Loader2, Sparkles } from 'lucide-react';

/** Animated "searching approved content" state while the assistant responds. */
export function TypingIndicator() {
  return (
    <div className="flex gap-3" role="status" aria-label="Assistant is searching approved content">
      <span
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-sm"
        aria-hidden="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
      <div className="rounded-2xl rounded-tl-md border border-line bg-card px-4 py-3.5 shadow-soft">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          Searching approved project content
          <span className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1 w-1 animate-typing-dot rounded-full bg-brand-500"
                style={{ animationDelay: `${index * 160}ms` }}
              />
            ))}
          </span>
        </div>
        <div className="mt-3 space-y-2" aria-hidden="true">
          <div className="h-2 w-48 animate-pulse rounded bg-elevated" />
          <div className="h-2 w-60 animate-pulse rounded bg-elevated" />
          <div className="h-2 w-32 animate-pulse rounded bg-elevated" />
        </div>
      </div>
    </div>
  );
}

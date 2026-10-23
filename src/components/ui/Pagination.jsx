import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { clamp } from '@/utils/format';

function pageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const items = [1];
  if (page > 3) items.push('start-ellipsis');
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let current = start; current <= end; current += 1) items.push(current);
  if (page < totalPages - 2) items.push('end-ellipsis');
  items.push(totalPages);
  return items;
}

/** Pagination control with a result summary and compact page buttons. */
export function Pagination({
  page = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
  className,
  itemLabel = 'results',
}) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const currentPage = clamp(page, 1, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(total, currentPage * pageSize);
  const items = pageItems(currentPage, totalPages);

  const goTo = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return;
    onPageChange?.(nextPage);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 sm:flex-row',
        className,
      )}
    >
      <p className="text-xs text-ink-muted">
        Showing <span className="font-semibold tabular-nums text-ink">{from}</span>–
        <span className="font-semibold tabular-nums text-ink">{to}</span> of{' '}
        <span className="font-semibold tabular-nums text-ink">{total}</span> {itemLabel}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-card text-ink-muted transition hover:bg-elevated hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        {items.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => goTo(item)}
              aria-current={item === currentPage ? 'page' : undefined}
              className={cn(
                'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold tabular-nums transition',
                item === currentPage
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-card text-ink-muted hover:bg-elevated hover:text-ink',
              )}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              className="inline-flex h-8 w-8 items-center justify-center text-xs text-ink-subtle"
              aria-hidden="true"
            >
              …
            </span>
          ),
        )}
        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-card text-ink-muted transition hover:bg-elevated hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

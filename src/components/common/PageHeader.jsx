import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Standard page heading with optional breadcrumbs and right-aligned actions. */
export function PageHeader({ title, description, eyebrow, actions, breadcrumbs, className }) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-subtle">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? <ChevronRight className="h-3 w-3" aria-hidden="true" /> : null}
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="rounded font-medium transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn('font-medium', isLast ? 'text-ink-muted' : 'text-ink-subtle')}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-2xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

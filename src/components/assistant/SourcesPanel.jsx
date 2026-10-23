import { BookOpen, FileText, Layers, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const TYPE_META = {
  module: { icon: BookOpen, label: 'Module', tone: 'brand' },
  document: { icon: FileText, label: 'Document', tone: 'info' },
};

/** Right-hand evidence panel showing exactly what the answer is based on. */
export function SourcesPanel({ sources = [], className }) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-ink">Source references</h2>
          <p className="text-2xs text-ink-subtle">Every answer cites approved content</p>
        </div>
        <Badge tone="neutral" size="sm" icon={<Layers className="h-3 w-3" />}>
          {sources.length}
        </Badge>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-3">
        {sources.length ? (
          <ul className="space-y-2.5">
            {sources.map((source, index) => {
              const meta = TYPE_META[source.type] ?? TYPE_META.document;
              const Icon = meta.icon;
              return (
                <li
                  key={source.id ?? `${source.title}-${index}`}
                  className="rounded-xl border border-line bg-card p-3.5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-muted">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                          {index + 1}
                        </span>
                        <Badge tone={meta.tone} size="sm">
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-5 text-ink">{source.title}</p>
                      {source.reference ? (
                        <p className="mt-0.5 text-2xs text-ink-subtle">{source.reference}</p>
                      ) : null}
                    </div>
                  </div>
                  {source.excerpt ? (
                    <p className="mt-2.5 border-l-2 border-line pl-2.5 text-xs leading-5 text-ink-muted">
                      {source.excerpt}
                    </p>
                  ) : null}
                  {source.type === 'module' && source.moduleId ? (
                    <Link
                      to={ROUTES.learningModuleDetail(source.moduleId)}
                      className="mt-2.5 inline-flex items-center gap-1 rounded text-2xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
                    >
                      <Link2 className="h-3 w-3" aria-hidden="true" />
                      Open module
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No sources yet"
            description="Ask a question and the approved modules and documents used to answer it will be listed here."
            compact
          />
        )}
      </div>

      <div className="border-t border-line px-4 py-3">
        <p className="text-2xs leading-5 text-ink-subtle">
          Answers are generated only from indexed, approved project content. If a topic is not
          covered, the assistant will say so instead of guessing.
        </p>
      </div>
    </div>
  );
}

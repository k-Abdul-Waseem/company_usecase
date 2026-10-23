import { useState } from 'react';
import { Bot, BookOpen, Check, Copy, FileText, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';
import { RichText } from './RichText';

const SOURCE_ICONS = { module: BookOpen, document: FileText };

function SourceChips({ sources = [], onSelect }) {
  if (!sources.length) return null;
  return (
    <div className="mt-4 border-t border-line pt-3">
      <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
        Sources
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source, index) => {
          const Icon = SOURCE_ICONS[source.type] ?? FileText;
          return (
            <button
              key={source.id ?? `${source.title}-${index}`}
              type="button"
              onClick={() => onSelect?.()}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line bg-elevated/60 px-2 py-1 text-left text-2xs font-medium text-ink-muted transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:border-brand-500/30 dark:hover:bg-brand-600/15 dark:hover:text-brand-200"
              title={source.excerpt}
            >
              <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{index + 1}. {source.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A single turn in the assistant conversation. */
export function ChatMessage({ message, user, onSelectSources }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content ?? '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="mt-1 text-right text-2xs text-ink-subtle">
            You · <time dateTime={message.createdAt}>{formatRelativeTime(message.createdAt)}</time>
          </p>
        </div>
        <Avatar name={user?.name ?? 'You'} size="sm" className="mt-1" />
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <span
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-sm"
        aria-hidden="true"
      >
        <Bot className="h-4 w-4" />
      </span>
      <div className="min-w-0 max-w-[90%] flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold text-ink">Induction Assistant</p>
          <Badge tone="success" size="sm" icon={<ShieldCheck className="h-3 w-3" />}>
            Grounded
          </Badge>
        </div>
        <div
          className={cn(
            'rounded-2xl rounded-tl-md border px-4 py-3.5 shadow-soft',
            message.noAnswer
              ? 'border-warning-100 bg-warning-50/50 dark:border-warning-500/20 dark:bg-warning-500/5'
              : 'border-line bg-card',
          )}
        >
          <RichText content={message.content} />
          <SourceChips sources={message.sources} onSelect={() => onSelectSources?.(message)} />
        </div>
        <div className="mt-1 flex items-center gap-2 text-2xs text-ink-subtle">
          <time dateTime={message.createdAt}>{formatRelativeTime(message.createdAt)}</time>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:bg-elevated hover:text-ink"
            aria-label="Copy answer"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success-600" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * Accessible tabs with roving tabindex. Panels are rendered by the parent; this
 * component only owns the tab list semantics and keyboard interaction.
 */
export function Tabs({
  tabs = [],
  value,
  onChange,
  variant = 'underline',
  className,
  ariaLabel = 'Sections',
  size = 'md',
}) {
  const refs = useRef({});

  const focusTab = (index) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    const tab = tabs[nextIndex];
    if (!tab) return;
    refs.current[tab.id]?.focus();
    onChange(tab.id);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'underline' && 'border-b border-line',
        variant === 'pill' && 'rounded-xl border border-line bg-elevated/70 p-1',
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset',
              size === 'sm' ? 'text-xs' : 'text-sm',
              variant === 'underline' &&
                cn(
                  '-mb-px border-b-2 px-1 pb-2.5 pt-1',
                  size === 'sm' ? 'pb-2' : '',
                  active
                    ? 'border-brand-600 text-brand-700 dark:text-brand-300'
                    : 'border-transparent text-ink-muted hover:border-line-strong hover:text-ink',
                ),
              variant === 'pill' &&
                cn(
                  'rounded-lg',
                  size === 'sm' ? 'px-2.5 py-1.5' : 'px-3.5 py-2',
                  active
                    ? 'bg-card text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink',
                ),
            )}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-2xs font-semibold tabular-nums',
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200'
                    : 'bg-elevated text-ink-subtle',
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

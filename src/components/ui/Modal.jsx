import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLockBodyScroll } from '@/hooks/useUi';

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-6xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog with focus trapping, Escape handling and scroll lock.
 * Rendered in a portal so it always sits above the application shell.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  bodyClassName,
  initialFocusRef,
  closeOnBackdrop = true,
  hideClose = false,
}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  useLockBodyScroll(open);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;

    const focusTimer = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ??
        panel?.querySelector('[data-autofocus]') ??
        panel?.querySelector(FOCUSABLE);
      target?.focus?.();
    }, 20);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = [...panel.querySelectorAll(FOCUSABLE)].filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm"
        aria-hidden="true"
        onMouseDown={
          closeOnBackdrop
            ? (event) => {
                if (event.target === event.currentTarget) onClose?.();
              }
            : undefined
        }
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[92dvh] w-full animate-slide-up flex-col overflow-hidden rounded-t-2xl border border-line bg-card shadow-overlay outline-none sm:rounded-2xl',
          SIZES[size] ?? SIZES.md,
          className,
        )}
      >
        {title || !hideClose ? (
          <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div className="min-w-0">
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p id={descriptionId} className="mt-1 text-sm leading-6 text-ink-muted">
                  {description}
                </p>
              ) : null}
            </div>
            {!hideClose ? (
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 shrink-0 rounded-lg p-1.5 text-ink-subtle transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                aria-label="Close dialog"
              >
                <X className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-1 sm:px-6', bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : (
          <div className="h-4 sm:h-5" aria-hidden="true" />
        )}
      </div>
    </div>,
    document.body,
  );
}

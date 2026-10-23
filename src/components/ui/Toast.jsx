import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    accent: 'text-success-600',
    bar: 'bg-success-500',
  },
  error: {
    icon: XCircle,
    accent: 'text-danger-600',
    bar: 'bg-danger-500',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'text-warning-600',
    bar: 'bg-warning-500',
  },
  info: {
    icon: Info,
    accent: 'text-brand-600',
    bar: 'bg-brand-500',
  },
};

/** Fixed stack of transient notifications rendered by ToastProvider. */
export function ToastViewport({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-4 z-[95] flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end"
    >
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.variant] ?? VARIANTS.info;
        const Icon = variant.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 overflow-hidden rounded-xl border border-line bg-card p-3.5 shadow-overlay"
          >
            <span className={cn('mt-0.5 shrink-0', variant.accent)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-xs leading-5 text-ink-muted">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss?.(toast.id)}
              className="-m-1 rounded-md p-1 text-ink-subtle transition hover:bg-elevated hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

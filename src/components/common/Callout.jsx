import { AlertTriangle, CheckCircle2, Info, Lightbulb, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

const VARIANTS = {
  info: {
    icon: Info,
    container:
      'border-info-100 bg-info-50/70 text-info-700 dark:border-info-500/20 dark:bg-info-500/10 dark:text-info-200',
    iconClass: 'text-info-600 dark:text-info-300',
  },
  success: {
    icon: CheckCircle2,
    container:
      'border-success-100 bg-success-50/70 text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-200',
    iconClass: 'text-success-600 dark:text-success-300',
  },
  warning: {
    icon: AlertTriangle,
    container:
      'border-warning-100 bg-warning-50/70 text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-200',
    iconClass: 'text-warning-600 dark:text-warning-300',
  },
  danger: {
    icon: ShieldAlert,
    container:
      'border-danger-100 bg-danger-50/70 text-danger-700 dark:border-danger-500/20 dark:bg-danger-500/10 dark:text-danger-200',
    iconClass: 'text-danger-600 dark:text-danger-300',
  },
  brand: {
    icon: Lightbulb,
    container:
      'border-brand-100 bg-brand-50/70 text-brand-700 dark:border-brand-500/20 dark:bg-brand-600/10 dark:text-brand-200',
    iconClass: 'text-brand-600 dark:text-brand-300',
  },
};

/** Inline contextual message used for guidance and validation summaries. */
export function Callout({ variant = 'info', title, children, action, className, icon }) {
  const config = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = icon ?? config.icon;
  return (
    <div className={cn('rounded-xl border p-4', config.container, className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', config.iconClass)} style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {title ? <p className="text-sm font-semibold text-ink">{title}</p> : null}
          {children ? (
            <div className={cn('text-xs leading-5 text-ink-muted', title && 'mt-1')}>{children}</div>
          ) : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

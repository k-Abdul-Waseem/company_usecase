import { cn } from '@/utils/cn';

/** Base surface used across every screen. */
export function Card({ className, interactive = false, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-card shadow-soft',
        interactive &&
          'transition duration-200 ease-swift hover:-translate-y-0.5 hover:border-line-strong hover:shadow-elevated',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, as: Tag = 'h3', children, ...props }) {
  return (
    <Tag className={cn('text-base font-semibold tracking-tight text-ink', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm leading-6 text-ink-muted', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-3 border-t border-line px-5 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

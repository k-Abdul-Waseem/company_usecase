import { cn } from '@/utils/cn';

/** Scrollable table shell with the shared enterprise data-table styling. */
export function Table({ children, className, caption, containerClassName }) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-line bg-card',
        containerClassName,
      )}
    >
      <table className={cn('data-table min-w-full', className)}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function THead({ className, children, ...props }) {
  return (
    <thead className={cn('bg-elevated/60', className)} {...props}>
      {children}
    </thead>
  );
}

export function TBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-line', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TR({ className, children, ...props }) {
  return (
    <tr className={cn('transition-colors hover:bg-elevated/50', className)} {...props}>
      {children}
    </tr>
  );
}

export function TH({ className, children, scope = 'col', ...props }) {
  return (
    <th
      scope={scope}
      className={cn(
        'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({ className, children, ...props }) {
  return (
    <td className={cn('px-4 py-3.5 align-middle text-sm text-ink', className)} {...props}>
      {children}
    </td>
  );
}

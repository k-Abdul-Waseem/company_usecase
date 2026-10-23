import { Callout } from '@/components/common/Callout';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { cn } from '@/utils/cn';

const CALLOUT_TONES = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  brand: 'brand',
};

/** Renders one content block from an approved module. */
export function ModuleBlock({ block, className }) {
  if (!block) return null;

  switch (block.type) {
    case 'paragraph':
      return (
        <p className={cn('text-[0.9375rem] leading-7 text-ink-muted', className)}>{block.text}</p>
      );

    case 'bullets':
      return (
        <ul className={cn('space-y-2.5', className)}>
          {(block.items ?? []).map((item, index) => (
            <li key={index} className="flex gap-3 text-[0.9375rem] leading-7 text-ink-muted">
              <span
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className={cn('space-y-3', className)}>
          {(block.items ?? []).map((item, index) => (
            <li key={index} className="flex gap-3 text-[0.9375rem] leading-7 text-ink-muted">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case 'callout':
      return (
        <Callout
          variant={CALLOUT_TONES[block.tone] ?? 'info'}
          title={block.title}
          className={className}
        >
          {block.text}
        </Callout>
      );

    case 'table':
      return (
        <div className={cn('space-y-2', className)}>
          <Table caption={block.caption} containerClassName="shadow-none">
            <THead>
              <TR>
                {(block.headers ?? []).map((header) => (
                  <TH key={header}>{header}</TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {(block.rows ?? []).map((row, rowIndex) => (
                <TR key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TD
                      key={cellIndex}
                      className={cellIndex === 0 ? 'font-medium text-ink' : 'text-ink-muted'}
                    >
                      {cell}
                    </TD>
                  ))}
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      );

    case 'quote':
      return (
        <blockquote
          className={cn(
            'rounded-r-xl border-l-4 border-brand-500 bg-brand-50/50 py-4 pl-5 pr-4 dark:bg-brand-600/10',
            className,
          )}
        >
          <p className="text-[0.9375rem] italic leading-7 text-ink">{block.text}</p>
          {block.author ? (
            <footer className="mt-2 text-xs font-medium text-ink-muted">— {block.author}</footer>
          ) : null}
        </blockquote>
      );

    case 'code':
      return (
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm',
            className,
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
            <span className="text-2xs font-semibold uppercase tracking-wide text-slate-400">
              {block.language ?? 'shell'}
            </span>
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
            </span>
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-6 text-slate-200">
            <code>{block.code}</code>
          </pre>
        </div>
      );

    default:
      return block.text ? (
        <p className={cn('text-[0.9375rem] leading-7 text-ink-muted', className)}>{block.text}</p>
      ) : null;
  }
}

/** Renders an ordered list of blocks from a module section. */
export function ModuleBlocks({ blocks = [] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <ModuleBlock key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}

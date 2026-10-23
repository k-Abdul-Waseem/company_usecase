import { cn } from '@/utils/cn';

function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={key}
          className="rounded bg-elevated px-1 py-0.5 font-mono text-[0.8125rem] text-ink"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function buildBlocks(content) {
  const lines = String(content ?? '').split('\n');
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list && list.items.length) blocks.push(list);
    list = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    const bullet = trimmed.match(/^[•\-*]\s+(.*)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (bullet) {
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(bullet[1]);
      return;
    }
    if (ordered) {
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(ordered[1]);
      return;
    }
    flushList();
    blocks.push({ type: 'p', text: trimmed });
  });
  flushList();
  return blocks;
}

/**
 * Minimal, safe rich-text renderer for assistant answers. Supports paragraphs,
 * bullet and numbered lists plus inline bold / code without an HTML parser.
 */
export function RichText({ content, className }) {
  const blocks = buildBlocks(content);

  return (
    <div className={cn('space-y-3 text-sm leading-6 text-ink-muted', className)}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'ul') {
          return (
            <ul key={`ul-${blockIndex}`} className="space-y-1.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-2.5">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                    aria-hidden="true"
                  />
                  <span>{renderInline(item, `ul-${blockIndex}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={`ol-${blockIndex}`} className="space-y-1.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-elevated text-2xs font-semibold text-ink-muted">
                    {itemIndex + 1}
                  </span>
                  <span>{renderInline(item, `ol-${blockIndex}-${itemIndex}`)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={`p-${blockIndex}`}>{renderInline(block.text, `p-${blockIndex}`)}</p>
        );
      })}
    </div>
  );
}

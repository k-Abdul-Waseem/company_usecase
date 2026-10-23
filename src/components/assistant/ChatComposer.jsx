import { useEffect, useRef, useState } from 'react';
import { CornerDownLeft, Send, Sparkles } from 'lucide-react';
import { MAX_MESSAGE_LENGTH } from '@/constants/app';
import { cn } from '@/utils/cn';

/** Auto-growing composer with Enter to send and Shift+Enter for a new line. */
export function ChatComposer({ onSubmit, isTyping = false, disabled = false, placeholder }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, [value]);

  const canSend = value.trim().length >= 2 && !isTyping && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSubmit(value.trim());
    setValue('');
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-2.5 shadow-soft transition focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-600/15 dark:focus-within:border-brand-500/40">
      <label htmlFor="assistant-composer" className="sr-only">
        Ask the induction assistant a question
      </label>
      <textarea
        id="assistant-composer"
        ref={textareaRef}
        rows={1}
        value={value}
        maxLength={MAX_MESSAGE_LENGTH}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder ?? 'Ask about access, security, the codebase, testing or your learning path…'
        }
        disabled={disabled}
        className="max-h-40 w-full resize-none bg-transparent px-2.5 py-2 text-sm leading-6 text-ink outline-none placeholder:text-ink-subtle disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between gap-3 px-1.5 pb-0.5">
        <p className="hidden items-center gap-1.5 text-2xs text-ink-subtle sm:flex">
          <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
          Enter to send · Shift + Enter for a new line
        </p>
        <div className="ml-auto flex items-center gap-3">
          <span
            className={cn(
              'text-2xs tabular-nums',
              value.length > MAX_MESSAGE_LENGTH - 100 ? 'text-warning-600' : 'text-ink-subtle',
            )}
          >
            {value.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
          >
            {isTyping ? (
              <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {isTyping ? 'Answering…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

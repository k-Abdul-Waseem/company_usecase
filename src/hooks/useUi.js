import { useCallback, useEffect, useRef, useState } from 'react';

/** Calls `handler` when a pointer event happens outside the referenced node. */
export function useOnClickOutside(ref, handler, active = true) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!active) return undefined;
    const listener = (event) => {
      const node = ref.current;
      if (!node || node.contains(event.target)) return;
      handlerRef.current(event);
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [ref, active]);
}

/** Simple boolean toggle helper. */
export function useToggle(initial = false) {
  const [value, setValue] = useState(Boolean(initial));
  const toggle = useCallback(() => setValue((current) => !current), []);
  return [value, setValue, toggle];
}

/** Locks body scrolling while a dialog or drawer is open. */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

/** Sets the document title for the active page. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | AI Assisted Project Induction Platform`
      : 'AI Assisted Project Induction Platform';
  }, [title]);
}

/** Tracks reading progress as a percentage of the scrollable document. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(100);
        return;
      }
      setProgress(Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100))));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return progress;
}

/** Binds a key combination (with optional modifier) to a callback. */
export function useHotkey(key, handler, options = {}) {
  const { meta = false, alt = false, shift = false, enabled = true } = options;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event) => {
      const modifierMatches = meta
        ? event.metaKey || event.ctrlKey
        : !event.metaKey && !event.ctrlKey;
      if (
        modifierMatches &&
        event.altKey === alt &&
        event.shiftKey === shift &&
        event.key.toLowerCase() === key.toLowerCase()
      ) {
        event.preventDefault();
        handlerRef.current(event);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, meta, alt, shift, enabled]);
}

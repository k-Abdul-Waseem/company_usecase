import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { createId } from '@/utils/random';
import { ToastViewport } from '@/components/ui/Toast';

export const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 4200;
const MAX_VISIBLE = 4;

/**
 * Lightweight toast system used for all mutation feedback. Implemented locally
 * to keep the dependency surface inside the constraints of the project.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (options) => {
      const id = createId('toast');
      const next = {
        id,
        title: options.title ?? 'Done',
        description: options.description ?? '',
        variant: options.variant ?? 'info',
        duration: options.duration ?? AUTO_DISMISS_MS,
      };
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), next]);
      if (next.duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), next.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      push,
      success: (title, description) => push({ title, description, variant: 'success' }),
      error: (title, description) => push({ title, description, variant: 'error' }),
      info: (title, description) => push({ title, description, variant: 'info' }),
      warning: (title, description) => push({ title, description, variant: 'warning' }),
    }),
    [push],
  );

  const value = useMemo(() => ({ toast, toasts, dismiss }), [toast, toasts, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

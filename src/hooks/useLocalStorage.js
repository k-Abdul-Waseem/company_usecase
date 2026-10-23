import { useCallback, useEffect, useState } from 'react';
import { readJson, writeJson } from '@/utils/storage';

/** Persisted state backed by localStorage, resilient to unavailable storage. */
export function useLocalStorage(key, initialValue) {
  const [value, setValueState] = useState(() => {
    const stored = readJson(key, undefined);
    if (stored !== undefined) return stored;
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    writeJson(key, value);
  }, [key, value]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== key || event.newValue === null) return;
      try {
        setValueState(JSON.parse(event.newValue));
      } catch {
        /* ignore malformed external writes */
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  const setValue = useCallback((next) => {
    setValueState((current) => (typeof next === 'function' ? next(current) : next));
  }, []);

  return [value, setValue];
}

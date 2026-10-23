import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks a CSS media query.
 *
 * `useSyncExternalStore` keeps the value in step with the browser without
 * mirroring it into component state, so there is no effect-driven render pass.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async service call and exposes a consistent loading / error / success
 * state. The task is stored in a ref so callers can pass inline functions
 * without causing an infinite render loop.
 */
export function useAsync(task, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options;
  const [status, setStatus] = useState(immediate ? 'loading' : 'idle');
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const taskRef = useRef(task);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  useEffect(() => {
    taskRef.current = task;
  });

  const run = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setStatus('loading');
    setError(null);
    try {
      const result = await taskRef.current();
      if (mountedRef.current && requestRef.current === requestId) {
        setData(result);
        setStatus('success');
      }
      return result;
    } catch (caught) {
      if (mountedRef.current && requestRef.current === requestId) {
        setError(caught);
        setStatus('error');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!immediate) return undefined;
    // The request is deferred by a tick so that the status update never lands
    // synchronously inside the effect body, which would trigger a cascading
    // render on every mount.
    const timer = window.setTimeout(() => {
      run();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, revision, immediate, ...deps]);

  const reload = useCallback(() => setRevision((current) => current + 1), []);

  return {
    status,
    data,
    error,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    reload,
    run,
    setData,
  };
}

import { useEffect, useRef, useState } from 'react';
import { AlarmClock, Timer } from 'lucide-react';
import { formatClock } from '@/utils/date';
import { cn } from '@/utils/cn';

/** Countdown clock that fires once when the attempt time is exhausted. */
export function QuizTimer({
  durationMinutes = 10,
  onExpire,
  onTimeChange,
  className,
  paused = false,
}) {
  const [remaining, setRemaining] = useState(durationMinutes * 60);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const onTimeChangeRef = useRef(onTimeChange);

  useEffect(() => {
    onExpireRef.current = onExpire;
    onTimeChangeRef.current = onTimeChange;
  });

  useEffect(() => {
    onTimeChangeRef.current?.(remaining);
  }, [remaining]);

  useEffect(() => {
    if (paused) return undefined;
    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [paused]);

  const urgent = remaining <= 60;
  const warning = remaining <= 180;

  return (
    <div
      role="timer"
      aria-live={urgent ? 'assertive' : 'off'}
      aria-label={`Time remaining ${formatClock(remaining)}`}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold tabular-nums',
        urgent
          ? 'border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-300'
          : warning
            ? 'border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-300'
            : 'border-line bg-card text-ink',
        className,
      )}
    >
      {urgent ? (
        <AlarmClock className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Timer className="h-4 w-4 text-ink-muted" aria-hidden="true" />
      )}
      {formatClock(remaining)}
    </div>
  );
}

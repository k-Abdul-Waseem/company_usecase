import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useUi';
import { useToast } from '@/hooks/useToast';
import { notificationService } from '@/services/notifications/notificationService';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/cn';

/** Header inbox with unread state and mark-all-read behaviour. */
export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const containerRef = useRef(null);
  const { toast } = useToast();
  useOnClickOutside(containerRef, () => setOpen(false), open);

  useEffect(() => {
    let active = true;
    notificationService
      .list()
      .then((next) => {
        if (active) setItems(next);
      })
      .catch(() => {
        /* notification failures should never break the shell */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const unread = items.filter((item) => !item.read).length;

  const markAll = async () => {
    setBusy(true);
    try {
      const next = await notificationService.markAllRead();
      setItems(next);
      toast.success('Inbox cleared', 'All notifications marked as read.');
    } catch (error) {
      toast.error('Could not update notifications', error?.message);
    } finally {
      setBusy(false);
    }
  };

  const markOne = async (item) => {
    if (item.read) return;
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    try {
      const next = await notificationService.markRead(item.id);
      setItems(next);
    } catch {
      /* keep optimistic state; refresh on next open */
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-ink-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        <Bell className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
        {unread ? (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[0.5625rem] font-bold leading-none text-white ring-2 ring-surface">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-x-3 top-[4.25rem] z-50 animate-scale-in overflow-hidden rounded-xl border border-line bg-card shadow-overlay sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem]">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-2xs text-ink-subtle">
                {unread ? `${unread} unread update${unread === 1 ? '' : 's'}` : 'You are all caught up'}
              </p>
            </div>
            <button
              type="button"
              onClick={markAll}
              disabled={busy || unread === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-2xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40 dark:text-brand-300 dark:hover:bg-brand-600/15"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all read
            </button>
          </div>

          <div className="max-h-[24rem] overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-elevated" />
                    <div className="h-2.5 w-full animate-pulse rounded bg-elevated" />
                  </div>
                ))}
              </div>
            ) : items.length ? (
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => markOne(item)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-elevated/60',
                        !item.read && 'bg-brand-50/40 dark:bg-brand-600/5',
                      )}
                    >
                      <span className="mt-1.5 shrink-0" aria-hidden="true">
                        <Circle
                          className={cn(
                            'h-2 w-2',
                            item.read ? 'fill-line-strong text-line-strong' : 'fill-brand-500 text-brand-500',
                          )}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-ink">{item.title}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-ink-muted">
                          {item.description}
                        </span>
                        <span className="mt-1 block text-2xs text-ink-subtle">
                          {formatRelativeTime(item.occurredAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-10 text-center text-xs text-ink-muted">
                No notifications right now.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

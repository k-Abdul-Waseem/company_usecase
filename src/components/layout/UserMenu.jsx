import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  LogOut,
  RefreshCw,
  Settings,
  UserRound,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { DEMO_ACCOUNTS, LEARNING_ROLE_LABELS, ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useOnClickOutside } from '@/hooks/useUi';
import { usePreferences } from '@/hooks/usePreferences';
import { useToast } from '@/hooks/useToast';
import { isMockMode } from '@/services/api';
import { cn } from '@/utils/cn';

/** Identity menu with theme-independent profile actions and demo switching. */
export function UserMenu() {
  const { logout, switchDemoIdentity } = useAuth();
  const { effectiveUser } = usePreferences();
  const user = effectiveUser;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false), open);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  const handleSwitch = async (account) => {
    if (account.email === user?.email) {
      setOpen(false);
      return;
    }
    setBusyId(account.id);
    try {
      await switchDemoIdentity(account.email);
      toast.success('Demo identity switched', `You are now signed in as ${account.label}.`);
      setOpen(false);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      toast.error('Could not switch identity', error?.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-transparent px-1 py-1 transition hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        <Avatar name={user?.name} size="sm" />
        <span className="hidden min-w-0 text-left md:block">
          <span className="block max-w-[9rem] truncate text-xs font-semibold text-ink">
            {user?.name}
          </span>
          <span className="block max-w-[9rem] truncate text-2xs text-ink-subtle">
            {user?.title}
          </span>
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-ink-subtle md:block" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[19rem] animate-scale-in overflow-hidden rounded-xl border border-line bg-card shadow-overlay"
        >
          <div className="border-b border-line px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="brand" size="sm">
                {ROLE_LABELS[user?.role] ?? 'Member'}
              </Badge>
              {user?.learningRole ? (
                <Badge tone="accent" size="sm">
                  {LEARNING_ROLE_LABELS[user.learningRole]}
                </Badge>
              ) : null}
              <Badge tone="outline" size="sm">
                {user?.projectName}
              </Badge>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              to={ROUTES.settings}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-muted transition hover:bg-elevated hover:text-ink"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Profile & preferences
            </Link>
            <Link
              to={ROUTES.settings}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-muted transition hover:bg-elevated hover:text-ink"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink-muted transition hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-500/10 dark:hover:text-danger-300"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>

          {isMockMode ? (
            <div className="border-t border-line p-1.5">
              <p className="flex items-center gap-1.5 px-2.5 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                Switch demo identity
              </p>
              {DEMO_ACCOUNTS.map((account) => {
                const current = account.email === user?.email;
                return (
                  <button
                    key={account.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSwitch(account)}
                    disabled={Boolean(busyId)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition disabled:opacity-60',
                      current
                        ? 'bg-elevated text-ink'
                        : 'text-ink-muted hover:bg-elevated hover:text-ink',
                    )}
                  >
                    <Avatar name={account.label} size="xs" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{account.label}</span>
                      <span className="block truncate text-2xs text-ink-subtle">
                        {account.description}
                      </span>
                    </span>
                    {busyId === account.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : current ? (
                      <Check className="h-3.5 w-3.5 text-brand-600" aria-label="Current identity" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

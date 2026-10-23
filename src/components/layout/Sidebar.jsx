import { Link, NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { BrandMark } from '@/components/common/BrandMark';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { NAVIGATION_ITEMS, SECONDARY_NAVIGATION_ITEMS } from '@/constants/navigation';
import { ROLE_LABELS, LEARNING_ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { isMockMode } from '@/services/api';
import { cn } from '@/utils/cn';

function SidebarLink({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.path}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'sidebar-link',
            isActive && 'sidebar-link-active',
            collapsed && 'justify-center px-0',
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn('h-[1.125rem] w-[1.125rem] shrink-0', isActive && 'text-brand-600 dark:text-brand-300')}
              aria-hidden="true"
            />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
            {isActive && !collapsed ? (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            ) : null}
            {collapsed ? <span className="sr-only">{item.label}</span> : null}
          </>
        )}
      </NavLink>
    </li>
  );
}

/** Persistent role-aware navigation rail with desktop collapse and mobile drawer. */
export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  user,
  onLogout,
}) {
  const primaryItems = NAVIGATION_ITEMS.filter((item) => item.roles.includes(user?.role));
  const secondaryItems = SECONDARY_NAVIGATION_ITEMS.filter((item) =>
    item.roles.includes(user?.role),
  );

  const content = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-line px-4',
          collapsed ? 'justify-center px-2' : 'justify-between',
        )}
      >
        <Link
          to={ROUTES.dashboard}
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          aria-label="Induction Platform home"
        >
          <BrandMark size="md" showText={!collapsed} showSubtitle={false} />
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-ink-subtle transition hover:bg-elevated hover:text-ink lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4"
      >
        {!collapsed ? (
          <p className="mb-2 px-3 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Workspace
          </p>
        ) : null}
        <ul className="space-y-1">
          {primaryItems.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              collapsed={collapsed}
              onNavigate={onCloseMobile}
            />
          ))}
        </ul>

        <div className={cn('mt-5 border-t border-line pt-4', collapsed && 'mt-4')}>
          {!collapsed ? (
            <p className="mb-2 px-3 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              Account
            </p>
          ) : null}
          <ul className="space-y-1">
            {secondaryItems.map((item) => (
              <SidebarLink
                key={item.id}
                item={item}
                collapsed={collapsed}
                onNavigate={onCloseMobile}
              />
            ))}
            <li>
              <button
                type="button"
                onClick={onLogout}
                title={collapsed ? 'Sign out' : undefined}
                className={cn(
                  'sidebar-link w-full text-left hover:text-danger-600 dark:hover:text-danger-300',
                  collapsed && 'justify-center px-0',
                )}
              >
                <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
                {!collapsed ? <span>Sign out</span> : <span className="sr-only">Sign out</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        {!collapsed ? (
          <div className="rounded-xl border border-line bg-elevated/50 p-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={user?.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{user?.name}</p>
                <p className="truncate text-2xs text-ink-subtle">{user?.projectName}</p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              <Badge tone="brand" size="sm">
                {ROLE_LABELS[user?.role] ?? 'Member'}
              </Badge>
              {user?.learningRole ? (
                <Badge tone="neutral" size="sm">
                  {LEARNING_ROLE_LABELS[user.learningRole]}
                </Badge>
              ) : null}
            </div>
            {isMockMode ? (
              <p className="mt-2.5 text-2xs leading-4 text-ink-subtle">
                Demo workspace · data stays in this browser
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar name={user?.name} size="sm" />
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            'mt-2 hidden w-full items-center gap-2 rounded-lg px-2.5 py-2 text-2xs font-medium text-ink-subtle transition hover:bg-elevated hover:text-ink lg:flex',
            collapsed ? 'justify-center px-0' : 'justify-between',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <span className="inline-flex items-center gap-2">
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                Collapse sidebar
              </span>
              <ChevronLeft className="h-3 w-3" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-line bg-card transition-[width] duration-200 ease-swift lg:block',
          collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        )}
        aria-label="Sidebar"
      >
        {content}
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[17rem] border-r border-line bg-card shadow-overlay transition-transform duration-200 ease-swift lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        {content}
      </aside>
    </>
  );
}

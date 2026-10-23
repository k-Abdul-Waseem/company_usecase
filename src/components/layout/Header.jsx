import { Link } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { BrandMark } from '@/components/common/BrandMark';
import { NotificationsMenu } from './NotificationsMenu';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { ROUTES } from '@/constants/routes';

/** Sticky application header: navigation controls, search and account actions. */
export function Header({ collapsed, onToggleCollapsed, onOpenMobile, onOpenSearch }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/85 px-3 backdrop-blur-md sm:px-5">
      <button
        type="button"
        onClick={onOpenMobile}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onToggleCollapsed}
        className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:inline-flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
        )}
      </button>

      <Link
        to={ROUTES.dashboard}
        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:hidden"
        aria-label="Induction Platform home"
      >
        <BrandMark size="sm" showText={false} />
      </Link>

      <div className="ml-1 flex flex-1 items-center justify-end gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="group flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-2.5 text-xs text-ink-subtle shadow-sm transition hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:w-64 sm:justify-start sm:px-3 lg:w-72"
          aria-label="Search workspace"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden min-w-0 flex-1 truncate text-left sm:block">
            Search modules, learners, content…
          </span>
          <kbd className="hidden shrink-0 rounded border border-line bg-elevated px-1.5 py-0.5 font-sans text-2xs font-medium text-ink-subtle sm:block">
            Ctrl K
          </kbd>
        </button>

        <div className="mx-0.5 hidden h-5 w-px bg-line sm:block" aria-hidden="true" />

        <NotificationsMenu />
        <ThemeToggle />
        <div className="ml-0.5">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import { useHotkey } from '@/hooks/useUi';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePreferences } from '@/hooks/usePreferences';
import { STORAGE_KEYS } from '@/constants/storage';
import { APP_CONFIG } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

/** Application shell shared by every authenticated route. */
export function DashboardLayout() {
  const { logout } = useAuth();
  const { effectiveUser } = usePreferences();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useLocalStorage(STORAGE_KEYS.sidebarCollapsed, false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useHotkey('k', () => setSearchOpen(true), { meta: true });
  useHotkey('/', () => setSearchOpen(true), { enabled: false });

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar
        collapsed={Boolean(collapsed)}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        user={effectiveUser}
        onLogout={handleLogout}
      />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-200 ease-swift',
          collapsed ? 'lg:pl-sidebar-collapsed' : 'lg:pl-sidebar',
        )}
      >
        <Header
          collapsed={Boolean(collapsed)}
          onToggleCollapsed={() => setCollapsed((current) => !current)}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-content flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>

        <footer className="mx-auto w-full max-w-content px-4 pb-6 text-2xs text-ink-subtle sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p>{APP_CONFIG.copyright}</p>
            <p className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-success-500"
                aria-hidden="true"
              />
              Secure project workspace · {effectiveUser?.projectName ?? APP_CONFIG.organization}
            </p>
          </div>
        </footer>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

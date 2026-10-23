import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX, ShieldAlert } from 'lucide-react';
import { BrandMark } from '@/components/common/BrandMark';
import { Button, buttonStyles } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';

/** Shared full-page state used for 401, 404 and other dead ends. */
export function StatusPage({
  code,
  title,
  description,
  icon: Icon = SearchX,
  primaryTo = ROUTES.dashboard,
  primaryLabel = 'Back to dashboard',
  secondaryTo,
  secondaryLabel,
}) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6">
        <Link to={isAuthenticated ? ROUTES.dashboard : ROUTES.login} aria-label="Induction Platform home">
          <BrandMark size="md" showSubtitle={false} />
        </Link>
        <span className="text-2xs text-ink-subtle">{APP_CONFIG.organization}</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-2xl bg-brand-50 dark:bg-brand-600/15" aria-hidden="true" />
            <Icon className="relative h-9 w-9 text-brand-600 dark:text-brand-300" aria-hidden="true" />
          </div>
          <p className="mt-6 text-2xs font-semibold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
            Error {code}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">{description}</p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {isAuthenticated ? (
              <Link to={primaryTo} className={buttonStyles({ variant: 'primary', size: 'md' })}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {primaryLabel}
              </Link>
            ) : (
              <Link to={ROUTES.login} className={buttonStyles({ variant: 'primary', size: 'md' })}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Go to sign in
              </Link>
            )}
            {secondaryTo ? (
              <Link to={secondaryTo} className={buttonStyles({ variant: 'outline', size: 'md' })}>
                {secondaryLabel}
              </Link>
            ) : null}
          </div>

          <div className="mx-auto mt-10 flex max-w-sm items-start gap-2.5 rounded-xl border border-line bg-card p-3.5 text-left">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            <p className="text-2xs leading-5 text-ink-muted">
              If you believe you reached this page in error, contact your learning program manager
              or raise a service desk request quoting reference {code}.
            </p>
          </div>
        </div>
      </main>

      <footer className="pb-6 text-center text-2xs text-ink-subtle">{APP_CONFIG.copyright}</footer>
    </div>
  );
}

/** Convenience wrapper for unauthenticated user feedback in the design system. */
export function StatusButton({ children, ...props }) {
  return <Button {...props}>{children}</Button>;
}

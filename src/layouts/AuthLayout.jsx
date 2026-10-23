import { Link, Outlet } from 'react-router-dom';
import { Bot, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { BrandMark } from '@/components/common/BrandMark';
import { BRAND, LOGIN_HERO_POINTS } from '@/constants/navigation';
import { APP_CONFIG } from '@/constants/app';

/** Split-screen shell used by sign-in and other unauthenticated screens. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-accent-700 p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate opacity-20" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <BrandMark size="lg" inverted showSubtitle title="Induction Platform" subtitle={BRAND.organization} />
        </div>

        <div className="relative max-w-lg">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Secure enterprise onboarding
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.15] tracking-tight xl:text-[2.75rem]">
            {BRAND.tagline}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            A single, governed workspace for project induction: role-aware learning paths, an AI
            assistant grounded in approved content, and readiness evidence managers can trust.
          </p>

          <ul className="mt-8 space-y-4">
            {LOGIN_HERO_POINTS.map((point) => (
              <li key={point.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-sm">
                  <point.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{point.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/60">{point.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 border-t border-white/10 pt-5 text-2xs text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            96 learners onboarded
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5" aria-hidden="true" />
            100% sourced answers
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {BRAND.organization}
          </span>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 lg:hidden">
          <Link to="/login" aria-label="Induction Platform sign in">
            <BrandMark size="sm" showSubtitle={false} />
          </Link>
          <span className="text-2xs text-ink-subtle">{BRAND.organization}</span>
        </div>

        <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>

        <footer className="px-5 pb-6 text-center text-2xs text-ink-subtle">
          {APP_CONFIG.copyright}
        </footer>
      </div>
    </div>
  );
}

import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatLongDate } from '@/utils/date';
import { BRAND } from '@/constants/navigation';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Gradient hero shown at the top of both role dashboards. */
export function WelcomeBanner({ user, eyebrow, title, description, actions, stats, className }) {
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white shadow-elevated sm:p-7',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-accent-400/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {eyebrow ?? `${formatLongDate()} · ${BRAND.organization}`}
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            {title ?? `${greeting()}, ${firstName}`}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
            {description ??
              'Your induction workspace brings approved content, grounded answers and readiness evidence into one place.'}
          </p>
          {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
        </div>

        {stats?.length ? (
          <dl className="grid shrink-0 grid-cols-3 gap-3 sm:gap-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur-sm"
              >
                <dt className="text-2xs font-medium uppercase tracking-wide text-white/60">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

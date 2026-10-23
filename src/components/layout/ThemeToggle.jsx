import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

/** Binary light/dark toggle with a persisted preference. */
export function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-ink-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} aria-hidden="true" />
      )}
    </button>
  );
}

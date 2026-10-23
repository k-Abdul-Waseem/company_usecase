import { DEFAULT_MODULE_ICON, MODULE_ICONS } from '@/constants/modules';
import { cn } from '@/utils/cn';

const TONES = {
  common: 'bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300',
  developer: 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300',
  tester: 'bg-info-50 text-info-600 dark:bg-info-500/15 dark:text-info-300',
};

const SIZES = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-xl',
  xl: 'h-14 w-14 rounded-2xl',
};

/** Maps the icon registry key delivered by the service to a styled tile. */
export function ModuleIcon({ icon, category = 'common', size = 'md', className }) {
  const Icon = MODULE_ICONS[icon] ?? DEFAULT_MODULE_ICON;
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'xl' ? 'h-6 w-6' : 'h-5 w-5';
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center',
        TONES[category] ?? TONES.common,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      aria-hidden="true"
    >
      <Icon className={iconSize} strokeWidth={1.9} />
    </span>
  );
}

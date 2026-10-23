import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

const SIZES = {
  xs: 'h-7 w-7 text-[0.625rem]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const PALETTES = [
  'bg-brand-100 text-brand-700 dark:bg-brand-600/25 dark:text-brand-200',
  'bg-accent-100 text-accent-700 dark:bg-accent-500/25 dark:text-accent-200',
  'bg-success-100 text-success-700 dark:bg-success-500/25 dark:text-success-200',
  'bg-warning-100 text-warning-700 dark:bg-warning-500/25 dark:text-warning-200',
  'bg-info-100 text-info-700 dark:bg-info-500/25 dark:text-info-200',
  'bg-danger-100 text-danger-700 dark:bg-danger-500/25 dark:text-danger-200',
];

function paletteFor(name = '') {
  const total = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return PALETTES[total % PALETTES.length];
}

/** Identity chip that falls back to deterministic initials. */
export function Avatar({ name = '', src, size = 'md', className, ring = false, ...props }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
        SIZES[size] ?? SIZES.md,
        !src && paletteFor(name),
        ring && 'ring-2 ring-card',
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      {!src && name ? <span className="sr-only">{name}</span> : null}
    </span>
  );
}

/** Overlapping avatar group used in collaborator / cohort displays. */
export function AvatarGroup({ people = [], max = 4, size = 'sm', className }) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-2">
        {visible.map((person) => (
          <Avatar
            key={person.id ?? person.name}
            name={person.name}
            src={person.avatarUrl}
            size={size}
            ring
          />
        ))}
        {overflow > 0 ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-ink-muted ring-2 ring-card">
            +{overflow}
          </span>
        ) : null}
      </div>
    </div>
  );
}

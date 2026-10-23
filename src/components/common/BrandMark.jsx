import brandMark from '@/assets/brand-mark.svg';
import { BRAND } from '@/constants/navigation';
import { cn } from '@/utils/cn';

const SIZES = {
  sm: { image: 'h-8 w-8 rounded-lg', title: 'text-sm', subtitle: 'text-2xs' },
  md: { image: 'h-9 w-9 rounded-xl', title: 'text-sm', subtitle: 'text-xs' },
  lg: { image: 'h-11 w-11 rounded-2xl', title: 'text-base', subtitle: 'text-xs' },
  xl: { image: 'h-14 w-14 rounded-2xl', title: 'text-xl', subtitle: 'text-sm' },
};

/** Product lockup used in the sidebar, auth screen and print views. */
export function BrandMark({
  size = 'md',
  showText = true,
  inverted = false,
  showSubtitle = false,
  className,
  title,
  subtitle,
}) {
  const scale = SIZES[size] ?? SIZES.md;
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src={brandMark}
        alt=""
        className={cn('shrink-0 shadow-sm', scale.image)}
        width={44}
        height={44}
      />
      {showText ? (
        <div className="min-w-0">
          <p
            className={cn(
              'truncate font-semibold leading-tight tracking-tight',
              scale.title,
              inverted ? 'text-white' : 'text-ink',
            )}
          >
            {title ?? 'Induction Platform'}
          </p>
          {showSubtitle ? (
            <p
              className={cn(
                'truncate leading-tight',
                scale.subtitle,
                inverted ? 'text-white/60' : 'text-ink-subtle',
              )}
            >
              {subtitle ?? BRAND.organization}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

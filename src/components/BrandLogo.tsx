import React from 'react';

export type BrandLogoVariant = 'full' | 'compact' | 'mark' | 'wordmark';
export type BrandLogoSize = 'sm' | 'md' | 'lg';
export type BrandLogoContext = 'navbar' | 'footer' | 'auth' | 'hero' | 'general';

export interface BrandLogoProps {
  /**
   * - 'full': Symbol + CAMPUSLAB + "New Generation" tagline
   * - 'compact': Symbol + CAMPUSLAB
   * - 'mark': Symbol only
   * - 'wordmark': CAMPUSLAB typography only
   * @default 'compact'
   */
  variant?: BrandLogoVariant;
  /**
   * - 'sm': ~28-30px mark height
   * - 'md': ~34-36px mark height (navbar default)
   * - 'lg': ~48-52px mark height (auth / hero default)
   * @default 'md'
   */
  size?: BrandLogoSize;
  /** Context hint to auto-tune sizing and tagline visibility */
  context?: BrandLogoContext;
  /** Explicitly toggle tagline visibility (overrides variant / context default) */
  showTagline?: boolean;
  /** Custom className applied to the root container */
  className?: string;
  /** Accessible alt text for the brand mark */
  alt?: string;
}

const SIZE_CONFIG: Record<
  BrandLogoSize,
  {
    markHeight: string;
    markWidth: string;
    gap: string;
    titleSize: string;
    taglineSize: string;
  }
> = {
  sm: {
    markHeight: 'h-7',
    markWidth: 'w-auto',
    gap: 'gap-2',
    titleSize: 'text-[12px] sm:text-[13px]',
    taglineSize: 'text-[7px]',
  },
  md: {
    markHeight: 'h-[34px] sm:h-9',
    markWidth: 'w-auto',
    gap: 'gap-2.5',
    titleSize: 'text-[14px] sm:text-[15px]',
    taglineSize: 'text-[8px]',
  },
  lg: {
    markHeight: 'h-12 sm:h-14',
    markWidth: 'w-auto',
    gap: 'gap-3.5',
    titleSize: 'text-xl sm:text-2xl',
    taglineSize: 'text-[10px]',
  },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'compact',
  size = 'md',
  context = 'general',
  showTagline,
  className = '',
  alt = 'CAMPUSLAB',
}) => {
  // Determine if tagline should be shown:
  // - If explicitly specified via prop, honor it
  // - Otherwise show if variant is 'full' OR context is 'auth' | 'footer'
  const displayTagline =
    showTagline !== undefined
      ? showTagline
      : variant === 'full' || context === 'auth' || context === 'footer';

  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const showMark = variant !== 'wordmark';
  const showText = variant !== 'mark';

  return (
    <div
      className={`inline-flex items-center ${cfg.gap} select-none group cursor-pointer transition-all duration-200 hover:brightness-110 ${className}`}
      aria-label="CAMPUSLAB Home"
    >
      {showMark && (
        <div className="relative flex-shrink-0 flex items-center justify-center brand-logo-symbol">
          <img
            src="/brand/campuslab-mark.png"
            srcSet="/brand/campuslab-mark@2x.png 2x"
            alt={alt}
            className={`${cfg.markHeight} ${cfg.markWidth} object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
            loading="eager"
            decoding="async"
          />
        </div>
      )}

      {showText && (
        <div className="flex flex-col text-left justify-center brand-logo-wordmark">
          <span
            className={`font-sans font-bold tracking-[0.18em] text-[#F5F5F5] group-hover:text-white transition-colors uppercase leading-none ${cfg.titleSize}`}
          >
            CAMPUSLAB
          </span>
          {displayTagline && (
            <span
              className={`font-sans font-semibold tracking-[0.25em] text-[#888888] group-hover:text-[#AAAAAA] uppercase mt-1 transition-colors leading-none ${cfg.taglineSize}`}
            >
              New Generation
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;

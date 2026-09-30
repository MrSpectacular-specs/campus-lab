import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  badge?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  badge,
  className = '',
}) => {
  const isCentered = align === 'center';

  return (
    <div
      className={`mb-10 sm:mb-14 md:mb-16 ${
        isCentered ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'
      } ${className}`}
    >
      <div
        className={`flex items-center gap-3 mb-3.5 ${
          isCentered ? 'justify-center' : 'justify-start'
        }`}
      >
        {eyebrow && (
          <span className="font-mono text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] text-brand-teal">
            {eyebrow}
          </span>
        )}
        {badge && <div>{badge}</div>}
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-[-0.03em] text-text-primary leading-[1.12]">
        {title}
      </h2>

      {description && (
        <div className="mt-4 text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed font-normal">
          {description}
        </div>
      )}
    </div>
  );
};

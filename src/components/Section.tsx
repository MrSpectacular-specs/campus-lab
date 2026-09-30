import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article';
  containerClassName?: string;
  isFullWidth?: boolean;
  divider?: 'none' | 'top' | 'bottom' | 'both';
  background?: 'transparent' | 'base' | 'elevated' | 'subtle';
}

export const Section: React.FC<SectionProps> = ({
  as: Component = 'section',
  children,
  className = '',
  containerClassName = '',
  isFullWidth = false,
  divider = 'none',
  background = 'transparent',
  ...props
}) => {
  const dividerClasses = {
    none: '',
    top: 'border-hairline-t',
    bottom: 'border-hairline-b',
    both: 'border-hairline-t border-hairline-b',
  }[divider];

  const bgClasses = {
    transparent: 'bg-transparent',
    base: 'bg-[#050505]',
    elevated: 'bg-[#0D0D0D]/60 backdrop-blur-sm',
    subtle: 'bg-[#111111]/40',
  }[background];

  return (
    <Component
      className={`relative py-20 sm:py-24 md:py-32 overflow-hidden ${bgClasses} ${dividerClasses} ${className}`}
      {...props}
    >
      {isFullWidth ? (
        children
      ) : (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${containerClassName}`}>
          {children}
        </div>
      )}
    </Component>
  );
};

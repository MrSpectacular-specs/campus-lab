import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'subtle' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  interactive = false,
  header,
  footer,
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6 sm:p-7',
    lg: 'p-8 sm:p-10',
  }[padding];

  const variantClasses = {
    glass:
      'bg-[#0D0D0D]/75 backdrop-blur-md border border-border-default shadow-[0_4px_20px_-2px_rgba(0,0,0,0.6)] specular-highlight',
    solid:
      'bg-[#0D0D0D] border border-border-default shadow-[0_4px_20px_-2px_rgba(0,0,0,0.6)] specular-highlight',
    subtle:
      'bg-[#111111]/60 border border-border-muted',
    outline:
      'bg-transparent border border-border-default',
  }[variant];

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-200 ease-smooth hover:border-border-hover hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.8)] hover:-translate-y-[1.5px]'
    : '';

  return (
    <div
      className={`rounded-xl relative overflow-hidden flex flex-col justify-between ${variantClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {header && (
        <div className="border-b border-border-muted px-6 py-4 flex items-center justify-between">
          {header}
        </div>
      )}

      <div className={`flex-1 ${paddingClasses}`}>
        {children}
      </div>

      {footer && (
        <div className="border-t border-border-muted px-6 py-3.5 bg-surface-base/30 text-xs text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
};

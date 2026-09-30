import React from 'react';

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-lg tracking-tight',
    md: 'text-sm px-4 py-2 gap-2 rounded-lg font-medium tracking-tight',
    lg: 'text-sm sm:text-base px-5.5 py-2.5 gap-2.5 rounded-xl font-medium tracking-tight',
  }[size];

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium text-text-primary bg-[#0D0D0D]/80 hover:bg-[#161616] border border-border-default hover:border-border-hover active:scale-[0.98] shadow-subtle hover:shadow-card specular-highlight transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${sizeClasses} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0 text-text-muted">{icon}</span>}
    </button>
  );
};

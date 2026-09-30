import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-lg tracking-tight',
    md: 'text-sm px-4.5 py-2 gap-2 rounded-lg font-medium tracking-tight',
    lg: 'text-sm sm:text-base px-5.5 py-2.5 gap-2.5 rounded-xl font-medium tracking-tight',
  }[size];

  const variantClasses = {
    // Primary: Chalk white surface with deep obsidian text and subtle rim lighting
    primary:
      'bg-[#F5F5F5] text-[#050505] font-semibold hover:bg-white active:scale-[0.98] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-200 ease-smooth',
    // Accent: Precision Teal, strictly controlled
    accent:
      'bg-brand-teal text-[#050505] font-semibold hover:bg-brand-teal-light active:scale-[0.98] border border-brand-teal/30 shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 ease-smooth',
    // Outline: Engineered hairline border with smoked hover fill
    outline:
      'bg-transparent text-text-primary border border-border-default hover:border-border-hover hover:bg-surface-soft active:scale-[0.98] transition-all duration-200 ease-smooth',
    // Ghost: Quiet minimal trigger
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-soft/60 active:scale-[0.98] border border-transparent transition-all duration-200 ease-smooth',
  }[variant];
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

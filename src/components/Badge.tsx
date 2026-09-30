import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'teal' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1.5 rounded-md font-mono tracking-wider',
    md: 'text-[11px] px-3 py-1 gap-2 rounded-md font-mono tracking-wider',
  }[size];

  const variantClasses = {
    default:
      'bg-[#111111] text-text-secondary border border-border-default',
    teal:
      'bg-brand-teal-bg text-brand-teal-light border border-brand-teal-border',
    indigo:
      'bg-[#161616] text-text-primary border border-border-default',
    amber:
      'bg-brand-amber-bg text-brand-amber-light border border-brand-amber-border',
    emerald:
      'bg-brand-teal-bg text-brand-teal-light border border-brand-teal-border',
    rose:
      'bg-brand-rose-bg text-brand-rose-light border border-brand-rose-border',
    outline:
      'bg-transparent text-text-secondary border border-border-default',
  }[variant];

  const dotColorClasses = {
    default: 'bg-text-muted',
    teal: 'bg-brand-teal-light',
    indigo: 'bg-text-primary',
    amber: 'bg-brand-amber-light',
    emerald: 'bg-brand-teal-light',
    rose: 'bg-brand-rose-light',
    outline: 'bg-text-secondary',
  }[variant];
  return (
    <span
      className={`inline-flex items-center font-medium tracking-wide uppercase select-none transition-colors duration-150 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClasses} flex-shrink-0`} />}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

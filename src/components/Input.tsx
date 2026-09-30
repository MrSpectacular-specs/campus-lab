import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-mono uppercase tracking-wider text-text-secondary select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 pointer-events-none text-text-muted flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#0D0D0D]/80 border ${
            error
              ? 'border-brand-rose/60 focus:border-brand-rose'
              : 'border-border-default focus:border-border-hover'
          } rounded-lg text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-200 ease-smooth focus:outline-none focus:ring-1 focus:ring-white/10 ${
            icon ? 'pl-10 pr-4' : 'px-3.5'
          } py-2.5 ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="text-xs text-brand-rose-light">{error}</span>
      ) : hint ? (
        <span className="text-xs text-text-muted">{hint}</span>
      ) : null}
    </div>
  );
};

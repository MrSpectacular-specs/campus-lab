import React from 'react';
import { Check } from 'lucide-react';

export interface WorkflowStepProps {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  deliverable?: string;
  icon?: React.ReactNode;
  state?: 'upcoming' | 'active' | 'completed';
  onClick?: () => void;
  className?: string;
}

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  step,
  title,
  subtitle,
  description,
  deliverable,
  icon,
  state = 'upcoming',
  onClick,
  className = '',
}) => {
  const isCompleted = state === 'completed';
  const isActive = state === 'active';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 sm:p-7 border relative transition-all duration-200 ease-smooth flex flex-col justify-between ${
        isActive
          ? 'bg-surface-elevated border-brand-teal/40 shadow-card-hover'
          : isCompleted
          ? 'bg-surface-card border-border-default/60 opacity-90'
          : 'bg-surface-card/60 border-border-muted hover:border-border-default'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div>
        {/* Step Index and State Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                isActive
                  ? 'bg-brand-teal text-surface-base'
                  : isCompleted
                  ? 'bg-brand-emerald-bg text-brand-emerald-light border border-brand-emerald-border'
                  : 'bg-surface-subtle text-text-muted border border-border-muted'
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5 inline mr-1" /> : null}
              PHASE {step}
            </span>
          </div>

          {icon && (
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isActive
                  ? 'bg-brand-teal-bg text-brand-teal-light border-brand-teal-border'
                  : 'bg-surface-subtle text-text-muted border-border-muted'
              }`}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-xs font-medium text-brand-teal-light mb-3">
          {subtitle}
        </p>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      {/* Deliverable Micro-Tag */}
      {deliverable && (
        <div className="mt-6 pt-3.5 border-t border-border-muted flex items-center justify-between text-[11px] font-mono">
          <span className="text-text-muted">DELIVERABLE</span>
          <span className="text-text-primary font-semibold truncate max-w-[200px]">
            {deliverable}
          </span>
        </div>
      )}
    </div>
  );
};

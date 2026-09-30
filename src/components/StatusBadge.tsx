import React from 'react';

export type OperationalStatus = 
  | 'active'
  | 'in-review'
  | 'verified'
  | 'pending'
  | 'draft'
  | 'archived'
  | 'calibrated';

export interface StatusBadgeProps {
  status: OperationalStatus;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  OperationalStatus,
  { defaultLabel: string; dotClass: string; containerClass: string }
> = {
  active: {
    defaultLabel: 'Live / Operational',
    dotClass: 'bg-brand-teal animate-pulse',
    containerClass:
      'bg-brand-teal-bg text-brand-teal-light border-brand-teal-border',
  },
  'in-review': {
    defaultLabel: 'Milestone Review',
    dotClass: 'bg-brand-amber-light',
    containerClass:
      'bg-brand-amber-bg text-brand-amber-light border-brand-amber-border',
  },
  verified: {
    defaultLabel: 'Rubric Verified',
    dotClass: 'bg-brand-teal-light',
    containerClass:
      'bg-brand-teal-bg text-brand-teal-light border-brand-teal-border',
  },
  pending: {
    defaultLabel: 'Pending Mentor',
    dotClass: 'bg-text-secondary',
    containerClass:
      'bg-[#161616] text-text-secondary border-border-default',
  },
  draft: {
    defaultLabel: 'Draft Cohort',
    dotClass: 'bg-text-muted',
    containerClass:
      'bg-[#111111] text-text-muted border-border-default',
  },
  archived: {
    defaultLabel: 'Archived',
    dotClass: 'bg-text-faint',
    containerClass:
      'bg-[#080808] text-text-muted border-border-muted',
  },
  calibrated: {
    defaultLabel: 'Calibrated',
    dotClass: 'bg-brand-teal-light',
    containerClass:
      'bg-brand-teal-bg text-brand-teal-light border-brand-teal-border',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  className = '',
}) => {
  const config = statusConfig[status] || statusConfig.active;
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = {
    sm: 'text-[10px] sm:text-[11px] px-2.5 py-1 gap-1.5 rounded-full font-mono',
    md: 'text-xs px-3 py-1.5 gap-2 rounded-full font-mono',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium tracking-wide uppercase select-none border ${config.containerClass} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
      <span className="truncate">{displayLabel}</span>
    </span>
  );
};
